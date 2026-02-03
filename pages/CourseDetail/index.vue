<template>
  <view class="container">
    
    <view class="video-header">
      <view class="nav-overlay" :style="{ paddingTop: safeAreaTop + 'px' }">
        <uni-icons type="arrowleft" size="24" color="#fff" @click="goBack"></uni-icons>
        <uni-icons type="more-filled" size="24" color="#fff"></uni-icons>
      </view>
      
      <view class="play-overlay" @click="playVideo">
        <uni-icons type="plusempty" size="50" color="rgba(255,255,255,0.9)" v-if="false"></uni-icons>
        <view class="play-icon-circle">
          <uni-icons type="paperplane-filled" size="24" color="#fff" style="margin-left: 6rpx;"></uni-icons>
        </view>
      </view>
      
      </view>

    <scroll-view scroll-y class="content-scroll">
      
      <view class="info-card">
        <view class="course-tag">{{ courseInfo.tag }}</view>
        <view class="course-title">{{ courseInfo.title }}</view>
        <view class="course-meta">
          <view class="meta-item">
            <uni-icons type="staff-filled" size="14" color="#cbd5e0"></uni-icons>
            <text>{{ courseInfo.studentCount }} 学员</text>
          </view>
          <view class="meta-item">
            <uni-icons type="calendar-filled" size="14" color="#cbd5e0"></uni-icons>
            <text>{{ courseInfo.updateFrequency }}</text>
          </view>
        </view>
      </view>

      <view class="tab-container">
        <view 
          class="tab" 
          v-for="(tab, index) in tabs" 
          :key="index"
          :class="{ active: currentTab === index }"
          @click="currentTab = index"
        >
          {{ tab }}
        </view>
      </view>

      <!-- 四个模块内容 -->
      <view class="module-content">
        <camp-intro v-show="currentTab === 0" :course-info="courseInfo"></camp-intro>
        <course-schedule v-show="currentTab === 1" :course-info="courseInfo"></course-schedule>
        <today-course v-show="currentTab === 2" :course-info="courseInfo"></today-course>
        <course-data v-show="currentTab === 3" :course-info="courseInfo"></course-data>
      </view>
      
      <view style="height: 120rpx;"></view>

    </scroll-view>

    <view class="fab-btn">
      <uni-icons type="chat-filled" size="18" color="#ff7e5f"></uni-icons>
      <text class="fab-text">进入小组讨论</text>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import CampIntro from './components/camp-intro.vue';
import CourseSchedule from './components/course-schedule.vue';
import TodayCourse from './components/today-course.vue';
import CourseData from './components/course-data.vue';

const currentTab = ref(0);
const tabs = ['营期介绍', '课程安排', '今日课程', '课程数据'];
const safeAreaTop = ref(44);

const courseInfo = ref({
  tag: '',
  title: '',
  studentCount: '',
  updateFrequency: '',
  tasks: [],
  progress: 60,
  totalDays: 21,
  completedDays: 15,
  completionRate: 71,
  totalScore: 320
});

const mockDatabase = {
  '101': {
    tag: '诚意班 · 第69期',
    title: '致良知：让内心充满力量的生命哲学课',
    studentCount: '52,979',
    updateFrequency: '每日更新',
    progress: 60,
    totalDays: 21,
    completedDays: 15,
    completionRate: 71,
    totalScore: 320,
    tasks: [
      {
        id: 1,
        title: '原文诵读',
        desc: '《送宗伯乔白岩序》',
        status: 'done',
        uniIcon: 'map-filled',
        iconClass: 'icon-read',
        iconColor: '#0ea5e9'
      },
      {
        id: 2,
        title: '名师导读',
        desc: '博仁老师 · 15分钟深度解析',
        status: 'active',
        uniIcon: 'videocam-filled',
        iconClass: 'icon-video',
        iconColor: '#f97316'
      },
      {
        id: 3,
        title: '心得打卡',
        desc: '分享今日感悟，获20积分',
        status: 'lock',
        uniIcon: 'compose',
        iconClass: 'icon-work',
        iconColor: '#22c55e'
      }
    ]
  },
  '102': {
    tag: '正心班 · 第13期',
    title: '正心诚意：儒家修身与现代生活',
    studentCount: '34,521',
    updateFrequency: '每周更新',
    progress: 45,
    totalDays: 28,
    completedDays: 12,
    completionRate: 43,
    totalScore: 240,
    tasks: [
      {
        id: 1,
        title: '经典阅读',
        desc: '《大学》第一章',
        status: 'done',
        uniIcon: 'book-filled',
        iconClass: 'icon-read',
        iconColor: '#0ea5e9'
      },
      {
        id: 2,
        title: '导师讲解',
        desc: '王阳明心学核心思想',
        status: 'active',
        uniIcon: 'mic-filled',
        iconClass: 'icon-video',
        iconColor: '#f97316'
      },
      {
        id: 3,
        title: '实践作业',
        desc: '每日自省记录',
        status: 'lock',
        uniIcon: 'edit-filled',
        iconClass: 'icon-work',
        iconColor: '#22c55e'
      },
      {
        id: 4,
        title: '小组讨论',
        desc: '与同学交流学习心得',
        status: 'lock',
        uniIcon: 'chat-filled',
        iconClass: 'icon-work',
        iconColor: '#8b5cf6'
      }
    ]
  }
};

