<script setup lang="ts">
import ElderSwitcher from './ElderSwitcher.vue'
import AppIcon from '../AppIcon.vue'
import { goRoute } from '@/utils/navigate'
withDefaults(defineProps<{label?:string;title?:string;switchable?:boolean}>(),{label:'',title:'',switchable:false})
</script>
<template><view class="header"><ElderSwitcher v-if="switchable" :label="label"/><view v-else class="item-main"><view v-if="label" class="label">{{label}}</view><view class="h1">{{title}}</view></view><button class="iconbtn" aria-label="通知设置" @click="goRoute('/pages/family/settings/index')"><AppIcon name="bell"/></button></view></template>
