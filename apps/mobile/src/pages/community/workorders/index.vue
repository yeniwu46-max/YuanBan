<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import WdInput from 'wot-design-uni/components/wd-input/wd-input.vue'
import CommunityPageHeader from '@/components/community/CommunityPageHeader.vue'
import WorkOrderCard from '@/components/community/WorkOrderCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import YuanMascot from '@/components/YuanMascot.vue'
// #ifdef H5
import Table from '@/components/ui/Table.vue'
import Tabs from '@/components/ui/Tabs.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
// #endif
import { useCommunityStore } from '@/stores/community'
import { useCommunityWorkorderStore } from '@/stores/communityWorkorder'
import { useApiMode } from '@/config/apiMode'
import { goRoute } from '@/utils/navigate'
import type { WorkOrder, WorkOrderTab } from '@/types/community'
const community = useCommunityStore(),
  store = useCommunityWorkorderStore(),
  query = ref('')
const tab = computed<string>({
  get: () => store.activeTab,
  set: (value: string) => store.setTab(value as WorkOrderTab),
})
const options = [
  { value: 'urgent', label: '紧急' },
  { value: 'visit', label: '上门' },
  { value: 'device', label: '设备' },
  { value: 'done', label: '已完成' },
]
const rows = computed(() =>
  store.filteredOrders.filter((order) =>
    (order.title + ' ' + order.description + ' ' + order.code)
      .toLowerCase()
      .includes(query.value.trim().toLowerCase()),
  ),
)
onShow(() => {
  void store.fetchOrders()
})
function openOrder(order: WorkOrder) {
  if (order.tab === 'urgent' || order.tab === 'done')
    goRoute('/pkg-community-detail/community/alert/index?id=' + order.id)
  else uni.showToast({ title: '此工单的扩展处置流程仍在演示阶段', icon: 'none' })
}
</script>
<template>
  <AppPage class="community-page">
    <CommunityPageHeader title="工单中心" />
    <view class="section">
      <view class="hero green work-hero">
        <view>

          <view class="work-total">
            {{ store.poolStats.pendingCount }}
            <text>项待处理</text>
          </view>
          <view class="work-note">值班社工 {{ community.site.dutyStaff }}</view>
        </view>
        <view class="work-urgent">
          <text>{{ store.poolStats.urgentCount }}</text>
          <view>紧急待办</view>
        </view>
      </view>
    </view>
    <view class="section">
      <view class="work-toolbar">
        <view class="work-search">
          <WdInput
            v-model="query"
            prefix-icon="search"
            placeholder="搜索事项、工单编号或地址"
            clearable
          />
        </view>
        <button class="iconbtn" aria-label="刷新工单" @click="store.fetchOrders()">
          <AppIcon name="refresh" />
        </button>
      </view>
    </view>
    <view v-if="store.apiError" class="section">
      <view class="feedback-panel" role="alert">
        加载失败：{{ store.apiError }}。下方为此前已加载的内容，请刷新重试。
      </view>
    </view>
    <view class="section">
      <!-- #ifdef H5 -->
      <Tabs v-model="tab" :options="options" label="工单分类">
        <view class="data-source">
          {{ useApiMode() ? '已授权社区工单' : '演示工单 · 不会触发真实派单' }} ·
          {{ rows.length }} 项
        </view>
      </Tabs>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="tabbar">
        <button v-for="o in options" :key="o.value" @click="tab = o.value">
          {{ o.label }}
        </button>
      </view>
      <!-- #endif -->
      <view v-if="store.loading" role="status">
        <!-- #ifdef H5 -->
        <Skeleton style="height: 200px" />
        <!-- #endif -->
        <text>正在加载工单…</text>
      </view>
      <template v-else>
        <view class="mobile-only work-list">
          <WorkOrderCard
            v-for="order in rows"
            :key="order.id"
            :order="order"
            @click="openOrder(order)"
          />
        </view>
        <!-- #ifdef H5 -->
        <view class="desktop-only">
          <Table>
            <caption>{{ options.find((o) => o.value === tab)?.label }}工单</caption>
            <thead>
              <tr>
                <th scope="col">工单 / 事项</th>
                <th scope="col">摘要</th>
                <th scope="col">状态</th>
                <th scope="col">处理</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in rows" :key="order.id">
                <td>
                  <view class="table-title">{{ order.title }}</view>
                  <view class="data-source">{{ order.code }}</view>
                </td>
                <td>{{ order.description }}</td>
                <td>
                  <StatusTag
                    :label="order.tag"
                    :tone="
                      order.tagTone === 'green'
                        ? 'normal'
                        : order.tagTone === 'red'
                          ? 'red'
                          : 'warm'
                    "
                  />
                </td>
                <td>
                  <button class="link" :aria-label="'查看' + order.title" @click="openOrder(order)">
                    查看
                    <AppIcon name="chevron" :size="18" />
                  </button>
                </td>
              </tr>
            </tbody>
          </Table>
        </view>
        <!-- #endif -->
        <view v-if="!rows.length" class="feedback-panel">
          没有匹配的工单。试试其他分类，或清空搜索内容。
        </view>
      </template>
    </view>
    <view class="section">
      <view class="work-assistant">
        <YuanMascot
          size="small"
          :state="store.poolStats.urgentCount ? 'reminder' : 'encouraging'"
        />
        <view>
          <view class="item-title">小鼋值班提示</view>
          <view class="desc">
            {{
              store.poolStats.urgentCount
                ? '仍有紧急事项待处理，请优先核实长辈安全。'
                : '当前紧急事项已处理，可继续安排上门服务。'
            }}
          </view>
        </view>
      </view>
    </view>
  </AppPage>
</template>
<style scoped>
.work-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.work-eyebrow {
  font-size: 12px;
  letter-spacing: 0.14em;
  color: #b9dbc9;
}
.work-total {
  font-size: 52px;
  letter-spacing: -0.05em;
  line-height: 1.2;
  margin: 12px 0;
}
.work-total > text {
  font-size: 22px;
  letter-spacing: 0;
}
.work-note {
  font-size: 16px;
  color: var(--hero-ink);
}
.work-urgent {
  flex-shrink: 0;
  text-align: center;
  color: #f4c9be;
  font-size: 14px;
  border-left: 1px solid #ffffff30;
  padding-left: 24px;
}
.work-urgent > text {
  font-size: 44px;
}
.work-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
}
.work-search {
  flex: 1;
  min-width: 0;
  padding: 8px 16px;
  background: white;
  border: 1px solid var(--line);
  border-radius: 16px;
}
.work-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.work-assistant {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 20px;
  background: var(--warm-soft);
}
.table-title {
  font-weight: 600;
  margin-bottom: 6px;
}
@media (max-width: 359px) {
  .work-hero {
    gap: 12px;
  }
  .work-urgent {
    padding-left: 12px;
  }
  .work-total {
    font-size: 44px;
  }
}
</style>
