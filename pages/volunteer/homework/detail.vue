<template>
  <view class="view-container">
    <!-- 顶部标题栏 -->
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

    <!--添加下拉刷新 -->
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
        <!-- 作业详情 -->
        <view class="section-box" v-if="homeworkDetail">
          <!-- 基础信息区域 -->
          <view class="info-section">
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
              <text class="detail-value">{{ formatDateTime(homeworkDetail.submitTime) || '--' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">作业状态：</text>
              <view class="status-tags">
                              <!-- 优秀状态标签 -->
                              <view 
                                v-if="homeworkDetail.isSmallGroupExcellent" 
                                class="status-tag small-excellent-tag"
                                @tap="toggleSmallGroupExcellent"
                              >
                                小组优秀
                              </view>
                              <view 
                                v-if="homeworkDetail.isBigGroupExcellent" 
                                class="status-tag big-excellent-tag"
                                @tap="toggleBigGroupExcellent"
                              >
                                大组优秀
                              </view>
                              <!-- 证书标签 -->
                              <view 
                                v-for="cert in certificates" 
                                :key="cert.type"
                                class="status-tag certificate-tag"
                                @tap="cancelCertificate(cert)"
                              >
                                {{ cert.type }}
                              </view>
                              <!-- 普通作业标签 -->
                              <view 
                                v-if="!homeworkDetail.isSmallGroupExcellent && !homeworkDetail.isBigGroupExcellent && certificates.length === 0" 
                                class="status-tag normal-tag"
                              >
                                普通作业
                              </view>
                            </view>
            </view>
          </view>

          <!-- 作业内容区域 -->
          <view class="content-section">
            <text class="section-title">作业内容</text>
            <view class="content-box">
              <text class="content-text">{{ homeworkDetail.content || '暂无作业内容' }}</text>
            </view>
          </view>

          <!-- 操作按钮区 -->
          <view class="action-area">
            <button 
              class="action-button small-excellent-btn" 
              :class="{ active: homeworkDetail.isSmallGroupExcellent }" 
              @tap="toggleSmallGroupExcellent"
              :disabled="!canOperateSmallGroup()"
            >
              {{ homeworkDetail.isSmallGroupExcellent ? '取消小组优秀' : '标记小组优秀' }}
            </button>
            
            <button 
              class="action-button big-excellent-btn" 
              :class="{ active: homeworkDetail.isBigGroupExcellent }" 
              @tap="toggleBigGroupExcellent"
              :disabled="!canOperateBigGroup()"
            >
              {{ homeworkDetail.isBigGroupExcellent ? '取消大组优秀' : '标记大组优秀' }}
            </button>
            
            <button 
              class="action-button cert-btn" 
              @tap="openCertModal()"
            >
              颁发证书
            </button>
          </view>
        </view>
        
        <view class="section-box empty-tip" v-if="!homeworkDetail">
          <text>暂无作业详情</text>
        </view>

        <!-- 底部安全区 -->
        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>
    
    <!-- 颁发证书模态框 -->
    <view v-if="showCertModal" class="modal-mask" @click="closeCertModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">颁发证书</text>
          <view class="modal-close" @click="closeCertModal">×</view>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">证书类型</text>
            <input 
              class="form-input" 
              v-model="certType" 
              placeholder="请输入证书类型"
              placeholder-style="color: #999; font-size: 28rpx;"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeCertModal">取消</button>
          <button class="modal-btn confirm-btn" @click="issueCertificate">确认颁发</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../../api/config';

export default {
  name: 'HomeworkDetail',
  data() {
    return {
      homeworkId: '', // 作业ID
      homeworkDetail: null, // 作业详情数据
      token: '', // 登录令牌
      dutyType: '', // 角色类型：学班/检班/学委/检委/学组/检组
      showCertModal: false, // 颁发证书模态框
      certType: '', // 证书类型
      certificates: [], // 证书列表
      // 下拉刷新状态
      refreshing: false
    };
  },
  onLoad(options) {
    // 校验作业ID
    if (!options?.homeworkId || isNaN(Number(options.homeworkId))) {
      uni.showToast({ title: '作业ID无效', icon: 'none' });
      setTimeout(() => this.goBack(), 1500);
      return;
    }

    // 初始化参数
    this.homeworkId = Number(options.homeworkId);
    this.token = uni.getStorageSync('token') || '';
    this.dutyType = options.dutyType || '';

    // 未登录跳转登录页
    if (!this.token) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/Login/index' });
      }, 1500);
      return;
    }

    // 获取作业详情和证书列表
        this.getHomeworkDetail().then(() => {
          // 作业详情获取成功后，获取证书列表
          this.getCertificates();
        });
  },
  methods: {
    // 下拉刷新方法
    async onRefresh() {
      this.refreshing = true;
      await this.getHomeworkDetail();
      await this.getCertificates();
      this.refreshing = false;
    },

    // 返回上一页
    goBack() {
      uni.navigateBack({ delta: 1 });
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '';
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return dateTime;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    },

    // 校验小组优秀操作权限
    canOperateSmallGroup() {
      return ['学班', '检班', '学委', '检委', '学组', '检组'].includes(this.dutyType);
    },

    // 校验大组优秀操作权限（强制规则：必须先小组优秀 + 角色权限）
    canOperateBigGroup() {
      // 学组/检组 无大组优秀操作权限
      if (this.dutyType === '学组' || this.dutyType === '检组') {
        return false;
      }
      // 其他角色：必须先标记为小组优秀才能操作大组优秀
      return this.homeworkDetail?.isSmallGroupExcellent;
    },

    // 获取作业详情
    getHomeworkDetail() {
      return new Promise((resolve) => {
        uni.request({
          url: `${API_CONFIG.baseUrl}/homework/detail?homeworkId=${this.homeworkId}`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          success: (res) => {
            if (res.data?.code === 200) {
              this.homeworkDetail = {
                ...res.data.data || {},
                isSmallGroupExcellent: Number(res.data.data?.isSmallGroupExcellent) === 1,
                isBigGroupExcellent: Number(res.data.data?.isBigGroupExcellent) === 1
              };
            } else {
              uni.showToast({ title: res.data?.msg || '获取作业详情失败', icon: 'none' });
            }
          },
          fail: () => {
            uni.showToast({ title: '网络错误，获取详情失败', icon: 'none' });
          },
          complete: () => {
            resolve();
          }
        });
      })
    },

    // 标记/取消小组优秀
    toggleSmallGroupExcellent() {
      if (!this.canOperateSmallGroup()) {
        uni.showToast({ title: '暂无小组优秀操作权限', icon: 'none' });
        return;
      }

      const isCurrentExcellent = this.homeworkDetail.isSmallGroupExcellent;
      uni.showModal({
        title: '确认操作',
        content: isCurrentExcellent ? '确定取消该作业的小组优秀标记？' : '确定将该作业标记为小组优秀？',
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: `${API_CONFIG.baseUrl}/camp/homework/mark-small-group`,
              method: 'POST',
              header: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              data: {
                homeworkId: this.homeworkId,
                isSmallGroupExcellent: isCurrentExcellent ? 0 : 1
              },
              success: (res) => {
                if (res.data?.code === 200) {
                  uni.showToast({ title: isCurrentExcellent ? '取消成功' : '标记成功', icon: 'success' });
                  this.getHomeworkDetail(); 
                } else {
                  uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
                }
              },
              fail: () => {
                uni.showToast({ title: '网络错误，操作失败', icon: 'none' });
              }
            });
          }
        }
      });
    },

    // 标记/取消大组优秀
    toggleBigGroupExcellent() {
      // 学组/检组无权限
      if (this.dutyType === '学组' || this.dutyType === '检组') {
        uni.showToast({ title: '暂无大组优秀操作权限', icon: 'none' });
        return;
      }

      // 标记大组优秀前必须先标记小组优秀
      const isWantToSet = !this.homeworkDetail.isBigGroupExcellent;
      if (isWantToSet && !this.homeworkDetail.isSmallGroupExcellent) {
        uni.showToast({ title: '请先将作业标记为小组优秀', icon: 'none' });
        return;
      }

      const isCurrentExcellent = this.homeworkDetail.isBigGroupExcellent;
      uni.showModal({
        title: '确认操作',
        content: isCurrentExcellent ? '确定取消该作业的大组优秀标记？' : '确定将该作业标记为大组优秀？',
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: `${API_CONFIG.baseUrl}/camp/homework/mark-big-group`,
              method: 'POST',
              header: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              data: {
                homeworkId: this.homeworkId,
                isBigGroupExcellent: isCurrentExcellent ? 0 : 1 
              },
              success: (res) => {
                if (res.data?.code === 200) {
                  uni.showToast({ title: isCurrentExcellent ? '取消成功' : '标记成功', icon: 'success' });
                  this.getHomeworkDetail(); // 刷新详情
                } else {
                  uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
                }
              },
              fail: () => {
                uni.showToast({ title: '网络错误，操作失败', icon: 'none' });
              }
            });
          }
        }
      });
    },

    // 打开颁发证书模态框
    openCertModal() {
      this.showCertModal = true;
    },

    // 关闭颁发证书模态框
    closeCertModal() {
      this.showCertModal = false;
      this.certType = '';
    },

    // 获取作业的证书列表
    getCertificates() {
      return new Promise((resolve) => {
        if (!this.homeworkDetail || !this.homeworkDetail.userId) {
          this.certificates = [];
          resolve();
          return;
        }
        
        uni.request({
          url: `${API_CONFIG.baseUrl}/volunteer/certificate/list-by-homework`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          data: {
            homeworkId: this.homeworkId
          },
          success: (res) => {
            if (res.data?.code === 200) {
              this.certificates = res.data.data || [];
            }
          },
          complete: () => {
            resolve();
          }
        });
      })
    },

    // 颁发证书
    issueCertificate() {
      if (!this.certType.trim()) {
        uni.showToast({ title: '请输入证书类型', icon: 'none' });
        return;
      }

      if (!this.homeworkDetail || !this.homeworkDetail.userId) {
        uni.showToast({ title: '作业信息不完整', icon: 'none' });
        return;
      }

      uni.request({
        url: `${API_CONFIG.baseUrl}/volunteer/certificate/issue`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        data: {
          volunteerId: this.homeworkDetail.userId,
          certificateType: this.certType,
          homeworkId: this.homeworkId
        },
        success: (res) => {
          if (res.data?.code === 200) {
            uni.showToast({ title: '颁发成功', icon: 'success' });
            this.getCertificates();
            this.closeCertModal();
          } else {
            uni.showToast({ title: res.data?.msg || '颁发失败', icon: 'none' });
          }
        },
        fail: () => {
          uni.showToast({ title: '网络错误，颁发失败', icon: 'none' });
        }
      });
    },

    // 取消颁发证书
    cancelCertificate(cert) {
      if (!this.homeworkDetail || !this.homeworkDetail.userId) {
        uni.showToast({ title: '作业信息不完整', icon: 'none' });
        return;
      }

      uni.showModal({
        title: '确认操作',
        content: `确定要取消颁发"${cert.type}"证书吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: `${API_CONFIG.baseUrl}/volunteer/certificate/cancel`,
              method: 'POST',
              header: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
              },
              data: {
                volunteerId: this.homeworkDetail.userId,
                certificateType: cert.type,
                homeworkId: this.homeworkId
              },
              success: (res) => {
                if (res.data?.code === 200) {
                  uni.showToast({ title: '取消成功', icon: 'success' });
                  this.getCertificates();
                } else {
                  uni.showToast({ title: res.data?.msg || '取消失败', icon: 'none' });
                }
              },
              fail: () => {
                uni.showToast({ title: '网络错误，取消失败', icon: 'none' });
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
/* 基础布局样式 */
.view-container {
  height: 100vh; 
  display: flex;
  flex-direction: column;
  background-color: #F4F4F5;
  width: 100%;
  overflow: hidden; 
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
} 

.nav-bar { 
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  width: 100%;
} 

/* 返回按钮样式统一 */
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

/* 滚动内容区 */
.scroll-content {
  flex: 1;
  height: 0; 
  box-sizing: border-box;
}

.content-wrapper {
  padding: 0 30rpx;
  box-sizing: border-box;
}

/* 通用区块样式 */
.section-box { 
  background: #fff;
  margin-bottom: 30rpx;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  width: 100%;
  box-sizing: border-box;
}

/* 空数据提示 */
.empty-tip { 
  text-align: center; 
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
} 

/* 基础信息区域样式 */
.info-section {
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
  padding: 8rpx 0;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
  width: 140rpx;
  flex-shrink: 0;
  line-height: 1.6;
}

.detail-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  line-height: 1.6;
}

/* 优秀状态样式 */
.detail-value.smallExcellent {
  color: #4CAF50;
  font-weight: bold;
}

.detail-value.bigExcellent {
  color: #2196F3;
  font-weight: bold;
}

/* 作业内容区域 */
.content-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
  display: block;
}

.content-box {
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 24rpx;
  min-height: 200rpx;
  box-sizing: border-box;
}

.content-text {
  font-size: 26rpx;
  color: #444;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 状态标签样式 */
.status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}
.status-tag {
  font-size: 24rpx;
  font-weight: bold;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  cursor: pointer;
  transition: all 0.3s;
}
.status-tag:hover {
  transform: translateY(-2rpx);
}
/* 小组优秀标签 */
.small-excellent-tag {
  background-color: #4CAF50;
  color: white;
}
.small-excellent-tag:hover {
  background-color: #45a049;
}
/* 大组优秀标签 */
.big-excellent-tag {
  background-color: #2196F3;
  color: white;
}
.big-excellent-tag:hover {
  background-color: #1976D2;
}
/* 证书标签 */
.certificate-tag {
  background-color: #FFD700;
  color: #333;
}
.certificate-tag:hover {
  background-color: #FFC107;
}
/* 普通作业标签 */
.normal-tag {
  background-color: #999;
  color: white;
}

/* 操作按钮区 */
.action-area {
  display: flex;
  gap: 16rpx;
  justify-content: space-between;
}

.action-button {
  flex: 1;
  padding: 12rpx 0;
  border-radius: 12rpx;
  font-size: 24rpx;
  border: none;
  transition: all 0.3s;
}

/* 小组优秀按钮样式 */
.small-excellent-btn {
  background-color: #4CAF50;
  color: white;
}
.small-excellent-btn.active {
  background-color: #FFD700;
  color: #333;
  font-weight: bold;
}
.small-excellent-btn:disabled {
  background-color: #ccc !important;
  color: #666 !important;
}

/* 大组优秀按钮样式 */
.big-excellent-btn {
  background-color: #2196F3;
  color: white;
}
.big-excellent-btn.active {
  background-color: #9C27B0;
  color: white;
  font-weight: bold;
}
.big-excellent-btn:disabled {
  background-color: #ccc !important;
  color: #666 !important;
}

/* 颁发证书按钮样式 */
.cert-btn {
  background-color: #9C27B0;
  color: white;
}

/* 模态框样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10rpx);
}
.modal-content {
  background-color: white;
  border-radius: 24rpx;
  width: 85%;
  max-width: 550rpx;
  padding: 40rpx;
  box-sizing: border-box;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease-out;
}
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  padding-bottom: 24rpx;
  border-bottom: 2rpx solid #f0f0f0;
}
.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  font-family: 'Microsoft YaHei', sans-serif;
}
.modal-close {
  font-size: 48rpx;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;
}
.modal-close:hover {
  color: #333;
  transform: rotate(90deg);
}
.modal-body {
  margin-bottom: 40rpx;
}
.form-item {
  margin-bottom: 30rpx;
}
.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 30rpx 30rpx; 
  min-height: 90rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 16rpx;
  font-size: 28rpx; 
  color: #333;
  box-sizing: border-box;
  transition: all 0.3s;
  background-color: #f9f9f9;
  line-height: 1.5; 
}
.form-input:focus {
  border-color: #A31D1D;
  background-color: #ffffff;
  box-shadow: 0 0 0 4rpx rgba(163, 29, 29, 0.1);
}
.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
}
.modal-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  border: none;
  box-sizing: border-box;
  font-weight: 600;
  transition: all 0.3s;
  letter-spacing: 2rpx;
}
.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}
.cancel-btn:hover {
  background-color: #e0e0e0;
  transform: translateY(-2rpx);
}
.confirm-btn {
  background-color: #A31D1D;
  color: white;
  background: linear-gradient(135deg, #A31D1D 0%, #851212 100%);
  box-shadow: 0 8rpx 20rpx rgba(163, 29, 29, 0.2);
}
.confirm-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 28rpx rgba(163, 29, 29, 0.3);
}

/* 底部安全区 */
.safe-area-spacer { 
  height: 200rpx; 
}
</style>