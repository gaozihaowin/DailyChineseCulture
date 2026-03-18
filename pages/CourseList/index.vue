<template>
  <view class="course-list-container">
    
    <NavBar title="" :isTransparent="true" />

    <view class="sticky-header-zone">
      <view :style="{ height: (statusBarHeight + 44) + 'px' }"></view>
      <view class="page-header">
        <view class="title-decorator"></view>
        <text class="main-title">全部修习营期</text>
      </view>
    </view>

    <view v-if="isLoading" class="empty-state">
      <view class="loading-spinner"></view>
      <text class="empty-text">正在铺陈书卷...</text>
    </view>

    <view v-else class="course-list-wrapper">
      <view class="course-list">
        <view 
          class="course-card" 
          v-for="(course, index) in courseList" 
          :key="course.id"
          @click="goToDetail(course.id)"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <view :class="['absolute-status-badge', getCourseStatus(course).tagClass]">
            <text>{{ getCourseStatus(course).tagText }}</text>
          </view>

          <view class="card-left" :style="{ background: getBadgeBackground(course.campName) }">
            <text class="camp-short-name">{{ extractCampName(course.campName) }}</text>
            <view class="camp-batch-pill" v-if="course.batch">
              <text class="camp-batch">{{ course.batch }}</text>
            </view>
          </view>

          <view class="card-right">
            <view class="card-top">
              <text class="course-title">{{ course.title || '致良知修习营' }}</text>
              
              <view class="course-time" v-if="course.startTime && course.endTime">
                <text class="meta-emoji">📅</text>
                <text class="time-text">{{ formatDate(course.startTime) }} - {{ formatDate(course.endTime) }}</text>
              </view>
              
              <text class="course-desc" v-if="course.description">{{ course.description }}</text>
            </view>

            <view class="card-bottom">
              <view class="participant-info">
                <text class="meta-emoji">👥</text>
                <text class="participant-text"><text class="highlight-num">{{ course.participantCount || 0 }}</text> 人加入</text>
              </view>
              
              <view :class="['action-btn', getCourseStatus(course).btnClass]">
                {{ getCourseStatus(course).btnText }}
              </view>
            </view>
          </view>
          
        </view>
      </view>

      <view class="load-status" v-if="courseList.length > 0">
        <text v-if="isFetching && !isNoMore" class="status-text">正在翻阅更多书卷...</text>
        <text v-if="isNoMore" class="status-text">- 已经到底啦 -</text>
      </view>

      <view v-if="courseList.length === 0" class="empty-state">
        <text class="empty-emoji">📿</text>
        <text class="empty-text">当前暂无开放营期</text>
      </view>
    </view>
    
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { get } from '@/utils/request';
import { API_CONFIG } from '@/api/config';

// ==========================================
// 1. 响应式状态定义
// ==========================================
const statusBarHeight = ref(20); // 状态栏高度
const courseList = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(true);    
const isFetching = ref(false);  
const isNoMore = ref(false);    

// ==========================================
// 2. UI 渲染辅助字典
// ==========================================
const colorMap = {
  '诚意班': 'linear-gradient(135deg, #8a2021, #b53b3c)',
  '明理班': 'linear-gradient(135deg, #1e3c72, #2a5298)',
  '笃行班': 'linear-gradient(135deg, #d35400, #e67e22)',
  '印证班': 'linear-gradient(135deg, #205e4a, #3ea07a)',
  '良知班': 'linear-gradient(135deg, #5c433b, #8b6b61)',
  '默认': 'linear-gradient(135deg, #9e2a2b, #b53b3c)'
};

// ==========================================
// 3. 业务工具函数
// ==========================================

const extractCampName = (name) => {
  if (!name) return '修习';
  const match = name.match(/【.*?】/);
  if (match) return name.replace(match[0], '').trim().substring(0, 3);
  return name.trim().substring(0, 3);
};

const getBadgeBackground = (campName) => {
  if (!campName) return colorMap['默认'];
  for (const key in colorMap) {
    if (campName.includes(key.replace('班', ''))) return colorMap[key];
  }
  return colorMap['默认'];
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  let safeStr = dateString;
  if (typeof dateString === 'string' && !dateString.includes('T')) {
    safeStr = dateString.replace(/-/g, '/');
  }
  const date = new Date(safeStr);
  if (isNaN(date.getTime())) return '待定';

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
};

/**
 * 联合状态机：推算状态标签与按钮
 */
