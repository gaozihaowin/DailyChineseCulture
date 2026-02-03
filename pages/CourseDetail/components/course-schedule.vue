<template>
  <view class="course-schedule">
    <view class="section">
      <text class="section-title">整体安排</text>
      <text class="section-content">{{ courseInfo.scheduleDescription || '本营期为期21天，每天安排不同主题的学习内容，循序渐进，帮助学员全面理解和实践致良知的思想。' }}</text>
    </view>
    
    <view class="week-section">
      <text class="week-title">第一周：基础认知</text>
      <view class="day-list">
        <view class="day-item" v-for="i in 7" :key="'week1-' + i">
          <view class="day-number">Day {{ i }}</view>
          <view class="day-content">
            <text class="day-title">{{ getDayTitle(1, i) }}</text>
            <text class="day-desc">{{ getDayDesc(1, i) }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="week-section">
      <text class="week-title">第二周：深入实践</text>
      <view class="day-list">
        <view class="day-item" v-for="i in 7" :key="'week2-' + i">
          <view class="day-number">Day {{ i + 7 }}</view>
          <view class="day-content">
            <text class="day-title">{{ getDayTitle(2, i) }}</text>
            <text class="day-desc">{{ getDayDesc(2, i) }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="week-section">
      <text class="week-title">第三周：内化应用</text>
      <view class="day-list">
        <view class="day-item" v-for="i in 7" :key="'week3-' + i">
          <view class="day-number">Day {{ i + 14 }}</view>
          <view class="day-content">
            <text class="day-title">{{ getDayTitle(3, i) }}</text>
            <text class="day-desc">{{ getDayDesc(3, i) }}</text>
          </view>
        </view>
      </view>
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

const getDayTitle = (week, day) => {
  const titles = {
    1: {
      1: '认识良知',
      2: '良知的特性',
      3: '致良知的方法',
      4: '实践中的良知',
      5: '良知与道德',
      6: '良知与决策',
      7: '第一周总结'
    },
    2: {
      1: '诚意正心',
      2: '格物致知',
      3: '知行合一',
      4: '事上磨练',
      5: '克己复礼',
      6: '内心的力量',
      7: '第二周总结'
    },
    3: {
      1: '良知的应用',
      2: '人际关系中的良知',
      3: '工作中的良知',
      4: '家庭中的良知',
      5: '社会中的良知',
      6: '终身学习',
      7: '毕业总结'
    }
  };
  return titles[week][day] || '学习主题';
};

const getDayDesc = (week, day) => {
  return '深入学习相关内容，完成实践任务';
};
</script>

<style scoped>
.course-schedule {
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

.week-section {
  margin-bottom: 40rpx;
}

.week-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20rpx;
  display: block;
  padding-left: 16rpx;
  border-left: 4rpx solid #ff7e5f;
}

.day-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.day-item {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  background: #f9f9f9;
  border-radius: 16rpx;
}

.day-number {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #ff7e5f;
  color: #fff;
  font-size: 20rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.day-content {
  flex: 1;
}

.day-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #2c3e50;
  display: block;
  margin-bottom: 8rpx;
}

.day-desc {
  font-size: 22rpx;
  color: #666;
}
</style>