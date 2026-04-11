<template>
  <!-- 最外层：权限验证通过才显示界面 -->
  <view class="app-container" v-if="isReady">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }"></view>
    
    <view class="content-area">
      <home-view v-show="currentTab === 0"></home-view>
      <course-view v-show="currentTab === 1"></course-view>
      <mine-view v-show="currentTab === 2"></mine-view>
      <chat-view v-show="currentTab === 3"></chat-view>
    </view>

    <view class="bottom-nav-wrapper">
      <view class="bottom-nav">
        
        <view 
          class="nav-item-btn" 
          v-for="(item, index) in tabBar" 
          :key="index"
          @tap="switchTab(index)"
        >
          <view 
            class="nav-icon-box" 
            :class="{ 'anim-bounce': currentTab === index }"
          >
            <view class="icon-glow" v-if="currentTab === index"></view>
            <image 
              :src="currentTab === index ? item.selectedIconPath : item.iconPath" 
              class="tab-icon-img"
              mode="aspectFit"
            ></image>
          </view>
          <text 
            class="nav-text" 
            :class="{ 'active-text': currentTab === index }"
          >
            {{ item.text }}
          </text>
        </view>
      </view>
      <view class="safe-area-bg"></view>
    </view>
  </view>

  <!-- 加载中状态 -->
  <view class="loading-page" v-else>
    <text class="loading-text">加载中...</text>
  </view>
</template>

<script>
  import HomeView from '@/components/home-view/home-view.vue';
  import CourseView from '@/components/course-view/course-view.vue';
  import MineView from '@/components/mine-view/mine-view.vue';
  import ChatView from '@/components/chat-view/chat-view.vue';
  import { API_CONFIG } from '../../api/config';

  export default {
    name: 'IndexPage',
    components: { HomeView, CourseView, MineView, ChatView },
    
    data() {
      return {
        statusBarHeight: 20,
        currentTab: 0,
        isReady: false, 
        tabBar: [
          { text: '主页', iconPath: 'https://img.icons8.com/ios/50/bfbfbf/home--v1.png', selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/home.png' },
          { text: '课程', iconPath: 'https://img.icons8.com/ios/50/bfbfbf/book--v1.png', selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/book.png' },
          { text: '我的', iconPath: 'https://img.icons8.com/ios/50/bfbfbf/user--v1.png', selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/user.png' },
          { text: '聊天', iconPath: 'https://img.icons8.com/ios/50/bfbfbf/chat--v1.png', selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/chat.png' }
        ]
      }
    },

    onLoad() {
      const systemInfo = uni.getSystemInfoSync();
      if (systemInfo.statusBarHeight) {
        this.statusBarHeight = systemInfo.statusBarHeight;
      }
      uni.$on('switchTab', (index) => { this.switchTab(index); });
      
      // 先做权限判断，完成后再显示页面
      this.checkAdminPermission();
    },
    onUnload() {
      uni.$off('switchTab'); 
    },
    methods: {
      switchTab(index) {
        this.currentTab = index;
      },
      
      async checkAdminPermission() {
        const token = uni.getStorageSync('token');
        if (!token) {
          this.isReady = true;
          return;
        }

        try {
          const res = await uni.request({
            url: API_CONFIG.baseUrl + '/volunteer/check-admin',
            method: 'GET',
            header: {
              'Authorization': 'Bearer ' + token
            }
          });

          const isAdmin = res.data.data === true || res.data.data === 'true';
          
          if (isAdmin) {
            uni.reLaunch({
              url: '/pages/volunteer/admin'
            });
          } else {
            this.isReady = true;
          }
        } catch (err) {
          this.isReady = true;
        }
      }
    }
  }
</script>

<style scoped>
  /* 加载页面：权限判断期间显示 */
  .loading-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
  }
  .loading-text {
    font-size: 28rpx;
    color: #999;
  }

  .app-container {
    height: 100vh;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .content-area { flex: 1; height: 0; position: relative; width: 100%; }

  .bottom-nav-wrapper {
    position: relative; 
    z-index: 999;
    box-shadow: 0 -4rpx 40rpx rgba(0,0,0,0.04);
  }
  .bottom-nav {
    height: 110rpx;
    display: flex; 
    justify-content: space-around; 
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(0,0,0,0.03);
  }
  .nav-item-btn {
    flex: 1; 
    height: 100%;
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    align-items: center;
    padding-top: 10rpx;
  }
  .nav-icon-box {
    position: relative; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    width: 60rpx;
    height: 60rpx;
    margin-bottom: 2rpx;
  }
  .tab-icon-img {
    width: 52rpx;  
    height: 52rpx;
    position: relative;
    z-index: 2;
  }
  .icon-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(158, 42, 43, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 1;
    animation: glow-fade 0.5s ease-out;
  }
  @keyframes glow-fade {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }
  .anim-bounce { 
    animation: jelly 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); 
  }
  @keyframes jelly {
    0% { transform: scale(1); }
    30% { transform: scale(0.8); }
    50% { transform: scale(1.15); }
    70% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  .nav-text {
    font-size: 20rpx; 
    color: #bfbfbf; 
    font-weight: 500; 
    transition: all 0.3s; 
    margin-top: 4rpx;
  }
  .active-text {
    color: #9e2a2b; 
    font-weight: 700; 
    transform: scale(1.05);
  }
  .safe-area-bg { 
    width: 100%; 
    height: env(safe-area-inset-bottom); 
    background-color: #fff; 
  }
</style>