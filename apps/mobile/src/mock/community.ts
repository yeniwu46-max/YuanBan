import { elderProfile, healthMetrics } from '@/mock/elder'
import type {
  ActivityOverview,
  CheckInRecord,
  CommunityActivityItem,
  CommunitySite,
  DashboardStats,
  ElderServiceProfile,
  FocusElderItem,
  OpsMetric,
  StaffDuty,
  TagTone,
  TodayActivityCard,
  UrgentWorkItem,
  WorkOrder,
  WorkOrderDetail,
  WorkOrderTab
} from '@/types/community'

export const communitySite: CommunitySite = {
  id: 'site-001',
  name: '椿木营社区站',
  dutyStaff: '王社工',
  deviceOnlineRate: 96,
  serviceStatusLabel: '服务响应正常'
}

export const dashboardStats: DashboardStats = {
  pendingCount: 8,
  urgentCount: 2,
  visitCount: 3,
  activityCount: 1,
  doneCount: 10,
  totalCount: 18
}

export const opsMetrics: OpsMetric[] = [
  { key: 'alerts', icon: '⚠', iconTone: 'warm', title: '异常告警', value: '6', statusLabel: '今日累计', statusTone: 'warm' },
  { key: 'elders', icon: '👥', title: '服务老人', value: '128', statusLabel: '当前覆盖' },
  { key: 'devices', icon: '📡', title: '设备在线率', value: '96%', statusLabel: '运行稳定' },
  { key: 'survey', icon: '💚', title: '满意回访', value: '24', statusLabel: '本周完成' }
]

export const urgentWorkItems: UrgentWorkItem[] = [
  {
    id: 'wo-sos-018',
    icon: '🚨',
    iconTone: 'red',
    title: '李奶奶 · SOS 求助触发',
    description: '5 分钟前 · 家中卧室 · 已通知子女，待社区确认',
    tag: '紧急',
    tagTone: 'red'
  },
  {
    id: 'wo-fall-026',
    icon: '⚠',
    iconTone: 'warm',
    title: '陈爷爷 · 跌倒风险告警',
    description: '12 分钟前 · 客厅活动异常 · 建议尽快回访',
    tag: '高优先',
    tagTone: 'warm'
  }
]

export const focusElders: FocusElderItem[] = [
  {
    elderId: elderProfile.id,
    icon: '👤',
    iconTone: 'red',
    name: '李奶奶',
    description: 'SOS 求助处理中 · 子女已响应 · 社区待回拨'
  },
  {
    elderId: 'elder-003',
    icon: '👤',
    iconTone: 'warm',
    name: '陈爷爷',
    description: '跌倒风险待确认 · 客厅活动异常'
  }
]

export const todayActivityCard: TodayActivityCard = {
  id: 'act-taiji',
  title: '银龄太极体验课',
  timeLabel: '下午 16:30',
  location: '社区活动室',
  enrolled: 18,
  pendingCheckIn: 6,
  statusLabel: '进行中',
  statusTone: 'warm'
}

const orderRows: [WorkOrderTab, string, string, string, string, string, TagTone, string][] = [
  ['urgent', 'wo-sos-018', '🚨', '李奶奶 · SOS 求助触发', '5 分钟前 · 卧室附近 · 子女已查看，社区待确认', '紧急', 'red', '#SOS-018'],
  ['urgent', 'wo-fall-026', '⚠', '陈爷爷 · 跌倒风险告警', '12 分钟前 · 客厅活动异常 · 建议电话回访', '高优先', 'warm', '#FALL-026'],
  ['urgent', 'wo-bp-041', '❤️', '张奶奶 · 血压连续偏高', '28 分钟前 · 子女未响应 · 需要社区协助确认', '待回访', 'warm', '#BP-041'],
  ['visit', 'wo-visit-112', '🏠', '王爷爷 · 上门看护申请', '今天 16:00 · 协助检查服药与居家设备', '待上门', 'green', '#VISIT-112'],
  ['visit', 'wo-care-088', '🩺', '张奶奶 · 慢病健康回访', '今天 15:30 · 血压复查与饮食建议记录', '待回访', 'green', '#CARE-088'],
  ['visit', 'wo-fam-067', '👥', '刘奶奶 · 家属协同沟通', '明天 10:00 · 子女申请社区电话说明服务方案', '已预约', 'green', '#FAM-067'],
  ['device', 'wo-dev-230', '📡', '刘奶奶 · 主设备离线', '今天 11:20 · 客厅主设备 15 分钟未同步', '待巡检', 'warm', '#DEV-230'],
  ['device', 'wo-bat-019', '🔋', '李奶奶 · SOS 按钮低电量', '今天 08:12 · 当前电量 23%，建议家属协助', '低电量', 'warm', '#BAT-019'],
  ['device', 'wo-radar-052', '📈', '赵爷爷 · 设备数据波动', '昨天 20:40 · 毫米波设备需重新校准位置', '待校准', 'green', '#RADAR-052'],
  ['done', 'wo-med-160', '✓', '周奶奶 · 服药延迟提醒', '今天 09:05 · 已联系子女确认，工单关闭', '已完成', 'green', '#MED-160'],
  ['done', 'wo-file-044', '▤', '赵爷爷 · 健康档案补录', '昨天 18:20 · 已补录月度服务记录', '已归档', 'green', '#FILE-044']
]

