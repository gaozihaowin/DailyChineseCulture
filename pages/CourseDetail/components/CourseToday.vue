<template>
  <view class="course-today">
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在开启今日修行...</text>
    </view>

    <view v-else-if="courseData" class="content-wrapper">
      
      <view v-if="!courseData.hasCourse" class="empty-state">
        <view class="empty-icon-wrapper">
          <uni-icons type="calendar" size="80" color="#d1d5db"></uni-icons>
        </view>
        <text class="empty-date">{{ courseData.currentDate }}</text>
        <text class="empty-text">今日暂无排课</text>
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
              <text class="progress-label">修行进度</text>
              <text class="progress-rate">{{ courseData.completionRate }}%</text>
            </view>
            <view class="progress-bar-container">
              <view class="progress-bar-bg">
                <view class="progress-bar-fill" :style="{ width: courseData.completionRate + '%' }"></view>
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
                  <text class="task-title">{{ task.title || '未命名任务' }}</text>
                  <view 
                    class="required-tag" 
                    :class="task.isRequired === 1 ? 'tag-required' : 'tag-optional'"
                  >
                    {{ task.isRequired === 1 ? '必修' : '选修' }}
                  </view>
                </view>
                <text v-if="task.subtitle" class="task-subtitle">{{ task.subtitle }}</text>
              </view>

              <view class="task-status">
                <view v-if="task.isDone === 1" class="status-done">
                  <text class="status-text">已达成</text>
                </view>
                <view v-else class="status-pending">
                  <text class="status-text">去修行</text>
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
      background-color="transparent"
      class="safe-popup"
    >
      <view class="popup-box">
        
        <view class="popup-header">
          <view class="header-line"></view>
          <view class="title-area">
            <text class="main-title">{{ currentTask?.title || '任务详情' }}</text>
            <view class="close-icon" @click="closeTaskPopup">
              <uni-icons type="closeempty" size="22" color="#9ca3af"></uni-icons>
            </view>
          </view>
        </view>

        <scroll-view scroll-y="true" class="popup-body">
          
          <view v-if="currentTask?.subtitle" class="instruction-card">
            <uni-icons type="info-filled" size="18" color="#9e2a2b"></uni-icons>
            <text class="instruction-text">{{ currentTask.subtitle }}</text>
          </view>

          <view class="render-area">
            
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
              
              <view v-if="readLoading" class="inner-loading">
                <view class="spin-icon"></view>
                <text>正在展开卷轴...</text>
              </view>

              <view v-else-if="readResourceType === 'MARKDOWN'" class="read-markdown-wrapper">
                <view v-if="readError" class="read-error-tip">
                  <uni-icons type="alert" size="16" color="#9e2a2b"></uni-icons>
                  <text class="read-error-text">{{ readError }}</text>
                </view>
                <mp-html
                  :content="readContent"
                  class="custom-mp-html"
                  copy-by-longpress
                  :selectable="true"
                />
              </view>

              <view v-else-if="readResourceType === 'IMAGE'" class="read-image-wrapper">
                <image
                  :src="currentTask.taskUrl"
                  mode="widthFix"
                  class="read-image"
                  @click="previewImage(currentTask.taskUrl)"
                />
                <view class="read-image-hint">
                  <uni-icons type="search" size="14" color="#9ca3af"></uni-icons>
                  <text class="read-image-hint-text">点击图片可全屏放大研读</text>
                </view>
              </view>

              <view v-else-if="readResourceType === 'PDF'" class="read-pdf-wrapper" @click="openPdfDocument(currentTask.taskUrl)">
                <view class="read-pdf-icon">
                  <uni-icons type="file" size="48" color="#9e2a2b"></uni-icons>
                </view>
                <text class="read-pdf-title">PDF 原典文献</text>
                <text class="read-pdf-desc">点击下方按钮使用系统原生阅读器查阅</text>
                <view class="read-pdf-btn">
                  <uni-icons type="download" size="18" color="#ffffff"></uni-icons>
                  <text class="read-pdf-btn-text">查阅文献</text>
                </view>
              </view>

              <view v-else-if="readResourceType === 'LINK'" class="read-link-wrapper">
                <view class="read-link-icon">
                  <uni-icons type="link" size="48" color="#9e2a2b"></uni-icons>
                </view>
                <text class="read-link-title">外部资料链接</text>
                <text class="read-link-desc">点击复制链接后在浏览器中打开查阅</text>
                <view class="read-link-btn" @click="copyLink(currentTask.taskUrl)">
                  <uni-icons type="paperclip" size="18" color="#ffffff"></uni-icons>
                  <text class="read-link-btn-text">复制链接</text>
                </view>
              </view>

              <view v-else class="read-placeholder">
                <view class="placeholder-icon-circle">
                  <uni-icons type="info" size="40" color="#d1d5db"></uni-icons>
                </view>
                <text class="placeholder-text">暂无关联的阅读资源</text>
              </view>
            </view>

            <view v-else-if="currentTask?.taskType === 'HOMEWORK'" class="homework-container">
              <text class="homework-section-title">今日功课</text>

              <view class="checklist-wrapper">
                <view class="checklist-item" :class="{ 'is-checked': homeworkChecklist.readOriginal }" @click="homeworkChecklist.readOriginal = !homeworkChecklist.readOriginal">
                  <view class="check-circle"><uni-icons v-if="homeworkChecklist.readOriginal" type="checkmarkempty" size="14" color="#ffffff"></uni-icons></view>
                  <text class="check-text">1、读原文一遍</text>
                </view>
                <view class="checklist-item" :class="{ 'is-checked': homeworkChecklist.onTime }" @click="homeworkChecklist.onTime = !homeworkChecklist.onTime">
                  <view class="check-circle"><uni-icons v-if="homeworkChecklist.onTime" type="checkmarkempty" size="14" color="#ffffff"></uni-icons></view>
                  <text class="check-text">2、准时上交功课</text>
                </view>
                <view class="checklist-item" :class="{ 'is-checked': homeworkChecklist.goodDeed }" @click="homeworkChecklist.goodDeed = !homeworkChecklist.goodDeed">
                  <view class="check-circle"><uni-icons v-if="homeworkChecklist.goodDeed" type="checkmarkempty" size="14" color="#ffffff"></uni-icons></view>
                  <text class="check-text">3、日行一善</text>
                </view>
                <view class="checklist-item" :class="{ 'is-checked': homeworkChecklist.introspection }" @click="homeworkChecklist.introspection = !homeworkChecklist.introspection">
                  <view class="check-circle"><uni-icons v-if="homeworkChecklist.introspection" type="checkmarkempty" size="14" color="#ffffff"></uni-icons></view>
                  <text class="check-text">4、每日自省</text>
                </view>
                <view class="checklist-hint">
                  <text class="hint-text">1) 不抱怨，不说谎</text>
                  <text class="hint-text">2) 时刻保持感恩敬畏</text>
                </view>
              </view>

              <text class="homework-section-title" style="margin-top: 24rpx;">学习践行心得</text>
              <view class="homework-input-wrapper" :class="{ 'is-disabled': currentTask?.isDone === 1 }">
                <textarea
                  v-model="homeworkContent"
                  class="homework-textarea"
                  :placeholder="currentTask?.isDone === 1 ? '你已提交过心得体会' : '写读书践行心得：30个字以上...'"
                  placeholder-class="textarea-placeholder"
                  maxlength="2000"
                  :disabled="currentTask?.isDone === 1"
                  :show-confirm-bar="false"
                ></textarea>
                <text class="word-count">{{ homeworkContent.length }} / 2000</text>
              </view>
            </view>

            <view v-else class="extra-container">
              <view class="extra-icon-wrapper">
                <uni-icons type="star-filled" size="48" color="#10b981"></uni-icons>
              </view>
              <text class="extra-title">{{ currentTask?.title }}</text>
              <text class="extra-desc">这是一项选修拓展任务，点击下方按钮完成即可。</text>
            </view>
          </view>
          
          <view style="height: 60rpx; width: 100%;"></view>
        </scroll-view>

        <view class="popup-footer">
          <button
            class="submit-btn"
            :class="{ 'btn-disabled': isSubmitting || currentTask?.isDone === 1 }"
            @click="submitTask"
            hover-class="submit-btn-hover"
          >
            <text v-if="isSubmitting">提交中...</text>
            <text v-else-if="currentTask?.isDone === 1">今日功课已圆满</text>
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
import { marked } from 'marked'; // 必须安装: npm install marked 

