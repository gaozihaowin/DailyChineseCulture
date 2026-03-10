<template>
  <view class="course-schedule">
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载课程安排中...</text>
    </view>
    
    <!-- 数据展示 -->
    <view v-else-if="scheduleList.length > 0" class="schedule-content">
      <!-- 外层循环：遍历模块 -->
      <view 
        v-for="module in scheduleList" 
        :key="module.moduleIndex" 
        class="module-section"
      >
        <!-- 模块标题 -->
        <view class="module-title">
          <view class="title-decoration"></view>
          <text class="title-text">{{ module.moduleName }}</text>
        </view>
        
        <!-- 内层循环：遍历课程计划 -->
        <view class="plans-container">
          <view 
            v-for="plan in module.plans" 
            :key="plan.planId" 
            class="plan-card"
          >
            <!-- 左侧徽章 -->
            <view class="plan-badge">
              <text class="badge-text">Day {{ plan.dayIndex }}</text>
            </view>
            
            <!-- 右侧内容 -->
            <view class="plan-content">
              <text class="plan-title">{{ plan.title }}</text>
              <text class="plan-subtitle">
                {{ plan.readingTitle || '深入学习相关内容，完成实践任务' }}
              </text>
              
              <!-- 教师和时长信息 -->
              <view v-if="plan.teacherName || plan.videoDuration" class="plan-meta">
                <text v-if="plan.teacherName" class="meta-item">
                  <uni-icons type="person-filled" size="12" color="#95a5a6"></uni-icons>
                  {{ plan.teacherName }}
                </text>
                <text v-if="plan.videoDuration" class="meta-item">
                  <uni-icons type="videocam-filled" size="12" color="#95a5a6"></uni-icons>
                  {{ plan.videoDuration }}分钟
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view v-else class="empty-container">
      <uni-icons type="calendar" size="60" color="#cbd5e0"></uni-icons>
      <text class="empty-text">暂无课程安排</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { API_CONFIG } from '@/api/config.js';

// 定义Props
const props = defineProps({
  campId: {
    type: String,
    required: true
  }
});

// 定义响应式状态
const scheduleList = ref([]);
const isLoading = ref(true);

// 数据请求方法
const fetchSchedule = async () => {
  try {
    isLoading.value = true;
    
    // 替换URL中的campId占位符
    const url = API_CONFIG.baseUrl + API_CONFIG.paths.schedule.replace('{{campId}}', props.campId);
    
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: url,
        method: 'GET',
        success: resolve,
        fail: reject
      });
    });
    
    const apiData = response.data;
    
    if (apiData.code === 200) {
      scheduleList.value = apiData.data || [];
    } else {
      console.error('获取课程安排失败:', apiData.msg);
      uni.showToast({
        title: apiData.msg || '获取课程安排失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('网络请求失败:', error);
    uni.showToast({
      title: '网络连接异常',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
};

// 监听campId变化
watch(() => props.campId, (newCampId) => {
  if (newCampId) {
    fetchSchedule();
  }
});

// 组件挂载时获取数据
onMounted(() => {
  if (props.campId) {
    fetchSchedule();
  }
});
</script>

<style scoped>
.course-schedule {
  padding: 30rpx 40rpx;
  min-height: 400rpx;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top: 4rpx solid #9e2a2b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #95a5a6;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 模块标题样式 */
.module-section {
  margin-bottom: 50rpx;
}

.module-title {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.title-decoration {
  width: 8rpx;
  height: 30rpx;
  background-color: #9e2a2b;
  border-radius: 4rpx;
  margin-right: 20rpx;
}

.title-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #2c3e50;
}

/* 课程计划卡片样式 */
.plans-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.plan-card {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
  border: 1rpx solid rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.plan-card:active {
  background-color: #f9f9f9;
  transform: scale(0.98);
}

/* 左侧徽章 */
.plan-badge {
  width: 80rpx;
  height: 80rpx;
  background-color: #9e2a2b;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.badge-text {
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
}

/* 右侧内容 */
.plan-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.plan-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.plan-subtitle {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 22rpx;
  color: #95a5a6;
}

/* 空状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: #cbd5e0;
  margin-top: 20rpx;
}
</style>