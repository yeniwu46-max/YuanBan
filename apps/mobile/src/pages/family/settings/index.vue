<template>
  <AppPage class=" family-page">
    <FamilyPageHeader title="设置与绑定" />

    <FamilyPageSkeleton v-if="switching" />

    <template v-else>
      <view class="section">
        <view class="hero green profile-hero">
          <view class="row row-top">
            <view class="iconbox profile-icon"><AppIcon name="👤" /></view>
            <view>
              <HeroTitle
                :pill="`🛡️ 已绑定 ${guardian.elders.length} 位老人`"
                :title="`当前守护对象：${elder?.name ?? '未选择'}`"
                :subtitle="`关系：${family.profile.relation} · 权限：${family.profile.role === 'primary' ? '主要联系人' : '次要联系人'}`"
                :clamp="2"
              />
            </view>
          </view>
          <view class="grid3 stats">
            <view class="card stat-card">
              <text class="muted text-nowrap">通知规则</text>
              <text class="stat-num text-nowrap">{{ notificationEnabled ? '已开启' : '已关闭' }}</text>
            </view>
            <view class="card stat-card">
              <text class="muted text-nowrap">紧急权限</text>
              <text class="stat-num warm text-nowrap">{{ family.profile.role === 'primary' ? '主要' : '次要' }}</text>
            </view>
            <view class="card stat-card">
              <text class="muted text-nowrap">设备协助</text>
              <text class="stat-num text-nowrap">可管理</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">绑定老人</view>
        <button class="link" @click="toast('添加老人')">添加 +</button>
      </view>
      <view class="section compact-top">
        <BoundElderCard
          v-for="item in guardian.elders"
          :key="item.id"
          :elder="item"
          :active="item.id === guardian.currentElderId"
          class="bound-item"
          @bind-code="toast('绑定码')"
          @permission="openPrivacy"
          @contact="openContact"
          @select="switchToElder(item.id)"
        />
        <view class="grid2 bind-methods">
          <button class="quick bind-card" @click="toast('扫码绑定')">
            <view class="iconbox"><AppIcon name="▣" /></view>
            <text class="bind-title">扫码绑定</text>
            <text class="muted bind-desc">扫描老人端二维码</text>
          </button>
          <button class="quick bind-card" @click="toast('邀请码绑定')">
            <view class="iconbox warm"><AppIcon name="🔗" /></view>
            <text class="bind-title">邀请码绑定</text>
            <text class="muted bind-desc">输入 6 位绑定码</text>
          </button>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">通知规则</view>
        <button class="link" @click="toast('高级设置')">高级设置 ›</button>
      </view>
      <view class="list flush section-gap">
        <view v-for="rule in careStore.notificationRules" :key="rule.key" class="item rule-item">
          <view class="iconbox" :class="rule.iconTone"><AppIcon :name="rule.icon" /></view>
          <view class="item-main">
            <view class="item-title">{{ rule.title }}</view>
            <view class="desc">{{ rule.description }}</view>
          </view>
          <PrivacyToggle
            :label="rule.title"
            :model-value="rule.enabled"
            @update:model-value="(enabled) => careStore.setNotificationRule(rule.key, enabled)"
          />
        </view>
      </view>

      <view class="section">
        <view class="hero warm device-tip">
          <view class="row">
            <view class="iconbox warm"><AppIcon name="🔋" /></view>
            <view class="item-main">
              <view class="tip-title">守护设备</view>

            </view>
            <AppIcon name="chevron" />
          </view>
          <view class="grid2 action-row">

            <BigButton tone="white" @click="openDevice">查看设备</BigButton>
          </view>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">隐私与权限</view>
      </view>
      <view class="list flush section-gap">
        <ListItem icon="🔐" title="数据访问权限" desc="查看你能访问哪些老人数据" tag="已授权" @click="openPrivacy" />
        <ListItem icon="🙈" title="隐私说明" desc="了解哪些内容不会被采集" tag="保护中" @click="openPrivacy" />
        <ListItem icon="users" title="家庭成员管理" :chev="false" @click="toast('家庭成员管理')" />
      </view>
    </template></AppPage>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import BigButton from '@/components/BigButton.vue'
import HeroTitle from '@/components/HeroTitle.vue'
import ListItem from '@/components/ListItem.vue'
import PrivacyToggle from '@/components/PrivacyToggle.vue'
import BoundElderCard from '@/components/family/BoundElderCard.vue'
import FamilyPageHeader from '@/components/family/FamilyPageHeader.vue'
import FamilyPageSkeleton from '@/components/family/FamilyPageSkeleton.vue'
import { useFamilyElderContext } from '@/composables/useFamilyElderContext'
import { useFamilyStore } from '@/stores/family'
import { goDetail } from '@/utils/navigate'

const family = useFamilyStore()
const { guardian, elder, switching, careStore } = useFamilyElderContext()

onShow(() => {
  void careStore.hydrateNotificationRules({ force: false })
})

const notificationEnabled = computed(() => careStore.notificationRules.every((item) => item.enabled))

async function switchToElder(elderId: string) {
  await guardian.switchElder(elderId)
}

function openContact() {
  goDetail('/pkg-elder-detail/contact-detail/index')
}

function openDevice() {
  goDetail('/pkg-elder-detail/device/index')
}

function openPrivacy() {
  goDetail('/pkg-elder-detail/privacy/index')
}

function toast(title: string) {
  uni.showToast({ title: `${title}（演示）`, icon: 'none' })
}
</script>

<style scoped lang="scss">
.profile-hero {
  padding: 20px;
}

.profile-icon {
  width: 72px;
  height: 72px;
  border-radius: 26px;
  font-size: 38px;
}

.stats {
  margin-top: 16px;
}

.stat-card {
  padding: 12px;
  text-align: center;
}

.stat-num {
  display: block;
  margin-top: 6px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.stat-num.warm {
  color: var(--warm);
}

.compact-top {
  margin-top: 0;
}

.bound-item + .bound-item {
  margin-top: 12px;
}

.bind-methods {
  margin-top: 14px;
}

.bind-card {
  min-height: 116px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.bind-title {
  display: block;
  margin-top: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.bind-desc {
  margin-top: 5px;
  font-size: var(--helper-size, 16px);
  line-height: 1.35;
}

.section-gap {
  padding: 0 24px;
}

.rule-item {
  width: 100%;
}

.device-tip {
  padding: 16px;
  border-radius: 28px;
}

.tip-title {
  font-size: 18px;
  font-weight: 600;
}

.tip-copy {
  margin-top: 6px;
  line-height: 1.5;
  font-size: var(--helper-size, 16px);
}

.action-row {
  margin-top: 16px;
}
</style>
