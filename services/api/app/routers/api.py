from typing import Annotated
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import AlertEvent, Device, Elder, ElderBinding, HealthSnapshot, WorkOrder
from app.schemas.api import (
    AlertOut,
    AlertUpdate,
    CompanionStateOut,
    CompanionStateUpdate,
    DeviceOut,
    ElderOut,
    HealthMetricOut,
    MedicineOut,
    MetricHistoryPoint,
    ServiceSummaryOut,
    WorkOrderOut,
    WorkOrderUpdate,
)
from app.data.demo_content import COMPANION_STATE, MEDICINES
from app.services.alert_service import alert_to_dict

router = APIRouter(prefix="/api/v1", tags=["api"])


def _elder_out(elder: Elder, db: Session) -> ElderOut:
    devices = db.query(Device).filter(Device.elder_id == elder.id).all()
    online = any(d.online for d in devices) if devices else True
    unresolved = (
        db.query(AlertEvent)
        .filter(AlertEvent.elder_id == elder.id, AlertEvent.status != "resolved")
        .count()
    )
    return ElderOut(
        id=elder.id,
        name=elder.name,
        age=elder.age,
        location_label=elder.location_label,
        address=elder.address,
        community_site_id=elder.community_site_id,
        guard_score=max(60, 96 - unresolved * 8),
        device_count=len(devices),
        online_status="online" if online else "offline",
    )


def get_role(x_role: Annotated[str | None, Header()] = None) -> str | None:
    return x_role


def get_user_id(x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None) -> str | None:
    return x_user_id


@router.get("/elders", response_model=list[ElderOut])
def list_elders(
    db: Session = Depends(get_db),
    role: str | None = Depends(get_role),
    user_id: str | None = Depends(get_user_id),
) -> list[ElderOut]:
    q = db.query(Elder).order_by(Elder.id)
    if role == "family" and user_id:
        elder_ids = [
            b.elder_id
            for b in db.query(ElderBinding).filter(ElderBinding.family_user_id == user_id).all()
        ]
        if elder_ids:
            q = q.filter(Elder.id.in_(elder_ids))
    return [_elder_out(e, db) for e in q.all()]


@router.get("/elders/{elder_id}", response_model=ElderOut)
def get_elder(elder_id: str, db: Session = Depends(get_db)) -> ElderOut:
    elder = db.get(Elder, elder_id)
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")
    return _elder_out(elder, db)


@router.get("/elders/{elder_id}/metrics/latest", response_model=list[HealthMetricOut])
def get_latest_metrics(elder_id: str, db: Session = Depends(get_db)) -> list[HealthMetricOut]:
    rows = (
        db.query(HealthSnapshot)
        .filter(HealthSnapshot.elder_id == elder_id)
        .order_by(HealthSnapshot.recorded_at.desc())
        .all()
    )
    seen: set[str] = set()
    result: list[HealthMetricOut] = []
    for row in rows:
        if row.metric_key in seen:
            continue
        seen.add(row.metric_key)
        result.append(
            HealthMetricOut(
                key=row.metric_key,
                label=row.label,
                value=row.value,
                unit=row.unit,
                status=row.status,
                description=row.description,
            )
        )
    return result


@router.get("/alerts", response_model=list[AlertOut])
def list_alerts(
    db: Session = Depends(get_db),
    elder_id: str | None = Query(None),
    role: str | None = Depends(get_role),
) -> list[dict]:
    q = db.query(AlertEvent).order_by(AlertEvent.created_at.desc())
    if elder_id:
        q = q.filter(AlertEvent.elder_id == elder_id)
    alerts = q.limit(50).all()
  # role filter placeholder for future binding checks
    _ = role
    return [alert_to_dict(a) for a in alerts]


