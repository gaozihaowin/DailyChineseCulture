<template>
  <view class="view-container">
      <view class="header">
        <view class="logo-text">
          <text class="logo-seal">良知</text>
          <text>致良知教育</text>
        </view>
        <view class="header-actions">
          <uni-icons type="search" size="24" color="#2d2424" style="margin-right: 30rpx;"></uni-icons>
          <uni-icons type="notification" size="24" color="#2d2424"></uni-icons>
        </view>
      </view>

      <view class="hero-banner">
        <view class="hero-title">致良知志愿中心</view>
        <view class="hero-subtitle">以行动践行良知，让善意温暖他人</view>
        <view class="quote-box">知行合一，以志愿之心，行利他之事</view>
      </view>

      <!-- 功能导航 -->
      <view class="grid-nav">
        <view class="nav-item" v-for="(item, index) in navList" :key="index" @click="handleNavClick(item)">
          <view class="icon-box" :style="{ backgroundColor: item.bgColor }">
            <image :src="item.iconUrl" class="nav-icon-img" mode="aspectFit"></image>
          </view>
          <text class="nav-label">{{ item.name }}</text>
        </view>
      </view>

      <!-- 知行打卡专区 -->
      <view class="section-header">
        <text class="section-title">知行打卡专区</text>
      </view>
      <view class="conscience-card clock-card">
        <view class="clock-top">
          <text class="clock-date">{{ todayDate }}</text>
          <text class="clock-word">今日良知经典</text>
        </view>
        <view class="clock-content">
          <text class="clock-sentence">知是行之始，行是知之成。</text>
          <text class="clock-author">—— 王阳明</text>
        </view>
        <button class="clock-btn" :disabled="isClocked" @click="handleClock">
          {{ isClocked ? '今日已打卡' : '点击打卡' }}
        </button>
      </view>

      <!-- 公益初心墙 -->
      <view class="section-header">
        <text class="section-title">公益初心墙</text>
      </view>
      <view class="conscience-card heart-card">
        <view class="heart-content">
          <text class="heart-slogan">以良知为灯，以行动为径</text>
          <text class="heart-desc">做有温度的公益，行有良知的善举</text>
          <text class="heart-desc">躬身践行，知行合一，温暖他人，照亮自己</text>
        </view>
      </view>
    <view class="bottom-fill"></view>
  </view>
</template>

<script>
export default {
  name: 'VolunteerHome',
  data() {
    return {
      navList: [
        {
          name: '担当过往',   
          iconUrl: 'https://img.icons8.com/fluency/48/statistics.png',    
          bgColor: '#FFFBE6', 
          path: '/pages/volunteer-history/volunteer-history'
        },
        { 
          name: '管理成员', 
          iconUrl: 'https://img.icons8.com/ios-filled/50/9e2a2b/user.png',
          bgColor: '#FFF0F0',
          path: '/pages/volunteer-manage/volunteer-manage'
        },
        { 
          name: '志愿证书',
          iconUrl: 'https://img.icons8.com/color/96/certificate.png', 
          bgColor: '#F0F8FF',
          path: '/pages/volunteer/volunteer-certificates' // 补充志愿证书页面路径
        },
        { 
          name: '群聊', 
          iconUrl: 'https://img.icons8.com/ios-filled/50/9e2a2b/chat.png', 
          bgColor: '#F0FFF4',
          path: '/pages/chat-group/chatindex' // 补充群聊页面路径
        }
      ],
      todayDate: '',
      isClocked: false
    }
  },
  mounted() {
    this.initDate();
    this.initClockState();
  },
  methods: {
    initDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      this.todayDate = `${year}年${month}月${day}日`;
    },
    initClockState() {
      const clockRecord = uni.getStorageSync('conscience_clock');
      if (clockRecord && clockRecord.date === this.todayDate) {
        this.isClocked = true;
      } else {
        this.isClocked = false;
      }
    },
    handleClock() {
      uni.setStorageSync('conscience_clock', {
        date: this.todayDate,
        time: new Date().toLocaleTimeString()
      });
      this.isClocked = true;
      uni.showToast({ title: '知行打卡成功！', icon: 'success', duration: 1500 });
    },
    // 合并并重构handleNavClick方法，支持所有功能项的跳转
    handleNavClick(item) {
      // 检查是否有有效路径
      if (item.path && item.path.trim()) {
        uni.navigateTo({
          url: item.path,
          fail: (err) => {
            console.error(`跳转${item.name}页面失败：`, err);
            // 区分错误类型提示
            if (err.errMsg.includes('page not found')) {
              uni.showToast({ title: `${item.name}页面不存在`, icon: 'none' });
            } else {
              uni.showToast({ title: '页面跳转失败', icon: 'none' });
            }
          }
        });
      } else {
        // 无路径时仅提示
        uni.showToast({ title: `进入「${item.name}」`, icon: 'none', duration: 1500 });
      }
    }
  }
}
</script>

