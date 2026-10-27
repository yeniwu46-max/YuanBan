<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CommunityPageHeader from '@/components/community/CommunityPageHeader.vue'
import AlertTimeline from '@/components/family/AlertTimeline.vue'
import BigButton from '@/components/BigButton.vue'
import StatusTag from '@/components/StatusTag.vue'
import AppSheet from '@/components/AppSheet.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import WdRadioGroup from 'wot-design-uni/components/wd-radio-group/wd-radio-group.vue'
import WdRadio from 'wot-design-uni/components/wd-radio/wd-radio.vue'
import { useCommunityAlertStore } from '@/stores/communityAlert'
import { goRoute } from '@/utils/navigate'
const store = useCommunityAlertStore(),
  confirmOpen = ref(false),
  result = ref(''),
  submitting = ref(false),
  feedback = ref('')
const detail = computed(() => store.detail)
onLoad((query) => {
  void store.loadById(String(query?.id || store.activeOrderId))
})
async function finish() {
  if (submitting.value || !result.value) return
  submitting.value = true
  const ok = await store.finish(
    result.value === 'safe' ? '已联系，确认长辈安全' : '已到现场，完成服务',
  )
  submitting.value = false
  if (ok) {
    confirmOpen.value = false
    feedback.value = '处理结果已记录，工单已完成。'
  } else feedback.value = '提交失败，工单尚未完成，请重试。'
}
function contact() {
  uni.showToast({ title: '当前为联系操作演示，请使用真实电话核实安全', icon: 'none' })
}
</script>
<template>
  <AppPage class="community-page">
    <CommunityPageHeader title="工单详情" show-back />
    <view v-if="store.loading" class="section feedback-panel" role="status">正在读取工单…</view>
    <view v-else-if="store.error" class="section feedback-panel" role="alert">{{ store.error }}</view>
    <template v-else>
      <view class="section">
        <view class="hero" :class="store.finished ? 'green' : 'red'">
          <view class="between">
            <StatusTag
              :label="store.finished ? '已完成' : detail.priority + '优先级'"
              :tone="store.finished ? 'normal' : 'red'"
            />
            <AppIcon :name="store.finished ? 'check' : 'siren'" :size="30" />
          </view>
          <view class="hero-title" style="margin-top: 20px">
            {{ store.finished ? '安全已核实，服务已记录' : detail.headline }}
          </view>
          <view class="desc" style="margin-top: 12px">{{ detail.description }}</view>
          <view class="data-source" style="margin-top: 20px">
            {{ detail.code }} · {{ detail.triggerTime }}
          </view>
        </view>
      </view>
      <view class="section">
        <view class="card detail-summary">
          <view class="detail-row">
            <text>服务对象</text>
            <view>{{ detail.elderName }} · {{ detail.elderAge }} 岁</view>
          </view>
          <view class="detail-row">
            <text>所在位置</text>
            <view>{{ detail.location }}</view>
          </view>
          <view class="detail-row">
            <text>触发原因</text>
            <view>{{ detail.triggerDetail }}</view>
          </view>
          <view class="grid2" style="margin-top: 20px">
            <BigButton tone="white" @click="contact">
              <AppIcon name="phone" />
              联系核实
            </BigButton>
            <BigButton tone="white" @click="goRoute('/pages/community/profile/index')">
              服务档案
            </BigButton>
          </view>
        </view>
      </view>
      <view class="section-title">
        <view class="h2">处理时间线</view>
        <StatusTag :label="store.progressLabel" :tone="store.finished ? 'normal' : 'warm'" />
      </view>
      <view class="section"><AlertTimeline :steps="detail.timeline" /></view>
      <view class="section">
        <view class="feedback-panel row">
          <YuanMascot size="small" :state="store.finished ? 'encouraging' : 'reminder'" />
          <view class="item-main">
            <view class="h2">小鼋处置提示</view>
            <view class="desc">{{ detail.suggestion }}</view>
          </view>
        </view>
      </view>
      <view v-if="feedback" class="section" role="status">
        <view class="feedback-panel">{{ feedback }}</view>
      </view>
      <view class="section">
        <BigButton :disabled="store.finished" @click="confirmOpen = true">
          {{ store.finished ? '工单已完成' : '确认现场情况并完成' }}
        </BigButton>
      </view>
    </template>
    <AppSheet v-model="confirmOpen" title="记录处理结果">
      <view class="desc" style="margin-bottom: 20px">
        请在实际联系或现场核实后选择结果。演示模式不会通知真实人员。
      </view>
      <WdRadioGroup v-model="result" cell role="radiogroup" aria-label="处理结果">
        <WdRadio
          value="safe"
          role="radio"
          :aria-checked="result === 'safe'"
          tabindex="0"
          @keydown.space.prevent="result = 'safe'"
          @keydown.enter.prevent="result = 'safe'"
        >
          已联系，确认长辈安全
        </WdRadio>
        <WdRadio
          value="onsite"
          role="radio"
          :aria-checked="result === 'onsite'"
          tabindex="0"
          @keydown.space.prevent="result = 'onsite'"
          @keydown.enter.prevent="result = 'onsite'"
        >
          已到现场，完成服务
        </WdRadio>
      </WdRadioGroup>
      <BigButton style="margin-top: 24px" :disabled="!result" :loading="submitting" @click="finish">
        确认完成工单
      </BigButton>
    </AppSheet>
  </AppPage>
</template>
<style scoped>
.detail-summary {
  padding: 24px;
}
.detail-row {
  display: flex;
  gap: 24px;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
  font-size: 16px;
}
.detail-row > text {
  color: var(--muted);
  flex-shrink: 0;
}
.detail-row > view {
  text-align: right;
  min-width: 0;
}
</style>
