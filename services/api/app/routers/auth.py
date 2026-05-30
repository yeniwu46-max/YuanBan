import secrets
import uuid
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import CurrentUser, get_current_user
from app.core.security import create_access_token
from app.models import Elder, ElderBinding, User
from app.services.elder_helpers import elder_to_out as _elder_out
from app.schemas.auth import BindElderIn, PhoneOtpIn, PhoneVerifyIn, TokenOut, UserOut, WechatLoginIn

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

_otp_store: dict[str, str] = {}


def _normalize_phone(phone: str) -> str:
    return phone.replace(" ", "").replace("-", "")


def _build_user_out(db: Session, user: User) -> UserOut:
    elder_id: str | None = None
    bound: list = []
    if user.role == "elder":
        elder = db.query(Elder).filter(Elder.user_id == user.id).first()
        if elder:
            elder_id = elder.id
            bound = [_elder_out(elder, db)]
    elif user.role == "family":
        elder_ids = [
            b.elder_id
            for b in db.query(ElderBinding).filter(ElderBinding.family_user_id == user.id).all()
        ]
        for eid in elder_ids:
            elder = db.get(Elder, eid)
            if elder:
                bound.append(_elder_out(elder, db))
    return UserOut(
        id=user.id,
        phone=user.phone,
        name=user.name,
        role=user.role,  # type: ignore[arg-type]
        avatar_url=user.avatar_url,
        community_site_id=user.community_site_id,
        elder_id=elder_id,
        bound_elders=bound,
    )


def _issue_token(db: Session, user: User) -> TokenOut:
    token = create_access_token(user.id, user.role)
    return TokenOut(access_token=token, user=_build_user_out(db, user))


def _find_or_create_phone_user(db: Session, phone: str, role: str, name: str | None = None) -> User:
    normalized = _normalize_phone(phone)
    user = db.query(User).filter(User.phone == normalized, User.role == role).first()
    if user:
        return user
    user_id = f"{role}-{uuid.uuid4().hex[:8]}"
    display = name or {"elder": "老人用户", "family": "家属用户", "community": "社区用户"}.get(role, "用户")
    user = User(id=user_id, phone=normalized, name=display, role=role)
    if role == "community":
        user.community_site_id = "site-001"
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


async def _wechat_code_to_openid(code: str) -> tuple[str, str | None]:
    settings = get_settings()
    if not settings.wechat_app_id or not settings.wechat_app_secret:
        return f"dev-openid-{code[:16]}", None
    url = "https://api.weixin.qq.com/sns/jscode2session"
    params = {
        "appid": settings.wechat_app_id,
        "secret": settings.wechat_app_secret,
        "js_code": code,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, params=params)
        data = resp.json()
    if "errcode" in data and data["errcode"] != 0:
        raise HTTPException(status_code=400, detail=data.get("errmsg", "WeChat login failed"))
    return data["openid"], data.get("session_key")


@router.post("/wechat/login", response_model=TokenOut)
async def wechat_login(body: WechatLoginIn, db: Session = Depends(get_db)) -> TokenOut:
    openid, _ = await _wechat_code_to_openid(body.code)
    user = db.query(User).filter(User.wechat_openid == openid, User.role == body.role).first()
    if not user:
        user = User(
            id=f"{body.role}-wx-{uuid.uuid4().hex[:8]}",
            phone=f"wx{openid[-8:]}",
            name={"elder": "微信老人", "family": "微信家属", "community": "微信社区"}.get(body.role, "微信用户"),
            role=body.role,
            wechat_openid=openid,
        )
        if body.role == "community":
            user.community_site_id = "site-001"
        db.add(user)
        db.commit()
        db.refresh(user)
    return _issue_token(db, user)


@router.post("/phone/otp")
def phone_otp(body: PhoneOtpIn) -> dict:
    settings = get_settings()
    phone = _normalize_phone(body.phone)
    code = settings.dev_otp_code or secrets.randbelow(900000) + 100000
    _otp_store[f"{phone}:{body.role}"] = str(code)
    return {"ok": True, "message": "验证码已发送（开发环境可使用 123456）"}


@router.post("/phone/verify", response_model=TokenOut)
def phone_verify(body: PhoneVerifyIn, db: Session = Depends(get_db)) -> TokenOut:
    phone = _normalize_phone(body.phone)
    key = f"{phone}:{body.role}"
    expected = _otp_store.get(key)
    settings = get_settings()
    if body.code != settings.dev_otp_code and body.code != expected:
        raise HTTPException(status_code=400, detail="验证码错误")
    _otp_store.pop(key, None)
    user = _find_or_create_phone_user(db, phone, body.role, body.name)
    return _issue_token(db, user)


@router.get("/me", response_model=UserOut)
def auth_me(current: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)) -> UserOut:
    return _build_user_out(db, current.user)


@router.post("/bind-elder", response_model=UserOut)
def bind_elder(
    body: BindElderIn,
    current: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    if current.role != "family":
        raise HTTPException(status_code=403, detail="Only family users can bind elders")
    elder = db.get(Elder, body.elder_id)
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")
    existing = (
        db.query(ElderBinding)
        .filter(ElderBinding.family_user_id == current.id, ElderBinding.elder_id == body.elder_id)
        .first()
    )
    if not existing:
        db.add(
            ElderBinding(
                elder_id=body.elder_id,
                family_user_id=current.id,
                relation=body.relation,
                is_primary=False,
            )
        )
        db.commit()
    return _build_user_out(db, current.user)
