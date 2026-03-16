<template>
  <view class="course-data">
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载数据中...</text>
    </view>

    <!-- 数据展示 -->
    <view v-else-if="dataObj" class="content-wrapper">
      <!-- 模块 A: 数据概览卡片 (金字塔布局: 1大 + 2小) -->
      <view class="overview-section">
        <!-- 首行: 完成率大卡片 -->
        <view class="rate-card">
          <text class="rate-value">{{ dataObj.overallRate }}%</text>
          <text class="rate-label">总完成率</text>
        </view>

        <!-- 次行: 总天数 + 已完成 -->
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

      <!-- 模块 B: 学习趋势 (纯 CSS 柱状图) -->
      <view class="trend-section">
        <view class="section-header">
          <view class="section-line"></view>
          <text class="section-title">学习趋势</text>
        </view>

        <view class="chart-card">
          <view class="chart-bg-line"></view>
          <view class="chart-container">
            <view
              v-for="(item, index) in dataObj.trends"
              :key="index"
              class="bar-wrapper"
              :style="{ animationDelay: index * 0.1 + 's' }"
            >
              <view class="bar-value-box">
                <text v-if="item.rate > 0" class="bar-value">{{ item.rate }}</text>
                <text v-else class="bar-value bar-value-zero">-</text>
              </view>
              <view class="bar-track">
                <view
                  class="bar-column"
                  :style="{ height: Math.max(item.rate, 2) + '%' }"
                ></view>
              </view>
              <text class="bar-label">{{ item.dayStr }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 模块 C: 我的成就 -->
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

    <!-- 错误/空数据状态 -->
    <view v-else class="error-state">
      <uni-icons type="refresh" size="60" color="#d1d5db"></uni-icons>
      <text class="error-text">数据加载失败</text>
      <text class="error-hint" @click="fetchCourseData">点击重试</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
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
  background-color: #f8f7f4;
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
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 48rpx 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
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
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
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
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  border-radius: 20rpx;
  padding: 50rpx 24rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(250, 125, 101, 0.08), 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* 背景装饰线 */
.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #fa7d65, transparent);
  opacity: 0.3;
}

.chart-bg-line {
  position: absolute;
  bottom: 80rpx;
  left: 24rpx;
  right: 24rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, rgba(250, 125, 101, 0.15), transparent);
}

.chart-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 320rpx;
  padding-top: 40rpx;
  position: relative;
  z-index: 1;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70rpx;
  opacity: 0;
  transform: translateY(20rpx);
  animation: barFadeInUp 0.6s ease forwards;
}

@keyframes barFadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bar-value-box {
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  opacity: 0;
  animation: valueFadeIn 0.4s ease 0.5s forwards;
}

@keyframes valueFadeIn {
  to {
    opacity: 1;
  }
}

.bar-value {
  font-size: 22rpx;
  font-weight: 600;
  color: #fa7d65;
  text-shadow: 0 2rpx 4rpx rgba(250, 125, 101, 0.2);
}

.bar-value-zero {
  color: #d1d5db;
  font-weight: 400;
}

.bar-track {
  width: 36rpx;
  height: 200rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: linear-gradient(to top, rgba(255, 177, 153, 0.1) 0%, rgba(255, 177, 153, 0.02) 100%);
  border-radius: 18rpx;
  padding: 4rpx;
}

.bar-column {
  width: 28rpx;
  min-height: 4rpx;
  background: linear-gradient(to top, #ffd4c7 0%, #ffb199 30%, #fa7d65 100%);
  border-radius: 14rpx 14rpx 8rpx 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(250, 125, 101, 0.25), inset 0 -2rpx 4rpx rgba(255, 255, 255, 0.3);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

/* 柱体高光效果 */
.bar-column::after {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  width: 40%;
  height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%);
  border-radius: inherit;
}

.bar-wrapper:hover .bar-column {
  box-shadow: 0 6rpx 20rpx rgba(250, 125, 101, 0.4);
  filter: brightness(1.05);
}

.bar-label {
  font-size: 20rpx;
  color: #a0a0a0;
  margin-top: 16rpx;
  font-weight: 500;
  letter-spacing: 1rpx;
}

/* ========== 模块 C: 我的成就 ========== */
.achievement-section {
  margin-bottom: 40rpx;
}

.achievement-list {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 0 30rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
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
</style>
