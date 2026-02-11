<template>
  <view class="view-container">
    
    <view class="art-header">
      <view class="nav-bar">
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">致良知教育</text>
        </view>
        <uni-icons type="gear" size="24" color="rgba(255,255,255,0.8)"></uni-icons>
      </view>

      <view class="user-card-inner">
        <view class="card-glass-bg"></view>
        
        <view class="user-content-top">
          <view class="avatar-box" @tap="chooseAvatar">
             <image 
               class="avatar" 
               :src="userInfo.avatar" 
               mode="aspectFill"
             ></image>
             <view class="status-dot"></view>
          </view>
          
          <view class="info-box">
            <view class="nickname-row" @tap="chooseNickname">
              <text class="nickname">{{ userInfo.nickname }}</text>
              <uni-icons type="vip-filled" size="18" color="#FFD700" style="margin-left: 8rpx;"></uni-icons>
              <uni-icons type="compose" size="14" color="rgba(255,255,255,0.7)" style="margin-left: 6rpx;"></uni-icons>
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
              <uni-icons type="loop" size="12" color="rgba(255,255,255,0.9)"></uni-icons>
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

      <view class="footer-info">致良知教育 v1.3.0</view>
      <view class="safe-area-spacer-mini"></view>

    </scroll-view>

    <!-- 底部导航栏 -->
    <view class="bottom-tabbar">
      <view class="tab-item" :class="{ active: activeTab === 0 }" @tap="goToHome">
        <image :src="activeTab === 0 ? 'https://img.icons8.com/fluency/96/home.png' : 'https://img.icons8.com/ios/96/home.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">志愿首页</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 1 }" @tap="goToExcellent">
        <image :src="activeTab === 1 ? 'https://img.icons8.com/fluency/96/star.png' : 'https://img.icons8.com/ios/96/star.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">优秀作业</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 2 }" @tap="goToStats">
        <image :src="activeTab === 2 ? 'https://img.icons8.com/fluency/96/bar-chart.png' : 'https://img.icons8.com/ios/96/bar-chart.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">志愿统计</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 3 }" @tap="goToProfile">
        <image :src="activeTab === 3 ? 'https://img.icons8.com/fluency/96/user.png' : 'https://img.icons8.com/ios/96/user.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">个人中心</text>
      </view>
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config';

