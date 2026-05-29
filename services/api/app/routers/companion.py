from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models import AlertEvent, Elder, HealthSnapshot
from app.schemas.api import CompanionChatIn, CompanionChatOut
from app.services.companion_ai_service import CompanionAIService, CompanionContext

router = APIRouter(prefix="/api/v1/companion", tags=["companion"])


@router.post("/chat", response_model=CompanionChatOut)
def companion_chat(body: CompanionChatIn, db: Session = Depends(get_db)) -> CompanionChatOut:
    settings = get_settings()
    service = CompanionAIService(settings)
    context = build_context(db, body.elder_id)
    return service.chat(body, context)


def build_context(db: Session, elder_id: str) -> CompanionContext:
    elder = db.get(Elder, elder_id)
    metrics = (
        db.query(HealthSnapshot)
        .filter(HealthSnapshot.elder_id == elder_id)
        .order_by(HealthSnapshot.recorded_at.desc())
        .limit(8)
        .all()
    )
    seen: set[str] = set()
    metric_parts: list[str] = []
    for metric in metrics:
        if metric.metric_key in seen:
            continue
        seen.add(metric.metric_key)
        metric_parts.append(f"{metric.label}{metric.value}{metric.unit}，{metric.description or metric.status}")

    alerts = (
        db.query(AlertEvent)
        .filter(AlertEvent.elder_id == elder_id)
        .order_by(AlertEvent.created_at.desc())
        .limit(3)
        .all()
    )
    alert_parts = [f"{alert.title}（{alert.status_label}）" for alert in alerts]

    return CompanionContext(
        elder_name=elder.name if elder else "老人",
        elder_age=elder.age if elder else None,
        location_label=elder.location_label if elder else "",
        health_summary="；".join(metric_parts) if metric_parts else "暂无最新体征数据",
        recent_alerts="；".join(alert_parts) if alert_parts else "暂无近期告警",
    )
