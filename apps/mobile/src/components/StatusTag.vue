<script setup lang="ts">
import type { SemanticStatus } from '@/types/presentation'
// #ifdef H5
import Badge from './ui/Badge.vue'
// #endif
withDefaults(defineProps<{label:string;tone?:SemanticStatus}>(),{tone:'normal'})
</script>
<template>
<!-- #ifdef H5 -->
<Badge :tone="tone">{{ label }}</Badge>
<!-- #endif -->
<!-- #ifndef H5 -->
<text class="ui-badge" :class="`ui-badge--${tone}`">{{ label }}</text>
<!-- #endif -->
</template>
