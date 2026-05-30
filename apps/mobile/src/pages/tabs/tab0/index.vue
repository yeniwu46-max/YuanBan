<script setup lang="ts">
import TabShell from '@/components/TabShell.vue'
import HomePage from '@/pages/home/index.vue'
import GuardianPage from '@/pages/family/guardian/index.vue'
import DashboardPage from '@/pages/community/dashboard/index.vue'

const views = {
  elder: HomePage,
  family: GuardianPage,
  community: DashboardPage
} as const
</script>

<template>
  <TabShell :views="views" />
</template>
