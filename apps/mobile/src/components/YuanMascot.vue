<template>
  <view class="yuanwrap" :class="[`shape-${shape}`, `wrap-${size}`]">
    <view class="yuan" :class="size">
      <view class="head"></view>
      <view class="body"></view>
      <view class="eye-l"></view>
      <view class="eye-r"></view>
      <view class="mouth"></view>
      <text v-if="heart" class="heart">♥</text>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'small' | 'normal' | 'large' | 'xlarge'
  shape?: 'circle' | 'square' | 'mini'
  heart?: boolean
}>(), {
  size: 'normal',
  shape: 'circle',
  heart: false
})

</script>

<style scoped lang="scss">
.yuanwrap {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fff5;
  border: 4px solid #fff;
  box-shadow: inset 0 2px 12px rgba(64, 90, 55, 0.12);
  flex-shrink: 0;
}

.yuanwrap.wrap-small {
  width: 48px;
  height: 48px;
  border-radius: 18px;
}

.yuanwrap.wrap-normal {
  width: 86px;
  height: 86px;
  border-radius: 50%;
}

.yuanwrap.wrap-large {
  width: 112px;
  height: 112px;
  border-radius: 36px;
}

.yuanwrap.wrap-xlarge {
  width: 220px;
  height: 220px;
  border-radius: 58px;
  background: #e7f3df;
  border: 1px solid #cbe2bf;
}

.yuan {
  position: relative;
  width: 64px;
  height: 64px;
}

.yuan.small {
  width: 36px;
  height: 36px;
}

.yuan.large {
  width: 86px;
  height: 86px;
}

.yuan.xlarge {
  width: 118px;
  height: 118px;
}

.head,
.body,
.eye-l,
.eye-r,
.mouth {
  position: absolute;
}

.head {
  left: 22%;
  top: 7%;
  width: 56%;
  height: 38%;
  border-radius: 999px 999px 8px 8px;
  background: #7ab66b;
}

.body {
  left: 8%;
  top: 35%;
  width: 84%;
  height: 45%;
  border-radius: 999px;
  background: #87c977;
}

.eye-l,
.eye-r {
  top: 47%;
  width: 8%;
  height: 8%;
  border-radius: 50%;
  background: #26382f;
}

.eye-l {
  left: 27%;
}

.eye-r {
  right: 27%;
}

.mouth {
  left: 40%;
  top: 63%;
  width: 20%;
  height: 5%;
  border-radius: 999px;
  background: rgba(38, 56, 47, 0.45);
}

.heart {
  position: absolute;
  left: 0;
  top: 4%;
  color: #e88379;
  font-size: 20px;
}
</style>
