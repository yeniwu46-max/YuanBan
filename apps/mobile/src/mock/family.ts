import { elderProfile, healthMetrics } from '@/mock/elder'
import type {
  AlertEvent,
  AlbumPhoto,
  BoundElder,
  CareStats,
  CareTask,
  FamilyProfile,
  GuardSummary,
  HealthReportSummary,
  NotificationRule,
  RecommendedAction,
  ReportAnomaly
} from '@/types/family'

export const familyProfile: FamilyProfile = {
  id: 'family-001',
  name: '李女士',
  relation: '女儿',
  phone: '130 0000 0000',
  role: 'primary'
}

export const boundElders: BoundElder[] = [
  {
    id: elderProfile.id,
    name: elderProfile.name,
    age: elderProfile.age,
    locationLabel: elderProfile.locationLabel,
    online: true,
    guardScore: 92,
    healthScore: 89,
    deviceCount: 4,
    riskCount: 2,
    medicineDonePercent: 80,
    lastSyncLabel: '1 分钟前',
    activityLabel: '家中客厅活动正常',
    safetyStatus: 'safe',
    safetyHeadline: '李奶奶今日状态良好，守护设备正常运行。'
  },
  {
    id: 'elder-002',
    name: '王爷爷',
    age: 75,
    locationLabel: '家中 · 卧室休息',
    online: false,
    guardScore: 78,
    healthScore: 82,
    deviceCount: 3,
    riskCount: 1,
    medicineDonePercent: 100,
    lastSyncLabel: '35 分钟前',
    activityLabel: '设备离线，上次在卧室休息',
    safetyStatus: 'attention',
    safetyHeadline: '王爷爷设备离线，建议尽快确认状态。'
  }
]

export const guardSummaries: GuardSummary[] = boundElders.map((elder) => ({
  elderId: elder.id,
  guardScore: elder.guardScore,
  deviceCount: elder.deviceCount,
  riskCount: elder.riskCount,
  medicineDonePercent: elder.medicineDonePercent,
  lastSyncLabel: elder.lastSyncLabel,
  activityLabel: elder.activityLabel,
  safetyStatus: elder.safetyStatus,
  safetyHeadline: elder.safetyHeadline,
  companionSuggestion: elder.id === elderProfile.id
    ? '今天老人整体状态平稳，但血压略高。建议晚上发起一次简短视频，提醒少盐饮食。'
    : '设备离线较久，建议先电话确认老人是否在家，并检查网络连接。'
}))

