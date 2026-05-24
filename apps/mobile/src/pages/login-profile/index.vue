<template>
  <view class="app-page login-page">
    <AppHeader :label="profileLabel" :title="profileTitle" back="/pages/login-phone/index" />
    <view class="section center">
      <view class="muted intro">{{ profileIntro }}</view>
    </view>
    <view class="list profile-list">
      <ListItem
        v-for="item in profileItems"
        :key="item.title"
        :icon="item.icon"
        :icon-tone="item.iconTone"
        :title="item.title"
        :desc="item.desc"
        :chev="false"
      />
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
import { boundElders } from '@/mock/family'
import { elderProfile } from '@/mock/elder'
import { useFamilyStore } from '@/stores/family'
import { useSessionStore } from '@/stores/session'
import { goReplace } from '@/utils/navigate'

const session = useSessionStore()
const family = useFamilyStore()

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
    const elder = boundElders[0]
    return [
      { icon: '👤', title: family.profile.name, desc: '您的姓名' },
      { icon: '👪', title: family.profile.relation, desc: '与老人关系' },
      { icon: '🛡️', title: elder?.name ?? '李奶奶', desc: '当前守护对象' },
      { icon: '☎', title: '主要联系人', desc: '紧急通知权限', iconTone: 'warm' as const }
    ]
  }
  return [
    { icon: '👤', title: elderProfile.name, desc: '姓名' },
    { icon: '📅', title: `${elderProfile.age} 岁`, desc: '年龄' },
    { icon: '📍', title: elderProfile.locationLabel, desc: '居住位置' },
    { icon: '☎', title: '女儿 · 已绑定', desc: '紧急联系人' }
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
