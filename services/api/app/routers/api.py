from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import AlertEvent, Elder, ElderBinding, HealthSnapshot, WorkOrder
from app.schemas.api import AlertOut, AlertUpdate, ElderOut, HealthMetricOut, WorkOrderOut, WorkOrderUpdate
from app.services.alert_service import alert_to_dict

router = APIRouter(prefix="/api/v1", tags=["api"])


def get_role(x_role: Annotated[str | None, Header()] = None) -> str | None:
    return x_role


def get_user_id(x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None) -> str | None:
    return x_user_id


@router.get("/elders", response_model=list[ElderOut])
def list_elders(
    db: Session = Depends(get_db),
    role: str | None = Depends(get_role),
    user_id: str | None = Depends(get_user_id),
) -> list[Elder]:
    q = db.query(Elder).order_by(Elder.id)
    if role == "family" and user_id:
        elder_ids = [
            b.elder_id
            for b in db.query(ElderBinding).filter(ElderBinding.family_user_id == user_id).all()
        ]
        if elder_ids:
            q = q.filter(Elder.id.in_(elder_ids))
    return q.all()


@router.get("/elders/{elder_id}", response_model=ElderOut)
def get_elder(elder_id: str, db: Session = Depends(get_db)) -> Elder:
    elder = db.get(Elder, elder_id)
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")
    return elder


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
