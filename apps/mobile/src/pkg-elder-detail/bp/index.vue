<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BigButton from '@/components/BigButton.vue'
import TrendPanel from '@/components/TrendPanel.vue'
import { useHealthStore } from '@/stores/health'
import { useElderContext } from '@/composables/useElderContext'
import { goRoute } from '@/utils/navigate'
const health = useHealthStore(),
  { elderId } = useElderContext()
const metric = computed(() => health.metricByKey('bloodPressure'))
onShow(() => { void health.hydrate(elderId.value) })
</script>
<template>
  <AppPage :data-source="health.dataSource">
    <AppHeader title="血压详情" back="/pages/health/index" />
    <view class="section">
      <view class="hero green">
        <view class="row">
          <AppIcon name="activity" />
          <text>最新血压摘要</text>
        </view>
        <view class="bp-value">
          {{ metric?.value ?? '—' }}
          <text>mmHg</text>
        </view>
        <view class="desc">
          {{ metric?.description || '暂无血压摘要，请查看记录或稍后重试。' }}
        </view>
      </view>
    </view>
    <view class="section"><TrendPanel :elder-id="elderId" metric="bloodPressure" :days="7" /></view>
    <view class="section">
      <BigButton tone="white" @click="goRoute('/pkg-elder-detail/family/index')">
        <AppIcon name="phone" />
        联系家人
      </BigButton>
      <view class="desc" style="margin-top: 16px">数据用于日常健康记录，不替代医生诊断。</view>
    </view>
  </AppPage>
</template>
<style scoped>
.bp-value {
  font-size: 44px;
  line-height: 1.3;
  margin: 18px 0;
  letter-spacing: -0.04em;
}
.bp-value text {
  font-size: 16px;
  letter-spacing: 0;
  color: var(--hero-ink);
}
</style>
