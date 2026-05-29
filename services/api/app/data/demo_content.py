"""演示用静态配置，供 family / community 读接口使用。"""

CARE_TASKS = [
    {
        "id": "care-1",
        "elder_id": "elder-001",
        "icon": "📞",
        "title": "电话问候",
        "description": "今天还没联系，建议 10 分钟内拨个电话。",
        "status": "pending",
        "due_label": "建议 10:30 前",
    },
    {
        "id": "care-2",
        "elder_id": "elder-001",
        "icon": "💊",
        "title": "提醒晚间用药",
        "description": "阿司匹林 1 片 · 18:30",
        "status": "pending",
        "due_label": "18:30",
    },
    {
        "id": "care-3",
        "elder_id": "elder-001",
        "icon": "📷",
        "title": "分享今日照片",
        "description": "上传 1 张生活照，让小鼋带给老人看看。",
        "status": "done",
        "due_label": "已完成",
    },
]

CARE_STATS = {
    "elder-001": {
        "done_count": 2,
        "total_count": 5,
        "greeting": "今天适合主动问候一下妈妈，她昨晚睡得不错。",
        "album_count": 12,
    }
}

NOTIFICATION_RULES = [
    {"key": "sos", "label": "SOS 紧急告警", "description": "立即推送并短信通知", "enabled": True},
    {"key": "vitals", "label": "体征异常", "description": "血压、心率异常时提醒", "enabled": True},
    {"key": "device", "label": "设备离线/低电", "description": "设备异常时提醒", "enabled": True},
    {"key": "daily", "label": "每日简报", "description": "每晚 20:00 发送健康摘要", "enabled": False},
]

COMMUNITY_ACTIVITIES = [
    {
        "id": "act-001",
        "title": "舒缓太极课",
        "time_label": "今天 15:00",
        "location": "社区活动室",
        "enrolled": 18,
        "pending_check_in": 3,
        "status_label": "进行中",
        "status_tone": "warm",
    },
    {
        "id": "act-002",
        "title": "健康讲座 · 春季防跌倒",
        "time_label": "明天 09:30",
        "location": "社区服务站",
        "enrolled": 24,
        "pending_check_in": 0,
        "status_label": "报名中",
        "status_tone": "normal",
    },
]

MEDICINES = [
    {"id": "med-1", "name": "阿司匹林", "dose": "1 片", "schedule": "晚间 18:30", "status": "pending"},
    {"id": "med-2", "name": "降压药", "dose": "1 片", "schedule": "早晨 08:00", "status": "done"},
]

COMPANION_STATE: dict[str, dict] = {
    "elder-001": {"mood": "平稳", "companion_score": 78, "speak_hint": "今天记得多喝水，晚饭后可以散步。"},
}
