<template>
  <view class="app-page">
    <AppHeader label="生活帮手" title="服务中心" />
    <view class="section">
      <view class="hero warm">
        <view class="between row-top">
          <view>
            <view class="pill service-pill">今日服务提醒</view>
            <view class="service-copy text-balance">{{ summaryCopy }}</view>
            <view class="muted service-desc text-keep-all">小鼋会帮您记着，也可以通知家人陪同。</view>
          </view>
          <view class="iconbox warm service-icon">药</view>
        </view>
      </view>
    </view>
    <view class="section-title">
      <view class="h2">常用服务</view>
    </view>
    <view class="list">
      <ListItem icon="药" icon-tone="warm" :title="medicineTitle" :desc="medicineDesc" tag="待提醒" tag-tone="warm" @click="go('/pkg-elder-detail/medicine/index')" />
      <ListItem icon="动" title="社区活动" :desc="activityDesc" tag="今天 15:00" @click="go('/pkg-elder-detail/activity/index')" />
      <ListItem icon="设" title="设备状态" :desc="deviceDesc" :tag="deviceTag" @click="go('/pkg-elder-detail/device/index')" />
      <ListItem icon="隐" title="隐私授权" desc="查看家人和社区可见范围" tag="可管理" @click="go('/pkg-elder-detail/privacy/index')" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppHeader from '@/components/AppHeader.vue'
import ListItem from '@/components/ListItem.vue'
import { hydrateServiceSummary } from '@/services/elderService'
import { useHealthStore } from '@/stores/health'
import { useSessionStore } from '@/stores/session'
import { goDetail } from '@/utils/navigate'

const session = useSessionStore()
const health = useHealthStore()
const summary = ref({
  abnormalMetricCount: 0,
  onlineDeviceCount: 0,
  totalDeviceCount: 0,
  recentActivityLabel: '舒缓太极课 · 今天 15:00',
  companionMood: '平稳',
  companionScore: 78
})

const pendingMedicine = computed(() => health.medicines.find((m) => m.status === 'pending'))
const summaryCopy = computed(() => {
  const med = pendingMedicine.value
  const parts = []
  if (med) parts.push(`今晚 ${med.time} 有一次服药提醒`)
  if (summary.value.recentActivityLabel) parts.push('下午有社区活动')
  return parts.length ? `${parts.join('，')}。` : '今天暂无特别提醒，状态平稳。'
})
const medicineTitle = computed(() => (pendingMedicine.value ? '今日用药' : '用药计划'))
const medicineDesc = computed(() =>
  pendingMedicine.value ? `${pendingMedicine.value.name} ${pendingMedicine.value.dosage} · ${pendingMedicine.value.time}` : '今日用药已完成'
)
const activityDesc = computed(() => summary.value.recentActivityLabel.split(' · ')[0] ?? '社区活动')
const deviceDesc = computed(() =>
  summary.value.totalDeviceCount
    ? `监测设备 ${summary.value.onlineDeviceCount}/${summary.value.totalDeviceCount} 在线`
    : '监测设备在线，环境正常'
)
const deviceTag = computed(() => (summary.value.abnormalMetricCount ? '需关注' : '运行正常'))

onShow(async () => {
  await health.hydrate(session.primaryElderId, { force: false })
  summary.value = await hydrateServiceSummary(session.primaryElderId, { force: false })
})

function go(url: string) {
  goDetail(url)
}
</script>

<style scoped>
.service-pill {
  color: #8b6a33;
}

.service-copy {
  margin-top: 15px;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 900;
}

.service-desc {
  margin-top: 8px;
  line-height: 1.45;
}

.service-icon {
  width: 84px;
  height: 84px;
  border-radius: 28px;
  font-size: 34px;
  font-weight: 900;
}
</style>
