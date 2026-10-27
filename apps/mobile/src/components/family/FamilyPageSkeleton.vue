<script setup lang="ts">
// #ifdef H5
import Skeleton from '@/components/ui/Skeleton.vue'
// #endif
</script>
<template><view class="section" role="status" aria-label="正在加载长辈信息"><!-- #ifdef H5 --><Skeleton style="height:240px;margin-bottom:24px"/><view class="grid2"><Skeleton v-for="i in 4" :key="i" style="height:140px"/></view><!-- #endif --><view class="desc">正在加载长辈信息…</view></view></template>
