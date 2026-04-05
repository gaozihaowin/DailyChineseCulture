<template>
  <view class="cert-container">
    <!-- 自定义头部：带返回按钮 -->
    <view class="custom-header">
      <!-- 返回按钮 -->
      <view class="back-btn" @tap="goBack">
        <view class="back-arrow"></view>
      </view>
      <!-- 标题 -->
      <text class="header-title">我的证书</text>
      <!-- 占位（居中用） -->
      <view class="placeholder"></view>
    </view>

    <!-- 证书列表 -->
    <scroll-view scroll-y class="cert-scroll" :show-scrollbar="false">
      <view class="cert-list">
        <!-- 空状态 -->
        <view class="empty-box" v-if="certList.length === 0 && !loading">
          <image src="https://img.icons8.com/fluency/96/empty-certificate.png" class="empty-img"></image>
          <text class="empty-title">暂无证书</text>
          <text class="empty-desc">完成课程与任务后，将自动颁发证书</text>
        </view>

        <!-- 证书卡片 -->
        <view 
          class="cert-card floating-card glass-card" 
          v-for="(item, index) in certList" 
          :key="item.cert_id"
          :class="{ 'anim-fade-up': isFirstLoad }"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @tap="previewImage(item.imageUrl)"
        >
          <view class="cert-left">
            <image :src="item.imageUrl" class="cert-img" mode="aspectFill"></image>
          </view>
          <view class="cert-right">
            <text class="cert-type">{{ item.type }}</text>
            <text class="cert-number">证书编号：{{ item.number }}</text>
            <text class="cert-time">颁发时间：{{ formatTime(item.issueTime) }}</text>
          </view>
          <view class="pure-css-arrow"></view>
        </view>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config';

export default {
  name: 'MyCertificate',
  data() {
    return {
      isFirstLoad: true,
      loading: true,
      certList: []
    }
  },
  onLoad() {
    this.fetchCertList();
    setTimeout(() => {
      this.isFirstLoad = false;
    }, 1000);
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    // 获取证书列表
    async fetchCertList() {
      this.loading = true;
      const token = uni.getStorageSync('token');
      
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        this.loading = false;
        return;
      }

      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}/api/certificate/my-list`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.statusCode === 200 && res.data.code === 200) {
          this.certList = res.data.data;
        } else {
          uni.showToast({ title: res.data.msg || '获取证书失败', icon: 'none' });
        }
      } catch (error) {
        console.error('获取证书失败', error);
        uni.showToast({ title: '网络异常', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },

    formatTime(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },

    previewImage(url) {
      uni.previewImage({
        urls: [url],
        current: url,
        showmenu: true
      });
    }
  }
}
</script>

<style scoped>
/* 动画 */
.anim-fade-up { 
  opacity: 0; 
  animation: sleekFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
}

@keyframes sleekFadeUp { 
  0% { opacity: 0; transform: translateY(40rpx); }
  100% { opacity: 1; transform: translateY(0); } 
}

/* 页面容器 */
.cert-container {
  min-height: 100vh;
  background-color: #faf8f5;
  display: flex;
  flex-direction: column;
}

/* 自定义导航栏（和项目完全统一） */
.custom-header {
  background: linear-gradient(150deg, #9e2a2b 0%, #7a1212 100%);
  padding: 20rpx 30rpx;
  padding-top: 60rpx; /* 状态栏高度适配 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 10;
}
/* 返回按钮 */
.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-arrow {
  width: 20rpx;
  height: 20rpx;
  border-left: 3rpx solid #fff;
  border-bottom: 3rpx solid #fff;
  transform: rotate(45deg);
}
/* 标题 */
.header-title {
  font-size: 36rpx;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 2rpx;
}
.placeholder {
  width: 60rpx;
}

/* 内容区域 */
.cert-scroll {
  flex: 1;
  padding: 20rpx 30rpx;
}

/* 卡片样式 */
.floating-card {
  background: #ffffff;
  border-radius: 28rpx; 
  margin-bottom: 24rpx; 
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.01);
  position: relative;
  transition: transform 0.2s ease;
}

.glass-card {
  background: rgba(255, 255, 255, 0.94); 
  backdrop-filter: blur(20px); 
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8); 
  box-shadow: 0 16rpx 40rpx rgba(122, 18, 18, 0.12); 
}

/* 证书卡片 */
.cert-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  cursor: pointer;
}
.cert-card:active {
  transform: scale(0.98);
}

.cert-left {
  margin-right: 30rpx;
}
.cert-img {
  width: 140rpx;
  height: 180rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
}

.cert-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.cert-type {
  font-size: 32rpx;
  font-weight: 900;
  color: #2d2424;
  letter-spacing: 2rpx;
}
.cert-number {
  font-size: 24rpx;
  color: #666;
  font-family: monospace;
}
.cert-time {
  font-size: 22rpx;
  color: #999;
}

.pure-css-arrow {
  width: 12rpx;
  height: 12rpx;
  border-top: 3rpx solid #c0baba;
  border-right: 3rpx solid #c0baba;
  transform: rotate(45deg);
  margin-left: 8rpx;
}

/* 空状态 */
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 150rpx;
}
.empty-img {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
  opacity: 0.7;
}
.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}
.empty-desc {
  font-size: 24rpx;
  color: #999;
}

.safe-area-spacer {
  height: 160rpx;
}
</style>