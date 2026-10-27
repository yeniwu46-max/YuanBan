<template>
  <AppPage :data-source="health.dataSource">
    <AppHeader title="用药提醒" back="/pages/service/index" compact />
    <view class="section">
      <view class="hero warm">
        <view class="between row-top">
          <view>
            <view class="pill medicine-pill">{{ currentMedicine?.time || '暂无安排' }}</view>
            <view class="medicine-name">{{ currentMedicine?.name || '用药计划' }}</view>
            <view class="muted medicine-dose">{{ currentMedicine?.dosage }} {{ currentMedicine?.note }}</view>

          </view>
          <view class="iconbox warm medicine-icon"><AppIcon name="药" /></view>
        </view>
      </view>
    </view>
    <view class="section">
      <view class="grid2">
        <BigButton tone="warm" :disabled="health.loading || !!health.error || !health.pendingMedicine" @click="health.markPendingMedicineDone(elderId)">我已服药</BigButton>
        <BigButton tone="white" :disabled="health.loading || !!health.error || !health.pendingMedicine" @click="health.delayPendingMedicine(elderId)">稍后提醒</BigButton>
      </view>
      <view v-if="health.medicineMessage" class="card feedback">{{ health.medicineMessage }}</view>
    </view>
    <view class="section-title">
      <view class="h2">今日药表</view>
      <button class="link" @click="health.playVoiceSummary('正在播报今日药表')">播报</button>
    </view>
    <view class="list">
      <ListItem
        v-for="medicine in health.medicines"
        :key="medicine.id"
        :icon="medicine.status === 'done' ? '成' : '药'"
        :icon-tone="medicine.status === 'pending' ? 'warm' : medicine.status === 'later' ? 'gray' : ''"
        :title="medicine.time"
        :desc="`${medicine.name} · ${medicine.dosage} · ${medicine.note}`"
        :tag="statusText(medicine.status)"
        :tag-tone="medicine.status === 'pending' ? 'warm' : medicine.status === 'later' ? 'gray' : 'normal'"
        :chev="false"
      />
    </view>
  </AppPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useElderContext } from '@/composables/useElderContext'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useHealthStore } from '@/stores/health'

const health = useHealthStore()
const { elderId } = useElderContext()
onShow(() => { void health.hydrate(elderId.value) })
const currentMedicine = computed(() => health.pendingMedicine || health.medicines[0])

function statusText(status: string) {
  if (status === 'done') return '已完成'
  if (status === 'pending') return '待服用'
  return '稍后提醒'
}
</script>

<style scoped>
.medicine-pill {
  color: var(--warm);
}

.medicine-name {
  margin-top: 16px;
  font-size: 28px;
  font-weight: 600;
}

.medicine-dose {
  margin-top: 8px;
  font-size: 17px;
  font-weight: 600;
}

.medicine-copy {
  margin-top: 8px;
  line-height: 1.5;
}

.medicine-icon {
  width: 84px;
  height: 84px;
  border-radius: 28px;
  font-size: 34px;
  font-weight: 600;
}

.medicine-grid {
  margin-top: 16px;
}

.mini-card {
  padding: 13px;
  text-align: center;
}

.feedback {
  margin-top: 12px;
  padding: 12px 14px;
  color: var(--primary);
  font-weight: 600;
}

.tip-title {
  font-size: 18px;
}

.tip-copy {
  margin-top: 6px;
  line-height: 1.45;
}
</style>
