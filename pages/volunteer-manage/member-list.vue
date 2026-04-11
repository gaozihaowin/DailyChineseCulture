<template>
  <view class="view-container">
    <!-- 顶部导航栏-->
    <view class="art-header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-title">
          <text class="title-text">成员列表</text>
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
        <!-- 成员列表 -->
        <view class="section-box member-list">
          <view 
            v-for="member in memberList" 
            :key="member.userId" 
            class="member-item"
          >
            <view class="member-info">
              <view class="basic-item">账户名: <text class="value-text">{{ member.account || '--' }}</text></view>
              <view class="basic-item">昵称: <text class="value-text">{{ member.nickname || '--' }}</text></view>
              <view class="basic-item">年龄: <text class="value-text">{{ member.age || '--' }}</text></view>
              <view class="basic-item">性别: <text class="value-text">{{ getGenderText(member.gender) }}</text></view>
              <view class="basic-item">生日: <text class="value-text">{{ member.birthday || '--' }}</text></view>
              <view class="basic-item">职业: <text class="value-text">{{ member.occupation || '--' }}</text></view>
              <view class="basic-item">地区: <text class="value-text">{{ member.region || '--' }}</text></view>
              <view class="basic-item">手机号: <text class="value-text">{{ member.phone || '--' }}</text></view>
              <view class="basic-item study-location">学习位置：<text class="value-text">{{ getStudyLocation(member) }}</text>
              </view>
            </view>
            <view class="status-tag" :class="member.status === '正在参与' ? 'ongoing' : 'ended'">
              {{ member.status }}
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="memberList.length === 0" class="section-box empty-tip">
          <text>当前小组暂无成员</text>
        </view>
        
        <!-- 底部安全区占位 -->
        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config'; 

export default {
  data() {
    return {
      smallGroupId: '',       // 小组ID
      assignmentId: '',       // 分配ID
      smallGroupName: '',     // 小组名称
      memberList: [],         // 成员列表
      token: uni.getStorageSync('token') || '',
      // 下拉刷新状态
      refreshing: false
    }
  },
  
  onLoad(options) {
    // 获取页面参数
    this.smallGroupId = options.smallGroupId || '';
    this.assignmentId = options.assignmentId || '';
    this.smallGroupName = decodeURIComponent(options.smallGroupName || '');
    
    // 加载成员列表
    if (this.smallGroupId && this.assignmentId) {
      this.loadMemberList();
    }
  },
  
  methods: {
    // 下拉刷新方法
    async onRefresh() {
      this.refreshing = true;
      await this.loadMemberList();
      this.refreshing = false;
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    
    // 获取性别文本
    getGenderText(gender) {
      if (gender === 1) return '男';
      if (gender === 2) return '女';
      return '--';
    },
    
    // 获取学习位置
    getStudyLocation(member) {
      const parts = [];
      if (member.campName) parts.push(member.campName);
      if (member.className) parts.push(member.className);
      if (member.bigGroupName) parts.push(member.bigGroupName);
      if (member.smallGroupName) parts.push(member.smallGroupName);
      return parts.join('') || '--';
    },
    
    // 加载小组的成员列表
    async loadMemberList() { 
      try { 
        if (!this.token) { 
          uni.showToast({ title: '请先登录', icon: 'none' }); 
          uni.redirectTo({ url: '/pages/login/login' }); 
          return; 
        } 
        
        // 构建请求URL，根据是否有smallGroupId来决定参数
        let requestUrl = `${API_CONFIG.baseUrl}${API_CONFIG.paths.getVolunteerMembers}?assignmentId=${this.assignmentId}`;
        if (this.smallGroupId) {
          requestUrl += `&smallGroupId=${this.smallGroupId}`;
        }
        
        const response = await uni.request({ 
          url: requestUrl, 
          method: 'GET', 
          header: { 
            'Authorization': `Bearer ${this.token}`, 
            'Content-Type': 'application/json' 
          } 
        }); 
    
        if (!response || response.statusCode !== 200) { 
          uni.showToast({ title: '获取成员列表失败', icon: 'none' }); 
          return; 
        } 
    
        const resData = response.data || {}; 
        if (resData.code === 200) { 
          // 处理返回的数据，根据后端返回的结构获取成员列表
          if (resData.data && resData.data.smallGroupList && resData.data.smallGroupList.length > 0) {
            this.memberList = resData.data.smallGroupList[0].members || [];
          } else {
            this.memberList = [];
          }
        } else { 
          uni.showToast({ 
            title: resData.msg || '获取成员列表失败', 
            icon: 'none' 
          }); 
        } 
      } catch (error) { 
        console.error('加载成员列表失败:', error); 
        uni.showToast({ 
          title: '网络异常，请检查网络', 
          icon: 'none' 
        }); 
      } 
    },
  }
}
</script>

<style scoped>
.view-container {
  height: 100vh; 
  display: flex;
  flex-direction: column;
  background-color: #F4F4F5;
  width: 100%;
  overflow-x: hidden;
}

.art-header {
  background: linear-gradient(160deg, #A31D1D 0%, #851212 100%);
  padding: 88rpx 30rpx 30rpx; /* 统一和其他页面的顶部内边距 */
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

.nav-title {
  flex: 1;
  text-align: center;
}

.title-text {
  font-size: 36rpx; 
  font-weight: bold;
  color: #fff;
}

.scroll-content {
  flex: 1;         
  height: 0;       
  width: 100%;
  box-sizing: border-box;
}

.content-wrapper {
  padding: 0 30rpx;
  box-sizing: border-box;
}

.section-box {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  width: 100%;
  box-sizing: border-box;
  margin: 30rpx 0;
}

/* 成员列表样式 */
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
  padding-right: 12rpx;
}

.basic-item {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  width: 100%;
  white-space: nowrap; 
}
.basic-item.study-location {
  word-wrap: break-word; 
  word-break: break-all;
  line-height: 1.6;
  white-space: normal; 
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
  margin-left: 10rpx;
}

.status-tag.ongoing {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-tag.ended {
  background-color: #f5f5f5;
  color: #999;
}

/* 空状态 */
.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 底部安全区占位 */
.safe-area-spacer { 
  height: 200rpx; 
}
</style>