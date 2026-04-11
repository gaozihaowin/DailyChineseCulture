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
          :class="{ active: activeTab === 'submitted' }"
          @click="switchTab('submitted')"
        >
          准时（{{ detailLists.submitted.length }}）
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

    <!-- 添加下拉刷新配置 -->
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
            >
    
              <view class="member-info">
                <view class="basic-item">姓名: <text class="value-text">{{ member.name || '--' }}</text></view>
                <view class="basic-item">手机号: <text class="value-text">{{ member.phone || '--' }}</text></view>
              </view>
           
              <view class="status-tag completed" v-if="activeTab === 'submitted'">
                已交
              </view>
              <view class="status-tag pending" v-else-if="activeTab === 'pending'">
                未交
              </view>
              <view class="status-tag late" v-else-if="activeTab === 'late'">
                迟交
              </view>
            </view>
          </view>
        </view>

        <!-- 底部安全区占位-->
        <view class="safe-area-spacer"></view>
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
      activeTab: 'submitted',
      selectedScopeType: '',
      selectedScopeId: '',
      selectedDate: '',
      scopeName: '',
      detailLists: {
        submitted: [],
        pending: [],
        late: []
      },
      currentList: [],
      token: '',
      refreshing: false
    };
  },
  onLoad(options) {
    this.token = uni.getStorageSync('token');
    this.selectedScopeType = options.type || '';
    this.selectedScopeId = options.id || '';
    this.selectedDate = options.date || '';
    this.scopeName = decodeURIComponent(options.scopeName || ''); // 解码中文名称
    this.getDetailLists();
  },
  watch: {
    activeTab(newVal) {
      this.currentList = this.detailLists[newVal];
    }
  },
  methods: {
    // 下拉刷新方法
    async onRefresh() {
      this.refreshing = true;
      await this.getDetailLists();
      this.refreshing = false;
    },
    
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const compatibleDate = dateStr.replace(/\s+/g, 'T').replace(/-/g, '/');
      const d = new Date(compatibleDate);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
    },
    switchTab(tabType) {
      this.activeTab = tabType;
    },
    getDetailLists() {
      return new Promise((resolve) => {
        if (!this.selectedScopeType || !this.selectedScopeId || !this.selectedDate) {
          uni.showToast({ title: '参数不全', icon: 'none' });
          resolve();
          return;
        }
        
        uni.request({
          url: `${API_CONFIG.baseUrl}/homework/status-list`,
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
               console.log('后端返回数据：', res.data);
               
               if (res.data.code === 200) {
                const data = res.data.data || {};
                const hasHomework = data.hasHomework !== false; // 默认有作业
                   
                   // 如果没有作业，将所有列表设置为空
                   this.detailLists = {
                       submitted: hasHomework ? (data.submittedList || []) : [],
                       pending: hasHomework ? (data.pendingList || []) : [],
                       late: hasHomework ? (data.lateList || []) : []
                   };
                   this.currentList = this.detailLists[this.activeTab];
               }
           },
          fail: (err) => {
            console.error('请求失败：', err);
            uni.showToast({
              title: '网络错误，请稍后重试',
              icon: 'none'
            });
          },
          complete: () => {
            resolve();
          }
        });
      })
    },
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
  position: relative; 
}

/* 顶部标题栏样式 */
.art-header { 
  background: linear-gradient(160deg, #A31D1D 0%, #851212 100%);
  padding: 88rpx 30rpx 30rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0; 
  margin-bottom: 30rpx;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
} 

.nav-bar { 
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
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
  height: 0; 
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
  padding-top: 320rpx;
  background-color: #F4F4F5;
}

.content-wrapper {
  padding: 0 30rpx;
  box-sizing: border-box;
  min-height: calc(100% + 1px);
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

/* 范围信息样式 */
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

/* 人员列表样式 */
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

/* 状态标签样式 */
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

/* 空数据提示 */
.empty-tip { 
  text-align: center; 
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 底部安全区*/
.safe-area-spacer { 
  height: 200rpx; 
}
</style>