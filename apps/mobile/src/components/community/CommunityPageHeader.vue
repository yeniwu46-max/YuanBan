<script setup lang="ts">
import { goBack, goRoute } from '@/utils/navigate'
import AppIcon from '../AppIcon.vue'
const props = withDefaults(defineProps<{label?:string;title:string;showBack?:boolean;backFallback?:string;notifyDot?:boolean}>(),{label:'',showBack:false,backFallback:'/pages/community/dashboard/index',notifyDot:true})
</script>
<template><view class="header"><button v-if="showBack" class="iconbtn" aria-label="返回工作台" @click="goBack(props.backFallback)"><AppIcon name="back"/></button><view class="item-main"><view v-if="label" class="label">{{label}}</view><view class="h1">{{title}}</view></view><button class="iconbtn" aria-label="查看待办工单" @click="goRoute('/pages/community/workorders/index')"><AppIcon name="clipboard"/></button></view></template>