function mapOrder(row: typeof orderRows[number]): WorkOrder {
  const elderId = row[3].includes('李奶奶') ? elderProfile.id : undefined
  return {
    id: row[1],
    code: row[7],
    tab: row[0],
    icon: row[2],
    iconTone: row[6] as WorkOrder['iconTone'],
    title: row[3],
    description: row[4],
    tag: row[5],
    tagTone: row[6] as WorkOrder['tagTone'],
    elderId,
    status: row[0] === 'done' ? 'resolved' : 'pending'
  }
}

export const workOrders: WorkOrder[] = orderRows.map(mapOrder)

export const workorderPoolStats: DashboardStats = {
  pendingCount: 12,
  urgentCount: 3,
  visitCount: 4,
  activityCount: 0,
  doneCount: 10,
  totalCount: 18
}

export const staffDuties: StaffDuty[] = [
  { id: 'staff-1', name: '王社工', workload: '当前处理：SOS 2 项，上门 1 项', statusLabel: '忙碌', statusTone: 'warm' },
  { id: 'staff-2', name: '陈社工', workload: '当前处理：设备巡检 2 项', statusLabel: '正常', statusTone: 'normal' }
]

export const activityOverview: ActivityOverview = {
  todayCount: 3,
  totalEnrolled: 42,
  inProgressCount: 1,
  pendingCheckInCount: 14,
  endedCount: 1,
  checkInTotal: 28,
  pointsLabel: '+560'
}

export const communityActivities: CommunityActivityItem[] = [
  {
    id: 'act-taiji',
    icon: '☯',
    iconTone: 'warm',
    title: '银龄太极体验课',
    description: '今日 16:30 · 活动室 · 已签到 12/18',
    tag: '进行中',
    tagTone: 'warm',
    enrolled: 18,
    checkedIn: 12,
    pendingCheckIn: 6
  },
  {
    id: 'act-lecture',
    icon: '❤️',
    title: '高血压健康讲座',
    description: '今日 19:00 · 二楼会议室 · 报名 16 人',
    tag: '待开始',
    tagTone: 'normal',
    enrolled: 16
  },
  {
    id: 'act-phone',
    icon: '💚',
    title: '银发智能手机课堂',
    description: '明日 10:00 · 志愿者 3 人 · 报名 21 人',
    tag: '招募中',
    tagTone: 'normal',
    enrolled: 21
  }
]

export const checkInRecords: CheckInRecord[] = [
  { id: 'ci-1', elderName: '李奶奶', detail: '子女已知情 · 参与后鼋气罐 +20', tag: '已签到', tagTone: 'normal' },
  { id: 'ci-2', elderName: '张奶奶', detail: '血压偏高，建议轻量参与', tag: '待确认', tagTone: 'warm' }
]

