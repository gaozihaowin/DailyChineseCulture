<template>
  <view class="view-container">
    <view class="art-header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">作业详情</text>
        </view>
        <view style="width: 48rpx;"></view>
      </view>
    </view>

    <!-- 滚动内容区域 -->
    <scroll-view scroll-y class="scroll-content">
      <view class="homework-detail" v-if="homeworkDetail">
        <view class="section-box">
          <view class="detail-item">
            <text class="detail-label">学员姓名：</text>
            <text class="detail-value">{{ homeworkDetail.studentName || '--' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">所属组织：</text>
            <text class="detail-value">{{ homeworkDetail.organization || '--' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">提交时间：</text>
            <text class="detail-value">{{ homeworkDetail.submitTime || '--' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">作业状态：</text>
            <text class="detail-value" :class="{ excellent: homeworkDetail.isExcellent }">
              {{ homeworkDetail.isExcellent ? '优秀作业' : '普通作业' }}
            </text>
          </view>
          <view class="detail-section">
            <text class="section-title">作业内容</text>
            <view class="content-box">
              <text class="content-text">{{ homeworkDetail.content || '暂无作业内容' }}</text>
            </view>
          </view>
          <view class="action-area">
            <button class="action-button" :class="{ excellent: homeworkDetail.isExcellent }" @tap="toggleExcellent">
              {{ homeworkDetail.isExcellent ? '取消优秀' : '标记优秀' }}
            </button>
          </view>
        </view>
      </view>

      <view class="section-box empty-tip" v-if="isLoading">
        <text>加载中...</text>
      </view>
      <view class="section-box empty-tip" v-if="!isLoading && !homeworkDetail">
        <text>暂无作业详情</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../../api/config';

export default {
  data() {
    return {
      homeworkId: '',
      homeworkDetail: null,
      token: '',
      isLoading: false,
    };
  },
  onLoad(options) {
    // 校验参数
    if (!options?.homeworkId) {
      uni.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => this.goBack(), 1500);
      return;
    }
    
    this.homeworkId = options.homeworkId;
    this.token = uni.getStorageSync('token');
    
    // 校验token
    if (!this.token) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/login/login' });
      }, 1500);
      return;
    }
    
    // 获取作业详情
    this.getHomeworkDetail();
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.redirectTo({ url: '/components/volunteer/volunteer-task' });
        }
      });
    },

    // 获取作业详情
    getHomeworkDetail() {
      this.isLoading = true;
      uni.request({
        url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.getHomeworkDetail}/${this.homeworkId}`,
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + this.token,
          'Content-Type': 'application/json'
        },
        success: (res) => {
          this.isLoading = false;
          if (res.data?.code === 200) {
            this.homeworkDetail = res.data.data || {};
          } else {
            this.homeworkDetail = null;
            uni.showToast({
              title: res.data?.msg || '获取作业详情失败',
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: (err) => {
          this.isLoading = false;
          this.homeworkDetail = null;
          console.error('获取作业详情失败:', err);
          uni.showToast({
            title: '网络请求失败，请检查网络',
            icon: 'none',
            duration: 2000
          });
        }
      });
    },

    // 切换优秀作业状态
    toggleExcellent() {
      if (!this.homeworkId || !this.token) return;
      
      const isExcellent = this.homeworkDetail.isExcellent || false;
      uni.showModal({
        title: '确认操作',
        content: isExcellent ? '确定取消该作业的优秀标记吗？' : '确定将该作业标记为优秀吗？',
        success: (res) => {
          if (res.confirm) {
            this.isLoading = true;
            uni.request({
              url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.markExcellentHomework}/${this.homeworkId}/${isExcellent ? 0 : 1}`,
              method: 'POST',
              header: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
              },
              success: (res) => {
                this.isLoading = false;
                if (res.data?.code === 200) {
                  uni.showToast({
                    title: res.data.message || (isExcellent ? '取消成功' : '标记成功'),
                    icon: 'success',
                    duration: 2000
                  });
                  this.getHomeworkDetail();
                } else {
                  uni.showToast({
                    title: res.data?.msg || '操作失败',
                    icon: 'none',
                    duration: 2000
                  });
                }
              },
              fail: (err) => {
                this.isLoading = false;
                console.error('标记优秀作业失败:', err);
                uni.showToast({
                  title: '网络请求失败，请检查网络',
                  icon: 'none',
                  duration: 2000
                });
              }
            });
          }
        }
      });
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
  overflow-x: hidden;
}

.art-header {
  background: linear-gradient(160deg, #A31D1D 0%, #851212 100%);
  padding: 88rpx 30rpx 30rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  margin-bottom: 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
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

.scroll-content {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  padding: 0 30rpx;
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

.homework-detail {
  width: 100%;
  box-sizing: border-box;
}


.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 28rpx;
  line-height: 1.5;
}
.detail-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-label {
  font-weight: bold;
  color: #333;
  flex-shrink: 0;
  margin-right: 8rpx;
}

.detail-value {
  flex: 1;
  color: #666;
  word-break: break-all;
}

.detail-value.excellent {
  color: #A31D1D;
  font-weight: bold;
}

.detail-section {
  margin-top: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
}


.content-box {
  min-height: 300rpx;
  line-height: 1.8;
  color: #666;
  font-size: 26rpx;
  padding: 10rpx 0;
  word-break: break-all;
  white-space: pre-wrap;
}

.content-text {
  display: block;
  width: 100%;
}

.action-area {
  margin-top: 30rpx;
  padding: 0;
}

.action-button {
  width: 100%;
  padding: 20rpx 12rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  background-color: #f9f9f9;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.action-button.excellent {
  background-color: #A31D1D;
  color: white;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>