<template>
  <view class="page-container">
    <NavBar title="我的省察" bgColor="#f4f1eb" />

    <view v-if="isLoading && list.length === 0" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载省察记录...</text>
    </view>

    <view v-else-if="!isLoading && list.length === 0" class="empty-state">
      <image class="empty-icon" src="https://img.icons8.com/fluency/200/task.png" mode="aspectFit"></image>
      <text class="empty-title">暂无省察记录</text>
      <text class="empty-desc">静心反思，方能笃行致远</text>
    </view>

    <scroll-view
      v-else
      scroll-y
      class="scroll-view"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onPullDownRefresh"
      @scrolltolower="onReachBottom"
    >
      <view class="card-list">
        <view
          class="reflection-card"
          v-for="item in list"
          :key="item.homeworkId"
          @click="openDetail(item)"
          hover-class="reflection-card-hover"
          :hover-stay-time="150"
        >
          <view class="card-header">
            <view class="header-left">
              <text class="camp-name">{{ item.campName }}</text>
              <text class="plan-title">{{ item.planTitle }}</text>
            </view>
            <view class="badge-container">
              <view v-if="item.isBigGroupExcellent === 1" class="badge badge-excellent">
                <text class="badge-text">大组优秀</text>
              </view>
              <view v-else-if="item.isSmallGroupExcellent === 1" class="badge badge-small">
                <text class="badge-text">小组优秀</text>
              </view>
            </view>
          </view>

          <view class="card-body">
            <text class="content-text list-content">{{ item.content }}</text>
          </view>

          <view class="card-footer">
            <text class="submit-time">{{ item.submitTime }}</text>
          </view>
        </view>
      </view>

      <view v-if="isLoadingMore" class="loading-more">
        <view class="loading-spinner-small"></view>
        <text class="loading-more-text">加载中...</text>
      </view>

      <view v-if="noMoreData && list.length > 0" class="no-more-data">
        <text class="no-more-text">— 已加载全部 —</text>
      </view>
    </scroll-view>

    <view class="detail-modal" :class="{ 'modal-show': showModal }" @click="closeDetail" @touchmove.stop.prevent="()=>{}">
      <view class="detail-card" @click.stop v-if="selectedItem">
        
        <view class="detail-decoration"></view>

        <view class="detail-header">
          <view class="detail-header-info">
            <text class="detail-camp">{{ selectedItem.campName }}</text>
            <text class="detail-plan">{{ selectedItem.planTitle }}</text>
          </view>
          <view v-if="selectedItem.isBigGroupExcellent === 1 || selectedItem.isSmallGroupExcellent === 1" class="detail-stamp" :class="selectedItem.isBigGroupExcellent === 1 ? 'stamp-red' : 'stamp-gold'">
            {{ selectedItem.isBigGroupExcellent === 1 ? '大组优秀' : '小组优秀' }}
          </view>
        </view>

        <scroll-view scroll-y class="detail-body">
          <text class="detail-content" user-select>{{ selectedItem.content }}</text>
        </scroll-view>

        <view class="detail-footer">
          <text class="detail-time">记录于 {{ selectedItem.submitTime }}</text>
          <view class="close-btn" @click="closeDetail">
            <text class="close-btn-text">合卷</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { API_CONFIG } from '@/api/config.js';

// --- 列表状态 ---
const list = ref([]);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const isRefreshing = ref(false);
const noMoreData = ref(false);
const page = ref(1);
const size = ref(10);
const total = ref(0);

// --- 弹窗状态 ---
const showModal = ref(false);
const selectedItem = ref(null);

// 打开详情弹窗
const openDetail = (item) => {
  selectedItem.value = item;
  showModal.value = true;
};

// 关闭详情弹窗
const closeDetail = () => {
  showModal.value = false;
  // 延迟清空数据，等弹窗关闭动画执行完
  setTimeout(() => {
    if (!showModal.value) selectedItem.value = null;
  }, 300);
};

