<template>
  <view class="card bound-card" :class="{ active: active }">
    <button class="row select-row" @click="$emit('select')">
      <view class="iconbox">👤</view>
      <view class="item-main">
        <view class="elder-name">{{ elder.name }}</view>
        <view class="muted elder-desc">
          {{ elder.age }} 岁 · {{ locationShort }} · {{ elder.online ? '设备在线' : '设备离线' }}
        </view>
      </view>
      <StatusTag :label="elder.online ? '守护中' : '需关注'" :tone="elder.online ? 'normal' : 'warm'" />
    </button>
    <view class="grid3 actions">
      <button class="bigbtn btnwhite action-btn" @click.stop="$emit('bind-code')">▣ 绑定码</button>
      <button class="bigbtn btnwarm action-btn" @click.stop="$emit('permission')">⚙ 权限</button>
      <button class="bigbtn btnwhite action-btn" @click.stop="$emit('contact')">☎ 联系</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusTag from '@/components/StatusTag.vue'
import type { BoundElder } from '@/types/family'

const props = withDefaults(defineProps<{
  elder: BoundElder
  active?: boolean
}>(), {
  active: false
})

defineEmits<{
  select: []
  'bind-code': []
  permission: []
  contact: []
}>()

const locationShort = computed(() => {
  const label = props.elder.locationLabel
  if (label.includes('客厅')) return '家中客厅'
  if (label.includes('卧室')) return '家中卧室'
  return label.split('·')[0]?.trim() ?? label
})
</script>

<style scoped lang="scss">
.bound-card {
  padding: 16px;
}

.bound-card.active {
  border-color: #9fcb91;
  box-shadow: 0 0 0 1px rgba(159, 203, 145, 0.35);
}

.select-row {
  width: 100%;
  padding: 0;
  text-align: left;
}

.elder-name {
  font-size: 20px;
  font-weight: 1000;
  color: #243a31;
}

.elder-desc {
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.35;
}

.actions {
  margin-top: 14px;
}

.action-btn {
  min-height: 48px;
  font-size: 14px;
}
</style>
