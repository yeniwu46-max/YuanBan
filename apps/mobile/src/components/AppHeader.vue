<script setup lang="ts">
import { goBack as navigateBack, goReplace, goRoute } from '@/utils/navigate'
import { useSessionStore } from '@/stores/session'
import AppIcon from './AppIcon.vue'
import YuanMascot from './YuanMascot.vue'
const session = useSessionStore()
const props = withDefaults(defineProps<{label?:string;title:string;back?:string;compact?:boolean;useBack?:boolean}>(),{label:'',back:'',compact:false,useBack:true})
function goBack(){if(props.back && !props.useBack) goReplace(props.back);else navigateBack(props.back || '/pages/login-welcome/index')}
</script>
<template><view class="header"><button v-if="back" class="iconbtn" aria-label="返回上一页" @click="goBack"><AppIcon name="back"/></button><view class="item-main"><view v-if="label" class="label">{{label}}</view><view class="h1">{{title}}</view></view><button v-if="session.isElder" class="iconbtn" aria-label="打开小鼋陪伴" @click="goRoute('/pages/companion/index')"><YuanMascot size="small" portrait/></button></view></template>
