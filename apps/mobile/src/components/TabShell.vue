<script setup lang="ts">
import { computed, type Component } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useSessionStore } from '@/stores/session'
import type { UserRole } from '@/types/family'
const props = defineProps<{views:Record<UserRole,Component>}>()
const session = useSessionStore()
const activeView = computed(() => props.views[session.role])
onShow(() => {
 // #ifdef H5
 uni.hideTabBar({animation:false,fail:()=>{}})
 // #endif
})
</script>
<template><component :is="activeView" :key="session.role" /></template>
