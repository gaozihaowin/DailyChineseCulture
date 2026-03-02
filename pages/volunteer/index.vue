<template>
  <view class="app-container">
    
    <view class="content-area">
      <volunteer-home v-show="currentTab === 0"></volunteer-home>
      <volunteer-task v-show="currentTab === 1"></volunteer-task>
      <volunteer-mine v-show="currentTab === 2"></volunteer-mine>
      <volunteer-stats v-show="currentTab === 3"></volunteer-stats>
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
import VolunteerHome from '@/components/volunteer/volunteer-home.vue';
import VolunteerTask from '@/components/volunteer/volunteer-task.vue';
import VolunteerStats from '@/components/volunteer/volunteer-stats.vue';
import VolunteerMine from '@/components/volunteer/volunteer-mine.vue';

export default {
  name: 'VolunteerIndexPage',
  components: { 
    VolunteerHome, 
    VolunteerTask, 
    VolunteerStats, 
    VolunteerMine 
  },
  data() {
    return {
      currentTab: 0,
      tabBar: [
        { 
          text: '首页', 
          iconPath: 'https://img.icons8.com/ios/50/bfbfbf/home--v1.png', 
          selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/home.png' 
        },
        { 
          text: '作业评优', 
          iconPath: 'https://img.icons8.com/ios/50/bfbfbf/task.png', 
          selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/task.png' 
        },
        {
          text: '我的', 
          iconPath: 'https://img.icons8.com/ios/50/bfbfbf/user--v1.png', 
          selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/user.png' 
        },
        { 
          text: '作业统计', 
          iconPath: 'https://img.icons8.com/ios/50/bfbfbf/bar-chart.png', 
          selectedIconPath: 'https://img.icons8.com/ios-filled/50/9e2a2b/bar-chart.png' 
        }
      ]
    }
  },
  onLoad() {
    uni.$on('switchTab', (index) => { this.switchTab(index); });
    uni.$on('refreshManagementScope', () => {
      uni.$emit('refreshVolunteerTask');
      uni.$emit('refreshVolunteerStats');
    });
  },
  onUnload() {
    uni.$off('switchTab'); 
    uni.$off('refreshManagementScope');
  },
  methods: {
    switchTab(index) {
      this.currentTab = index;
      if (index === 1) {
        uni.$emit('refreshVolunteerTask');
      } else if (index === 3) {
        uni.$emit('refreshVolunteerStats');
      }
    }
  }
};
</script>

<style scoped>
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