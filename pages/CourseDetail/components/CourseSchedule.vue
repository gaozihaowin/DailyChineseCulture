<template>
  <view class="course-schedule-container">

    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在整理修习大纲...</text>
    </view>

    <view v-else-if="scheduleList.length === 0" class="empty-container">
      <image src="https://img.icons8.com/dotty/160/cbd5e0/calendar.png" class="empty-icon" mode="aspectFit"></image>
      <text class="empty-text">先生暂未排课，请稍候</text>
    </view>

    <view v-else-if="!selectedPlanId" class="global-timeline">

      <view
        v-for="(module, mIndex) in scheduleList"
        :key="module.moduleIndex"
        class="timeline-row"
      >

        <view class="global-axis">
          <view class="axis-line" :class="{
            'is-first': mIndex === 0,
            'is-last': mIndex === scheduleList.length - 1
          }"></view>

          <view class="node-module">
            <text class="node-text">M{{ module.moduleIndex || mIndex + 1 }}</text>
          </view>
        </view>

        <view class="module-card-wrap">
          <view class="module-card" :class="{ 'is-expanded': module.isExpanded }">

            <view class="module-header" hover-class="header-hover" hover-stay-time="100" @click="toggleModule(mIndex)">
              <view class="m-title-box">
                <text class="m-title">{{ module.moduleName || '阶段修习' }}</text>
              </view>
              <view class="m-action-box">
                <text class="m-count">{{ module.plans ? module.plans.length : 0 }} 节</text>
                <view class="chevron-btn" :class="{ 'rotated': module.isExpanded }">
                  <uni-icons type="bottom" size="14" color="#9e2a2b"></uni-icons>
                </view>
              </view>
            </view>

            <view class="module-body-wrapper">
              <view class="module-body">

                <view class="inner-timeline">
                  <view
                    v-for="(plan, pIndex) in module.plans"
                    :key="plan.planId"
                    class="inner-row"
                  >
                    <view class="inner-axis">
                      <view class="inner-line" v-if="pIndex !== module.plans.length - 1"></view>
                      <view class="node-day">D{{ plan.dayIndex }}</view>
                    </view>

                    <view
                      class="day-card"
                      hover-class="card-hover"
                      hover-stay-time="100"
                      @click="openDayDetail(plan.planId, plan.title)"
                    >
                      <view class="plan-title">{{ plan.title || '今日修习内容' }}</view>

                      <view class="plan-subtitle" v-if="plan.readingTitle">
                        <uni-icons type="book" size="14" color="#8c8686"></uni-icons>
                        <text class="sub-text">{{ plan.readingTitle }}</text>
                      </view>

                      <view class="plan-meta" v-if="plan.teacherName || plan.videoDuration">
                        <view v-if="plan.teacherName" class="meta-tag">
                          <uni-icons type="person-filled" size="12" color="#9e2a2b"></uni-icons>
                          <text>{{ plan.teacherName }}</text>
                        </view>
                        <view v-if="plan.videoDuration" class="meta-tag">
                          <uni-icons type="videocam-filled" size="12" color="#9e2a2b"></uni-icons>
                          <text>{{ plan.videoDuration }} 分</text>
                        </view>
                      </view>
                    </view>

                  </view>
                </view>

              </view>
            </view>

          </view>
        </view>

      </view>
    </view>

    <view v-else class="detail-view">

      <view class="detail-navbar">
        <view class="nav-left" @click="goBackToList">
          <uni-icons type="left" size="22" color="#111827"></uni-icons>
          <text class="nav-back-text">大纲</text>
        </view>
        
        <view class="nav-center">
          <text class="nav-title">{{ selectedPlanTitle }}</text>
        </view>
        
        <view class="nav-right"></view>
      </view>

      <CourseToday
        :campId="props.campId"
        :targetPlanId="selectedPlanId"
      />

    </view>

  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { API_CONFIG } from '@/api/config.js';

// ==================== 引入单日任务看板组件 ====================
import CourseToday from './CourseToday.vue';

const props = defineProps({
  campId: {
    type: String,
    required: true
  }
});

