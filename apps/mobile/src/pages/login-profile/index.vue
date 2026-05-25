<template>
  <view class="app-page login-page">
    <AppHeader :label="profileLabel" :title="profileTitle" back="/pages/login-phone/index" />
    <view class="section center">
      <view class="muted intro">{{ profileIntro }}</view>
    </view>
    <view class="list profile-list">
      <ListItem v-for="item in profileItems" :key="item.title" :icon="item.icon" :icon-tone="item.iconTone" :title="item.title" :desc="item.desc" :chev="false" />
    </view>
    <view class="section">
      <BigButton @click="goNext">{{ nextLabel }}</BigButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import { useFamilyStore } from '@/stores/family'
import { useGuardianStore } from '@/stores/guardian'
import { useElderStore } from '@/stores/elder'
import { useSessionStore } from '@/stores/session'
import { goReplace } from '@/utils/navigate'

const session = useSessionStore()
const family = useFamilyStore()
const guardian = useGuardianStore()
const elder = useElderStore()

const profileLabel = computed(() => (session.isFamily ? '确认绑定关系' : '完善老人信息'))
const profileTitle = computed(() => (session.isFamily ? '开始远程守护' : '让小鼋更懂您'))
const profileIntro = computed(() =>
  session.isFamily
    ? '确认您与老人的绑定关系后，即可接收告警和健康报告。'
    : '这些信息会帮助系统更准确地提醒和守护。'
)
const nextLabel = computed(() => (session.isFamily ? '继续 ›' : '保存信息 ›'))

const profileItems = computed(() => {
  if (session.isFamily) {
    const currentElder = guardian.elders[0]
    return [
      { icon: '人', title: family.profile.name, desc: '您的姓名' },
      { icon: '家', title: family.profile.relation, desc: '与老人关系' },
      { icon: '老', title: currentElder?.name ?? '李奶奶', desc: '当前守护对象' },
      { icon: '联', title: '主要联系人', desc: '紧急通知权限', iconTone: 'warm' as const }
    ]
  }
  return [
    { icon: '人', title: elder.profile.name, desc: '姓名' },
    { icon: '龄', title: `${elder.profile.age} 岁`, desc: '年龄' },
    { icon: '位', title: elder.profile.locationLabel, desc: '居住位置' },
    { icon: '联', title: '女儿 · 已绑定', desc: '紧急联系人' }
  ]
})

function goNext() {
  goReplace(session.afterProfilePath)
}
</script>

<style scoped>
.intro {
  line-height: 1.5;
}

.profile-list {
  margin-top: 26px;
}
</style>
