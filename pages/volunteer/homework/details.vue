<template>
  <view class="homework-detail">
    <!-- 顶部导航（统一红色风格） -->
    <uni-nav-bar 
      title="作业详情" 
      left-icon="back" 
      @clickLeft="goBack"
      background="#fdfbf7"
      color="#9e2a2b"
      border="true"
    ></uni-nav-bar>

    <!-- 加载状态 -->
    <view class="loading-wrapper" v-if="loading">
      <uni-load-more type="loading" text="正在加载作业详情..."></uni-load-more>
    </view>

    <!-- 空数据/错误状态 -->
    <view class="empty-wrapper" v-if="!loading && !homeworkData">
      <uni-icons type="empty" size="80" color="#9e2a2b"></uni-icons>
      <text class="empty-text">作业详情获取失败</text>
      <text class="empty-desc">请返回重试或联系管理员</text>
      <button class="refresh-btn" @click="fetchHomeworkDetail">重新加载</button>
    </view>

    <!-- 作业详情内容（滚动布局） -->
    <scroll-view scroll-y class="detail-scroll" v-if="!loading && homeworkData">
      <!-- 学生基础信息卡片 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">学生姓名：</text>
          <text class="info-value">{{ homeworkData.studentName }}</text>
        </view>
        <!-- 恢复：所属班级/小组信息行 -->
        <view class="info-row">
          <text class="info-label">所属班级/小组：</text>
          <text class="info-value">{{ homeworkData.organization || '未分配' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">提交时间：</text>
          <text class="info-value">{{ formatTime(homeworkData.submitTime) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">是否优秀作业：</text>
          <text class="info-value status-tag" :class="homeworkData.isExcellent ? 'status-excellent' : 'status-normal'">
            {{ homeworkData.isExcellent ? '是' : '否' }}
          </text>
        </view>
      </view>

      <!-- 作业内容区域 -->
      <view class="content-block">
        <text class="block-title">作业内容</text>
        <view class="content-card">
          <text class="content-text" v-if="homeworkData.content">
            {{ homeworkData.content }}
          </text>
          <text class="content-empty" v-else>
            该学生未提交具体作业内容
          </text>
        </view>
      </view>
    </scroll-view>

  </view>
</template>

<script>
import { API_CONFIG } from '../../../api/config';

export default {
  data() {
    return {
      loading: false,          // 加载状态
      homeworkData: null,      // 作业详情数据
      homeworkId: '',          // 作业ID（路由参数）
      token: uni.getStorageSync('token') || '' // 用户token
    };
  },
  onLoad(options) {
    // 从路由参数获取作业ID
    this.homeworkId = options.homeworkId || '';
    if (!this.homeworkId) {
      uni.showToast({ title: '缺少作业ID', icon: 'none' });
      this.loading = false;
      return;
    }
    // 初始化加载作业详情
    this.fetchHomeworkDetail();
  },
  methods: {
    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack({ delta: 1 });
    },

    /**
     * 通用请求方法（统一处理token和错误）
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
              // Token失效处理
              if (res.data.code === -1 && res.data.msg.includes('Token')) {
                uni.removeStorageSync('token');
                uni.redirectTo({ url: '/pages/login/login' });
              }
              uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
              reject(res.data);
            }
          },
          fail: (err) => {
            uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
            reject(err);
          }
        });
      });
    },

    /**
     * 获取作业详情数据
     */
    async fetchHomeworkDetail() {
      this.loading = true;
      try {
        const res = await this.request(`/homework/detail/${this.homeworkId}`);
        this.homeworkData = res.data;
      } catch (err) {
        console.error('获取作业详情失败：', err);
        this.homeworkData = null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 格式化时间（YYYY-MM-DD HH:mm:ss）
     */
    formatTime(timeStr) {
      if (!timeStr) return '未提交';
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    },

    
  }
};
</script>

<style scoped lang="scss">
/* 页面基础样式 */
.homework-detail {
  min-height: 100vh;
  background-color: #fdfbf7;
  padding-top: var(--status-bar-height);
  padding-bottom: 100rpx; /* 给底部操作栏留空间 */
}

/* 加载/空状态 */
.loading-wrapper, .empty-wrapper {
  padding: 150rpx 0;
  text-align: center;
}
.empty-text {
  font-size: 28rpx;
  color: #9e2a2b;
  margin-top: 20rpx;
}
.empty-desc {
  font-size: 24rpx;
  color: #a09594;
  margin: 10rpx 0 40rpx;
}
.refresh-btn {
  width: 200rpx;
  height: 70rpx;
  line-height: 70rpx;
  background: #9e2a2b;
  color: #fff;
  border: none;
  border-radius: 35rpx;
  font-size: 26rpx;
}

/* 滚动区域 */
.detail-scroll {
  padding: 24rpx;
}

/* 信息卡片 */
.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  font-size: 26rpx;
}
.info-row:last-child {
  margin-bottom: 0;
}
.info-label {
  color: #666;
  width: 180rpx;
  font-weight: 500;
}
.info-value {
  color: #333;
  flex: 1;
}
.status-tag {
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 500;
}
.status-excellent {
  background: #fef0f0;
  color: #9e2a2b;
}
.status-normal {
  background: #f5f5f5;
  color: #666;
}

/* 内容区块通用样式 */
.content-block {
  margin-bottom: 30rpx;
}
.block-title {
  font-size: 30rpx;
  color: #9e2a2b;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}

/* 作业内容卡片 */
.content-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.content-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.8;
  white-space: pre-line; /* 保留换行 */
}
.content-empty {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  padding: 40rpx 0;
}

</style>