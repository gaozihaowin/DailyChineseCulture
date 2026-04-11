<template>
  <view class="view-container">
    <!-- 顶部红色导航栏 -->
    <view class="art-header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">我的证书</text>
        </view>
        <view class="placeholder"></view>
      </view>
    </view>

    <!-- 证书类型标签切换 -->
    <view class="cert-tabs">
      <view 
        v-for="tab in certTabs" 
        :key="tab.key"
        class="cert-tab"
        :class="{ active: activeTab === tab.key }"
        @tap="switchTab(tab.key)"
      >
        {{ tab.name }}
      </view>
    </view>

    <!-- 证书列表内容 -->
    <scroll-view 
      scroll-y 
      class="scroll-content"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="content-wrapper">
        <view class="section-box cert-list-box">
          <!-- 加载中 -->
          <view v-if="loading" class="empty-tip">
            <text>加载中...</text>
          </view>
        
          <!-- 空状态 -->
          <view v-else-if="filteredCertList.length === 0" class="empty-tip">
            <text>暂无证书</text>
          </view>

          <!-- 证书卡片 -->
          <view 
            v-for="cert in filteredCertList" 
            :key="cert.cert_id || cert.id" 
            class="cert-card"
          >
            <view class="cert-card-header">
              <text class="cert-type">{{ cert.type || cert.certificateType }}</text>
              <text class="cert-number">编号: {{ cert.number || '无' }}</text>
            </view>
            <view class="cert-card-time">颁发时间: {{ formatTime(cert.issueTime || cert.issue_time) }}</view>
            <view class="cert-card-preview">
              <text class="preview-link" @click="previewCert(cert)">点击预览</text>
            </view>
          </view>
        </view>

        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>

    <!-- 证书预览弹窗 -->
    <view v-if="showPreview" class="modal-mask" @click="closePreview">
      <view class="cert-preview" @click.stop>
        <view class="preview-header">
          <view class="preview-title">证书预览</view>
          <view class="preview-close" @click="closePreview">×</view>
        </view>

        <view class="certificate-container">
          <view class="certificate-wrapper">
            <view class="certificate-header">
              <view class="certificate-logo">
                <view class="logo-circle">
                  <text class="logo-text">致良知</text>
                </view>
              </view>
            </view>
            
            <view class="certificate-body">
                <!-- 志愿者证书 -->
                    <template v-if="isVolunteerCert(currentCert)">
						<h1 class="certificate-title">志愿者证书</h1>
						<p class="certificate-subtitle">CERTIFICATE OF VOLUNTEER</p>
						<p class="certificate-grant">兹授予 <span class="recipient-name">{{ getCertificateReceiverName(currentCert) }}</span> 同志</p>
						<h2 class="certificate-type">{{ currentCert?.type || currentCert?.certificateType }}</h2>
						<p class="certificate-content">
                        嘉许您在{{ currentCert?.camp_class_info }}的志愿服务中，<br>
                        表现出色，贡献突出，<br>
                        特颁发此证，以资鼓励。</p>
                    </template>
				
                <!-- 学员证书 -->
                    <template v-else-if="isStudentCert(currentCert)">
						<p class="certificate-grant">兹授予 <span class="recipient-name">{{ getCertificateReceiverName(currentCert) }}</span> 同志</p>
						<h2 class="certificate-type">{{ currentCert?.type || currentCert?.certificateType }}</h2>
						<p class="certificate-content">
                    嘉许您在{{ currentCert?.camp_class_info }}的学习中，<br>
                    表现出色，成绩优异，<br>
                    特颁发此证，以资鼓励。</p>
                </template>
              
            </view>
            
            <view class="certificate-footer">
              <p class="certificate-number">编号: {{ currentCert?.number || '无' }}</p>
              <p class="certificate-issue-time">颁发时间: {{ formatTime(currentCert?.issueTime || currentCert?.issue_time) }}</p>
            </view>
          </view>
        </view>

        <view class="preview-footer">
          <button class="preview-close-btn" @click="closePreview">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config';

