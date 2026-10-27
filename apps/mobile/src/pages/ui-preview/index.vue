<script setup lang="ts">
import { ref } from 'vue'
import BigButton from '@/components/BigButton.vue'
import PrivacyToggle from '@/components/PrivacyToggle.vue'
import StatusTag from '@/components/StatusTag.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { mascotArtwork, mascotStates } from '@/config/mascot'
// #ifdef H5
import Tabs from '@/components/ui/Tabs.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Table from '@/components/ui/Table.vue'
// #endif
import type { MascotState } from '@/types/presentation'
const period = ref('day'),
  enabled = ref(true)
const states = mascotStates
const selectedMascot = ref<MascotState>('greeting')
</script>
<template>
  <AppPage>
    <view class="header">
      <view>

        <view class="h1">蓝绿环抱 · 组件预览</view>
      </view>
    </view>
    <view class="section">
      <view class="hero green mascot-preview-hero">
        <view class="pill">小鼋表情</view>
        <YuanMascot size="xlarge" :state="selectedMascot" />
        <view class="h2" aria-live="polite">{{ mascotArtwork[selectedMascot].title }}</view>

      </view>
    </view>
    <view class="section mascot-pose-grid" role="group" aria-label="小鼋动作预览">
      <button
        v-for="state in states"
        :key="state"
        class="mascot-pose-card"
        :class="{ 'is-selected': selectedMascot === state }"
        :aria-label="`预览${mascotArtwork[state].title}`"
        :aria-pressed="selectedMascot === state"
        @click="selectedMascot = state"
      >
        <YuanMascot :state="state" aria-hidden="true" />
        <text>{{ mascotArtwork[state].title }}</text>
      </button>
    </view>
    <view class="section">
      <view class="grid2">
        <BigButton>主要操作</BigButton>
        <BigButton tone="red">紧急求助</BigButton>
        <BigButton tone="white">次要操作</BigButton>
        <BigButton loading>处理中</BigButton>
      </view>
    </view>
    <view class="section row">
      <StatusTag label="状态平稳" />
      <StatusTag label="需要关注" tone="warm" />
      <PrivacyToggle v-model="enabled" label="预览通知开关" />
    </view>
    <!-- #ifdef H5 -->
    <view class="section">
      <Tabs
        v-model="period"
        :options="[
          { label: '日报', value: 'day' },
          { label: '周报', value: 'week' },
        ]"
      >
        <view class="feedback-panel">
          当前：{{ period === 'day' ? '日报' : '周报' }} · 支持方向键切换
        </view>
      </Tabs>
      <Skeleton style="height: 72px; margin: 20px 0" />
      <Table>
        <caption>社区工单 · 桌面表格</caption>
        <thead>
          <tr>
            <th scope="col">事项</th>
            <th scope="col">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>长辈安全回访</td>
            <td><StatusTag label="待处理" tone="warm" /></td>
          </tr>
        </tbody>
      </Table>
    </view>
    <!-- #endif -->
  </AppPage>
</template>

<style scoped lang="scss">
.mascot-preview-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}
.mascot-pose-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.mascot-pose-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 8px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: var(--surface, #fff);
  color: var(--text);
  font-size: 16px;
  line-height: 1.4;
}
.mascot-pose-card.is-selected {
  border-color: var(--primary);
  box-shadow: inset 0 0 0 1px var(--primary);
  background: var(--green-soft);
}
.mascot-pose-card:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 3px;
}
@media (min-width: 768px) {
  .mascot-pose-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
