<template>
  <view class="page-container">
    <NavBar title="我的省察" />

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
            <text class="content-text">{{ item.content }}</text>
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
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { API_CONFIG } from '@/api/config.js';

const list = ref([]);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const isRefreshing = ref(false);
const noMoreData = ref(false);
const page = ref(1);
const size = ref(10);
const total = ref(0);

const fetchList = async (reset = false) => {
  if (isLoadingMore.value && !reset) return;

  try {
    if (reset) {
      page.value = 1;
      noMoreData.value = false;
    }

    isLoadingMore.value = true;

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
}

.reflection-card {
  background-color: #fdfaf6;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  position: relative;
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
  font-size: 26rpx;
  color: #5c4d3d;
  font-weight: 500;
}

.badge-container {
  flex-shrink: 0;
}

.badge {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.badge-excellent {
  background-color: #a83235;
}

.badge-excellent .badge-text {
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 500;
}

.badge-small {
  background-color: #7a5c1e;
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
  display: -webkit-box;
  -webkit-line-clamp: 5;
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

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 30rpx 0;
}

.loading-more-text {
  font-size: 24rpx;
  color: #8b7365;
}

.no-more-data {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
}

.no-more-text {
  font-size: 24rpx;
  color: #a09080;
}
</style>
