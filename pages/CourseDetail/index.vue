<template>
  <view class="container">
    
    <view class="fixed-top-zone">
      
      <view class="fixed-navbar" :style="{ paddingTop: navbarPaddingTop + 'px', height: navbarHeight + 'px' }">
        <view class="nav-capsule" hover-class="nav-capsule-hover" hover-stay-time="100" @click="handleNavigation">
          <image :src="isSinglePage ? iconAssets.home : iconAssets.back" class="nav-icon" mode="aspectFit"></image>
        </view>
      </view>
      
      <view class="hero-wrapper" :style="{ paddingTop: (navbarPaddingTop + navbarHeight + 10) + 'px' }">
        <view class="hero-bg" :style="{ background: getBadgeBackground(courseInfo.campName) }">
          <view class="deco-circle circle-left"></view>
          <view class="deco-circle circle-right"></view>
          
          <text class="hero-name">{{ courseInfo.campName || '加载中...' }}</text>
          <view class="glass-pill" v-if="courseInfo.batch">
            <text class="hero-batch">{{ courseInfo.batch }}</text>
          </view>
        </view>
      </view>

      <view class="unified-header">
        <view class="info-part">
          <view class="main-title">{{ courseInfo.title || '正在拉取课程详情...' }}</view>
          <view class="sub-info">
            <uni-icons type="person-filled" size="14" color="#a0aec0"></uni-icons>
            <text class="join-count">{{ courseInfo.participantCount || 0 }} 人已加入</text>
          </view>
        </view>
        
        <view class="tabs-part">
          <view 
            class="tab-item" 
            v-for="(tab, index) in tabs" 
            :key="index"
            :class="{ active: currentTab === index }"
            @click="currentTab = index"
          >
            {{ tab }}
          </view>
        </view>
      </view>
      
    </view>
    <scroll-view scroll-y class="scroll-content">
      <view class="module-wrapper">
        <camp-intro v-show="currentTab === 0" :course-info="courseInfo"></camp-intro>
        <CourseSchedule v-show="currentTab === 1" :camp-id="courseId"></CourseSchedule>
        <CourseToday v-show="currentTab === 2" :camp-id="courseId"></CourseToday>
        <course-data v-show="currentTab === 3" :camp-id="courseId"></course-data>
        
        <view style="height: 180rpx;"></view>
      </view>
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
import { API_CONFIG } from '@/api/config.js';
import { request } from '@/utils/request.js';
import CampIntro from './components/camp-intro.vue';
import CourseSchedule from './components/CourseSchedule.vue';
import CourseToday from './components/CourseToday.vue';
import CourseData from './components/course-data.vue';

const currentTab = ref(0);
const tabs = ['营期介绍', '课程安排', '今日课程', '课程数据'];
const navbarPaddingTop = ref(0);
const navbarHeight = ref(44);
const sourcePage = ref('');
const sourcePageType = ref('');
const isSinglePage = ref(false);
const courseId = ref('');

/* --- 核心：高级渐变色字典 --- */
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

/* --- SVG 图标 --- */
const iconAssets = {
  back: 'data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M15%2019L8%2012L15%205%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E',
  home: 'data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%209L12%202L21%209V20C21%2020.5304%2020.7893%2021.0391%2020.4142%2021.4142C20.0391%2021.7893%2019.5304%2022%2019%2022H5C4.46957%2022%203.96086%2021.7893%203.58579%2021.4142C3.21071%2021.0391%203%2020.5304%203%2020V9Z%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpolyline%20points%3D%229%2022%209%2012%2015%2012%2015%2022%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E'
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

onLoad((options) => {
  courseId.value = options.id || '101';
  sourcePage.value = options.source || '';
  sourcePageType.value = options.sourceType || '';
  
  const pages = getCurrentPages();
  isSinglePage.value = pages.length === 1;
  
  try {
    // #ifdef MP-WEIXIN
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    if (menuButtonInfo) {
      navbarPaddingTop.value = menuButtonInfo.top;
      navbarHeight.value = menuButtonInfo.height + 16;
    }
    // #endif
  } catch (error) {
    navbarPaddingTop.value = 44;
    navbarHeight.value = 44;
  }
  
  fetchCourseInfo(courseId.value);
});

const handleNavigation = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ 
      delta: 1, animationType: 'pop-out', animationDuration: 300,
      fail: () => { uni.switchTab({ url: '/pages/Main/index' }); }
    });
  } else {
    uni.switchTab({ url: '/pages/Main/index' });
  }
};
</script>

<style scoped lang="scss">
/* ========== 全局布局 ========== */
.container { 
  display: flex;
  flex-direction: column;
  height: 100vh; /* 锁死屏幕高度 */
  overflow: hidden; /* 严禁整体滚动 */
  background: #f4f6f9; /* 最底层的灰蓝色，只会在悬浮卡片边缘露出一点点 */
}

/* ========== 上半部：绝对固定区 ========== */
.fixed-top-zone {
  flex-shrink: 0; 
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 100;
}

