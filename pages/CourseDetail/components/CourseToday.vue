<template>
  <view class="course-today">
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载今日课程中...</text>
    </view>

    <view v-else-if="courseData" class="content-wrapper">
      
      <view v-if="!courseData.hasCourse" class="empty-state">
        <view class="empty-icon-wrapper">
          <uni-icons type="calendar" size="80" color="#d1d5db"></uni-icons>
        </view>
        <text class="empty-date">{{ courseData.currentDate }}</text>
        <text class="empty-text">暂无课程安排</text>
        <text class="empty-hint">今日可好好休息，或回顾往日所学</text>
      </view>

      <view v-else class="today-content">
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

        <view class="tasks-section">
          <text class="section-title">今日任务</text>

          <view class="tasks-list">
            <view
              v-for="task in courseData.tasks"
              :key="task.taskId"
              class="task-card"
              :class="{ 'task-done': task.isDone === 1 }"
              @click="openTaskPopup(task)"
            >
              <view class="task-icon" :class="getTaskTypeClass(task.taskType)">
                <uni-icons
                  :type="task.isDone === 1 ? 'checkmarkempty' : getTaskIcon(task.taskType)"
                  size="20"
                  :color="task.isDone === 1 ? '#ffffff' : getTaskIconColor(task.taskType)"
                ></uni-icons>
              </view>

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

    <view v-else class="error-state">
      <uni-icons type="refresh" size="60" color="#d1d5db"></uni-icons>
      <text class="error-text">数据加载失败</text>
      <text class="error-hint" @click="fetchTodayData">点击重试</text>
    </view>

    <uni-popup
      ref="taskPopup"
      type="bottom"
      background-color="#ffffff"
      mask-background-color="rgba(0,0,0,0.6)" 
      class="safe-popup" 
    >
      <view class="task-popup-container">
        <view class="popup-header">
          <text class="popup-title">{{ currentTask?.taskName || '' }}</text>
          <view class="popup-close" @click="closeTaskPopup">
            <uni-icons type="close" size="20" color="#6b7280"></uni-icons>
          </view>
        </view>

        <scroll-view scroll-y class="popup-scroll">
          
          <view v-if="currentTask?.taskType === 'VIDEO'" class="video-container">
            <video
              v-if="currentTask.taskUrl"
              :src="currentTask.taskUrl"
              class="task-video"
              controls
              object-fit="contain"
            ></video>
            <view v-else class="video-placeholder">
              <uni-icons type="videocam" size="60" color="#d1d5db"></uni-icons>
              <text class="placeholder-text">暂无视频内容</text>
            </view>
          </view>

          <view v-else-if="currentTask?.taskType === 'READ'" class="read-container">
            <rich-text
              v-if="currentTask.taskDesc || currentTask.taskUrl"
              :nodes="currentTask.taskUrl ? `<a href='${currentTask.taskUrl}'>点击查看阅读材料</a><br><br>${currentTask.taskDesc}` : currentTask.taskDesc"
              class="read-content"
            ></rich-text>
            <view v-else class="read-placeholder">
              <text class="placeholder-text">暂无阅读内容</text>
            </view>
          </view>

          <view v-else-if="currentTask?.taskType === 'HOMEWORK'" class="homework-container">
            <textarea
              v-model="homeworkContent"
              class="homework-textarea"
              :placeholder="currentTask?.isDone === 1 ? '你已提交过心得体会' : '请输入你的心得体会（字数不限）...'"
              placeholder-class="textarea-placeholder"
              maxlength="2000"
              :disabled="currentTask?.isDone === 1"
            ></textarea>
            <text class="word-count">{{ homeworkContent.length }} / 2000</text>
          </view>

          <view v-else class="extra-container">
            <view class="extra-icon-wrapper">
              <uni-icons type="star" size="48" color="#10b981"></uni-icons>
            </view>
            <text class="extra-title">{{ currentTask?.taskName }}</text>
            <text v-if="currentTask?.taskDesc" class="extra-desc">{{ currentTask.taskDesc }}</text>
            <text v-else class="extra-desc">这是一项选修拓展任务，点击下方按钮完成即可。</text>
          </view>

        </scroll-view>

        <view class="popup-footer">
          <button
            class="submit-btn"
            :class="{ 'btn-disabled': isSubmitting || currentTask?.isDone === 1 }"
            @click="submitTask"
          >
            <text v-if="isSubmitting">提交中...</text>
            <text v-else-if="currentTask?.isDone === 1">已完成</text>
            <text v-else>确认完成</text>
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { API_CONFIG } from '@/api/config.js';
import { request } from '@/utils/request.js';

