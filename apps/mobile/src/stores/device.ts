import { useApiMode } from '@/config/apiMode'
import { getPrimaryElderId } from '@/utils/authContext'
import { defineStore } from 'pinia'
import { getDevices, hydrateDevices } from '@/services/elderService'
import type { HydrateOptions } from '@/services/requestCache'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: useApiMode() ? [] as ReturnType<typeof getDevices> : getDevices(),
    dataSource: (useApiMode() ? 'unknown' : 'mock') as 'api' | 'mock' | 'unknown',
    error: '',
    loadedElderId: '',
    requestVersion: 0,
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
      this.error = ''
      const id = elderId ?? getPrimaryElderId()
      const version = ++this.requestVersion
      if (useApiMode() && this.loadedElderId !== id) { this.devices = []; this.dataSource = 'unknown' }
      try {
        const rows = await hydrateDevices(id, options)
        if (version !== this.requestVersion) return
        this.devices = rows
        this.loadedElderId = id
        this.dataSource = useApiMode() ? 'api' : 'mock'
      } catch {
        if (version !== this.requestVersion) return
        this.error = '设备更新失败'
        uni.showToast({ title: '设备加载失败', icon: 'none' })
      } finally {
        if (version === this.requestVersion) this.loading = false
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
