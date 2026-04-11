<template>
  <view class="view-container">
    <view class="art-header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">志愿者证书管理</text>
        </view>
        <view class="placeholder"></view>
      </view>

      <view class="nav-tabs">
        <view class="nav-tab" :class="{active:activeTab==='manage'}" @click="switchTab('manage')">
          志愿者管理
        </view>
        <view class="nav-tab" :class="{active:activeTab==='my'}" @click="switchTab('my')">
          我的证书
        </view>
      </view>
    </view>

    <!-- 添加下拉刷新 -->
    <scroll-view 
      scroll-y 
      class="scroll-content"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="content-wrapper">
        <view v-if="activeTab === 'manage'">
          <view class="section-box scope-selector">
            <view class="selector-title">选择管理范围：</view>
            <scroll-view class="scope-list" scroll-x>
              <view
                v-for="scope in managementScopes"
                :key="scope.assignmentId"
                class="scope-item"
                :class="{ active: selectedScope?.assignmentId === scope.assignmentId }"
                @click="selectScope(scope)"
              >
                <view class="scope-duty">{{ scope.dutyType }}</view>
                <view class="scope-target">{{ scope.label }}</view>
              </view>
            </scroll-view>
          </view>

          <view class="section-box volunteer-list-box">
            <view v-if="volunteerList.length === 0" class="empty-tip">
              <text>{{ selectedScope ? '暂无志愿者' : '请选择管理范围' }}</text>
            </view>

            <view v-for="vol in volunteerList" :key="`${vol.userId}-${vol.assignmentId}`" class="vol-item">
              <view class="vol-info">
                <view>姓名：{{ vol.nickname || vol.username || vol.account }}</view>
                <view>手机：{{ vol.phone || '未填写' }}</view>
                <view class="vol-duty">职务：{{ vol.dutyType }}</view>
                <view class="vol-position">服务位置：{{ vol.position }}</view>
                <view class="vol-time">服务时间：{{ vol.timeRange }}</view>
              </view>

              <view class="vol-btns">
                <button class="btn-edit" @click="openArchive(vol)">查看档案</button>
                <button
                  class="btn-cert"
                  :class="{ 'btn-cert-cancel': vol.certIssued }"
                  @click="vol.certIssued ? cancelCert(vol) : openIssueCert(vol)"
                >
                  {{ vol.certIssued ? '取消颁发' : '颁发证书' }}
                </button>
              </view>
            </view>
          </view>
        </view>

        <view v-if="activeTab === 'my'">
          <view class="section-box cert-list-box">
            <view v-if="myCertList.length === 0" class="empty-tip">
              <text>暂无证书</text>
            </view>

            <view v-for="cert in myCertList" :key="cert.id" class="cert-card">
              <view class="cert-card-header">
                <text class="cert-type">{{ cert.certificateType }}</text>
                <text class="cert-number">编号: {{ cert.number }}</text>
              </view>
              <view class="cert-card-time">颁发时间: {{ this.formatTime(cert.issueTime) }}</view>
              <view class="cert-card-preview">
                <text class="preview-link" @click="previewCert(cert)">点击预览</text>
              </view>
            </view>
          </view>
        </view>

        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>

    <view v-if="showArchiveModal" class="modal-mask" @click="closeArchive">
      <view class="modal modal-large" @click.stop>
        <view class="modal-title">志愿者档案</view>

        <view class="archive-section">
          <view class="section-title">历史担任岗位</view>
          <view class="post-list">
            <view v-for="(item, idx) in showPostList" :key="idx" class="post-item">
              <view class="post-duty">{{ item.dutyType }}</view>
              <view class="post-location">{{ item.position }}</view>
              <view class="post-time">服务时间：{{ item.timeRange }}</view>
              <view class="post-status" :class="item.status === '正在参与' ? 'ing' : 'end'">
                {{ item.status }}
              </view>
            </view>
            <view v-if="showPostList.length === 0" class="empty-tip small">
              暂无岗位记录
            </view>
          </view>
        </view>

        <view class="modal-btns">
          <button class="btn-cancel" @click="closeArchive">关闭</button>
        </view>
      </view>
    </view>

    <view v-if="showIssueModal" class="modal-mask" @click="closeIssue">
      <view class="modal" @click.stop>
        <view class="modal-title">颁发证书</view>
        <view class="modal-form">
          <view>颁发给：{{ currentVol.nickname || currentVol.username || currentVol.account }}</view>
          <picker :value="certTypeIndex" :range="certTypeList" @change="onCertTypeChange">
            <view class="form-picker">
              <text>{{ certType }}</text>
            </view>
          </picker>
        </view>
        <view class="modal-btns">
          <button class="btn-cancel" @click="closeIssue">取消</button>
          <button class="btn-confirm" @click="submitIssue">确认颁发</button>
        </view>
      </view>
    </view>

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
              <h1 class="certificate-title">志愿者证书</h1>
              <p class="certificate-subtitle">CERTIFICATE OF VOLUNTEER</p>
            </view>
            
            <view class="certificate-body">
              <p class="certificate-grant">兹授予 <span class="recipient-name">{{ getCertificateReceiverName(currentCert) }}</span> 同志</p>
              <h2 class="certificate-type">{{ currentCert?.certificateType }}</h2>
              <p class="certificate-content">
                嘉许您在{{ currentCert?.camp_class_info || '服务期间' }}的志愿服务中，<br>
                表现出色，贡献突出，<br>
                特颁发此证，以资鼓励。
              </p>
            </view>
            
            <view class="certificate-footer">
              <p class="certificate-number">编号: {{ currentCert?.number }}</p>
              <p class="certificate-issue-time">颁发时间: {{ this.formatTime(currentCert?.issueTime) }}</p>
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
import { API_CONFIG } from '../../api/config.js'

