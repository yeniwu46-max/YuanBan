from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import CurrentUser, get_current_user, require_elder_access
from app.models import AlertEvent, CommunityActivity, CommunitySite, Device, Elder, HealthSnapshot, WorkOrder
from app.schemas.api import (
    ActivityCheckInOut,
    CommunityActivityOut,
    CommunityDashboardOut,
    HealthMetricOut,
    ServiceProfileOut,
    WorkOrderDetailOut,
    WorkOrderOut,
)
from app.services.alert_service import alert_to_dict, format_time_label

router = APIRouter(prefix="/api/v1/community", tags=["community"])


def _latest_metrics(db: Session, elder_id: str) -> list[HealthMetricOut]:
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


def _site_filter(db: Session, current: CurrentUser):
    if current.community_site_id:
        return current.community_site_id
    site = db.query(CommunitySite).first()
    return site.id if site else None


@router.get("/dashboard", response_model=CommunityDashboardOut)
def community_dashboard(
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> CommunityDashboardOut:
    site_id = _site_filter(db, current)
    site = db.get(CommunitySite, site_id) if site_id else db.query(CommunitySite).first()
    elder_q = db.query(Elder)
    if site_id:
        elder_q = elder_q.filter(Elder.community_site_id == site_id)
    site_elder_ids = [e.id for e in elder_q.all()]
    orders_q = db.query(WorkOrder)
    if site_elder_ids:
        orders_q = orders_q.filter(
            (WorkOrder.elder_id.in_(site_elder_ids)) | (WorkOrder.elder_id.is_(None))
        )
    orders = orders_q.all()
    pending = [o for o in orders if o.status != "resolved"]
    urgent = [o for o in pending if o.tab == "urgent"]
    visit = [o for o in pending if o.tab == "visit"]
    done = [o for o in orders if o.status == "resolved" or o.tab == "done"]
    urgent_items = [
        {
            "id": o.id,
            "icon": o.icon,
            "iconTone": "red" if o.tag_tone == "red" else "warm",
            "title": o.title,
            "description": o.description,
            "tag": o.tag,
            "tagTone": o.tag_tone,
        }
        for o in urgent[:5]
    ]
    focus_elders = []
    for elder in elder_q.limit(3).all():
        alerts = db.query(AlertEvent).filter(AlertEvent.elder_id == elder.id, AlertEvent.status != "resolved").count()
        focus_elders.append(
            {
                "elderId": elder.id,
                "icon": "👵",
                "iconTone": "warm" if alerts else "normal",
                "name": elder.name,
                "description": f"{elder.location_label} · {alerts} 条待处理" if alerts else f"{elder.location_label} · 状态平稳",
            }
        )
    act_q = db.query(CommunityActivity)
    if site_id:
        act_q = act_q.filter(CommunityActivity.site_id == site_id)
    first_activity = act_q.order_by(CommunityActivity.id.asc()).first()
    today_activity = None
    if first_activity:
        today_activity = {
            "id": first_activity.id,
            "title": first_activity.title,
            "timeLabel": first_activity.time_label,
            "location": first_activity.location,
            "enrolled": first_activity.enrolled,
            "pendingCheckIn": first_activity.pending_check_in,
            "statusLabel": first_activity.status_label,
            "statusTone": first_activity.status_tone,
        }
    activity_count = act_q.count()
    return CommunityDashboardOut(
        pending_count=len(pending),
        urgent_count=len(urgent),
        visit_count=len(visit),
        activity_count=activity_count,
        done_count=len(done),
        total_count=len(orders),
        device_online_rate=site.device_online_rate if site else 96,
        service_status_label=site.service_status_label if site else "服务响应正常",
        urgent_items=urgent_items,
        ops_metrics=[
            {"key": "online", "icon": "📡", "iconTone": "normal", "title": "设备在线率", "value": f"{site.device_online_rate if site else 96}%", "statusLabel": "稳定", "statusTone": "green"},
            {"key": "pending", "icon": "▤", "iconTone": "warm", "title": "待处理工单", "value": str(len(pending)), "statusLabel": "需跟进", "statusTone": "warm"},
        ],
        today_activity=today_activity,
        focus_elders=focus_elders,
    )


@router.get("/activities", response_model=list[CommunityActivityOut])
def community_activities(
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[CommunityActivityOut]:
    site_id = _site_filter(db, current)
    q = db.query(CommunityActivity)
    if site_id:
        q = q.filter(CommunityActivity.site_id == site_id)
    return [
        CommunityActivityOut(
            id=a.id,
            title=a.title,
            time_label=a.time_label,
            location=a.location,
            enrolled=a.enrolled,
            pending_check_in=a.pending_check_in,
            status_label=a.status_label,
            status_tone=a.status_tone,
        )
        for a in q.all()
    ]


@router.get("/activities/{activity_id}/check-ins", response_model=list[ActivityCheckInOut])
def activity_check_ins(
    activity_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[ActivityCheckInOut]:
    activity = db.get(CommunityActivity, activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    pending = max(activity.pending_check_in, 0)
    checked = max(activity.enrolled - pending, 0)
    rows: list[ActivityCheckInOut] = []
    for idx in range(checked):
        rows.append(
            ActivityCheckInOut(
                id=f"{activity_id}-in-{idx + 1}",
                name=f"报名老人 {idx + 1}",
                time_label="已签到",
                status_label="已到",
                status_tone="green",
            )
        )
    for idx in range(pending):
        rows.append(
            ActivityCheckInOut(
                id=f"{activity_id}-pending-{idx + 1}",
                name=f"待签到 {idx + 1}",
                time_label=activity.time_label,
                status_label="待签到",
                status_tone="warm",
            )
        )
    return rows


@router.get("/service-profile", response_model=ServiceProfileOut)
def service_profile(
    elder_id: str = Query(...),
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> ServiceProfileOut:
    require_elder_access(elder_id, current, db)
    elder = db.get(Elder, elder_id)
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")
    metrics = _latest_metrics(db, elder_id)
    orders = (
        db.query(WorkOrder)
        .filter(WorkOrder.elder_id == elder_id)
        .order_by(WorkOrder.created_at.desc())
        .limit(5)
        .all()
    )
    risk = sum(1 for m in metrics if m.status == "warning")
    return ServiceProfileOut(
        elder_id=elder.id,
        name=elder.name,
        age=elder.age,
        address=elder.address,
        guard_score=max(60, 96 - risk * 10),
        health_summary="近期体征整体正常，建议保持电话回访。" if risk == 0 else "有指标需关注，建议安排回访。",
        recent_orders=[WorkOrderOut.model_validate(o) for o in orders],
        metrics=metrics,
    )


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


@router.get("/work-orders/{work_order_id}/detail", response_model=WorkOrderDetailOut)
def get_work_order_detail(
    work_order_id: str,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> WorkOrderDetailOut:
    wo = db.get(WorkOrder, work_order_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    if wo.elder_id:
        require_elder_access(wo.elder_id, current, db)
    elder = db.get(Elder, wo.elder_id) if wo.elder_id else None
    alert = db.get(AlertEvent, wo.alert_id) if wo.alert_id else None
    alert_dict = alert_to_dict(alert) if alert else {}
    status_labels = {"pending": "待处理", "processing": "处理中", "resolved": "已完成"}
    return WorkOrderDetailOut(
        id=wo.id,
        code=wo.code,
        elder_id=wo.elder_id,
        alert_id=wo.alert_id,
        tab=wo.tab,
        icon=wo.icon,
        title=wo.title,
        description=wo.description,
        tag=wo.tag,
        tag_tone=wo.tag_tone,
        status=wo.status,
        created_at=wo.created_at,
        elder_name=elder.name if elder else "",
        elder_age=elder.age if elder else 0,
        location=elder.location_label if elder else "",
        timeline=alert_dict.get("timeline", []),
        suggestion=alert_dict.get("suggestion", ""),
        alert_type=alert_dict.get("alert_type", "other"),
        priority=wo.tag,
        priority_tone=wo.tag_tone,
        elapsed_label="进行中" if wo.status != "resolved" else "已闭环",
        status_label=status_labels.get(wo.status, wo.status),
        status_tone=wo.tag_tone,
        trigger_time=format_time_label(wo.created_at),
        trigger_detail=alert.detail if alert else wo.description,
    )
