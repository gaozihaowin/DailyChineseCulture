<template>
  <view class="view-container">
    
    <view class="art-header">
      <view class="nav-bar">
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">致良知教育</text>
        </view>
      </view>

      <view class="user-card-inner">
        <view class="card-glass-bg"></view>
        
        <view class="user-content-top">
          
          <view class="avatar-box">
             <image 
               class="avatar" 
               :src="userInfo.avatar" 
               mode="aspectFill"
             ></image>
             <view class="status-dot"></view>
          </view>
          
          <view class="info-box">
            <view class="nickname-row">
              <text class="nickname">{{ userInfo.nickname }}</text>
            </view>
            
            <view class="identity-display">
              <text class="id-label">当前身份</text>
              <view class="id-separator"></view>
              <text class="id-value">{{ currentIdentity }}</text>
            </view>
          </view>
          
          <view class="action-box">
            <view class="switch-btn" @tap.stop="toggleIdentityMenu">
              <text class="switch-text">切换身份</text>
              <uni-icons type="loop" size="14" color="rgba(255,255,255,0.9)"></uni-icons>
            </view>
            
            <view class="identity-dropdown" v-if="isIdentityOpen">
              <view 
                class="dropdown-item" 
                v-for="(role, index) in identityOptions" 
                :key="index" 
                @tap.stop="switchIdentity(role)"
              >
                <text :class="{ 'active-role': currentIdentity === role.name }">
                  {{ role.name }}
                </text>
                <uni-icons 
                  v-if="currentIdentity === role.name" 
                  type="checkmarkempty" 
                  size="16" 
                  color="#A31D1D"
                ></uni-icons>
              </view>
            </view>
          </view>

        </view>

        <view class="stats-grid">
          <view class="stat-item" v-for="(item, index) in statsList" :key="index">
            <text class="stat-num">{{ item.value }}</text>
            <text class="stat-label">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" @tap="closeIdentityMenu">
      
      <view class="section-box fade-in-up">
        <view class="grid-container">
          <view 
            class="grid-item" 
            v-for="(item, index) in coreServices" 
            :key="index"
            @tap="handleMenuClick(item)"
          >
            <view class="grid-icon-box" :style="{ backgroundColor: item.bgColor }">
              <image :src="item.iconPath" class="grid-img" mode="aspectFit"></image>
            </view>
            <text class="grid-text">{{ item.text }}</text>
          </view>
        </view>
      </view>

      <view class="section-box fade-in-up delay-1">
        <view class="section-title-row">
          <text class="section-title">常用服务</text>
        </view>
        <view 
          class="menu-item" 
          v-for="(item, index) in commonServices" 
          :key="index" 
          @tap="handleMenuClick(item)"
        >
          <view class="menu-left">
            <view class="list-icon-box" :style="{ backgroundColor: item.lightColor }">
                <image :src="item.iconPath" class="list-icon-img" mode="aspectFit"></image>
            </view>
            <text class="menu-text">{{ item.text }}</text>
          </view>
          <view class="menu-right">
             <text class="menu-extra" v-if="item.extra">{{ item.extra }}</text>
             <uni-icons type="right" size="14" color="#ddd"></uni-icons>
          </view>
        </view>
      </view>

      <view class="section-box fade-in-up delay-2">
        <view 
          class="menu-item" 
          v-for="(item, index) in otherServices" 
          :key="index" 
          @tap="handleMenuClick(item)"
        >
          <view class="menu-left">
            <view class="list-icon-box" style="background-color: #F5F7FA;">
               <uni-icons :type="item.icon" size="20" color="#607D8B"></uni-icons>
            </view>
            <text class="menu-text">{{ item.text }}</text>
          </view>
          <view class="menu-right">
             <uni-icons type="right" size="14" color="#ddd"></uni-icons>
          </view>
        </view>
      </view>

      <view class="footer-info">致良知教育 v1.3.0</view>
      <view class="safe-area-spacer"></view>

    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'MineView',
  
  data() {
    return {
      userInfo: { 
        nickname: 'Mystery', 
        avatar: '/static/logo.png' 
      },
      
      isIdentityOpen: false,
      currentIdentity: '学员端',
      identityOptions: [
        { name: '学员端' }, 
        { name: '讲师端' }, 
        { name: '访客端' }
      ],
      
      statsList: [
        { label: '余额', value: '0.00' }, 
        { label: '优惠券', value: '2' },
        { label: '积分', value: '1.2k' }, 
        { label: '学时', value: '45h' }
      ],

      coreServices: [
        { text: '我的课程', iconPath: '/static/icons/course.png', bgColor: '#E3F2FD' },
        { text: '我的订单', iconPath: '/static/icons/order.png',  bgColor: '#FFF3E0' },
        { text: '我的证书', iconPath: '/static/icons/cert.png',   bgColor: '#F3E5F5' },
        { text: '我的考试', iconPath: '/static/icons/exam.png',   bgColor: '#E8F5E9' }
      ],

      commonServices: [
        { text: '咨询服务单', iconPath: '/static/icons/service.png', lightColor: '#FBE9E7', extra: '' },
        { text: '返现与提现', iconPath: '/static/icons/wallet.png',  lightColor: '#E8EAF6', extra: '' },
        { text: '我的社群',   iconPath: '/static/icons/team.png',    lightColor: '#E0F2F1', extra: '加入' }
      ],

      otherServices: [
        { text: '用户协议', icon: 'info' },
        { text: '关于我们', icon: 'help' },
        { text: '设置',     icon: 'gear-filled' }
      ]
    }
  },

  methods: {
    toggleIdentityMenu() { 
      this.isIdentityOpen = !this.isIdentityOpen; 
    },
    
    closeIdentityMenu() { 
      if (this.isIdentityOpen) this.isIdentityOpen = false; 
    },
    
    switchIdentity(role) {
      this.currentIdentity = role.name;
      this.isIdentityOpen = false;
      uni.showToast({ 
        title: `已切换为${role.name}`, 
        icon: 'none' 
      });
    },
    
    handleMenuClick(item) {
      uni.showToast({ 
        title: item.text, 
        icon: 'none' 
      });
    }
  }
}
</script>

