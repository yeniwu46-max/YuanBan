<template>
  <view class="app-page">
    <AppHeader label="安全守护" title="SOS 求助" back="/pages/home/index" compact />
    <view class="section">
      <view class="hero center" :class="heroClass">
        <view class="sos-icon">{{ icon }}</view>
        <view class="h1 sos-title">{{ title }}</view>
        <view class="muted sos-copy">{{ copy }}</view>
        <view v-if="sos.state === 'calling'" class="card notify-card">
          <view class="between"><text class="notify-title">通知进度</text><text class="notify-count">{{ sos.notifiedCount }} / {{ sos.targetCount }}</text></view>
          <ProgressBar :value="66" />
        </view>
        <view class="grid2 sos-actions">
          <template v-if="sos.state === 'confirm'">
            <BigButton tone="red" @click="sos.setState('calling')">☎ 立即求助</BigButton>
            <BigButton tone="white" @click="sos.setState('cancel')">× 误触取消</BigButton>
          </template>
          <template v-else-if="sos.state === 'calling'">
            <BigButton @click="sos.setState('success')">✓ 模拟成功</BigButton>
            <BigButton tone="white" @click="sos.setState('confirm')">取消求助</BigButton>
          </template>
          <template v-else-if="sos.state === 'success'">
            <BigButton @click="go('/pages/family/index')">☎ 联系女儿</BigButton>
            <BigButton tone="white" @click="go('/pages/home/index')">⌂ 回到首页</BigButton>
          </template>
          <template v-else>
            <BigButton tone="red" @click="sos.setState('confirm')">🚨 重新求助</BigButton>
            <BigButton tone="white" @click="go('/pages/home/index')">⌂ 回到首页</BigButton>
          </template>
        </view>
      </view>
    </view>
    <view class="list sos-list">
      <ListItem icon="📍" title="当前位置" :desc="elder.profile.locationLabel" tag="已定位" :chev="false" />
      <ListItem icon="📶" title="设备状态" desc="SOS 按钮与监测设备在线" tag="正常" :chev="false" />
      <ListItem icon="👥" icon-tone="warm" title="将通知对象" desc="女儿、儿子、社区服务站" tag="3 方" tag-tone="warm" :chev="false" />
    </view>
    <view class="statebar">
      <button :class="{ active: sos.state === 'confirm' }" @click="sos.setState('confirm')">确认</button>
      <button :class="{ active: sos.state === 'calling' }" @click="sos.setState('calling')">通知中</button>
      <button :class="{ active: sos.state === 'success' }" @click="sos.setState('success')">成功</button>
      <button :class="{ active: sos.state === 'cancel' }" @click="sos.setState('cancel')">取消</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { useElderStore } from '@/stores/elder'
import { useSosStore } from '@/stores/sos'

const elder = useElderStore()
const sos = useSosStore()

const heroClass = computed(() => ({
  red: sos.state === 'confirm',
  warm: sos.state === 'calling',
  green: sos.state === 'success',
  gray: sos.state === 'cancel'
}))

const icon = computed(() => ({ confirm: '🚨', calling: '⏳', success: '✓', cancel: '🛡️' }[sos.state]))
const title = computed(() => ({
  confirm: '需要立即求助吗？',
  calling: '正在通知家人',
  success: '已通知成功',
  cancel: '已取消求助'
}[sos.state]))
const copy = computed(() => ({
  confirm: '确认后，小鼋会同时通知您的家人和社区服务人员。',
  calling: '请您先坐下休息，小鼋正在帮您联系大家。',
  success: '女儿已确认收到，社区服务人员也会继续关注您的情况。',
  cancel: '本次不会通知家人和社区。如果您真的不舒服，可以重新发起求助。'
}[sos.state]))

function go(url: string) {
  uni.redirectTo({ url })
}
</script>

<style scoped>
.sos-icon {
  margin: 0 auto;
  width: 132px;
  height: 132px;
  border-radius: 50%;
  background: #fff;
  border: 8px solid rgba(255, 224, 218, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: #e56b5f;
}

.green .sos-icon,
.gray .sos-icon {
  border-color: #d7ebcd;
  color: #5b8b62;
}

.warm .sos-icon {
  border-color: #f9dcac;
  color: #c9822c;
}

.sos-title {
  font-size: 30px;
  margin-top: 18px;
}

.sos-copy {
  margin-top: 12px;
  line-height: 1.6;
}

.sos-actions {
  margin-top: 18px;
}

.notify-card {
  padding: 16px;
  margin-top: 18px;
}

.notify-title,
.notify-count {
  font-weight: 900;
}

.notify-count {
  color: #c9822c;
}

.sos-list {
  margin-top: 18px;
}

.statebar {
  margin: 18px 24px 0;
  z-index: 25;
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(4, 1fr);
}

.statebar button {
  height: 34px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #efe3ce;
  color: #7a6f5d;
  font-size: 12px;
  font-weight: 900;
}

.statebar button.active {
  background: #26382f;
  color: #fff;
}

</style>