<style scoped>
.view-container {
  height: 100%; 
  display: flex;
  flex-direction: column;
  background-color: #f9f7f2; 
}

.header {
  padding: 80rpx 40rpx 30rpx; 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  background: rgba(249, 247, 242, 0.98); 
  z-index: 10;
}

.logo-text {
  font-size: 38rpx;
  font-weight: 800;
  color: #9e2a2b;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.logo-seal {
  background-color: #9e2a2b;
  color: #fff;
  font-size: 24rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  font-family: serif;
}

.hero-banner {
  padding: 10rpx 40rpx 30rpx;
  background: radial-gradient(circle at top right, rgba(252, 239, 233, 0.8), transparent 70%);
  text-align: center;
}

.hero-title {
  font-size: 56rpx;
  color: #9e2a2b;
  margin-bottom: 16rpx;
  letter-spacing: 4rpx;
  font-weight: 900;
}

.hero-subtitle {
  font-size: 28rpx;
  color: #5d5555;
  letter-spacing: 2rpx;
  margin-bottom: 40rpx;
  position: relative;
  display: inline-block;
}

.hero-subtitle::before,
.hero-subtitle::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 60rpx;
  height: 1px;
  background: #ddd;
}
.hero-subtitle::before { left: -80rpx; }
.hero-subtitle::after { right: -80rpx; }

.quote-box {
  font-size: 24rpx;
  color: #9e2a2b;
  font-weight: bold;
  background: rgba(158, 42, 43, 0.05);
  display: inline-block;
  padding: 8rpx 24rpx;
  border-radius: 40rpx;
}

.grid-nav {
  display: flex;
  justify-content: space-between;
  padding: 0 50rpx;
  margin-bottom: 48rpx; 
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.icon-box {
  width: 100rpx;
  height: 100rpx;
  border-radius: 36rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(158, 42, 43, 0.08);
  border: 1px solid rgba(158, 42, 43, 0.05);
  position: relative;
  overflow: hidden;
}

.icon-box::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(158, 42, 43, 0.05) 0%, transparent 70%);
  transform: rotate(45deg);
}

.nav-label {
  font-size: 26rpx;
  color: #2d2424;
  font-weight: 500;
}

.nav-icon-img {
  width: 48rpx;
  height: 48rpx;
}

.section-header {
  padding: 0 40rpx;
  margin-top: 24rpx; 
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #2d2424;
  letter-spacing: 2rpx;
}

.conscience-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 24rpx;
  margin: 0 40rpx 24rpx;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(158, 42, 43, 0.05);
}

/* 知行打卡专区样式 */
.clock-card {
  text-align: center;
}
.clock-card .clock-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px solid #f5f5f5;
}
.clock-card .clock-date {
  font-size: 22rpx;
  color: #9e2a2b;
  font-weight: 500;
}
.clock-card .clock-word {
  font-size: 20rpx;
  color: #999;
}
.clock-card .clock-content {
  margin-bottom: 24rpx;
}
.clock-card .clock-sentence {
  font-size: 28rpx;
  color: #2d2424;
  font-family: serif;
  letter-spacing: 2rpx;
  line-height: 1.6;
  margin-bottom: 12rpx;
}
.clock-card .clock-author {
  font-size: 22rpx;
  color: #9e2a2b;
  font-style: italic;
}
.clock-card .clock-btn {
  width: 180rpx;
  height: 64rpx;
  line-height: 64rpx;
  background: #9e2a2b;
  color: #fff;
  border-radius: 32rpx;
  font-size: 24rpx;
  border: none;
}
.clock-card .clock-btn:disabled {
  background: #ccc;
  color: #fff;
}

/* 公益初心墙样式 */
.heart-card {
  position: relative;
  padding: 36rpx 28rpx;
  text-align: center;
}
.heart-card .heart-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  position: relative;
  z-index: 2;
}
.heart-card .heart-slogan {
  font-size: 32rpx;
  color: #9e2a2b;
  font-weight: 600;
  letter-spacing: 2rpx;
  font-family: serif;
}
.heart-card .heart-desc {
  font-size: 26rpx;
  color: #5d5555;
  line-height: 1.6;
  letter-spacing: 1rpx;
}
.heart-card .heart-seal {
  position: absolute;
  right: 30rpx;
  bottom: 30rpx;
  width: 60rpx;
  height: 60rpx;
  border: 2rpx solid #9e2a2b;
  border-radius: 8rpx;
  color: #9e2a2b;
  font-size: 24rpx;
  font-weight: bold;
  font-family: serif;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.3;
  z-index: 1;
}

.bottom-fill {
  flex: 1;
  min-height: calc(100vh - var(--status-bar-height, 0rpx) - 800rpx);
  background-color: #f9f7f2;
}
</style>