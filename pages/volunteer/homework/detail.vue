<template>
  <view class="homework-detail">
    <!-- 手动添加返回按钮 -->
    <view class="custom-back-btn" @click="goBack">
      <uni-icons type="back" size="28" color="#9e2a2b"></uni-icons>
      <text class="back-text">返回</text>
    </view>

    <!-- 页面参数（班级/大组/小组信息） -->
    <view class="page-params" v-if="type && id">
      <text class="params-label">{{ typeMap[type] }}：</text>
      <text class="params-value">{{ currentName }}</text>
    </view>

    <!-- 状态切换标签（优化样式） -->
    <view class="status-tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentStatus === 'unsubmitted' }"
        @click="switchStatus('unsubmitted')"
      >
        <text class="tab-text">未提交</text>
        <text class="tab-count">({{ stats.unsubmitted }})</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentStatus === 'submitted' }"
        @click="switchStatus('submitted')"
      >
        <text class="tab-text">已提交</text>
        <text class="tab-count">({{ stats.submitted }})</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentStatus === 'late' }"
        @click="switchStatus('late')"
      >
        <text class="tab-text">迟交</text>
        <text class="tab-count">({{ stats.late }})</text>
      </view>
    </view>

    <!-- 列表容器（固定高度，内部滚动） -->
    <view class="list-container">
      <!-- 加载状态 -->
      <view class="loading-wrapper" v-if="loading">
        <uni-load-more type="loading" text="正在加载名单..."></uni-load-more>
      </view>

      <!-- 空数据状态 -->
      <view class="empty-wrapper" v-if="!loading && list.length === 0">
        <uni-icons type="empty" size="80" color="#9e2a2b"></uni-icons>
        <text class="empty-text">暂无{{ statusMap[currentStatus] }}学员</text>
      </view>

      <!-- 学员名单（美化样式） -->
      <view class="student-list" v-if="!loading && list.length > 0">
        <view class="student-item" v-for="(item, index) in list" :key="index">
          <view class="student-info">
            <text class="student-name">{{ item.name }}</text>
            <!-- 显示学员手机号（可选） -->
            <text class="student-phone" v-if="item.phone">手机号：{{ item.phone }}</text>
          </view>
          <text class="submit-time" v-if="item.submitTime">提交时间：{{ item.submitTime }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../../api/config';

export default {
  data() {
    return {
      // 页面参数
      type: '',
      id: '',
      currentName: '',
      // 加载状态
      loading: false,
      // 当前选中状态
      currentStatus: 'unsubmitted',
      // 统计数据
      stats: {
        submitted: 0,
        unsubmitted: 0,
        late: 0
      },
      // 学员名单
      list: [],
      // 类型映射
      typeMap: {
        class: '班级',
        bigGroup: '大组',
        smallGroup: '小组'
      },
      // 状态映射
      statusMap: {
        unsubmitted: '未提交',
        submitted: '已提交',
        late: '迟交'
      },
      // Token
      token: uni.getStorageSync('token') || ''
    };
  },
  onLoad(options) {
    this.type = options.type;
    this.id = options.id;
    
    if (!this.type || !this.id) {
      uni.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => this.goBack(), 1500);
      return;
    }
    
    // 初始化数据
    this.initData();
  },
  onPullDownRefresh() {
    // 下拉刷新
    this.initData(true);
  },
  methods: {
    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack();
    },

    /**
     * 通用请求方法
     */
    request(url, data = {}, method = 'GET') {
      const fullUrl = `${API_CONFIG.baseUrl}${url}`;
      
      return new Promise((resolve, reject) => {
        uni.request({
          url: fullUrl,
          method,
          data,
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          success: (res) => {
            if (res.data.code === 0) {
              resolve(res.data);
            } else {
              if (res.data.code === -1 && res.data.msg.includes('Token')) {
                uni.removeStorageSync('token');
                uni.redirectTo({ url: '/pages/login/login' });
              }
              uni.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
              reject(res.data);
            }
          },
          fail: (err) => {
            uni.showToast({ title: '网络请求失败', icon: 'none', duration: 2000 });
            reject(err);
          }
        });
      });
    },

    /**
     * 初始化数据
     */
    async initData(refresh = false) {
      if (!refresh) this.loading = true;
      
      try {
        // 1. 获取统计数据（用于显示数量）
        const statsRes = await this.request(`${API_CONFIG.paths.getHomeworkStats}/${this.type}/${this.id}`);
        this.stats = {
          submitted: statsRes.data.submitted,
          unsubmitted: statsRes.data.unsubmitted,
          late: statsRes.data.late
        };
        this.currentName = statsRes.data.name || `${this.typeMap[this.type]}${this.id}`;
        
        // 2. 获取当前状态的名单
        await this.getStudentList();
      } catch (err) {
        console.error('初始化详情数据失败：', err);
      } finally {
        this.loading = false;
        if (refresh) uni.stopPullDownRefresh();
      }
    },

    /**
     * 获取学员名单
     */
    async getStudentList() {
      try {
        const listRes = await this.request(`${API_CONFIG.paths.getHomeworkList}/${this.type}/${this.id}/${this.currentStatus}`);
        this.list = listRes.data || [];
      } catch (err) {
        console.error('获取学员名单失败：', err);
      }
    },

    /**
     * 切换状态
     */
    async switchStatus(status) {
      this.currentStatus = status;
      this.loading = true;
      try {
        await this.getStudentList();
      } catch (err) {
        console.error('切换状态失败：', err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped lang="scss">
/* 页面容器（匹配项目米色背景） */
.homework-detail {
  min-height: 100vh;
  background-color: #fdfbf7;
  /* 关键修改：增加顶部内边距，避开小程序胶囊按钮 */
  padding-top: calc(var(--status-bar-height) + 120rpx);
  display: flex;
  flex-direction: column;
}

/* 手动添加的返回按钮 */
.custom-back-btn {
  position: absolute;
  top: calc(var(--status-bar-height) + 60rpx);
  left: 24rpx;
  display: flex;
  align-items: center;
  color: #9e2a2b;
  z-index: 10;
}

.back-text {
  font-size: 28rpx;
  margin-left: 8rpx;
  font-weight: 500;
}

/* 页面参数（班级/大组信息） */
.page-params {
  padding: 20rpx 24rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f5f5f5;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .params-label {
    font-size: 28rpx;
    color: #666;
  }

  .params-value {
    font-size: 28rpx;
    color: #9e2a2b;
    font-weight: 600;
  }
}

/* 状态切换标签（优化样式） */
.status-tabs {
  display: flex;
  margin: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

  .tab-item {
    flex: 1;
    padding: 24rpx 0;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    position: relative;

    &.active {
      color: #9e2a2b;
      font-weight: 600;
    }

    &.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4rpx;
      background-color: #9e2a2b;
    }

    .tab-count {
      font-size: 24rpx;
      margin-left: 4rpx;
      color: #9e2a2b;
    }
  }
}

/* 列表容器（关键：固定高度，内部滚动） */
.list-container {
  flex: 1;
  overflow: hidden;
  padding: 0 24rpx 24rpx;
}

/* 加载/空状态（匹配项目红色风格） */
.loading-wrapper, .empty-wrapper {
  padding: 120rpx 0;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-text {
  font-size: 28rpx;
  color: #9e2a2b;
  margin-top: 20rpx;
}

/* 学员名单（美化样式） */
.student-list {
  height: 100%;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);

  .student-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .student-info {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
    }

    .student-name {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }

    .student-phone {
      font-size: 24rpx;
      color: #666;
    }

    .submit-time {
      font-size: 24rpx;
      color: #999;
      white-space: nowrap;
    }
  }
}
</style>