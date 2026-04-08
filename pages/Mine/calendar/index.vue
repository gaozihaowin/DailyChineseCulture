<template>
  <view class="page-container">
    <view class="empty-state">
      <image class="empty-icon" src="https://img.icons8.com/fluency/200/calendar.png" mode="aspectFit"></image>
      <text class="empty-title">笃行日历</text>
      <text class="empty-desc">记录笃行足迹，该模块正在精心打磨中，敬请期待...</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f4f1eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 32rpx;
  color: #4a3728;
  font-weight: 600;
  margin-top: 20rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #8b7365;
  text-align: center;
  padding: 0 60rpx;
}
</style>
