<template>
  <view class="course-data">
    <view class="stats-grid">
      <view class="stat-item">
        <text class="stat-value">{{ courseInfo.totalDays || 21 }}</text>
        <text class="stat-label">总天数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ courseInfo.completedDays || 15 }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ courseInfo.completionRate || 71 }}%</text>
        <text class="stat-label">完成率</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ courseInfo.totalScore || 320 }}</text>
        <text class="stat-label">总积分</text>
      </view>
    </view>
    
    <view class="chart-section">
      <text class="section-title">学习趋势</text>
      <view class="trend-chart">
        <view class="chart-container">
          <view 
            class="chart-bar" 
            v-for="(day, index) in last7DaysData" 
            :key="index"
            :style="{ height: day.score + '%' }"
          >
            <text class="bar-value">{{ day.score }}</text>
            <text class="bar-label">{{ day.label }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="achievement-section">
      <text class="section-title">我的成就</text>
      <view class="achievement-list">
        <view class="achievement-item" v-for="(achievement, index) in achievements" :key="index">
          <view class="achievement-icon" :class="{ 'unlocked': achievement.unlocked }">
            <uni-icons :type="achievement.icon" size="30" :color="achievement.unlocked ? '#ff7e5f' : '#ccc'"></uni-icons>
          </view>
          <view class="achievement-info">
            <text class="achievement-title">{{ achievement.title }}</text>
            <text class="achievement-desc">{{ achievement.desc }}</text>
          </view>
          <uni-icons v-if="achievement.unlocked" type="checkmarkempty" size="24" color="#0ea5e9"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({
  courseInfo: {
    type: Object,
    default: () => ({})
  }
});

const last7DaysData = ref([
  { label: 'Day10', score: 60 },
  { label: 'Day11', score: 75 },
  { label: 'Day12', score: 80 },
  { label: 'Day13', score: 65 },
  { label: 'Day14', score: 90 },
  { label: 'Day15', score: 85 },
  { label: 'Day16', score: 70 }
]);

const achievements = ref([
  {
    title: '初学者',
    desc: '完成第一天学习',
    icon: 'star-filled',
    unlocked: true
  },
  {
    title: '坚持者',
    desc: '连续学习7天',
    icon: 'trophy-filled',
    unlocked: true
  },
  {
    title: '思考者',
    desc: '完成10次心得打卡',
    icon: 'chat-filled',
    unlocked: true
  },
  {
    title: '分享者',
    desc: '在小组中发言10次',
    icon: 'share-filled',
    unlocked: false
  },
  {
    title: '践行者',
    desc: '完成所有实践任务',
    icon: 'thumbsup-filled',
    unlocked: false
  }
]);
</script>

<style scoped>
.course-data {
  padding: 30rpx 40rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.stat-item {
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff7e5f;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
}

.chart-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20rpx;
  display: block;
}

.trend-chart {
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
}

.chart-container {
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
  height: 200rpx;
  padding-bottom: 40rpx;
  position: relative;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #ff7e5f, #feb47b);
  border-radius: 8rpx 8rpx 0 0;
  min-height: 20rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 8rpx;
}

.bar-value {
  font-size: 18rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4rpx;
}

.bar-label {
  font-size: 16rpx;
  color: #666;
  position: absolute;
  bottom: -30rpx;
}

.achievement-section {
  margin-bottom: 40rpx;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.achievement-item {
  background: #fff;
  padding: 24rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.achievement-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.achievement-icon.unlocked {
  background: rgba(255, 126, 95, 0.1);
}

.achievement-info {
  flex: 1;
}

.achievement-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4rpx;
  display: block;
}

.achievement-desc {
  font-size: 20rpx;
  color: #666;
}
</style>