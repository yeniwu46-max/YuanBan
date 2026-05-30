from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import CurrentUser
from app.core.security import decode_access_token
from app.models import User
from app.services.event_bus import subscribe_events

router = APIRouter(prefix="/api/v1/events", tags=["events"])


def _user_from_token(db: Session, token: str) -> CurrentUser:
    try:
        payload = decode_access_token(token)
        user = db.get(User, payload["sub"])
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return CurrentUser(user)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


@router.get("/stream")
async def event_stream(
    db: Session = Depends(get_db),
    token: str = Query(..., description="JWT access token"),
):
    _user_from_token(db, token)

    async def generate():
        async for chunk in subscribe_events():
            yield chunk

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
