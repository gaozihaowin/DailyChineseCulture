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
      background-color="#fff"
      border-radius="24rpx 24rpx 0 0"
      class="safe-popup"
    >
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ currentTask?.taskName || '' }}</text>
          <view class="popup-close" @click="closeTaskPopup">
            <uni-icons type="closeempty" size="20" color="#9ca3af"></uni-icons>
          </view>
        </view>

        <view class="popup-body">
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
                <view class="placeholder-icon-circle">
                  <uni-icons type="videocam" size="40" color="#d1d5db"></uni-icons>
                </view>
                <text class="placeholder-text">暂无视频内容</text>
              </view>
            </view>

            <view v-else-if="currentTask?.taskType === 'READ'" class="read-container">
              <rich-text
                v-if="currentTask.taskDesc || currentTask.taskUrl"
                :nodes="currentTask.taskUrl ? `<a href='${currentTask.taskUrl}' style='color:#9e2a2b; text-decoration:underline;'>点击查看阅读材料</a><br><br>${currentTask.taskDesc}` : currentTask.taskDesc"
                class="read-content"
              ></rich-text>
              <view v-else class="read-placeholder">
                <text class="placeholder-text">暂无阅读内容</text>
              </view>
            </view>

            <view v-else-if="currentTask?.taskType === 'HOMEWORK'" class="homework-container">
              <view class="homework-input-wrapper">
                <textarea
                  v-model="homeworkContent"
                  class="homework-textarea"
                  :placeholder="currentTask?.isDone === 1 ? '你已提交过心得体会' : '请输入你的心得体会，记录此刻的灵感...'"
                  placeholder-class="textarea-placeholder"
                  maxlength="2000"
                  :disabled="currentTask?.isDone === 1"
                ></textarea>
                <text class="word-count">{{ homeworkContent.length }} / 2000</text>
              </view>
            </view>

            <view v-else class="extra-container">
              <view class="extra-icon-wrapper">
                <uni-icons type="star-filled" size="48" color="#10b981"></uni-icons>
              </view>
              <text class="extra-title">{{ currentTask?.taskName }}</text>
              <text v-if="currentTask?.taskDesc" class="extra-desc">{{ currentTask.taskDesc }}</text>
              <text v-else class="extra-desc">这是一项选修拓展任务，点击下方按钮完成即可。</text>
            </view>
          </scroll-view>
        </view>

        <view class="popup-footer">
          <button
            class="submit-btn"
            :class="{ 'btn-disabled': isSubmitting || currentTask?.isDone === 1 }"
            @click="submitTask"
            hover-class="submit-btn-hover"
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

