<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import YuanMascot from '@/components/YuanMascot.vue'
import HealthMetricCard from '@/components/HealthMetricCard.vue'
import BigButton from '@/components/BigButton.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useElderContext } from '@/composables/useElderContext'
import { useElderStore } from '@/stores/elder'
import { useHealthStore } from '@/stores/health'
import AquaHero from '@/components/AquaHero.vue'
import { goRoute } from '@/utils/navigate'
const elder = useElderStore(),
  health = useHealthStore()
const { elderId } = useElderContext()
const greeting = computed(() => {
  const hour = new Date().getHours()
  return hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'
})
const metrics = computed(() =>
  health.metrics.filter((m) =>
    ['heartRate', 'bloodPressure', 'sleep', 'breathRate'].includes(m.key),
  ),
)
const attention = computed(
  () => health.metrics.filter((m) => m.status !== 'normal' && m.key !== 'medicine').length,
)
onShow(() => {
  void Promise.all([
    elder.hydrate(elderId.value, { force: false }),
    health.hydrate(elderId.value, { force: false }),
  ])
})
function openMetric(key: string) {
  goRoute(
    key === 'bloodPressure'
      ? '/pkg-elder-detail/bp/index'
      : `/pkg-elder-detail/health-metric/index?key=${key}`,
  )
}
</script>
<template>
  <AppPage class="aqua-home" :data-source="health.dataSource">
    <view class="header">
      <view class="item-main">
        <view class="label">{{ greeting }}</view>
        <view class="h1">{{ elder.profile.name }}</view>
      </view>
      <button class="iconbtn" aria-label="查看我的设备" @click="goRoute('/pkg-elder-detail/device/index')"><AppIcon name="shield" /></button>
    </view>
    <view class="section home-hero-section">
      <AquaHero :title="health.summaryTitle" :state="attention ? 'reminder' : 'greeting'">
        <view class="home-hero-label"><AppIcon name="shield" :size="18" />小鼋守护</view>
        <button class="hero-detail" @click="goRoute('/pages/health/index')">查看健康<AppIcon name="chevron" :size="18" /></button>
      </AquaHero>
    </view>
    <view class="section home-actions">
      <BigButton tone="red" @click="goRoute('/pkg-elder-detail/sos/index')"><AppIcon name="siren" />紧急求助</BigButton>
      <BigButton tone="white" @click="goRoute('/pkg-elder-detail/family/index')"><AppIcon name="phone" />联系家人</BigButton>
    </view>
    <view class="section-title">
      <view class="h2">今日健康</view>
      <button class="link" @click="goRoute('/pages/health/index')">全部<AppIcon name="chevron" :size="18" /></button>
    </view>
    <view class="section compact">
      <view v-if="health.loading" class="feedback-panel" role="status">正在更新…</view>
      <view v-else-if="!metrics.length" class="feedback-panel">暂无健康数据</view>
      <view v-else class="grid2">
        <HealthMetricCard v-for="metric in metrics" :key="metric.key" :metric="metric" :icon="metric.key" @click="openMetric(metric.key)" />
      </view>
    </view>
    <view class="section">
      <button class="medicine-reminder" @click="goRoute('/pkg-elder-detail/medicine/index')">
        <view class="iconbox warm"><AppIcon name="pill" /></view>
        <view class="item-main">
          <view class="item-title">今日用药</view>
          <view class="desc">{{ health.pendingMedicine ? health.pendingMedicine.time + ' · ' + health.pendingMedicine.name : health.medicines.length ? '已记录' : '暂无用药安排' }}</view>
        </view>
        <AppIcon name="chevron" />
      </button>
    </view>
    <view class="section">
      <button class="companion-invite" @click="goRoute('/pages/companion/index')">
        <YuanMascot size="normal" state="caring" />
        <view class="item-main"><view class="h2">小鼋陪伴</view><view class="desc">聊一聊</view></view>
        <AppIcon name="arrow" />
      </button>
    </view>
  </AppPage>
</template>
<style scoped lang="scss">
.home-hero-section { margin-top: 8px; }
.home-hero-label { display:flex; align-items:center; gap:8px; font-size:16px; color:var(--hero-ink); }
.hero-detail { display:flex; align-items:center; gap:4px; margin-top:14px; min-height:48px; color:white; font-size:16px; }
.home-actions { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px; }
.compact { margin-top:0; }
.medicine-reminder, .companion-invite { display:flex; align-items:center; gap:12px; text-align:left; width:100%; padding:18px; border-radius:20px; background:white; border:1px solid var(--line); box-shadow:var(--shadow); }
.medicine-reminder { background:var(--warm-soft); border-color:#ebdec4; }
.companion-invite :deep(.yuan-mascot) { width:84px; height:92px; }
@media(max-width:359px) { .home-actions { gap:8px; } .home-actions :deep(.wd-button) { padding:14px 6px!important; font-size:18px!important; } }
</style>