export default {
  data() {
    return {
      loading: true,
      refreshing: false,
      certList: [],
      showPreview: false,
      currentCert: null,
      activeTab: 'all',
      certTabs: [
        { key: 'all', name: '全部证书' },
        { key: 'volunteer', name: '志愿者证书' },
        { key: 'student', name: '学员证书' }
      ]
    }
  },
  computed: {
      // 根据当前标签过滤证书列表
      filteredCertList() {
        if (this.activeTab === 'all') {
          return this.certList;
        } else if (this.activeTab === 'volunteer') {
          // 过滤出志愿者相关的证书
          return this.certList.filter(item => this.isVolunteerCert(item));
        } else if (this.activeTab === 'student') {
          // 过滤出学员相关的证书（非志愿者证书）
          return this.certList.filter(item => !this.isVolunteerCert(item));
        }
        return this.certList;
      }
    },
  onLoad() {
    this.fetchCertList();
  },
  methods: {
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true;
      await this.fetchCertList();
      this.refreshing = false;
    },
  
    // 返回
    goBack() {
      uni.navigateBack({ delta: 1 })
    },
    
    // 切换证书类型标签
    switchTab(key) {
      this.activeTab = key;
    },

    // 获取证书列表
    async fetchCertList() {
      this.loading = true;
      const token = uni.getStorageSync('token');
      
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        this.loading = false;
        return;
      }

      try {
        const res = await uni.request({
          url: API_CONFIG.baseUrl + '/volunteer/certificates/all',
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.statusCode === 200 && res.data.code === 200) {
          this.certList = res.data.data || [];
        } else {
          uni.showToast({ title: res.data.msg || '获取证书失败', icon: 'none' });
        }
      } catch (error) {
        uni.showToast({ title: '网络异常', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },

    // 时间格式化
    formatTime(timeStr) {
      if (!timeStr) return '';
      return timeStr.replace('T', ' ');
    },

    // 预览证书
    previewCert(cert) {
      this.currentCert = {
        ...cert,
        camp_class_info: cert.camp_class_info || cert.service_location || '服务期间',
        receiverName: cert.receiverName || cert.receiver_name || cert.username || cert.account || '同志'
      }
      this.showPreview = true
    },
    
    // 关闭预览
    closePreview() {
      this.showPreview = false
    },
    
    // 获取证书获得者姓名
    getCertificateReceiverName(cert) {
      return cert?.receiverName || cert?.receiver_name || cert?.username || cert?.account || '同志'
    },
	
	// 判断是否为志愿者证书
	isVolunteerCert(cert) {
	      if (!cert) return false;
	      return cert.assignment_id !== null && cert.assignment_id !== undefined && cert.assignment_id !== '';
	    },
	    
	    // 判断是否为学员证书
	    isStudentCert(cert) {
	          if (!cert) return false;
	          return !this.isVolunteerCert(cert);
		}
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
.placeholder {
  width: 48rpx;
  height: 48rpx;
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

.scroll-content {
  flex: 1;
  height: 0;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
}
.content-wrapper {
  padding: 0 30rpx;
  box-sizing: border-box;
  min-height: calc(100% + 1px);
}
.section-box {
  background: #fff;
  margin: 30rpx 0;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  width: 100%;
  box-sizing: border-box;
}

/* 证书列表样式 */
.cert-card {
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}
.cert-card:last-child {
  border-bottom: none;
}
.cert-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}
.cert-type {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.cert-number {
  font-size: 26rpx;
  color: #666;
}
.cert-card-time {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 15rpx;
}
.cert-card-preview {
  text-align: right;
}
.preview-link {
  font-size: 26rpx;
  color: #007AFF;
  text-decoration: underline;
}

.empty-tip {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
}
.safe-area-spacer {
  height: 200rpx;
}

/* 证书类型标签 */
.cert-tabs {
  display: flex;
  background-color: #fff;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 30rpx;
}
.cert-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}
.cert-tab.active {
  color: #A31D1D;
  font-weight: bold;
}
.cert-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 4rpx;
  background-color: #A31D1D;
  border-radius: 2rpx;
}

/* 证书预览弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.cert-preview {
  background: #fff;
  border-radius: 24rpx;
  width: 90%;
  max-width: 600rpx;
  padding: 0;
  overflow: hidden;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}
.preview-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.preview-close {
  font-size: 36rpx;
  color: #999;
}
.certificate-container {
  padding: 30rpx;
}
.certificate-wrapper {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1rpx solid #dee2e6;
  border-radius: 12rpx;
  padding: 40rpx;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}
.certificate-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20rpx;
  background: linear-gradient(90deg, #A31D1D 0%, #851212 100%);
  border-top-left-radius: 12rpx;
  border-top-right-radius: 12rpx;
}
.certificate-header {
  text-align: center;
  margin-bottom: 40rpx;
  padding-top: 20rpx;
}
.certificate-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}
.logo-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #A31D1D 0%, #851212 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(163, 29, 29, 0.3);
}
.certificate-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin: 10rpx 0;
}
.certificate-subtitle {
  font-size: 20rpx;
  color: #666;
  margin: 0;
}
.certificate-body {
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.8;
}
.certificate-grant {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 10rpx;
}
.recipient-name {
  font-weight: bold;
  font-size: 28rpx;
  color: #A31D1D;
}
.certificate-type {
  font-size: 32rpx;
  font-weight: bold;
  color: #A31D1D;
  margin: 20rpx auto;
}
.certificate-content {
  font-size: 22rpx;
  color: #666;
  line-height: 1.8;
}
.certificate-footer {
  text-align: center;
  border-top: 1rpx solid #dee2e6;
  padding-top: 20rpx;
}
.certificate-number {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 10rpx;
}
.certificate-issue-time {
  font-size: 20rpx;
  color: #666;
}
.preview-footer {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
  display: flex;
  justify-content: center;
}
.preview-close-btn {
  background: #A31D1D !important;
  color: #fff !important;
  border-radius: 12rpx !important;
  padding: 15rpx 0 !important;
  font-size: 28rpx !important;
  border: none !important;
  width: 100%;
  max-width: 300rpx;
}
</style>