from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    phone: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    role: Mapped[str] = mapped_column(String(16), nullable=False)  # elder | family | community
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CommunitySite(Base):
    __tablename__ = "community_sites"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    duty_staff: Mapped[str] = mapped_column(String(64), nullable=False)
    device_online_rate: Mapped[int] = mapped_column(Integer, default=96)
    service_status_label: Mapped[str] = mapped_column(String(64), default="服务响应正常")


class Elder(Base):
    __tablename__ = "elders"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    location_label: Mapped[str] = mapped_column(String(128), nullable=False)
    address: Mapped[str] = mapped_column(String(256), default="")
    community_site_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("community_sites.id"))
    user_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("users.id"))

    devices: Mapped[list["Device"]] = relationship(back_populates="elder")
    alerts: Mapped[list["AlertEvent"]] = relationship(back_populates="elder")


class ElderBinding(Base):
    __tablename__ = "elder_bindings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    elder_id: Mapped[str] = mapped_column(String(64), ForeignKey("elders.id"), nullable=False)
    family_user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False)
    relation: Mapped[str] = mapped_column(String(32), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    elder_id: Mapped[str] = mapped_column(String(64), ForeignKey("elders.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    location: Mapped[str] = mapped_column(String(128), nullable=False)
    online: Mapped[bool] = mapped_column(Boolean, default=True)
    battery_percent: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="normal")

    elder: Mapped["Elder"] = relationship(back_populates="devices")


class AlertEvent(Base):
    __tablename__ = "alert_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    elder_id: Mapped[str] = mapped_column(String(64), ForeignKey("elders.id"), nullable=False)
    alert_type: Mapped[str] = mapped_column(String(32), nullable=False)
    level: Mapped[str] = mapped_column(String(16), nullable=False)
    icon: Mapped[str] = mapped_column(String(8), default="⚠")
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    detail: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(16), default="pending")
    status_label: Mapped[str] = mapped_column(String(32), default="待确认")
    tag: Mapped[str] = mapped_column(String(32), default="需关注")
    tag_tone: Mapped[str] = mapped_column(String(16), default="warm")
    timeline: Mapped[list] = mapped_column(JSON, default=list)
    suggestion: Mapped[str] = mapped_column(Text, default="")
    alert_code: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    elder: Mapped["Elder"] = relationship(back_populates="alerts")
    work_orders: Mapped[list["WorkOrder"]] = relationship(back_populates="alert")


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    elder_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("elders.id"))
    alert_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("alert_events.id"))
    tab: Mapped[str] = mapped_column(String(16), nullable=False)
    icon: Mapped[str] = mapped_column(String(8), default="▤")
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    tag: Mapped[str] = mapped_column(String(32), nullable=False)
    tag_tone: Mapped[str] = mapped_column(String(16), default="normal")
    status: Mapped[str] = mapped_column(String(16), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    alert: Mapped["AlertEvent | None"] = relationship(back_populates="work_orders")


class HealthSnapshot(Base):
    __tablename__ = "health_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    elder_id: Mapped[str] = mapped_column(String(64), ForeignKey("elders.id"), nullable=False)
    metric_key: Mapped[str] = mapped_column(String(32), nullable=False)
    label: Mapped[str] = mapped_column(String(64), nullable=False)
    value: Mapped[str] = mapped_column(String(64), nullable=False)
    unit: Mapped[str] = mapped_column(String(32), default="")
    status: Mapped[str] = mapped_column(String(16), default="normal")
    description: Mapped[str] = mapped_column(Text, default="")
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
