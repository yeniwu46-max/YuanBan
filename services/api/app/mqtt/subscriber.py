import json
import logging
import threading

import paho.mqtt.client as mqtt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models import Elder
from app.services.alert_service import create_alert_from_event, update_device_status, upsert_vitals

logger = logging.getLogger(__name__)


class MqttSubscriber:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._client: mqtt.Client | None = None
        self._thread: threading.Thread | None = None

    def _on_connect(self, client: mqtt.Client, userdata, flags, reason_code, properties=None) -> None:
        prefix = self.settings.mqtt_topic_prefix
        client.subscribe(f"{prefix}/+/vitals", qos=1)
        client.subscribe(f"{prefix}/+/event", qos=1)
        client.subscribe(f"{prefix}/+/device", qos=1)
        logger.info("MQTT subscribed to %s/+/{vitals,event,device}", prefix)

    def _on_message(self, client: mqtt.Client, userdata, msg: mqtt.MQTTMessage) -> None:
        try:
            parts = msg.topic.split("/")
            if len(parts) < 3:
                return
            elder_id = parts[1]
            channel = parts[2]
            payload = json.loads(msg.payload.decode("utf-8"))
            self._handle_message(elder_id, channel, payload)
        except Exception:
            logger.exception("Failed to handle MQTT message on %s", msg.topic)

    def _handle_message(self, elder_id: str, channel: str, payload: dict) -> None:
        db: Session = SessionLocal()
        try:
            elder = db.get(Elder, elder_id)
            if not elder:
                logger.warning("Unknown elder_id=%s", elder_id)
                return

            if channel == "vitals":
                upsert_vitals(db, elder_id, payload)
                return

            if channel == "device":
                event_type = payload.get("type", "")
                device_id = payload.get("device_id")
                if event_type == "offline" and device_id:
                    update_device_status(db, device_id, online=False)
                elif event_type == "online" and device_id:
                    update_device_status(db, device_id, online=True)
                elif event_type == "low_battery" and device_id:
                    update_device_status(db, device_id, online=True, battery=payload.get("battery", 23))
                return

            if channel == "event":
                event_type = payload.get("type", "")
                create_alert_from_event(
                    db,
                    elder,
                    event_type,
                    payload.get("device_id"),
                    payload.get("location", "未知位置"),
                    payload,
                )
        finally:
            db.close()

    def start(self) -> bool:
        if not self.settings.mqtt_enabled:
            logger.info("MQTT disabled (local dev mode)")
            return False
        if self._thread and self._thread.is_alive():
            return True
        try:
            client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
            client.on_connect = self._on_connect
            client.on_message = self._on_message
            client.connect(self.settings.mqtt_host, self.settings.mqtt_port, 60)
            self._client = client

            def run() -> None:
                client.loop_forever()

            self._thread = threading.Thread(target=run, daemon=True, name="mqtt-subscriber")
            self._thread.start()
            logger.info("MQTT subscriber started")
            return True
        except Exception:
            logger.warning("MQTT broker unavailable, running without MQTT subscriber")
            self._client = None
            self._thread = None
            return False

    def stop(self) -> None:
        if self._client:
            self._client.loop_stop()
            self._client.disconnect()


mqtt_subscriber = MqttSubscriber()
