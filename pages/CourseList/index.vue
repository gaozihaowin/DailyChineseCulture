<template>
  <view class="course-list-container">
    <view class="page-header">
      <text class="page-title">全部修习营期</text>
      <text class="page-subtitle">格物致知 · 诚意正心</text>
    </view>

    <view class="empty-state">
      <image src="https://img.icons8.com/dotty/160/cbd5e0/books.png" class="empty-icon" mode="aspectFit"></image>
      <text class="empty-text">课程列表加载中...</text>
    </view>
  </view>
</template>

<script setup>
// 初始化脚本
</script>

<style scoped lang="scss">
/* 容器背景透明，透出 App.vue 定义的 #f9f7f2 全局底色 */
.course-list-container {
  padding: 40rpx;
  min-height: 100vh;
  background-color: transparent;
}

.page-header {
  margin-bottom: 60rpx;
}
.page-title {
  display: block;
  font-size: 44rpx;
  font-weight: 900;
  color: #2d2424;
  margin-bottom: 12rpx;
}
.page-subtitle {
  font-size: 26rpx;
  color: #8c8686;
  letter-spacing: 4rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}
.empty-icon { width: 160rpx; height: 160rpx; margin-bottom: 24rpx; opacity: 0.6; }
.empty-text { font-size: 28rpx; color: #8c8686; letter-spacing: 2rpx; }
</style>
