import { defineStore } from 'pinia'
import { devices } from '@/mock/elder'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices
  }),
  getters: {
    onlineCount: (state) => state.devices.filter((item) => item.online).length,
    warningCount: (state) => state.devices.filter((item) => item.status === 'warning').length,
    lowBatteryDevice: (state) => state.devices.find((item) => item.batteryPercent !== undefined && item.batteryPercent < 30)
  }
})