export const alertEvents: AlertEvent[] = [
  {
    id: 'alert-001',
    elderId: elderProfile.id,
    type: 'bloodPressure',
    level: 'medium',
    icon: '💧',
    title: '血压轻微偏高',
    description: '今天 08:40 · 建议今晚提醒老人睡前复测',
    detail: '08:40 监测到血压 128/82 mmHg，建议睡前复测并减少盐分摄入。',
    timeLabel: '今天 08:40',
    status: 'pending',
    statusLabel: '待确认',
    tag: '需关注',
    tagTone: 'warm',
    timeline: [
      { id: 't1', title: '系统生成告警', detail: '08:40 · 血压轻微偏高', done: true },
      { id: 't2', title: '通知子女端', detail: '08:41 · 微信通知已送达', done: true },
      { id: 't3', title: '子女确认查看', detail: '等待确认处理', done: false, pending: true }
    ],
    suggestion: '建议先给老人打个电话，确认是否不舒服。若状态正常，可提醒晚饭少盐，并在睡前复测血压。'
  },
  {
    id: 'alert-002',
    elderId: elderProfile.id,
    type: 'deviceBattery',
    level: 'low',
    icon: '🔋',
    title: 'SOS 按钮电量偏低',
    description: '今天 08:12 · 当前电量 23%',
    detail: 'SOS 紧急按钮电量低于 25%，建议尽快更换电池。',
    timeLabel: '今天 08:12',
    status: 'viewed',
    statusLabel: '已查看',
    tag: '低电量',
    tagTone: 'warm',
    timeline: [
      { id: 't1', title: '系统生成提醒', detail: '08:12 · SOS 按钮电量 23%', done: true },
      { id: 't2', title: '通知子女端', detail: '08:13 · 微信通知已送达', done: true },
      { id: 't3', title: '子女确认查看', detail: '09:05 · 已查看', done: true }
    ],
    suggestion: '建议提醒老人或上门协助更换 SOS 按钮电池，避免紧急情况下无法使用。'
  },
  {
    id: 'alert-003',
    elderId: elderProfile.id,
    type: 'medicine',
    level: 'low',
    icon: '💊',
    title: '服药确认延后',
    description: '昨天 18:45 · 晚间服药晚确认 15 分钟',
    detail: '阿司匹林肠溶片原定 18:30 提醒，老人于 18:45 才确认服用。',
    timeLabel: '昨天 18:45',
    status: 'resolved',
    statusLabel: '已处理',
    tag: '已处理',
    tagTone: 'normal',
    timeline: [
      { id: 't1', title: '系统生成提醒', detail: '18:30 · 服药待确认', done: true },
      { id: 't2', title: '通知子女端', detail: '18:45 · 延迟确认', done: true },
      { id: 't3', title: '子女远程确认', detail: '19:02 · 已电话确认', done: true }
    ],
    suggestion: '老人已按时服药，可晚间视频时顺便确认是否有不适。'
  },
  {
    id: 'alert-004',
    elderId: 'elder-002',
    type: 'deviceOffline',
    level: 'medium',
    icon: '📶',
    title: '守护设备离线',
    description: '今天 07:20 · 已离线 35 分钟',
    detail: '客厅主守护设备失去连接，最后一次活动记录为卧室休息。',
    timeLabel: '今天 07:20',
    status: 'pending',
    statusLabel: '待确认',
    tag: '需关注',
    tagTone: 'warm',
    timeline: [
      { id: 't1', title: '系统检测到离线', detail: '07:20 · 设备断开连接', done: true },
      { id: 't2', title: '通知子女端', detail: '07:21 · 微信通知已送达', done: true },
      { id: 't3', title: '子女确认查看', detail: '等待确认处理', done: false, pending: true }
    ],
    suggestion: '建议立即电话确认老人是否在家，并检查路由器与设备电源。'
  }
]

export const healthReportSummaries: HealthReportSummary[] = [
  {
    elderId: elderProfile.id,
    period: 'weekly',
    healthScore: 89,
    headline: '李奶奶本周状态良好，血压有轻微波动。',
    summary: '睡眠较上周提升，未发生 SOS 或跌倒风险事件。',
    riskCount: 2,
    medicineDonePercent: 80,
    avgSleepHours: 7.8,
    deviceStatusLabel: '在线',
    yuanInterpretation:
      '本周老人整体状态稳定，血压有 2 次轻微偏高，建议继续关注晚间饮食与睡前复测习惯。',
    familyAdvice: '建议今晚发起一次 5 分钟视频，提醒老人少盐饮食，并确认睡前是否完成血压复测。',
    metrics: healthMetrics.filter((item) =>
      ['heartRate', 'breathRate', 'bloodPressure', 'sleep'].includes(item.key)
    )
  },
  {
    elderId: 'elder-002',
    period: 'weekly',
    healthScore: 82,
    headline: '王爷爷本周设备离线较多，活动数据不完整。',
    summary: '尚未同步完整睡眠与呼吸数据，建议先恢复设备在线。',
    riskCount: 1,
    medicineDonePercent: 100,
    avgSleepHours: 7.2,
    deviceStatusLabel: '离线',
    yuanInterpretation: '设备离线导致部分指标缺失，建议优先联系老人确认安全，并检查家庭网络。',
    familyAdvice: '建议先电话确认老人是否在家，必要时上门协助重启守护设备。',
    metrics: [
      { key: 'heartRate', label: '心率', value: '--', status: 'normal', description: '设备离线，暂无最新数据' },
      { key: 'breathRate', label: '呼吸', value: '--', status: 'normal', description: '设备离线，暂无最新数据' },
      { key: 'bloodPressure', label: '血压', value: '--', status: 'normal', description: '设备离线，暂无最新数据' },
      { key: 'sleep', label: '睡眠', value: 7.2, unit: '小时', status: 'normal', description: '基于昨日缓存数据' }
    ]
  }
]

/** @deprecated 使用 healthReportSummaries */
export const healthReportSummary = healthReportSummaries[0]

