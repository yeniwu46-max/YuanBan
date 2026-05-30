<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useSessionStore } from '@/stores/session'
import type { UserRole } from '@/types/family'

const props = defineProps<{
  views: Record<UserRole, Component>
}>()

const session = useSessionStore()

const activeView = computed(() => props.views[session.role])
</script>

<template>
  <keep-alive>
    <component :is="activeView" />
  </keep-alive>
</template>
