<template>
  <view class="today-course">
    <view class="date-header">
      <text class="date-title">{{ currentDayTitle }}</text>
      <text class="date-sub" :class="{ 'status-active': isActive }">
        {{ isActive ? '进行中' : '已完成' }}
      </text>
    </view>

    <view class="timeline">
      <view 
        class="task-card" 
        v-for="(task, index) in courseInfo.tasks" 
        :key="task.id"
        :class="{ active: task.status === 'active' }"
        @click="handleTaskClick(task)"
      >
        <view class="task-left">
          <view class="icon-box" :class="task.iconClass">
            <uni-icons :type="task.uniIcon" size="20" :color="task.iconColor"></uni-icons>
          </view>
          <view class="task-info">
            <view class="task-title">{{ task.title }}</view>
            <view class="task-desc">{{ task.desc }}</view>
          </view>
        </view>
        
        <view class="btn-action" :class="{ 'btn-highlight': task.status === 'active' }">
           <uni-icons 
             v-if="task.status === 'done' " 
             type="checkmarkempty" 
             size="18" 
             color="#0ea5e9"
           ></uni-icons>
           
           <uni-icons 
             v-else-if="task.status === 'active' " 
             type="arrowright" 
             size="18" 
             color="#fff"
           ></uni-icons>
           
           <uni-icons 
             v-else 
             type="locked-filled" 
             size="16" 
             color="#cbd5e0"
           ></uni-icons>
        </view>
      </view>

    </view>
    
    <view class="progress-section" v-if="courseInfo.progress !== undefined">
      <text class="progress-title">今日学习进度</text>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: courseInfo.progress + '%' }"></view>
      </view>
      <text class="progress-text">{{ courseInfo.progress }}%</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';

const props = defineProps({
  courseInfo: {
    type: Object,
    default: () => ({ tasks: [] })
  }
});

const currentDay = ref(16);
const currentDayTitle = computed(() => `Day ${currentDay.value} · 深入经义`);
const isActive = computed(() => {
  return props.courseInfo.tasks.some(task => task.status === 'active');
});

const handleTaskClick = (task) => {
  if (task.status === 'lock') {
    uni.showToast({ title: '请先完成前置任务', icon: 'none' });
  } else {
    uni.showToast({ title: `进入: ${task.title}`, icon: 'none' });
  }
};
</script>

<style scoped>
.today-course {
  padding: 30rpx 40rpx;
}

.date-header {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  margin-bottom: 40rpx;
}

.date-title { 
  font-size: 32rpx; 
  font-weight: 700; 
  color: #2c3e50; 
}

.date-sub { 
  font-size: 24rpx; 
  color: #ff7e5f; 
  background: #fff0eb; 
  padding: 8rpx 20rpx; 
  border-radius: 40rpx; 
}

.status-active {
  color: #ff7e5f;
  background: #fff0eb;
}

.timeline { 
  position: relative; 
  padding-left: 30rpx; 
  margin-bottom: 40rpx;
}

.timeline::before {
  content: ''; 
  position: absolute; 
  left: 12rpx; 
  top: 20rpx; 
  bottom: 20rpx;
  width: 4rpx; 
  background: #f0f0f0; 
  border-radius: 4rpx;
}

.task-card {
  position: relative;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.03);
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  border: 1px solid rgba(0,0,0,0.01);
}

.task-card:active {
  background-color: #f9f9f9;
}

.task-card::before {
  content: ''; 
  position: absolute; 
  left: -48rpx; 
  top: 50%; 
  transform: translateY(-50%);
  width: 20rpx; 
  height: 20rpx; 
  border-radius: 50%;
  background: #fff; 
  border: 4rpx solid #e0e0e0; 
  z-index: 2;
}

.task-card.active::before {
  border-color: #ff7e5f; 
  background: #ff7e5f; 
  box-shadow: 0 0 0 6rpx rgba(255, 126, 95, 0.2);
}

.task-left { 
  display: flex; 
  align-items: center; 
  gap: 24rpx; 
}

.icon-box {
  width: 80rpx; 
  height: 80rpx; 
  border-radius: 24rpx;
  display: flex; 
  align-items: center; 
  justify-content: center;
}

.icon-read { background: #e0f2fe; }
.icon-video { background: #ffedd5; }
.icon-work { background: #dcfce7; }

.task-info {
  display: flex;
  flex-direction: column;
}

.task-title {
  font-size: 28rpx; 
  color: #2c3e50; 
  font-weight: 600; 
  margin-bottom: 6rpx;
}

.task-desc {
  font-size: 22rpx; 
  color: #95a5a6;
}

.btn-action {
  width: 64rpx; 
  height: 64rpx; 
  border-radius: 50%;
  background: #f8f9fa;
  display: flex; 
  align-items: center; 
  justify-content: center;
}

.btn-highlight {
  background: linear-gradient(135deg, #ff7e5f, #feb47b);
  box-shadow: 0 8rpx 20rpx rgba(255, 126, 95, 0.3);
}

.progress-section {
  margin-top: 40rpx;
  padding: 30rpx;
  background: #f9f9f9;
  border-radius: 20rpx;
}

.progress-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16rpx;
  display: block;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background: #e0e0e0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #ff7e5f, #feb47b);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 22rpx;
  color: #666;
  text-align: right;
}
</style>