<template>
  <view class="container">
    
    <NavBar :title="courseInfo.title || '课程详情'" :isTransparent="true" />
    
    <view class="fixed-top-zone">
      
      <view class="hero-wrapper">
        <view class="hero-card" :style="{ background: getBadgeBackground(courseInfo.campName) }">
          <view class="hero-texture"></view>
          <view class="deco-circle circle-left"></view>
          <view class="deco-circle circle-right"></view>
          
          <view class="hero-content">
            <text class="hero-name">{{ extractCampName(courseInfo.campName) }}</text>
            <view class="hero-batch-pill" v-if="courseInfo.batch">
              <text class="hero-batch">{{ courseInfo.batch }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="info-card-wrapper">
        <view class="info-card">
          <view class="main-title">{{ courseInfo.title || '正在铺陈书卷...' }}</view>
          <view class="sub-info">
            <text class="emoji-icon">👥</text>
            <text class="join-count">{{ courseInfo.participantCount || 0 }} 人已加入同修</text>
          </view>
        </view>
      </view>

      <view class="tabs-bar">
        <view 
          class="tab-item" 
          v-for="(tab, index) in tabs" 
          :key="index"
          :class="{ active: currentTab === index }"
          @click="currentTab = index"
        >
          <text class="tab-text">{{ tab }}</text>
          <view class="tab-indicator"></view>
        </view>
      </view>
      
    </view> 
    
    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="module-wrapper">
        <camp-intro v-show="currentTab === 0" :course-info="courseInfo"></camp-intro>
        <CourseSchedule v-show="currentTab === 1" :camp-id="courseId"></CourseSchedule>
        <CourseToday v-show="currentTab === 2" :camp-id="courseId"></CourseToday>
        <course-data v-show="currentTab === 3" :camp-id="courseId"></course-data>
        
        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>

    <view class="fab-btn" @click="goToChat">
      <text class="fab-icon">💬</text>
      <text class="fab-text">进入小组交流</text>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { API_CONFIG } from '@/api/config.js';
import { request } from '@/utils/request.js';
import CampIntro from './components/camp-intro.vue';
import CourseSchedule from './components/CourseSchedule.vue';
import CourseToday from './components/CourseToday.vue';
import CourseData from './components/course-data.vue';

// ----------------- 页面基础状态 -----------------
const currentTab = ref(0);
const tabs = ['营期介绍', '课程安排', '今日课程', '课程数据'];
const courseId = ref('');
const courseInfo = ref({});

// ----------------- 视觉辅助函数 -----------------
const colorMap = {
  '诚意班': 'linear-gradient(135deg, #8a2021, #b53b3c)',
  '明理班': 'linear-gradient(135deg, #1e3c72, #2a5298)',
  '笃行班': 'linear-gradient(135deg, #d35400, #e67e22)',
  '印证班': 'linear-gradient(135deg, #205e4a, #3ea07a)',
  '良知班': 'linear-gradient(135deg, #5c433b, #8b6b61)',
  '默认': 'linear-gradient(135deg, #9e2a2b, #b53b3c)' 
};

const getBadgeBackground = (campName) => {
  if (!campName) return colorMap['默认'];
  for (const key in colorMap) {
    if (campName.includes(key.replace('班', ''))) {
      return colorMap[key];
    }
  }
  return colorMap['默认'];
};

const extractCampName = (name) => {
  if (!name) return '修习';
  const match = name.match(/【.*?】/);
  if (match) return name.replace(match[0], '').trim().substring(0, 4);
  return name.trim().substring(0, 4);
};

// ----------------- 核心交互与数据 -----------------

// 聊天室入口点击事件（占位）
const goToChat = () => {
  uni.showToast({
    title: '小组交流功能开发中，敬请期待',
    icon: 'none',
    duration: 2000
  });
  
  // TODO: 后续在这里编写跳转聊天的逻辑
  // 示例:
  // uni.navigateTo({
  //   url: `/pages/Chat/index?campId=${courseId.value}`
  // });
};

// 获取课程详细信息
const fetchCourseInfo = async (id) => {
  try {
    const url = API_CONFIG.paths.courses + '/' + id + '/info';
    const response = await request({ url, method: 'GET' });
    const apiData = response.data;
    if (apiData.code === 200 && apiData.data) {
      courseInfo.value = apiData.data;
    }
  } catch (error) {
    console.error('获取课程信息失败:', error);
  }
};

// 生命周期
onLoad((options) => {
  courseId.value = options.id || '101';
  fetchCourseInfo(courseId.value);
});
</script>

<style scoped lang="scss">
/* ========== 全局架构 (锁死高度) ========== */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #faf8f5; 
  overflow: hidden; 
}

