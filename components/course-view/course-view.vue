<template>
  <view class="view-container">
    <view :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="header-area">
      <view class="title-decorator"></view>
      <text class="main-title">我的课程</text>
    </view>

    <view class="tabs-container">
      <view class="tabs-wrapper">
        <view 
          v-for="(tab, index) in topTabs" 
          :key="index"
          class="tab-item" 
          :class="{ 'tab-active': currentTopTab === index }"
          @tap="switchTopTab(index)"
        >
          <text class="tab-text">{{ tab.name }}</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="course-list" v-if="displayList.length > 0">
        <view 
          class="course-card" 
          v-for="(item, index) in displayList" 
          :key="index"
          @click="navigateToCourseDetail(item.id)"
        >
          <view class="card-left" 
                :class="{ 'thumb-gray': item.status === 'hist' }"
                :style="{ background: item.status === 'hist' ? '#d1d1d1' : getCoverBackground(item.type) }">
            
            <view class="status-badge" :class="getStatusBadgeClass(item.status)">
              {{ item.statusText || getStatusTextFallback(item.status) }}
            </view>
            
            <text class="camp-short-name">{{ extractCampName(item.type) }}</text>
            <text class="camp-term" v-if="item.term">{{ item.term }}</text>
          </view>

          <view class="card-right">
            <view class="card-title" :class="{ 'text-gray': item.status === 'hist' }">{{ item.title }}</view>
            <view class="card-time">📅 报名时间: {{ item.updateDate }}</view>
            
            <view class="progress-section">
              <view class="progress-info">
                <text class="progress-label">学习进度</text>
                <text class="progress-value" :style="{ color: item.status === 'done' ? '#16a34a' : '#9e2a2b' }">
                  {{ item.progress }}%
                </text>
              </view>
              <view class="progress-track">
                <view class="progress-fill" 
                      :style="{ 
                        width: item.progress + '%', 
                        background: item.status === 'done' ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #b53b3c, #9e2a2b)' 
                      }">
                </view>
              </view>
            </view>

            <view class="action-wrapper">
              <view class="flat-btn" :class="'btn-' + item.status">
                {{ getActionText(item.status) }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-emoji">📿</text>
        <text class="empty-text">暂无课程记录</text>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { API_CONFIG } from '../../api/config';

// ========== 状态定义 ==========
const statusBarHeight = ref(20);
const currentTopTab = ref(0);
const displayList = ref([]);

// Tab 选项与后端的 tabType 映射
const topTabs = [
  { name: '正在学习', type: 1 },       
  { name: '历史课程', type: 2 },      
  { name: '已结业',   type: 3 }         
];

// 高定渐变色字典
const colorMap = {
  '诚意班': 'linear-gradient(135deg, #8a2021, #b53b3c)',
  '明理班': 'linear-gradient(135deg, #1e3c72, #2a5298)',
  '笃行班': 'linear-gradient(135deg, #d35400, #e67e22)',
  '印证班': 'linear-gradient(135deg, #205e4a, #3ea07a)',
  '良知班': 'linear-gradient(135deg, #5c433b, #8b6b61)',
  '默认': 'linear-gradient(135deg, #9e2a2b, #b53b3c)'
};

// ========== 辅助工具函数 ==========

const getCoverBackground = (campName) => {
  if (!campName) return colorMap['默认'];
  for (const key in colorMap) {
    if (campName.includes(key.replace('班', ''))) {
      return colorMap[key];
    }
  }
  return colorMap['默认'];
};

const extractCampName = (name) => {
  if (!name) return '修习';
  return name.replace('班', '').substring(0, 2);
};

const getStatusBadgeClass = (status) => {
  const map = { 'ing': '', 'done': 'done', 'hist': 'expired' };
  return map[status] !== undefined ? map[status] : '';
};

const getStatusTextFallback = (status) => {
  const map = { 'ing': '学习中', 'done': '已结业', 'hist': '已归档' };
  return map[status] || '';
};

const getActionText = (status) => {
  const map = { 'ing': '继续学习', 'done': '查看证书', 'hist': '查看存档' };
  return map[status] || '进入课程';
};

const navigateToCourseDetail = (courseId) => {
  uni.navigateTo({
    url: `/pages/CourseDetail/index?id=${courseId}`
  });
};

// ========== 核心业务逻辑 (保留原网络请求) ==========

const fetchCourseData = async (tabType) => {
  // 读取token
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/Login/index' });
    }, 1000);
    return;
  }
  
  uni.showLoading({ title: '同步中...', mask: true });
  
  try {
    const res = await uni.request({
      url: API_CONFIG.baseUrl + '/courses', 
      method: 'GET',
      header: {
        'Authorization': token
      },
      data: { tabType: tabType }
    });
    
    if (res.statusCode === 200 && res.data.code === 200) {
      displayList.value = res.data.data;
    } else {
      displayList.value = [];
    }
  } catch (error) {
    uni.showToast({ title: '网络连接异常', icon: 'none' });
    displayList.value = [];
  } finally {
    uni.hideLoading();
  }
};

