<template>
  <view class="course-today">
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载今日课程中...</text>
    </view>

    <!-- 数据展示 -->
    <view v-else-if="courseData" class="content-wrapper">
      <!-- 场景 A：今日无课 -->
      <view v-if="!courseData.hasCourse" class="empty-state">
        <view class="empty-icon-wrapper">
          <uni-icons type="calendar" size="80" color="#d1d5db"></uni-icons>
        </view>
        <text class="empty-date">{{ courseData.currentDate }}</text>
        <text class="empty-text">暂无课程安排</text>
        <text class="empty-hint">今日可好好休息，或回顾往日所学</text>
      </view>

      <!-- 场景 B：今日有课 -->
      <view v-else class="today-content">
        <!-- 顶部日期与进度区 -->
        <view class="header-section">
          <view class="date-row">
            <text class="current-date">{{ courseData.currentDate }}</text>
            <view class="date-tag">今日课程</view>
          </view>

          <view class="progress-card">
            <view class="progress-header">
              <text class="progress-label">学习进度</text>
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
              已完成 {{ getCompletedCount() }} / {{ courseData.tasks.length }} 项任务
            </text>
          </view>
        </view>

        <!-- 任务列表区 -->
        <view class="tasks-section">
          <text class="section-title">今日任务</text>

          <view class="tasks-list">
            <view
              v-for="task in courseData.tasks"
              :key="task.taskId"
              class="task-card"
              :class="{ 'task-done': task.isDone === 1 }"
              @click="handleCompleteTask(task)"
            >
              <!-- 左侧图标 -->
              <view class="task-icon" :class="getTaskTypeClass(task.taskType)">
                <uni-icons
                  :type="task.isDone === 1 ? 'checkmarkempty' : getTaskIcon(task.taskType)"
                  size="20"
                  :color="task.isDone === 1 ? '#ffffff' : getTaskIconColor(task.taskType)"
                ></uni-icons>
              </view>

              <!-- 中间内容 -->
              <view class="task-content">
                <view class="title-row">
                  <text class="task-title">{{ task.taskName }}</text>
                  <view 
                    class="required-tag" 
                    :class="task.isRequired === 1 ? 'tag-required' : 'tag-optional'"
                  >
                    {{ task.isRequired === 1 ? '必修' : '选修' }}
                  </view>
                </view>
                <text v-if="task.taskDesc" class="task-subtitle">{{ task.taskDesc }}</text>
              </view>

              <!-- 右侧状态 -->
              <view class="task-status">
                <view v-if="task.isDone === 1" class="status-done">
                  <text class="status-text">已完成</text>
                </view>
                <view v-else class="status-pending">
                  <text class="status-text">去完成</text>
                  <uni-icons type="arrowright" size="14" color="#9ca3af"></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 错误/空数据状态 -->
    <view v-else class="error-state">
      <uni-icons type="refresh" size="60" color="#d1d5db"></uni-icons>
      <text class="error-text">数据加载失败</text>
      <text class="error-hint" @click="fetchTodayData">点击重试</text>
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

// 定义 Emits
const emit = defineEmits(['updateProgress']);

// 定义响应式状态
const courseData = ref(null);
const isLoading = ref(true);

