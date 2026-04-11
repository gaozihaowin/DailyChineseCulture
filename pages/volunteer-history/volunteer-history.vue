<template>
  <view class="view-container">
    <view class="art-header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">担当过往</text>
        </view>
        <view style="width: 48rpx;"></view>
      </view>
    </view>

    <!-- 添加下拉刷新 -->
    <scroll-view 
      scroll-y 
      class="scroll-content"
      :enhanced="true"
      :show-scrollbar="true"
      :scroll-with-animation="true"
      :enable-back-to-top="true"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="content-wrapper">
        <view class="section-box fade-in-up">
          <view v-if="historyList.length === 0" class="empty-tip">
            <text>暂无担当记录</text>
          </view>

          <view 
            v-for="(item, index) in historyList" 
            :key="index" 
            class="duty-card"
          >
            <view class="item-row">
              <text class="label">负责：</text>
              <text class="value">{{ item.charge || '未分配' }}</text>
              <view class="status-tag" :class="item.status === 'ongoing' ? 'ongoing' : 'ended'">
                {{ item.status === 'ongoing' ? '正在参与' : '已结束' }}
              </view>
            </view>
            <view class="item-row">
              <text class="label">职责：</text>
              <text class="value">{{ item.duty || '志愿者' }}</text>
            </view>
            <view class="item-row">
              <text class="label">时间：</text>
              <text class="value">{{ item.startTime && item.endTime ? `${item.startTime}-${item.endTime}` : '未设置' }}</text>
            </view>
          </view>
        </view>

        <!-- 底部安全区占位 -->
        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config.js';

export default {
  data() {
    return {
      token: '',
      historyList: [],
      //  下拉刷新状态
      refreshing: false
    };
  },
  onLoad() {
    this.token = uni.getStorageSync('token') || '';
    if (!this.token) {
      this.toLogin();
      return;
    }
    this.getVolunteerHistory();
  },
  methods: {
    // 下拉刷新方法
    async onRefresh() {
      this.refreshing = true;
      await this.getVolunteerHistory();
      this.refreshing = false;
    },
    
    goBack() {
      uni.navigateBack({ delta: 1 });
    },
    toLogin() {
      uni.showToast({ title: '请先登录', icon: 'none' });
      uni.reLaunch({ url: '/pages/login/login' });
    },
    async getVolunteerHistory() {
      if (!this.token) {
        this.toLogin();
        return;
      }

      try {
        const historyPath = API_CONFIG.paths.getVolunteerHistory || '/user/volunteer-history';
        const fullUrl = `${API_CONFIG.baseUrl}${historyPath}`;
        
        const res = await uni.request({
          url: fullUrl,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.statusCode === 200 && res.data.code === 200) {
          const rawData = res.data.data || {};
          const volunteerHistory = rawData.volunteerHistory || [];
          
          this.historyList = volunteerHistory.map((item, index) => ({
            id: index + 1,
            charge: item.responsible || '未分配',
            duty: item.duty || '志愿者',
            startTime: item.serviceTime ? item.serviceTime.split('-')[0] : '未设置',
            endTime: item.serviceTime ? item.serviceTime.split('-')[1] : '未设置',
            status: item.status === '正在参与' ? 'ongoing' : 'ended',
            assignmentId: item.assignmentId || '' 
          }));
        } else {
          uni.showToast({ title: res.data.message || '获取担当记录失败', icon: 'none' });
        }
      } catch (error) {
        console.error('获取担当过往失败:', error);
        uni.showToast({ title: '网络异常', icon: 'none' });
      } 
    }
  }
};
</script>

<style scoped>
/* 基础布局样式 */
.view-container {
  height: 100vh; 
  display: flex;
  flex-direction: column;
  background-color: #F4F4F5;
  width: 100%;
  overflow: hidden; 
}

.art-header { 
  background: linear-gradient(160deg, #A31D1D 0%, #851212 100%);
  padding: 88rpx 30rpx 30rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0; 
  margin-bottom: 30rpx;
} 

.nav-bar { 
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  width: 100%;
} 

/* 返回按钮样式 */
.back-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-arrow {
  width: 20rpx;
  height: 20rpx;
  border-top: 3rpx solid #fff;
  border-left: 3rpx solid #fff;
  transform: rotate(-45deg);
}

.nav-brand { 
  flex: 1;
  text-align: center;
} 

.brand-en { 
  font-size: 18rpx;
  color: rgba(255,255,255,0.5);
  display: block;
  margin-bottom: 4rpx;
} 

.brand-cn { 
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

/* 滚动内容区样式 */
.scroll-content {
  flex: 1;
  height: 0; 
  box-sizing: border-box;
}

.content-wrapper {
  padding: 0 30rpx;
  box-sizing: border-box;
}

/* 通用区块样式*/
.section-box { 
  background: #fff;
  margin-bottom: 30rpx;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  width: 100%;
  box-sizing: border-box;
}

/* 担当记录卡片样式 */
.duty-card {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.duty-card:last-child {
  border-bottom: none;
}
.item-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.label {
  font-size: 28rpx;
  color: #666;
  width: 120rpx;
}
.value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}
.status-tag {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
}
.status-tag.ongoing {
  background-color: #e6f7ff;
  color: #1890ff;
}
.status-tag.ended {
  background-color: #f5f5f5;
  color: #999;
}

/* 空数据提示 */
.empty-tip { 
  text-align: center; 
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 底部安全区*/
.safe-area-spacer { 
  height: 40rpx; 
}
</style>