<script setup lang="ts">
import TabShell from '@/components/TabShell.vue'
import HealthPage from '@/pages/health/index.vue'
import ReportPage from '@/pages/family/report/index.vue'
import WorkordersPage from '@/pages/community/workorders/index.vue'

const views = {
  elder: HealthPage,
  family: ReportPage,
  community: WorkordersPage
} as const
</script>

<template>
  <TabShell :views="views" />
</template>