const props = defineProps({
  campId: {
    type: [Number, String],
    required: true
  },
  // =========================================
  // 升维改造：新增 targetPlanId，支持查看任意一天的课程
  // 如果传入了 planId，后端会返回对应那天的数据
  // 如果为 null，则后端自动返回"今天"的数据
  // =========================================
  targetPlanId: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['updateProgress']);

const courseData = ref(null);
const isLoading = ref(true);
const currentTask = ref(null);
const homeworkContent = ref('');
const taskPopup = ref(null);
const isSubmitting = ref(false);

const fetchTodayData = async () => {
  try {
    isLoading.value = true;

    // =========================================
    // 升维改造：构建 URL，支持可选的 planId 查询参数
    // 如果传入了 targetPlanId，则请求指定那天的数据
    // =========================================
    let url = API_CONFIG.paths.todayCourse.replace('{{campId}}', props.campId.toString());
    if (props.targetPlanId) {
      url += `?planId=${props.targetPlanId}`;
    }

    const response = await request({ url: url, method: 'GET' });
    const apiData = response.data;

    if (apiData.code === 200) {
      courseData.value = apiData.data || null;
    } else {
      uni.showToast({ title: apiData.msg || '获取课程数据失败', icon: 'none' });
    }
  } catch (error) {
    console.error('网络请求失败:', error);
  } finally {
    isLoading.value = false;
  }
};

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

const openTaskPopup = (task) => {
  currentTask.value = task;
  homeworkContent.value = '';
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
      uni.$emit('refreshCourseList');
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

// =========================================
// 双重 Watch 监听：确保切换"天"时能实时响应
// =========================================

// 监听 campId 变化（营期切换）
watch(() => props.campId, (newCampId) => {
  if (newCampId) {
    fetchTodayData();
  }
});

// =========================================
// 升维改造核心：监听 targetPlanId 变化
// 当父组件（如课程大纲）切换到不同天时，
// targetPlanId 会变化，触发数据重新拉取
// =========================================
watch(() => props.targetPlanId, (newVal) => {
  fetchTodayData();
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
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 160rpx 0; }
.loading-spinner { width: 56rpx; height: 56rpx; border: 4rpx solid #e5e7eb; border-top: 4rpx solid #9e2a2b; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 24rpx; }
.loading-text { font-size: 26rpx; color: #9ca3af; letter-spacing: 2rpx; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.content-wrapper { padding: 30rpx; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120rpx 60rpx; background-color: #ffffff !important; border-radius: 30rpx; margin: 24rpx 30rpx; box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); border: 1px solid rgba(255, 255, 255, 0.5); }
.empty-icon-wrapper { width: 160rpx; height: 160rpx; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 40rpx; }
.empty-date { font-size: 36rpx; font-weight: 600; color: #374151; margin-bottom: 16rpx; }
.empty-text { font-size: 30rpx; color: #6b7280; margin-bottom: 16rpx; letter-spacing: 2rpx; }
.empty-hint { font-size: 24rpx; color: #9ca3af; letter-spacing: 1rpx; }

/* =========================================
   进度卡片与列表骨架
========================================= */
.today-content .header-section { margin-bottom: 40rpx; }
.today-content .date-row { display: flex; align-items: center; gap: 16rpx; margin-bottom: 24rpx; }
.today-content .current-date { font-size: 40rpx; font-weight: 700; color: #1f2937; letter-spacing: 2rpx; }
.today-content .date-tag { padding: 8rpx 20rpx; background: linear-gradient(135deg, #9e2a2b, #b91c1c); border-radius: 24rpx; font-size: 22rpx; color: #ffffff; font-weight: 500; }
.progress-card { background-color: #ffffff !important; border-radius: 30rpx; padding: 32rpx; box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); border: 1px solid rgba(255, 255, 255, 0.5); }
.progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.progress-label { font-size: 26rpx; font-weight: 500; color: #4b5563; }
.progress-rate { font-size: 36rpx; font-weight: 700; color: #9e2a2b; }
.progress-bar-container { margin-bottom: 16rpx; }
.progress-bar-bg { width: 100%; height: 12rpx; background-color: #e5e7eb; border-radius: 6rpx; overflow: hidden; }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, #9e2a2b, #dc2626); border-radius: 6rpx; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.progress-desc { font-size: 24rpx; color: #6b7280; text-align: right; display: block; }
.tasks-section .section-title { font-size: 30rpx; font-weight: 600; color: #1f2937; margin-bottom: 24rpx; display: block; letter-spacing: 2rpx; }
.tasks-list { display: flex; flex-direction: column; gap: 20rpx; }
.task-card { display: flex; align-items: center; padding: 28rpx 24rpx; background-color: #ffffff !important; border-radius: 30rpx; box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); border: 1px solid rgba(255, 255, 255, 0.5); transition: all 0.25s ease; }
.task-card:active { background-color: #fafaf9; transform: scale(0.995); }
.task-card.task-done { opacity: 0.85; background-color: #fafaf9; }
.task-card.task-done .task-title { color: #9ca3af; text-decoration: line-through; }
.task-card.task-done .task-subtitle { color: #d1d5db; }
.task-icon { width: 64rpx; height: 64rpx; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; margin-right: 24rpx; flex-shrink: 0; transition: all 0.3s ease; }
.task-icon.icon-fixed { background-color: #fef2f2; border: 2rpx solid #fecaca; }
.task-icon.icon-extra { background-color: #ecfdf5; border: 2rpx solid #a7f3d0; }
.task-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.title-row { display: flex; align-items: center; margin-bottom: 8rpx; }
.task-title { font-size: 28rpx; font-weight: 600; color: #1f2937; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.required-tag { font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 8rpx; margin-left: 12rpx; font-weight: 500; white-space: nowrap; }
.tag-required { background-color: #fee2e2; color: #ef4444; }
.tag-optional { background-color: #f3f4f6; color: #9ca3af; }
.task-subtitle { font-size: 24rpx; color: #6b7280; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-status { margin-left: 16rpx; flex-shrink: 0; }
.status-done { padding: 8rpx 16rpx; background-color: #dcfce7; border-radius: 24rpx; }
.status-done .status-text { font-size: 22rpx; font-weight: 500; color: #16a34a; }
.status-pending { display: flex; align-items: center; gap: 8rpx; padding: 8rpx 16rpx; background-color: #f3f4f6; border-radius: 24rpx; }
.status-pending .status-text { font-size: 22rpx; font-weight: 500; color: #6b7280; }
.error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 160rpx 60rpx; }
.error-state .error-text { font-size: 28rpx; color: #6b7280; margin-top: 24rpx; margin-bottom: 16rpx; }
.error-state .error-hint { font-size: 26rpx; color: #9e2a2b; padding: 12rpx 32rpx; border: 2rpx solid #9e2a2b; border-radius: 32rpx; }

/* =========================================
   任务详情弹出层 - 绝美重构版
========================================= */

:deep(.safe-popup) {
  position: relative;
  z-index: 99999 !important;
}

.popup-content {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.popup-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1a1a1a;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 24rpx;
}

.popup-close {
  padding: 8rpx;
}

.popup-body {
  flex: 1;
  overflow: hidden;
}

.popup-scroll {
  height: 100%;
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

.popup-footer {
  display: flex;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #e53935, #b71c1c);
  border-radius: 44rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  border: none;
}

.submit-btn.btn-disabled {
  background: #f3f4f6;
  color: #9ca3af;
}

.submit-btn-hover {
  transform: scale(0.98); /* 点击时的物理反馈缩小效果 */
  box-shadow: 0 4rpx 12rpx rgba(183, 28, 28, 0.15);
}

/* =========================================
   容器内部样式重构 (视频、阅读、作业)
========================================= */

.video-container { 
  width: 100%; 
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.06); /* 视频模块增加层次阴影 */
}

.task-video { 
  width: 100%; 
  height: 420rpx; 
  background-color: #111827; 
}

.video-placeholder { 
  width: 100%; 
  height: 420rpx; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  background-color: #f9fafb; 
}

.placeholder-icon-circle {
  width: 96rpx;
  height: 96rpx;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.04);
  margin-bottom: 24rpx;
}

.placeholder-text { 
  font-size: 28rpx; 
  color: #9ca3af; 
}

.read-container { 
  width: 100%; 
}

.read-content { 
  font-size: 30rpx; /* 更适合长文阅读的字号 */
  line-height: 1.85; 
  color: #374151; 
  letter-spacing: 1rpx;
}

.read-placeholder { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 100rpx 0; 
}

/* 高级感拉满的作业输入区 */
.homework-container { 
  width: 100%; 
}

.homework-input-wrapper {
  background-color: #f9fafb;
  border: 2rpx solid #f3f4f6;
  border-radius: 24rpx;
  padding: 24rpx;
  transition: all 0.3s ease;
  
  /* 微弱的内发光，体现输入框的凹陷感 */
  box-shadow: inset 0 4rpx 8rpx rgba(0, 0, 0, 0.02);
}

.homework-textarea { 
  width: 100%; 
  height: 380rpx; 
  font-size: 30rpx; 
  line-height: 1.7; 
  color: #1f2937; 
  box-sizing: border-box; 
  background: transparent;
}

.textarea-placeholder { 
  color: #9ca3af; 
  font-size: 30rpx; 
  line-height: 1.7;
}

.word-count { 
  display: block; 
  text-align: right; 
  font-size: 24rpx; 
  color: #d1d5db; 
  margin-top: 16rpx; 
  font-weight: 500;
}

.extra-container { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  padding: 80rpx 30rpx; 
  text-align: center; 
}

.extra-icon-wrapper { 
  width: 140rpx; 
  height: 140rpx; 
  background: linear-gradient(135deg, #ecfdf5, #a7f3d0); 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin-bottom: 40rpx; 
  box-shadow: 0 16rpx 32rpx rgba(16, 185, 129, 0.2); /* 发光效果 */
}

.extra-title { 
  font-size: 36rpx; 
  font-weight: 700; 
  color: #111827; 
  margin-bottom: 16rpx; 
}

.extra-desc { 
  font-size: 28rpx; 
  color: #6b7280; 
  line-height: 1.6; 
}
</style>