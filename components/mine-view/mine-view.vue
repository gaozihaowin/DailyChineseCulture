<template>
  <view class="mine-container" :style="{ marginTop: '-' + statusBarHeight + 'px', paddingTop: statusBarHeight + 'px' }">
    
    <view class="crimson-background"></view>

    <view class="fixed-top-zone">
      
      <view class="custom-header">
        <view class="header-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">致良知教育</text>
        </view>
        <view class="header-action">
          <uni-icons type="gear" size="24" color="#ffffff"></uni-icons>
        </view>
      </view>

      <view class="floating-card glass-card profile-card fade-in-up">
        <view class="profile-main" @tap="goToEditProfile">
          <view class="avatar-wrapper">
            <image class="avatar-img" :src="userInfo.avatar" mode="aspectFill"></image>
            <view class="status-dot"></view>
          </view>
          
          <view class="info-wrapper">
            <view class="name-row">
              <text class="user-name">{{ userInfo.nickname || '请设置昵称' }}</text>
              <uni-icons type="vip-filled" size="18" color="#F59E0B" class="vip-icon"></uni-icons>
            </view>
            <view class="account-row" v-if="userInfo.account">
              <text class="account-id">@{{ userInfo.account }}</text>
            </view>
            <view class="identity-badge">
              <text class="badge-dot"></text>
              <text class="badge-text">{{ currentIdentity }}</text>
            </view>
          </view>
          
          <view class="pure-css-arrow"></view>
        </view>

        <view class="divider"></view>

        <view class="identity-switch-bar">
          <text class="switch-label">多端身份管理</text>
          <view class="switch-action-btn" @tap.stop="toggleIdentityMenu">
            <uni-icons type="loop" size="14" color="#a31d1d"></uni-icons>
            <text class="switch-btn-text">切换身份</text>
          </view>
          
          <view class="dropdown-menu" v-if="isIdentityOpen">
            <view 
              class="dropdown-item" 
              v-for="(role, index) in identityOptions" 
              :key="index" 
              @tap.stop="switchIdentity(role)"
            >
              <text :class="{ 'active-role': currentIdentity === role.name }">
                {{ role.name }}
              </text>
              <uni-icons v-if="currentIdentity === role.name" type="checkmarkempty" size="18" color="#A31D1D"></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <view class="floating-card glass-card stats-card fade-in-up delay-1">
        <view class="stat-item" v-for="(item, index) in statsList" :key="index">
          <text class="stat-num">{{ item.value }}</text>
          <text class="stat-label">{{ item.label }}</text>
        </view>
      </view>

    </view> <scroll-view scroll-y class="scroll-view" @tap="closeIdentityMenu" :show-scrollbar="false">
      <view class="scroll-content-inner">

        <view class="floating-card grid-card fade-in-up delay-2">
          <view class="grid-container">
            <view class="grid-item" v-for="(item, index) in coreServices" :key="index" @tap="handleMenuClick(item)">
              <view class="grid-icon-box" :style="{ backgroundColor: item.bgColor }">
                <image :src="item.iconUrl" class="grid-img" mode="aspectFit"></image>
              </view>
              <text class="grid-text">{{ item.text }}</text>
            </view>
          </view>
        </view>

        <view class="floating-card list-card fade-in-up delay-3">
          <view class="section-title-row">
            <view class="title-decorator"></view>
            <text class="section-title">常用服务</text>
          </view>
          <view class="menu-item" v-for="(item, index) in commonServices" :key="index" @tap="handleMenuClick(item)">
            <view class="menu-left">
              <view class="list-icon-box" :style="{ backgroundColor: item.bgColor }">
                <image :src="item.iconUrl" class="list-icon-img" mode="aspectFit"></image>
              </view>
              <text class="menu-text">{{ item.text }}</text>
            </view>
            <view class="menu-right">
               <text class="menu-extra" v-if="item.extra">{{ item.extra }}</text>
               <view class="pure-css-arrow"></view>
            </view>
          </view>
        </view>

        <view class="floating-card list-card fade-in-up delay-4">
          <view class="menu-item" v-for="(item, index) in otherServices" :key="index" @tap="handleMenuClick(item)">
            <view class="menu-left">
              <view class="list-icon-box" style="background-color: #F7F8FA;">
                 <image :src="item.iconUrl" class="list-icon-img" mode="aspectFit" style="opacity: 0.7;"></image>
              </view>
              <text class="menu-text">{{ item.text }}</text>
            </view>
            <view class="menu-right">
               <view class="pure-css-arrow"></view>
            </view>
          </view>
        </view>

        <view class="logout-section fade-in-up delay-5">
          <view class="logout-btn" hover-class="logout-btn-hover" @tap="handleLogout">
            <text class="logout-text">退出当前账号</text>
          </view>
        </view>
        
        <view class="footer-info">致良知教育 v1.3.0</view>
        <view class="safe-area-spacer"></view>

      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config';

