<template>
  <view class="app-page login-page">
    <AppHeader :label="phoneLabel" :title="session.phoneTitle" back="/pages/login-role/index" />
    <view class="section center">
      <view class="muted">{{ phoneHint }}</view>
    </view>
    <view class="list phone-list">
      <ListItem icon="☎" :title="phoneNumber" desc="手机号" :chev="false" />
      <ListItem icon="🔐" title="· · · ·" desc="验证码" :chev="false">
        <template #right><StatusTag label="获取" tone="warm" /></template>
      </ListItem>
    </view>
    <view class="section">
      <view class="hero warm">
        <view class="row row-top">
          <view class="iconbox warm">🙈</view>
          <view>
            <view class="h2 privacy-title">隐私保护</view>
            <view class="muted privacy-copy">{{ privacyCopy }}</view>
          </view>
        </view>
      </view>
    </view>
    <view class="section submit">
      <BigButton @click="go('/pages/login-profile/index')">登录并继续 ›</BigButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useFamilyStore } from '@/stores/family'
import { useSessionStore } from '@/stores/session'
import { goReplace } from '@/utils/navigate'

const session = useSessionStore()
const family = useFamilyStore()

const phoneLabel = computed(() => (session.isFamily ? '手机号登录' : '手机号登录'))
const phoneHint = computed(() =>
  session.isFamily ? '请使用已绑定老人的家属账号登录。' : '请用家人已绑定的手机号登录。'
)
const phoneNumber = computed(() => (session.isFamily ? family.profile.phone : '130 0000 0000'))
const privacyCopy = computed(() =>
  session.isFamily
    ? '子女端仅查看授权范围内的健康摘要与告警，不会采集摄像画面。'
    : '鼋伴伴不会采集摄像画面，设备只识别安全状态。'
)

function go(url: string) {
  goReplace(url)
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