const getCourseStatus = (course) => {
  const { status, startTime, endTime } = course;

  if (status === 0) {
    return { tagText: '已结营', tagClass: 'tag-ended', btnText: '看回放', btnClass: 'btn-ended' };
  }

  if (!startTime || !endTime) {
    return { tagText: '已开营', tagClass: 'tag-active', btnText: '去学习', btnClass: 'btn-active' };
  }

  const now = Date.now();
  const start = new Date(startTime).getTime() || 0;
  const end = new Date(endTime).getTime() || 0;

  if (now < start) {
    return { tagText: '未开营', tagClass: 'tag-upcoming', btnText: '去报名', btnClass: 'btn-upcoming' };
  } else if (now > end) {
    return { tagText: '已结营', tagClass: 'tag-ended', btnText: '看回放', btnClass: 'btn-ended' };
  } else {
    return { tagText: '已开营', tagClass: 'tag-active', btnText: '去学习', btnClass: 'btn-active' };
  }
};

// ==========================================
// 4. 路由与网络请求
// ==========================================

const goToDetail = async (id) => {
  uni.showLoading({ title: '核实身份中...', mask: true });
  try {
    const res = await get(API_CONFIG.paths.checkEnroll, { campId: id });
    const resultData = (res.data && res.data.code) ? res.data : res;
    
    if (resultData.code === 200) {
      if (resultData.data === true) {
        uni.navigateTo({ url: `/pages/CourseDetail/index?id=${id}&source=list` });
      } else {
        uni.navigateTo({ url: `/pages/CampEnroll/index?id=${id}` });
      }
    } else {
      uni.showToast({ title: resultData.msg || '核实失败', icon: 'none' });
    }
  } catch (error) {
    console.error('Check enrollment error:', error);
    uni.showToast({ title: '网络请求失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

const fetchCourses = async (isRefresh = false) => {
  if (isFetching.value || (isNoMore.value && !isRefresh)) return;
  
  isFetching.value = true;
  if (isRefresh) { pageNum.value = 1; isNoMore.value = false; }
  if (courseList.value.length === 0) isLoading.value = true;

  try {
    const res = await get(API_CONFIG.paths.courseList, {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: 1
    });

    const resultData = (res.data && res.data.code) ? res.data : res;
    
    if (resultData.code === 200 && resultData.data) {
      const list = resultData.data.list || [];
      total.value = resultData.data.total || 0;
      
      if (isRefresh) courseList.value = list;
      else courseList.value = [...courseList.value, ...list];

      if (courseList.value.length >= total.value || list.length === 0) {
        isNoMore.value = true;
      } else {
        pageNum.value++;
      }
    } else {
      uni.showToast({ title: resultData.msg || '获取数据失败', icon: 'none' });
    }
  } catch (error) {
    console.error('Fetch error:', error);
    uni.showToast({ title: '网络请求失败', icon: 'none' });
  } finally {
    isLoading.value = false;
    isFetching.value = false;
    if (isRefresh) uni.stopPullDownRefresh();
  }
};

// ==========================================
// 5. 生命周期钩子
// ==========================================
onLoad(() => { 
  // 动态获取状态栏高度，防止新加的吸顶标题钻进刘海屏里
  const systemInfo = uni.getSystemInfoSync();
  if (systemInfo.statusBarHeight) {
    statusBarHeight.value = systemInfo.statusBarHeight;
  }
  
  fetchCourses(true); 
});
onPullDownRefresh(() => { fetchCourses(true); });
onReachBottom(() => { fetchCourses(false); });

</script>

<style scoped lang="scss">
/* ========== 全局基底 ========== */
.course-list-container {
  min-height: 100vh;
  background-color: #faf8f5; /* 全局统一暖宣纸色 */
  box-sizing: border-box;
}

/* ========== ✨ 新增：毛玻璃特效吸顶大头部 ========== */
.sticky-header-zone {
  position: sticky;
  top: 0;
  z-index: 90;
  background: rgba(250, 248, 245, 0.92); /* 暖宣纸色基底 + 微透明 */
  backdrop-filter: blur(12px); /* 毛玻璃特效，让滑上去的卡片隐约透出 */
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.01); /* 底部极其微弱的分界线阴影 */
  padding-bottom: 20rpx; /* 给标题下方留白 */
}

.page-header {
  padding: 16rpx 36rpx 0; 
  display: flex;
  align-items: center;
}
.title-decorator {
  width: 8rpx;
  height: 36rpx;
  background-color: #9e2a2b; /* 致良知红 */
  border-radius: 6rpx;
  margin-right: 16rpx;
}
.main-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #2d2424;
  letter-spacing: 2rpx;
}

/* ========== 列表包裹区 ========== */
.course-list-wrapper {
  padding: 20rpx 36rpx calc(env(safe-area-inset-bottom) + 40rpx);
}

.course-list { 
  display: flex; 
  flex-direction: column; 
  gap: 36rpx; /* 加大卡片间距，增强呼吸感 */
}

/* ========== 卡片核心盒模型 ========== */
.course-card {
  display: flex; 
  background: #ffffff; 
  border-radius: 36rpx; 
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.04); 
  border: 1px solid rgba(0,0,0,0.01); 
  min-height: 220rpx; 
  padding: 32rpx; 
  gap: 28rpx;
  position: relative; 
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.1, 0.7, 0.1, 1), box-shadow 0.25s;
  animation: slideInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
  opacity: 0;
}
.course-card:active { 
  transform: scale(0.97); 
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.03);
}