/* ========== 上半部：绝对固定区 ========== */
.fixed-top-zone {
  flex-shrink: 0; 
  display: flex;
  flex-direction: column;
  z-index: 100;
  position: relative;
  background-color: #faf8f5; 
}

.hero-wrapper {
  padding: 0 0 20rpx; 
  background: #faf8f5;
}

.hero-card {
  width: 100%;
  height: 480rpx; 
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1); 
}

.deco-circle { position: absolute; border-radius: 50%; z-index: 1; }
.circle-left { width: 300rpx; height: 300rpx; top: -100rpx; left: -80rpx; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%); }
.circle-right { width: 400rpx; height: 400rpx; bottom: -150rpx; right: -100rpx; background: radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 70%); }

.hero-texture {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 24px 24px;
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx; 
}

.hero-name { 
  font-size: 88rpx; 
  font-weight: 900; 
  color: #ffffff; 
  letter-spacing: 12rpx; 
  text-shadow: 0 6rpx 20rpx rgba(0,0,0,0.3); 
  margin-bottom: 24rpx; 
}

.hero-batch-pill {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  padding: 8rpx 36rpx;
  border-radius: 40rpx;
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.hero-batch { 
  font-size: 26rpx; 
  color: #ffffff; 
  font-weight: bold; 
  letter-spacing: 2rpx; 
}

.info-card-wrapper {
  padding: 0 30rpx;
  margin-top: -80rpx; 
  position: relative;
  z-index: 20; 
}

.info-card {
  background: #ffffff;
  border-radius: 30rpx;
  padding: 40rpx 40rpx 30rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.05); 
  border: 1px solid rgba(0,0,0,0.02);
}

.main-title { 
  font-size: 38rpx; 
  font-weight: 900; 
  color: #2d2424; 
  line-height: 1.4; 
  margin-bottom: 20rpx; 
}

.sub-info { 
  display: flex; 
  align-items: center; 
}

.emoji-icon { 
  font-size: 26rpx; 
  margin-right: 12rpx; 
}

.join-count { 
  font-size: 26rpx; 
  color: #8c8686; 
  font-weight: 500; 
}

.tabs-bar {
  display: flex;
  justify-content: space-around; 
  background-color: #faf8f5; 
  padding: 30rpx 20rpx 10rpx;
  border-bottom: 1px solid rgba(0,0,0,0.03); 
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20rpx;
  position: relative;
}

.tab-text {
  font-size: 30rpx;
  color: #a0a0a0; 
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-indicator {
  width: 0;
  height: 8rpx;
  background: #9e2a2b;
  border-radius: 8rpx;
  position: absolute;
  bottom: 0;
  transition: width 0.3s ease, background 0.3s ease;
}

.tab-item.active .tab-text {
  color: #2d2424;
  font-weight: 900;
  font-size: 32rpx;
}

.tab-item.active .tab-indicator {
  width: 40rpx; 
}

/* ========== 下半部：独立滚动区 ========== */
.scroll-content {
  flex: 1; 
  height: 0; 
  background-color: #faf8f5;
}

.module-wrapper {
  padding: 30rpx 0;
  min-height: 100%; 
}

.safe-area-spacer {
  height: 140rpx; /* 底部留白，防止内容滚到底部被胶囊按钮挡死 */
}

/* ========== 悬浮操作按钮 (FAB) ========== */
.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: calc(80rpx + env(safe-area-inset-bottom));
  background: linear-gradient(135deg, #b53b3c, #8a2021);
  padding: 24rpx 40rpx;
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(158, 42, 43, 0.4);
  z-index: 999;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  /* 柔和的呼吸悬浮动画 */
  animation: floatBreath 3s ease-in-out infinite;

  .fab-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
    line-height: 1;
  }

  .fab-text {
    color: #ffffff;
    font-size: 28rpx;
    font-weight: bold;
    letter-spacing: 2rpx;
  }

  /* 点击时的下压反馈动效 */
  &:active {
    transform: scale(0.92) translateY(0);
    box-shadow: 0 4rpx 12rpx rgba(158, 42, 43, 0.2);
    animation: none; /* 点击时立刻暂停动画，手感更干脆 */
  }
}

/* 呼吸悬浮动画关键帧 */
@keyframes floatBreath {
  0% { 
    transform: translateY(0); 
    box-shadow: 0 12rpx 30rpx rgba(158, 42, 43, 0.4); 
  }
  50% { 
    transform: translateY(-12rpx); 
    box-shadow: 0 20rpx 40rpx rgba(158, 42, 43, 0.3); 
  }
  100% { 
    transform: translateY(0); 
    box-shadow: 0 12rpx 30rpx rgba(158, 42, 43, 0.4); 
  }
}
</style>