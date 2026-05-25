from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models import Elder
from app.schemas.api import SimulatorTrigger
from app.services.alert_service import create_alert_from_event, publish_mqtt_event, update_device_status, upsert_vitals

router = APIRouter(prefix="/api/v1/simulator", tags=["simulator"])


@router.post("/trigger")
def trigger_simulator(body: SimulatorTrigger, db: Session = Depends(get_db)) -> dict:
    settings = get_settings()
    elder = db.get(Elder, body.elder_id)
    if not elder:
        return {"ok": False, "error": "elder not found"}

    if body.event_type == "vitals":
        payload = {"heart_rate": 84, "breath_rate": 19}
        topic = f"{settings.mqtt_topic_prefix}/{body.elder_id}/vitals"
    elif body.event_type == "offline":
        payload = {"type": "offline", "device_id": body.device_id}
        topic = f"{settings.mqtt_topic_prefix}/{body.elder_id}/device"
    elif body.event_type == "low_battery":
        payload = {"type": "low_battery", "device_id": body.device_id, "battery": 23}
        topic = f"{settings.mqtt_topic_prefix}/{body.elder_id}/device"
    else:
        payload = {
            "type": body.event_type,
            "device_id": body.device_id,
            "location": body.location,
            "ts": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        }
        topic = f"{settings.mqtt_topic_prefix}/{body.elder_id}/event"

    mqtt_published = publish_mqtt_event(settings.mqtt_host, settings.mqtt_port, topic, payload)

    # 本地无 MQTT 时直接写库（dev convenience）
    if body.event_type == "vitals":
        upsert_vitals(db, body.elder_id, payload)
    elif body.event_type in ("offline", "low_battery"):
        update_device_status(
            db,
            body.device_id,
            online=body.event_type != "offline",
            battery=23 if body.event_type == "low_battery" else None,
        )
    else:
        alert = create_alert_from_event(db, elder, body.event_type, body.device_id, body.location, payload)
        return {"ok": True, "topic": topic, "mqtt_published": mqtt_published, "alert_id": alert.id if alert else None}

    return {"ok": True, "topic": topic, "mqtt_published": mqtt_published}