const defaultCourseData = {
  tag: '课程',
  title: '课程详情',
  studentCount: '0',
  updateFrequency: '定期更新',
  tasks: [],
  progress: 0,
  totalDays: 0,
  completedDays: 0,
  completionRate: 0,
  totalScore: 0
};

const fetchCourseData = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const courseData = mockDatabase[id] || defaultCourseData;
      courseInfo.value = courseData;
      resolve(courseData);
    }, 500);
  });
};

onLoad((options) => {
  const courseId = options.id || '101';
  fetchCourseData(courseId);
});

const goBack = () => {
  uni.navigateBack({
    delta: 1,
    success: () => {
      console.log('返回成功');
    },
    fail: (error) => {
      console.error('返回失败:', error);
      // 如果返回失败，尝试返回首页
      uni.switchTab({
        url: '/pages/Main/index'
      });
    }
  });
};

const playVideo = () => {
  uni.showToast({ title: '开始播放', icon: 'none' });
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #eef1f5;
  overflow: hidden;
}

.video-header {
  position: relative;
  width: 100%;
  height: 420rpx;
  background: #000;
  z-index: 10;
  flex-shrink: 0;
}

.nav-overlay {
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%;
  padding: 0 30rpx 20rpx;
  box-sizing: border-box;
  display: flex; 
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
  z-index: 20;
}

.play-overlay {
  width: 100%; 
  height: 100%;
  display: flex; 
  align-items: center; 
  justify-content: center;
}

.play-icon-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255,255,255,0.4);
}

.content-scroll {
  flex: 1;
  background: linear-gradient(to bottom, #fff 0%, #f9f9f9 100%);
  border-radius: 48rpx 48rpx 0 0;
  margin-top: -30rpx;
  position: relative;
  z-index: 11;
  overflow: hidden;
}

.info-card {
  padding: 48rpx 40rpx 20rpx;
}

.course-tag {
  background: rgba(255, 126, 95, 0.1); 
  color: #ff7e5f;
  font-size: 20rpx; 
  font-weight: bold; 
  padding: 8rpx 16rpx; 
  border-radius: 8rpx;
  display: inline-block; 
  margin-bottom: 16rpx;
}

.course-title {
  font-size: 36rpx; 
  font-weight: 700; 
  color: #2c3e50;
  margin-bottom: 16rpx; 
  line-height: 1.4;
}

.course-meta {
  display: flex; 
  align-items: center; 
  gap: 30rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-item text {
  font-size: 24rpx; 
  color: #95a5a6;
}

.tab-container {
  display: flex;
  padding: 0 40rpx;
  margin-top: 30rpx;
  border-bottom: 1px solid rgba(0,0,0,0.03);
}

.tab {
  margin-right: 50rpx;
  padding-bottom: 20rpx;
  font-size: 28rpx;
  color: #95a5a6;
  position: relative;
  transition: all 0.3s;
}

.tab.active {
  color: #2c3e50;
  font-weight: 600;
  font-size: 30rpx;
}

.tab.active::after {
  content: ''; 
  position: absolute; 
  bottom: -2rpx; 
  left: 0; 
  right: 0;
  height: 6rpx; 
  background: linear-gradient(135deg, #ff7e5f, #feb47b); 
  border-radius: 6rpx;
}

.daily-section { 
  padding: 40rpx; 
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

.timeline { 
  position: relative; 
  padding-left: 30rpx; 
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

.module-content {
  min-height: 600rpx;
}

.fab-btn {
  position: absolute; 
  bottom: 60rpx; 
  left: 50%; 
  transform: translateX(-50%);
  background: #fff;
  padding: 20rpx 48rpx;
  border-radius: 60rpx;
  box-shadow: 0 30rpx 60rpx rgba(255, 126, 95, 0.2);
  display: flex; 
  align-items: center; 
  gap: 16rpx;
  z-index: 20; 
  border: 1px solid rgba(255, 126, 95, 0.1);
}

.fab-text {
  color: #ff7e5f; 
  font-weight: 600; 
  font-size: 28rpx;
}
</style>