// ==================== 响应式状态 ====================

// 大纲列表数据
const scheduleList = ref([]);
const isLoading = ref(true);

// ==================== 新增：Detail 视图状态 ====================
const selectedPlanId = ref(null);
const selectedPlanTitle = ref('');

// ==================== 手风琴折叠 ====================
const toggleModule = (index) => {
  scheduleList.value[index].isExpanded = !scheduleList.value[index].isExpanded;
};

// ==================== 大纲列表请求 ====================
const fetchSchedule = async () => {
  try {
    isLoading.value = true;
    const url = API_CONFIG.baseUrl + API_CONFIG.paths.schedule.replace('{{campId}}', props.campId);

    const response = await new Promise((resolve, reject) => {
      uni.request({ url: url, method: 'GET', success: resolve, fail: reject });
    });

    const apiData = response.data;

    if (apiData.code === 200) {
      const rawList = apiData.data || [];
      scheduleList.value = rawList.map(module => ({
        ...module,
        isExpanded: false
      }));
    } else {
      uni.showToast({ title: apiData.msg || '获取排课失败', icon: 'none' });
    }
  } catch (error) {
    uni.showToast({ title: '网络连接异常', icon: 'none' });
  } finally {
    isLoading.value = false;
  }
};

// ==================== 新增：虚拟切屏逻辑 ====================

/**
 * 打开某天任务看板（切入 Detail 视图）
 * @param {Number|String} planId - 排课计划 ID
 * @param {String} title - 计划标题，用于详情页顶部显示
 */
const openDayDetail = (planId, title) => {
  selectedPlanId.value = planId;
  selectedPlanTitle.value = title || '任务详情';
  uni.hideKeyboard();
  uni.pageScrollTo({ scrollTop: 0, duration: 300 });
};

/**
 * 返回课程大纲列表（切出 Detail 视图）
 */
const goBackToList = () => {
  selectedPlanId.value = null;
  selectedPlanTitle.value = '';
  uni.pageScrollTo({ scrollTop: 0, duration: 300 });
};

// ==================== 生命周期 ====================
watch(() => props.campId, (newCampId) => {
  if (newCampId) fetchSchedule();
});

onMounted(() => {
  if (props.campId) fetchSchedule();
});
</script>

<style scoped lang="scss">
/* 容器透明，依附全局米黄画卷 */
.course-schedule-container {
  padding: 10rpx 30rpx 40rpx 10rpx;
  min-height: 500rpx;
  background: transparent;
}

/* ================== 状态提示 ================== */
.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.loading-spinner {
  width: 56rpx;
  height: 56rpx;
  border: 4rpx solid rgba(158, 42, 43, 0.1);
  border-top: 4rpx solid #9e2a2b;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  margin-bottom: 20rpx;
}

.loading-text, .empty-text {
  font-size: 26rpx;
  color: #8c8686;
  letter-spacing: 2rpx;
}