export const careStatsList: CareStats[] = [
  {
    elderId: elderProfile.id,
    companionPoints: 281,
    weeklyContacts: 4,
    albumUpdates: 3,
    headline: '李奶奶今天状态平稳，适合发一段轻松问候。',
    suggestion: '小鼋建议晚上 19:30 后视频 5 分钟，顺便提醒少盐饮食。',
    generatedGreeting:
      '“妈，今天身体状态挺平稳的。晚上吃清淡一点，饭后慢慢走一会儿，睡前记得再测一下血压。我晚点和你视频。”',
    doneCount: 2,
    totalCount: 4
  },
  {
    elderId: 'elder-002',
    companionPoints: 156,
    weeklyContacts: 1,
    albumUpdates: 0,
    headline: '王爷爷设备离线，建议先电话确认安全。',
    suggestion: '恢复设备在线后，再安排一次视频关怀。',
    generatedGreeting: '“爸，刚才看到设备离线了，您在家吗？我打个电话确认一下，别担心。”',
    doneCount: 0,
    totalCount: 2
  }
]

/** @deprecated 使用 careStatsList */
export const careStats = careStatsList[0]

export const careTasks: CareTask[] = [
  {
    id: 'task-1',
    elderId: elderProfile.id,
    icon: '✓',
    title: '查看今日状态',
    description: '已查看守护首页',
    status: 'done'
  },
  {
    id: 'task-2',
    elderId: elderProfile.id,
    icon: '📹',
    iconTone: 'warm',
    title: '今晚视频 5 分钟',
    description: '建议 19:30 后发起',
    status: 'pending'
  },
  {
    id: 'task-3',
    elderId: elderProfile.id,
    icon: '📷',
    title: '上传 1 张家庭照片',
    description: '让老人端相册更新',
    status: 'pending'
  },
  {
    id: 'task-4',
    elderId: elderProfile.id,
    icon: '💬',
    title: '发送关怀问候',
    description: '使用小鼋生成的问候语',
    status: 'pending'
  },
  {
    id: 'task-5',
    elderId: 'elder-002',
    icon: '☎',
    iconTone: 'warm',
    title: '电话确认是否在家',
    description: '设备离线后优先确认安全',
    status: 'pending'
  },
  {
    id: 'task-6',
    elderId: 'elder-002',
    icon: '📶',
    title: '协助恢复设备在线',
    description: '检查网络与设备电源',
    status: 'pending'
  }
]

export const albumPhotos: AlbumPhoto[] = [
  { id: 'p1', emoji: '🎂', label: '孙女生日' },
  { id: 'p2', emoji: '🌳', label: '公园散步' },
  { id: 'p3', emoji: '🍲', label: '家庭聚餐' }
]

export const reportAnomalies: ReportAnomaly[] = [
  {
    id: 'ra-1',
    elderId: elderProfile.id,
    icon: '💧',
    iconTone: 'warm',
    title: '血压轻微偏高 2 次',
    description: '周三、今天各出现 1 次，建议继续复测',
    tag: '需关注',
    tagTone: 'warm',
    alertId: 'alert-001'
  },
  {
    id: 'ra-2',
    elderId: elderProfile.id,
    icon: '⏰',
    title: '服药延后确认 1 次',
    description: '昨天 18:45 晚间服药延后 15 分钟',
    tag: '已处理',
    tagTone: 'normal',
    alertId: 'alert-003'
  }
]

export const recommendedActions: RecommendedAction[] = [
  {
    id: 'rec-1',
    icon: '☎',
    title: '电话确认老人状态',
    description: '询问是否头晕、胸闷或不适'
  },
  {
    id: 'rec-2',
    icon: '💬',
    title: '发送少盐与复测提醒',
    description: '让小鼋用温和语气提醒老人'
  },
  {
    id: 'rec-3',
    icon: '🏢',
    iconTone: 'warm',
    title: '必要时联系社区',
    description: '如老人无人回应，可请求社区协助'
  }
]

export const notificationRules: NotificationRule[] = [
  {
    key: 'sosFall',
    icon: '🚨',
    iconTone: 'warm',
    title: 'SOS / 跌倒立即通知',
    description: '紧急事件会强提醒并尝试电话通知',
    enabled: true
  },
  {
    key: 'dailySummary',
    icon: '❤️',
    title: '每日健康摘要',
    description: '每天 20:00 推送老人健康简报',
    enabled: true
  },
  {
    key: 'medicineDelay',
    icon: '💊',
    title: '服药延迟提醒',
    description: '超过提醒时间未确认时通知你',
    enabled: true
  }
]
