from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


UserRole = Literal["elder", "family", "community"]
AlertStatus = Literal["pending", "viewed", "processing", "resolved"]
WorkOrderStatus = Literal["pending", "processing", "resolved"]
CompanionScene = Literal["chat", "mood", "health", "care"]
CompanionSafetyLevel = Literal["normal", "attention", "emergency"]


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
    guard_score: int = 86
    device_count: int = 0
    online_status: str = "online"
    emergency_contact: str = ""
    emergency_phone: str = ""

    model_config = {"from_attributes": True}


class DeviceOut(BaseModel):
    id: str
    elder_id: str
    name: str
    location: str
    online: bool
    battery_percent: int | None = None
    status: str

    model_config = {"from_attributes": True}


class MedicineOut(BaseModel):
    id: str
    name: str
    dose: str
    schedule: str
    status: str


class MetricHistoryPoint(BaseModel):
    recorded_at: datetime
    value: str
    status: str


class ServiceSummaryOut(BaseModel):
    abnormal_metric_count: int
    online_device_count: int
    total_device_count: int
    recent_activity_label: str
    companion_mood: str = "平稳"
    companion_score: int = 78


class CompanionStateOut(BaseModel):
    mood: str = "平稳"
    companion_score: int = 78
    speak_hint: str = "今天记得多喝水"


class CompanionStateUpdate(BaseModel):
    mood: str | None = None
    companion_score: int | None = None


class FamilyDashboardOut(BaseModel):
    elder_id: str
    guard_score: int
    health_score: int
    active_alert_count: int
    device_count: int
    medicine_done_percent: int
    safety_headline: str
    companion_suggestion: str
    metrics: list[HealthMetricOut] = Field(default_factory=list)
    elder_name: str = ""
    elder_location: str = ""
    online_status: str = "online"


class HealthReportOut(BaseModel):
    elder_id: str
    period: Literal["day", "week", "month"]
    health_score: int
    headline: str
    summary: str
    risk_count: int
    medicine_done_percent: int
    avg_sleep_hours: float
    device_status_label: str
    yuan_interpretation: str
    family_advice: str
    metrics: list[HealthMetricOut] = Field(default_factory=list)


class CareTaskOut(BaseModel):
    id: str
    elder_id: str
    icon: str
    title: str
    description: str
    status: Literal["done", "pending"]
    due_label: str


class CareTaskUpdate(BaseModel):
    status: Literal["done", "pending"]


class RecommendedActionOut(BaseModel):
    id: str
    icon: str
    title: str
    description: str
    route: str | None = None


class PrivacyPermissionOut(BaseModel):
    key: str
    label: str
    description: str
    enabled: bool


class PrivacyPermissionsUpdate(BaseModel):
    permissions: list[PrivacyPermissionOut]


class ActivityCheckInOut(BaseModel):
    id: str
    name: str
    time_label: str
    status_label: str
    status_tone: str = "normal"


class CareStatsOut(BaseModel):
    elder_id: str
    done_count: int
    total_count: int
    greeting: str
    album_count: int


class NotificationRuleOut(BaseModel):
    key: str
    label: str
    description: str
    enabled: bool


class NotificationRulesUpdate(BaseModel):
    rules: list[NotificationRuleOut]


class CommunityDashboardOut(BaseModel):
    pending_count: int
    urgent_count: int
    visit_count: int
    activity_count: int
    done_count: int
    total_count: int
    device_online_rate: int
    service_status_label: str
    urgent_items: list[dict[str, Any]] = Field(default_factory=list)
    ops_metrics: list[dict[str, Any]] = Field(default_factory=list)
    today_activity: dict[str, Any] | None = None
    focus_elders: list[dict[str, Any]] = Field(default_factory=list)


class CommunityActivityOut(BaseModel):
    id: str
    title: str
    time_label: str
    location: str
    enrolled: int
    pending_check_in: int
    status_label: str
    status_tone: str


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
    recommended_actions: list[RecommendedActionOut] = Field(default_factory=list)

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


class ServiceProfileOut(BaseModel):
    elder_id: str
    name: str
    age: int
    address: str
    guard_score: int
    health_summary: str
    recent_orders: list[WorkOrderOut] = Field(default_factory=list)
    metrics: list[HealthMetricOut] = Field(default_factory=list)


class WorkOrderDetailOut(BaseModel):
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
    elder_name: str = ""
    elder_age: int = 0
    location: str = ""
    timeline: list[dict[str, Any]] = Field(default_factory=list)
    suggestion: str = ""
    alert_type: str = "other"
    priority: str = "普通"
    priority_tone: str = "normal"
    elapsed_label: str = "进行中"
    status_label: str = "处理中"
    status_tone: str = "warm"
    trigger_time: str = ""
    trigger_detail: str = ""


class MedicineStatusUpdate(BaseModel):
    status: Literal["pending", "done", "later"]


class SimulatorTrigger(BaseModel):
    event_type: Literal["sos", "fall", "vitals", "offline", "low_battery"]
    elder_id: str = "elder-001"
    device_id: str = "d3"
    location: str = "卧室"


class CompanionChatIn(BaseModel):
    elder_id: str = "elder-001"
    role: UserRole = "elder"
    message: str = Field(min_length=1, max_length=500)
    mood: str | None = Field(default=None, max_length=24)
    scene: CompanionScene = "chat"


class CompanionSuggestedAction(BaseModel):
    key: str
    label: str
    route: str | None = None


class CompanionChatOut(BaseModel):
    reply: str
    speak_text: str
    suggested_actions: list[CompanionSuggestedAction] = Field(default_factory=list)
    safety_level: CompanionSafetyLevel = "normal"