export default {
  name: 'MineView',
  
  data() {
    return {
      userInfo: { 
        nickname: 'Mystery', 
        avatar: 'https://img.icons8.com/color/96/person-male.png' 
      },
      token: '', 
      isIdentityOpen: false,
      currentIdentity: '志愿者端',
      identityOptions: [
        { name: '学员端' }, 
        { name: '志愿者端' }, 
      ],
      statsList: [
        { label: '等级', value: '0.00' }, 
        { label: '朋友', value: '2' },
        { label: '积分', value: '1.2k' }, 
        { label: '学时', value: '45h' }
      ],
      activeTab: 3, 
      tabBarList: [
        {
          text: '志愿首页',
          normalIcon: 'https://img.icons8.com/ios/96/home.png',
          selectedIcon: 'https://img.icons8.com/fluency/96/home.png'
        },
        {
          text: '优秀作业',
          normalIcon: 'https://img.icons8.com/ios/96/star.png',
          selectedIcon: 'https://img.icons8.com/fluency/96/star.png'
        },
        {
          text: '志愿统计',
          normalIcon: 'https://img.icons8.com/ios/96/bar-chart.png',
          selectedIcon: 'https://img.icons8.com/fluency/96/bar-chart.png'
        },
        {
          text: '个人中心',
          normalIcon: 'https://img.icons8.com/ios/50/bfbfbf/user--v1.png',
          selectedIcon: 'https://img.icons8.com/ios-filled/50/9e2a2b/user.png'
        }
      ]
    }
  },

  mounted() {
    this.getLocalUserInfo();
    this.fetchUserInfo();
  },
  
  methods: {
    getLocalUserInfo() {
      const token = uni.getStorageSync('token');
      const localUser = uni.getStorageSync('userInfo');
      if (token) {
        this.token = token;
      }
      if (localUser && JSON.stringify(localUser) !== '{}') {
        this.userInfo = {
          nickname: localUser.nickname || this.userInfo.nickname,
          avatar: localUser.avatar || this.userInfo.avatar
        };
      }
    },

    async fetchUserInfo() {
      if (!this.token) return;
      
      uni.showLoading({ title: '加载中...', mask: true });
      
      try {
        const res = await uni.request({
          url: API_CONFIG.baseUrl + API_CONFIG.paths.userInfo,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        
        if (res.statusCode === 200 && res.data.code === 0) {
          const data = res.data.data;
          this.userInfo = {
            nickname: data.nickname || this.userInfo.nickname,
            avatar: data.avatar || this.userInfo.avatar
          };
          this.currentIdentity = data.currentIdentity || this.currentIdentity;
          this.identityOptions = data.identityOptions || this.identityOptions;
          if (data.statsList) {
            this.statsList = data.statsList;
          }
          uni.setStorageSync('userInfo', this.userInfo);
        }
      } catch (error) {
        console.error('获取个人信息失败:', error);
      } finally {
        uni.hideLoading();
      }
    },
    
    async chooseAvatar() {
      try {
        const { avatarUrl } = await uni.chooseAvatar({});
        if (avatarUrl) {
          this.userInfo.avatar = avatarUrl;
          await this.updateUserInfo();
          return;
        }
      } catch (e) {
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: async (res) => {
            this.userInfo.avatar = res.tempFilePaths[0];
            await this.updateUserInfo();
          }
        });
      }
    },

    async chooseNickname() {
      try {
        const { nickName } = await uni.getNickname({});
        if (nickName && nickName.trim()) {
          this.userInfo.nickname = nickName.trim();
          await this.updateUserInfo();
          return;
        }
      } catch (e) {
        uni.showModal({
          title: '编辑昵称',
          placeholderText: '请输入你的昵称',
          editable: true,
          inputValue: this.userInfo.nickname,
          success: async (res) => {
            if (res.confirm && res.content && res.content.trim()) {
              this.userInfo.nickname = res.content.trim();
              await this.updateUserInfo();
            }
          }
        });
      }
    },

    async updateUserInfo() {
      if (!this.token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/Login/index' });
        }, 1000);
        return;
      }
      
      uni.showLoading({ title: '保存中...', mask: true });
      
      try {
        uni.setStorageSync('userInfo', this.userInfo);
        
        const res = await uni.request({
          url: API_CONFIG.baseUrl + API_CONFIG.paths.updateUserInfo,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'content-type': 'application/json'
          },
          data: {
            nickname: this.userInfo.nickname,
            avatar: this.userInfo.avatar
          }
        });
        
        if (res.statusCode === 200 && res.data.code === 0) {
          uni.showToast({ title: '修改成功', icon: 'success', duration: 1500 });
        } else {
          uni.showToast({ title: res.data.msg || '修改失败', icon: 'none' });
        }
      } catch (error) {
        console.error('更新用户信息失败:', error);
        uni.showToast({ title: '网络异常，修改失败', icon: 'none' });
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
    
    async switchIdentity(role) {
      if (!this.token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      
      uni.showLoading({ title: '切换中...', mask: true });
      
      try {
        const res = await uni.request({
          url: API_CONFIG.baseUrl + API_CONFIG.paths.switchIdentity,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`
          },
          data: {
            identity: role.name
          }
        });
        
        if (res.statusCode === 200 && res.data.code === 0) {
          const data = res.data.data;
          this.currentIdentity = data.currentIdentity || role.name;
          this.isIdentityOpen = false;
          uni.showToast({ 
            title: `已切换为${role.name}`, 
            icon: 'none' 
          });
        } else {
          uni.showToast({ 
            title: res.data.msg || '切换身份失败', 
            icon: 'none' 
          });
        }
      } catch (error) {
        console.error('切换身份失败:', error);
        uni.showToast({ 
          title: '网络连接异常', 
          icon: 'none' 
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    handleMenuClick(item) {
      if (item.text === '我的课程') {
        this.goToExcellent();
      } else {
        uni.showToast({ 
          title: item.text, 
          icon: 'none' 
        });
      }
    },

    goToHome() {
      this.activeTab = 0;
      uni.reLaunch({ url: '/pages/volunteer/index' });
    },
    goToExcellent() {
      this.activeTab = 1;
      uni.reLaunch({ url: '/pages/volunteer/homework/excellent' });
    },
    goToStats() {
      this.activeTab = 2;
      uni.reLaunch({ url: '/pages/volunteer/homework/stats' });
    },
    goToProfile() {
      this.activeTab = 3;
      uni.showToast({ title: '已在个人中心', icon: 'none', duration: 1000 });
    }
  }
}
</script>

<style scoped>
/* 核心布局样式 */
.view-container { 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  background-color: #F4F5F7; 
}

/* 顶部头部区域 */
.art-header { 
  background: linear-gradient(160deg, #A31D1D 0%, #851212 100%); 
  padding: 100rpx 30rpx 40rpx; 
  border-bottom-left-radius: 48rpx; 
  border-bottom-right-radius: 48rpx; 
}

.nav-bar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 30rpx; 
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

/* 用户卡片样式 */
.user-card-inner { 
  position: relative; 
  border-radius: 36rpx; 
  padding: 36rpx 32rpx; 
  box-shadow: 0 20rpx 40rpx rgba(60, 10, 10, 0.3); 
}

.card-glass-bg { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(255,255,255,0.08); 
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.15); 
  border-top: 1px solid rgba(255,255,255,0.3);
  border-radius: 36rpx; 
  z-index: 0; 
  pointer-events: none; 
}

.user-content-top {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

/* 头像区域 */
.avatar-box {
  position: relative;
  margin-right: 28rpx;
  cursor: pointer;
}

.avatar { 
  width: 110rpx; 
  height: 110rpx; 
  border-radius: 50%; 
  border: 4rpx solid rgba(255,255,255,0.9); 
}

.status-dot {
  position: absolute;
  bottom: 6rpx;
  right: 6rpx;
  width: 20rpx;
  height: 20rpx;
  background-color: #4CAF50;
  border: 3rpx solid #7D1A1A;
  border-radius: 50%;
}

/* 用户信息区域 */
.info-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.nickname-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  cursor: pointer;
}

.nickname { 
  font-size: 38rpx; 
  font-weight: 700; 
  color: #fff; 
  letter-spacing: 1rpx;
}

.identity-display {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.2);
  padding: 6rpx 16rpx;
  border-radius: 100rpx;
  width: fit-content;
}

.id-label { font-size: 20rpx; color: rgba(255,255,255,0.7); }
.id-separator { width: 1px; height: 16rpx; background: rgba(255,255,255,0.3); margin: 0 10rpx; }
.id-value { font-size: 22rpx; color: #fff; font-weight: 500; }

/* 切换身份区域 */
.action-box {
  position: relative;
  height: 110rpx;
  display: flex;
  align-items: center;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10rpx 20rpx;
  border-radius: 100rpx;
}

.switch-text {
  color: #fff;
  font-size: 22rpx;
}

.identity-dropdown { 
  position: absolute; 
  top: 80rpx; 
  right: 0; 
  width: 220rpx; 
  background: #fff; 
  border-radius: 16rpx; 
  box-shadow: 0 12rpx 36rpx rgba(0,0,0,0.15); 
  padding: 10rpx; 
  z-index: 999; 
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(-10rpx); } 
  to { opacity: 1; transform: translateY(0); } 
}

.dropdown-item { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 18rpx 20rpx; 
  font-size: 26rpx; 
  color: #333; 
  border-radius: 8rpx;
}

.dropdown-item:active { background-color: #F5F7FA; }
.active-role { color: #A31D1D; font-weight: bold; }

/* 统计数据区域 */
.stats-grid { 
  position: relative; 
  z-index: 1; 
  display: flex; 
  justify-content: space-between; 
  padding-top: 24rpx; 
  border-top: 1px solid rgba(255,255,255,0.15); 
}

.stat-item { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 6rpx; 
  flex: 1;
}

.stat-num { 
  font-size: 34rpx; 
  font-weight: bold; 
  color: #fff; 
  font-family: 'DIN', sans-serif; 
}

.stat-label { 
  font-size: 22rpx; 
  color: rgba(255,255,255,0.8); 
}

/* 滚动内容区域 */
.scroll-content { flex: 1; height: 0; }

.fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; transform: translateY(20rpx); }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

/* 底部信息 */
.footer-info { text-align: center; margin-top: 30rpx; color: #ccc; font-size: 22rpx; }
.safe-area-spacer-mini { height: 20rpx; }

/* 底部导航栏 */
.bottom-tabbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
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
  min-height: 100rpx;
}

.tab-icon { width: 48rpx; height: 48rpx; }
.tab-text { font-size: 22rpx; color: #666; }

.tab-item.active .tab-text { color: #A31D1D; }
.tab-item.active .tab-icon {
  filter: brightness(0) saturate(100%) invert(14%) sepia(88%) saturate(3841%) hue-rotate(356deg) brightness(90%) contrast(101%);
}
</style>