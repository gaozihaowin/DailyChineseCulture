<template>
  <view class="page-container">
    <view v-if="isLoading && list.length === 0" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载学友佳作...</text>
    </view>

    <view v-else-if="!isLoading && list.length === 0" class="empty-state">
      <image class="empty-icon" src="https://img.icons8.com/fluency/200/reading.png" mode="aspectFit"></image>
      <text class="empty-title">暂无优秀功课</text>
      <text class="empty-desc">期待学友们更多的精彩分享</text>
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
      <view class="feed-list">
        <view
          class="feed-card"
          v-for="item in list"
          :key="item.homeworkId"
        >
          <view class="card-header">
            <image
              class="author-avatar"
              :src="item.authorAvatar || 'https://img.icons8.com/color/96/person-male.png'"
              mode="aspectFill"
            ></image>
            <view class="author-info">
              <text class="author-name">{{ item.authorName }}</text>
              <text class="submit-time">{{ item.submitTime }}</text>
            </view>
          </view>

          <view class="source-tag">
            <view class="source-dot"></view>
            <text class="source-text">{{ item.campName }} · {{ item.planTitle }}</text>
          </view>

          <view class="card-content">
            <text class="content-text">{{ item.content }}</text>
          </view>
        </view>
      </view>

      <view v-if="isLoadingMore" class="loading-more">
        <view class="loading-spinner-small"></view>
        <text class="loading-more-text">加载中...</text>
      </view>

      <view v-if="!hasMore && list.length > 0" class="no-more-data">
        <text class="no-more-text">— 没有更多了 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { API_CONFIG } from '@/api/config.js';

const list = ref([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const hasMore = ref(true);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const isRefreshing = ref(false);

const fetchShowcaseList = async (reset = false) => {
  if (isLoadingMore.value && !reset) return;

  try {
    if (reset) {
      page.value = 1;
      hasMore.value = true;
    }

    isLoadingMore.value = true;

    const token = uni.getStorageSync('token');
    const res = await new Promise((resolve, reject) => {
      uni.request({
        url: API_CONFIG.baseUrl + API_CONFIG.paths.excellentShowcase,
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
        hasMore.value = false;
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
    console.error('获取优秀功课展播失败:', error);
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
  fetchShowcaseList(true);
};

const onReachBottom = () => {
  if (!hasMore.value && !isLoadingMore.value) {
    return;
  }
  fetchShowcaseList();
};

onMounted(() => {
  fetchShowcaseList(true);
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

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.feed-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.author-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f4f1eb;
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex: 1;
}

.author-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #3d2f1e;
}

.submit-time {
  font-size: 22rpx;
  color: #a09080;
}

.source-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background-color: #eef5f9;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  align-self: flex-start;
}

.source-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #4a7c59;
}

.source-text {
  font-size: 22rpx;
  color: #3b5b71;
  font-weight: 500;
}

.card-content {
  margin-bottom: 0;
}

.content-text {
  font-size: 28rpx;
  color: #3d2f1e;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  padding: 40rpx 0;
}

.no-more-text {
  font-size: 24rpx;
  color: #a09080;
  letter-spacing: 2rpx;
}
</style>
