"""Seed demo data aligned with frontend Mock."""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import (
    AlertEvent,
    CommunitySite,
    Device,
    Elder,
    ElderBinding,
    HealthSnapshot,
    User,
    WorkOrder,
)


def seed(db: Session) -> None:
    if db.get(Elder, "elder-001"):
        print("Seed skipped: data already exists")
        return

    site = CommunitySite(
        id="site-001",
        name="椿木营社区站",
        duty_staff="王社工",
        device_online_rate=96,
        service_status_label="服务响应正常",
    )
    db.add(site)

    users = [
        User(id="user-elder-001", phone="13800000001", name="李奶奶", role="elder"),
        User(id="family-001", phone="13000000000", name="李女士", role="family"),
        User(id="community-001", phone="13900000001", name="王社工", role="community"),
    ]
    db.add_all(users)

    elder = Elder(
        id="elder-001",
        name="李奶奶",
        age=72,
        location_label="家中 · 客厅附近",
        address="椿木营社区 3 栋 2 单元 401",
        community_site_id="site-001",
        user_id="user-elder-001",
    )
    db.add(elder)
    db.add(
        ElderBinding(elder_id="elder-001", family_user_id="family-001", relation="女儿", is_primary=True)
    )

    devices = [
        Device(id="d1", elder_id="elder-001", name="小鼋主守护设备", location="客厅", online=True, status="normal"),
        Device(id="d2", elder_id="elder-001", name="毫米波雷达", location="卧室", online=True, status="normal"),
        Device(id="d3", elder_id="elder-001", name="SOS 紧急按钮", location="床头", online=True, battery_percent=23, status="warning"),
        Device(id="d4", elder_id="elder-001", name="环境传感器", location="客厅", online=True, status="normal"),
    ]
    db.add_all(devices)

    now = datetime.now(timezone.utc)
    metrics = [
        ("heartRate", "心率", "78", "次/分", "normal", "当前心跳平稳"),
        ("breathRate", "呼吸", "17", "次/分", "normal", "呼吸节律稳定"),
        ("bloodPressure", "血压", "128/82", "mmHg", "warning", "建议晚间再测一次"),
        ("sleep", "睡眠", "8", "小时", "normal", "昨晚睡眠质量不错"),
    ]
    for key, label, value, unit, status, desc in metrics:
        db.add(
            HealthSnapshot(
                elder_id="elder-001",
                metric_key=key,
                label=label,
                value=value,
                unit=unit,
                status=status,
                description=desc,
                recorded_at=now,
            )
        )

    alerts = [
        AlertEvent(
            id="alert-sos-018",
            elder_id="elder-001",
            alert_type="sos",
            level="high",
            icon="🚨",
            title="SOS 求助触发",
            description="5 分钟前 · 家中卧室 · 已通知子女，待社区确认",
            detail="09:18 由老人端 SOS 按钮触发，子女端已收到通知，社区端需要协同响应。",
            status="processing",
            status_label="处理中",
            tag="紧急",
            tag_tone="red",
            alert_code="#SOS-018",
            timeline=[
                {"id": "t1", "title": "老人端触发 SOS", "detail": "09:18 · 床头 SOS 按钮触发", "done": True},
                {"id": "t2", "title": "子女端收到通知", "detail": "09:18 · 女儿已查看告警", "done": True},
                {"id": "t3", "title": "电话 / 上门确认", "detail": "等待社区人员确认现场情况", "done": False, "pending": True},
            ],
            suggestion="建议先电话确认老人是否清醒、是否有胸闷头晕。",
            created_at=now,
            updated_at=now,
        ),
        AlertEvent(
            id="alert-001",
            elder_id="elder-001",
            alert_type="bloodPressure",
            level="medium",
            icon="💧",
            title="血压轻微偏高",
            description="今天 08:40 · 建议今晚提醒老人睡前复测",
            detail="08:40 监测到血压 128/82 mmHg",
            status="pending",
            status_label="待确认",
            tag="需关注",
            tag_tone="warm",
            timeline=[
                {"id": "t1", "title": "系统生成告警", "detail": "08:40 · 血压轻微偏高", "done": True},
                {"id": "t2", "title": "通知子女端", "detail": "08:41 · 微信通知已送达", "done": True},
                {"id": "t3", "title": "子女确认查看", "detail": "等待确认处理", "done": False, "pending": True},
            ],
            suggestion="建议先给老人打个电话，确认是否不舒服。",
            created_at=now,
            updated_at=now,
        ),
        AlertEvent(
            id="alert-002",
            elder_id="elder-001",
            alert_type="deviceBattery",
            level="low",
            icon="🔋",
            title="SOS 按钮电量偏低",
            description="今天 08:12 · 当前电量 23%",
            detail="SOS 紧急按钮电量低于 25%",
            status="viewed",
            status_label="已查看",
            tag="低电量",
            tag_tone="warm",
            timeline=[
                {"id": "t1", "title": "系统生成提醒", "detail": "08:12 · SOS 按钮电量 23%", "done": True},
                {"id": "t2", "title": "通知子女端", "detail": "08:13 · 微信通知已送达", "done": True},
                {"id": "t3", "title": "子女确认查看", "detail": "09:05 · 已查看", "done": True},
            ],
            suggestion="建议提醒老人或上门协助更换 SOS 按钮电池。",
            created_at=now,
            updated_at=now,
        ),
    ]
    db.add_all(alerts)

    work_orders = [
        WorkOrder(
            id="wo-sos-018",
            code="#SOS-018",
            elder_id="elder-001",
            alert_id="alert-sos-018",
            tab="urgent",
            icon="🚨",
            title="李奶奶 · SOS 求助触发",
            description="5 分钟前 · 卧室附近 · 子女已查看，社区待确认",
            tag="紧急",
            tag_tone="red",
            status="processing",
            created_at=now,
            updated_at=now,
        ),
        WorkOrder(
            id="wo-fall-026",
            code="#FALL-026",
            tab="urgent",
            icon="⚠",
            title="陈爷爷 · 跌倒风险告警",
            description="12 分钟前 · 客厅活动异常 · 建议电话回访",
            tag="高优先",
            tag_tone="warm",
            status="pending",
            created_at=now,
            updated_at=now,
        ),
        WorkOrder(
            id="wo-bp-041",
            code="#BP-041",
            tab="urgent",
            icon="❤️",
            title="张奶奶 · 血压连续偏高",
            description="28 分钟前 · 子女未响应 · 需要社区协助确认",
            tag="待回访",
            tag_tone="warm",
            status="pending",
            created_at=now,
            updated_at=now,
        ),
        WorkOrder(
            id="wo-bat-019",
            code="#BAT-019",
            elder_id="elder-001",
            tab="device",
            icon="🔋",
            title="李奶奶 · SOS 按钮低电量",
            description="今天 08:12 · 当前电量 23%，建议家属协助",
            tag="低电量",
            tag_tone="warm",
            status="pending",
            created_at=now,
            updated_at=now,
        ),
        WorkOrder(
            id="wo-med-160",
            code="#MED-160",
            tab="done",
            icon="✓",
            title="周奶奶 · 服药延迟提醒",
            description="今天 09:05 · 已联系子女确认，工单关闭",
            tag="已完成",
            tag_tone="green",
            status="resolved",
            created_at=now,
            updated_at=now,
        ),
    ]
    db.add_all(work_orders)
    db.commit()
    print("Seed completed")


def main() -> None:
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
