<template>
  <view class="apply-list-container">
    <NavBar title="申请记录" :isTransparent="false" />

    <view class="page-content">
      <view class="list-wrapper" v-if="applyList.length > 0">
        <view
          class="apply-card"
          v-for="(item, index) in applyList"
          :key="index"
        >
          <view class="card-header">
            <text class="duty-type-text">{{ getDutyTypeText(item.dutyType) }}</text>
            <view
              class="status-tag"
              :class="getStatusClass(item.status)"
            >
              <text class="status-text">{{ getStatusText(item.status) }}</text>
            </view>
          </view>

          <view class="card-body">
            <view class="info-row">
              <text class="info-label">申请时间：</text>
              <text class="info-value">{{ item.createTime }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">申请理由：</text>
              <text class="info-value">{{ item.applyReason }}</text>
            </view>
            <view class="reject-row" v-if="item.status === 2 && item.auditRemark">
              <text class="reject-label">驳回原因：</text>
              <text class="reject-value">{{ item.auditRemark }}</text>
            </view>
          </view>

          <view class="card-footer" v-if="item.status === 0">
            <view class="revoke-btn" @click="handleRevoke(item)">
              <text class="revoke-btn-text">撤销申请</text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-wrapper" v-else-if="!loading">
        <view class="empty-icon-box">
          <uni-icons type="chatboxes" size="80" color="#ccc"></uni-icons>
        </view>
        <text class="empty-text">暂无申请记录</text>
        <text class="empty-hint">点击上方"管理员申请"提交新申请</text>
      </view>

      <view class="loading-wrapper" v-else>
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { API_CONFIG } from '@/api/config.js';

const applyList = ref([]);
const loading = ref(false);

const dutyTypeMap = {
  'COURSE_ADMIN': '课程管理员',
  'ARCHIVE_ADMIN': '档案管理员',
  'SUPER_ADMIN': '超级管理员'
};

const statusMap = {
  0: { text: '待审核', class: 'status-warning' },
  1: { text: '已通过', class: 'status-success' },
  2: { text: '已驳回', class: 'status-error' },
  3: { text: '已撤销', class: 'status-info' }
};

const getDutyTypeText = (dutyType) => {
  return dutyTypeMap[dutyType] || dutyType;
};

const getStatusText = (status) => {
  return statusMap[status]?.text || '未知';
};

const getStatusClass = (status) => {
  return statusMap[status]?.class || 'status-info';
};

const fetchApplyList = () => {
  if (loading.value) return;

  loading.value = true;
  applyList.value = [];

  const token = uni.getStorageSync('token');

  uni.request({
    url: API_CONFIG.baseUrl + '/duty-application/my-list',
    method: 'GET',
    header: {
      'Authorization': 'Bearer ' + token
    },
    success: (res) => {
      try {
        const resData = res.data;
        if (resData && resData.code === 200) {
          applyList.value = resData.data || [];
        } else {
          applyList.value = [];
          if (resData && resData.msg) {
            uni.showToast({ title: resData.msg, icon: 'none' });
          }
        }
      } catch (e) {
        applyList.value = [];
      } finally {
        loading.value = false;
      }
    },
    fail: (err) => {
      console.error('Fetch apply list failed:', err);
      applyList.value = [];
      loading.value = false;
      uni.showToast({ title: '网络连接失败，暂无数据', icon: 'none', duration: 2000 });
    }
  });
};

const handleRevoke = (item) => {
  uni.showModal({
    title: '撤销确认',
    content: '确定要撤销这条申请吗？',
    confirmColor: '#e53e3e',
    success: (res) => {
      if (res.confirm) {
        revokeApply(item.applyId);
      }
    }
  });
};

const revokeApply = (applyId) => {
  uni.showLoading({ title: '撤销中...', mask: true });

  const token = uni.getStorageSync('token');

  uni.request({
    url: API_CONFIG.baseUrl + '/duty-application/revoke',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    data: { applyId },
    success: (res) => {
      try {
        const resData = res.data;
        if (resData && resData.code === 200) {
          uni.showToast({ title: '撤销成功', icon: 'success' });
          fetchApplyList();
        } else {
          uni.showToast({ title: resData?.msg || '撤销失败', icon: 'none' });
        }
      } catch (e) {
        uni.showToast({ title: '处理响应失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },
    fail: (err) => {
      console.error('Revoke apply failed:', err);
      uni.hideLoading();
      uni.showToast({ title: '网络请求失败', icon: 'none' });
    }
  });
};

onShow(() => {
  fetchApplyList();
});
</script>

<style scoped>
.apply-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-content {
  padding: 24rpx;
  min-height: calc(100vh - 88rpx);
}

.list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.apply-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.duty-type-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.status-tag {
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.status-warning {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status-success {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-error {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.status-info {
  background-color: #f5f5f5;
  color: #999999;
}

.status-text {
  font-size: 24rpx;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-row {
  display: flex;
  align-items: flex-start;
}

.info-label {
  font-size: 28rpx;
  color: #666666;
  flex-shrink: 0;
}

.info-value {
  font-size: 28rpx;
  color: #333333;
  word-break: break-all;
}

.reject-row {
  display: flex;
  align-items: flex-start;
  margin-top: 8rpx;
  padding: 16rpx;
  background-color: #fff1f0;
  border-radius: 8rpx;
}

.reject-label {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: 500;
  flex-shrink: 0;
}

.reject-value {
  font-size: 28rpx;
  color: #ff4d4f;
  word-break: break-all;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.revoke-btn {
  padding: 12rpx 32rpx;
  border: 1rpx solid #ff4d4f;
  border-radius: 30rpx;
}

.revoke-btn-text {
  font-size: 26rpx;
  color: #ff4d4f;
}

.empty-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon-box {
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666666;
  font-weight: 500;
}

.empty-hint {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #999999;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 300rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #9e2a2b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999999;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