.empty-icon {
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 20rpx;
  opacity: 0.6;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ================== 主干时间轴与模块排版 ================== */
.global-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-row {
  display: flex;
  align-items: stretch;
  margin-bottom: 30rpx;
}

/* 【左侧】全局主轴 */
.global-axis {
  width: 80rpx;
  position: relative;
  flex-shrink: 0;
}

.axis-line {
  position: absolute;
  top: 0;
  bottom: -30rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 4rpx;
  background: rgba(158, 42, 43, 0.15);
  border-radius: 4rpx;
  z-index: 1;
}

.axis-line.is-first {
  top: 40rpx;
}

.axis-line.is-last {
  bottom: auto;
  height: 40rpx;
}

/* 模块节点印章 */
.node-module {
  position: absolute;
  top: 36rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 52rpx;
  height: 52rpx;
  background: #9e2a2b;
  border-radius: 14rpx;
  border: 4rpx solid #f9f7f2;
  box-shadow: 0 4rpx 10rpx rgba(158, 42, 43, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.node-module .node-text {
  font-size: 20rpx;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
}

/* 【右侧】模块纯白卡片容器 */
.module-card-wrap {
  flex: 1;
  width: 0;
}

.module-card {
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 30rpx;
  background: #ffffff;
  transition: background 0.2s ease;
}

.header-hover {
  background: #fdfcfb;
}

.m-title-box {
  display: flex;
  align-items: center;
}

.m-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #2d2424;
  letter-spacing: 1rpx;
}

.m-action-box {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.m-count {
  font-size: 22rpx;
  color: #8c8686;
  background: #f4f6f9;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.chevron-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #fcfcfc;
  border: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chevron-btn.rotated {
  transform: rotate(180deg);
  background: rgba(158, 42, 43, 0.05);
  border-color: transparent;
}

/* 手风琴折叠区 */
.module-body-wrapper {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.module-card.is-expanded {
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.04);
}

.module-card.is-expanded .module-body-wrapper {
  max-height: 4000rpx;
  opacity: 1;
}

.module-body {
  padding: 0 30rpx 30rpx 10rpx;
  border-top: 1px dashed rgba(0, 0, 0, 0.03);
}

/* ================== 内层次级时间轴与日卡片 ================== */
.inner-timeline {
  display: flex;
  flex-direction: column;
  padding-top: 20rpx;
}

.inner-row {
  display: flex;
  align-items: stretch;
  margin-bottom: 24rpx;
}

.inner-row:last-child {
  margin-bottom: 0;
}

/* 【内层左侧】次级轴线 */
.inner-axis {
  width: 60rpx;
  position: relative;
  flex-shrink: 0;
}

.inner-line {
  position: absolute;
  top: 30rpx;
  bottom: -30rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 2rpx;
  background: dashed 2rpx rgba(158, 42, 43, 0.15);
  z-index: 1;
}

.node-day {
  position: absolute;
  top: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #ffffff;
  border: 2rpx solid rgba(158, 42, 43, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #9e2a2b;
  font-size: 16rpx;
  font-weight: 800;
  z-index: 2;
}

/* 【内层右侧】具体内容日卡片 */
.day-card {
  flex: 1;
  background: #f9f7f2;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: transform 0.2s ease, background 0.2s ease;
}

.card-hover {
  transform: scale(0.98);
  background: #f0eee9;
}

.plan-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2d2424;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

.plan-subtitle {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  font-size: 24rpx;
  color: #5d5555;
  margin-bottom: 16rpx;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.5);
  padding: 8rpx 16rpx;
  border-radius: 10rpx;
}

.plan-subtitle .sub-text {
  flex: 1;
}

.plan-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.meta-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 20rpx;
  color: #9e2a2b;
  background: rgba(158, 42, 43, 0.06);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: 600;
}

/* ================== Detail 视图样式 (高级毛玻璃导航) ================== */
.detail-view {
  /* 移除原有的内边距，为了让导航条可以彻底贴顶 */
  padding: 0;
  position: relative;
  /* 由于父容器 .course-schedule-container 有内边距，需要在这里做抵消，或者调整父容器 */
  margin: -10rpx -30rpx 0 -10rpx;
}

.detail-navbar {
  position: sticky;
  top: 0;
  z-index: 999;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  
  /* 苹果级毛玻璃特效 */
  background-color: rgba(249, 247, 242, 0.85); /* 贴合你项目的米黄色基调 */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  
  /* 极细的底部边框线，增加空间层次感 */
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

/* 左侧：固定宽度，防挤压 */
.nav-left {
  display: flex;
  align-items: center;
  width: 120rpx; 
  height: 100%;
  cursor: pointer;
  transition: opacity 0.2s;
}

.nav-left:active {
  opacity: 0.5;
}

.nav-back-text {
  font-size: 28rpx;
  color: #111827;
  font-weight: 500;
  margin-left: 4rpx;
}

/* 中间：自动填充并居中 */
.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* 防止内容撑破 */
}

.nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
  
  /* 核心：超长文字单行省略号，绝不换行破坏布局 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400rpx; 
}

/* 右侧：与左侧宽度绝对一致的空盒子，确保 flex 居中不偏移 */
.nav-right {
  width: 120rpx;
}
</style>