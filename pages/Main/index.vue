<template>
  <view class="app-container">
    
    <view class="content-area">
      <home-view v-show="currentTab === 0"></home-view>
      <course-view v-show="currentTab === 1"></course-view>
      <mine-view v-show="currentTab === 2"></mine-view>
      <view v-show="currentTab === 3" class="placeholder-page">
        <uni-icons type="gift-filled" size="80" color="#e0e0e0"></uni-icons>
        <text class="tip-text">致良知文创商城 敬请期待</text>
      </view>
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
</template>

<script>
  import HomeView from '@/components/home-view/home-view.vue';
  import CourseView from '@/components/course-view/course-view.vue';
  import MineView from '@/components/mine-view/mine-view.vue';

  export default {
    name: 'IndexPage',
    components: { HomeView, CourseView, MineView },
    
    data() {
      return {
        currentTab: 0,
        /**
         * 【配置说明】
         * 这里使用了阿里云 OSS 的演示图标链接。
         * 在实际开发中，您可以直接把 'https://...' 换成您自己的图片链接，
         * 或者本地图片路径 (如 '/static/tabbar/home.png')
         */
        tabBar: [
          { 
            text: '主页', 
            // 未选中状态的图标链接
            iconPath: 'https://img.icons8.com/ios/50/bfbfbf/home--v1.png', 
            // 选中状态的图标链接
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
            text: '文创', 
            iconPath: 'https://img.icons8.com/ios/50/bfbfbf/gift--v1.png', 
            selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/gift.png' 
          }
        ]
      }
    },

    onLoad() {
      uni.$on('switchTab', (index) => { this.switchTab(index); });
    },
    onUnload() {
      uni.$off('switchTab'); 
    },
    methods: {
      switchTab(index) {
        this.currentTab = index;
      }
    }
  }
</script>

<style scoped>
  /* 全局布局保持不变 */
  .app-container {
    height: 100vh;
    background-color: #f9f7f2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .content-area { flex: 1; height: 0; position: relative; width: 100%; }
  .placeholder-page { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #fff; }
  .tip-text { margin-top: 24rpx; color: #999; font-size: 28rpx; }

  /* --- 底部导航样式 --- */
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

  /* 【重点修改】图片图标样式 */
  .tab-icon-img {
    width: 52rpx;   /* 设置宽度 */
    height: 52rpx;  /* 设置高度 */
    position: relative;
    z-index: 2;
  }

  /* 选中时的背景光晕 */
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