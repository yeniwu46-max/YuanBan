<!-- Adapted from shadcn-vue new-york-v4/ui/badge/Badge.vue; see THIRD_PARTY.md. -->
<script setup lang="ts">
import { Primitive } from 'reka-ui'
withDefaults(defineProps<{ tone?: string }>(), { tone: 'normal' })
</script>
<template>
  <Primitive as="span" data-slot="badge" class="ui-badge" :class="`ui-badge--${tone}`">
    <slot />
  </Primitive>
</template>
