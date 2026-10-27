<template>
  <AppPage class=" login-page">
    <AppHeader title="选择身份" back="/pages/login-welcome/index" />
    <view class="section center intro">

    </view>
    <view class="list role-list">
      <ListItem
        class="role-item"
        :class="{ selected: session.role === 'elder' }"
        icon="老"
        title="我是老人"
        desc="健康与陪伴"
        tag="推荐"
        :chev="false"
        @click="selectRole('elder')"
      >
        <template #right><text v-if="session.role === 'elder'" class="chev">✓</text></template>
      </ListItem>
      <ListItem
        class="role-item"
        :class="{ selected: session.role === 'family' }"
        icon="家"
        icon-tone="warm"
        title="我是家人"
        desc="守护家人"
        :chev="false"
        @click="selectRole('family')"
      >
        <template #right><text v-if="session.role === 'family'" class="chev">✓</text></template>
      </ListItem>
      <ListItem
        class="role-item"
        :class="{ selected: session.role === 'community' }"
        icon="社"
        title="我是社区人员"
        desc="社区服务"
        :chev="false"
        @click="selectRole('community')"
      >
        <template #right><text v-if="session.role === 'community'" class="chev">✓</text></template>
      </ListItem>
    </view>
    <view class="section">
      <BigButton @click="goNext">下一步 ›</BigButton>
    </view>
  </AppPage>
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
  goNext()
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

.role-item {
  transition: border-color 0.16s ease, background-color 0.16s ease, transform 0.16s ease;
}

.role-item.selected {
  border-color: #9fcb91;
  background: #f1faec;
  transform: translateY(-1px);
}
</style>
