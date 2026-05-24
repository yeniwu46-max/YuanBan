<template>
  <view class="app-page family-page">
    <FamilyPageHeader label="子女端 · 设置中心" title="设置与绑定" />

    <FamilyPageSkeleton v-if="switching" />

    <template v-else>
      <view class="section">
        <view class="hero green profile-hero">
          <view class="row row-top">
            <view class="iconbox profile-icon">👤</view>
            <view>
              <view class="pill">🛡️ 已绑定 {{ guardian.elders.length }} 位老人</view>
              <view class="hero-title">当前守护对象：{{ elder?.name ?? '未选择' }}</view>
              <view class="muted hero-desc">
                关系：{{ family.profile.relation }} · 权限：{{ family.profile.role === 'primary' ? '主要联系人' : '次要联系人' }}
              </view>
            </view>
          </view>
          <view class="grid3 stats">
            <view class="card stat-card">
              <text class="muted">通知规则</text>
              <text class="stat-num">{{ notificationEnabled ? '已开启' : '已关闭' }}</text>
            </view>
            <view class="card stat-card">
              <text class="muted">紧急权限</text>
              <text class="stat-num warm">{{ family.profile.role === 'primary' ? '主要' : '次要' }}</text>
            </view>
            <view class="card stat-card">
              <text class="muted">设备协助</text>
              <text class="stat-num">可管理</text>
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
          @permission="toast('权限设置')"
          @contact="toast('联系老人')"
          @select="switchToElder(item.id)"
        />
        <view class="grid2 bind-methods">
          <button class="quick bind-card" @click="toast('扫码绑定')">
            <view class="iconbox">▣</view>
            <text class="bind-title">扫码绑定</text>
            <text class="muted bind-desc">扫描老人端二维码</text>
          </button>
          <button class="quick bind-card" @click="toast('邀请码绑定')">
            <view class="iconbox warm">🔗</view>
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
          <view class="iconbox" :class="rule.iconTone">{{ rule.icon }}</view>
          <view class="item-main">
            <view class="item-title">{{ rule.title }}</view>
            <view class="desc">{{ rule.description }}</view>
          </view>
          <PrivacyToggle
            :model-value="rule.enabled"
            @update:model-value="(enabled) => careStore.setNotificationRule(rule.key, enabled)"
          />
        </view>
      </view>

      <view class="section">
        <view class="hero warm device-tip">
          <view class="row">
            <view class="iconbox warm">🔋</view>
            <view class="item-main">
              <view class="tip-title">SOS 按钮电量偏低</view>
              <view class="muted tip-copy">当前电量 23%，建议尽快帮老人检查或更换电池。</view>
            </view>
            <text class="chev">›</text>
          </view>
          <view class="grid2 action-row">
            <BigButton tone="warm" @click="toast('提醒家人')">💬 提醒家人</BigButton>
            <BigButton tone="white" @click="toast('查看设备')">📶 查看设备</BigButton>
          </view>
        </view>
      </view>

      <view class="section-title">
        <view class="h2">隐私与权限</view>
      </view>
      <view class="list flush section-gap">
        <ListItem icon="🔐" title="数据访问权限" desc="查看你能访问哪些老人数据" tag="已授权" :chev="false" />
        <ListItem icon="🙈" title="隐私说明" desc="了解哪些内容不会被采集" tag="保护中" :chev="false" />
        <ListItem icon="👪" title="家庭成员管理" desc="添加兄弟姐妹或其他联系人" tag="3 人" :chev="false" />
      </view>
    </template>

    <FamilyBottomNav active="settings" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BigButton from '@/components/BigButton.vue'
import ListItem from '@/components/ListItem.vue'
import PrivacyToggle from '@/components/PrivacyToggle.vue'
import BoundElderCard from '@/components/family/BoundElderCard.vue'
import FamilyBottomNav from '@/components/family/FamilyBottomNav.vue'
import FamilyPageHeader from '@/components/family/FamilyPageHeader.vue'
import FamilyPageSkeleton from '@/components/family/FamilyPageSkeleton.vue'
import { useFamilyElderContext } from '@/composables/useFamilyElderContext'
import { useFamilyStore } from '@/stores/family'

const family = useFamilyStore()
const { guardian, elder, switching, careStore } = useFamilyElderContext()

const notificationEnabled = computed(() => careStore.notificationRules.every((item) => item.enabled))

async function switchToElder(elderId: string) {
  await guardian.switchElder(elderId)
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

.hero-title {
  margin-top: 12px;
  font-size: 23px;
  line-height: 1.35;
  font-weight: 1000;
}

.hero-desc {
  margin-top: 8px;
  line-height: 1.5;
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
  font-weight: 1000;
  color: #243a31;
}

.stat-num.warm {
  color: #c9822c;
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
  font-weight: 1000;
  color: #243a31;
}

.bind-desc {
  margin-top: 5px;
  font-size: 13px;
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
  font-weight: 900;
}

.tip-copy {
  margin-top: 6px;
  line-height: 1.5;
  font-size: 14px;
}

.action-row {
  margin-top: 16px;
}
</style>
