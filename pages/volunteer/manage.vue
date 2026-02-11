<template>
  <view class="app-container">
    
    <view class="content-area">
      <!-- 学生身份：保留组件渲染逻辑（Vue注释在template中是允许的，编译时会被移除） -->
      <home-view v-show="currentTab === 0 && userRole === 'student'"></home-view>
      <course-view v-show="currentTab === 1 && userRole === 'student'"></course-view>
      <mine-view v-show="currentTab === 2 && userRole === 'student'"></mine-view>
      <view v-show="currentTab === 3 && userRole === 'student'" class="placeholder-page">
        <uni-icons type="chat-filled" size="80" color="#e0e0e0"></uni-icons>
        <text class="tip-text">聊天页面 正在开发</text>
      </view>

      <!-- 志愿者身份：占位提示 -->
      <view v-show="userRole === 'volunteer'" class="volunteer-placeholder">
        <text class="placeholder-text">请点击底部导航进入对应页面</text>
      </view>
    </view>

    <view class="bottom-nav-wrapper">
      <view class="bottom-nav">
        <!-- 关键修复1：移除WXML中的HTML注释，修正wx:key和class绑定 -->
        <view 
          class="nav-item-btn" 
          v-for="(item, index) in currentTabBar" 
          :key="index"
          @tap="handleTabClick(index)"
        >
          <view 
            class="nav-icon-box" 
            :class="{ 'anim-bounce': currentTab === index }"
          >
            <view v-if="currentTab === index" class="icon-glow"></view>
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
</template>

<script>
  // 保留学员组件的引入
  import HomeView from '@/components/home-view/home-view.vue';
  import CourseView from '@/components/course-view/course-view.vue';
  import MineView from '@/components/mine-view/mine-view.vue';

  export default {
    name: 'IndexPage',
    components: { 
      HomeView, CourseView, MineView
    },
    data() {
      return {
        currentTab: 0,
        userRole: 'volunteer',
        // 学生导航栏配置
        studentTabBar: [
          { 
            text: '主页', 
            iconPath: 'https://img.icons8.com/ios/50/bfbfbf/home--v1.png', 
            selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/home.png' 
          },
          { 
            text: '课程', 
            iconPath: 'https://img.icons8.com/ios/50/bfbfbf/book--v1.png', 
            selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/book.png' 
          },
          { 
            text: '我的', 
            iconPath: 'https://img.icons8.com/ios/50/bfbfbf/user--v1.png', 
            selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/user.png' 
          },
          {
            text: '聊天', 
            iconPath: 'https://img.icons8.com/ios/50/bfbfbf/chat--v1.png', 
            selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/chat.png' 
          }
        ],
        // 志愿者导航栏配置
        volunteerTabBar: [
          { 
            text: '志愿首页', 
            iconPath: 'https://img.icons8.com/ios/50/bfbfbf/home.png', 
            selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/home.png',
            pagePath: '/pages/volunteer/home/home'
          },
          { 
            text: '优秀作业', 
            iconPath: 'https://img.icons8.com/ios/50/bfbfbf/star.png', 
            selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/star.png',
            pagePath: '/pages/volunteer/excellent/excellent'
          },
          { 
            text: '作业统计', 
            iconPath: 'https://img.icons8.com/ios/50/bfbfbf/bar-chart.png', 
            selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/bar-chart.png',
            pagePath: '/pages/volunteer/stats/stats'
          },
          {
            text: '个人中心', 
            iconPath: 'https://img.icons8.com/ios/50/bfbfbf/user.png', 
            selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/user.png',
            pagePath: '/pages/volunteer/my/my'
          }
        ]
      }
    },
    computed: {
      currentTabBar() {
        return this.userRole === 'student' ? this.studentTabBar : this.volunteerTabBar;
      }
    },
    onLoad() {
      uni.$on('switchTab', (index) => { 
        this.currentTab = index;
        console.log('全局事件切换到Tab:', index);
      });
      this.currentTab = 0;
      this.userRole = 'volunteer';
      console.log('当前currentTab:', this.currentTab);
      console.log('当前userRole:', this.userRole);

      if (this.userRole === 'volunteer') {
        this.jumpToVolunteerPage(0, true);
      }
    },
    onUnload() {
      uni.$off('switchTab'); 
    },
    methods: {
      handleTabClick(index) {
        this.currentTab = index;
        console.log('切换到Tab:', index);

        if (this.userRole === 'student') {
          return;
        }

        this.jumpToVolunteerPage(index);
      },
      jumpToVolunteerPage(index, isInit = false) {
        const targetPage = this.volunteerTabBar[index]?.pagePath;
        if (!targetPage) return uni.showToast({ title: '页面路径未配置', icon: 'none' });

        const navigateMethod = isInit ? 'redirectTo' : 'navigateTo';
        uni[navigateMethod]({
          url: targetPage,
          fail: (err) => {
            console.error('志愿者页面跳转失败：', err);
            uni.showToast({ title: '页面跳转失败', icon: 'none' });
          }
        });
      }
    }
  }
</script>

<style scoped>
  .app-container {
    height: 100vh;
    background-color: #f9f7f2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .content-area { 
    flex: 1; 
    position: relative; 
    width: 100%; 
    overflow-y: auto; 
  }

  .volunteer-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .placeholder-text {
    font-size: 28rpx;
    color: #999;
  }

  .placeholder-page { 
    height: 100%; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    background-color: #fff; 
  }
  .tip-text { margin-top: 24rpx; color: #999; font-size: 28rpx; }

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