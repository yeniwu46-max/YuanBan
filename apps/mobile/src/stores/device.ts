import { defineStore } from 'pinia'
import { getDevices } from '@/services/elderService'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: getDevices(),
    operationMessage: ''
  }),
  getters: {
    onlineCount: (state) => state.devices.filter((item) => item.online).length,
    warningCount: (state) => state.devices.filter((item) => item.status === 'warning').length,
    lowBatteryDevice: (state) => state.devices.find((item) => item.batteryPercent !== undefined && item.batteryPercent < 30),
    deviceById: (state) => (id: string) => state.devices.find((item) => item.id === id)
  },
  actions: {
    refreshDevice(id: string) {
      const target = this.devices.find((item) => item.id === id)
      this.operationMessage = target ? `${target.name}已同步到最新状态` : '设备状态已刷新'
    },
    requestBatteryHelp(id: string) {
      const target = this.devices.find((item) => item.id === id)
      this.operationMessage = target ? `已提醒家人处理${target.name}低电量` : '已提醒家人处理设备'
    }
  }
})
