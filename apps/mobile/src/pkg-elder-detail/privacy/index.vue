<template>
  <AppPage class="">
    <AppHeader title="隐私授权" back="/pages/service/index" compact />
    <view class="scroll-section">
      <view class="hero green">
        <view class="between row-top">
          <view>
            <view class="pill">您可以自己决定谁能查看</view>
            <view class="privacy-copy">管理共享范围</view>

          </view>
          <view class="iconbox privacy-icon"><AppIcon name="隐" /></view>
        </view>
      </view>
      <view class="section-title flush-title"><view class="h2">谁可以看到什么</view></view>
      <view class="list flush">
        <ListItem icon="家" title="家人可查看" desc="安全状态、健康报告、告警记录、服药状态" tag="亲情关怀" :chev="false" />
        <ListItem icon="社" icon-tone="warm" title="社区可查看" desc="紧急告警、服务工单、设备在线状态" tag="应急服务" tag-tone="warm" :chev="false" />
        <ListItem icon="禁" icon-tone="gray" title="不会采集" desc="摄像画面、私人聊天内容、日常语音原始内容" tag="默认保护" tag-tone="gray" :chev="false" />
      </view>
      <view class="section-title flush-title"><view class="h2">我的授权设置</view></view>
      <view class="list flush">
        <view v-for="permission in companion.privacyPermissions" :key="permission.key" class="item">
          <view class="iconbox"><AppIcon :name="permission.key === 'bedroomMonitor' ? 'shield' : permission.key === 'familyReport' ? 'chart' : 'home'" /></view>
          <view class="item-main">
            <view class="item-title">{{ permission.title }}</view>
            <view class="desc">{{ permission.description }}</view>
          </view>
          <PrivacyToggle :model-value="permission.enabled" :label="permission.title" @update:model-value="companion.togglePermission(permission.key)" />
        </view>
      </view>
    </view>
  </AppPage>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import ListItem from '@/components/ListItem.vue'
import PrivacyToggle from '@/components/PrivacyToggle.vue'
import { useCompanionStore } from '@/stores/companion'

const companion = useCompanionStore()
</script>

<style scoped>
.privacy-copy {
  margin-top: 15px;
  font-size: 23px;
  line-height: 1.35;
  font-weight: 600;
}

.privacy-desc {
  margin-top: 8px;
  line-height: 1.5;
}

.privacy-icon {
  width: 84px;
  height: 84px;
  border-radius: 28px;
  font-size: 34px;
  font-weight: 600;
}

.flush-title {
  padding: 0;
}
</style>
