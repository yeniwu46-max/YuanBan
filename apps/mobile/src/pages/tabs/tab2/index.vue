<script setup lang="ts">
import TabShell from '@/components/TabShell.vue'
import CompanionPage from '@/pages/companion/index.vue'
import CarePage from '@/pages/family/care/index.vue'
import ActivityPage from '@/pages/community/activity/index.vue'

const views = {
  elder: CompanionPage,
  family: CarePage,
  community: ActivityPage
} as const
</script>

<template>
  <TabShell :views="views" />
</template>
