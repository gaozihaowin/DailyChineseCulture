<template>
  <view class="course-data">
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载数据中...</text>
    </view>

    <view v-else-if="dataObj" class="content-wrapper">
      <view class="overview-section">
        <view class="rate-card">
          <text class="rate-value">{{ dataObj.overallRate }}%</text>
          <text class="rate-label">总完成率</text>
        </view>

        <view class="stats-row">
          <view class="stat-card">
            <text class="stat-value">{{ dataObj.totalDays }}</text>
            <text class="stat-label">总天数</text>
          </view>
          <view class="stat-card">
            <text class="stat-value">{{ dataObj.completedDays }}</text>
            <text class="stat-label">已完成</text>
          </view>
        </view>
      </view>

      <view class="trend-section">
        <view class="section-header">
          <view class="section-line"></view>
          <text class="section-title">学习趋势</text>
        </view>

        <view class="chart-card">
          <scroll-view 
            scroll-x="true" 
            class="trend-scroll-view" 
            :scroll-into-view="currentScrollId" 
            scroll-with-animation 
          >
            <view class="trend-track">
              <view
                v-for="(item, index) in displayTrends"
                :key="index"
                :id="'day-' + item.dayIndex"
                class="bar-wrapper"
                :class="item.status ? item.status.toLowerCase() : 'locked'"
                :style="{ animationDelay: index * 0.05 + 's' }"
              >
                <view class="bar-value-box">
                  <text v-if="item.status === 'COMPLETED' && item.rate > 0" class="bar-value">{{ item.rate }}</text>
                  <text v-else-if="item.status === 'MISSED'" class="bar-value missed-value">0</text>
                  <text v-else class="bar-value locked-value">-</text>
                </view>
                <view class="bar-track-bg">
                  <view
                    class="bar-body"
                    :style="{ height: getBarHeight(item) }"
                  ></view>
                </view>
                <text class="bar-label">{{ item.dayStr }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>

      <view v-if="dataObj.achievements && dataObj.achievements.length > 0" class="achievement-section">
        <view class="section-header">
          <view class="section-line"></view>
          <text class="section-title">我的成就</text>
        </view>

        <view class="achievement-list">
          <view
            v-for="(achievement, index) in dataObj.achievements"
            :key="index"
            class="achievement-item"
            :class="{ 'achievement-last': index === dataObj.achievements.length - 1 }"
          >
            <image
              class="achievement-icon"
              :src="achievement.icon"
              mode="aspectFit"
            />
            <view class="achievement-info">
              <text class="achievement-title">{{ achievement.title }}</text>
              <text class="achievement-desc">{{ achievement.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="error-state">
      <uni-icons type="refresh" size="60" color="#d1d5db"></uni-icons>
      <text class="error-text">数据加载失败</text>
      <text class="error-hint" @click="fetchCourseData">点击重试</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { API_CONFIG } from '@/api/config.js';
import { request } from '@/utils/request.js';

// 定义 Props
const props = defineProps({
  campId: {
    type: [Number, String],
    required: true
  }
});

// 定义响应式状态
const dataObj = ref(null);
const isLoading = ref(true);
const currentScrollId = ref('');

// ==========================================
// 核心优化：计算属性，截断未来未解锁的天数
// ==========================================
const displayTrends = computed(() => {
  if (!dataObj.value || !dataObj.value.trends) return [];
  const trends = dataObj.value.trends;

  let lastVisibleIndex = -1;
  // 从后往前找，找到最后一个不是 LOCKED (未解锁) 的天数，即为“今天”或“营期最后一天”
  for (let i = trends.length - 1; i >= 0; i--) {
    if (trends[i].status !== 'LOCKED') {
      lastVisibleIndex = i;
      break;
    }
  }

  // 极端情况防呆：如果营期还没开始，全都是 LOCKED，为了 UI 不崩塌，只显示第 1 天
  if (lastVisibleIndex === -1) {
    return trends.slice(0, 1);
  }

  // 截取从第 1 天到最后可见天数（当天或营期结束）的数组
  return trends.slice(0, lastVisibleIndex + 1);
});

// 计算柱子高度
const getBarHeight = (item) => {
  if (item.status === 'LOCKED' || item.status === 'MISSED') {
    return '4%';
  }
  if (item.status === 'COMPLETED') {
    return Math.max(item.rate || 0, 4) + '%';
  }
  return '4%';
};

// 寻找滚动锚点 (由于数组已被截断，逻辑大幅简化)
const setScrollPosition = () => {
  const trends = displayTrends.value;
  if (!trends || trends.length === 0) return;
  
  nextTick(() => {
    // 直接滚动到倒数第二天（为了让最后一天的柱子稍微居中，而不是紧贴最右边边缘）
    let targetIndex = Math.max(0, trends.length - 2);
    currentScrollId.value = 'day-' + trends[targetIndex].dayIndex;
  });
};

// 数据请求方法
const fetchCourseData = async () => {
  try {
    isLoading.value = true;

    // 替换 URL 中的 campId 占位符
    const url = API_CONFIG.paths.courseData.replace('{{campId}}', props.campId.toString());

    const response = await request({
      url: url,
      method: 'GET'
    });

    const apiData = response.data;

    if (apiData.code === 200) {
      dataObj.value = apiData.data || null;
      setScrollPosition();
    } else {
      console.error('获取课程数据失败:', apiData.msg);
      uni.showToast({
        title: apiData.msg || '获取课程数据失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    // 错误已在 request 中统一处理
  } finally {
    isLoading.value = false;
  }
};

// 监听 campId 变化
watch(() => props.campId, (newCampId) => {
  if (newCampId) {
    fetchCourseData();
  }
});

// 组件挂载时获取数据
onMounted(() => {
  if (props.campId) {
    fetchCourseData();
  }
});
</script>

<style scoped lang="scss">
.course-data {
  min-height: 600rpx;
  background-color: transparent !important; /* 确保透明，让米黄色透出来 */
}

/* ========== 加载状态样式 ========== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
}

.loading-spinner {
  width: 56rpx;
  height: 56rpx;
  border: 4rpx solid #e5e7eb;
  border-top: 4rpx solid #fa7d65;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #9ca3af;
  letter-spacing: 2rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ========== 内容包装器 ========== */
.content-wrapper {
  padding: 30rpx;
}

/* ========== 模块 A: 数据概览卡片 (金字塔布局) ========== */
.overview-section {
  margin-bottom: 40rpx;
}

/* 完成率大卡片 */
.rate-card {
  background-color: #ffffff !important;
  border-radius: 30rpx; /* 匹配首页的 30rpx 圆角 */
  padding: 48rpx 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); /* 匹配首页的细腻阴影 */
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.rate-value {
  font-size: 56rpx;
  font-weight: bold;
  color: #fa7d65;
  line-height: 1.2;
  margin-bottom: 12rpx;
}

.rate-label {
  font-size: 26rpx;
  color: #6b7280;
  letter-spacing: 2rpx;
}

/* 统计行 (总天数 + 已完成) */
.stats-row {
  display: flex;
  gap: 20rpx;
}

.stat-card {
  flex: 1;
  background-color: #ffffff !important;
  border-radius: 30rpx; /* 匹配首页的 30rpx 圆角 */
  padding: 32rpx 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); /* 匹配首页的细腻阴影 */
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 56rpx;
  font-weight: bold;
  color: #fa7d65;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #9ca3af;
  letter-spacing: 1rpx;
}

/* ========== 通用标题样式 ========== */
.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.section-line {
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(180deg, #fa7d65, #ff6a88);
  border-radius: 3rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 2rpx;
}

/* ========== 模块 B: 学习趋势 (纯 CSS 柱状图) ========== */
.trend-section {
  margin-bottom: 40rpx;
}

.chart-card {
  position: relative;
  background-color: #ffffff !important;
  border-radius: 30rpx;
  padding: 40rpx 0 20rpx; /* 上下内边距，左右不留防止截断 */
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

/* 顶部装饰线保留 */
.chart-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #fa7d65, transparent);
  opacity: 0.3;
}

.trend-scroll-view {
  width: 100%;
  white-space: nowrap;
}

.trend-track {
  display: inline-flex;
  align-items: flex-end;
  padding: 20rpx 40rpx;
  height: 320rpx; /* 保证容器高度 */
}

.bar-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 70rpx;
  flex-shrink: 0;
  margin-right: 30rpx;
  opacity: 0;
  transform: translateY(20rpx);
  animation: barFadeInUp 0.6s ease forwards;
}

@keyframes barFadeInUp {
  to { opacity: 1; transform: translateY(0); }
}

.bar-value-box {
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.bar-value {
  font-size: 22rpx;
  font-weight: 600;
  color: #fa7d65;
  white-space: nowrap; /* 防止数字和字折行 */
}

.missed-value { color: #ff8c8c; }
.locked-value { color: #d1d5db; font-weight: 400; }

.bar-track-bg {
  width: 36rpx;
  height: 200rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.01) 100%);
  border-radius: 18rpx;
  padding: 4rpx;
}

.bar-body {
  width: 28rpx;
  border-radius: 14rpx 14rpx 8rpx 8rpx;
  transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

/* 状态样式核心：完成 */
.completed .bar-body {
  background: linear-gradient(to top, #ffd4c7 0%, #ffb199 30%, #fa7d65 100%);
  box-shadow: 0 4rpx 12rpx rgba(250, 125, 101, 0.25), inset 0 -2rpx 4rpx rgba(255, 255, 255, 0.3);
}
.completed .bar-body::after {
  content: ''; position: absolute; top: 0; left: 20%; width: 40%; height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%);
}
.completed .bar-label { color: #4b5563; font-weight: 600; }

/* 状态样式核心：漏打卡 */
.missed .bar-body {
  background: #ffcccc;
}
.missed .bar-label { color: #ff8c8c; }

/* 状态样式核心：未解锁 */
.locked .bar-body {
  background: #f0ece6;
}
.locked .bar-label { color: #d1d5db; }

/* 状态样式核心：部分完成 */
.partial .bar-body {
  background: linear-gradient(to top, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
  box-shadow: 0 4rpx 12rpx rgba(251, 191, 36, 0.25), inset 0 -2rpx 4rpx rgba(255, 255, 255, 0.3);
}
.partial .bar-body::after {
  content: ''; position: absolute; top: 0; left: 20%; width: 40%; height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%);
}
.partial .bar-label { color: #d97706; font-weight: 600; }

/* 状态样式核心：补卡 */
.makeup .bar-body {
  background: linear-gradient(to top, #e0e7ff 0%, #a5b4fc 50%, #818cf8 100%);
  box-shadow: 0 4rpx 12rpx rgba(129, 140, 248, 0.25), inset 0 -2rpx 4rpx rgba(255, 255, 255, 0.3);
}
.makeup .bar-body::after {
  content: ''; position: absolute; top: 0; left: 20%; width: 40%; height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%);
}
.makeup .bar-label { color: #6366f1; font-weight: 600; }


.bar-label {
  font-size: 20rpx;
  margin-top: 16rpx;
  letter-spacing: 1rpx;
  transition: color 0.3s;
}

/* ========== 模块 C: 我的成就 ========== */
.achievement-section {
  margin-bottom: 40rpx;
}

.achievement-list {
  background-color: #ffffff !important;
  border-radius: 30rpx; /* 匹配首页的 30rpx 圆角 */
  padding: 0 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); /* 匹配首页的细腻阴影 */
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.achievement-last {
  border-bottom: none;
}

.achievement-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  flex-shrink: 0;
  background-color: #fef2f2;
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.achievement-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8rpx;
}

.achievement-desc {
  font-size: 24rpx;
  color: #9ca3af;
  line-height: 1.4;
}

/* ========== 错误状态 ========== */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 60rpx;

  .error-text {
    font-size: 28rpx;
    color: #6b7280;
    margin-top: 24rpx;
    margin-bottom: 16rpx;
  }

  .error-hint {
    font-size: 26rpx;
    color: #fa7d65;
    padding: 12rpx 32rpx;
    border: 2rpx solid #fa7d65;
    border-radius: 32rpx;
  }
}

/* ========================================================== */
/* 【强力补丁】：彻底隐藏 WebKit 环境下的横向滚动条 */
/* ========================================================== */
.trend-scroll-view ::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}
</style>