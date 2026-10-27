<!-- Adapted from shadcn-vue Tabs, TabsList, TabsTrigger; retains Reka roving focus/ARIA. -->
<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'
defineProps<{ modelValue: string; options: { label: string; value: string }[]; label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
<template>
  <TabsRoot
    :model-value="modelValue"
    class="ui-tabs"
    @update:model-value="emit('update:modelValue', String($event))"
  >
    <TabsList data-slot="tabs-list" class="ui-tabs-list" :aria-label="label || '内容切换'">
      <TabsTrigger
        v-for="item in options"
        :key="item.value"
        data-slot="tabs-trigger"
        :value="item.value"
        class="ui-tabs-trigger"
      >
        {{ item.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="item in options"
      :key="item.value"
      :value="item.value"
      class="ui-tabs-content"
    >
      <slot :value="item.value" />
    </TabsContent>
  </TabsRoot>
</template>
