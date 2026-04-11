<template>
  <view class="view-container">
    <view class="art-header">
      <view class="nav-bar">
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">颁发证书</text>
        </view>
        <view class="placeholder"></view>
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
        <!-- 营期选择 -->
        <view class="section-box scope-selector" v-if="campList.length > 0">
          <view class="selector-title">选择营期：</view>
          <scroll-view class="scope-list" scroll-x>
            <view
              v-for="camp in campList"
              :key="camp.campId"
              class="scope-item"
              :class="{ active: selectedCamp?.campId === camp.campId }"
              @click="selectCamp(camp)"
            >
              <view class="scope-duty">进行中</view>
              <view class="scope-target">{{ camp.campName }}</view>
            </view>
          </scroll-view>
        </view>

        <!-- 班长列表 -->
        <view class="section-box volunteer-list-box" v-if="selectedCamp">
          <view v-if="monitorList.length === 0" class="empty-tip">
            <text>暂无班长</text>
          </view>

          <view v-for="mon in monitorList" :key="mon.userId" class="vol-item">
            <view class="vol-info">
              <view>姓名：{{ mon.nickname || mon.account || mon.username }}</view>
              <view>手机：{{ mon.phone || '--' }}</view>
              <view class="vol-duty">职务：{{ mon.dutyType === 'learnMonitor' ? '学班' : mon.dutyType === 'checkMonitor' ? '检班' : mon.dutyType }}</view>
              <view class="vol-location">服务位置：{{ mon.campName }}-{{ mon.className }}</view>
              <view class="vol-time">服务时间：{{ mon.timeRange }}</view>
            </view>

            <view class="vol-btns">
              <button class="btn-edit" @click="openArchive(mon)">查看档案</button>
              <button
                class="btn-cert"
                :class="{ 'btn-cert-cancel': mon.certIssued }"
                @click="openCertModal(mon)"
              >
                {{ mon.certIssued ? '取消颁发' : '颁发证书' }}
              </button>
            </view>
          </view>
        </view>

        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>

    <!-- 颁发证书弹窗 -->
    <view v-if="showCertModal" class="cert-modal-mask" @click="closeCertModal">
      <view class="cert-modal" @click.stop>
        <view class="cert-title">颁发证书</view>
        <view class="cert-desc">确认颁发给 {{ currentCertUser?.nickname || currentCertUser?.account }}？</view>
        <view class="cert-label">证书类型</view>
        <view class="cert-type-box">优秀班长</view>
        <view class="cert-btns">
          <button class="cert-btn cancel" @click="closeCertModal">取消</button>
          <button class="cert-btn confirm" @click="doIssueCert">确认颁发</button>
        </view>
      </view>
    </view>

    <!-- 档案弹窗 -->
    <view v-if="showArchiveModal" class="modal-mask" @click="closeArchive">
      <view class="modal modal-large" @click.stop>
        <view class="modal-title">志愿者档案</view>

        <view class="archive-section">
          <view class="section-title">历史担任岗位</view>
          <view class="post-list">
            <view v-for="(item, idx) in postList" :key="idx" class="post-item">
              <view class="post-duty">{{ item.dutyType }}</view>
              <view class="post-location">{{ item.position }}</view>
              <view class="post-time">服务时间：{{ item.timeRange }}</view>
              <view class="post-status" :class="item.status === '正在参与' ? 'ing' : 'end'">
                {{ item.status }}
              </view>
            </view>
            <view v-if="postList.length === 0" class="empty-tip small">
              暂无岗位记录
            </view>
          </view>
        </view>

        <view class="modal-btns">
          <button class="btn-cancel" @click="closeArchive">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from '@/api/config.js';