const props = defineProps({
  campId: {
    type: [Number, String],
    required: true
  },
  targetPlanId: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['updateProgress']);

// 全局状态变量
const courseData = ref(null);
const isLoading = ref(true);
const currentTask = ref(null);
const homeworkContent = ref('');
const homeworkChecklist = ref({
  readOriginal: false,
  onTime: true,
  goodDeed: false,
  introspection: false
});
const taskPopup = ref(null);
const isSubmitting = ref(false);

// READ 类型的专属响应式变量
const readResourceType = ref(''); // 枚举: 'MARKDOWN', 'IMAGE', 'PDF', 'LINK'
const readLoading = ref(false);
const readContent = ref('');
const readError = ref('');

// 1. 获取今日课程数据
const fetchTodayData = async () => {
  try {
    isLoading.value = true;
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

// 辅助方法：统计完成数量
const getCompletedCount = () => {
  if (!courseData.value || !courseData.value.tasks) return 0;
  return courseData.value.tasks.filter(task => task.isDone === 1).length;
};

// 辅助方法：图标与样式
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

// 2. 打开弹窗，执行多格式解析
const openTaskPopup = async (task) => {
  currentTask.value = task;
  
  // 重置状态
  homeworkContent.value = '';
  homeworkChecklist.value = {
    readOriginal: false,
    onTime: true,
    goodDeed: false,
    introspection: false
  };
  readResourceType.value = '';
  readLoading.value = false;
  readContent.value = '';
  readError.value = '';

  if (taskPopup.value) {
      taskPopup.value.open();
  }

  // 针对 READ 类型调用后端拉取文件
  if (task.taskType === 'READ') {
    readLoading.value = true;
    
    try {
      const response = await request({
        url: `/task/content/${task.taskId}`,
        method: 'GET'
      });

      if (response.data.code === 200 && response.data.data) {
        const realTaskUrl = response.data.data.taskUrl;
        currentTask.value.taskUrl = realTaskUrl;

        if (!realTaskUrl) {
           readResourceType.value = '';
           readLoading.value = false;
           return;
        }

        const lowerUrl = realTaskUrl.toLowerCase();

        // Markdown 嗅探与 marked 解析
        if (/\.(md|txt)$/i.test(lowerUrl)) {
          readResourceType.value = 'MARKDOWN';
          uni.request({
            url: realTaskUrl,
            method: 'GET',
            success: (res) => {
              if (res.statusCode === 200 && res.data) {
                if (lowerUrl.endsWith('.md')) {
                  // 🌟 核心：将 Markdown 转码为 HTML
                  readContent.value = marked.parse(res.data);
                } else {
                  // txt 保留换行
                  readContent.value = `<div style="white-space: pre-wrap; line-height: 1.8;">${res.data}</div>`;
                }
              } else {
                readError.value = '文档内容拉取失败，请检查资源是否可访问';
                readContent.value = '<p style="color:#9e2a2b;">加载失败，请检查网络或资源链接。</p>';
              }
            },
            fail: () => {
              readError.value = '网络请求受限，请确认资源地址跨域配置';
              readContent.value = '<p style="color:#9e2a2b;">网络加载异常，资源可能被拦截。</p>';
            },
            complete: () => {
              readLoading.value = false;
            }
          });
        } 
        else if (/\.(jpeg|jpg|png|gif|webp)$/i.test(lowerUrl)) {
          readResourceType.value = 'IMAGE';
          readLoading.value = false;
        } 
        else if (/\.pdf$/i.test(lowerUrl)) {
          readResourceType.value = 'PDF';
          readLoading.value = false;
        } 
        else {
          readResourceType.value = 'LINK';
          readLoading.value = false;
        }
      } else {
        readError.value = response.data.msg || '获取阅读任务资源失败';
        readResourceType.value = 'MARKDOWN';
        readContent.value = `<p style="color:#9e2a2b;">${readError.value}</p>`;
        readLoading.value = false;
      }
    } catch (error) {
      console.error('获取任务详情API异常:', error);
      readError.value = '请求服务器失败，请检查网络连接';
      readResourceType.value = 'MARKDOWN';
      readContent.value = '<p style="color:#9e2a2b;">网络加载异常</p>';
      readLoading.value = false;
    }
  }
};

// 3. 关闭弹窗
const closeTaskPopup = () => {
  if (taskPopup.value) {
      taskPopup.value.close();
  }
  setTimeout(() => {
    currentTask.value = null;
    homeworkContent.value = '';
    readResourceType.value = '';
    readContent.value = '';
    readError.value = '';
  }, 300);
};

// 4. 原生交互能力
const previewImage = (url) => {
  uni.previewImage({ urls: [url] });
};

const openPdfDocument = (url) => {
  uni.showLoading({ title: '文献下载中...' });
  uni.downloadFile({
    url: url,
    success: function (res) {
      const filePath = res.tempFilePath;
      uni.openDocument({
        filePath: filePath,
        fileType: 'pdf',
        showMenu: true,
        success: function () { uni.hideLoading(); },
        fail: function() {
          uni.hideLoading();
          uni.showToast({ title: '打开文献失败', icon: 'none' });
        }
      });
    },
    fail: function() {
      uni.hideLoading();
      uni.showToast({ title: '下载文献失败', icon: 'none' });
    }
  });
};

const copyLink = (url) => {
  uni.setClipboardData({
    data: url,
    success: () => { uni.showToast({ title: '链接已复制，请在浏览器打开', icon: 'none' }); }
  });
};

// 5. 提交任务打卡
const submitTask = async () => {
  if (isSubmitting.value || !currentTask.value || currentTask.value.isDone === 1) return;
  const task = currentTask.value;

  if (task.taskType === 'HOMEWORK') {
    if (homeworkContent.value.trim().length < 30) {
      uni.showModal({
        title: '字数不足',
        content: '读书践行心得请不少于 30 字，在事上磨炼。',
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#9e2a2b'
      });
      return;
    }
  }

  isSubmitting.value = true;
  uni.showLoading({ title: '提交中...', mask: true });

  try {
    const planId = courseData.value.planId;
    let url = '';
    let payload = {};

    if (task.taskType === 'HOMEWORK') {
      url = API_CONFIG.paths.submitHomework || `/courses/homework/submit`;
      const c = homeworkChecklist.value;
      const formattedContent = `【今日功课】
${c.readOriginal ? '☑️' : '🔲'} 1、读原文一遍
${c.onTime ? '☑️' : '🔲'} 2、准时上交功课
${c.goodDeed ? '☑️' : '🔲'} 3、日行一善
${c.introspection ? '☑️' : '🔲'} 4、每日自省
  1) 不抱怨，不说谎；
  2) 时刻保持感恩敬畏

【学习践行心得】
${homeworkContent.value}`;
      payload = {
        planId: planId,
        taskId: task.taskId,
        content: formattedContent
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
      uni.showToast({ title: '任务圆满达成！', icon: 'success' });
      uni.$emit('refreshCourseList');
    } else {
      uni.hideLoading();
      closeTaskPopup();
      setTimeout(() => {
        uni.showModal({ title: '提交失败', content: apiData.msg || '服务器开小差了，请稍后再试', showCancel: false, confirmColor: '#9e2a2b' });
      }, 300);
    }
  } catch (error) {
    uni.hideLoading();
    closeTaskPopup();
    setTimeout(() => {
      uni.showModal({ title: '网络错误', content: '请检查您的网络连接是否正常', showCancel: false, confirmColor: '#9e2a2b' });
    }, 300);
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.campId, (newCampId) => { if (newCampId) fetchTodayData(); });
watch(() => props.targetPlanId, () => { fetchTodayData(); });
onMounted(() => { if (props.campId) fetchTodayData(); });
</script>

<style scoped lang="scss">
/* =========================================
   基础样式与页面骨架
========================================= */
.course-today { min-height: 600rpx; background-color: transparent !important; }

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

.error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 160rpx 60rpx; }
.error-text { font-size: 28rpx; color: #6b7280; margin-top: 24rpx; margin-bottom: 16rpx; }
.error-hint { font-size: 26rpx; color: #9e2a2b; padding: 12rpx 32rpx; border: 2rpx solid #9e2a2b; border-radius: 32rpx; }

/* =========================================
   顶部进度区域
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

/* =========================================
   任务列表卡片
========================================= */
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

/* =========================================
   弹窗整体布局 (⚠️滑动修复核心⚠️)
========================================= */
:deep(.safe-popup) {
  position: relative;
  z-index: 99999 !important;
}

.popup-box {
  display: flex;
  flex-direction: column;
  background-color: #fdfaf6; /* 宣纸白 */
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  height: 85vh; /* 强制弹窗固定高度 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.popup-header {
  flex-shrink: 0; /* 保证头部不被压缩 */
  padding: 30rpx 40rpx;
  background-color: #ffffff;
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.header-line { width: 60rpx; height: 8rpx; background: #e5e7eb; border-radius: 4rpx; margin: 0 auto 20rpx; }
.title-area { display: flex; justify-content: space-between; align-items: center; }
.main-title { font-size: 34rpx; font-weight: 600; color: #111827; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 24rpx; }
.close-icon { padding: 10rpx; }

.popup-body {
  flex: 1; /* 占据剩余空间 */
  height: 0; /* 强制生效内部滚动 */
  padding: 0 40rpx;
  box-sizing: border-box;
}
.render-area { padding-top: 10rpx; }

.popup-footer {
  flex-shrink: 0; /* 保证底部不被压缩 */
  padding: 30rpx 40rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}

.submit-btn { width: 100%; height: 92rpx; line-height: 92rpx; background: linear-gradient(135deg, #e53935, #b71c1c); border-radius: 46rpx; color: #ffffff; font-size: 32rpx; font-weight: 600; text-align: center; border: none; box-shadow: 0 8rpx 20rpx rgba(183, 28, 28, 0.2); }
.submit-btn.btn-disabled { background: #f3f4f6; color: #9ca3af; box-shadow: none; }
.submit-btn-hover { transform: scale(0.98); box-shadow: 0 4rpx 12rpx rgba(183, 28, 28, 0.15); }

/* =========================================
   容器内部渲染 (READ 升级版)
========================================= */
.instruction-card { background: rgba(158, 42, 43, 0.05); border-left: 6rpx solid #9e2a2b; padding: 20rpx; display: flex; align-items: flex-start; gap: 12rpx; margin-top: 30rpx; margin-bottom: 30rpx; border-radius: 0 12rpx 12rpx 0; }
.instruction-text { font-size: 28rpx; color: #4b5563; line-height: 1.5; }

.inner-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120rpx 0; color: #9e2a2b; font-size: 28rpx; }
.spin-icon { width: 50rpx; height: 50rpx; border: 4rpx solid rgba(158, 42, 43, 0.1); border-top-color: #9e2a2b; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20rpx; }

/* 🎯 Markdown 深度排版优化 🎯 */
:deep(.custom-mp-html) {
  font-size: 32rpx;
  line-height: 1.8;
  color: #374151;
  word-break: break-all;

  p { margin: 0 0 24rpx 0; line-height: 1.8; text-align: justify; }
  h1, h2, h3, h4, h5, h6 { font-weight: 600; color: #9e2a2b; margin: 32rpx 0 16rpx 0; line-height: 1.4; }
  h1 { font-size: 40rpx; }
  h2 { font-size: 36rpx; }
  h3 { font-size: 32rpx; }

  blockquote {
    border-left: 6rpx solid #9e2a2b;
    padding-left: 24rpx;
    margin: 24rpx 0;
    color: #6b7280;
    background-color: #fafafa;
    padding: 16rpx 24rpx;
    border-radius: 0 12rpx 12rpx 0;
    font-style: italic;
  }

  code { background-color: #f3f4f6; padding: 4rpx 12rpx; border-radius: 8rpx; font-size: 28rpx; color: #9e2a2b; font-family: monospace; }
  pre { background-color: #1f2937; color: #f3f4f6; padding: 24rpx; border-radius: 16rpx; overflow-x: auto; margin: 24rpx 0; }
  pre code { background-color: transparent; color: inherit; padding: 0; }
  a { color: #9e2a2b; text-decoration: underline; }
  img { max-width: 100%; border-radius: 12rpx; margin: 16rpx 0; display: block; }
  ul, ol { padding-left: 40rpx; margin: 16rpx 0; }
  li { margin: 8rpx 0; line-height: 1.8; }
  table { width: 100%; border-collapse: collapse; margin: 24rpx 0; font-size: 28rpx; }
  th, td { border: 1rpx solid #e5e7eb; padding: 16rpx; text-align: left; }
  th { background-color: #f9fafb; font-weight: 600; color: #374151; }
}

.read-image-wrapper { display: flex; flex-direction: column; align-items: center; width: 100%; }
.read-image { width: 100%; border-radius: 16rpx; background-color: #f9fafb; box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.05); }
.read-image-hint { display: flex; align-items: center; gap: 8rpx; margin-top: 16rpx; padding: 8rpx 20rpx; background-color: rgba(0,0,0,0.04); border-radius: 20rpx; }
.read-image-hint-text { font-size: 22rpx; color: #666; }

.read-pdf-wrapper { display: flex; flex-direction: column; align-items: center; padding: 60rpx 40rpx; background-color: #ffffff; border-radius: 24rpx; border: 2rpx dashed #e5e7eb; transition: all 0.2s; margin-top: 20rpx; }
.read-pdf-wrapper:active { background: #f3f4f6; }
.read-pdf-icon { width: 120rpx; height: 120rpx; background: linear-gradient(135deg, #fef2f2, #fee2e2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 32rpx; }
.read-pdf-title { font-size: 34rpx; font-weight: 600; color: #1f2937; margin-bottom: 12rpx; }
.read-pdf-desc { font-size: 26rpx; color: #9ca3af; margin-bottom: 40rpx; text-align: center; }
.read-pdf-btn { display: flex; align-items: center; gap: 12rpx; padding: 20rpx 48rpx; background: linear-gradient(135deg, #9e2a2b, #b91c1c); border-radius: 48rpx; box-shadow: 0 8rpx 24rpx rgba(158, 42, 43, 0.25); }
.read-pdf-btn-text { font-size: 30rpx; font-weight: 600; color: #ffffff; }

.read-link-wrapper { @extend .read-pdf-wrapper; }
.read-link-icon { @extend .read-pdf-icon; }
.read-link-title { @extend .read-pdf-title; }
.read-link-desc { @extend .read-pdf-desc; }
.read-link-btn { display: flex; align-items: center; gap: 12rpx; padding: 20rpx 48rpx; background-color: #f3f4f6; border-radius: 48rpx; border: none; }
.read-link-btn-text { font-size: 30rpx; font-weight: 600; color: #4b5563; }

.read-error-tip { display: flex; align-items: center; gap: 8rpx; background-color: #fef2f2; border: 1rpx solid #fecaca; border-radius: 12rpx; padding: 16rpx 20rpx; margin-bottom: 20rpx; }
.read-error-text { font-size: 24rpx; color: #9e2a2b; }

/* =========================================
   容器内部样式重构 (视频、作业、拓展)
========================================= */
.video-container { width: 100%; border-radius: 24rpx; overflow: hidden; box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.06); margin-top: 20rpx; }
.task-video { width: 100%; height: 420rpx; background-color: #111827; }
.video-placeholder { width: 100%; height: 420rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #ffffff; border-radius: 24rpx; border: 2rpx dashed #e5e7eb; }
.placeholder-icon-circle { width: 96rpx; height: 96rpx; background-color: #f9fafb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24rpx; }
.placeholder-text { font-size: 28rpx; color: #9ca3af; }

.homework-container { width: 100%; margin-top: 20rpx; }
.homework-section-title { font-size: 30rpx; font-weight: 700; color: #1f2937; margin-bottom: 24rpx; letter-spacing: 1rpx; display: block; }
.checklist-wrapper { background-color: rgba(158, 42, 43, 0.03); border: 1px solid rgba(158, 42, 43, 0.08); border-radius: 20rpx; padding: 20rpx 24rpx; margin-bottom: 30rpx; }
.checklist-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx dashed rgba(158, 42, 43, 0.1); }
.checklist-item:last-of-type { border-bottom: none; }
.check-circle { width: 36rpx; height: 36rpx; border-radius: 50%; border: 2rpx solid #d1d5db; display: flex; align-items: center; justify-content: center; margin-right: 16rpx; transition: all 0.2s ease; flex-shrink: 0; }
.checklist-item.is-checked .check-circle { background-color: #9e2a2b; border-color: #9e2a2b; }
.check-text { font-size: 28rpx; color: #4b5563; line-height: 1.4; transition: color 0.2s ease; }
.checklist-item.is-checked .check-text { color: #111827; font-weight: 600; }
.checklist-hint { margin-top: 16rpx; padding-top: 16rpx; border-top: 1rpx dashed rgba(158, 42, 43, 0.1); display: flex; flex-direction: column; gap: 8rpx; }
.hint-text { font-size: 24rpx; color: #9ca3af; padding-left: 52rpx; }

.homework-input-wrapper { background-color: #ffffff; border: 2rpx solid #e5e7eb; border-radius: 20rpx; padding: 24rpx; transition: all 0.3s ease; box-shadow: inset 0 4rpx 8rpx rgba(0, 0, 0, 0.02); }
.homework-input-wrapper:focus-within { border-color: rgba(158, 42, 43, 0.4); box-shadow: 0 0 0 4rpx rgba(158, 42, 43, 0.05); }
.homework-textarea { width: 100%; height: 350rpx; font-size: 30rpx; line-height: 1.7; color: #1f2937; background: transparent; }
.textarea-placeholder { color: #9ca3af; font-size: 30rpx; line-height: 1.7; }
.word-count { display: block; text-align: right; font-size: 22rpx; color: #d1d5db; margin-top: 16rpx; font-weight: 500; }
.homework-input-wrapper.is-disabled { background-color: #f3f4f6; opacity: 0.8; }

.extra-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80rpx 20rpx; text-align: center; }
.extra-icon-wrapper { width: 140rpx; height: 140rpx; background: linear-gradient(135deg, #ecfdf5, #a7f3d0); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 30rpx; box-shadow: 0 16rpx 32rpx rgba(16, 185, 129, 0.2); }
.extra-title { font-size: 36rpx; font-weight: 700; color: #111827; margin-bottom: 20rpx; }
.extra-desc { font-size: 28rpx; color: #6b7280; line-height: 1.6; }
</style>