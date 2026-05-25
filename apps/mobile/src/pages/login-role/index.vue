<template>
  <view class="app-page login-page">
    <AppHeader label="请选择身份" title="您想以什么身份使用？" back="/pages/login-welcome/index" />
    <view class="section center intro">
      <view class="muted">老人端会使用更大的文字和更简单的按钮。</view>
    </view>
    <view class="list role-list">
      <ListItem icon="老" title="我是老人" desc="查看安全状态、联系家人、记录心情" tag="推荐" :chev="false" @click="selectRole('elder')">
        <template #right><text v-if="session.role === 'elder'" class="chev">✓</text></template>
      </ListItem>
      <ListItem icon="家" icon-tone="warm" title="我是家人" desc="远程关怀、接收告警、查看报告" :chev="false" @click="selectRole('family')">
        <template #right><text v-if="session.role === 'family'" class="chev">✓</text></template>
      </ListItem>
      <ListItem icon="社" title="我是社区人员" desc="处理告警、服务工单、活动管理" :chev="false" @click="selectRole('community')">
        <template #right><text v-if="session.role === 'community'" class="chev">✓</text></template>
      </ListItem>
    </view>
    <view class="section">
      <BigButton @click="goNext">下一步 ›</BigButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import { useSessionStore } from '@/stores/session'
import { goReplace } from '@/utils/navigate'
import type { UserRole } from '@/types/family'

const session = useSessionStore()

function selectRole(role: UserRole) {
  session.setRole(role)
}

function goNext() {
  goReplace('/pages/login-phone/index')
}
</script>

<style scoped>
.intro {
  margin-top: -4px;
  line-height: 1.55;
}

.role-list {
  margin-top: 28px;
}
</style>