export default {
  name: 'AdminCert',
  data() {
    return {
      token: '',
      campList: [],
      selectedCamp: null,
      monitorList: [],
      showArchiveModal: false,
      currentVol: null,
      postList: [],
      showCertModal: false,
      currentCertUser: null,
      // 下拉刷新状态
      refreshing: false
    };
  },

  computed: {
    todayDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },

  mounted() {
    this.token = uni.getStorageSync('token') || '';
    if (!this.token) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      uni.redirectTo({ url: '/pages/Login/index' });
      return;
    }
    this.loadOngoingCamps();
  },

  methods: {
    // 下拉刷新方法
    async onRefresh() {
      this.refreshing = true;
      await this.loadOngoingCamps();
      this.refreshing = false;
    },

    formatTime(timeStr) {
      if (!timeStr) return '';
      return timeStr.replace('T', ' ').slice(0, 10);
    },

    // 加载营期
    async loadOngoingCamps() {
      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}/volunteer/admin/camps`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.statusCode === 200 && res.data.code === 200) {
          this.campList = res.data.data || [];
          if (this.campList.length > 0) {
            this.selectCamp(this.campList[0]);
          }
        }
      } catch (error) {
        uni.showToast({ title: '网络异常', icon: 'none' });
      }
    },

    // 选择营期
    async selectCamp(camp) {
      this.selectedCamp = camp;
      this.monitorList = [];

      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}/volunteer/admin/monitors?campId=${camp.campId}`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.statusCode === 200 && res.data.code === 200) {
          const list = (res.data.data || []).map(mon => {
            const st = this.formatTime(mon.startTime || mon.start_time);
            const et = this.formatTime(mon.endTime || mon.end_time) || this.todayDate;
            const timeRange = `${st} ~ ${et}`;

            return {
              ...mon,
              userId: mon.user_id || mon.userId,
              dutyType: mon.duty_type || mon.dutyType,
              className: mon.class_name || mon.className,
              campName: mon.camp_name || mon.campName,
              timeRange: timeRange,
              certIssued: false
            };
          });
          this.syncCertStatus(list);
        }
      } catch (error) {
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },

    // 同步颁发状态
    syncCertStatus(list) {
      if (list.length === 0) {
        this.monitorList = list;
        return;
      }
      let count = 0;
      list.forEach(item => {
        uni.request({
          url: `${API_CONFIG.baseUrl}/volunteer/certificate/check`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          data: {
            volunteerId: item.userId,
            certificateType: '优秀班长',
            assignmentId: item.assignmentId
          },
          success: res => {
            item.certIssued = res.data?.data === true;
          },
          complete: () => {
            count++;
            if (count === list.length) this.monitorList = list;
          }
        });
      });
    },

    // 打开证书弹窗
    openCertModal(user) {
      if (user.certIssued) {
        uni.showModal({
          title: '取消确认',
          content: '确定要取消颁发该证书吗？',
          confirmColor: '#A31D1D',
          success: async (res) => {
            if (res.confirm) this.cancelCert(user);
          }
        });
        return;
      }
      this.currentCertUser = user;
      this.showCertModal = true;
    },

    // 关闭证书弹窗
    closeCertModal() {
      this.showCertModal = false;
      this.currentCertUser = null;
    },

    // 确认颁发
    async doIssueCert() {
      if (!this.currentCertUser) return;
      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}/volunteer/certificate/issue`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          data: {
            volunteerId: this.currentCertUser.userId,
            certificateType: '优秀班长',
            assignmentId: this.currentCertUser.assignmentId
          }
        });

        if (res.statusCode === 200 && res.data.code === 200) {
          uni.showToast({ title: '颁发成功', icon: 'success' });
          this.currentCertUser.certIssued = true;
        } else {
          uni.showToast({ title: '颁发失败', icon: 'none' });
        }
      } catch (error) {
        uni.showToast({ title: '网络异常', icon: 'none' });
      }
      this.closeCertModal();
    },

    // 取消颁发
    async cancelCert(vol) {
      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}/volunteer/certificate/cancel`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          data: {
            volunteerId: vol.userId,
            certificateType: '优秀班长',
            assignmentId: vol.assignmentId
          }
        });

        if (res.statusCode === 200 && res.data.code === 200) {
          uni.showToast({ title: '已取消', icon: 'success' });
          vol.certIssued = false;
        } else {
          uni.showToast({ title: '取消失败', icon: 'none' });
        }
      } catch (error) {
        uni.showToast({ title: '网络异常', icon: 'none' });
      }
    },

    // 打开档案
    async openArchive(vol) {
      this.currentVol = vol;
      this.showArchiveModal = true;
      this.loadUserPostHistory(vol.userId);
    },

    closeArchive() {
      this.showArchiveModal = false;
    },

    // 加载历史任职
    async loadUserPostHistory(userId) {
      try {
        const res = await uni.request({
          url: API_CONFIG.baseUrl + '/volunteer/user/assignments',
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          data: { userId }
        });

        if (res.statusCode === 200 && res.data.code === 200) {
          const raw = res.data.data || [];
          this.postList = raw.map(item => {
            const st = this.formatTime(item.start_time);
            const et = this.formatTime(item.end_time) || this.todayDate;
            const timeRange = `${st} ~ ${et}`;

            const positionParts = [];
            if (item.camp_name) positionParts.push(item.camp_name);
            if (item.class_name) positionParts.push(item.class_name);
            if (item.big_group_name) positionParts.push(item.big_group_name);
            if (item.small_group_name) positionParts.push(item.small_group_name);

            return {
              dutyType: item.duty_type === 'learnMonitor' ? '学班' : item.duty_type === 'checkMonitor' ? '检班' : item.duty_type,
              position: positionParts.join('-'),
              timeRange: timeRange,
              status: item.end_time ? '已结束' : '正在参与'
            };
          });
        }
      } catch (error) {
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    }
  }
};
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
  width: 100%;
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
  font-size: 28rpx;
}
.empty-tip.small {
  padding: 20rpx 0;
  font-size: 24rpx;
}
.vol-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}
.vol-item:last-child {
  border-bottom: none;
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
.vol-location {
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
.safe-area-spacer {
  height: 200rpx;
}

/* 弹窗样式 */
.cert-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.cert-modal {
  width: 520rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-sizing: border-box;
}
.cert-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
}
.cert-desc {
  font-size: 26rpx;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}
.cert-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
}
.cert-type-box {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 40rpx;
}
.cert-btns {
  display: flex;
  gap: 20rpx;
}
.cert-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  border: none;
}
.cert-btn.cancel {
  background: #f2f2f2;
  color: #666;
}
.cert-btn.confirm {
  background: #A31D1D;
  color: #fff;
}

.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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
  justify-content: center;
}
.btn-cancel {
  background: #f5f5f5;
  color: #666;
  border-radius: 12rpx;
  padding: 15rpx 30rpx;
  font-size: 26rpx;
  border: none;
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
</style>