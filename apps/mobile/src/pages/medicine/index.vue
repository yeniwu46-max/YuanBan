<template>
  <view class="app-page">
    <AppHeader label="生活帮手" title="用药提醒" back="/pages/service/index" compact />
    <view class="section">
      <view class="hero warm">
        <view class="between row-top">
          <view>
            <view class="pill medicine-pill">今晚 18:30 服药</view>
            <view class="medicine-name">阿司匹林肠溶片</view>
            <view class="muted medicine-dose">每次 1 片 · 饭后服用</view>
            <view class="muted medicine-copy">小鼋会在时间到时提醒您，也会同步让家人放心。</view>
          </view>
          <view class="iconbox warm medicine-icon">药</view>
        </view>
        <view class="grid3 medicine-grid">
          <view class="card mini-card"><view class="muted">剂量</view><view class="h2">1 片</view></view>
          <view class="card mini-card"><view class="muted">时间</view><view class="h2">18:30</view></view>
          <view class="card mini-card"><view class="muted">周期</view><view class="h2">每日</view></view>
        </view>
      </view>
    </view>
    <view class="section">
      <view class="grid2">
        <BigButton tone="warm" @click="health.markPendingMedicineDone()">我已服药</BigButton>
        <BigButton tone="white" @click="health.delayPendingMedicine()">稍后提醒</BigButton>
      </view>
      <view v-if="health.medicineMessage" class="card feedback">{{ health.medicineMessage }}</view>
    </view>
    <view class="section">
      <view class="hero gray">
        <view class="row row-top">
          <YuanMascot size="small" />
          <view>
            <view class="h2 tip-title">小鼋提醒您</view>
            <view class="muted tip-copy">这颗药建议饭后服用。服药后可以喝一点温水，不要空腹吃。</view>
          </view>
        </view>
      </view>
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
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useHealthStore } from '@/stores/health'

const health = useHealthStore()

function statusText(status: string) {
  if (status === 'done') return '已完成'
  if (status === 'pending') return '待服用'
  return '稍后提醒'
}
</script>

<style scoped>
.medicine-pill {
  color: #c9822c;
}

.medicine-name {
  margin-top: 16px;
  font-size: 28px;
  font-weight: 900;
}

.medicine-dose {
  margin-top: 8px;
  font-size: 17px;
  font-weight: 800;
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
  font-weight: 900;
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
  color: #315943;
  font-weight: 900;
}

.tip-title {
  font-size: 18px;
}

.tip-copy {
  margin-top: 6px;
  line-height: 1.45;
}
</style>
