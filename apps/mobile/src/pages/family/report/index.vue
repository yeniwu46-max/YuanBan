<script setup lang="ts">
import { computed, watch } from 'vue'
import FamilyPageHeader from '@/components/family/FamilyPageHeader.vue'
import FamilyPageSkeleton from '@/components/family/FamilyPageSkeleton.vue'
import HealthMetricCard from '@/components/HealthMetricCard.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import TrendPanel from '@/components/TrendPanel.vue'
import BigButton from '@/components/BigButton.vue'
import StatusTag from '@/components/StatusTag.vue'
// #ifdef H5
import Tabs from '@/components/ui/Tabs.vue'
// #endif
import { useFamilyElderContext } from '@/composables/useFamilyElderContext'
import { useHealthStore } from '@/stores/health'
import { useApiMode } from '@/config/apiMode'
import { goRoute } from '@/utils/navigate'
import type { ApiReportPeriod } from '@/types/family'
const health = useHealthStore()
const { elderId, reportStore, reportAnomalies, alertStore } = useFamilyElderContext()
const options = [
  { value: 'day', label: '日报' },
  { value: 'week', label: '周报' },
  { value: 'month', label: '月报' },
]
const period = computed<string>({
  get: () => health.reportTab,
  set: (value: string) => health.setReportTab(value as ApiReportPeriod),
})
const days = computed(() => ({ day: 1, week: 7, month: 30 })[health.reportTab])
const report = computed(() => reportStore.reportByElder(elderId.value, health.reportTab))
const error = computed(() => reportStore.errors[elderId.value + ':' + health.reportTab])
const loading = computed(() => reportStore.pending[elderId.value + ':' + health.reportTab])
watch(
  () => [elderId.value, health.reportTab],
  () => {
    void reportStore.hydrate(elderId.value, health.reportTab)
  },
  { immediate: true },
)
function showMetric(title: string) {
  uni.showToast({ title, icon: 'none' })
}
function openAnomaly(id?: string) {
  if (id) {
    alertStore.setActiveAlert(id)
    goRoute('/pkg-family-detail/family/alert/index')
  } else uni.showToast({ title: '此记录暂无关联告警详情', icon: 'none' })
}
</script>
<template>
  <AppPage class="family-page">
    <FamilyPageHeader label="健康报告" switchable />
    <view class="section">
      <!-- #ifdef H5 -->
      <Tabs v-model="period" :options="options" label="报告时间范围">
        <view class="data-source">

          {{ days === 1 ? '最近一天' : '最近 ' + days + ' 天' }}
        </view>
      </Tabs>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="tabbar">
        <button v-for="o in options" :key="o.value" class="tabbar-btn" @click="period = o.value">
          {{ o.label }}
        </button>
      </view>
      <!-- #endif -->
    </view>
    <FamilyPageSkeleton v-if="loading" />
    <view v-else-if="error" class="section">
      <view class="feedback-panel" role="alert">
        {{ error }}
        <button
          class="link"
          @click="reportStore.hydrate(elderId, health.reportTab, { force: true })"
        >
          重试加载
        </button>
      </view>
    </view>
    <template v-else-if="report">
      <view class="section">
        <view class="hero green report-hero">
          <view class="report-heading">
            <view class="item-main">

              <view class="hero-title">{{ report.headline }}</view>

            </view>
            <view class="report-score">
              <text>{{ report.healthScore }}</text>
              <view>健康分</view>
            </view>
          </view>
          <view class="report-stats">
            <view>
              <text>{{ report.riskCount }}</text>
              <view>风险提醒</view>
            </view>
            <view>
              <text>
                {{ report.medicineDonePercent }}
                <small>%</small>
              </text>
              <view>服药完成</view>
            </view>
            <view>
              <text>
                {{ report.avgSleepHours }}
                <small>h</small>
              </text>
              <view>平均睡眠</view>
            </view>
          </view>
        </view>
      </view>
      <view class="section">
        <view class="report-interpretation">
          <YuanMascot size="small" :state="report.riskCount ? 'reminder' : 'encouraging'" />
          <view class="item-main">
            <view class="h2">小鼋解读</view>
            <view class="desc">{{ report.yuanInterpretation }}</view>
          </view>
        </view>
      </view>
      <view class="section-title">
        <view class="h2">核心指标</view>
        <StatusTag
          :label="report.deviceStatusLabel"
          :tone="report.deviceStatusLabel === '离线' ? 'warm' : 'normal'"
        />
      </view>
      <view class="section compact">
        <view class="grid2">
          <HealthMetricCard
            v-for="item in report.metrics"
            :key="item.key"
            :metric="item"
            :icon="item.key"
            @click="showMetric(item.description)"
          />
        </view>
      </view>
    </template>
    <view v-else class="section">
      <view class="feedback-panel">该长辈在此时间范围内暂无健康报告。</view>
    </view>
    <view class="section-title"><view class="h2">近期变化</view></view>
    <view class="section compact responsive-columns">
      <TrendPanel :elder-id="elderId" metric="bloodPressure" :days="days" />
      <TrendPanel :elder-id="elderId" metric="sleep" :days="days" />
    </view>
    <view class="section-title">
      <view class="h2">异常记录</view>
      <text class="data-source">{{ reportAnomalies.length }} 条</text>
    </view>
    <view class="list">
      <button
        v-for="item in reportAnomalies"
        :key="item.id"
        class="item"
        @click="openAnomaly(item.alertId)"
      >
        <view class="iconbox warm"><AppIcon name="alert" /></view>
        <view class="item-main">
          <view class="item-title">{{ item.title }}</view>
          <view class="desc">{{ item.description }}</view>
        </view>
        <StatusTag :label="item.tag" :tone="item.tagTone" />
      </button>
      <view v-if="!reportAnomalies.length" class="feedback-panel">
        暂无异常记录，继续保持日常关怀。
      </view>
    </view>
    <view v-if="report" class="section">
      <view class="feedback-panel">
        <view class="h2">下一步，可以这样关心</view>
        <view class="desc">{{ report.familyAdvice }}</view>
        <BigButton
          tone="white"
          style="margin-top: 20px"
          @click="goRoute('/pages/family/care/index')"
        >
          <AppIcon name="care" />
          去关怀
        </BigButton>
      </view>
    </view>
  </AppPage>
</template>
<style scoped>
.compact {
  margin-top: 0;
}
.report-heading {
  display: flex;
  align-items: center;
  gap: 20px;
}
.report-eyebrow {
  font-size: 12px;
  letter-spacing: 0.14em;
  color: #b9dbc9;
  margin-bottom: 12px;
}
.report-copy {
  font-size: 16px;
  color: var(--hero-ink);
  margin-top: 12px;
}
.report-score {
  text-align: center;
  flex-shrink: 0;
  color: var(--hero-ink);
  font-size: 14px;
}
.report-score > text {
  font-size: 56px;
  line-height: 1.1;
  letter-spacing: -0.06em;
  color: white;
}
.report-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ffffff26;
  color: var(--hero-ink);
  font-size: 14px;
}
.report-stats text {
  font-size: 30px;
  color: white;
  letter-spacing: -0.03em;
}
.report-stats small {
  font-size: 16px;
  margin-left: 3px;
}
.report-interpretation {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 18px 22px;
  border-radius: 20px;
  background: var(--warm-soft);
}
@media (max-width: 767px) {
  .responsive-columns > view + view {
    margin-top: 20px;
  }
}
@media (max-width: 359px) {
  .report-heading {
    align-items: flex-start;
    gap: 12px;
  }
  .report-score > text {
    font-size: 44px;
  }
}
</style>
