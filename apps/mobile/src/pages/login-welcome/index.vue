<script setup lang="ts">
import BigButton from '@/components/BigButton.vue'
import BrandLogo from '@/components/BrandLogo.vue'
import YuanMascot from '@/components/YuanMascot.vue'
import { goReplace } from '@/utils/navigate'
</script>
<template>
  <AppPage class="login-page welcome">
    <view class="welcome-inner">
      <view class="brand-lockup"><BrandLogo size="sm" /><view class="h1">鼋伴伴</view></view>
      <view class="welcome-art">
        <view class="welcome-orbit welcome-orbit--back" aria-hidden="true" />
        <YuanMascot size="xlarge" state="greeting" />
        <view class="welcome-orbit welcome-orbit--front" aria-hidden="true" />
      </view>
      <view class="welcome-features">
        <view><AppIcon name="shield" :size="26" /><text>安全守护</text></view>
        <view><AppIcon name="care" :size="26" /><text>亲情陪伴</text></view>
        <view><AppIcon name="mic" :size="26" /><text>小鼋陪伴</text></view>
      </view>
      <BigButton class="welcome-start" @click="goReplace('/pages/login-role/index')">开始使用<AppIcon name="arrow" /></BigButton>
    </view>
  </AppPage>
</template>
<style scoped lang="scss">
.welcome-inner { display:flex; flex-direction:column; min-height:calc(100dvh - 32px); box-sizing:border-box; padding:calc(28px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom)); }
.brand-lockup { display:flex; align-items:center; gap:12px; }
.brand-lockup .h1 { font-size:32px; letter-spacing:0; }
.welcome-art { position:relative; isolation:isolate; display:flex; align-items:center; justify-content:center; flex:1; min-height:320px; margin:20px -24px; overflow:hidden; background:radial-gradient(ellipse at center, #b9eff34d, transparent 65%); }
.welcome-art :deep(.yuan-mascot) { width:min(76vw, 340px); height:min(82vw, 360px); z-index:1; }
.welcome-orbit { position:absolute; width:108%; height:55%; border-radius:50%; transform:rotate(-27deg); pointer-events:none; box-sizing:border-box; }
.welcome-orbit--back { border:28px solid #42c1d340; border-top-color:#4b9cf0b0; box-shadow:inset 0 1px 0 #fff, 0 1px 0 #fff; }
.welcome-orbit--front { z-index:2; border:28px solid transparent; border-bottom-color:#16ada9ad; clip-path:inset(55% 0 0); }
@supports (mask: radial-gradient(closest-side, transparent 80%, black 81%)) {
  .welcome-orbit { border:0; background:linear-gradient(135deg,#88bdf6 5%,#39acd9 45%,#22b9a8 90%); mask:radial-gradient(closest-side,transparent calc(100% - 28px),black calc(100% - 27px)); }
  .welcome-orbit--back { opacity:.55; }
  .welcome-orbit--front { opacity:.9; }
}
.welcome-features { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin:12px 0 28px; }
.welcome-features > view { display:flex; flex-direction:column; align-items:center; gap:12px; padding:16px 4px; color:var(--primary); }
.welcome-features text { font-size:16px; color:var(--text); white-space:nowrap; }
.welcome-start { margin-top:auto; }
@media(max-width:359px) { .welcome-inner { padding-left:16px; padding-right:16px; } .welcome-art { min-height:280px; margin-left:-16px; margin-right:-16px; } }
</style>
