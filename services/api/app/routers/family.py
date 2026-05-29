from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.data.demo_content import CARE_STATS, CARE_TASKS, COMMUNITY_ACTIVITIES, NOTIFICATION_RULES
from app.models import AlertEvent, Device, Elder, HealthSnapshot, WorkOrder
from app.schemas.api import (
    CareStatsOut,
    CareTaskOut,
    FamilyDashboardOut,
    HealthMetricOut,
    HealthReportOut,
    NotificationRuleOut,
    NotificationRulesUpdate,
)

router = APIRouter(prefix="/api/v1/family", tags=["family"])


def get_user_id(x_user_id: str | None = Header(default=None, alias="X-User-Id")) -> str:
    return x_user_id or "family-001"


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


def _guard_score(db: Session, elder_id: str) -> int:
    alerts = db.query(AlertEvent).filter(AlertEvent.elder_id == elder_id).all()
    unresolved = sum(1 for a in alerts if a.status != "resolved")
    return max(60, 96 - unresolved * 8)


@router.get("/dashboard", response_model=FamilyDashboardOut)
def family_dashboard(
    elder_id: str = Query(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
) -> FamilyDashboardOut:
    _ = user_id
    elder = db.get(Elder, elder_id)
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")
    metrics = _latest_metrics(db, elder_id)
    active_alerts = (
        db.query(AlertEvent)
        .filter(AlertEvent.elder_id == elder_id, AlertEvent.status != "resolved")
        .count()
    )
    devices = db.query(Device).filter(Device.elder_id == elder_id).all()
    stats = CARE_STATS.get(elder_id, {"done_count": 2, "total_count": 5})
    done = stats["done_count"]
    total = stats["total_count"]
    medicine_pct = int(done / total * 100) if total else 0
    guard = _guard_score(db, elder_id)
    headline = "今天状态平稳" if active_alerts == 0 else f"有 {active_alerts} 条待处理提醒"
    return FamilyDashboardOut(
        elder_id=elder_id,
        guard_score=guard,
        health_score=min(100, guard + 4),
        active_alert_count=active_alerts,
        device_count=len(devices),
        medicine_done_percent=medicine_pct,
        safety_headline=headline,
        companion_suggestion="建议先电话确认老人是否舒适，再查看健康报告。",
        metrics=metrics,
    )


@router.get("/reports", response_model=HealthReportOut)
def family_report(
    elder_id: str = Query(...),
    period: str = Query("week"),
    db: Session = Depends(get_db),
) -> HealthReportOut:
    elder = db.get(Elder, elder_id)
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")
    if period not in ("day", "week", "month"):
        raise HTTPException(status_code=400, detail="Invalid period")
    metrics = _latest_metrics(db, elder_id)
    risk = sum(1 for m in metrics if m.status == "warning")
    stats = CARE_STATS.get(elder_id, {"done_count": 2, "total_count": 5})
    medicine_pct = int(stats["done_count"] / stats["total_count"] * 100) if stats["total_count"] else 0
    sleep = next((m for m in metrics if m.key == "sleep"), None)
    avg_sleep = float(sleep.value) if sleep else 7.5
    headlines = {"day": "今日健康平稳", "week": "本周整体良好", "month": "本月守护稳定"}
    return HealthReportOut(
        elder_id=elder_id,
        period=period,  # type: ignore[arg-type]
        health_score=_guard_score(db, elder_id),
        headline=headlines[period],
        summary=f"{elder.name}近期体征整体{'需关注' if risk else '正常'}，建议保持日常联系。",
        risk_count=risk,
        medicine_done_percent=medicine_pct,
        avg_sleep_hours=avg_sleep,
        device_status_label="设备在线",
        yuan_interpretation="小鼋观察到老人活动规律，情绪较平稳。",
        family_advice="若血压持续偏高，建议提醒老人按时复测并记录。",
        metrics=metrics,
    )


@router.get("/care/tasks", response_model=list[CareTaskOut])
def care_tasks(elder_id: str = Query(...)) -> list[CareTaskOut]:
    return [CareTaskOut(**t) for t in CARE_TASKS if t["elder_id"] == elder_id]


@router.get("/care/stats", response_model=CareStatsOut)
def care_stats(elder_id: str = Query(...)) -> CareStatsOut:
    stats = CARE_STATS.get(elder_id, {"done_count": 0, "total_count": 0, "greeting": "", "album_count": 0})
    return CareStatsOut(elder_id=elder_id, **stats)


@router.get("/notification-rules", response_model=list[NotificationRuleOut])
def get_notification_rules(user_id: str = Depends(get_user_id)) -> list[NotificationRuleOut]:
    _ = user_id
    return [NotificationRuleOut(**r) for r in NOTIFICATION_RULES]


@router.patch("/notification-rules", response_model=list[NotificationRuleOut])
def patch_notification_rules(body: NotificationRulesUpdate) -> list[NotificationRuleOut]:
    from app.data import demo_content

    by_key = {r.key: r for r in body.rules}
    for item in demo_content.NOTIFICATION_RULES:
        if item["key"] in by_key:
            item["enabled"] = by_key[item["key"]].enabled
    return [NotificationRuleOut(**r) for r in demo_content.NOTIFICATION_RULES]
