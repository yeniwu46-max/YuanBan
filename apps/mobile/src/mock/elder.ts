import type {
  CommunityActivity,
  DeviceStatus,
  ElderProfile,
  HealthMetric,
  MedicineReminder,
  PrivacyPermission
} from '@/types/elder'

export const elderProfile: ElderProfile = {
  id: 'elder-001',
  name: '李奶奶',
  age: 72,
  locationLabel: '家中 · 客厅附近',
  emergencyContacts: [
    { id: 'c1', name: '女儿', relation: '女儿', onlineStatus: 'online', lastContactAt: '今天 12:20' },
    { id: 'c2', name: '儿子', relation: '儿子', onlineStatus: 'busy', lastContactAt: '昨天 19:10' },
    { id: 'c3', name: '老伴', relation: '老伴', onlineStatus: 'online', lastContactAt: '今天 08:30' }
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
  duration: '45 分',
  points: 20,
  description: '适合想活动筋骨、认识邻里的老人参加。'
}

export const yuanqiProgress = {
  points: 281,
  todayDone: 3,
  todayTotal: 4,
  mood: '安心'
}