<style scoped>
/* ==================
   Layout & Header
   ================== */
.view-container { 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  background-color: #F4F5F7; 
}

.art-header { 
  background: linear-gradient(160deg, #A31D1D 0%, #680E0E 100%); 
  padding: 100rpx 30rpx 40rpx; 
  border-bottom-left-radius: 48rpx; 
  border-bottom-right-radius: 48rpx; 
}

.nav-bar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 24rpx; 
  padding: 0 10rpx; 
}

.brand-en { 
  font-size: 18rpx; 
  color: rgba(255,255,255,0.5); 
  letter-spacing: 4rpx; 
  display: block; 
  margin-bottom: 4rpx; 
}

.brand-cn { 
  font-size: 36rpx; 
  font-weight: bold; 
  color: #fff; 
  letter-spacing: 2rpx; 
}

/* ==================
   User Card (Modernized)
   ================== */
.user-card-inner { 
  position: relative; 
  border-radius: 36rpx; 
  padding: 36rpx 32rpx; 
  box-shadow: 0 16rpx 40rpx rgba(50, 10, 10, 0.25); 
}

.card-glass-bg { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(255,255,255,0.06); 
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12); 
  border-top: 1px solid rgba(255,255,255,0.25);
  border-radius: 36rpx; 
  z-index: 0; 
  pointer-events: none; 
}

/* --- Top Section Layout --- */
.user-content-top {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  margin-bottom: 48rpx; /* Increased space for clean look */
}

/* Avatar Box */
.avatar-box {
  position: relative;
  margin-right: 28rpx;
}

.avatar { 
  width: 110rpx; 
  height: 110rpx; 
  border-radius: 50%; 
  border: 4rpx solid rgba(255,255,255,0.8); 
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
}

.status-dot {
  position: absolute;
  bottom: 6rpx;
  right: 6rpx;
  width: 20rpx;
  height: 20rpx;
  background-color: #4CAF50;
  border: 3rpx solid #7D1A1A; /* Matches typical bg color there */
  border-radius: 50%;
}

/* Info Box */
.info-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 10rpx;
}

.nickname { 
  font-size: 38rpx; 
  font-weight: 700; 
  color: #fff; 
  margin-bottom: 10rpx;
  letter-spacing: 1rpx;
}

