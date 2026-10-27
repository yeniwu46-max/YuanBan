<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTrendStore } from '@/stores/trend'
import { metricPresentation } from '@/utils/trends'
// #ifdef H5
import Skeleton from './ui/Skeleton.vue'
// #endif
const props = withDefaults(defineProps<{ elderId: string; metric: string; days?: number }>(), {
  days: 7,
})
const store = useTrendStore(),
  expanded = ref(false)
const entry = computed(() => store.entries[store.key(props.elderId, props.metric, props.days)])
const data = computed(() => entry.value?.data)
const title = computed(() => metricPresentation[props.metric]?.title || '指标')
watch(
  () => [props.elderId, props.metric, props.days],
  () => {
    expanded.value = false
    void store.load(props.elderId, props.metric, props.days)
  },
  { immediate: true },
)
const range = computed(() => {
  const values = data.value?.points.flatMap((p) => p.values) || [0]
  const min = Math.min(...values),
    max = Math.max(...values),
    pad = Math.max((max - min) * 0.2, 1)
  return { min: Math.max(0, min - pad), max: max + pad }
})
const xy = (index: number, series: number) => {
  const points = data.value?.points || []
  const first = Date.parse(points[0]?.time || ''),
    last = Date.parse(points[points.length - 1]?.time || '')
  const t = Date.parse(points[index]?.time || '')
  return {
    x: last === first ? 170 : 30 + ((t - first) / (last - first)) * 280,
    y:
      150 -
      (((points[index]?.values[series] || 0) - range.value.min) /
        (range.value.max - range.value.min)) *
        120,
  }
}
const line = (series: number) =>
  (data.value?.points || [])
    .map((_, i) => {
      const p = xy(i, series)
      return `${p.x},${p.y}`
    })
    .join(' ')
const timeLabel = (time: string) =>
  new Date(time).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
const summary = computed(() => {
  const p = data.value?.points || []
  if (!p.length) return ''
  return data
    .value!.labels.map(
      (label, i) =>
        `${label} ${Math.min(...p.map((r) => r.values[i]))}–${Math.max(...p.map((r) => r.values[i]))} ${data.value!.unit}`,
    )
    .join('；')
})
function retry() {
  void store.load(props.elderId, props.metric, props.days, true)
}
</script>
<template>
  <view class="trend-panel card" :aria-busy="entry?.status === 'loading'">
    <view class="between">
      <view class="h2">{{ title }}趋势</view>
      <text class="data-source">近 {{ days }} 天</text>
    </view>
    <view v-if="!entry || entry.status === 'loading'" role="status" class="trend-loading">
      <!-- #ifdef H5 -->
      <Skeleton style="height: 150px; margin: 16px 0" />
      <!-- #endif -->
      <text>正在读取历史记录…</text>
    </view>
    <view v-else-if="entry.status === 'error'" role="alert" class="trend-empty">
      <text>{{ entry.error }}</text>
      <button class="link" @click="retry">
        重新加载
        <AppIcon name="refresh" :size="18" />
      </button>
    </view>
    <template v-else>
      <view class="data-source source-label">
        {{ data?.source === 'mock' ? '来源：示例' : '来源：健康记录' }}
      </view>
      <view v-if="!data?.points.length" class="trend-empty">
        该长辈在此时间范围内暂无有效{{ title }}记录。
      </view>
      <template v-else>
        <view class="trend-summary">{{ summary }}</view>
        <!-- #ifdef H5 -->
        <svg
          class="trend-svg"
          viewBox="0 0 340 185"
          role="img"
          :aria-label="`${title}趋势，${summary}。展开记录可阅读全部数据。`"
        >
          <g v-for="y in [30, 90, 150]" :key="y">
            <line x1="30" x2="310" :y1="y" :y2="y" stroke="#dcebef" stroke-dasharray="3 5" />
          </g>
          <g v-for="(label, series) in data.labels" :key="label">
            <polyline
              v-if="data.points.length > 1"
              :points="line(series)"
              fill="none"
              :stroke="series === 0 ? '#216ac2' : '#9b6b30'"
              :stroke-dasharray="series === 0 ? undefined : '6 4'"
              stroke-width="3"
              stroke-linejoin="round"
            />
            <circle
              v-for="(point, i) in data.points"
              :key="point.time"
              :cx="xy(i, series).x"
              :cy="xy(i, series).y"
              r="4"
              :fill="series === 0 ? '#216ac2' : '#9b6b30'"
            />
          </g>
        </svg>
        <!-- #endif -->
        <view class="trend-axis data-source">
          <text>{{ timeLabel(data.points[0].time) }}</text>
          <text>{{ timeLabel(data.points[data.points.length - 1]!.time) }}</text>
        </view>
        <view class="trend-legend">
          <text v-for="(label, i) in data.labels" :key="label" :class="{ secondary: i === 1 }">
            {{ i === 0 ? '实线' : '虚线' }} · {{ label }}
          </text>
        </view>
        <view class="data-source">
          最近记录：{{ timeLabel(data.points[data.points.length - 1]!.time) }} ·
          {{ data.points.length }} 条
        </view>
        <button class="link" :aria-expanded="expanded" @click="expanded = !expanded">
          {{ expanded ? '收起' : '展开' }}完整记录
          <AppIcon name="down" :size="18" />
        </button>
        <view v-if="expanded" class="trend-records">
          <view v-for="p in data.points" :key="p.time" class="trend-record">
            <text>{{ timeLabel(p.time) }}</text>
            <text>{{ p.values.join(' / ') }} {{ data.unit }}</text>
          </view>
        </view>
      </template>
      <view v-if="data?.invalidCount" class="data-source">
        {{ data.invalidCount }} 条无效记录未绘制。
      </view>
    </template>
  </view>
</template>
<style scoped>
.trend-panel {
  padding: 22px;
  min-width: 0;
}
.source-label {
  margin-top: 10px;
}
.trend-summary {
  margin-top: 16px;
  font-size: 16px;
  color: var(--text);
}
.trend-svg {
  display: block;
  width: 100%;
  height: auto;
  max-height: 240px;
  margin: 8px 0;
}
.trend-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 16px;
  color: var(--primary);
}
.trend-axis { display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:16px; }
.trend-legend .secondary {
  color: var(--warm);
}
.trend-empty {
  padding: 30px 0;
  color: var(--muted);
  font-size: 16px;
}
.trend-records {
  border-top: 1px solid var(--line);
}
.trend-record {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}
.trend-loading {
  padding: 20px 0;
  font-size: 16px;
  color: var(--muted);
}
</style>