@keyframes slideInUp { 
  0% { opacity: 0; transform: translateY(50rpx); }
  100% { opacity: 1; transform: translateY(0); } 
}

/* ========== 右上角绝对定位状态书签 ========== */
.absolute-status-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 8rpx 24rpx;
  border-bottom-left-radius: 24rpx; /* 书签造型 */
  z-index: 10;
  text { font-size: 22rpx; font-weight: 800; letter-spacing: 2rpx;}
}
.tag-active { background: rgba(158, 42, 43, 0.08); text { color: #9e2a2b; } }
.tag-upcoming { background: rgba(217, 119, 6, 0.08); text { color: #d97706; } } 
.tag-ended { background: #f3f4f6; text { color: #9ca3af; } } 

/* ========== 左侧：高定大彩块 ========== */
.card-left {
  width: 200rpx;
  height: 200rpx; 
  border-radius: 24rpx;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
  box-shadow: inset 0 0 20rpx rgba(0, 0, 0, 0.06);
}

.camp-short-name {
  font-size: 46rpx; font-weight: 900; color: #ffffff;
  letter-spacing: 4rpx; margin-bottom: 12rpx;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.camp-batch-pill {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  border: 1px solid rgba(255,255,255,0.3);
}

.camp-batch {
  font-size: 20rpx; color: #ffffff;
  font-weight: bold; letter-spacing: 1rpx;
}

/* ========== 右侧：信息与操作区 ========== */
.card-right { 
  flex: 1; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; 
  padding-top: 8rpx; 
}

.card-top { display: flex; flex-direction: column; }

.course-title {
  font-size: 34rpx; font-weight: 900; color: #2d2424; line-height: 1.4;
  margin-bottom: 16rpx;
  padding-right: 80rpx; 
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
}

.course-time {
  display: flex; align-items: center; margin-bottom: 12rpx;
}
.meta-emoji { font-size: 24rpx; margin-right: 8rpx; opacity: 0.6; }
.time-text { font-size: 22rpx; color: #8c8686; font-family: monospace; letter-spacing: 1rpx; }

.course-desc {
  font-size: 24rpx; color: #a09a9a; line-height: 1.5; margin-bottom: 20rpx;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; overflow: hidden;
}

/* ========== 底部操作区 ========== */
.card-bottom {
  display: flex; align-items: center; justify-content: space-between; margin-top: auto;
}
.participant-info { display: flex; align-items: center; }
.participant-text { font-size: 24rpx; color: #8c8686; font-weight: 500;}
.highlight-num { color: #9e2a2b; font-weight: bold; margin: 0 4rpx;}

.action-btn { 
  padding: 12rpx 36rpx; 
  border-radius: 40rpx; 
  font-size: 24rpx; 
  font-weight: 800; 
  letter-spacing: 2rpx;
  transition: all 0.2s; 
}
.btn-active { background: #fcf0f0; color: #9e2a2b; box-shadow: 0 4rpx 12rpx rgba(158, 42, 43, 0.1); }
.btn-upcoming { background: #fef3c7; color: #d97706; box-shadow: 0 4rpx 12rpx rgba(217, 119, 6, 0.1); }
.btn-ended { background: #f3f4f6; color: #9ca3af; }

/* ========== 全局辅助状态 ========== */
.load-status { padding: 50rpx 0; text-align: center; }
.status-text { font-size: 24rpx; color: #c0baba; letter-spacing: 4rpx; font-weight: 500; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 200rpx; }
.empty-emoji { font-size: 80rpx; opacity: 0.5; margin-bottom: 24rpx; }
.empty-text { font-size: 28rpx; color: #a09a9a; letter-spacing: 2rpx; }

.loading-spinner {
  width: 50rpx; height: 50rpx; border: 4rpx solid rgba(158, 42, 43, 0.1); border-top: 4rpx solid #9e2a2b;
  border-radius: 50%; animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite; margin-bottom: 24rpx;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>