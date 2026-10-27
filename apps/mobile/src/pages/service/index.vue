<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppHeader from '@/components/AppHeader.vue'
import AquaHero from '@/components/AquaHero.vue'
import ListItem from '@/components/ListItem.vue'
import { hydrateServiceSummary } from '@/services/elderService'
import { useHealthStore } from '@/stores/health'
import { useSessionStore } from '@/stores/session'
import { useApiMode } from '@/config/apiMode'
import { goDetail } from '@/utils/navigate'
const session = useSessionStore(), health = useHealthStore()
const summary = ref<Awaited<ReturnType<typeof hydrateServiceSummary>> | null>(null)
const loading = ref(false), error = ref('')
const pendingMedicine = computed(() => health.medicines.find(m => m.status === 'pending' || m.status === 'later'))
const medicineDesc = computed(() => pendingMedicine.value ? `${pendingMedicine.value.name} ${pendingMedicine.value.dosage} · ${pendingMedicine.value.time}` : health.medicines.length ? '今日用药已记录' : '暂无用药安排')
const activityParts = computed(() => (summary.value?.recentActivityLabel || '').split(' · '))
const activityTime = computed(() => activityParts.value.slice(1).join(' · '))
const deviceTag = computed(() => !summary.value?.totalDeviceCount ? '未获取' : summary.value.onlineDeviceCount === summary.value.totalDeviceCount ? '全部在线' : '有设备离线')
const deviceDesc = computed(() => summary.value?.totalDeviceCount ? `${summary.value.onlineDeviceCount}/${summary.value.totalDeviceCount} 在线` : '暂无设备数据')
let requestVersion = 0
async function load() {
  const version = ++requestVersion
  loading.value = true; error.value = ''; summary.value = null
  await health.hydrate(session.primaryElderId, { force:false })
  try {
    const result = await hydrateServiceSummary(session.primaryElderId, { force:false })
    if (version === requestVersion) summary.value = result
  } catch { if (version === requestVersion) error.value = '服务数据更新失败' }
  finally { if (version === requestVersion) loading.value = false }
}
onShow(load)
const go = (url:string) => goDetail(url)
</script>
<template>
  <AppPage :data-source="!useApiMode() ? 'mock' : summary ? 'api' : 'unknown'">
    <AppHeader title="服务中心" />
    <view class="section">
      <AquaHero title="今日安排" :state="pendingMedicine ? 'reminder' : 'greeting'">
        <view v-if="loading" class="agenda-note" role="status">正在更新…</view>
        <view v-else-if="error" class="agenda-note">{{ error }}</view>
        <template v-else>
          <button v-if="pendingMedicine" class="agenda-entry" @click="go('/pkg-elder-detail/medicine/index')">
            <text class="agenda-time">{{ pendingMedicine.time }}</text><text>用药提醒</text>
          </button>
          <button v-if="summary?.recentActivityLabel" class="agenda-entry" @click="go('/pkg-elder-detail/activity/index')">
            <text class="agenda-time">{{ activityTime || '活动' }}</text><text>{{ activityParts[0] }}</text>
          </button>
          <view v-if="!pendingMedicine && !summary?.recentActivityLabel" class="agenda-note">暂无安排</view>
        </template>
      </AquaHero>
    </view>
    <view v-if="error" class="section"><view class="feedback-panel"><button class="link" @click="load">重试更新</button></view></view>
    <view class="section-title"><view class="h2">常用服务</view></view>
    <view class="list">
      <ListItem icon="pill" icon-tone="warm" title="今日用药" :desc="medicineDesc" :tag="health.error ? '待更新' : pendingMedicine ? '待提醒' : health.medicines.length ? '已记录' : ''" :tag-tone="pendingMedicine ? 'warm' : 'normal'" @click="go('/pkg-elder-detail/medicine/index')" />
      <ListItem icon="calendar" title="社区活动" :desc="summary?.recentActivityLabel ? activityParts[0] : '暂无活动安排'" :tag="activityTime" @click="go('/pkg-elder-detail/activity/index')" />
      <ListItem icon="watch" title="设备状态" :desc="deviceDesc" :tag="deviceTag" :tag-tone="deviceTag === '全部在线' ? 'normal' : 'warm'" @click="go('/pkg-elder-detail/device/index')" />
      <ListItem icon="shield" title="隐私授权" @click="go('/pkg-elder-detail/privacy/index')" />
    </view>
  </AppPage>
</template>
<style scoped>
.agenda-entry { display:flex; flex-direction:column; align-items:flex-start; text-align:left; gap:2px; color:var(--hero-ink); min-height:56px; font-size:16px; padding:6px 0; }
.agenda-entry + .agenda-entry { margin-top:8px; }
.agenda-time { font-size:22px; color:white; font-weight:650; }
.agenda-note { font-size:16px; color:var(--hero-ink); }
</style>