/* Modern Identity Display Style */
.identity-display {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.15);
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  width: fit-content;
}

.id-label {
  font-size: 20rpx;
  color: rgba(255,255,255,0.6);
}

.id-separator {
  width: 1px;
  height: 16rpx;
  background: rgba(255,255,255,0.3);
  margin: 0 10rpx;
}

.id-value {
  font-size: 22rpx;
  color: rgba(255,255,255,0.95);
  font-weight: 500;
}

/* --- Right Action Box (Switch Button) --- */
.action-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  height: 110rpx; /* Match avatar height for vertical alignment */
  position: relative;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12rpx 24rpx; /* Larger padding */
  border-radius: 100rpx;
  transition: all 0.2s ease;
}

.switch-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.98);
}

.switch-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: 500;
}

/* Dropdown Menu */
.identity-dropdown { 
  position: absolute; 
  top: 90rpx; /* Push down below button */
  right: 0; 
  width: 240rpx; 
  background: #fff; 
  border-radius: 20rpx; 
  box-shadow: 0 12rpx 36rpx rgba(0,0,0,0.2); 
  padding: 12rpx; 
  z-index: 999; 
  animation: fadeIn 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0,0,0,0.05);
}

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(-10rpx) scale(0.95); } 
  to { opacity: 1; transform: translateY(0) scale(1); } 
}

.dropdown-item { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 20rpx 24rpx; 
  font-size: 28rpx; 
  color: #444; 
  border-radius: 12rpx;
  margin-bottom: 4rpx;
}

.dropdown-item:active { 
  background-color: #F5F7FA; 
}

.active-role { 
  color: #A31D1D; 
  font-weight: bold; 
}

/* --- Stats Section --- */
.stats-grid { 
  position: relative; 
  z-index: 1; 
  display: flex; 
  justify-content: space-between; 
  padding-top: 32rpx; 
  border-top: 1px solid rgba(255,255,255,0.12); 
}

.stat-item { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 8rpx; 
  flex: 1;
}

.stat-num { 
  font-size: 36rpx; 
  font-weight: bold; 
  color: #fff; 
  font-family: 'DIN Alternate', sans-serif; /* Modern font hint */
}

.stat-label { 
  font-size: 22rpx; 
  color: rgba(255,255,255,0.7); 
}

/* ==================
   Content Area
   ================== */
.scroll-content { 
  flex: 1; 
  height: 0; 
}

.fade-in-up { 
  animation: fadeInUp 0.5s ease-out forwards; 
  opacity: 0; 
  transform: translateY(20rpx); 
}

@keyframes fadeInUp { 
  to { opacity: 1; transform: translateY(0); } 
}

.section-box { 
  background: #fff; 
  margin: 30rpx; 
  border-radius: 24rpx; 
  padding: 30rpx; 
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03); 
}

/* ==================
   Grid & List
   ================== */
.grid-container { 
  display: flex; 
  justify-content: space-between; 
}

.grid-item { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 16rpx; 
  flex: 1; 
}

.grid-icon-box { 
  width: 96rpx; 
  height: 96rpx; 
  border-radius: 32rpx; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
}

.grid-img { 
  width: 56rpx; 
  height: 56rpx; 
}

.grid-text { 
  font-size: 24rpx; 
  color: #333; 
  font-weight: 500; 
}

/* List Menu */
.section-title-row { 
  margin-bottom: 20rpx; 
}

.section-title { 
  font-size: 30rpx; 
  font-weight: bold; 
  color: #333; 
}

.menu-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 28rpx 0; 
}

.menu-item:not(:last-child) { 
  border-bottom: 1px solid #f9f9f9; 
}

.menu-left { 
  display: flex; 
  align-items: center; 
  gap: 24rpx; 
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
  width: 40rpx; 
  height: 40rpx; 
}

.menu-text { 
  font-size: 28rpx; 
  color: #333; 
  font-weight: 500; 
}

.menu-right { 
  display: flex; 
  align-items: center; 
  gap: 10rpx; 
}

.menu-extra { 
  font-size: 22rpx; 
  color: #999; 
}

.footer-info { 
  text-align: center; 
  margin-top: 30rpx; 
  color: #ccc; 
  font-size: 22rpx; 
}

.safe-area-spacer { 
  height: 160rpx; 
}
</style>