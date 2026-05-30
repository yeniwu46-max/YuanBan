<script setup lang="ts">
import TabShell from '@/components/TabShell.vue'
import ServicePage from '@/pages/service/index.vue'
import SettingsPage from '@/pages/family/settings/index.vue'
import ProfilePage from '@/pages/community/profile/index.vue'

const views = {
  elder: ServicePage,
  family: SettingsPage,
  community: ProfilePage
} as const
</script>

<template>
  <TabShell :views="views" />
</template>
