import json
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.redis_client import get_redis
from app.models import AlertEvent, Device, Elder, HealthSnapshot, WorkOrder


def format_time_label(dt: datetime) -> str:
    local = dt.astimezone(timezone.utc)
    return local.strftime("今天 %H:%M") if local else ""


def alert_to_dict(alert: AlertEvent) -> dict:
    return {
        "id": alert.id,
        "elder_id": alert.elder_id,
        "alert_type": alert.alert_type,
        "level": alert.level,
        "icon": alert.icon,
        "title": alert.title,
        "description": alert.description,
        "detail": alert.detail,
        "status": alert.status,
        "status_label": alert.status_label,
        "tag": alert.tag,
        "tag_tone": alert.tag_tone,
        "timeline": alert.timeline or [],
        "suggestion": alert.suggestion,
        "alert_code": alert.alert_code,
        "time_label": format_time_label(alert.created_at),
        "created_at": alert.created_at,
    }


def should_dedup_sos(elder_id: str, event_type: str) -> bool:
    if event_type != "sos":
        return False
    settings = get_settings()
    redis = get_redis()
    key = f"sos:dedup:{elder_id}"
    if redis.set(key, "1", nx=True, ex=settings.sos_dedup_seconds):
        return False
    return True


def next_work_order_code(db: Session, prefix: str) -> str:
    count = db.query(WorkOrder).filter(WorkOrder.code.like(f"#{prefix}-%")).count()
    return f"#{prefix}-{count + 1:03d}"


def create_alert_from_event(
    db: Session,
    elder: Elder,
    event_type: str,
    device_id: str | None,
    location: str,
    payload: dict,
) -> AlertEvent | None:
    if should_dedup_sos(elder.id, event_type):
        return None

    now = datetime.now(timezone.utc)
    alert_id = f"alert-{uuid.uuid4().hex[:8]}"

    if event_type == "sos":
        alert = AlertEvent(
            id=alert_id,
            elder_id=elder.id,
            alert_type="sos",
            level="high",
            icon="🚨",
            title="SOS 求助触发",
            description=f"{format_time_label(now)} · {location} · 已通知子女，待社区确认",
            detail=f"{now.strftime('%H:%M')} 由老人端 SOS 按钮触发，位置：{location}",
            status="pending",
            status_label="待确认",
            tag="紧急",
            tag_tone="red",
            timeline=[
                {"id": "t1", "title": "老人端触发 SOS", "detail": f"{now.strftime('%H:%M')} · 床头 SOS 按钮触发", "done": True},
                {"id": "t2", "title": "子女端收到通知", "detail": "等待子女查看", "done": False, "pending": True},
                {"id": "t3", "title": "社区确认", "detail": "等待社区人员确认现场情况", "done": False, "pending": True},
            ],
            suggestion="建议先电话确认老人是否清醒，若无人接听请安排上门。",
            alert_code=next_work_order_code(db, "SOS"),
            created_at=now,
            updated_at=now,
        )
    elif event_type == "fall":
        alert = AlertEvent(
            id=alert_id,
            elder_id=elder.id,
            alert_type="fall",
            level="high",
            icon="⚠",
            title="跌倒风险告警",
            description=f"{format_time_label(now)} · {location} · 建议尽快回访",
            detail="客厅活动异常，建议电话回访。",
            status="pending",
            status_label="待确认",
            tag="高优先",
            tag_tone="warm",
            timeline=[
                {"id": "t1", "title": "设备检测异常", "detail": f"{now.strftime('%H:%M')} · 活动模式异常", "done": True},
                {"id": "t2", "title": "通知子女端", "detail": "等待确认", "done": False, "pending": True},
            ],
            suggestion="建议尽快电话或上门确认老人状态。",
            alert_code=next_work_order_code(db, "FALL"),
            created_at=now,
            updated_at=now,
        )
    elif event_type == "offline":
        alert = AlertEvent(
            id=alert_id,
            elder_id=elder.id,
            alert_type="deviceOffline",
            level="medium",
            icon="📶",
            title="守护设备离线",
            description=f"{format_time_label(now)} · 设备 {device_id or ''} 离线",
            detail="主守护设备失去连接。",
            status="pending",
            status_label="待确认",
            tag="需关注",
            tag_tone="warm",
            timeline=[{"id": "t1", "title": "系统检测到离线", "detail": "设备断开连接", "done": True}],
            suggestion="建议检查设备电源与网络。",
            alert_code=next_work_order_code(db, "DEV"),
            created_at=now,
            updated_at=now,
        )
    else:
        return None

    db.add(alert)

    if event_type in ("sos", "fall"):
        wo_id = f"wo-{uuid.uuid4().hex[:8]}"
        tab = "urgent"
        tag_tone = "red" if event_type == "sos" else "warm"
        tag = "紧急" if event_type == "sos" else "高优先"
        work_order = WorkOrder(
            id=wo_id,
            code=alert.alert_code or next_work_order_code(db, "WO"),
            elder_id=elder.id,
            alert_id=alert.id,
            tab=tab,
            icon=alert.icon,
            title=f"{elder.name} · {alert.title}",
            description=alert.description,
            tag=tag,
            tag_tone=tag_tone,
            status="pending",
            created_at=now,
            updated_at=now,
        )
        db.add(work_order)

    db.commit()
    db.refresh(alert)
    return alert


def upsert_vitals(db: Session, elder_id: str, payload: dict) -> None:
    now = datetime.now(timezone.utc)
    metrics = []
    if "heart_rate" in payload:
        metrics.append(("heartRate", "心率", str(payload["heart_rate"]), "次/分", "normal"))
    if "breath_rate" in payload:
        metrics.append(("breathRate", "呼吸", str(payload["breath_rate"]), "次/分", "normal"))
    for key, label, value, unit, status in metrics:
        snap = HealthSnapshot(
            elder_id=elder_id,
            metric_key=key,
            label=label,
            value=value,
            unit=unit,
            status=status,
            recorded_at=now,
        )
        db.add(snap)
    db.commit()


def update_device_status(db: Session, device_id: str, online: bool, battery: int | None = None) -> None:
    device = db.get(Device, device_id)
    if not device:
        return
    device.online = online
    if battery is not None:
        device.battery_percent = battery
    device.status = "warning" if battery is not None and battery < 25 else ("normal" if online else "offline")
    db.commit()
    redis = get_redis()
    redis.set(f"device:last_seen:{device_id}", datetime.now(timezone.utc).isoformat())


def publish_mqtt_event(host: str, port: int, topic: str, payload: dict) -> bool:
    settings = get_settings()
    if not settings.mqtt_enabled:
        return False
    try:
        import paho.mqtt.client as mqtt

        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        client.connect(host, port, 60)
        client.publish(topic, json.dumps(payload), qos=1)
        client.disconnect()
        return True
    except Exception:
        return False
