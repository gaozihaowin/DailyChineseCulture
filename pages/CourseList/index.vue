<template>
  <view class="course-list-container">
    
    <view class="page-header">
      <text class="page-title">全部习修营期</text>
      <text class="page-subtitle">格物致知 · 诚意正心</text>
    </view>

    <view v-if="isLoading" class="empty-state">
      <view class="loading-spinner"></view>
      <text class="empty-text">正在铺陈书卷...</text>
    </view>

    <view v-else class="course-list">
      <view 
        class="course-card" 
        v-for="(course, index) in courseList" 
        :key="course.id"
        @click="goToDetail(course.id)"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <view class="card-left" :style="{ background: getBadgeBackground(course.campName) }">
          <text class="camp-short-name">{{ extractCampName(course.campName) }}</text>
          <text class="camp-batch" v-if="course.batch">{{ course.batch }}</text>
        </view>

        <view class="card-right">
          <view class="card-top">
            <view class="title-row">
              <text class="course-title">{{ course.title || '致良知修习营' }}</text>
              <view :class="['status-tag', getCourseStatus(course).tagClass]">
                <text>{{ getCourseStatus(course).tagText }}</text>
              </view>
            </view>
            
            <view class="course-time" v-if="course.startTime && course.endTime">
              <text class="meta-emoji">📅</text>
              <text class="time-text">{{ formatDate(course.startTime) }} - {{ formatDate(course.endTime) }}</text>
            </view>
            
            <text class="course-desc" v-if="course.description">{{ course.description }}</text>
          </view>

          <view class="card-bottom">
            <view class="participant-info">
              <text class="meta-emoji">👥</text>
              <text class="participant-text">{{ course.participantCount || 0 }} 人已加入</text>
            </view>
            
            <view :class="['action-btn', getCourseStatus(course).btnClass]">
              {{ getCourseStatus(course).btnText }}
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

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/CourseDetail/index?id=${id}&source=list` });
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
onLoad(() => { fetchCourses(true); });
onPullDownRefresh(() => { fetchCourses(true); });
onReachBottom(() => { fetchCourses(false); });

</script>

<style scoped lang="scss">
/* ========== 全局布局 ========== */
.course-list-container {
  padding: 24rpx 24rpx 40rpx; /* 顶部稍微收紧 */
  min-height: 100vh;
  background-color: #faf9f8; /* 极浅的暖灰背景，让白卡片更立体 */
  box-sizing: border-box;
}

.page-header { margin-bottom: 32rpx; padding-left: 8rpx; }
.page-title { display: block; font-size: 42rpx; font-weight: 900; color: #2d2424; margin-bottom: 8rpx;}
.page-subtitle { font-size: 24rpx; color: #999999; letter-spacing: 4rpx; }

.course-list { display: flex; flex-direction: column; gap: 24rpx; } /* 卡片间距缩小，更紧凑 */

/* ========== 卡片骨架 ========== */
.course-card {
  display: flex; background: #ffffff; border-radius: 20rpx; /* 圆角微收 */
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.02); overflow: hidden;
  border: 1px solid rgba(0,0,0,0.01); min-height: 180rpx; padding: 20rpx; gap: 20rpx;
  transition: transform 0.2s; animation: slideInUp 0.5s ease forwards; opacity: 0;
}
.course-card:active { transform: scale(0.98); background: #fdfcfb;}

@keyframes slideInUp { to { opacity: 1; transform: translateY(0); } }

/* ========== 左侧：比例缩小的大方块 ========== */
.card-left {
  width: 180rpx; height: 180rpx; /* 整体缩减 20rpx，更显精致 */
  border-radius: 16rpx;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
  box-shadow: inset 0 0 16rpx rgba(0, 0, 0, 0.04);
}

.camp-short-name {
  font-size: 38rpx; font-weight: 900; color: #ffffff;
  letter-spacing: 2rpx; margin-bottom: 6rpx;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}
.camp-batch {
  font-size: 20rpx; color: rgba(255, 255, 255, 0.85);
  font-weight: 500; letter-spacing: 1rpx;
}

/* ========== 右侧：信息与操作区 ========== */
.card-right { 
  flex: 1; display: flex; flex-direction: column; justify-content: space-between; min-width: 0; 
}

.card-top { display: flex; flex-direction: column; }

/* 标题行更紧凑 */
.title-row {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12rpx; margin-bottom: 8rpx;
}
.course-title {
  font-size: 30rpx; font-weight: 800; color: #2d2424; line-height: 1.4;
  flex: 1; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
}

/* 右侧标签 */
.status-tag {
  padding: 4rpx 10rpx; border-radius: 6rpx; flex-shrink: 0; margin-top: 4rpx;
  text { font-size: 18rpx; font-weight: bold; } /* 字号缩小至 18rpx */
}
.tag-active { background: rgba(158, 42, 43, 0.06); text { color: #9e2a2b; } }
.tag-upcoming { background: rgba(217, 119, 6, 0.06); text { color: #d97706; } } 
.tag-ended { background: #f3f4f6; text { color: #9ca3af; } } 

/* 时间与辅助文本：减淡颜色、缩小字号 */
.course-time {
  display: flex; align-items: center; margin-bottom: 10rpx;
}
.meta-emoji { font-size: 22rpx; margin-right: 6rpx; opacity: 0.6; } /* emoji也调小一点 */
.time-text { font-size: 20rpx; color: #999999; font-family: monospace; letter-spacing: 1rpx; }

.course-desc {
  font-size: 22rpx; color: #999999; line-height: 1.4; margin-bottom: 12rpx;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; overflow: hidden;
}

/* ========== 底部操作区 ========== */
.card-bottom {
  display: flex; align-items: flex-end; justify-content: space-between; margin-top: auto;
}
.participant-info { display: flex; align-items: center; padding-bottom: 4rpx;}
.participant-text { font-size: 22rpx; color: #999999; font-weight: 500;}

/* 按钮微调，显得更干练 */
.action-btn { 
  padding: 10rpx 28rpx; border-radius: 30rpx; font-size: 22rpx; font-weight: 800; transition: all 0.2s; 
}
.btn-active { background: #fcf0f0; color: #9e2a2b; }
.btn-upcoming { background: #fef3c7; color: #d97706; }
.btn-ended { background: #f3f4f6; color: #9ca3af; }

/* ========== 全局辅助状态 ========== */
.load-status { padding: 40rpx 0; text-align: center; }
.status-text { font-size: 22rpx; color: #c0baba; letter-spacing: 2rpx; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 200rpx; }
.empty-emoji { font-size: 80rpx; opacity: 0.5; margin-bottom: 20rpx; }
.empty-text { font-size: 24rpx; color: #999999; letter-spacing: 2rpx; }

.loading-spinner {
  width: 50rpx; height: 50rpx; border: 4rpx solid rgba(158, 42, 43, 0.1); border-top: 4rpx solid #9e2a2b;
  border-radius: 50%; animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite; margin-bottom: 24rpx;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>