<template> 
  <view 
    class="custom-nav-bar" 
    :class="{ 'is-transparent': isTransparent }" 
    :style="{ paddingTop: statusBarHeight + 'px', background: customBackground }" 
  > 
    <view class="nav-content"> 
      <view class="back-area" @click="handleBack" v-if="showBack"> 
        <view class="back-btn" :class="{ 'dark-btn': !isTransparent }"> 
          <text class="back-icon">←</text> 
        </view> 
      </view> 

      <text class="nav-title" :class="{ 'dark-title': !isTransparent }">{{ title }}</text> 
      
      <view class="right-placeholder"></view> 
    </view> 
  </view> 

  <view v-if="!isTransparent && placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view> 
</template> 

<script setup> 
import { ref } from 'vue'; 

const props = defineProps({ 
  title: { type: String, default: '' }, 
  isTransparent: { type: Boolean, default: false }, // 是否透明模式 (盖在封面图上) 
  showBack: { type: Boolean, default: true }, // 是否显示返回箭头 
  customBackground: { type: String, default: '' }, 
  placeholder: { type: Boolean, default: true } // 是否撑开文档流占位 
}); 

// 计算 statusBarHeight 
const statusBarHeight = ref(20); 
const systemInfo = uni.getSystemInfoSync(); 
if (systemInfo.statusBarHeight) statusBarHeight.value = systemInfo.statusBarHeight; 

// 🚨 核心：智能返回逻辑 
const handleBack = () => { 
  const pages = getCurrentPages(); 
  if (pages.length > 1) { 
    uni.navigateBack({ delta: 1 }); 
  } else { 
    // 降级分流：单页分享进来，跳回首页 
    uni.switchTab({ url: '/pages/Main/index' }); 
  } 
}; 
</script> 

<style scoped> 
.custom-nav-bar { 
  position: fixed; top: 0; left: 0; right: 0; z-index: 999; 
  background: rgba(255, 255, 255, 0.96); /* 默认白底微透明，带毛玻璃 */ 
  backdrop-filter: blur(10px); 
  border-bottom: 1px solid rgba(0,0,0,0.03); transition: all 0.3s ease; 
} 
.custom-nav-bar.is-transparent { background: transparent !important; backdrop-filter: none; border-bottom: none; } 
.nav-content { height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 30rpx; position: relative; } 
.back-area { width: 80rpx; height: 100%; display: flex; align-items: center; z-index: 2;} 
.back-btn { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.15); border-radius: 50%; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); } 
.back-btn.dark-btn { background: #f8f8f8; border: 1px solid #eeeeee; } 
.back-icon { font-size: 36rpx; color: #ffffff; font-weight: bold; margin-top: -4rpx; } 
.dark-btn .back-icon { color: #2d2424; } 
.nav-title { position: absolute; left: 0; right: 0; text-align: center; font-size: 32rpx; color: #ffffff; font-weight: 600; letter-spacing: 2rpx; text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2); z-index: 1; pointer-events: none; } 
.nav-title.dark-title { color: #2d2424; font-weight: 800;} 
.right-placeholder { width: 80rpx; } 
</style>