from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import CurrentUser, get_current_user, require_elder_access
from app.models import AlertEvent, CareTask, Device, Elder, HealthSnapshot, NotificationRule, WorkOrder
from app.schemas.api import (
    CareStatsOut,
    CareTaskOut,
    CareTaskUpdate,
    FamilyDashboardOut,
    HealthMetricOut,
    HealthReportOut,
    NotificationRuleOut,
    NotificationRulesUpdate,
)
from app.services.elder_helpers import elder_to_out

router = APIRouter(prefix="/api/v1/family", tags=["family"])


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
    current: CurrentUser = Depends(get_current_user),
) -> FamilyDashboardOut:
    require_elder_access(elder_id, current, db)
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
    tasks = db.query(CareTask).filter(CareTask.elder_id == elder_id).all()
    done = sum(1 for t in tasks if t.status == "done")
    total = len(tasks) or 1
    medicine_pct = int(done / total * 100)
    guard = _guard_score(db, elder_id)
    headline = "今天状态平稳" if active_alerts == 0 else f"有 {active_alerts} 条待处理提醒"
    elder_out = elder_to_out(elder, db)
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
        elder_name=elder_out.name,
        elder_location=elder_out.location_label,
        online_status=elder_out.online_status,
    )


@router.get("/reports", response_model=HealthReportOut)
def family_report(
    elder_id: str = Query(...),
    period: str = Query("week"),
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> HealthReportOut:
    require_elder_access(elder_id, current, db)
    elder = db.get(Elder, elder_id)
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")
    if period not in ("day", "week", "month"):
        raise HTTPException(status_code=400, detail="Invalid period")
    metrics = _latest_metrics(db, elder_id)
    risk = sum(1 for m in metrics if m.status == "warning")
    tasks = db.query(CareTask).filter(CareTask.elder_id == elder_id).all()
    done = sum(1 for t in tasks if t.status == "done")
    total = len(tasks) or 1
    medicine_pct = int(done / total * 100)
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
def care_tasks(
    elder_id: str = Query(...),
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[CareTaskOut]:
    require_elder_access(elder_id, current, db)
    rows = db.query(CareTask).filter(CareTask.elder_id == elder_id).all()
    return [
        CareTaskOut(
            id=r.id,
            elder_id=r.elder_id,
            icon=r.icon,
            title=r.title,
            description=r.description,
            status=r.status,  # type: ignore[arg-type]
            due_label=r.due_label,
        )
        for r in rows
    ]


@router.patch("/care/tasks/{task_id}", response_model=CareTaskOut)
def patch_care_task(
    task_id: str,
    body: CareTaskUpdate,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> CareTaskOut:
    task = db.get(CareTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Care task not found")
    require_elder_access(task.elder_id, current, db)
    task.status = body.status
    db.commit()
    db.refresh(task)
    return CareTaskOut(
        id=task.id,
        elder_id=task.elder_id,
        icon=task.icon,
        title=task.title,
        description=task.description,
        status=task.status,  # type: ignore[arg-type]
        due_label=task.due_label,
    )


@router.get("/care/stats", response_model=CareStatsOut)
def care_stats(
    elder_id: str = Query(...),
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> CareStatsOut:
    require_elder_access(elder_id, current, db)
    tasks = db.query(CareTask).filter(CareTask.elder_id == elder_id).all()
    done = sum(1 for t in tasks if t.status == "done")
    total = len(tasks)
    return CareStatsOut(
        elder_id=elder_id,
        done_count=done,
        total_count=total,
        greeting="今天适合主动问候一下妈妈，她昨晚睡得不错。",
        album_count=12,
    )


@router.get("/notification-rules", response_model=list[NotificationRuleOut])
def get_notification_rules(
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[NotificationRuleOut]:
    rows = db.query(NotificationRule).filter(NotificationRule.user_id == current.id).all()
    if not rows:
        return []
    return [NotificationRuleOut(key=r.key, label=r.label, description=r.description, enabled=r.enabled) for r in rows]


@router.patch("/notification-rules", response_model=list[NotificationRuleOut])
def patch_notification_rules(
    body: NotificationRulesUpdate,
    db: Session = Depends(get_db),
    current: CurrentUser = Depends(get_current_user),
) -> list[NotificationRuleOut]:
    by_key = {r.key: r for r in body.rules}
    rows = db.query(NotificationRule).filter(NotificationRule.user_id == current.id).all()
    for row in rows:
        if row.key in by_key:
            row.enabled = by_key[row.key].enabled
    db.commit()
    rows = db.query(NotificationRule).filter(NotificationRule.user_id == current.id).all()
    return [NotificationRuleOut(key=r.key, label=r.label, description=r.description, enabled=r.enabled) for r in rows]
