from sqlalchemy.orm import Session

from app.models import AlertEvent, Device, Elder
from app.schemas.api import ElderOut


def elder_to_out(elder: Elder, db: Session) -> ElderOut:
    devices = db.query(Device).filter(Device.elder_id == elder.id).all()
    online = any(d.online for d in devices) if devices else True
    unresolved = (
        db.query(AlertEvent)
        .filter(AlertEvent.elder_id == elder.id, AlertEvent.status != "resolved")
        .count()
    )
    return ElderOut(
        id=elder.id,
        name=elder.name,
        age=elder.age,
        location_label=elder.location_label,
        address=elder.address,
        community_site_id=elder.community_site_id,
        guard_score=max(60, 96 - unresolved * 8),
        device_count=len(devices),
        online_status="online" if online else "offline",
        emergency_contact="女儿 · 已绑定",
        emergency_phone="130 0000 0000",
    )