export default {
  name: 'MineView',
  
  data() {
    return {
      statusBarHeight: 20,
      userInfo: { 
        nickname: '', 
        avatar: 'https://img.icons8.com/color/96/person-male.png',
        user_id: '',
        openid: '',
        account: ''
      },
      token: '', 
      isIdentityOpen: false,
      currentIdentity: '学员端',
      identityOptions: [
        { name: '学员端' }, 
        { name: '志愿者端' }
      ],
      statsList: [
        { label: '地区', value: '-' }, 
        { label: '职业', value: '-' },
        { label: '年数', value: '0' }, 
        { label: '学时', value: '0h' }
      ],
      coreServices: [
        { text: '我的课程', iconUrl: 'https://img.icons8.com/color/96/books.png', bgColor: '#FFF0F0' },
        { text: '我的订单', iconUrl: 'https://img.icons8.com/color/96/purchase-order.png', bgColor: '#F0F8FF' },
        { text: '我的证书', iconUrl: 'https://img.icons8.com/color/96/best-seller.png', bgColor: '#FFFAF0' },
        { text: '我的考试', iconUrl: 'https://img.icons8.com/color/96/test-passed.png', bgColor: '#F0FFF4' }
      ],
      commonServices: [
        { text: '咨询服务单', iconUrl: 'https://img.icons8.com/fluency/48/customer-support.png', bgColor: '#FFF5F5', extra: '' },
        { text: '返现与提现', iconUrl: 'https://img.icons8.com/fluency/48/wallet.png', bgColor: '#F5F7FA', extra: '' },
        { text: '我的社群', iconUrl: 'https://img.icons8.com/fluency/48/conference-call.png', bgColor: '#F0F9FF', extra: '加入' }
      ],
      otherServices: [
        { text: '用户协议', iconUrl: 'https://img.icons8.com/ios-filled/50/607d8b/info.png' },
        { text: '关于我们', iconUrl: 'https://img.icons8.com/ios-filled/50/607d8b/help.png' },
        { text: '系统设置', iconUrl: 'https://img.icons8.com/ios-filled/50/607d8b/settings.png' }
      ]
    }
  },

  mounted() {
    const sysInfo = uni.getSystemInfoSync();
    if (sysInfo.statusBarHeight) {
      this.statusBarHeight = sysInfo.statusBarHeight;
    }
    
    this.getLocalUserInfo();
    this.fetchUserInfo();
  },
  
  methods: {
    getLocalUserInfo() {
      const token = uni.getStorageSync('token');
      const localUser = uni.getStorageSync('userInfo');
      const localIdentity = uni.getStorageSync('currentIdentity');
      
      if (token) this.token = token;
      if (localUser && JSON.stringify(localUser) !== '{}') {
        this.userInfo = {
          user_id: localUser.user_id || '',
          openid: localUser.openid || '',
          account: localUser.account || this.userInfo.account,
          nickname: localUser.nickname || this.userInfo.nickname,
          avatar: localUser.avatar || this.userInfo.avatar
        };
      }
      if (localIdentity) {
        this.currentIdentity = localIdentity;
      } else {
        this.currentIdentity = '学员端';
        uni.setStorageSync('currentIdentity', '学员端');
      }
    },

    async fetchUserInfo() {
      if (!this.token) return;
      
      uni.showLoading({ title: '加载中...', mask: true });
      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.userInfo}`,
          method: 'GET',
          header: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' }
        });
        
        if (res.statusCode === 200 && res.data.code === 200) {
          const data = res.data.data;
          this.userInfo = {
            user_id: data.userId || '', openid: data.openid || '', account: data.account || '',
            nickname: data.nickname || this.userInfo.nickname, avatar: data.avatar || this.userInfo.avatar
          };
          this.currentIdentity = data.currentIdentity || '学员端';
          if (data.statsList) this.statsList = data.statsList;
          
          uni.setStorageSync('userInfo', this.userInfo);
          uni.setStorageSync('currentIdentity', this.currentIdentity);
        } else {
          this.currentIdentity = '学员端';
          uni.setStorageSync('currentIdentity', '学员端');
        }
      } catch (error) {
        this.currentIdentity = '学员端';
        uni.setStorageSync('currentIdentity', '学员端');
      } finally {
        uni.hideLoading();
      }
    },
    
    toggleIdentityMenu() { 
      this.isIdentityOpen = !this.isIdentityOpen; 
    },
    
    closeIdentityMenu() { 
      if (this.isIdentityOpen) this.isIdentityOpen = false; 
    },
    
    goToEditProfile() {
      if (!this.token) return this.toLogin();
      uni.navigateTo({ url: '/pages/Mine/profile-edit' });
    },
    
    async switchIdentity(role) {
      if (this.currentIdentity === role.name) { 
        this.isIdentityOpen = false; 
        return; 
      }
      
      if (!this.token) return this.toLogin();
      uni.showLoading({ title: '切换中...', mask: true });
      
      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.switchIdentity}`,
          method: 'POST',
          header: { 'Authorization': `Bearer ${this.token}`, 'content-type': 'application/json' },
          data: { user_id: this.userInfo.user_id, identity: role.name }
        });
        
        if (res.statusCode === 200 && res.data.code === 200) {
          this.currentIdentity = res.data.data.currentIdentity || role.name;
          uni.setStorageSync('currentIdentity', this.currentIdentity);
          this.isIdentityOpen = false; 
          uni.hideLoading();
          uni.showToast({ title: `已切换为${role.name}`, icon: 'none' });
          
          const targetUrl = role.name === '志愿者端' ? '/pages/volunteer/index' : '/pages/Main/index';
          uni.reLaunch({ url: targetUrl });
        } else {
          uni.hideLoading(); 
          uni.showToast({ title: res.data.msg || '切换身份失败', icon: 'none' });
        }
      } catch (error) {
        uni.hideLoading(); 
        uni.showToast({ title: '网络连接异常', icon: 'none' });
      }
    },
    
    handleMenuClick(item) {
      if (!this.token) return this.toLogin();
      if (item.text === '我的课程') {
        uni.$emit('switchTab', 1);
      } else if (item.path) {
        uni.navigateTo({ url: item.path });
      } else {
        uni.showToast({ title: item.text, icon: 'none' });
      }
    },
    
    toLogin() {
      uni.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => { uni.reLaunch({ url: '/pages/Login/index' }); }, 1000);
    },
    
    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        confirmColor: '#e53e3e',
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '正在退出...', mask: true });
            try {
              await uni.request({
                url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.logout}`,
                method: 'POST',
                header: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' }
              });
            } catch (error) {} finally {
              uni.hideLoading();
              uni.removeStorageSync('token'); 
              uni.removeStorageSync('userInfo'); 
              uni.removeStorageSync('currentIdentity');
              uni.reLaunch({
                url: '/pages/Login/index',
                success: () => { 
                  setTimeout(() => { uni.showToast({ title: '已安全退出', icon: 'none' }); }, 100); 
                }
              });
            }
          }
        }
      });
    }
  }
}
</script>

<style scoped>
/* ==========================================
   1. 基础架构与背景
========================================== */
.mine-container {
  display: flex;
  flex-direction: column;
  background-color: #faf8f5; /* 暖宣纸底色 */
  position: relative;
  height: 100vh;
  overflow: hidden;
}

/* Layer 0: 红色背景层 */
.crimson-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 560rpx; /* 高度微微拉长，完美包裹顶层卡片 */
  background: linear-gradient(150deg, #9e2a2b 0%, #7a1212 100%);
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
  z-index: 0;
}

/* ==========================================
   2. 绝对固定区 (不参与滚动)
========================================== */
.fixed-top-zone {
  position: relative;
  z-index: 10;
  flex-shrink: 0; 
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx 30rpx;
}

.header-brand {
  display: flex;
  flex-direction: column;
}

.brand-en {
  font-size: 16rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 6rpx;
  margin-bottom: 4rpx;
  font-family: Arial, sans-serif;
}

.brand-cn {
  font-size: 36rpx;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 2rpx;
}

/* ==========================================
   ✨ 核心重构：通用卡片与玻璃态卡片
========================================== */
.floating-card {
  background: #ffffff;
  border-radius: 28rpx; 
  margin: 0 30rpx 24rpx; 
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.01);
  position: relative;
  transition: transform 0.2s ease;
}

/* 专为悬浮在红底上的卡片设计的玻璃态 */
.glass-card {
  background: rgba(255, 255, 255, 0.94); /* 微微透出红底，大幅度柔和视觉 */
  backdrop-filter: blur(20px); /* 强毛玻璃混色效果 */
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8); /* 模拟玻璃高光边缘 */
  box-shadow: 0 16rpx 40rpx rgba(122, 18, 18, 0.12); /* 阴影改成偏红色，彻底融入背景 */
}

/* ==========================================
   3. 第一层：个人主卡片
========================================== */
.profile-card {
  margin-top: 10rpx;
  padding: 32rpx 32rpx 24rpx; 
}

.profile-main {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar-wrapper {
  position: relative;
  margin-right: 28rpx;
}

.avatar-img {
  width: 100rpx; 
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06);
}

.status-dot {
  position: absolute;
  bottom: 0rpx;
  right: 0rpx;
  width: 22rpx;
  height: 22rpx;
  background-color: #22c55e;
  border: 4rpx solid #ffffff;
  border-radius: 50%;
}

.info-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.user-name {
  font-size: 34rpx; 
  font-weight: 900;
  color: #2d2424;
  letter-spacing: 2rpx;
}

.vip-icon {
  margin-left: 10rpx;
}

.account-row {
  margin-bottom: 10rpx;
}

.account-id {
  font-size: 22rpx;
  color: #a09a9a;
  font-family: monospace;
}

.identity-badge {
  display: flex;
  align-items: center;
  background: rgba(250, 248, 245, 0.8);
  padding: 4rpx 16rpx;
  border-radius: 30rpx;
  width: fit-content;
  border: 1px solid #f0ece6;
}

.badge-dot {
  width: 8rpx;
  height: 8rpx;
  background-color: #a31d1d;
  border-radius: 50%;
  margin-right: 8rpx;
}

.badge-text {
  font-size: 20rpx;
  color: #5d5555;
  font-weight: bold;
}

/* 切分线与切换身份栏 */
.divider {
  height: 1px;
  background-color: rgba(0,0,0,0.04);
  margin: 24rpx 0;
}

.identity-switch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.switch-label {
  font-size: 22rpx;
  color: #8c8686;
}

.switch-action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(163, 29, 29, 0.06);
  padding: 10rpx 20rpx;
  border-radius: 40rpx;
}

.switch-btn-text {
  color: #a31d1d;
  font-size: 22rpx;
  font-weight: bold;
}

/* 身份切换下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: 56rpx;
  right: 0;
  width: 220rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.08);
  border: 1px solid #f0ece6;
  padding: 10rpx;
  z-index: 100;
  animation: scaleIn 0.2s cubic-bezier(0.1, 0.7, 0.1, 1);
  transform-origin: top right;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  font-size: 26rpx;
  color: #4a4040;
  border-radius: 8rpx;
}

.dropdown-item:active {
  background-color: #faf8f5;
}

.active-role {
  color: #a31d1d;
  font-weight: 900;
}

/* ==========================================
   4. 第二层：核心数据统计 (固定区)
========================================== */
.stats-card {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 16rpx; 
  margin-bottom: 20rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  flex: 1;
}

.stat-num {
  font-size: 38rpx;
  font-weight: 900;
  color: #2d2424;
  font-family: 'DIN', sans-serif;
}

.stat-label {
  font-size: 22rpx;
  color: #8c8686;
}

/* ==========================================
   5. 核心滚动区 (仅下半部可滑)
========================================== */
.scroll-view {
  flex: 1;
  height: 0;
  position: relative;
  z-index: 2; 
}

.scroll-content-inner {
  padding: 10rpx 0 60rpx;
}

/* ==========================================
   6. 宫格与列表服务 (滚动区，非毛玻璃普通白卡)
========================================== */
.grid-card {
  padding: 28rpx;
}

.grid-container {
  display: flex;
  justify-content: space-between;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  flex: 1;
}

.grid-icon-box {
  width: 80rpx;
  height: 80rpx;
  border-radius: 24rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.15s;
}

.grid-item:active .grid-icon-box {
  transform: scale(0.9);
}

.grid-img {
  width: 44rpx;
  height: 44rpx;
}

.grid-text {
  font-size: 22rpx;
  color: #4a4040;
  font-weight: 600;
}

/* 列表区域样式 */
.list-card {
  padding: 28rpx 32rpx;
}

.section-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.title-decorator {
  width: 6rpx;
  height: 28rpx;
  background-color: #a31d1d;
  border-radius: 4rpx;
  margin-right: 14rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 900;
  color: #2d2424;
  letter-spacing: 2rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
}

.menu-item:not(:last-child) {
  border-bottom: 1px dashed #f0ece6;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.list-icon-box {
  width: 60rpx;
  height: 60rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.list-icon-img {
  width: 32rpx;
  height: 32rpx;
}

.menu-text {
  font-size: 26rpx;
  color: #2d2424;
  font-weight: 600;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-extra {
  font-size: 22rpx;
  color: #a09a9a;
}

/* 纯 CSS 绘制的小箭头 */
.pure-css-arrow {
  width: 12rpx;
  height: 12rpx;
  border-top: 3rpx solid #c0baba;
  border-right: 3rpx solid #c0baba;
  transform: rotate(45deg);
  margin-left: 8rpx;
}

/* ==========================================
   7. 退出按钮与底部
========================================== */
.logout-section {
  padding: 10rpx 30rpx 0;
}

.logout-btn {
  background: #ffffff;
  border-radius: 28rpx;
  height: 96rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.01);
  transition: all 0.2s;
}

.logout-btn-hover {
  transform: scale(0.98);
  background: #faf8f5;
}

.logout-text {
  color: #dc2626;
  font-size: 28rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
}

.footer-info {
  text-align: center;
  margin-top: 40rpx;
  color: #c0baba;
  font-size: 20rpx;
  letter-spacing: 2rpx;
}

.safe-area-spacer {
  height: 160rpx;
}

/* ==========================================
   8. 动画进场类
========================================== */
.fade-in-up { 
  opacity: 0; 
  animation: fadeInUp 0.5s cubic-bezier(0.1, 0.7, 0.1, 1) forwards; 
}
.delay-1 { animation-delay: 0.05s; }
.delay-2 { animation-delay: 0.1s; }
.delay-3 { animation-delay: 0.15s; }
.delay-4 { animation-delay: 0.2s; }
.delay-5 { animation-delay: 0.25s; }

@keyframes fadeInUp { 
  0% { opacity: 0; transform: translateY(30rpx); }
  100% { opacity: 1; transform: translateY(0); } 
}
</style>