const switchTopTab = (index) => {
  if (currentTopTab.value === index) return;
  currentTopTab.value = index;
  fetchCourseData(topTabs[index].type);
};

// ========== 生命周期 ==========
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  if (systemInfo.statusBarHeight) {
    statusBarHeight.value = systemInfo.statusBarHeight;
  }
  // 默认加载第一个 Tab 数据
  fetchCourseData(topTabs[0].type);

  // 监听打卡成功的全局事件，静默刷新当前列表数据
  uni.$on('refreshCourseList', () => {
    fetchCourseData(topTabs[currentTopTab.value].type);
  });
});

onUnmounted(() => {
  // 组件销毁时必须移除监听，防止内存泄漏
  uni.$off('refreshCourseList');
});
</script>

<style scoped lang="scss">
/* 1. 全局背景 */
.view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #faf8f5; /* 暖宣纸色 */
}

/* 2. 顶部标题区 */
.header-area {
  padding: 30rpx 40rpx;
  display: flex;
  align-items: center;
}
.title-decorator {
  width: 8rpx;
  height: 36rpx;
  background-color: #9e2a2b;
  border-radius: 4rpx;
  margin-right: 16rpx;
}
.main-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #2d2424;
  letter-spacing: 2rpx;
}

/* 3. 分段选择器 */
.tabs-container {
  padding: 0 40rpx 30rpx;
}
.tabs-wrapper {
  display: flex;
  background-color: #f0ece6;
  border-radius: 40rpx;
  padding: 6rpx;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 34rpx;
  transition: all 0.3s ease;
}
.tab-active {
  background-color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.tab-text {
  font-size: 28rpx;
  color: #8c8686;
  transition: color 0.3s ease;
}
.tab-active .tab-text {
  color: #9e2a2b;
  font-weight: bold;
}

/* 滚动区域 */
.scroll-content {
  flex: 1;
  height: 0;
}
.course-list {
  padding: 10rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

/* 4. 课程卡片 */
.course-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03);
  padding: 24rpx;
  gap: 24rpx;
  align-items: center;
  transition: transform 0.2s;
}
.course-card:active {
  transform: scale(0.98);
}

/* 左侧色块 */
.card-left {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.thumb-gray { filter: grayscale(100%); opacity: 0.8; }

.status-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.25);
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-top-left-radius: 20rpx;
  border-bottom-right-radius: 12rpx;
  backdrop-filter: blur(4px);
}
.status-badge.expired { background: rgba(0, 0, 0, 0.4); }
.status-badge.done { background: rgba(22, 163, 74, 0.8); }

.camp-short-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 8rpx;
  writing-mode: vertical-rl;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
}
.camp-term { font-size: 20rpx; color: rgba(255,255,255,0.9); margin-top: 6rpx; }

/* 右侧信息 */
.card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160rpx;
}
.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #2d2424;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.text-gray { color: #8c8686; }
.card-time {
  font-size: 22rpx;
  color: #a0a0a0;
  margin-top: 8rpx;
}

/* 进度条重绘 */
.progress-section {
  margin-top: auto;
  margin-bottom: 12rpx;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}
.progress-label {
  font-size: 22rpx;
  color: #8c8686;
}
.progress-value {
  font-size: 22rpx;
  font-weight: bold;
}
.progress-track {
  height: 8rpx;
  background-color: #f5f5f5;
  border-radius: 4rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

/* 扁平化操作按钮 */
.action-wrapper {
  display: flex;
  justify-content: flex-end;
}
.flat-btn {
  font-size: 24rpx;
  font-weight: bold;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
}
.btn-ing { background-color: rgba(158, 42, 43, 0.08); color: #9e2a2b; }
.btn-done { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
.btn-hist { background: #f3f4f6; color: #6b7280; }

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 160rpx;
}
.empty-emoji {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  opacity: 0.8;
}
.empty-text {
  font-size: 28rpx;
  color: #8c8686;
}

.safe-area-spacer {
  height: 180rpx;
}
</style>