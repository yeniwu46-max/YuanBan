<template>
  <view class="app-page family-page">
    <FamilyPageHeader label="子女端 · 关怀中心" switchable />

    <FamilyPageSkeleton v-if="switching" />

    <template v-else-if="stats">
      <view class="section">
        <view class="hero warm">
          <view class="between row-top">
            <view class="main">
              <view class="pill warm-pill">💚 今日适合主动关怀</view>
              <view class="hero-title">{{ stats.headline }}</view>
              <view class="muted hero-desc">{{ stats.suggestion }}</view>
            </view>
            <view class="iconbox warm mascot-large">
              <YuanMascot size="large" />
            </view>
          </view>
          <view class="grid3 stats">
            <view class="card stat-card">
              <text class="muted">陪伴值</text>
              <text class="stat-num warm">{{ stats.companionPoints }}</text>
            </view>
            <view class="card stat-card">
              <text class="muted">本周联系</text>
              <text class="stat-num">{{ stats.weeklyContacts }}次</text>
            </view>
            <view class="card stat-card">
              <text class="muted">相册更新</text>
              <text class="stat-num">{{ stats.albumUpdates }}张</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">快捷关怀</view>
      </view>
      <view class="section compact-top">
        <QuickCareGrid variant="care" @action="onQuickCare" />
      </view>

      <view class="section">
        <view class="card greeting-card">
          <view class="row row-top">
            <view class="iconbox warm">✨</view>
            <view>
              <view class="greeting-title">小鼋生成的问候</view>
              <view class="muted greeting-copy">{{ stats.generatedGreeting }}</view>
            </view>
          </view>
          <view class="grid2 action-row">
            <BigButton tone="green" @click="toast('发送给老人')">➤ 发送给老人</BigButton>
            <BigButton tone="white" @click="toast('录语音')">🎙 录语音</BigButton>
          </view>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">家庭相册</view>
        <button class="link" @click="toast('上传照片')">上传 +</button>
      </view>
      <view class="section compact-top">
        <view v-if="careStore.photos.length" class="card album-card">
          <view class="grid3 photo-grid">
            <button
              v-for="photo in careStore.photos"
              :key="photo.id"
              class="photo"
              @click="toast(photo.label)"
            >
              <text class="photo-emoji">{{ photo.emoji }}</text>
              <text class="photo-label">{{ photo.label }}</text>
            </button>
          </view>
          <view class="grid2 action-row">
            <BigButton tone="green" @click="toast('上传照片')">🖼 上传照片</BigButton>
            <BigButton tone="white" @click="toast('配一句话')">💬 配一句话</BigButton>
          </view>
        </view>
        <FamilyEmptyState
          v-else
          icon="🖼"
          title="相册还是空的"
          description="上传一张照片，老人端就能看到家人的近况。"
          action-label="上传第一张照片"
          @action="toast('上传照片')"
        />
      </view>

      <view class="section-title">
        <view class="h2">今日关怀任务</view>
        <text class="muted task-progress">{{ stats.doneCount }} / {{ stats.totalCount }} 完成</text>
      </view>
      <view class="list flush section-gap">
        <CareTaskItem
          v-for="task in careTasks"
          :key="task.id"
          :task="task"
          @click="handleTask(task.id, task.status)"
        />
        <FamilyEmptyState
          v-if="!careTasks.length"
          icon="📝"
          title="暂无关怀任务"
          description="当前没有待办任务，您可以主动发起一次问候。"
          action-label="去快捷关怀"
          @action="toast('视频关怀')"
        />
      </view>
    </template>

    <view v-else class="section">
      <FamilyEmptyState
        icon="💚"
        title="暂无关怀数据"
        description="切换其他老人或稍后再试。"
        action-label="返回守护首页"
        @action="goHome('/pages/family/guardian/index')"
      />
    </view></view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import BigButton from '@/components/BigButton.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import CareTaskItem from '@/components/family/CareTaskItem.vue'
import FamilyEmptyState from '@/components/family/FamilyEmptyState.vue'
import FamilyPageHeader from '@/components/family/FamilyPageHeader.vue'
import FamilyPageSkeleton from '@/components/family/FamilyPageSkeleton.vue'
import QuickCareGrid from '@/components/family/QuickCareGrid.vue'
import type { QuickCareAction } from '@/components/family/QuickCareGrid.vue'
import { useFamilyElderContext } from '@/composables/useFamilyElderContext'
import { goDetail, goHome, goMainTab } from '@/utils/navigate'
import type { CareTaskStatus } from '@/types/family'

const { switching, careStats: stats, careTasks, careStore, elderId } = useFamilyElderContext()

onShow(() => {
  void careStore.hydrate(elderId.value, { force: false })
})

const quickCareLabels: Record<QuickCareAction, string> = {
  video: '视频关怀',
  phone: '电话关怀',
  voice: '语音留言',
  location: '查看位置',
  photo: '上传照片'
}

function onQuickCare(action: QuickCareAction) {
  if (action === 'video' || action === 'phone') {
    goDetail('/pkg-elder-detail/contact-detail/index')
    return
  }
  toast(quickCareLabels[action])
}

function handleTask(taskId: string, status: CareTaskStatus) {
  if (status === 'done') return
  careStore.completeTask(taskId)
  uni.showToast({ title: '任务已完成', icon: 'none' })
}

function go(url: string) {
  goMainTab(url)
}

function toast(title: string) {
  uni.showToast({ title: `${title}（演示）`, icon: 'none' })
}
</script>

<style scoped lang="scss">
.main {
  flex: 1;
  min-width: 0;
}

.warm-pill {
  color: #8b6a33;
}

.hero-title {
  margin-top: 15px;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 1000;
}

.hero-desc {
  margin-top: 8px;
  line-height: 1.5;
}

.mascot-large {
  width: 88px;
  height: 88px;
  border-radius: 28px;
  overflow: hidden;
}

.stats {
  margin-top: 16px;
}

.stat-card {
  padding: 12px;
  text-align: center;
}

.stat-num {
  display: block;
  margin-top: 6px;
  font-size: 20px;
  font-weight: 1000;
  color: #243a31;
}

.stat-num.warm {
  color: #c9822c;
}

.compact-top {
  margin-top: 0;
}

.greeting-card,
.album-card {
  padding: 16px;
}

.greeting-title {
  font-size: 18px;
  font-weight: 900;
}

.greeting-copy {
  margin-top: 8px;
  line-height: 1.5;
  font-size: 14px;
}

.photo-grid {
  gap: 12px;
}

.photo {
  min-height: 92px;
  border-radius: 22px;
  background: #f7f2e8;
  border: 1px solid #efe3ce;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.photo-emoji {
  font-size: 30px;
  line-height: 1;
}

.photo-label {
  font-size: 12px;
  font-weight: 1000;
  color: #7a6f5d;
}

.task-progress {
  font-weight: 1000;
  font-size: 14px;
}

.section-gap {
  padding: 0 24px;
}

.action-row {
  margin-top: 16px;
}
</style>
