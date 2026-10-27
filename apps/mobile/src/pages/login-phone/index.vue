<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import WdInput from 'wot-design-uni/components/wd-input/wd-input.vue'
import WdToast from 'wot-design-uni/components/wd-toast/wd-toast.vue'
import { useToast } from 'wot-design-uni/components/wd-toast'
import WdForm from 'wot-design-uni/components/wd-form/wd-form.vue'
import { demoPhoneForRole } from '@/services/authService'
import { useApiMode } from '@/config/apiMode'
import { useSessionStore } from '@/stores/session'
import { goReplace } from '@/utils/navigate'
const session = useSessionStore(),
  toast = useToast()
const model = ref({
  phone: useApiMode() ? '' : demoPhoneForRole(session.role),
  code: useApiMode() ? '' : '123456',
})
const submitting = ref(false),
  sending = ref(false),
  seconds = ref(0),
  error = ref(''),
  message = ref('')
let timer: ReturnType<typeof setInterval> | undefined
onUnmounted(() => clearInterval(timer))
function validPhone() {
  return /^1\d{10}$/.test(model.value.phone)
}
async function requestOtp() {
  if (sending.value || seconds.value) return
  if (!validPhone()) {
    error.value = '请输入 11 位手机号'
    return
  }
  error.value = ''
  sending.value = true
  try {
    if (useApiMode()) await session.requestOtp(model.value.phone)
    message.value = useApiMode() ? '验证码已发送' : '演示验证码：123456'
    toast.show(message.value)
    seconds.value = 60
    timer = setInterval(() => {
      seconds.value--
      if (!seconds.value) clearInterval(timer)
    }, 1000)
  } catch {
    error.value = '验证码发送失败，请稍后重试'
  } finally {
    sending.value = false
  }
}
async function submitLogin() {
  if (submitting.value) return
  if (!validPhone() || !/^\d{6}$/.test(model.value.code)) {
    error.value = '请填写正确的手机号和 6 位验证码'
    return
  }
  error.value = ''
  submitting.value = true
  try {
    if (useApiMode()) await session.loginWithOtp(model.value.code, model.value.phone)
    else session.authenticated = true
    goReplace('/pages/login-profile/index')
  } catch {
    error.value = '登录失败，请检查验证码或网络后重试'
  } finally {
    submitting.value = false
  }
}
</script>
<template>
  <AppPage class="login-page">
    <AppHeader :title="session.phoneTitle" back="/pages/login-role/index" />
    <view class="section row">
      <YuanMascot state="greeting" />
      <view class="item-main">
        <view class="h2">欢迎回来。</view>

      </view>
    </view>
    <view class="section">
      <view class="card login-form">
        <WdForm :model="model">
          <WdInput
            v-model="model.phone"
            label="手机号"
            prop="phone"
            type="number"
            :maxlength="11"
            placeholder="请输入手机号"
            clearable
          />
          <WdInput
            v-model="model.code"
            label="验证码"
            prop="code"
            type="number"
            :maxlength="6"
            placeholder="请输入 6 位验证码"
            @confirm="submitLogin"
          />
        </WdForm>
        <button class="link" :disabled="sending || seconds > 0" @click="requestOtp">
          {{ sending ? '发送中…' : seconds ? seconds + ' 秒后重发' : '获取验证码' }}
        </button>
      </view>
      <view v-if="error" class="login-error" role="alert">{{ error }}</view>
      <view v-if="message" class="desc" role="status">{{ message }}</view>
    </view>
    <view class="section">
      <BigButton :loading="submitting" @click="submitLogin">
        登录并继续
        <AppIcon name="arrow" />
      </BigButton>
    </view>
    <view class="section">
      <view class="feedback-panel">
        <view class="row">
          <AppIcon name="lock" />
          <text>只连接被授权的守护信息</text>
        </view>
        <view class="desc">
          健康摘要与告警仅向授权家人和社区开放。{{
            useApiMode() ? '请使用已绑定的手机号。' : '当前为演示模式，不会发送真实短信。'
          }}
        </view>
      </view>
    </view>
    <WdToast />
  </AppPage>
</template>
<style scoped>
.login-form {
  padding: 16px;
}
.login-error {
  font-size: 16px;
  color: var(--red);
  margin-top: 12px;
}
</style>
