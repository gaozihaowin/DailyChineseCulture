<template>
  <view class="view-container">
    <view class="art-header">
      <view class="nav-bar">
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">个人中心</text>
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
              <uni-icons type="compose" size="14" color="rgba(255,255,255,0.7)" style="margin-left: 6rpx;"></uni-icons>
            </view>
            
            <view class="identity-display">
              <text class="id-label">当前身份</text>
              <view class="id-separator"></view>
              <text class="id-value">超级管理员</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <view class="section-box fade-in-up">
        <view 
          class="menu-item" 
          v-for="(item, index) in otherServices" 
          :key="index" 
          @tap="item.text === '退出登录' ? logout() : handleMenuClick(item)"
        >
          <view class="menu-left">
            <view class="list-icon-box" style="background-color: #F7F8FA;">
               <image :src="item.iconUrl" class="list-icon-img" mode="aspectFit" style="opacity: 0.7;"></image>
            </view>
            <text class="menu-text" :style="{ color: item.text === '退出登录' ? '#FF4757' : '#333' }">{{ item.text }}</text>
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
  name: 'AdminMine',
  data() {
    return {
      userInfo: { 
        nickname: '超级管理员', 
        avatar: 'https://img.icons8.com/color/96/person-male.png',
        user_id: '',
        openid: ''
      },
      token: '',
      otherServices: [
        { 
          text: '用户协议', 
          iconUrl: 'https://img.icons8.com/ios-filled/50/607d8b/info.png',
          path: '/pages/agreement/index'
        },
        { 
          text: '关于我们', 
          iconUrl: 'https://img.icons8.com/ios-filled/50/607d8b/help.png',
          path: '/pages/about/index'
        },
        { 
          text: '系统设置',     
          iconUrl: 'https://img.icons8.com/ios-filled/50/607d8b/settings.png',
          path: '/pages/setting/index'
        },
        { 
          text: '退出登录',     
          iconUrl: 'https://img.icons8.com/ios-filled/50/607d8b/logout-rounded.png',
          path: ''
        }
      ]
    };
  },

  mounted() {
    this.token = uni.getStorageSync('token') || '';
    if (!this.token) {
      this.toLogin();
      return;
    }
    this.getLocalUserInfo();
    this.fetchUserInfo();
  },

  methods: {
    /**
     * 从本地缓存获取用户信息
     */
    getLocalUserInfo() {
      const localUser = uni.getStorageSync('userInfo');
      if (localUser && JSON.stringify(localUser) !== '{}') {
        this.userInfo = { ...this.userInfo, ...localUser };
      }
    },

    /**
     * 从接口拉取用户信息
     */
    async fetchUserInfo() {
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
            ...this.userInfo,
            nickname: data.nickname || this.userInfo.nickname,
            avatar: data.avatar || this.userInfo.avatar,
            user_id: data.user_id || data.userId
          };
          uni.setStorageSync('userInfo', this.userInfo);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
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
          if (avatarUrl.startsWith('http')) {
            this.userInfo.avatar = avatarUrl;
            await this.updateUserInfo();
          } else {
            uni.showLoading({ title: '上传中...', mask: true });
            uni.uploadFile({
              url: API_CONFIG.baseUrl + API_CONFIG.paths.upload + '?type=avatar',
              filePath: avatarUrl,
              name: 'file',
              header: {
                'Authorization': 'Bearer ' + this.token
              },
              success: (uploadRes) => {
                uni.hideLoading();
                try {
                  const data = JSON.parse(uploadRes.data);
                  if (data.code === 200) {
                    this.userInfo.avatar = data.data;
                    this.updateUserInfo();
                  } else {
                    uni.showToast({ title: data.msg || '上传失败', icon: 'none' });
                  }
                } catch (e) {
                  uni.showToast({ title: '解析失败，请重试', icon: 'none' });
                }
              },
              fail: (error) => {
                uni.hideLoading();
                uni.showToast({ title: '网络连接异常', icon: 'none' });
              }
            });
          }
        }
      } catch (e) {
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: async (res) => {
            uni.showLoading({ title: '上传中...', mask: true });
            const tempFilePath = res.tempFilePaths[0];
            uni.uploadFile({
              url: API_CONFIG.baseUrl + API_CONFIG.paths.upload + '?type=avatar',
              filePath: tempFilePath,
              name: 'file',
              header: {
                'Authorization': 'Bearer ' + this.token
              },
              success: (uploadRes) => {
                uni.hideLoading();
                try {
                  const data = JSON.parse(uploadRes.data);
                  if (data.code === 200) {
                    this.userInfo.avatar = data.data;
                    this.updateUserInfo();
                  } else {
                    uni.showToast({ title: data.msg || '上传失败', icon: 'none' });
                  }
                } catch (e) {
                  uni.showToast({ title: '解析失败，请重试', icon: 'none' });
                }
              },
              fail: (error) => {
                uni.hideLoading();
                uni.showToast({ title: '网络连接异常', icon: 'none' });
              }
            });
          }
        });
      }
    },

    /**
     * 编辑昵称
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
            openid: this.userInfo.openid
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
     * 退出登录
     */
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '是否确定退出登录？',
        confirmColor: '#A31D1D',
        success: async (res) => {
          if (res.confirm) {
            try {
              if (this.token) {
                await uni.request({
                  url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.logout}`,
                  method: 'POST',
                  header: {
                    'Authorization': `Bearer ${this.token}`,
                    'content-type': 'application/json'
                  },
                  data: { user_id: this.userInfo.user_id }
                });
              }
            } catch (e) {
              console.log('退出接口调用失败:', e);
            }
            
            // 清除本地缓存
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');
            uni.removeStorageSync('currentIdentity');
            
            uni.showToast({ title: '已退出登录', icon: 'success' });
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/Login/index' });
            }, 1000);
          }
        }
      });
    },
    
    /**
     * 未登录跳转
     */
    toLogin() {
      uni.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/Login/index' });
      }, 1000);
    },
    
    /**
     * 通用菜单点击
     */
    handleMenuClick(item) {
      if (!item.path) {
        uni.showToast({ title: item.text, icon: 'none' });
        return;
      }
      uni.navigateTo({ url: item.path });
    }
  }
};
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
  height: 100vh; 
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
.footer-info { text-align: center; margin-top: 30rpx; color: #ccc; font-size: 22rpx; }
.safe-area-spacer { height: 160rpx; }
</style>