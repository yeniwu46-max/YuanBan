<script setup lang="ts">
import { computed, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { useSosStore } from '@/stores/sos'
import { useElderStore } from '@/stores/elder'
import { useApiMode } from '@/config/apiMode'
import { goRoute } from '@/utils/navigate'
const sos = useSosStore(),
  elder = useElderStore(),
  submitted = ref(false)
const title = computed(
  () =>
    ({
      confirm: '需要立即求助吗？',
      calling: '正在提交求助…',
      success: '求助已提交',
      cancel: '已取消本次操作',
    })[sos.state],
)
const copy = computed(() =>
  sos.state === 'confirm'
    ? '确认后，将向家人和社区提交求助。'
    : sos.state === 'calling'
      ? '请留在安全的位置，耐心等待提交结果。'
      : sos.state === 'success'
        ? '提交成功不代表已有人响应。请继续联系家人；紧急情况请直接拨打当地急救电话。'
        : submitted.value
          ? '已停止等待。已提交的通知不会撤回，请向家人说明情况。'
          : '本次没有发送求助。如需帮助，可随时重新发起。',
)
async function send() {
  await sos.setState('calling')
  if (sos.state === 'calling') {
    submitted.value = true
    setTimeout(() => {
      if (sos.state === 'calling') void sos.setState('success')
    }, 900)
  }
}
</script>
<template>
  <AppPage>
    <AppHeader title="紧急求助" back="/pages/home/index" />
    <view class="section">
      <view class="sos-panel" :class="'sos-' + sos.state" aria-live="polite">
        <view class="sos-symbol">
          <AppIcon
            :name="sos.state === 'success' ? 'check' : sos.state === 'cancel' ? 'shield' : 'siren'"
            :size="48"
          />
        </view>
        <view class="h1">{{ title }}</view>
        <view class="sos-copy">{{ copy }}</view>
        <view v-if="!useApiMode()" class="sos-demo">当前为演示，不会拨打电话或通知真实人员。</view>
        <view class="sos-actions">
          <template v-if="sos.state === 'confirm'">
            <BigButton tone="red" :loading="sos.triggering" @click="send">确认，立即求助</BigButton>
            <BigButton tone="white" :disabled="sos.triggering" @click="sos.setState('cancel')">
              误触了，取消
            </BigButton>
          </template>
          <template v-else-if="sos.state === 'calling'">
            <BigButton loading>正在提交…</BigButton>
            <BigButton tone="white" @click="sos.setState('cancel')">停止等待</BigButton>
          </template>
          <template v-else-if="sos.state === 'success'">
            <BigButton @click="goRoute('/pkg-elder-detail/family/index')">
              <AppIcon name="phone" />
              联系家人
            </BigButton>
            <BigButton tone="white" @click="goRoute('/pages/home/index')">回到首页</BigButton>
          </template>
          <template v-else>
            <BigButton tone="red" @click="sos.setState('confirm')">重新求助</BigButton>
            <BigButton tone="white" @click="goRoute('/pages/home/index')">回到首页</BigButton>
          </template>
        </view>
      </view>
    </view>
    <view class="section">
      <view class="feedback-panel">
        <view class="row">
          <YuanMascot size="small" :state="sos.state === 'calling' ? 'thinking' : 'reminder'" />
          <view class="item-main">
            <view class="h2">小鼋陪着您</view>
            <view class="desc">{{ elder.profile.locationLabel }}</view>
          </view>
        </view>
        <view class="desc" style="margin-top: 16px">通知对象：{{ sos.timeline.join('、') }}</view>
      </view>
    </view>
  </AppPage>
</template>
<style scoped>
.sos-panel {
  padding: 28px 24px;
  border-radius: 28px;
  border: 1px solid #ecc6c0;
  background: var(--red-soft);
  text-align: center;
}
.sos-symbol {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 24px;
  width: 92px;
  height: 92px;
  border-radius: 28px;
  background: white;
  color: var(--red);
}
.sos-copy {
  margin-top: 16px;
  line-height: 1.7;
  font-size: 20px;
  color: var(--text);
}
.sos-demo {
  margin-top: 16px;
  font-size: 16px;
  color: var(--muted);
}
.sos-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}
.sos-success {
  background: var(--green-soft);
  border-color: var(--line);
}
.sos-success .sos-symbol,
.sos-cancel .sos-symbol {
  color: var(--primary);
}
.sos-cancel {
  background: #eaf2f5;
  border-color: var(--line);
}
</style>
