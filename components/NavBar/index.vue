<template>
  <view
    class="custom-nav-bar"
    :class="{ 'is-transparent': isTransparent }"
    :style="{ paddingTop: statusBarHeight + 'px', backgroundColor: bgColor }"
  >
    <view class="nav-content">
      <view class="back-area" @click="handleBack" v-if="showBack">
        <view class="back-btn">
          <text class="back-icon" :style="{ color: iconColor }">←</text>
        </view>
      </view>

      <text class="nav-title" :style="{ color: titleColor, textShadow: titleColor === '#ffffff' ? '0 2rpx 4rpx rgba(0,0,0,0.2)' : 'none' }">{{ title }}</text>

      <view class="right-placeholder"></view>
    </view>
  </view>

  <view v-if="!isTransparent && placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: { type: String, default: '' },
  isTransparent: { type: Boolean, default: false },
  showBack: { type: Boolean, default: true },
  bgColor: { type: String, default: 'transparent' },
  titleColor: { type: String, default: '#2c2416' },
  placeholder: { type: Boolean, default: true }
});

const statusBarHeight = ref(20);
const systemInfo = uni.getSystemInfoSync();
if (systemInfo.statusBarHeight) statusBarHeight.value = systemInfo.statusBarHeight;

const iconColor = computed(() => {
  if (props.isTransparent) return '#ffffff';
  if (props.bgColor === 'transparent') return '#2c2416';
  return '#2c2416';
});

const handleBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.switchTab({ url: '/pages/Main/index' });
  }
};
</script>

<style scoped>
.custom-nav-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 999;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0,0,0,0.03); transition: all 0.3s ease;
}
.custom-nav-bar.is-transparent {
  background: transparent !important;
  backdrop-filter: none;
  border-bottom: none;
}
.nav-content { height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 30rpx; position: relative; }
.back-area { width: 80rpx; height: 100%; display: flex; align-items: center; z-index: 2;}
.back-btn { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.back-btn { background: rgba(0, 0, 0, 0.08); border: 1px solid rgba(0,0,0,0.06); }
.back-icon { font-size: 36rpx; font-weight: bold; margin-top: -4rpx; }
.nav-title { position: absolute; left: 0; right: 0; text-align: center; font-size: 34rpx; font-weight: 700; letter-spacing: 1rpx; z-index: 1; pointer-events: none; }
.right-placeholder { width: 80rpx; }
</style>