// 获取列表数据
const fetchList = async (reset = false) => {
  if (isLoadingMore.value && !reset) return;

  try {
    if (reset) {
      page.value = 1;
      noMoreData.value = false;
    }

    isLoadingMore.value = true;

    // 模拟接口请求，这里保留了您的原版逻辑
    const token = uni.getStorageSync('token');
    const res = await new Promise((resolve, reject) => {
      uni.request({
        url: API_CONFIG.baseUrl + '/homework/my-list',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: {
          page: page.value,
          size: size.value
        },
        success: resolve,
        fail: reject
      });
    });

    const apiData = res.data;

    if (apiData.code === 200 && apiData.data) {
      const newList = apiData.data.list || [];

      if (reset) {
        list.value = newList;
      } else {
        list.value = [...list.value, ...newList];
      }

      total.value = apiData.data.total || 0;

      if (list.value.length >= total.value) {
        noMoreData.value = true;
      } else {
        page.value++;
      }
    } else {
      if (reset) {
        list.value = [];
      }
      uni.showToast({
        title: apiData.message || '获取失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取省察列表失败:', error);
    if (reset) {
      list.value = [];
    }
    uni.showToast({
      title: '网络连接异常',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
    isRefreshing.value = false;
  }
};

const onPullDownRefresh = () => {
  isRefreshing.value = true;
  fetchList(true);
};

const onReachBottom = () => {
  if (!noMoreData.value && !isLoadingMore.value) {
    fetchList();
  }
};

onMounted(() => {
  fetchList(true);
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f4f1eb;
}

/* ================= 骨架屏与空状态 ================= */
.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 12rpx;
}

.loading-spinner {
  width: 56rpx;
  height: 56rpx;
  border: 4rpx solid rgba(158, 42, 43, 0.1);
  border-top: 4rpx solid #9e2a2b;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.loading-spinner-small {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid rgba(158, 42, 43, 0.1);
  border-top: 3rpx solid #9e2a2b;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text,
.empty-desc {
  font-size: 26rpx;
  color: #8b7365;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  opacity: 0.6;
  margin-bottom: 20rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #4a3728;
  font-weight: 600;
  margin-bottom: 8rpx;
}

/* ================= 列表卡片样式 ================= */
.scroll-view {
  height: calc(100vh - constant(safe-area-inset-top));
  height: calc(100vh - env(safe-area-inset-top));
  padding: 24rpx 30rpx;
  box-sizing: border-box;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-bottom: 40rpx;
}

.reflection-card {
  background-color: #fdfaf6;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* 卡片点击时的按压反馈 */
.reflection-card-hover {
  transform: scale(0.98);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
  background-color: #f8f5f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex: 1;
  padding-right: 16rpx;
}

.camp-name {
  font-size: 24rpx;
  color: #8b7365;
  line-height: 1.4;
}

.plan-title {
  font-size: 28rpx;
  color: #5c4d3d;
  font-weight: 600;
}

.badge-container {
  flex-shrink: 0;
}

.badge {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.badge-excellent {
  background-color: #9e2a2b; /* 调整为沉稳的红 */
}

.badge-excellent .badge-text {
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 500;
}

.badge-small {
  background-color: #7a5c1e; /* 沉稳的金棕色 */
}

.badge-small .badge-text {
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 500;
}

.card-body {
  margin-bottom: 20rpx;
}

.content-text {
  font-size: 28rpx;
  color: #3d2f1e;
  line-height: 1.7;
  word-break: break-all; /* 防止长串字符不换行 */
}

.list-content {
  display: -webkit-box;
  -webkit-line-clamp: 5; /* 列表页截断显示5行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.submit-time {
  font-size: 22rpx;
  color: #a09080;
}

.loading-more, .no-more-data {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
}

.loading-more-text, .no-more-text {
  font-size: 24rpx;
  color: #a09080;
}

/* ================= 悬浮详情弹窗 (Modal) 样式 ================= */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明遮罩 */
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40rpx;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px); /* 毛玻璃效果 */
}

.detail-modal.modal-show {
  opacity: 1;
  pointer-events: auto;
}

.detail-card {
  width: 100%;
  max-height: 80vh; /* 限制最高高度 */
  background-color: #fdfaf6; /* 纸张质感颜色 */
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  transform: translateY(40rpx) scale(0.95);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.detail-modal.modal-show .detail-card {
  transform: translateY(0) scale(1);
}

/* 卡片顶部的装饰红线 */
.detail-decoration {
  height: 8rpx;
  background: linear-gradient(90deg, #9e2a2b, #c55355);
  width: 100%;
}

.detail-header {
  padding: 40rpx 40rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.detail-header-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex: 1;
  padding-right: 20rpx;
}

.detail-camp {
  font-size: 26rpx;
  color: #8b7365;
  letter-spacing: 1rpx;
}

.detail-plan {
  font-size: 34rpx;
  color: #4a3728;
  font-weight: 600;
  line-height: 1.4;
}

/* 详情内的印记样式 */
.detail-stamp {
  font-size: 24rpx;
  font-weight: bold;
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  border: 2rpx solid;
  transform: rotate(5deg); /* 轻微倾斜，模拟印章感 */
}

.stamp-red {
  color: #9e2a2b;
  border-color: rgba(158, 42, 43, 0.3);
  background-color: rgba(158, 42, 43, 0.05);
}

.stamp-gold {
  color: #7a5c1e;
  border-color: rgba(122, 92, 30, 0.3);
  background-color: rgba(122, 92, 30, 0.05);
}

.detail-body {
  flex: 1;
  padding: 10rpx 40rpx 20rpx;
  /* 解决长内容滚动条的问题 */
  box-sizing: border-box;
}

.detail-content {
  font-size: 30rpx;
  color: #3d2f1e;
  line-height: 1.8;
  white-space: pre-wrap; /* 核心：保留JSON中的 \n 换行符 */
  word-break: break-all; /* 防止如 1111 连串字符撑爆 */
  text-align: justify;
}

.detail-footer {
  padding: 30rpx 40rpx;
  border-top: 1rpx dashed #e8e4db;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(253, 250, 246, 0.95); /* 底部轻微吸底颜色 */
}

.detail-time {
  font-size: 24rpx;
  color: #a09080;
}

.close-btn {
  background-color: #f4eee6;
  padding: 12rpx 36rpx;
  border-radius: 100rpx;
  transition: background-color 0.2s;
}

.close-btn:active {
  background-color: #eaddcb;
}

.close-btn-text {
  font-size: 26rpx;
  color: #5c4d3d;
  font-weight: 500;
  letter-spacing: 2rpx;
}
</style>