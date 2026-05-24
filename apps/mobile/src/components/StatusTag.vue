<template>
  <text class="tag" :class="tone">{{ label }}</text>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  tone?: 'normal' | 'warm' | 'red' | 'gray'
}>(), {
  tone: 'normal'
})
</script>

<style scoped lang="scss">
.tag {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  background: #e6f2df;
  color: #5b8b62;
  white-space: nowrap;
}

.warm {
  background: #fff0d6;
  color: #c9822c;
}

.red {
  background: #ffe0da;
  color: #e56b5f;
}

.gray {
  background: #f4efe5;
  color: #8e816e;
}
</style>

