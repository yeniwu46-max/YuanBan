import { defineStore } from 'pinia'
import { getDevices, hydrateDevices } from '@/services/elderService'
import type { HydrateOptions } from '@/services/requestCache'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: getDevices(),
    operationMessage: '',
    loading: false
  }),
  getters: {
    onlineCount: (state) => state.devices.filter((item) => item.online).length,
    warningCount: (state) => state.devices.filter((item) => item.status === 'warning').length,
    lowBatteryDevice: (state) => state.devices.find((item) => item.batteryPercent !== undefined && item.batteryPercent < 30),
    deviceById: (state) => (id: string) => state.devices.find((item) => item.id === id)
  },
  actions: {
    async hydrate(elderId?: string, options: HydrateOptions = {}) {
      this.loading = true
      try {
        this.devices = await hydrateDevices(elderId, options)
      } catch {
        uni.showToast({ title: '设备加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
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