// ========== Props & Emits ==========
const props = defineProps({
  campId: {
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['updateProgress']);

// ========== 响应式状态 ==========
const courseData = ref(null);
const isLoading = ref(true);
const currentTask = ref(null);
const homeworkContent = ref('');
const taskPopup = ref(null);
const isSubmitting = ref(false);

// ========== 获取今日课程数据 ==========
const fetchTodayData = async () => {
  try {
    isLoading.value = true;
    const url = API_CONFIG.paths.todayCourse.replace('{{campId}}', props.campId.toString());
    const response = await request({ url: url, method: 'GET' });
    const apiData = response.data;

    if (apiData.code === 200) {
      courseData.value = apiData.data || null;
    } else {
      uni.showToast({ title: apiData.msg || '获取今日课程失败', icon: 'none' });
    }
  } catch (error) {
    console.error('网络请求失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// ========== 辅助计算与样式方法 ==========
const getCompletedCount = () => {
  if (!courseData.value || !courseData.value.tasks) return 0;
  return courseData.value.tasks.filter(task => task.isDone === 1).length;
};

const getTaskTypeClass = (taskType) => {
  return taskType === 'FIXED' || taskType === 'READ' || taskType === 'VIDEO' ? 'icon-fixed' : 'icon-extra';
};

const getTaskIcon = (taskType) => {
  switch (taskType) {
    case 'READ': return 'info'; 
    case 'VIDEO': return 'videocam';
    case 'HOMEWORK': return 'compose';
    case 'EXTRA': return 'star';
    default: return 'star';
  }
};

const getTaskIconColor = (taskType) => {
  switch (taskType) {
    case 'READ': return '#3b82f6';
    case 'VIDEO': return '#8b5cf6';
    case 'HOMEWORK': return '#f59e0b';
    case 'EXTRA': return '#10b981';
    default: return '#9e2a2b';
  }
};

// ========== 弹窗控制 ==========
const openTaskPopup = (task) => {
  currentTask.value = task;
  homeworkContent.value = '';
  // 确保弹窗能够正常打开
  if (taskPopup.value) {
      taskPopup.value.open();
  }
};

const closeTaskPopup = () => {
  if (taskPopup.value) {
      taskPopup.value.close();
  }
  setTimeout(() => {
    currentTask.value = null;
    homeworkContent.value = '';
  }, 300);
};

// ========== 核心提交逻辑 ==========
const submitTask = async () => {
  if (isSubmitting.value || !currentTask.value || currentTask.value.isDone === 1) return;

  const task = currentTask.value;

  if (task.taskType === 'HOMEWORK' && !homeworkContent.value.trim()) {
    uni.showToast({ title: '请输入心得体会后再提交', icon: 'none' });
    return;
  }

  isSubmitting.value = true;
  uni.showLoading({ title: '提交中...', mask: true });

  try {
    const planId = courseData.value.planId;
    let url = '';
    let payload = {};

    if (task.taskType === 'HOMEWORK') {
      url = API_CONFIG.paths.submitHomework || `/courses/homework/submit`;
      payload = { 
        planId: planId, 
        taskId: task.taskId, 
        content: homeworkContent.value 
      };
    } else {
      url = API_CONFIG.paths.completeTask.replace('{{planId}}', planId.toString());
      payload = { taskId: task.taskId };
    }

    const response = await request({
      url: url,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: payload
    });

    const apiData = response.data;

    if (apiData.code === 200) {
      task.isDone = 1;
      if (apiData.data && apiData.data.completionRate !== undefined) {
          courseData.value.completionRate = apiData.data.completionRate;
          emit('updateProgress', courseData.value.completionRate);
      } else {
          fetchTodayData();
      }
      closeTaskPopup();
      uni.hideLoading();
      uni.showToast({ title: '任务完成！', icon: 'success' });
    } else {
      uni.hideLoading();
      uni.showToast({ title: apiData.msg || '提交失败', icon: 'none' });
    }
  } catch (error) {
    uni.hideLoading();
    console.error('提交请求失败:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// ========== 生命周期与监听 ==========
watch(() => props.campId, (newCampId) => {
  if (newCampId) {
    fetchTodayData();
  }
});

onMounted(() => {
  if (props.campId) {
    fetchTodayData();
  }
});
</script>

<style scoped lang="scss">
.course-today {
  min-height: 600rpx;
  background-color: transparent !important;
}

/* =========================================
   加载与空状态
========================================= */
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

.content-wrapper { 
  padding: 30rpx; 
}

.empty-state { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  padding: 120rpx 60rpx; 
  background-color: #ffffff !important; 
  border-radius: 30rpx; 
  margin: 24rpx 30rpx; 
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); 
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

/* =========================================
   进度卡片与列表骨架
========================================= */
.today-content .header-section { 
  margin-bottom: 40rpx; 
}

.today-content .date-row { 
  display: flex; 
  align-items: center; 
  gap: 16rpx; 
  margin-bottom: 24rpx; 
}

.today-content .current-date { 
  font-size: 40rpx; 
  font-weight: 700; 
  color: #1f2937; 
  letter-spacing: 2rpx; 
}

.today-content .date-tag { 
  padding: 8rpx 20rpx; 
  background: linear-gradient(135deg, #9e2a2b, #b91c1c); 
  border-radius: 24rpx; 
  font-size: 22rpx; 
  color: #ffffff; 
  font-weight: 500; 
}

.progress-card { 
  background-color: #ffffff !important; 
  border-radius: 30rpx; 
  padding: 32rpx; 
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); 
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

.tasks-section .section-title { 
  font-size: 30rpx; 
  font-weight: 600; 
  color: #1f2937; 
  margin-bottom: 24rpx; 
  display: block; 
  letter-spacing: 2rpx; 
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
  border-radius: 30rpx; 
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); 
  border: 1px solid rgba(255, 255, 255, 0.5); 
  transition: all 0.25s ease; 
}

.task-card:active { 
  background-color: #fafaf9; 
  transform: scale(0.995); 
}

.task-card.task-done { 
  opacity: 0.85; 
  background-color: #fafaf9; 
}

.task-card.task-done .task-title { 
  color: #9ca3af; 
  text-decoration: line-through; 
}

.task-card.task-done .task-subtitle { 
  color: #d1d5db; 
}

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
}

.task-icon.icon-fixed { 
  background-color: #fef2f2; 
  border: 2rpx solid #fecaca; 
}

.task-icon.icon-extra { 
  background-color: #ecfdf5; 
  border: 2rpx solid #a7f3d0; 
}

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

.task-status { 
  margin-left: 16rpx; 
  flex-shrink: 0; 
}

.status-done { 
  padding: 8rpx 16rpx; 
  background-color: #dcfce7; 
  border-radius: 24rpx; 
}

.status-done .status-text { 
  font-size: 22rpx; 
  font-weight: 500; 
  color: #16a34a; 
}

.status-pending { 
  display: flex; 
  align-items: center; 
  gap: 8rpx; 
  padding: 8rpx 16rpx; 
  background-color: #f3f4f6; 
  border-radius: 24rpx; 
}

.status-pending .status-text { 
  font-size: 22rpx; 
  font-weight: 500; 
  color: #6b7280; 
}

.error-state { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  padding: 160rpx 60rpx; 
}

.error-state .error-text { 
  font-size: 28rpx; 
  color: #6b7280; 
  margin-top: 24rpx; 
  margin-bottom: 16rpx; 
}

.error-state .error-hint { 
  font-size: 26rpx; 
  color: #9e2a2b; 
  padding: 12rpx 32rpx; 
  border: 2rpx solid #9e2a2b; 
  border-radius: 32rpx; 
}

/* =========================================
   任务详情弹出层 - 终极修复方案
========================================= */

/* 强制提升层级，尝试在组件级压盖 */
:deep(.safe-popup) {
    position: relative;
    z-index: 99999 !important;
}

/* 在弹窗内部显式包裹一层有背景色的容器，防止内容透明 */
.task-popup-container {
  display: flex;
  flex-direction: column;
  height: 70vh;
  max-height: 70vh;
  background-color: #ffffff; /* 确保背景色为白色 */
  border-radius: 20rpx 20rpx 0 0; /* 保持圆角 */
  overflow: hidden; /* 防止内容溢出圆角 */
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 30rpx;
  border-bottom: 1rpx solid #f3f4f6;
  flex-shrink: 0;
  background-color: #ffffff; /* 确保标题栏背景色 */
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 24rpx;
}

.popup-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 50%;
  flex-shrink: 0;
}

.popup-scroll {
  flex: 1;
  height: 0; 
  padding: 30rpx;
  box-sizing: border-box;
  background-color: #ffffff; /* 确保滚动区背景色 */
}

.popup-footer {
  padding: 24rpx 30rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f3f4f6;
  background-color: #ffffff; /* 确保底部操作区背景色 */
  flex-shrink: 0;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #9e2a2b, #b91c1c);
  border-radius: 44rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  border: none;
  transition: opacity 0.3s;

  &.btn-disabled {
    background: #e5e7eb;
    color: #9ca3af;
  }
}

/* =========================================
   容器内部样式 (视频、阅读、作业)
========================================= */
.video-container { 
  width: 100%; 
}

.task-video { 
  width: 100%; 
  height: 400rpx; 
  border-radius: 16rpx; 
  background-color: #000000; 
}

.video-placeholder { 
  width: 100%; 
  height: 400rpx; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  background-color: #f9fafb; 
  border-radius: 16rpx; 
}

.video-placeholder .placeholder-text { 
  font-size: 26rpx; 
  color: #9ca3af; 
  margin-top: 16rpx; 
}

.read-container { 
  width: 100%; 
}

.read-content { 
  font-size: 28rpx; 
  line-height: 1.8; 
  color: #374151; 
}

.read-placeholder { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 80rpx 0; 
}

.read-placeholder .placeholder-text { 
  font-size: 26rpx; 
  color: #9ca3af; 
}

.homework-container { 
  width: 100%; 
}

.homework-textarea { 
  width: 100%; 
  height: 400rpx; 
  padding: 24rpx; 
  background-color: #f9fafb; 
  border-radius: 16rpx; 
  font-size: 28rpx; 
  line-height: 1.6; 
  color: #1f2937; 
  box-sizing: border-box; 
}

.textarea-placeholder { 
  color: #9ca3af; 
  font-size: 28rpx; 
}

.word-count { 
  display: block; 
  text-align: right; 
  font-size: 22rpx; 
  color: #9ca3af; 
  margin-top: 12rpx; 
}

.extra-container { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  padding: 60rpx 30rpx; 
  text-align: center; 
}

.extra-icon-wrapper { 
  width: 120rpx; 
  height: 120rpx; 
  background: linear-gradient(135deg, #ecfdf5, #d1fae5); 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin-bottom: 32rpx; 
}

.extra-title { 
  font-size: 32rpx; 
  font-weight: 600; 
  color: #1f2937; 
  margin-bottom: 16rpx; 
}

.extra-desc { 
  font-size: 26rpx; 
  color: #6b7280; 
  line-height: 1.6; 
}
</style>