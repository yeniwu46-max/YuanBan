<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()

const PageView = computed(() => {
  const loaders = {
    elder: () => import('@/pages/service/index.vue'),
    family: () => import('@/pages/family/settings/index.vue'),
    community: () => import('@/pages/community/profile/index.vue')
  } as const
  return defineAsyncComponent(loaders[session.role])
})
</script>

<template>
  <component :is="PageView" />
</template>
