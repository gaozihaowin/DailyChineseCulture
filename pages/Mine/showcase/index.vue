<template>
  <view class="page-container">
    <NavBar title="见贤思齐" bgColor="#f4f1eb" />

    <view v-if="isLoading && list.length === 0" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在寻访学友佳作...</text>
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
          @click="openDetail(item)"
          hover-class="feed-card-hover"
          :hover-stay-time="150"
        >
          <view class="card-header">
            <view class="avatar-wrapper">
              <image
                v-if="item.avatar && !item.avatarError"
                class="author-avatar"
                :src="item.avatar"
                mode="aspectFill"
                @error="handleAvatarError(item)"
              ></image>
              <view v-else class="default-avatar">
                {{ getFirstChar(item.authorName) }}
              </view>
            </view>
            
            <view class="author-info">
              <text class="author-name">{{ item.authorName || '匿名学友' }}</text>
              <text class="submit-time">{{ item.submitTime }}</text>
            </view>
          </view>

          <view class="source-tag">
            <view class="source-dot"></view>
            <text class="source-text">{{ item.campName }} · {{ item.planTitle }}</text>
          </view>

          <view class="card-content">
            <text class="content-text list-content">{{ item.content }}</text>
          </view>
        </view>
      </view>

      <view v-if="isLoadingMore" class="loading-more">
        <view class="loading-spinner-small"></view>
        <text class="loading-more-text">加载中...</text>
      </view>

      <view v-if="!hasMore && list.length > 0" class="no-more-data">
        <text class="no-more-text">— 已尽览全部 —</text>
      </view>
    </scroll-view>

    <view class="detail-modal" :class="{ 'modal-show': showModal }" @click="closeDetail" @touchmove.stop.prevent="()=>{}">
      <view class="detail-card" @click.stop v-if="selectedItem">
        
        <view class="detail-header">
          <view class="detail-avatar-wrapper">
            <image
              v-if="selectedItem.avatar && !selectedItem.avatarError"
              class="detail-avatar"
              :src="selectedItem.avatar"
              mode="aspectFill"
              @error="handleAvatarError(selectedItem)"
            ></image>
            <view v-else class="default-avatar detail-default-avatar">
              {{ getFirstChar(selectedItem.authorName) }}
            </view>
          </view>

          <view class="detail-author-info">
            <text class="detail-author-name">{{ selectedItem.authorName || '匿名学友' }}</text>
            <text class="detail-time">发布于 {{ selectedItem.submitTime }}</text>
          </view>
        </view>

        <view class="detail-source-wrap">
          <view class="detail-source-tag">
            <text class="detail-source-text">源自：{{ selectedItem.campName }} · {{ selectedItem.planTitle }}</text>
          </view>
        </view>

        <scroll-view scroll-y class="detail-body">
          <view class="detail-content-inner">
            <text class="detail-content" user-select>{{ selectedItem.content }}</text>
          </view>
        </scroll-view>

        <view class="detail-footer">
          <view class="close-btn" @click="closeDetail">
            <text class="close-btn-text">受教</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { API_CONFIG } from '@/api/config.js';

