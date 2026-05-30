import json
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.redis_client import get_redis
from app.models import AlertEvent, Device, Elder, HealthSnapshot, WorkOrder
from app.services.event_bus import publish_event


def format_time_label(dt: datetime) -> str:
    local = dt.astimezone(timezone.utc)
    return local.strftime("今天 %H:%M") if local else ""


def alert_to_dict(alert: AlertEvent, *, include_recommended: bool = False) -> dict:
    data = {
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
    if include_recommended:
        data["recommended_actions"] = recommended_actions_for_alert(alert)
    return data


def recommended_actions_for_alert(alert: AlertEvent) -> list[dict]:
    actions: list[dict] = []
    if alert.alert_type in ("sos", "fall"):
        actions.extend(
            [
                {
                    "id": "rec-call",
                    "icon": "☎",
                    "title": "电话确认老人状态",
                    "description": "询问是否头晕、胸闷或不适",
                    "route": "/pkg-elder-detail/family/index",
                },
                {
                    "id": "rec-sos",
                    "icon": "🚨",
                    "title": "查看 SOS 详情",
                    "description": "确认位置和现场情况",
                    "route": f"/pkg-family-detail/family/alert/index?id={alert.id}",
                },
            ]
        )
    if alert.alert_type in ("vitals", "other", "low_battery", "offline"):
        actions.append(
            {
                "id": "rec-report",
                "icon": "▤",
                "title": "查看健康报告",
                "description": "核对近期体征趋势",
                "route": "/pages/family/report/index",
            }
        )
    actions.append(
        {
            "id": "rec-care",
            "icon": "💬",
            "title": "发送关怀提醒",
            "description": "让小鼋用温和语气提醒老人",
            "route": "/pages/family/care/index",
        }
    )
    return actions


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


def _publish_alert(alert: AlertEvent) -> None:
    publish_event("alert.created", {"alert": alert_to_dict(alert), "elder_id": alert.elder_id})


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
    _publish_alert(alert)
    return alert


def create_low_battery_alert(db: Session, elder: Elder, device_id: str, battery: int) -> AlertEvent | None:
    existing = (
        db.query(AlertEvent)
        .filter(
            AlertEvent.elder_id == elder.id,
            AlertEvent.alert_type == "deviceBattery",
            AlertEvent.status != "resolved",
        )
        .first()
    )
    if existing:
        return existing

    now = datetime.now(timezone.utc)
    alert_id = f"alert-{uuid.uuid4().hex[:8]}"
    alert = AlertEvent(
        id=alert_id,
        elder_id=elder.id,
        alert_type="deviceBattery",
        level="low",
        icon="🔋",
        title="SOS 按钮电量偏低",
        description=f"{format_time_label(now)} · 当前电量 {battery}%",
        detail=f"设备 {device_id} 电量低于 25%",
        status="pending",
        status_label="待确认",
        tag="低电量",
        tag_tone="warm",
        timeline=[
            {"id": "t1", "title": "系统生成提醒", "detail": f"设备电量 {battery}%", "done": True},
            {"id": "t2", "title": "通知子女端", "detail": "等待查看", "done": False, "pending": True},
        ],
        suggestion="建议提醒老人或上门协助更换电池。",
        alert_code=next_work_order_code(db, "BAT"),
        created_at=now,
        updated_at=now,
    )
    db.add(alert)
    wo = WorkOrder(
        id=f"wo-{uuid.uuid4().hex[:8]}",
        code=alert.alert_code or next_work_order_code(db, "BAT"),
        elder_id=elder.id,
        alert_id=alert.id,
        tab="device",
        icon="🔋",
        title=f"{elder.name} · SOS 按钮低电量",
        description=alert.description,
        tag="低电量",
        tag_tone="warm",
        status="pending",
        created_at=now,
        updated_at=now,
    )
    db.add(wo)
    db.commit()
    db.refresh(alert)
    _publish_alert(alert)
    return alert


def _metric_status(key: str, value: str) -> str:
    if key == "heartRate":
        try:
            hr = int(value)
            if hr > 100 or hr < 50:
                return "warning"
        except ValueError:
            pass
    if key == "bloodPressure" and "/" in value:
        try:
            systolic = int(value.split("/")[0])
            if systolic >= 130:
                return "warning"
        except ValueError:
            pass
    return "normal"


def upsert_vitals(db: Session, elder_id: str, payload: dict) -> None:
    now = datetime.now(timezone.utc)
    metrics = []
    if "heart_rate" in payload:
        val = str(payload["heart_rate"])
        metrics.append(("heartRate", "心率", val, "次/分", _metric_status("heartRate", val)))
    if "breath_rate" in payload:
        val = str(payload["breath_rate"])
        metrics.append(("breathRate", "呼吸", val, "次/分", "normal"))
    elder = db.get(Elder, elder_id)
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
    db.commit()

    if elder and any(s == "warning" for _, _, _, _, s in metrics):
        now = datetime.now(timezone.utc)
        warning_metric = next((m for m in metrics if m[4] == "warning"), None)
        if warning_metric:
            key, label, value, unit, _ = warning_metric
            existing = (
                db.query(AlertEvent)
                .filter(
                    AlertEvent.elder_id == elder_id,
                    AlertEvent.alert_type == "vitals",
                    AlertEvent.status != "resolved",
                )
                .first()
            )
            if not existing:
                alert = AlertEvent(
                    id=f"alert-{uuid.uuid4().hex[:8]}",
                    elder_id=elder_id,
                    alert_type="vitals",
                    level="medium",
                    icon="❤️",
                    title=f"{label}异常",
                    description=f"{format_time_label(now)} · 当前 {value}{unit}",
                    detail=f"监测到{label} {value}{unit}，建议关注。",
                    status="pending",
                    status_label="待确认",
                    tag="需关注",
                    tag_tone="warm",
                    timeline=[{"id": "t1", "title": "系统检测异常", "detail": f"{label} {value}{unit}", "done": True}],
                    suggestion="建议电话确认老人是否有不适。",
                    alert_code=next_work_order_code(db, "VIT"),
                    created_at=now,
                    updated_at=now,
                )
                db.add(alert)
                db.commit()
                db.refresh(alert)
                _publish_alert(alert)


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
    if battery is not None and battery < 25:
        elder = db.get(Elder, device.elder_id)
        if elder:
            create_low_battery_alert(db, elder, device_id, battery)


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
