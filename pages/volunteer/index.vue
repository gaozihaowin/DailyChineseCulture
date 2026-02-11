<template>
  <view class="view-container">
    <!-- 顶部导航 -->
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

    <!-- 滚动内容区 -->
    <scroll-view scroll-y class="scroll-content">
      <!-- 首屏Banner -->
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
    </scroll-view>

    <!-- 底部导航：改为和第二张图一致的Tab栏样式 -->
    <view class="bottom-tabbar">
      <view class="tab-item" :class="{ active: activeTab === 'home' }" @tap="goToHome">
        <image :src="activeTab === 'home' ? 'https://img.icons8.com/fluency/96/home.png' : 'https://img.icons8.com/ios/96/home.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">志愿首页</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'excellent' }" @tap="goToExcellent">
        <image :src="activeTab === 'excellent' ? 'https://img.icons8.com/fluency/96/star.png' : 'https://img.icons8.com/ios/96/star.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">优秀作业</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'stats' }" @tap="goToStats">
        <image :src="activeTab === 'stats' ? 'https://img.icons8.com/fluency/96/bar-chart.png' : 'https://img.icons8.com/ios/96/bar-chart.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">志愿统计</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'profile' }" @tap="goToProfile">
        <image :src="activeTab === 'profile' ? 'https://img.icons8.com/fluency/96/user.png' : 'https://img.icons8.com/ios/96/user.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">个人中心</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VolunteerHome',
  data() {
    return {
      navList: [
        { 
          name: '管理成员', 
          iconUrl: 'https://img.icons8.com/fluency/96/people-group.png',
          bgColor: '#FFF0F0',
          path: '/pages/volunteer/manage'
        },
        { name: '志愿证书', iconUrl: 'https://img.icons8.com/color/96/certificate.png', bgColor: '#F0F8FF' },
        { name: '良知帮扶', iconUrl: 'https://img.icons8.com/fluency/96/handshake.png', bgColor: '#FFFAF0' },
        { name: '知行问答', iconUrl: 'https://img.icons8.com/color/96/question-mark.png', bgColor: '#F0FFF4' }
      ],
      todayDate: '',
      isClocked: false,
      activeTab: 'home'
    }
  },
  mounted() {
    this.initDate();
    this.initClockState();
    this.setActiveTab();
  },
  methods: {
    setActiveTab() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1].route;
      if (currentPage.includes('volunteer/index')) {
        this.activeTab = 'home';
      } else if (currentPage.includes('homework/excellent')) {
        this.activeTab = 'excellent';
      } else if (currentPage.includes('homework/stats')) {
        this.activeTab = 'stats';
      } else if (currentPage.includes('volunteer/my')) {
        this.activeTab = 'profile';
      }
    },
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
    handleNavClick(item) {
      if (item.name === '管理成员' && item.path) {
        uni.navigateTo({
          url: item.path,
          fail: (err) => {
            console.error('跳转管理成员页面失败：', err);
            uni.showToast({ title: '页面路径错误', icon: 'none' });
          }
        });
      } else {
        uni.showToast({ title: `进入「${item.name}」`, icon: 'none', duration: 1500 });
      }
    },
    goToHome() {
      uni.switchTab({ url: '/pages/volunteer/index' });
    },
    goToExcellent() {
      uni.reLaunch({ url: '/pages/volunteer/homework/excellent' });
    },
    goToStats() {
      uni.reLaunch({ url: '/pages/volunteer/homework/stats' });
    },
    goToProfile() {
      uni.reLaunch({ url: '/pages/volunteer/my' });
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
.scroll-content {
  flex: 1;
  height: 0;
  width: 100%;
  /* 给滚动内容底部增加内边距，防止最后一个卡片被导航栏遮挡 */
  padding-bottom: 120rpx;
}
.hero-banner {
  padding: 40rpx 40rpx 60rpx;
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
.hero-subtitle::before {
  left: -80rpx;
}
.hero-subtitle::after {
  right: -80rpx;
}
.quote-box {
  font-size: 26rpx;
  color: #9e2a2b;
  font-weight: bold;
  background: rgba(158, 42, 43, 0.05);
  display: inline-block;
  padding: 10rpx 30rpx;
  border-radius: 40rpx;
}
.grid-nav {
  display: flex;
  justify-content: space-between;
  padding: 0 50rpx;
  margin-bottom: 40rpx;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.icon-box {
  width: 100rpx;
  height: 100rpx;
  border-radius: 36rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(158, 42, 43, 0.08);
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
  margin-bottom: 24rpx;
}
.section-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #2d2424;
  letter-spacing: 2rpx;
}
.conscience-card {
  background: #fff;
  border-radius: 36rpx;
  padding: 30rpx;
  margin: 0 40rpx 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(158, 42, 43, 0.05);
}

/* 底部导航栏：和首页一致的样式 + 安全区适配 */
.bottom-tabbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  /* 适配安全区：高度改为auto + 最小高度 + 底部内边距 */
  height: auto;
  min-height: 100rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  border-top: 1rpx solid #eee;
  z-index: 99;
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  flex: 1;
  /* 保证每个tab项的最小高度 */
  min-height: 100rpx;
}
.tab-icon {
  width: 48rpx;
  height: 48rpx;
}
.tab-text {
  font-size: 22rpx;
  color: #666;
}
.tab-item.active .tab-text {
  color: #A31D1D;
}
.tab-item.active .tab-icon {
  /* 激活态图标染成红色 */
  filter: brightness(0) saturate(100%) invert(14%) sepia(88%) saturate(3841%) hue-rotate(356deg) brightness(90%) contrast(101%);
}

/* 知行打卡专区样式 */
.clock-card {
  text-align: center;
}
.clock-card .clock-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #f5f5f5;
}
.clock-card .clock-date {
  font-size: 24rpx;
  color: #9e2a2b;
  font-weight: 500;
}
.clock-card .clock-word {
  font-size: 22rpx;
  color: #999;
}
.clock-card .clock-content {
  margin-bottom: 40rpx;
}
.clock-card .clock-sentence {
  font-size: 32rpx;
  color: #2d2424;
  font-family: serif;
  letter-spacing: 2rpx;
  line-height: 1.6;
  margin-bottom: 16rpx;
}
.clock-card .clock-author {
  font-size: 24rpx;
  color: #9e2a2b;
  font-style: italic;
}
.clock-card .clock-btn {
  width: 200rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #9e2a2b;
  color: #fff;
  border-radius: 36rpx;
  font-size: 26rpx;
  border: none;
}
.clock-card .clock-btn:disabled {
  background: #ccc;
  color: #fff;
}

/* 公益初心墙样式 */
.heart-card {
  position: relative;
  padding: 40rpx 30rpx;
  text-align: center;
}
.heart-card .heart-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
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
  font-size: 24rpx;
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
</style>