export type Contact = {
  id: string
  name: string
  relation: string
  onlineStatus: 'online' | 'busy' | 'offline'
  lastContactAt?: string
}

export type ElderProfile = {
  id: string
  name: string
  age: number
  locationLabel: string
  emergencyContacts: Contact[]
}

export type HealthMetric = {
  key: 'heartRate' | 'breathRate' | 'bloodPressure' | 'sleep' | 'medicine' | 'fallRisk'
  label: string
  value: string | number
  unit?: string
  status: 'normal' | 'warning' | 'danger'
  description: string
}

export type HealthMetricDetail = {
  key: HealthMetric['key']
  title: string
  icon: string
  headline: string
  advice: string
  trendLabel: string
  records: Array<{
    id: string
    time: string
    value: string
    status: 'normal' | 'warning' | 'danger'
  }>
}

export type DeviceStatus = {
  id: string
  name: string
  location: string
  online: boolean
  batteryPercent?: number
  status: 'normal' | 'warning' | 'offline'
}

export type SosState = 'confirm' | 'calling' | 'success' | 'cancel'

export type PrivacyPermission = {
  key: string
  title: string
  description: string
  enabled: boolean
}

export type MedicineReminder = {
  id: string
  name: string
  time: string
  dosage: string
  note: string
  status: 'done' | 'pending' | 'later'
}

export type CommunityActivity = {
  id: string
  title: string
  timeLabel: string
  location: string
  duration: string
  points: number
  description: string
}

export type YuanqiTask = {
  id: string
  icon: string
  title: string
  description: string
  points: number
  done: boolean
}
