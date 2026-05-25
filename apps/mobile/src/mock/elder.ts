import type {
  CommunityActivity,
  DeviceStatus,
  ElderProfile,
  HealthMetric,
  HealthMetricDetail,
  MedicineReminder,
  PrivacyPermission,
  YuanqiTask
} from '@/types/elder'

export const elderProfile: ElderProfile = {
  id: 'elder-001',
  name: '李奶奶',
  age: 72,
  locationLabel: '家中 · 客厅附近',
  emergencyContacts: [
    { id: 'c1', name: '李女士', relation: '女儿', onlineStatus: 'online', lastContactAt: '今天 12:20' },
    { id: 'c2', name: '李先生', relation: '儿子', onlineStatus: 'busy', lastContactAt: '昨天 19:10' },
    { id: 'c3', name: '张阿姨', relation: '老伴', onlineStatus: 'online', lastContactAt: '今天 08:30' }
  ]
}

export const healthMetrics: HealthMetric[] = [
  { key: 'heartRate', label: '心率', value: 78, unit: '次/分', status: 'normal', description: '当前心跳平稳' },
  { key: 'breathRate', label: '呼吸', value: 17, unit: '次/分', status: 'normal', description: '呼吸节律稳定' },
  { key: 'medicine', label: '服药', value: 1, unit: '次待提醒', status: 'warning', description: '18:30 阿司匹林 1 片' },
  { key: 'sleep', label: '睡眠', value: 8, unit: '小时', status: 'normal', description: '昨晚睡眠质量不错' },
  { key: 'bloodPressure', label: '血压', value: '128/82', unit: 'mmHg', status: 'warning', description: '建议晚间再测一次' },
  { key: 'fallRisk', label: '跌倒风险', value: '低', status: 'normal', description: '今日活动平稳' }
]

export const healthMetricDetails: HealthMetricDetail[] = [
  {
    key: 'heartRate',
    title: '心率详情',
    icon: '心',
    headline: '今天心率整体平稳',
    advice: '继续保持正常活动，饭后散步时注意不要走得太急。',
    trendLabel: '近 6 次心率记录',
    records: [
      { id: 'hr-1', time: '08:00', value: '76 次/分', status: 'normal' },
      { id: 'hr-2', time: '10:30', value: '80 次/分', status: 'normal' },
      { id: 'hr-3', time: '13:20', value: '78 次/分', status: 'normal' }
    ]
  },
  {
    key: 'breathRate',
    title: '呼吸详情',
    icon: '息',
    headline: '呼吸节律稳定',
    advice: '当前呼吸频率正常，如有胸闷或气短可以立即联系家人。',
    trendLabel: '今日呼吸记录',
    records: [
      { id: 'br-1', time: '09:00', value: '17 次/分', status: 'normal' },
      { id: 'br-2', time: '12:00', value: '18 次/分', status: 'normal' },
      { id: 'br-3', time: '15:00', value: '17 次/分', status: 'normal' }
    ]
  },
  {
    key: 'sleep',
    title: '睡眠详情',
    icon: '眠',
    headline: '昨晚睡眠 8 小时',
    advice: '睡眠质量不错，建议午休控制在 30 分钟以内，晚上更容易入睡。',
    trendLabel: '近 3 晚睡眠',
    records: [
      { id: 'sl-1', time: '周一', value: '7.5 小时', status: 'normal' },
      { id: 'sl-2', time: '周二', value: '7.8 小时', status: 'normal' },
      { id: 'sl-3', time: '昨晚', value: '8 小时', status: 'normal' }
    ]
  },
  {
    key: 'fallRisk',
    title: '跌倒风险',
    icon: '稳',
    headline: '今日跌倒风险低',
    advice: '客厅活动正常。起夜时建议先坐稳再站起，床头 SOS 按钮保持在手边。',
    trendLabel: '安全监测记录',
    records: [
      { id: 'fr-1', time: '07:30', value: '起床平稳', status: 'normal' },
      { id: 'fr-2', time: '11:40', value: '客厅活动正常', status: 'normal' },
      { id: 'fr-3', time: '14:20', value: '午休后起身平稳', status: 'normal' }
    ]
  },
  {
    key: 'medicine',
    title: '服药详情',
    icon: '药',
    headline: '今晚还有 1 次服药',
    advice: '18:30 饭后服用阿司匹林 1 片，小鼋会按时提醒。',
    trendLabel: '今日服药记录',
    records: [
      { id: 'md-1', time: '08:00', value: '降压药已服用', status: 'normal' },
      { id: 'md-2', time: '18:30', value: '阿司匹林待服用', status: 'warning' }
    ]
  },
  {
    key: 'bloodPressure',
    title: '血压详情',
    icon: '压',
    headline: '血压略高，建议复测',
    advice: '晚饭少盐，睡前再测一次。如出现头晕胸闷，请联系家人。',
    trendLabel: '近 3 次血压',
    records: [
      { id: 'bp-1', time: '昨天 20:30', value: '124/80 mmHg', status: 'normal' },
      { id: 'bp-2', time: '今天 08:40', value: '128/82 mmHg', status: 'warning' }
    ]
  }
]

export const devices: DeviceStatus[] = [
  { id: 'd1', name: '小鼋主守护设备', location: '客厅', online: true, status: 'normal' },
  { id: 'd2', name: '毫米波雷达', location: '卧室', online: true, status: 'normal' },
  { id: 'd3', name: 'SOS 紧急按钮', location: '床头', online: true, batteryPercent: 23, status: 'warning' },
  { id: 'd4', name: '环境传感器', location: '客厅', online: true, status: 'normal' }
]

export const medicines: MedicineReminder[] = [
  { id: 'm1', name: '降压药', time: '08:00', dosage: '1 片', note: '早餐后服用', status: 'done' },
  { id: 'm2', name: '阿司匹林肠溶片', time: '18:30', dosage: '1 片', note: '饭后服用', status: 'pending' },
  { id: 'm3', name: '钙片', time: '21:00', dosage: '1 片', note: '睡前服用', status: 'later' }
]

export const privacyPermissions: PrivacyPermission[] = [
  { key: 'bedroomMonitor', title: '卧室安全监测', description: '仅识别跌倒、异常静止等安全状态', enabled: true },
  { key: 'familyReport', title: '家人查看健康报告', description: '允许家人查看心率、睡眠、血压等趋势', enabled: true },
  { key: 'sosLocation', title: 'SOS 时共享位置', description: '仅在紧急求助时发送位置', enabled: true }
]

export const communityActivity: CommunityActivity = {
  id: 'a1',
  title: '社区舒缓太极课',
  timeLabel: '今天 15:00',
  location: '社区服务中心二楼活动室',
  duration: '45 分钟',
  points: 20,
  description: '适合想活动筋骨、认识邻里的老人参加。'
}

export const yuanqiProgress = {
  points: 281,
  todayDone: 3,
  todayTotal: 4,
  mood: '安心'
}

export const yuanqiTasks: YuanqiTask[] = [
  { id: 'task-water', icon: '水', title: '喝一杯温水', description: '小口慢慢喝，补充水分', points: 5, done: true },
  { id: 'task-walk', icon: '步', title: '饭后慢走 10 分钟', description: '在家或楼下轻松走走', points: 10, done: true },
  { id: 'task-mood', icon: '心', title: '记录今天心情', description: '告诉小鼋今天感觉如何', points: 5, done: true },
  { id: 'task-family', icon: '家', title: '给家人报个平安', description: '发一句话或打个电话都可以', points: 10, done: false }
]
