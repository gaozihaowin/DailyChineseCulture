<template>
  <view class="camp-intro">
    <view class="section">
      <text class="section-title">关于本营期</text>
      <text class="section-content">{{ courseInfo.description || '本营期旨在帮助学员深入理解致良知的核心思想，通过系统学习和实践，培养内心的力量和智慧。' }}</text>
    </view>
    
    <view class="section">
      <text class="section-title">营期特色</text>
      <view class="feature-list">
        <view class="feature-item">
          <uni-icons type="star-filled" size="20" color="#ff7e5f"></uni-icons>
          <text class="feature-text">名师团队深度讲解</text>
        </view>
        <view class="feature-item">
          <uni-icons type="star-filled" size="20" color="#ff7e5f"></uni-icons>
          <text class="feature-text">每日实践任务</text>
        </view>
        <view class="feature-item">
          <uni-icons type="star-filled" size="20" color="#ff7e5f"></uni-icons>
          <text class="feature-text">小组讨论互动</text>
        </view>
        <view class="feature-item">
          <uni-icons type="star-filled" size="20" color="#ff7e5f"></uni-icons>
          <text class="feature-text">专业导师点评</text>
        </view>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">适合人群</text>
      <text class="section-content">希望提升自我认知、寻求内心平静、探索生命意义的所有人群。无论您是初学者还是有一定基础的学习者，都能在本营期中获得收获。</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  courseInfo: {
    type: Object,
    default: () => ({})
  }
});
</script>

<style scoped>
.camp-intro {
  padding: 30rpx 40rpx;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16rpx;
  display: block;
}

.section-content {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 24rpx;
  color: #666;
}

.feature-text {
  flex: 1;
}
</style>