@router.patch("/alerts/{alert_id}", response_model=AlertOut)
def update_alert(alert_id: str, body: AlertUpdate, db: Session = Depends(get_db)) -> dict:
    alert = db.get(AlertEvent, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = body.status
    if body.status_label:
        alert.status_label = body.status_label
    else:
        labels = {
            "viewed": "已查看",
            "processing": "处理中",
            "resolved": "已处理",
            "pending": "待确认",
        }
        alert.status_label = labels.get(body.status, alert.status_label)
    if body.status == "resolved":
        alert.tag = "已处理"
        alert.tag_tone = "normal"
    db.commit()
    db.refresh(alert)

    if body.status == "resolved":
        for wo in db.query(WorkOrder).filter(WorkOrder.alert_id == alert_id).all():
            wo.status = "resolved"
            wo.tag = "已完成"
            wo.tag_tone = "green"
            wo.tab = "done"
        db.commit()

    return alert_to_dict(alert)


@router.get("/work-orders", response_model=list[WorkOrderOut])
def list_work_orders(
    db: Session = Depends(get_db),
    tab: str | None = Query(None),
) -> list[WorkOrder]:
    q = db.query(WorkOrder).order_by(WorkOrder.created_at.desc())
    if tab:
        q = q.filter(WorkOrder.tab == tab)
    return q.limit(100).all()


@router.patch("/work-orders/{work_order_id}", response_model=WorkOrderOut)
def update_work_order(work_order_id: str, body: WorkOrderUpdate, db: Session = Depends(get_db)) -> WorkOrder:
    wo = db.get(WorkOrder, work_order_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    wo.status = body.status
    if body.tag:
        wo.tag = body.tag
    if body.tag_tone:
        wo.tag_tone = body.tag_tone
    if body.status == "resolved":
        wo.tab = "done"
        if wo.alert_id:
            alert = db.get(AlertEvent, wo.alert_id)
            if alert:
                alert.status = "resolved"
                alert.status_label = "已处理"
                alert.tag = "已处理"
                alert.tag_tone = "normal"
    db.commit()
    db.refresh(wo)
    return wo


@router.get("/work-orders/{work_order_id}", response_model=WorkOrderOut)
def get_work_order(work_order_id: str, db: Session = Depends(get_db)) -> WorkOrder:
    wo = db.get(WorkOrder, work_order_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    return wo


@router.get("/elders/{elder_id}/devices", response_model=list[DeviceOut])
def list_devices(elder_id: str, db: Session = Depends(get_db)) -> list[Device]:
    return db.query(Device).filter(Device.elder_id == elder_id).all()


@router.get("/elders/{elder_id}/medicines", response_model=list[MedicineOut])
def list_medicines(elder_id: str) -> list[MedicineOut]:
    _ = elder_id
    return [MedicineOut(**m) for m in MEDICINES]


@router.get("/elders/{elder_id}/metrics/{metric_key}/history", response_model=list[MetricHistoryPoint])
def metric_history(
    elder_id: str,
    metric_key: str,
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
) -> list[MetricHistoryPoint]:
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        db.query(HealthSnapshot)
        .filter(
            HealthSnapshot.elder_id == elder_id,
            HealthSnapshot.metric_key == metric_key,
            HealthSnapshot.recorded_at >= since,
        )
        .order_by(HealthSnapshot.recorded_at.asc())
        .all()
    )
    if not rows:
        latest = (
            db.query(HealthSnapshot)
            .filter(HealthSnapshot.elder_id == elder_id, HealthSnapshot.metric_key == metric_key)
            .order_by(HealthSnapshot.recorded_at.desc())
            .first()
        )
        if latest:
            rows = [latest]
    return [
        MetricHistoryPoint(recorded_at=r.recorded_at, value=r.value, status=r.status)
        for r in rows
    ]


@router.get("/elders/{elder_id}/service-summary", response_model=ServiceSummaryOut)
def service_summary(elder_id: str, db: Session = Depends(get_db)) -> ServiceSummaryOut:
    metrics = get_latest_metrics(elder_id, db)
    devices = db.query(Device).filter(Device.elder_id == elder_id).all()
    abnormal = sum(1 for m in metrics if m.status == "warning")
    online_count = sum(1 for d in devices if d.online)
    companion = COMPANION_STATE.get(elder_id, {"mood": "平稳", "companion_score": 78})
    return ServiceSummaryOut(
        abnormal_metric_count=abnormal,
        online_device_count=online_count,
        total_device_count=len(devices),
        recent_activity_label="舒缓太极课 · 今天 15:00",
        companion_mood=companion.get("mood", "平稳"),
        companion_score=companion.get("companion_score", 78),
    )


@router.get("/elders/{elder_id}/companion-state", response_model=CompanionStateOut)
def get_companion_state(elder_id: str) -> CompanionStateOut:
    data = COMPANION_STATE.get(elder_id, {"mood": "平稳", "companion_score": 78, "speak_hint": "今天记得多喝水"})
    return CompanionStateOut(**data)


@router.patch("/elders/{elder_id}/companion-state", response_model=CompanionStateOut)
def patch_companion_state(elder_id: str, body: CompanionStateUpdate) -> CompanionStateOut:
    current = COMPANION_STATE.setdefault(
        elder_id, {"mood": "平稳", "companion_score": 78, "speak_hint": "今天记得多喝水"}
    )
    if body.mood is not None:
        current["mood"] = body.mood
    if body.companion_score is not None:
        current["companion_score"] = body.companion_score
    return CompanionStateOut(**current)
