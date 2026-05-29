<template>
  <view class="app-page">
    <AppHeader label="小鼋陪伴" title="鼋气罐" back="/pages/companion/index" compact />
    <view class="scroll-section">
      <view class="hero warm">
        <view class="between row-top">
          <view>
            <view class="pill">陪伴值 {{ companion.points }}</view>
            <view class="yuan-title">完成小任务，攒一点安心感。</view>
            <view class="muted yuan-copy">今天进度 {{ companion.todayDone }} / {{ companion.todayTotal }}</view>
          </view>
          <view class="iconbox warm yuan-icon">罐</view>
        </view>
        <view class="progress-wrap">
          <ProgressBar :value="companion.progressPercent" />
        </view>
      </view>
      <view class="section-title flush-title">
        <view class="h2">今日任务</view>
      </view>
      <view class="list flush">
        <view v-for="task in companion.tasks" :key="task.id" class="item">
          <view class="iconbox" :class="{ warm: !task.done }">{{ task.icon }}</view>
          <view class="item-main">
            <view class="item-title">{{ task.title }}</view>
            <view class="desc">{{ task.description }} · +{{ task.points }} 鼋气</view>
          </view>
          <BigButton v-if="!task.done" class="small-btn" tone="warm" @click="companion.completeTask(task.id)">完成</BigButton>
          <StatusTag v-else label="已完成" />
        </view>
      </view>
      <view v-if="companion.messageState" class="card feedback">{{ companion.messageState }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useCompanionStore } from '@/stores/companion'

const companion = useCompanionStore()
</script>

<style scoped>
.yuan-title {
  margin-top: 16px;
  font-size: 25px;
  line-height: 1.3;
  font-weight: 900;
}

.yuan-copy {
  margin-top: 8px;
}

.yuan-icon {
  width: 84px;
  height: 84px;
  border-radius: 28px;
  font-size: 34px;
  font-weight: 900;
}

.progress-wrap {
  margin-top: 18px;
}

.flush-title {
  padding: 0;
}

.small-btn {
  min-height: 48px;
  width: 76px;
  font-size: 16px;
}

.feedback {
  margin-top: 16px;
  padding: 12px 14px;
  color: #315943;
  font-weight: 900;
}
</style>
