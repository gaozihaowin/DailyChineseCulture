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
      
      <view class="section-box fade-in-up">
        <view class="grid-container">
          <view 
            class="grid-item" 
            v-for="(item, index) in coreServices" 
            :key="index"
            @tap="handleMenuClick(item)"
          >
            <view class="grid-icon-box" :style="{ backgroundColor: item.bgColor }">
              <image :src="item.iconUrl" class="grid-img" mode="aspectFit"></image>
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
            <view class="list-icon-box" :style="{ backgroundColor: item.bgColor }">
                <image :src="item.iconUrl" class="list-icon-img" mode="aspectFit"></image>
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
            <view class="list-icon-box" style="background-color: #F7F8FA;">
               <image :src="item.iconUrl" class="list-icon-img" mode="aspectFit" style="opacity: 0.7;"></image>
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
import { API_CONFIG } from '../../api/config';

export default {
  name: 'MineView',
  
  data() {
    return {
      userInfo: { 
        nickname: 'Mystery', 
        avatar: 'https://img.icons8.com/color/96/person-male.png',
        user_id: '',
        openid: ''
      },
      token: '', 
      isIdentityOpen: false,
      currentIdentity: '学员端',
      identityOptions: [
        { name: '学员端' }, 
        { name: '志愿者端' }
      ],
      statsList: [
        { label: '等级', value: '0.00' }, 
        { label: '朋友', value: '2' },
        { label: '积分', value: '1.2k' }, 
        { label: '学时', value: '45h' }
      ],
      coreServices: [
        { 
          text: '我的课程', 
          iconUrl: 'https://img.icons8.com/color/96/books.png', 
          bgColor: '#FFF0F0' 
        },
        { 
          text: '我的订单', 
          iconUrl: 'https://img.icons8.com/color/96/purchase-order.png',  
          bgColor: '#F0F8FF' 
        },
        { 
          text: '我的证书', 
          iconUrl: 'https://img.icons8.com/color/96/best-seller.png',   
          bgColor: '#FFFAF0' 
        },
        { 
          text: '我的考试', 
          iconUrl: 'https://img.icons8.com/color/96/test-passed.png',   
          bgColor: '#F0FFF4' 
        }
      ],
      commonServices: [
        { 
          text: '咨询服务单', 
          iconUrl: 'https://img.icons8.com/fluency/48/customer-support.png', 
          bgColor: '#FFF5F5', 
          extra: '' 
        },
        { 
          text: '返现与提现', 
          iconUrl: 'https://img.icons8.com/fluency/48/wallet.png',  
          bgColor: '#F5F7FA', 
          extra: '' 
        },
        { 
          text: '我的社群',   
          iconUrl: 'https://img.icons8.com/fluency/48/conference-call.png',    
          bgColor: '#F0F9FF', 
          extra: '加入' 
        }
      ],
      otherServices: [
        { 
          text: '用户协议', 
          iconUrl: 'https://img.icons8.com/ios-filled/50/607d8b/info.png' 
        },
        { 
          text: '关于我们', 
          iconUrl: 'https://img.icons8.com/ios-filled/50/607d8b/help.png' 
        },
        { 
          text: '系统设置',     
          iconUrl: 'https://img.icons8.com/ios-filled/50/607d8b/settings.png' 
        }
      ]
    }
  },

  mounted() {
    // 优先从本地缓存获取token和用户信息
    this.getLocalUserInfo();
    // 加载远程个人信息
    this.fetchUserInfo();
  },
  
  methods: {
    /**
     * 从本地缓存获取token和用户信息
     */
    getLocalUserInfo() {
      const token = uni.getStorageSync('token');
      const localUser = uni.getStorageSync('userInfo');
      const localIdentity = uni.getStorageSync('currentIdentity');
      
      if (token) {
        this.token = token;
      }
      if (localUser && JSON.stringify(localUser) !== '{}') {
        this.userInfo = {
          user_id: localUser.user_id || '',
          openid: localUser.openid || '',
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

    /**
     * 从API获取个人信息
     */
    async fetchUserInfo() {
      // 无token时跳转到登录页
      if (!this.token) {
        this.toLogin();
        return;
      }
      
      uni.showLoading({ title: '加载中...', mask: true });
      
      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.userInfo}`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.statusCode === 200 && res.data.code === 200) {
          const data = res.data.data;
          this.userInfo = {
            user_id: data.userId || '',
            openid: data.openid || '',
            nickname: data.nickname || this.userInfo.nickname,
            avatar: data.avatar || this.userInfo.avatar
          };
          this.currentIdentity = data.currentIdentity || '学员端';
          if (data.statsList) {
            this.statsList = data.statsList;
          }
          uni.setStorageSync('userInfo', this.userInfo);
          uni.setStorageSync('currentIdentity', this.currentIdentity);
        } else {
          console.error('获取个人信息失败:', res.data.msg);
          this.currentIdentity = '学员端';
          uni.setStorageSync('currentIdentity', '学员端');
        }
      } catch (error) {
        console.error('获取个人信息失败:', error);
        this.currentIdentity = '学员端';
        uni.setStorageSync('currentIdentity', '学员端');
      } finally {
        uni.hideLoading();
      }
    },
    
    /**
     * 选择头像
     */
    async chooseAvatar() {
      if (!this.token) {
        this.toLogin();
        return;
      }
      
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

    /**
     * 选择/编辑昵称
     */
    async chooseNickname() {
      if (!this.token) {
        this.toLogin();
        return;
      }
      
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

    /**
     * 更新用户信息
     */
    async updateUserInfo() {
      if (!this.token) {
        this.toLogin();
        return;
      }
      
      uni.showLoading({ title: '保存中...', mask: true });
      
      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.updateUserInfo}`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'content-type': 'application/json'
          },
          data: {
            user_id: this.userInfo.user_id,
            nickname: this.userInfo.nickname,
            avatar: this.userInfo.avatar,
            openid: this.userInfo.openid,
            identity: this.currentIdentity
          }
        });
        
        if (res.statusCode === 200 && res.data.code === 200) {
          uni.setStorageSync('userInfo', this.userInfo);
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
    
    /**
     * 展开/收起身份切换菜单
     */
    toggleIdentityMenu() { 
      this.isIdentityOpen = !this.isIdentityOpen; 
    },
    
    /**
     * 点击空白处关闭身份切换菜单
     */
    closeIdentityMenu() { 
      if (this.isIdentityOpen) this.isIdentityOpen = false; 
    },
    
    /**
     * 切换身份：学员端志愿者端
     */
    async switchIdentity(role) {
      if (this.currentIdentity === role.name) {
        this.isIdentityOpen = false;
        return;
      }
      
      if (!this.token) {
        this.toLogin();
        return;
      }
      
      uni.showLoading({ title: '切换中...', mask: true });
      
      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.switchIdentity}`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'content-type': 'application/json'
          },
          data: {
            user_id: this.userInfo.user_id,
            identity: role.name
          }
        });
        
        if (res.statusCode === 200 && res.data.code === 200) {
          const data = res.data.data;
          this.currentIdentity = data.currentIdentity || role.name;
          uni.setStorageSync('currentIdentity', this.currentIdentity);
          this.isIdentityOpen = false;
          uni.hideLoading();
          uni.showToast({ title: `已切换为${role.name}`, icon: 'none' });

          const targetUrl = role.name === '志愿者端' 
            ? '/pages/volunteer/index' 
            : '/pages/Main/index';
          uni.reLaunch({ url: targetUrl });
        } else {
          uni.hideLoading();
          uni.showToast({ title: res.data.msg || '切换身份失败', icon: 'none' });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('切换身份失败:', error);
        uni.showToast({ title: '网络连接异常', icon: 'none' });
      }
    },
    
    /**
     * 通用菜单点击事件
     */
    handleMenuClick(item) {
      if (!this.token) {
        this.toLogin();
        return;
      }
      
      if (item.text === '我的课程') {
        uni.$emit('switchTab', 1);
      } else if (item.path) {
        uni.navigateTo({ url: item.path });
      } else {
        uni.showToast({ title: item.text, icon: 'none' });
      }
    },
    
    /**
     * 未登录时跳转到登录页
     */
    toLogin() {
      uni.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/Login/index' });
      }, 1000);
    }
  }
}
</script>

<style scoped>
.nickname-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  cursor: pointer;
}
.avatar-box {
  position: relative;
  margin-right: 28rpx;
  cursor: pointer;
}
.view-container { 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  background-color: #F4F5F7; 
}
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
.info-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
.scroll-content { flex: 1; height: 0; }
.fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; transform: translateY(20rpx); }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
.section-box { 
  background: #fff; 
  margin: 30rpx; 
  border-radius: 24rpx; 
  padding: 30rpx; 
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02); 
}
.grid-container { display: flex; justify-content: space-between; }
.grid-item { display: flex; flex-direction: column; align-items: center; gap: 16rpx; flex: 1; }
.grid-icon-box { 
  width: 100rpx; 
  height: 100rpx; 
  border-radius: 32rpx; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  transition: transform 0.1s;
}
.grid-item:active .grid-icon-box { transform: scale(0.95); }
.grid-img { 
  width: 60rpx; 
  height: 60rpx; 
}
.grid-text { font-size: 24rpx; color: #333; font-weight: 500; }
.section-title-row { margin-bottom: 24rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; }
.menu-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 26rpx 0; 
}
.menu-item:not(:last-child) { border-bottom: 1px solid #f9f9f9; }
.menu-left { display: flex; align-items: center; gap: 24rpx; }
.list-icon-box { 
  width: 64rpx; 
  height: 64rpx; 
  border-radius: 18rpx; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
}
.list-icon-img { width: 40rpx; height: 40rpx; }
.menu-text { font-size: 28rpx; color: #333; font-weight: 400; }
.menu-right { display: flex; align-items: center; gap: 10rpx; }
.menu-extra { font-size: 24rpx; color: #999; }
.footer-info { text-align: center; margin-top: 30rpx; color: #ccc; font-size: 22rpx; }
.safe-area-spacer { height: 160rpx; }
</style>