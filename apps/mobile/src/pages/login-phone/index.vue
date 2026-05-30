<template>
  <view class="app-page login-page">
    <AppHeader label="手机号登录" :title="session.phoneTitle" back="/pages/login-role/index" />
    <view class="section center">
      <view class="muted">{{ phoneHint }}</view>
    </view>
    <view class="list phone-list">
      <ListItem icon="机" :title="phoneNumber" desc="手机号" :chev="false" />
      <ListItem icon="码" :title="otpDisplay" desc="验证码" :chev="false">
        <template #right>
          <StatusTag :label="otpSending ? '发送中' : '获取'" tone="warm" @click="requestOtp" />
        </template>
      </ListItem>
    </view>
    <view class="section">
      <view class="hero warm">
        <view class="row row-top">
          <view class="iconbox warm">隐</view>
          <view>
            <view class="h2 privacy-title">隐私保护</view>
            <view class="muted privacy-copy">{{ privacyCopy }}</view>
          </view>
        </view>
      </view>
    </view>
    <view class="section submit">
      <BigButton :disabled="submitting" @click="submitLogin">{{ submitting ? '登录中…' : '登录并继续 ›' }}</BigButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import StatusTag from '@/components/StatusTag.vue'
import { demoPhoneForRole } from '@/services/authService'
import { useApiMode } from '@/config/apiMode'
import { useFamilyStore } from '@/stores/family'
import { useSessionStore } from '@/stores/session'
import { goReplace } from '@/utils/navigate'

const session = useSessionStore()
const family = useFamilyStore()
const otpCode = ref('123456')
const otpSending = ref(false)
const submitting = ref(false)

const phoneHint = computed(() =>
  session.isFamily ? '请使用已绑定老人的家属账号登录。' : '请用家人已绑定的手机号登录。'
)
const phoneNumber = computed(() => {
  if (session.isFamily && !useApiMode()) return family.profile.phone
  return demoPhoneForRole(session.role).replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
})
const otpDisplay = computed(() => (otpCode.value ? '· · · · · ·' : '请输入验证码'))
const privacyCopy = computed(() =>
  session.isFamily
    ? '子女端仅查看授权范围内的健康摘要与告警，不会采集摄像画面。'
    : '鼋伴伴不会采集摄像画面，设备只识别安全状态。'
)

async function requestOtp() {
  if (!useApiMode()) {
    uni.showToast({ title: '演示模式：验证码 123456', icon: 'none' })
    return
  }
  otpSending.value = true
  try {
    await session.requestOtp(demoPhoneForRole(session.role))
    uni.showToast({ title: '验证码已发送', icon: 'none' })
  } catch {
    uni.showToast({ title: '发送失败', icon: 'none' })
  } finally {
    otpSending.value = false
  }
}

async function submitLogin() {
  if (!useApiMode()) {
    goReplace('/pages/login-profile/index')
    return
  }
  submitting.value = true
  try {
    await session.loginWithOtp(otpCode.value, demoPhoneForRole(session.role))
    goReplace('/pages/login-profile/index')
  } catch {
    uni.showToast({ title: '登录失败，请检查验证码', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.phone-list {
  margin-top: 36px;
}

.privacy-title {
  font-size: 18px;
}

.privacy-copy {
  margin-top: 6px;
  line-height: 1.5;
}

.submit {
  margin-top: 40px;
}
</style>