/* 1. 独立悬浮导航栏 */
.fixed-navbar { 
  position: absolute; 
  top: 0; left: 0; right: 0; 
  z-index: 9999; 
  display: flex; align-items: center; padding-left: 30rpx; 
}
.nav-capsule { 
  background: rgba(255, 255, 255, 0.75); 
  backdrop-filter: blur(20px); 
  width: 64rpx; height: 64rpx; 
  border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08); 
  border: 1px solid rgba(255,255,255,0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
}
.nav-capsule-hover { transform: scale(0.9); background: #ffffff; }
.nav-icon { width: 36rpx; height: 36rpx; opacity: 0.8; }

/* 2. 悬浮彩色渐变卡片 (只让它浮起来！) */
.hero-wrapper {
  padding: 0 32rpx; /* 左右留白，让卡片悬浮 */
  position: relative;
  z-index: 20; /* 把它拔高到最高层级 */
}
.hero-bg {
  width: 100%;
  height: 340rpx; /* 黄金比例高度 */
  border-radius: 40rpx; /* 大圆角 */
  box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.15); /* 强烈的悬浮阴影 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; 
  color: #fff;
  transition: background 0.5s ease;
  position: relative;
  overflow: hidden; 
  border: 1px solid rgba(255,255,255,0.15); 
}

/* 光影装饰圈 */
.deco-circle { position: absolute; border-radius: 50%; z-index: 1; }
.circle-left { width: 300rpx; height: 300rpx; top: -100rpx; left: -80rpx; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%); }
.circle-right { width: 400rpx; height: 400rpx; bottom: -150rpx; right: -100rpx; background: radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 70%); }

.hero-name { 
  font-size: 68rpx; 
  font-weight: 900; 
  letter-spacing: 6rpx; 
  text-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2); 
  margin-bottom: 24rpx; 
  position: relative; z-index: 2; 
}
.glass-pill {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 8rpx 28rpx;
  border-radius: 40rpx;
  border: 1px solid rgba(255,255,255,0.2);
  position: relative; z-index: 2;
}
.hero-batch { font-size: 26rpx; font-weight: 600; letter-spacing: 2rpx; }

/* 3. 沉浸式一体化白底 (融为一体，沉浸下去) */
.unified-header {
  background: #ffffff; /* 纯白底色，和下方的 scroll-content 完全一致 */
  margin-top: -60rpx; /* 向上提拉，垫在悬浮卡片下面！ */
  padding-top: 80rpx; /* 补充被遮挡的高度 */
  border-radius: 48rpx 48rpx 0 0; /* 顶部大圆角，制造出“白纸”的边缘感 */
  position: relative;
  z-index: 10; /* 层级低于彩卡，形成沉浸感 */
}

.info-part {
  padding: 0 50rpx 30rpx;
}
.main-title { 
  font-size: 40rpx; 
  font-weight: 800; 
  color: #1a202c; 
  line-height: 1.4; 
  margin-bottom: 12rpx; 
}
.sub-info { 
  display: flex; align-items: center; gap: 8rpx;
}
.join-count {
  font-size: 26rpx; color: #718096; font-weight: 500;
}

/* Tabs 区域 (嵌在白纸的最后一部分) */
.tabs-part {
  display: flex;
  justify-content: space-around; 
  align-items: center;
  padding: 0 20rpx;
  border-bottom: 1px solid #f0f4f8; /* 极淡的分界线，连接下方的滚动区 */
}
.tab-item {
  padding: 24rpx 0;
  font-size: 30rpx;
  color: #a0aec0;
  font-weight: 500;
  position: relative;
  white-space: nowrap; 
  transition: all 0.3s ease;
}
.tab-item.active {
  color: #2d3748;
  font-weight: 800;
  font-size: 32rpx;
}
.tab-item.active::after {
  content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); 
  width: 36rpx; height: 8rpx; background: linear-gradient(135deg, #ff7e5f, #feb47b); border-radius: 8rpx 8rpx 0 0; 
}


/* ========== 下半部：独立滚动区 (白纸的延伸) ========== */
.scroll-content {
  flex: 1; 
  height: 0; 
  background: #ffffff; /* 🚨 核心：和上面的 unified-header 颜色一样，形成一体化的“无边沉浸感” */
}

.module-wrapper {
  padding: 30rpx 0 0; 
  min-height: 100%; 
}


/* ========== 悬浮操作按钮 ========== */
.fab-btn { 
  position: absolute; bottom: 60rpx; left: 50%; transform: translateX(-50%); 
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
  padding: 24rpx 56rpx; border-radius: 60rpx; 
  box-shadow: 0 16rpx 40rpx rgba(255, 126, 95, 0.3); 
  display: flex; align-items: center; gap: 16rpx; z-index: 2000; border: 1px solid rgba(255, 126, 95, 0.15); 
}
.fab-text { color: #ff7e5f; font-weight: 800; font-size: 30rpx; letter-spacing: 2rpx; }
</style>