// --- 列表数据状态 ---
const list = ref([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const hasMore = ref(true);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const isRefreshing = ref(false);

// --- 弹窗状态 ---
const showModal = ref(false);
const selectedItem = ref(null);

// === 辅助方法：处理头像托底 ===
const getFirstChar = (name) => {
  if (!name) return '友';
  return name.trim().charAt(0).toUpperCase();
};

const handleAvatarError = (item) => {
  // 标记该图片的加载状态为失败，触发视图更新显示文字头像
  item.avatarError = true;
};

// --- 弹窗操作 ---
const openDetail = (item) => {
  selectedItem.value = item;
  showModal.value = true;
};

const closeDetail = () => {
  showModal.value = false;
  setTimeout(() => {
    if (!showModal.value) selectedItem.value = null;
  }, 300);
};

// --- 获取列表 ---
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
        data: { page: page.value, size: size.value },
        success: resolve,
        fail: reject
      });
    });

    const apiData = res.data;

    if (apiData.code === 200 && apiData.data) {
      // 预处理数据，增加 avatarError 字段用于追踪图片加载状态
      const newList = (apiData.data.list || []).map(item => ({
        ...item,
        avatarError: false 
      }));

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
      if (reset) list.value = [];
      uni.showToast({ title: apiData.message || '获取失败', icon: 'none' });
    }
  } catch (error) {
    console.error('获取优秀功课展播失败:', error);
    if (reset) list.value = [];
    uni.showToast({ title: '网络连接异常', icon: 'none' });
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
  if (!hasMore.value && !isLoadingMore.value) return;
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

/* 基础加载与空状态 */
.loading-container,
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 12rpx;
}
.loading-spinner {
  width: 56rpx; height: 56rpx; border: 4rpx solid rgba(158, 42, 43, 0.1); border-top: 4rpx solid #9e2a2b; border-radius: 50%; animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.loading-spinner-small {
  width: 32rpx; height: 32rpx; border: 3rpx solid rgba(158, 42, 43, 0.1); border-top: 3rpx solid #9e2a2b; border-radius: 50%; animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.loading-text, .empty-desc { font-size: 26rpx; color: #8b7365; }
.empty-icon { width: 200rpx; height: 200rpx; opacity: 0.6; margin-bottom: 20rpx; }
.empty-title { font-size: 32rpx; color: #4a3728; font-weight: 600; margin-bottom: 8rpx; }

/* 列表区 */
.scroll-view {
  height: calc(100vh - constant(safe-area-inset-top));
  height: calc(100vh - env(safe-area-inset-top));
  padding: 24rpx 30rpx;
  box-sizing: border-box;
}

.feed-list { display: flex; flex-direction: column; gap: 24rpx; padding-bottom: 30rpx; }

.feed-card {
  background-color: #ffffff;
  border-radius: 16rpx; padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.feed-card-hover { transform: scale(0.98); box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02); background-color: #faf8f5; }

.card-header { display: flex; align-items: center; gap: 20rpx; margin-bottom: 20rpx; }

/* 列表头像托底机制 */
.avatar-wrapper {
  width: 80rpx; height: 80rpx;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2rpx solid #f0e9dd;
  overflow: hidden;
  background-color: #f4f1eb;
}
.author-avatar { width: 100%; height: 100%; display: block; }
.default-avatar {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background-color: #f4eee6; color: #8b7365;
  font-size: 32rpx; font-weight: bold; font-family: -apple-system, sans-serif;
}

.author-info { display: flex; flex-direction: column; gap: 6rpx; flex: 1; }
.author-name { font-size: 30rpx; font-weight: 600; color: #3d2f1e; }
.submit-time { font-size: 22rpx; color: #a09080; }

.source-tag {
  display: inline-flex; align-items: center; gap: 8rpx;
  background-color: #f8f9fa; border: 1rpx solid #e9ecef;
  padding: 8rpx 16rpx; border-radius: 8rpx;
  margin-bottom: 20rpx; align-self: flex-start;
}
.source-dot { width: 8rpx; height: 8rpx; border-radius: 50%; background-color: #5c7a6b; }
.source-text { font-size: 22rpx; color: #4a5d68; font-weight: 500; }

.card-content { margin-bottom: 0; }
.content-text { font-size: 28rpx; color: #3d2f1e; line-height: 1.7; }
.list-content { display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }

.loading-more { display: flex; align-items: center; justify-content: center; gap: 12rpx; padding: 30rpx 0; }
.loading-more-text { font-size: 24rpx; color: #8b7365; }
.no-more-data { display: flex; align-items: center; justify-content: center; padding: 40rpx 0; }
.no-more-text { font-size: 24rpx; color: #a09080; letter-spacing: 2rpx; }

/* ================= 悬浮详情弹窗 (Modal) ================= */
.detail-modal {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.55);
  z-index: 999; display: flex; align-items: center; justify-content: center;
  padding: 0 40rpx; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
  backdrop-filter: blur(3px);
}
.detail-modal.modal-show { opacity: 1; pointer-events: auto; }

.detail-card {
  width: 100%;
  max-height: 80vh; /* 防止长文撑满屏幕，留出呼吸空间 */
  background-color: #fdfaf6; border-radius: 24rpx;
  display: flex; flex-direction: column; position: relative; overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  transform: translateY(40rpx) scale(0.95); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.detail-modal.modal-show .detail-card { transform: translateY(0) scale(1); }

/* 弹窗头部 */
.detail-header {
  padding: 40rpx 40rpx 20rpx; display: flex; align-items: center; gap: 24rpx;
  background-color: #ffffff; border-bottom: 1rpx solid #f0e9dd;
}

/* 弹窗头像托底机制 */
.detail-avatar-wrapper {
  width: 90rpx; height: 90rpx; border-radius: 50%;
  border: 3rpx solid #eaddcb; overflow: hidden;
  flex-shrink: 0; background-color: #f4f1eb;
}
.detail-avatar { width: 100%; height: 100%; display: block; }
.detail-default-avatar { font-size: 38rpx; }

.detail-author-info { display: flex; flex-direction: column; gap: 8rpx; flex: 1; }
.detail-author-name { font-size: 34rpx; color: #3d2f1e; font-weight: 600; }
.detail-time { font-size: 24rpx; color: #a09080; }

/* 来源标签（书签风格） */
.detail-source-wrap { padding: 30rpx 40rpx 10rpx; flex-shrink: 0; }
.detail-source-tag {
  background-color: rgba(92, 122, 107, 0.08); padding: 12rpx 20rpx;
  border-radius: 8rpx; border-left: 6rpx solid #5c7a6b;
}
.detail-source-text { font-size: 26rpx; color: #4a5d68; font-weight: 500; }

/* 弹窗正文区域（实现弹性自适应滚动） */
.detail-body {
  flex: 1; /* 占据剩余空间 */
  min-height: 200rpx; /* 无论文字多短，都撑起一定的高度确保美观 */
  box-sizing: border-box;
}
.detail-content-inner {
  padding: 20rpx 40rpx 30rpx;
}
.detail-content {
  font-size: 30rpx; color: #2d241d; line-height: 1.8;
  white-space: pre-wrap; word-break: break-all; text-align: justify;
}

/* 弹窗底部 */
.detail-footer {
  padding: 30rpx 40rpx; border-top: 1rpx dashed #e8e4db;
  display: flex; justify-content: center; background-color: #ffffff;
  flex-shrink: 0;
}
.close-btn {
  background-color: #f4eee6; padding: 14rpx 60rpx; border-radius: 100rpx;
  transition: background-color 0.2s; border: 1rpx solid #eaddcb;
}
.close-btn:active { background-color: #eaddcb; }
.close-btn-text {
  font-size: 28rpx; color: #5c4d3d; font-weight: 600; letter-spacing: 4rpx;
}
</style>