export const elderServiceProfile: ElderServiceProfile = {
  elderId: elderProfile.id,
  name: elderProfile.name,
  age: elderProfile.age,
  address: '椿木营社区 3 栋 2 单元 401',
  tags: [
    { label: '独居老人', tone: 'normal' },
    { label: '高血压', tone: 'warm' },
    { label: '重点关注', tone: 'warm' },
    { label: '设备在线', tone: 'normal' }
  ],
  healthScore: 89,
  alertCount: 3,
  serviceCount: 12,
  activityCount: 8,
  metrics: healthMetrics.filter((m) => ['heartRate', 'bloodPressure', 'sleep', 'fallRisk'].includes(m.key)),
  riskRecords: [
    {
      id: 'risk-1',
      icon: '⚠',
      iconTone: 'warm',
      title: '血压轻微偏高 2 次',
      description: '最近一次：今天 08:40 · 已提醒子女关注晚间复测',
      tag: '需关注',
      tagTone: 'warm',
      workOrderId: 'wo-bp-041'
    },
    {
      id: 'risk-2',
      icon: '🚨',
      iconTone: 'normal',
      title: 'SOS 误触 1 次',
      description: '5 月 20 日 · 电话确认安全，无需上门',
      tag: '已处理',
      tagTone: 'normal'
    }
  ],
  serviceRecords: [
    { id: 'sr-1', icon: '✓', title: '电话回访', detail: '今天 09:10 · 确认老人状态稳定，提醒今晚复测血压' },
    { id: 'sr-2', icon: '🏠', title: '上门设备检查', detail: '5 月 18 日 · 处理 SOS 按钮低电量问题' },
    { id: 'sr-3', icon: '🩺', title: '慢病健康回访', detail: '5 月 15 日 · 记录高血压用药及饮食建议' }
  ],
  contacts: [
    { id: 'fc-1', name: '女儿', role: '主要联系人 · 告警优先通知', iconTone: 'warm', actionLabel: '联系', actionTone: 'warm' },
    { id: 'fc-2', name: '王社工', role: '社区责任人 · 健康回访与上门服务', actionLabel: '内部', actionTone: 'green' }
  ],
  participation: { activityLabel: '本月参与 3 次', pointsLabel: '当前 281 分' },
  yuanSuggestion: '建议继续维持每周一次健康回访，并鼓励李奶奶持续参加低强度社区活动。'
}

export const sosWorkOrderDetail: WorkOrderDetail = {
  id: 'wo-sos-018',
  code: '#SOS-018',
  type: 'sos',
  priority: '紧急',
  priorityTone: 'warm',
  elapsedLabel: '5分',
  statusLabel: '处理中',
  statusTone: 'warm',
  headline: '李奶奶触发 SOS，社区需确认现场情况。',
  description: '09:18 由老人端 SOS 按钮触发，子女端已收到通知，社区端需要协同响应。',
  elderId: elderProfile.id,
  elderName: elderProfile.name,
  elderAge: elderProfile.age,
  elderTags: ['独居老人', '重点关注'],
  location: '椿木营社区 3 栋 2 单元 401 · 卧室附近',
  triggerTime: '今天 09:18',
  triggerDetail: '老人端 SOS 按钮主动触发',
  liveMetrics: [
    { key: 'hr', icon: '❤️', iconTone: 'warm', label: '心率', value: '84', unit: '次/分', status: '略快', statusTone: 'warm' },
    { key: 'br', icon: '🌬️', label: '呼吸', value: '19', unit: '次/分', status: '稳定' },
    { key: 'act', icon: '📡', iconTone: 'warm', label: '活动状态', value: '静止', status: '需确认', statusTone: 'warm' },
    { key: 'dev', icon: '📶', label: '设备', value: '在线', status: '刚刚同步' }
  ],
  mapAddress: '3 栋 2 单元 401',
  mapDistance: '距社区站约 420 米',
  timeline: [
    { id: 't1', title: '老人端触发 SOS', detail: '09:18 · 床头 SOS 按钮触发', done: true },
    { id: 't2', title: '子女端收到通知', detail: '09:18 · 女儿已查看告警', done: true },
    { id: 't3', title: '电话 / 上门确认', detail: '等待社区人员确认现场情况', done: false, pending: true }
  ],
  suggestion: '建议先电话确认老人是否清醒、是否有胸闷头晕。若 2 分钟内无人接听，请立即安排上门查看。',
  resultOptions: [
    { id: 'r1', icon: '✓', title: '老人安全，误触 SOS', description: '已电话确认，无需上门' },
    { id: 'r2', icon: '🏠', title: '已安排上门查看', description: '社区人员正在前往老人住所' }
  ],
  finishedHeadline: '本次 SOS 工单已闭环。',
  finishedDescription: '已记录：电话确认老人安全，并同步处理结果给子女。'
}

export function getWorkOrdersByTab(tab: WorkOrderTab, orders: WorkOrder[]) {
  return orders.filter((o) => o.tab === tab)
}

export function cloneWorkOrders(orders: WorkOrder[]) {
  return orders.map((o) => ({ ...o }))
}