export default {
  data() {
    return {
      activeTab: 'manage',
      token: '',
      managementScopes: [],
      selectedScope: null,
      volunteerList: [],
      myCertList: [],
      showArchiveModal: false,
      currentVol: null,
      userPostList: [],
      showPostList: [],
      showIssueModal: false,
      certType: '优秀志愿者',
      certTypeIndex: 0,
      certTypeList: ['优秀志愿者', '优秀小组组长', '优秀大组组长', '优秀班长', '优秀功课'],
      showPreview: false,
      currentCert: null,
      // 下拉刷新状态
      refreshing: false
    }
  },
  onLoad() {
    this.token = uni.getStorageSync('token')
    if (!this.token) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    this.getManagementScopes()
  },
  computed: {
    allowedDuties() {
      return ['学委', '检委', '学班', '检班', '学组', '检组']
    },
    todayDate() {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  },
  methods: {
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true;
      
      if (this.activeTab === 'manage') {
        await this.getManagementScopes();
      } else {
        await this.loadMyAllCerts();
      }
      
      this.refreshing = false;
    },

    formatTime(timeStr) {
      if (!timeStr) return ''
      return timeStr.replace('T', ' ')
    },

    goBack() {
      uni.navigateBack({ delta: 1 })
    },
    getManagementScopes() {
      return new Promise((resolve) => {
        uni.request({
          url: API_CONFIG.baseUrl + '/volunteer/scopes',
          header: { Authorization: 'Bearer ' + this.token },
          success: res => {
            if (res.data.code === 200) {
              this.managementScopes = this.formatScopeData(res.data.data)
              if (this.managementScopes.length > 0) {
                this.selectScope(this.managementScopes[0])
              }
            }
            resolve()
          },
          fail: () => resolve()
        })
      })
    },
    formatScopeData(data) {
      return data.map(scope => {
        let label = ''
        let dutyType = scope.dutyType || scope.duty_type
        
        let sb = ''
        if (scope.campName) {
          sb += scope.campName
          if (scope.className) {
            sb += '-' + scope.className
            if (scope.bigGroupName) {
              sb += '-' + scope.bigGroupName
              if (scope.smallGroupName) {
                sb += '-' + scope.smallGroupName
              }
            }
          }
        }
        label = sb
        
        return { ...scope, label, dutyType }
      })
    },
    selectScope(scope) {
      this.selectedScope = scope
      this.volunteerList = []
      uni.request({
        url: API_CONFIG.baseUrl + '/volunteer/manage/volunteers',
        method: 'GET',
        header: { Authorization: 'Bearer ' + this.token },
        data: { assignmentId: scope.assignmentId },
        success: res => {
          if (res.data.code === 200) {
            let list = (res.data.data || []).map(vol => {
              const dutyType = vol.duty_type || vol.dutyType || ''
              
              let position = ''
              if (vol.camp_name) {
                position += vol.camp_name
                if (vol.class_name) {
                  position += '-' + vol.class_name
                  if (vol.big_group_name) {
                    position += '-' + vol.big_group_name
                    if (vol.small_group_name) {
                      position += '-' + vol.small_group_name
                    }
                  }
                }
              }

              const st = vol.start_time ? vol.start_time.slice(0, 10) : ''
              const et = vol.end_time ? vol.end_time.slice(0, 10) : this.todayDate
              const timeRange = st ? `${st} ~ ${et}` : et

              return {
                ...vol,
                userId: vol.user_id || vol.userId,
                dutyType,
                assignmentId: vol.assignment_id || vol.assignmentId,
                certIssued: false,
                position,
                timeRange
              }
            })
            this.syncCertStatus(list)
          }
        }
      })
    },
    syncCertStatus(list) {
      if (list.length === 0) {
        this.volunteerList = list
        return
      }
      let count = 0
      list.forEach(item => {
        const certType = this.getCertTypeByDuty()
        uni.request({
          url: API_CONFIG.baseUrl + '/volunteer/certificate/check',
          header: { Authorization: 'Bearer ' + this.token },
		  method: 'POST',
          data: {
            volunteerId: item.userId,
            certificateType: certType,
            assignmentId: item.assignmentId
          },
          success: res => {
            item.certIssued = res.data?.data === true
          },
          complete: () => {
            count++
            if (count === list.length) this.volunteerList = list
          }
        })
      })
    },
    switchTab(tab) {
      this.activeTab = tab
      if (tab === 'my') {
        this.loadMyAllCerts()
      }
    },
    loadMyAllCerts() {
      return new Promise((resolve) => {
        uni.request({
          url: API_CONFIG.baseUrl + '/volunteer/certificates/self',
          header: { Authorization: 'Bearer ' + this.token },
          method: 'GET',
          success: res => {
            if (res.data.code === 200) {
              this.myCertList = (res.data.data || []).map(c => ({
                ...c,
                id: c.cert_id || c.id,
                certificateType: c.type || c.certificateType,
                issueTime: c.issue_time || c.issueTime,
                number: c.number || '无',
                receiverName: c.receiver_name || c.receiverName || c.username || c.account || '同志'
              }))
            }
            resolve()
          },
          fail: () => resolve()
        })
      })
    },
    openArchive(vol) {
      this.currentVol = { ...vol }
      this.showArchiveModal = true
      this.loadUserPostHistory(vol.userId)
    },
    closeArchive() {
      this.showArchiveModal = false
    },
    loadUserPostHistory(userId) {
      uni.request({
        url: API_CONFIG.baseUrl + '/volunteer/user/assignments',
        header: { Authorization: 'Bearer ' + this.token },
        method: 'POST',
        data: { userId },
        success: res => {
          if (res.data.code === 200) {
            const raw = res.data.data || []
            const list = raw.map(item => {
              const dutyType = item.dutyType || item.duty_type || ''
              
              let position = ''
              if (item.camp_name) {
                position += item.camp_name
                if (item.class_name) {
                  position += '-' + item.class_name
                  if (item.big_group_name) {
                    position += '-' + item.big_group_name
                    if (item.small_group_name) {
                      position += '-' + item.small_group_name
                    }
                  }
                }
              }

              const st = item.start_time ? item.start_time.slice(0, 10) : ''
              const et = item.end_time ? item.end_time.slice(0, 10) : this.todayDate
              const timeRange = st ? `${st} ~ ${et}` : et
              const status = item.end_time ? '已结束' : '正在参与'
              return { dutyType, position, timeRange, status }
            })
            this.userPostList = list
            this.showPostList = list.filter(i => this.allowedDuties.includes(i.dutyType))
          }
        }
      })
    },
    openIssueCert(vol) {
      this.currentVol = vol
      this.certType = this.getCertTypeByDuty()
      this.certTypeIndex = this.certTypeList.indexOf(this.certType)
      this.showIssueModal = true
    },
    closeIssue() {
      this.showIssueModal = false
    },
    onCertTypeChange(e) {
      this.certTypeIndex = e.detail.value
      this.certType = this.certTypeList[this.certTypeIndex]
    },
    getCertTypeByDuty() {
      const d = this.selectedScope?.dutyType
      if (d === '学班' || d === '检班') return '优秀大组组长'
      if (d === '学委' || d === '检委') return '优秀小组组长'
      if (d === '学组' || d === '检组') return '优秀志愿者'
      return '优秀志愿者'
    },
    submitIssue() {
      if (!this.currentVol || !this.currentVol.userId) return
      const vid = this.currentVol.userId
      const type = this.certType
      const assignmentId = this.currentVol.assignmentId
      
      uni.request({
        url: API_CONFIG.baseUrl + '/volunteer/certificate/issue',
        method: 'POST',
        header: { Authorization: 'Bearer ' + this.token },
        data: { 
          volunteerId: vid, 
          certificateType: type,
          assignmentId: assignmentId
        },
        success: res => {
          if (res.data.code === 200) {
            uni.showToast({ title: '颁发成功' })
            this.closeIssue()
            this.currentVol.certIssued = true
            this.loadMyAllCerts()
          } else {
            uni.showToast({ title: res.data.msg || '颁发失败', icon: 'none' })
          }
        }
      })
    },
    cancelCert(vol) {
      const certType = this.getCertTypeByDuty()
      const assignmentId = vol.assignmentId
      
      uni.showModal({
        content: '确定取消颁发该证书吗？',
        success: res => {
          if (res.confirm) {
            uni.request({
              url: API_CONFIG.baseUrl + '/volunteer/certificate/cancel',
              method: 'POST',
              header: { Authorization: 'Bearer ' + this.token },
              data: { 
                volunteerId: vol.userId, 
                certificateType: certType,
                assignmentId: assignmentId
              },
              success: res => {
                if (res.data.code === 200) {
                  uni.showToast({ title: '已取消' })
                  vol.certIssued = false
                } else {
                  uni.showToast({ title: res.data.msg || '取消失败', icon: 'none' })
                }
              }
            })
          }
        }
      })
    },
    previewCert(cert) {
      this.currentCert = {
        ...cert,
        camp_class_info: cert.camp_class_info || cert.service_location || '服务期间',
        
        receiverName: cert.receiverName || cert.receiver_name || cert.username || cert.account || '同志',
        certificateType: cert.certificateType,
        number: cert.number,
        issueTime: cert.issueTime
      }
      this.showPreview = true
    },
    closePreview() {
      this.showPreview = false
    },
    
    getCertificateReceiverName(cert) {
      return cert?.receiverName || cert?.receiver_name || cert?.username || cert?.account || '同志'
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
.scope-selector .selector-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: bold;
}
.scope-list {
  white-space: nowrap;
}
.scope-item {
  display: inline-block;
  padding: 15rpx 25rpx;
  margin-right: 15rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  background: #fafafa;
  min-width: 200rpx;
}
.scope-item.active {
  border-color: #A31D1D;
  background: #fdf2f2;
}
.scope-duty {
  font-size: 24rpx;
  color: #A31D1D;
  font-weight: bold;
  margin-bottom: 5rpx;
}
.scope-target {
  font-size: 22rpx;
  color: #666;
}
.empty-tip {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
}
.vol-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}
.vol-info {
  font-size: 26rpx;
  line-height: 1.8;
  margin-bottom: 15rpx;
}
.vol-duty {
  font-size: 26rpx;
  color: #666;
}
.vol-position {
  font-size: 24rpx;
  color: #666;
  margin: 4rpx 0;
}
.vol-time {
  font-size: 24rpx;
  color: #666;
  margin: 4rpx 0;
}
.vol-btns {
  display: flex;
  gap: 15rpx;
}
.btn-edit {
  background: #2196F3 !important;
  color: #fff !important;
  border-radius: 12rpx !important;
  padding: 10rpx 20rpx !important;
  font-size: 24rpx !important;
  border: none !important;
}
.btn-cert {
  background: #4CAF50 !important;
  color: #fff !important;
  border-radius: 12rpx !important;
  padding: 10rpx 20rpx !important;
  font-size: 24rpx !important;
  border: none !important;
}
.btn-cert-cancel {
  background: #f44336 !important;
}
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
.safe-area-spacer {
  height: 200rpx;
}
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
.modal {
  background: #fff;
  border-radius: 24rpx;
  width: 80%;
  padding: 30rpx;
}
.modal-large {
  width: 85%;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}
.modal-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}
.btn-cancel {
  flex: 1;
  background: #f5f5f5;
  color: #666;
  border-radius: 12rpx;
  padding: 15rpx;
}
.btn-confirm {
  flex: 1;
  background: #A31D1D;
  color: #fff;
  border-radius: 12rpx;
  padding: 15rpx;
}
.archive-section {
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}
.post-item {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
}
.post-duty {
  font-size: 28rpx;
  font-weight: bold;
  color: #A31D1D;
}
.post-location {
  font-size: 24rpx;
  color: #666;
  margin: 6rpx 0;
}
.post-time {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 6rpx;
}
.post-status {
  font-size: 22rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  display: inline-block;
}
.post-status.ing {
  background: #e8f5e9;
  color: #2e7d32;
}
.post-status.end {
  background: #f5f5f5;
  color: #616161;
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