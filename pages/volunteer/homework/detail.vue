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

    <!-- 滚动内容区 -->
    <scroll-view 
      scroll-y 
      class="scroll-content"
      :enhanced="true"
      :show-scrollbar="true"
      :scroll-with-animation="true"
      :enable-back-to-top="true"
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
              <text 
                class="detail-value" 
                :class="{ 
                  smallExcellent: homeworkDetail.isSmallGroupExcellent && !homeworkDetail.isBigGroupExcellent,
                  bigExcellent: homeworkDetail.isBigGroupExcellent
                }"
              >
                {{ homeworkDetail.isBigGroupExcellent ? '大组优秀' : (homeworkDetail.isSmallGroupExcellent ? '小组优秀' : '普通作业') }}
              </text>
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
          </view>
        </view>
        
        <view class="section-box empty-tip" v-if="!homeworkDetail">
          <text>暂无作业详情</text>
        </view>

        <!-- 底部安全区 -->
        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>
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
      dutyType: '' // 角色类型：学班/检班/学委/检委/学组/检组
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
        uni.redirectTo({ url: '/pages/login/login' });
      }, 1500);
      return;
    }

    // 获取作业详情
    this.getHomeworkDetail();
  },
  methods: {
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
        }
      });
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

/* 底部安全区 */
.safe-area-spacer { 
  height: 200rpx; 
}
</style>