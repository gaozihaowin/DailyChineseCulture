<template>
  <view class="container">
    
    <!-- 独立悬浮导航栏 -->
    <view class="fixed-navbar" :style="{ paddingTop: navbarPaddingTop + 'px', height: navbarHeight + 'px' }">
      <view 
        class="nav-capsule" 
        hover-class="nav-capsule-hover" 
        hover-stay-time="100" 
        @click="handleNavigation" 
      >
        <image 
          :src="isSinglePage ? iconAssets.home : iconAssets.back" 
          class="nav-icon" 
          mode="aspectFit" 
        ></image>
      </view>
    </view>
    
    <view class="video-header">
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
          @click="switchTab(index)"
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
import { ref, reactive } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import apiClient from '@/utils/request';
import { debounce } from '@/utils/common';
import CampIntro from './components/camp-intro.vue';
import CourseSchedule from './components/course-schedule.vue';
import TodayCourse from './components/today-course.vue';
import CourseData from './components/course-data.vue';

// 响应式数据
const currentTab = ref(0);
const tabs = ['营期介绍', '课程安排', '今日课程', '课程数据'];
const navbarPaddingTop = ref(0);
const navbarHeight = ref(44);
const sourcePage = ref('');
const sourcePageType = ref('');
const isSinglePage = ref(false);

// 加载状态
const loading = reactive({
  courseData: false,
  videoPlay: false
});

// 课程信息
const courseInfo = ref({
  id: '',
  tag: '',
  title: '',
  studentCount: '',
  updateFrequency: '',
  tasks: [],
  progress: 0,
  totalDays: 0,
  completedDays: 0,
  completionRate: 0,
  totalScore: 0
});

// --- 极简风 SVG 图标 (Base64编码，无需网络，永不失效) ---
const iconAssets = {
  // 极简左箭头
  back: 'data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M15%2019L8%2012L15%205%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E',
  // 极简首页房子
  home: 'data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%209L12%202L21%209V20C21%2020.5304%2020.7893%2021.0391%2020.4142%2021.4142C20.0391%2021.7893%2019.5304%2022%2019%2022H5C4.46957%2022%203.96086%2021.7893%203.58579%2021.4142C3.21071%2021.0391%203%2020.5304%203%2020V9Z%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpolyline%20points%3D%229%2022%209%2012%2015%2012%2015%2022%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E'
};

// 获取课程数据
const fetchCourseData = async (courseId) => {
  if (loading.courseData) return;
  
  loading.courseData = true;
  
  try {
    // 优先从缓存获取
    const cachedData = uni.getStorageSync(`course_${courseId}`);
    if (cachedData) {
      courseInfo.value = cachedData;
      return cachedData;
    }
    
    // 从API获取
    const result = await apiClient.get(`/courses/${courseId}`, {
      loading: false
    });
    
    if (result) {
      courseInfo.value = {
        id: courseId,
        ...result,
        tasks: result.tasks || []
      };
      
      // 缓存数据（10分钟有效期）
      uni.setStorageSync(`course_${courseId}`, courseInfo.value);
      uni.setStorageSync(`course_${courseId}_timestamp`, Date.now());
    }
    
    return result;
    
  } catch (error) {
    console.error('获取课程数据失败:', error);
    // 使用默认数据
    courseInfo.value = {
      id: courseId,
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
  } finally {
    loading.courseData = false;
  }
};

// 清理过期缓存
const cleanExpiredCache = () => {
  try {
    const keys = uni.getStorageInfoSync().keys;
    const now = Date.now();
    const expireTime = 10 * 60 * 1000; // 10分钟
    
    keys.forEach(key => {
      if (key.startsWith('course_') && key.endsWith('_timestamp')) {
        const timestamp = uni.getStorageSync(key);
        if (now - timestamp > expireTime) {
          const courseId = key.replace('_timestamp', '');
          uni.removeStorageSync(courseId);
          uni.removeStorageSync(key);
        }
      }
    });
  } catch (error) {
    console.error('清理缓存失败:', error);
  }
};

// 页面加载
onLoad((options) => {
  const courseId = options.id || '101';
  sourcePage.value = options.source || '';
  sourcePageType.value = options.sourceType || '';
  
  // 初始化页面
  initializePage(courseId);
});

// 页面显示
onShow(() => {
  // 刷新当前课程数据
  if (courseInfo.value.id) {
    fetchCourseData(courseInfo.value.id);
  }
});

// 初始化页面
const initializePage = async (courseId) => {
  // 1. 智能检测页面栈
  const pages = getCurrentPages();
  isSinglePage.value = pages.length === 1;
  
  // 2. 适配安全区域
  adaptSafeArea();
  
  // 3. 清理过期缓存
  cleanExpiredCache();
  
  // 4. 获取课程数据
  await fetchCourseData(courseId);
  
  console.log('页面初始化完成');
};

// 适配安全区域
const adaptSafeArea = () => {
  try {
    // #ifdef MP-WEIXIN
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    if (menuButtonInfo) {
      navbarPaddingTop.value = menuButtonInfo.top;
      navbarHeight.value = menuButtonInfo.height + 16;
    }
    // #endif
    
    // #ifndef MP-WEIXIN
    navbarPaddingTop.value = 44;
    navbarHeight.value = 44;
    // #endif
  } catch (error) {
    console.error('适配安全区域失败:', error);
    navbarPaddingTop.value = 44;
    navbarHeight.value = 44;
  }
};

// --- 智能返回逻辑 ---
const handleNavigation = debounce(() => {
  const pages = getCurrentPages();
  
  if (pages.length > 1) {
    // 核心：返回上一页，不销毁上一页，保留状态
    uni.navigateBack({ 
      delta: 1,
      animationType: 'pop-out',
      animationDuration: 300,
      success: () => {
        console.log('返回上一页成功，保留上页状态');
      },
      fail: (err) => {
        console.error('返回上一页失败:', err);
        // 兜底：万一出错，回首页
        fallbackToHome();
      }
    });
  } else {
    // 单页模式：回首页
    fallbackToHome();
  }
}, 300);

// 兜底跳转首页
const fallbackToHome = () => {
  uni.switchTab({ 
    url: '/pages/Main/index',
    success: () => {
      console.log('跳转到首页成功');
    },
    fail: (err) => {
      console.error('跳转首页失败:', err);
      uni.showToast({
        title: '页面跳转异常',
        icon: 'none'
      });
    }
  });
};

// 播放视频
const playVideo = async () => {
  if (loading.videoPlay) return;
  
  loading.videoPlay = true;
  
  try {
    // 检查用户权限
    const userInfo = uni.getStorageSync('userInfo');
    if (!userInfo) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/Login/index'
        });
      }, 1500);
      return;
    }
    
    // 模拟视频播放
    uni.showToast({ 
      title: '开始播放', 
      icon: 'success' 
    });
    
    // 这里可以集成实际的视频播放器
    // 例如使用 uni.createVideoContext
    
  } catch (error) {
    console.error('视频播放失败:', error);
    uni.showToast({
      title: '播放失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.videoPlay = false;
  }
};

// 切换Tab
const switchTab = (index) => {
  currentTab.value = index;
  // 可以添加Tab切换的统计埋点
  console.log(`切换到Tab: ${tabs[index]}`);
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

.fixed-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  padding-left: 30rpx;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.nav-capsule {
  margin-left: 30rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.nav-capsule-hover {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.nav-icon {
  width: 40rpx;
  height: 40rpx;
  opacity: 0.8;
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
