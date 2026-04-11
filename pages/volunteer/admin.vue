<template>
  <view class="app-container">
    <!-- 内容区 -->
    <view class="content-area">
      <!-- 分配岗位 -->
      <view class="page-container" v-if="currentTab === 0">
        <admin-duty />
      </view>

      <!-- 颁发证书 -->
      <view class="page-container" v-if="currentTab === 1">
        <admin-cert />
      </view>

      <!-- 个人中心 -->
      <view class="page-container" v-if="currentTab === 2">
        <admin-mine />
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav-wrapper">
      <view class="bottom-nav">
        <view 
          class="nav-item-btn" 
          v-for="(item, index) in tabBar" 
          :key="index"
          @click="switchTab(index)"
        >
          <view class="nav-icon-box" :class="{ 'anim-bounce': currentTab === index }">
            <view class="icon-glow" v-if="currentTab === index"></view>
            <image 
              :src="currentTab === index ? item.selectedIconPath : item.iconPath" 
              class="tab-icon-img" 
              mode="aspectFit"
            ></image>
          </view>
          <text class="nav-text" :class="{ 'active-text': currentTab === index }">
            {{ item.text }}
          </text>
        </view>
      </view>
      <view class="safe-area-bg"></view>
    </view>
  </view>
</template>

<script>
// 引入三个组件
import AdminDuty from '@/components/volunteer_admin/admin_duty.vue'
import AdminCert from '@/components/volunteer_admin/admin_cert.vue'
import AdminMine from '@/components/volunteer_admin/admin_mine.vue'

export default {
  components: {
    AdminDuty,
    AdminCert,
    AdminMine
  },
  data() {
    return {
      currentTab: 0, // 默认打开分配岗位
      tabBar: [
        {
          text: '分配岗位',
          iconPath: 'https://img.icons8.com/ios/50/bfbfbf/change-user-male.png',
          selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/change-user-male.png'
        },
        {
          text: '颁发证书',
          iconPath: 'https://img.icons8.com/ios/50/bfbfbf/certificate.png',
          selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/certificate.png'
        },
        {
          text: '个人中心',
          iconPath: 'https://img.icons8.com/ios/50/bfbfbf/user--v1.png',
          selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/user.png'
        }
      ]
    }
  },
  methods: {
    switchTab(index) {
      this.currentTab = index
    }
  }
}
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F8F5F0;
  overflow: hidden;
}

.content-area {
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.page-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.bottom-nav-wrapper {
  position: relative;
  z-index: 999;
  box-shadow: 0 -4rpx 40rpx rgba(0, 0, 0, 0.04);
}
.bottom-nav {
  height: 110rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.03);
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
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.anim-bounce {
  animation: jelly 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
@keyframes jelly {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.15);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
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