from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.data.demo_content import COMMUNITY_ACTIVITIES
from app.models import AlertEvent, CommunitySite, Device, Elder, HealthSnapshot, WorkOrder
from app.schemas.api import (
    CommunityActivityOut,
    CommunityDashboardOut,
    HealthMetricOut,
    ServiceProfileOut,
    WorkOrderOut,
)
from app.services.alert_service import alert_to_dict

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


@router.get("/dashboard", response_model=CommunityDashboardOut)
def community_dashboard(db: Session = Depends(get_db)) -> CommunityDashboardOut:
    site = db.query(CommunitySite).first()
    orders = db.query(WorkOrder).all()
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
    for elder in db.query(Elder).limit(3).all():
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
    today_activity = {
        "id": COMMUNITY_ACTIVITIES[0]["id"],
        "title": COMMUNITY_ACTIVITIES[0]["title"],
        "timeLabel": COMMUNITY_ACTIVITIES[0]["time_label"],
        "location": COMMUNITY_ACTIVITIES[0]["location"],
        "enrolled": COMMUNITY_ACTIVITIES[0]["enrolled"],
        "pendingCheckIn": COMMUNITY_ACTIVITIES[0]["pending_check_in"],
        "statusLabel": COMMUNITY_ACTIVITIES[0]["status_label"],
        "statusTone": COMMUNITY_ACTIVITIES[0]["status_tone"],
    }
    return CommunityDashboardOut(
        pending_count=len(pending),
        urgent_count=len(urgent),
        visit_count=len(visit),
        activity_count=len(COMMUNITY_ACTIVITIES),
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
def community_activities() -> list[CommunityActivityOut]:
    return [CommunityActivityOut(**a) for a in COMMUNITY_ACTIVITIES]


@router.get("/service-profile", response_model=ServiceProfileOut)
def service_profile(elder_id: str = Query(...), db: Session = Depends(get_db)) -> ServiceProfileOut:
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
def get_work_order(work_order_id: str, db: Session = Depends(get_db)) -> WorkOrder:
    wo = db.get(WorkOrder, work_order_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    return wo
