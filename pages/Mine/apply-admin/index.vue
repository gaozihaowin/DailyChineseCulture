<template>
  <view class="apply-admin-container">
    <NavBar title="权限申请" :isTransparent="false" />

    <view class="page-content">
      <view class="page-header">
        <text class="header-title">选择您要申请的管理员角色</text>
        <text class="header-subtitle">管理员权限用于管理营期与学员数据，请根据实际需求选择</text>
      </view>

      <view class="cards-container">
        <view
          class="admin-card"
          :class="{ 'card-active': selectedDuty.dutyType === 'COURSE_ADMIN' }"
          @click="selectDuty('COURSE_ADMIN', '课程管理员')"
        >
          <view class="card-icon-box course-icon">
            <text class="card-icon">🎓</text>
          </view>
          <view class="card-info">
            <text class="card-title">课程管理员</text>
            <text class="card-desc">负责特定营期的排课与学员作业管理</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="right" size="18" color="#999"></uni-icons>
          </view>
        </view>

        <view
          class="admin-card"
          :class="{ 'card-active': selectedDuty.dutyType === 'ARCHIVE_ADMIN' }"
          @click="selectDuty('ARCHIVE_ADMIN', '档案管理员')"
        >
          <view class="card-icon-box archive-icon">
            <text class="card-icon">🗂️</text>
          </view>
          <view class="card-info">
            <text class="card-title">档案管理员</text>
            <text class="card-desc">负责全局结营证书与学籍档案核发</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="right" size="18" color="#999"></uni-icons>
          </view>
        </view>

        <view
          class="admin-card"
          :class="{ 'card-active': selectedDuty.dutyType === 'SUPER_ADMIN' }"
          @click="selectDuty('SUPER_ADMIN', '超级管理员')"
        >
          <view class="card-icon-box super-icon">
            <text class="card-icon">⚙️</text>
          </view>
          <view class="card-info">
            <text class="card-title">超级管理员</text>
            <text class="card-desc">统筹系统全局配置与最高权限</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="right" size="18" color="#999"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <uni-popup ref="popupRef" type="bottom" background-color="#fff" border-radius="24rpx 24rpx 0 0">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">申请成为 {{ selectedDuty.name }}</text>
          <view class="popup-close" @click="closePopup">
            <uni-icons type="close" size="20" color="#666"></uni-icons>
          </view>
        </view>

        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">申请理由 <text class="required">*</text></text>
            <view class="textarea-box">
              <textarea
                class="reason-textarea"
                v-model="applyReason"
                :maxlength="255"
                placeholder="请简述您的申请理由..."
                placeholder-class="textarea-placeholder"
              />
              <view class="word-count">
                <text :class="{ 'word-count-warning': applyReason.length >= 220 }">
                  {{ applyReason.length }}
                </text>
                <text class="word-count-total">/255</text>
              </view>
            </view>
          </view>
        </view>

        <view class="popup-footer">
          <view class="btn-cancel" @click="closePopup">
            <text class="btn-cancel-text">取消</text>
          </view>
          <view class="btn-submit" :class="{ 'btn-disabled': isSubmitting }" @click="handleSubmit">
            <text class="btn-submit-text" v-if="!isSubmitting">确认提交</text>
            <text class="btn-submit-text" v-else>提交中...</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { API_CONFIG } from '@/api/config.js';

const popupRef = ref(null);
const selectedDuty = ref({
  dutyType: '',
  name: ''
});
const applyReason = ref('');
const isSubmitting = ref(false);

const selectDuty = (dutyType, name) => {
  selectedDuty.value = { dutyType, name };
  applyReason.value = '';
  popupRef.value.open();
};

const closePopup = () => {
  popupRef.value.close();
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  if (!applyReason.value.trim()) {
    uni.showToast({ title: '请填写申请理由', icon: 'none' });
    return;
  }

  if (applyReason.value.length > 255) {
    uni.showToast({ title: '申请理由不能超过255字', icon: 'none' });
    return;
  }

  isSubmitting.value = true;

  const payload = {
    dutyType: selectedDuty.value.dutyType,
    applyReason: applyReason.value.trim()
  };

  try {
    const token = uni.getStorageSync('token');
    const res = await uni.request({
      url: API_CONFIG.baseUrl + '/duty-application/submit',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      data: payload
    });

    const resData = res.data;

    if (resData.code === 200) {
      uni.showToast({ title: '申请提交成功，请耐心等待审核', icon: 'success' });
      closePopup();
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showModal({
        title: '提交失败',
        content: resData.msg || '未知错误，请稍后重试',
        showCancel: false
      });
    }
  } catch (error) {
    console.error('Submit duty application error:', error);
    uni.showModal({
      title: '网络异常',
      content: '网络请求失败，请检查网络连接后重试',
      showCancel: false
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.apply-admin-container {
  min-height: 100vh;
  background-color: #f5f3f0;
}

.page-content {
  padding: 32rpx;
}

.page-header {
  margin-bottom: 40rpx;
}

.header-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12rpx;
}

.header-subtitle {
  display: block;
  font-size: 26rpx;
  color: #888;
  line-height: 1.5;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.admin-card {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.admin-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
}

.card-active {
  border: 2rpx solid #9e2a2b;
  background-color: #fff9f9;
}

.card-icon-box {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.course-icon {
  background: linear-gradient(135deg, #8a2021, #b53b3c);
}

.archive-icon {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
}

.super-icon {
  background: linear-gradient(135deg, #5c433b, #8b6b61);
}

.card-icon {
  font-size: 44rpx;
}

.card-info {
  flex: 1;
  overflow: hidden;
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.card-desc {
  display: block;
  font-size: 24rpx;
  color: #888;
  line-height: 1.4;
}

.card-arrow {
  margin-left: 16rpx;
  flex-shrink: 0;
}

.popup-content {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.popup-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.popup-close {
  padding: 8rpx;
}

.popup-body {
  padding: 32rpx;
  overflow-y: auto;
  flex: 1;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
}

.required {
  color: #e64343;
}

.picker-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
}

.placeholder-text {
  color: #999;
}

.textarea-box {
  position: relative;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 24rpx;
  padding-bottom: 60rpx;
}

.reason-textarea {
  width: 100%;
  height: 200rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  background: transparent;
}

.textarea-placeholder {
  color: #999;
  font-size: 28rpx;
}

.word-count {
  position: absolute;
  bottom: 16rpx;
  right: 16rpx;
  font-size: 22rpx;
  color: #999;
}

.word-count-warning {
  color: #e64343;
}

.word-count-total {
  color: #bbb;
}

.popup-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.btn-cancel {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 44rpx;
}

.btn-cancel-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #666;
}

.btn-submit {
  flex: 2;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #9e2a2b, #b53b3c);
  border-radius: 44rpx;
}

.btn-disabled {
  background: linear-gradient(135deg, #c4c4c4, #d0d0d0);
}

.btn-submit-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
}

.picker-popup-content {
  display: flex;
  flex-direction: column;
  max-height: 60vh;
}

.picker-header {
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  display: block;
}

.picker-body {
  padding: 16rpx 0;
  overflow-y: auto;
  flex: 1;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  transition: background-color 0.2s;
}

.picker-item:active {
  background-color: #f5f5f5;
}

.picker-item-text {
  font-size: 30rpx;
  color: #333;
}

.picker-footer {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.picker-cancel-btn {
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 40rpx;
}

.picker-cancel-btn text {
  font-size: 28rpx;
  color: #666;
}
</style>
