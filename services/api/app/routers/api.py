from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import CurrentUser, get_accessible_elder_ids, get_current_user, require_elder_access
from app.models import (
    AlertEvent,
    CareTask,
    CommunityActivity,
    CompanionState,
    Device,
    Elder,
    ElderBinding,
    HealthSnapshot,
    MedicinePlan,
    NotificationRule,
    User,
    WorkOrder,
)
from app.schemas.api import (
    AlertOut,
    AlertUpdate,
    CompanionStateOut,
    CompanionStateUpdate,
    DeviceOut,
    ElderOut,
    HealthMetricOut,
    MedicineOut,
    MedicineStatusUpdate,
    MetricHistoryPoint,
    PrivacyPermissionOut,
    PrivacyPermissionsUpdate,
    ServiceSummaryOut,
    WorkOrderOut,
    WorkOrderUpdate,
)
from app.services.alert_service import alert_to_dict
from app.services.elder_helpers import elder_to_out

router = APIRouter(prefix="/api/v1", tags=["api"])


@router.get("/elders", response_model=list[ElderOut])
def list_elders(
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[ElderOut]:
    q = db.query(Elder).order_by(Elder.id)
    allowed = get_accessible_elder_ids(current, db)
    if allowed is not None:
        if not allowed:
            return []
        q = q.filter(Elder.id.in_(allowed))
    return [elder_to_out(e, db) for e in q.all()]


@router.get("/elders/{elder_id}", response_model=ElderOut)
def get_elder(
    elder_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> ElderOut:
    elder = require_elder_access(elder_id, current, db)
    return elder_to_out(elder, db)


@router.get("/elders/{elder_id}/metrics/latest", response_model=list[HealthMetricOut])
def get_latest_metrics(
    elder_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[HealthMetricOut]:
    require_elder_access(elder_id, current, db)
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
    current: CurrentUser = Depends(get_current_user),
) -> list[dict]:
    q = db.query(AlertEvent).order_by(AlertEvent.created_at.desc())
    allowed = get_accessible_elder_ids(current, db)
    if allowed is not None:
        if not allowed:
            return []
        q = q.filter(AlertEvent.elder_id.in_(allowed))
    if elder_id:
        require_elder_access(elder_id, current, db)
        q = q.filter(AlertEvent.elder_id == elder_id)
    alerts = q.limit(50).all()
    return [alert_to_dict(a) for a in alerts]


@router.get("/alerts/{alert_id}", response_model=AlertOut)
def get_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> dict:
    alert = db.get(AlertEvent, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    require_elder_access(alert.elder_id, current, db)
    return alert_to_dict(alert, include_recommended=True)


@router.patch("/alerts/{alert_id}", response_model=AlertOut)
def update_alert(
    alert_id: str,
    body: AlertUpdate,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> dict:
    alert = db.get(AlertEvent, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    require_elder_access(alert.elder_id, current, db)
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
    current: CurrentUser = Depends(get_current_user),
) -> list[WorkOrder]:
    q = db.query(WorkOrder).order_by(WorkOrder.created_at.desc())
    if current.role == "community" and current.community_site_id:
        site_elder_ids = [
            e.id
            for e in db.query(Elder).filter(Elder.community_site_id == current.community_site_id).all()
        ]
        q = q.filter((WorkOrder.elder_id.in_(site_elder_ids)) | (WorkOrder.elder_id.is_(None)))
    elif current.role == "family":
        elder_ids = get_accessible_elder_ids(current, db) or []
        q = q.filter(WorkOrder.elder_id.in_(elder_ids))
    if tab:
        q = q.filter(WorkOrder.tab == tab)
    return q.limit(100).all()


@router.patch("/work-orders/{work_order_id}", response_model=WorkOrderOut)
def update_work_order(
    work_order_id: str,
    body: WorkOrderUpdate,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> WorkOrder:
    wo = db.get(WorkOrder, work_order_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    if wo.elder_id:
        require_elder_access(wo.elder_id, current, db)
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
def get_work_order(
    work_order_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> WorkOrder:
    wo = db.get(WorkOrder, work_order_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    if wo.elder_id:
        require_elder_access(wo.elder_id, current, db)
    return wo


@router.get("/elders/{elder_id}/devices", response_model=list[DeviceOut])
def list_devices(
    elder_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[Device]:
    require_elder_access(elder_id, current, db)
    return db.query(Device).filter(Device.elder_id == elder_id).all()


@router.get("/elders/{elder_id}/medicines", response_model=list[MedicineOut])
def list_medicines(
    elder_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[MedicineOut]:
    require_elder_access(elder_id, current, db)
    rows = db.query(MedicinePlan).filter(MedicinePlan.elder_id == elder_id).all()
    return [
        MedicineOut(id=r.id, name=r.name, dose=r.dose, schedule=r.schedule, status=r.status)
        for r in rows
    ]


@router.patch("/elders/{elder_id}/medicines/{medicine_id}", response_model=MedicineOut)
def update_medicine(
    elder_id: str,
    medicine_id: str,
    body: MedicineStatusUpdate,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> MedicineOut:
    require_elder_access(elder_id, current, db)
    med = db.get(MedicinePlan, medicine_id)
    if not med or med.elder_id != elder_id:
        raise HTTPException(status_code=404, detail="Medicine not found")
    med.status = body.status
    db.commit()
    db.refresh(med)
    return MedicineOut(id=med.id, name=med.name, dose=med.dose, schedule=med.schedule, status=med.status)


@router.get("/elders/{elder_id}/metrics/{metric_key}/history", response_model=list[MetricHistoryPoint])
def metric_history(
    elder_id: str,
    metric_key: str,
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[MetricHistoryPoint]:
    from datetime import datetime, timedelta, timezone

    require_elder_access(elder_id, current, db)
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
def service_summary(
    elder_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> ServiceSummaryOut:
    require_elder_access(elder_id, current, db)
    metrics = get_latest_metrics(elder_id, db, current)
    devices = db.query(Device).filter(Device.elder_id == elder_id).all()
    abnormal = sum(1 for m in metrics if m.status == "warning")
    online_count = sum(1 for d in devices if d.online)
    companion_row = db.get(CompanionState, elder_id)
    activity = (
        db.query(CommunityActivity)
        .order_by(CommunityActivity.id.asc())
        .first()
    )
    return ServiceSummaryOut(
        abnormal_metric_count=abnormal,
        online_device_count=online_count,
        total_device_count=len(devices),
        recent_activity_label=f"{activity.title} · {activity.time_label}" if activity else "暂无活动",
        companion_mood=companion_row.mood if companion_row else "平稳",
        companion_score=companion_row.companion_score if companion_row else 78,
    )


@router.get("/elders/{elder_id}/companion-state", response_model=CompanionStateOut)
def get_companion_state(
    elder_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> CompanionStateOut:
    require_elder_access(elder_id, current, db)
    row = db.get(CompanionState, elder_id)
    if not row:
        return CompanionStateOut()
    return CompanionStateOut(mood=row.mood, companion_score=row.companion_score, speak_hint=row.speak_hint)


@router.patch("/elders/{elder_id}/companion-state", response_model=CompanionStateOut)
def patch_companion_state(
    elder_id: str,
    body: CompanionStateUpdate,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> CompanionStateOut:
    require_elder_access(elder_id, current, db)
    row = db.get(CompanionState, elder_id)
    if not row:
        row = CompanionState(elder_id=elder_id)
        db.add(row)
    if body.mood is not None:
        row.mood = body.mood
    if body.companion_score is not None:
        row.companion_score = body.companion_score
    db.commit()
    db.refresh(row)
    return CompanionStateOut(mood=row.mood, companion_score=row.companion_score, speak_hint=row.speak_hint)


PRIVACY_DEFAULTS = [
    {"key": "bedroomMonitor", "label": "卧室安全监测", "description": "仅识别跌倒、异常静止等安全状态", "enabled": True},
    {"key": "familyReport", "label": "家人查看健康报告", "description": "允许家人查看心率、睡眠、血压等趋势", "enabled": True},
    {"key": "sosLocation", "label": "SOS 时共享位置", "description": "仅在紧急求助时发送位置", "enabled": True},
]


@router.get("/elders/{elder_id}/privacy-permissions", response_model=list[PrivacyPermissionOut])
def get_privacy_permissions(
    elder_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[PrivacyPermissionOut]:
    elder = require_elder_access(elder_id, current, db)
    user_id = elder.user_id or "user-elder-001"
    rows = db.query(NotificationRule).filter(NotificationRule.user_id == user_id).all()
    by_key = {r.key: r for r in rows}
    result: list[PrivacyPermissionOut] = []
    for item in PRIVACY_DEFAULTS:
        row = by_key.get(item["key"])
        result.append(
            PrivacyPermissionOut(
                key=item["key"],
                label=row.label if row else item["label"],
                description=row.description if row else item["description"],
                enabled=row.enabled if row else item["enabled"],
            )
        )
    return result


@router.patch("/elders/{elder_id}/privacy-permissions", response_model=list[PrivacyPermissionOut])
def patch_privacy_permissions(
    elder_id: str,
    body: PrivacyPermissionsUpdate,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[PrivacyPermissionOut]:
    elder = require_elder_access(elder_id, current, db)
    user_id = elder.user_id or "user-elder-001"
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Elder user not found")
    by_key = {p.key: p for p in body.permissions}
    rows = db.query(NotificationRule).filter(NotificationRule.user_id == user.id).all()
    existing_keys = {r.key for r in rows}
    for row in rows:
        if row.key in by_key:
            row.enabled = by_key[row.key].enabled
    for item in PRIVACY_DEFAULTS:
        if item["key"] not in existing_keys and item["key"] in by_key:
            db.add(
                NotificationRule(
                    user_id=user.id,
                    key=item["key"],
                    label=item["label"],
                    description=item["description"],
                    enabled=by_key[item["key"]].enabled,
                )
            )
    db.commit()
    return get_privacy_permissions(elder_id, db, current)
