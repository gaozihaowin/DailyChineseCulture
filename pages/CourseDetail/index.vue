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
      
    </view> <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="module-wrapper">
        <camp-intro v-show="currentTab === 0" :course-info="courseInfo"></camp-intro>
        <CourseSchedule v-show="currentTab === 1" :camp-id="courseId"></CourseSchedule>
        <CourseToday v-show="currentTab === 2" :camp-id="courseId"></CourseToday>
        <course-data v-show="currentTab === 3" :camp-id="courseId"></course-data>
        
        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>

    <view class="bottom-action-bar">
      <view class="action-btn" hover-class="btn-hover" @click="handleAction">
        进入小组讨论
      </view>
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

// ----------------- 保持原有的业务逻辑 -----------------
const currentTab = ref(0);
const tabs = ['营期介绍', '课程安排', '今日课程', '课程数据'];
const courseId = ref('');

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

// UI 辅助：提炼封面中心的大字
const extractCampName = (name) => {
  if (!name) return '修习';
  const match = name.match(/【.*?】/);
  if (match) return name.replace(match[0], '').trim().substring(0, 4);
  return name.trim().substring(0, 4);
};

const courseInfo = ref({});

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

const handleAction = () => {
  uni.showToast({ title: '准备进入小组...', icon: 'none' });
};

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
  height: 100vh; /* 绝对锁死屏幕高度 */
  background-color: #faf8f5; /* 暖宣纸色基底 */
  overflow: hidden; /* 严禁外层滚动 */
}

/* ========== 上半部：绝对固定区 ========== */
.fixed-top-zone {
  flex-shrink: 0; /* 保证这部分高度不被挤压 */
  display: flex;
  flex-direction: column;
  z-index: 100;
  position: relative;
  background-color: #faf8f5; /* 与底色一致，衔接自然 */
}

/* 1. 顶部 Hero 卡片 (重构为带边距的精美卡片) */
.hero-wrapper {
  padding: 0 0 20rpx; /* 给下方卡片留出悬浮空间 */
  background: #faf8f5;
}

.hero-card {
  width: 100%;
  height: 480rpx; /* 卡片高度 */
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1); /* 强烈的底部投影 */
}

/* 光影装饰圈 */
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
  margin-top: 60rpx; /* 避开系统状态栏 */
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

/* 2. 悬浮核心信息卡 (第三层抽屉) */
.info-card-wrapper {
  padding: 0 30rpx;
  margin-top: -80rpx; /* 强力向上拉，覆盖在彩色卡片下边缘 */
  position: relative;
  z-index: 20; /* 层级高于 hero-card */
}

.info-card {
  background: #ffffff;
  border-radius: 30rpx;
  padding: 40rpx 40rpx 30rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.05); /* 细腻悬浮阴影 */
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

/* 3. Tab 控制栏 */
.tabs-bar {
  display: flex;
  justify-content: space-around; 
  background-color: #faf8f5; /* 融于底色 */
  padding: 30rpx 20rpx 10rpx;
  border-bottom: 1px solid rgba(0,0,0,0.03); /* 与滚动区的软分割线 */
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
  color: #a0a0a0; /* 未选中稍淡 */
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
  flex: 1; /* 撑满剩余空间 */
  height: 0; /* 触发 scroll-view 的核心魔法 */
  background-color: #faf8f5;
}

.module-wrapper {
  padding: 30rpx 0;
  min-height: 100%; /* 确保内容少时也能滚动到底部 */
}

/* ========== 底部操作栏 ========== */
.bottom-action-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(0,0,0,0.03);
  padding: 24rpx 40rpx calc(24rpx + env(safe-area-inset-bottom));
  z-index: 999;
  display: flex;
  justify-content: center;
}

.action-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #b53b3c, #8a2021);
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 900;
  letter-spacing: 4rpx;
  box-shadow: 0 12rpx 24rpx rgba(158, 42, 43, 0.25);
  transition: all 0.2s ease;
}

.btn-hover {
  transform: scale(0.96);
  box-shadow: 0 6rpx 12rpx rgba(158, 42, 43, 0.15);
}

.safe-area-spacer {
  height: 180rpx; /* 为固定底栏留出余量 */
}
</style>