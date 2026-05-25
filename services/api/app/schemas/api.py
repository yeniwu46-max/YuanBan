from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


UserRole = Literal["elder", "family", "community"]
AlertStatus = Literal["pending", "viewed", "processing", "resolved"]
WorkOrderStatus = Literal["pending", "processing", "resolved"]


class HealthMetricOut(BaseModel):
    key: str
    label: str
    value: str
    unit: str
    status: str
    description: str = ""


class ElderOut(BaseModel):
    id: str
    name: str
    age: int
    location_label: str
    address: str
    community_site_id: str | None = None

    model_config = {"from_attributes": True}


class AlertOut(BaseModel):
    id: str
    elder_id: str
    type: str = Field(alias="alert_type")
    level: str
    icon: str
    title: str
    description: str
    detail: str
    status: str
    status_label: str
    tag: str
    tag_tone: str
    timeline: list[dict[str, Any]]
    suggestion: str = ""
    alert_code: str | None = None
    time_label: str = ""
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


class AlertUpdate(BaseModel):
    status: AlertStatus
    status_label: str | None = None


class WorkOrderOut(BaseModel):
    id: str
    code: str
    elder_id: str | None
    alert_id: str | None
    tab: str
    icon: str
    title: str
    description: str
    tag: str
    tag_tone: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkOrderUpdate(BaseModel):
    status: WorkOrderStatus
    tag: str | None = None
    tag_tone: str | None = None


class SimulatorTrigger(BaseModel):
    event_type: Literal["sos", "fall", "vitals", "offline", "low_battery"]
    elder_id: str = "elder-001"
    device_id: str = "d3"
    location: str = "卧室"
