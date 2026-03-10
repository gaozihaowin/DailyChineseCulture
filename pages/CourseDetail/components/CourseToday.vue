<template>
  <view class="course-today">
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载今日课程中...</text>
    </view>
    
    <!-- 数据展示 -->
    <view v-else-if="courseData.tasks && courseData.tasks.length > 0" class="today-content">
      <!-- 顶部进度条区 -->
      <view class="progress-section">
        <view class="progress-header">
          <text class="progress-title">今日学习进度</text>
          <text class="progress-rate">{{ courseData.completionRate }}%</text>
        </view>
        
        <view class="progress-bar-container">
          <view class="progress-bar-bg">
            <view 
              class="progress-bar-fill" 
              :style="{ width: courseData.completionRate + '%' }"
            ></view>
          </view>
        </view>
        
        <text class="progress-desc">
          今日已完成 {{ getCompletedCount() }} / {{ courseData.tasks.length }} 项任务
        </text>
      </view>
      
      <!-- 任务列表区 -->
      <view class="tasks-section">
        <text class="section-title">今日任务清单</text>
        
        <view class="tasks-list">
          <view 
            v-for="task in courseData.tasks" 
            :key="task.taskId" 
            class="task-card"
            @click="handleCompleteTask(task)"
          >
            <!-- 左侧任务类型标识 -->
            <view class="task-type" :class="getTaskTypeClass(task.taskType)">
              <text class="type-text">{{ getTaskTypeText(task.taskType) }}</text>
            </view>
            
            <!-- 中间任务内容 -->
            <view class="task-content">
              <text class="task-title">{{ task.title }}</text>
              <text v-if="task.subtitle" class="task-subtitle">{{ task.subtitle }}</text>
            </view>
            
            <!-- 右侧任务状态 -->
            <view class="task-status">
              <view v-if="task.isDone === 1" class="status-done">
                <uni-icons type="checkmarkempty" size="16" color="#22c55e"></uni-icons>
                <text class="status-text">已完成</text>
              </view>
              <view v-else class="status-pending">
                <view class="pending-circle"></view>
                <text class="status-text">去完成</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view v-else class="empty-container">
      <uni-icons type="calendar" size="60" color="#cbd5e0"></uni-icons>
      <text class="empty-text">今日暂无课程安排</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { API_CONFIG } from '@/api/config.js';

// 定义Props
const props = defineProps({
  campId: {
    type: [Number, String],
    required: true
  }
});

// 定义响应式状态
const courseData = ref({
  planId: 0,
  completionRate: 0,
  tasks: []
});
const isLoading = ref(true);

// 数据请求方法
const fetchTodayData = async () => {
  try {
    isLoading.value = true;
    
    // 替换URL中的campId占位符
    const url = API_CONFIG.baseUrl + API_CONFIG.paths.todayCourse.replace('{{campId}}', props.campId.toString());
    
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
      courseData.value = apiData.data || { completionRate: 0, tasks: [] };
    } else {
      console.error('获取今日课程失败:', apiData.msg);
      uni.showToast({
        title: apiData.msg || '获取今日课程失败',
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

// 计算已完成任务数量
const getCompletedCount = () => {
  return courseData.value.tasks.filter(task => task.isDone === 1).length;
};

// 获取任务类型样式类
const getTaskTypeClass = (taskType) => {
  return taskType === 'FIXED' ? 'type-fixed' : 'type-extra';
};

// 获取任务类型文本
const getTaskTypeText = (taskType) => {
  return taskType === 'FIXED' ? '必修' : '选修';
};

// 处理任务打卡
const handleCompleteTask = async (task) => {
  // 防抖防呆：如果任务已完成，直接返回
  if (task.isDone === 1) {
    uni.showToast({
      title: '任务已完成',
      icon: 'success'
    });
    return;
  }
  
  // 打开Loading
  uni.showLoading({ title: '打卡记录中...' });
  
  try {
    // 从组件状态中获取真实的planId
    const planId = courseData.value.planId;
    if (!planId) {
      throw new Error('未获取到有效的planId');
    }
    
    // 替换URL中的planId占位符
    const url = API_CONFIG.baseUrl + API_CONFIG.paths.completeTask.replace('{{planId}}', planId.toString());
    
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: url,
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: { taskType: task.taskId },
        success: resolve,
        fail: reject
      });
    });
    
    const apiData = response.data;
    
    if (apiData.code === 200) {
      // 极致的就地更新：直接修改当前任务状态和总进度
      task.isDone = 1;
      courseData.value.completionRate = apiData.data.completionRate;
      
      // 关闭Loading，显示成功提示
      uni.hideLoading();
      uni.showToast({
        title: '任务完成！',
        icon: 'success'
      });
    } else {
      uni.hideLoading();
      uni.showToast({
        title: apiData.msg || '打卡失败',
        icon: 'none'
      });
    }
  } catch (error) {
    uni.hideLoading();
    console.error('打卡请求失败:', error);
    uni.showToast({
      title: '网络连接异常',
      icon: 'none'
    });
  }
};

// 监听campId变化
watch(() => props.campId, (newCampId) => {
  if (newCampId) {
    fetchTodayData();
  }
});

// 组件挂载时获取数据
onMounted(() => {
  if (props.campId) {
    fetchTodayData();
  }
});
</script>

<style scoped>
.course-today {
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

/* 进度条区域样式 */
.progress-section {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.progress-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
}

.progress-rate {
  font-size: 32rpx;
  font-weight: 700;
  color: #9e2a2b;
}

.progress-bar-container {
  margin-bottom: 20rpx;
}

.progress-bar-bg {
  width: 100%;
  height: 12rpx;
  background-color: #e9ecef;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #9e2a2b, #c53e3f);
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

.progress-desc {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

/* 任务列表区域样式 */
.tasks-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24rpx;
  display: block;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.task-card {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.task-card:active {
  background-color: #f9f9f9;
  transform: scale(0.98);
}

/* 任务类型标识 */
.task-type {
  width: 60rpx;
  height: 60rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.type-fixed {
  background-color: #e0f2fe;
  border: 2rpx solid #0ea5e9;
}

.type-extra {
  background-color: #f0f9ff;
  border: 2rpx solid #38bdf8;
}

.type-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #0ea5e9;
}

.type-extra .type-text {
  color: #38bdf8;
}

/* 任务内容 */
.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.task-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.task-subtitle {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

/* 任务状态 */
.task-status {
  margin-left: 20rpx;
  flex-shrink: 0;
}

.status-done {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.status-pending {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.pending-circle {
  width: 16rpx;
  height: 16rpx;
  border: 2rpx solid #9e2a2b;
  border-radius: 50%;
}

.status-text {
  font-size: 22rpx;
  font-weight: 500;
}

.status-done .status-text {
  color: #22c55e;
}

.status-pending .status-text {
  color: #9e2a2b;
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