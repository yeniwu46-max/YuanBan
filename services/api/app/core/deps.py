from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import Elder, ElderBinding, User


class CurrentUser:
    def __init__(self, user: User):
        self.user = user

    @property
    def id(self) -> str:
        return self.user.id

    @property
    def role(self) -> str:
        return self.user.role

    @property
    def community_site_id(self) -> str | None:
        return self.user.community_site_id


def _user_from_headers(
    x_role: str | None,
    x_user_id: str | None,
    db: Session,
) -> User | None:
    if not x_role or not x_user_id:
        return None
    user = db.get(User, x_user_id)
    if user and user.role == x_role:
        return user
    return User(id=x_user_id, phone="", name=x_user_id, role=x_role)


def get_current_user(
    db: Session = Depends(get_db),
    authorization: Annotated[str | None, Header()] = None,
    x_role: Annotated[str | None, Header()] = None,
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
) -> CurrentUser:
    settings = get_settings()

    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        try:
            payload = decode_access_token(token)
            user = db.get(User, payload["sub"])
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            return CurrentUser(user)
        except jwt.InvalidTokenError as exc:
            raise HTTPException(status_code=401, detail="Invalid token") from exc

    if settings.auth_dev_bypass:
        header_user = _user_from_headers(x_role, x_user_id, db)
        if header_user:
            if header_user.phone:
                return CurrentUser(header_user)
            persisted = db.get(User, header_user.id)
            if persisted:
                return CurrentUser(persisted)

    raise HTTPException(status_code=401, detail="Not authenticated")


def get_optional_user(
    db: Session = Depends(get_db),
    authorization: Annotated[str | None, Header()] = None,
    x_role: Annotated[str | None, Header()] = None,
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
) -> CurrentUser | None:
    try:
        return get_current_user(db, authorization, x_role, x_user_id)
    except HTTPException:
        return None


def require_roles(*roles: str):
    def _dep(current: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current.role not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return current

    return _dep


def get_accessible_elder_ids(current: CurrentUser, db: Session) -> list[str] | None:
    """Return elder ids the user may access, or None for unrestricted (dev)."""
    if current.role == "elder":
        elder = db.query(Elder).filter(Elder.user_id == current.id).first()
        return [elder.id] if elder else []
    if current.role == "family":
        return [
            b.elder_id
            for b in db.query(ElderBinding).filter(ElderBinding.family_user_id == current.id).all()
        ]
    if current.role == "community":
        if current.community_site_id:
            return [
                e.id
                for e in db.query(Elder).filter(Elder.community_site_id == current.community_site_id).all()
            ]
        return [e.id for e in db.query(Elder).all()]
    return []


def require_elder_access(elder_id: str, current: CurrentUser, db: Session) -> Elder:
    elder = db.get(Elder, elder_id)
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")
    allowed = get_accessible_elder_ids(current, db)
    if allowed is not None and elder_id not in allowed:
        raise HTTPException(status_code=403, detail="No access to this elder")
    return elder