// 数据请求方法
const fetchTodayData = async () => {
  try {
    isLoading.value = true;

    // 替换 URL 中的 campId 占位符
    const url = API_CONFIG.paths.todayCourse.replace('{{campId}}', props.campId.toString());

    const response = await request({
      url: url,
      method: 'GET'
    });

    const apiData = response.data;

    if (apiData.code === 200) {
      courseData.value = apiData.data || null;
    } else {
      console.error('获取今日课程失败:', apiData.msg);
      uni.showToast({
        title: apiData.msg || '获取今日课程失败',
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

// 计算已完成任务数量
const getCompletedCount = () => {
  if (!courseData.value || !courseData.value.tasks) return 0;
  return courseData.value.tasks.filter(task => task.isDone === 1).length;
};

// 获取任务类型样式类
const getTaskTypeClass = (taskType) => {
  return taskType === 'FIXED' ? 'icon-fixed' : 'icon-extra';
};

// 获取任务图标
const getTaskIcon = (taskType) => {
  switch (taskType) {
    case 'READ': return 'info'; // uni-icons 的 book 类似图标通常是 info 或者直接用文本 emoji 代替更好，这里尽量用存在的，或者 'info' / 'star'，其实 'image' / 'camera' 等也可以。如果使用原生 uni-icons，可以用 'info' 代表阅读，'videocam' 代表视频。我们用 'info'。
    case 'VIDEO': return 'videocam';
    case 'HOMEWORK': return 'compose';
    case 'EXTRA': return 'star';
    default: return 'star';
  }
};

// 获取任务图标颜色
const getTaskIconColor = (taskType) => {
  switch (taskType) {
    case 'READ': return '#3b82f6';
    case 'VIDEO': return '#8b5cf6';
    case 'HOMEWORK': return '#f59e0b';
    case 'EXTRA': return '#10b981';
    default: return '#9e2a2b';
  }
};

// 处理任务打卡
const handleCompleteTask = async (task) => {
  // 防呆：如果任务已完成，直接返回
  if (task.isDone === 1) {
    uni.showToast({
      title: '任务已完成',
      icon: 'success'
    });
    return;
  }

  // 打开 Loading（防止用户疯狂连点）
  uni.showLoading({ title: '记录中...', mask: true });

  try {
    // 从组件状态中获取真实的 planId
    const planId = courseData.value.planId;
    if (!planId) {
      throw new Error('未获取到有效的 planId');
    }

    // 替换 URL 中的 planId 占位符
    const url = API_CONFIG.paths.completeTask.replace('{{planId}}', planId.toString());

    const response = await request({
      url: url,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { taskId: task.taskId }
    });

    const apiData = response.data;

    if (apiData.code === 200) {
      // 就地更新：直接修改当前任务状态
      task.isDone = 1;

      // 更新总进度（后端返回的 completionRate，选修任务打卡时可能不变）
      courseData.value.completionRate = apiData.data.completionRate;

      // 发出事件通知父组件进度更新
      emit('updateProgress', courseData.value.completionRate);

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
  }
};

// 监听 campId 变化
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

<style scoped lang="scss">
.course-today {
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
  border-top: 4rpx solid #9e2a2b;
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

/* ========== 场景 A：今日无课 - 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  background-color: #ffffff !important;
  border-radius: 30rpx; /* 匹配首页的 30rpx 圆角 */
  margin: 24rpx 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); /* 匹配首页的细腻阴影 */
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.empty-icon-wrapper {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.empty-date {
  font-size: 36rpx;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #6b7280;
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #9ca3af;
  letter-spacing: 1rpx;
}

/* ========== 场景 B：今日有课 ========== */
.today-content {
  .header-section {
    margin-bottom: 40rpx;
  }

  .date-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }

  .current-date {
    font-size: 40rpx;
    font-weight: 700;
    color: #1f2937;
    letter-spacing: 2rpx;
  }

  .date-tag {
    padding: 8rpx 20rpx;
    background: linear-gradient(135deg, #9e2a2b, #b91c1c);
    border-radius: 24rpx;
    font-size: 22rpx;
    color: #ffffff;
    font-weight: 500;
  }
}

/* ========== 进度卡片 ========== */
.progress-card {
  background-color: #ffffff !important;
  border-radius: 30rpx; /* 匹配首页的 30rpx 圆角 */
  padding: 32rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); /* 匹配首页的细腻阴影 */
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.progress-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #4b5563;
}

.progress-rate {
  font-size: 36rpx;
  font-weight: 700;
  color: #9e2a2b;
}

.progress-bar-container {
  margin-bottom: 16rpx;
}

.progress-bar-bg {
  width: 100%;
  height: 12rpx;
  background-color: #e5e7eb;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #9e2a2b, #dc2626);
  border-radius: 6rpx;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-desc {
  font-size: 24rpx;
  color: #6b7280;
  text-align: right;
  display: block;
}

/* ========== 任务列表区域 ========== */
.tasks-section {
  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 24rpx;
    display: block;
    letter-spacing: 2rpx;
  }
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.task-card {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  background-color: #ffffff !important;
  border-radius: 30rpx; /* 匹配首页的 30rpx 圆角 */
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); /* 匹配首页的细腻阴影 */
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.25s ease;

  &:active {
    background-color: #fafaf9;
    transform: scale(0.995);
  }

  &.task-done {
    opacity: 0.85;
    background-color: #fafaf9;

    .task-title {
      color: #9ca3af;
      text-decoration: line-through;
    }

    .task-subtitle {
      color: #d1d5db;
    }
  }
}

/* 任务图标 */
.task-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
  transition: all 0.3s ease;

  &.icon-fixed {
    background-color: #fef2f2;
    border: 2rpx solid #fecaca;
  }

  &.icon-extra {
    background-color: #ecfdf5;
    border: 2rpx solid #a7f3d0;
  }
}

/* 任务内容 */
.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.task-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.required-tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;
  font-weight: 500;
  white-space: nowrap;
}

.tag-required {
  background-color: #fee2e2;
  color: #ef4444;
}

.tag-optional {
  background-color: #f3f4f6;
  color: #9ca3af;
}

.task-subtitle {
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 任务状态 */
.task-status {
  margin-left: 16rpx;
  flex-shrink: 0;
}

.status-done {
  padding: 8rpx 16rpx;
  background-color: #dcfce7;
  border-radius: 24rpx;

  .status-text {
    font-size: 22rpx;
    font-weight: 500;
    color: #16a34a;
  }
}

.status-pending {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background-color: #f3f4f6;
  border-radius: 24rpx;

  .status-text {
    font-size: 22rpx;
    font-weight: 500;
    color: #6b7280;
  }
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
    color: #9e2a2b;
    padding: 12rpx 32rpx;
    border: 2rpx solid #9e2a2b;
    border-radius: 32rpx;
  }
}
</style>
