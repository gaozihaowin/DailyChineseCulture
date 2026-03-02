<template>
  <view class="view-container">
    <view class="art-header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">作业名单</text>
        </view>
        <view style="width: 48rpx;"></view>
      </view>
      
      <view class="nav-tabs">
        <view 
          class="nav-tab" 
          :class="{ active: activeTab === 'completed' }"
          @click="switchTab('completed')"
        >
          已交（{{ detailLists.completed.length }}）
        </view>
        <view 
          class="nav-tab" 
          :class="{ active: activeTab === 'pending' }"
          @click="switchTab('pending')"
        >
          未交（{{ detailLists.pending.length }}）
        </view>
        <view 
          class="nav-tab" 
          :class="{ active: activeTab === 'late' }"
          @click="switchTab('late')"
        >
          迟交（{{ detailLists.late.length }}）
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <view class="content-wrapper">
        <view class="section-box scope-info">
          <view class="scope-name">{{ scopeName }}</view>
          <view class="date-info">{{ formatDate(selectedDate) }}</view>
        </view>

        <view class="section-box list-container">
          <view v-if="currentList.length === 0" class="empty-tip">
            <text>暂无相关人员</text>
          </view>
          <view v-else class="member-list">
            <view 
              v-for="(member, index) in currentList" 
              :key="index" 
              class="member-item"
              @click="gotoUserDetail(member.userId)"
            >
              <view class="member-info">
                <view class="basic-item">账户名: <text class="value-text">{{ member.account || '--' }}</text></view>
                <view class="basic-item">姓名: <text class="value-text">{{ member.name || '--' }}</text></view>
                <view class="basic-item">手机号: <text class="value-text">{{ member.phone || '--' }}</text></view>
              </view>
              <view class="status-tag" v-if="activeTab === 'completed' && member.submitTime" :class="member.isLate ? 'late' : 'completed'">
                {{ member.isLate ? '迟交' : '已交' }}
              </view>
              <view class="status-tag pending" v-else-if="activeTab === 'pending'">未交</view>
              <view class="status-tag late" v-else-if="activeTab === 'late'">迟交</view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../../api/config';

export default {
  name: 'StatsList',
  data() {
    return {
      activeTab: 'completed',
      selectedScopeType: '',
      selectedScopeId: '',
      selectedDate: '',
      scopeName: '',
      detailLists: {
        completed: [],
        pending: [],
        late: []
      },
      currentList: [],
      token: '',
      isLoading: false
    };
  },
  onLoad(options) {
    this.token = uni.getStorageSync('token');
    this.selectedScopeType = options.type || '';
    this.selectedScopeId = options.id || '';
    this.selectedDate = options.date || '';
    this.scopeName = options.scopeName || '';
    this.getDetailLists();
  },
  watch: {
    activeTab(newVal) {
      this.currentList = this.detailLists[newVal];
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
    },
    switchTab(tabType) {
      this.activeTab = tabType;
    },
    getDetailLists() {
      if (!this.selectedScopeType || !this.selectedScopeId || !this.selectedDate) {
        return;
      }
      this.isLoading = true;
      uni.request({
        url: `${API_CONFIG.baseUrl}/homework/detailList`,
        method: 'GET',
        data: {
          type: this.selectedScopeType,
          id: this.selectedScopeId,
          date: this.selectedDate
        },
        header: {
          'Authorization': `Bearer ${this.token}`
        },
        success: (res) => {
          this.isLoading = false;
          if (res.data.code === 200) {
            this.detailLists = {
              completed: res.data.data.completed || [],
              pending: res.data.data.pending || [],
              late: res.data.data.late || []
            };
            this.currentList = this.detailLists.completed;
          } else {
            uni.showToast({
              title: res.data.msg || '获取名单失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          this.isLoading = false;
          console.error('获取名单失败:', err);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        }
      });
    },
    gotoUserDetail(userId) {
      if (userId) {
        uni.navigateTo({
          url: `/pages/volunteer/homework/detail?userId=${userId}`
        });
      }
    }
  }
};
</script>

<style scoped>
.view-container {
  min-height: 100vh;
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
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
  width: 100%;
}

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

.nav-tabs {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-top: 20rpx;
}
.nav-tab {
  font-size: 28rpx;
  color: rgba(255,255,255,0.7);
  padding: 10rpx 20rpx;
  border-bottom: 4rpx solid transparent;
}
.nav-tab.active {
  color: #fff;
  border-bottom-color: #fff;
}

.scroll-content {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.content-wrapper {
  padding: 0 30rpx 120rpx;
  box-sizing: border-box;
}

.section-box {
  background: #fff;
  margin-bottom: 30rpx;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  width: 100%;
  box-sizing: border-box;
}

.scope-info {
  text-align: center;
}
.scope-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}
.date-info {
  font-size: 26rpx;
  color: #666;
}

.member-list {
  padding: 0;
}
.member-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.member-item:last-child {
  border-bottom: none;
}
.member-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  gap: 8rpx;
}
.basic-item {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  width: 100%;
}
.value-text {
  color: #666;
  font-weight: normal;
  margin-left: 8rpx;
}

.status-tag {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  flex-shrink: 0;
  margin-top: 8rpx;
  margin-left: 12rpx;
}
.status-tag.completed {
  background-color: #e6f7ff;
  color: #1890ff;
}
.status-tag.pending {
  background-color: #f5f5f5;
  color: #999;
}
.status-tag.late {
  background-color: #fff2e8;
  color: #FF6B35;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>