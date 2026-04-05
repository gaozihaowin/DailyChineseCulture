<template>
  <view class="view-container">
    <!-- 顶部标题栏-->
    <view class="art-header"> 
      <view class="nav-bar"> 
        <view class="back-btn" @tap="goBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand"> 
          <text class="brand-en">ZHI LIANG ZHI</text> 
          <text class="brand-cn">作业列表</text> 
        </view> 
        <view style="width: 48rpx;"></view>
      </view> 
      
      <!-- 作业列表/优秀作业 标签切换 -->
      <view class="nav-tabs">
        <view 
          class="nav-tab" 
          :class="{ active: activeTab === 'all' }"
          @click="switchTab('all')"
        >
          作业列表
        </view>
        <view 
          class="nav-tab" 
          :class="{ active: activeTab === 'excellent' }"
          @click="switchTab('excellent')"
        >
          优秀作业
        </view>
      </view>
    </view>

    <scroll-view 
      scroll-y 
      class="scroll-content"
      :enhanced="true"
      :show-scrollbar="true"
      :scroll-with-animation="true"
      :enable-back-to-top="true"
    >
      <view class="content-wrapper"> 
        <!-- 日期选择 -->
        <view class="section-box calendar-section"> 
          <text class="section-title">作业日期：</text> 
          <picker mode="date" :value="selectedDate" start="2000-01-01" :end="today" @change="onDateChange"> 
            <view class="calendar-picker"> 
              <text class="picker-text">{{ formatDate(selectedDate) }}</text> 
              <text class="picker-arrow">▼</text> 
            </view> 
          </picker> 
        </view> 

        <!-- 作业列表内容 -->
        <view class="section-box task-content">
          <view v-if="homeworkList.length === 0" class="empty-tip">
            <text>暂无作业</text>
          </view>
          <view v-else class="homework-list">
            <view
              v-for="homework in homeworkList"
              :key="homework.homeworkId"
              class="homework-item"
            >
              <!-- 优秀作业标签 -->
              <view v-if="homework.isSmallGroupExcellent || homework.isBigGroupExcellent" class="excellent-tag">
                {{ homework.isBigGroupExcellent ? '大组优秀' : '小组优秀' }}
              </view>
              
              <view class="homework-header">
                <text class="homework-info">提交人员：{{ homework.name }}</text>
                <text class="homework-info">提交时间：{{ formatDateTime(homework.submitTime) }}</text>
				<text class="homework-info">所属分组：{{ homework.organization }}</text>
              </view>
              
              <view class="homework-footer">
                <button class="detail-btn" @click="navigateToHomeworkDetail(homework.homeworkId, homework.userId, homework.name)">查看详情</button>
                
                <!-- 小组优秀按钮 -->
                <button
                  class="small-excellent-btn"
                  :class="{ active: homework.isSmallGroupExcellent }"
                  @click="toggleSmallGroupExcellent(homework.homeworkId, !homework.isSmallGroupExcellent)"
                  :disabled="!canOperateSmallGroup(homework)"
                >
                  {{ homework.isSmallGroupExcellent ? '取消小组优秀' : '标记小组优秀' }}
                </button>
                
                <!-- 大组优秀按钮 -->
                <button
                  class="big-excellent-btn"
                  :class="{ active: homework.isBigGroupExcellent }"
                  @click="toggleBigGroupExcellent(homework.homeworkId, !homework.isBigGroupExcellent)"
                  :disabled="!canOperateBigGroup(homework)"
                >
                  {{ homework.isBigGroupExcellent ? '取消大组优秀' : '标记大组优秀' }}
                </button>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部安全区占位 -->
        <view class="safe-area-spacer"></view> 
      </view> 
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../../api/config';

export default {
  data() {
    return {
      smallGroupId: '',
      smallGroupName: '',
      selectedDate: '',
      today: new Date().toISOString().split('T')[0],
      dutyType: '',
      activeTab: 'all',
      homeworkList: [],
      token: uni.getStorageSync('token') || ''
    };
  },
  onLoad(options) {
    this.smallGroupId = options.smallGroupId;
    this.smallGroupName = options.smallGroupName;
    this.selectedDate = options.date;
    this.dutyType = options.dutyType;
    this.getHomeworkList();
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1, 
      });
    },
    
    // 日期格式化
    formatDate(dateStr) { 
      if (!dateStr) return '';
      const compatibleDate = dateStr.replace(/\s+/g, 'T').replace(/-/g, '/');
      const d = new Date(compatibleDate);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; 
    },
    
    // 日期变更
    onDateChange(e) {
      this.selectedDate = e.detail.value;
      this.getHomeworkList();
    },
    
    // 切换标签
    switchTab(tab) {
      this.activeTab = tab;
      this.getHomeworkList();
    },
    
    // 获取作业列表
    getHomeworkList() {
      if (!this.token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
    
      // 构造参数
      const params = {
        type: 'small_group', // 固定为small_group
        id: this.smallGroupId, 
        status: this.activeTab === 'excellent' ? 'excellent' : undefined, 
        date: this.selectedDate 
      };
    
      // 拼接查询字符串
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    
      uni.request({
        url: `${API_CONFIG.baseUrl}/homework/list${queryString ? '?' + queryString : ''}`,
        method: 'GET', 
        header: {
          'Authorization': `Bearer ${this.token}` 
        },
        success: (res) => {
          if (res.data?.code === 200) {
            this.homeworkList = res.data.data.list || [];
            this.homeworkList = this.homeworkList.map(item => ({
              ...item,
              isSmallGroupExcellent: Number(item.isSmallGroupExcellent) === 1,
              isBigGroupExcellent: Number(item.isBigGroupExcellent) === 1
            }));
          } else {
            uni.showToast({ title: res.data?.msg || '获取作业列表失败', icon: 'none' });
            this.homeworkList = [];
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络错误', icon: 'none' });
          this.homeworkList = [];
        }
      });
    },
    
    // 是否可操作小组优秀
    canOperateSmallGroup(homework) {
      // 所有角色都可操作小组优秀
      if (['学班', '检班', '学委', '检委', '学组', '检组'].includes(this.dutyType)) {
        return true;
      }
      return false;
    },

    // 是否可操作大组优秀（所有角色都需先标记小组优秀）
    canOperateBigGroup(homework) {
      // 1. 学组/检组：无权限操作大组优秀
      if (this.dutyType === '学组' || this.dutyType === '检组') {
        return false;
      }
      // 2. 学委/检委/学班/检班：必须先标记为小组优秀才能操作大组优秀
      return homework.isSmallGroupExcellent;
    },
    
    // 标记/取消小组优秀
    toggleSmallGroupExcellent(homeworkId, isExcellent) {
      uni.showModal({
        title: '确认操作',
        content: isExcellent ? '确定标记为小组优秀作业吗？' : '确定取消小组优秀作业吗？',
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
                homeworkId: homeworkId, 
                isSmallGroupExcellent: isExcellent ? 1 : 0 
              },
              success: (res) => {
                if (res.data?.code === 200) {
                  uni.showToast({ title: isExcellent ? '标记小组优秀成功' : '取消小组优秀成功', icon: 'success' });
                  // 更新本地作业列表
                  const homework = this.homeworkList.find(item => item.homeworkId === homeworkId);
                  if (homework) {
                    homework.isSmallGroupExcellent = isExcellent;
                    // 如果取消小组优秀，同时取消大组优秀
                    if (!isExcellent) {
                      homework.isBigGroupExcellent = false;
                    }
                  }
                } else {
                  uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
                }
              },
              fail: (err) => {
                uni.showToast({ title: '网络错误', icon: 'none' });
              }
            });
          }
        }
      });
    },

    // 标记/取消大组优秀
    toggleBigGroupExcellent(homeworkId, isExcellent) {
      // 学组/检组无权限
      if (this.dutyType === '学组' || this.dutyType === '检组') {
        uni.showToast({ title: '无权限操作大组优秀', icon: 'none' });
        return;
      }
      
      const homework = this.homeworkList.find(item => item.homeworkId === homeworkId);
      // 未标记小组优秀（所有有权限的角色通用）
      if (isExcellent && !homework?.isSmallGroupExcellent) {
        uni.showToast({ title: '请先将该作业标记为小组优秀', icon: 'none' });
        return;
      }

      uni.showModal({
        title: '确认操作',
        content: isExcellent ? '确定标记为大组优秀作业吗？' : '确定取消大组优秀作业吗？',
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
                homeworkId: homeworkId, 
                isBigGroupExcellent: isExcellent ? 1 : 0 
              },
              success: (res) => {
                if (res.data?.code === 200) {
                  uni.showToast({ title: isExcellent ? '标记大组优秀成功' : '取消大组优秀成功', icon: 'success' });
                  // 更新本地作业列表
                  const homework = this.homeworkList.find(item => item.homeworkId === homeworkId);
                  if (homework) {
                    homework.isBigGroupExcellent = isExcellent;
                  }
                } else {
                  uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
                }
              },
              fail: (err) => {
                uni.showToast({ title: '网络错误', icon: 'none' });
              }
            });
          }
        }
      });
    },
    
    // 跳转到作业详情
    navigateToHomeworkDetail(homeworkId, userId, userName) {
      if (!homeworkId || isNaN(Number(homeworkId))) {
        uni.showToast({ title: '作业ID无效', icon: 'none' });
        return;
      }
      uni.navigateTo({
        url: `/pages/volunteer/homework/detail?homeworkId=${Number(homeworkId)}&userId=${userId}&name=${userName}&date=${this.selectedDate}&dutyType=${this.dutyType}`
      });
    },
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
  margin-bottom: 30rpx;
  width: 100%;
} 

/* 返回按钮样式 */
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

/* 顶部标签切换样式 */
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

/* 日期选择 */
.calendar-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-title {
  font-size: 28rpx;
  color: #333;
}
.calendar-picker {
  display: flex;
  align-items: center;
  padding: 8rpx 12rpx;
  border: 1rpx solid #ddd;
  border-radius: 4rpx;
}
.picker-text {
  font-size: 28rpx;
  color: #333;
  margin-right: 8rpx;
}
.picker-arrow {
  font-size: 24rpx;
  color: #999;
}

/* 作业管理内容样式 */
.task-content {
  padding: 30rpx;
}

/* 空数据提示 */
.empty-tip { 
  text-align: center; 
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
} 

/* 作业列表样式 */
.homework-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.homework-item {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  position: relative; /* 为优秀标签定位 */
  border: none;
}

/* 优秀作业标签 */
.excellent-tag {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background-color: #A31D1D;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-weight: bold;
}

.homework-header {
  margin-bottom: 15rpx;
}

/* 作业信息样式 */
.homework-info {
  font-size: 26rpx;   
  color: #333;        
  display: block;
  margin-bottom: 8rpx;
}

.homework-item .homework-info:last-of-type {
  margin-bottom: 20rpx;
}

.homework-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #e5e5e5;
  margin-top: 0;
  gap: 10rpx;
}

.detail-btn {
  padding: 12rpx 20rpx;
  background-color: #A31D1D;
  color: white;
  border-radius: 12rpx;
  font-size: 24rpx;
  border: none;
  transition: all 0.3s;
  flex-shrink: 0;
}

.detail-btn:hover {
  background-color: #851212;
}

/* 小组优秀按钮样式 */
.small-excellent-btn {
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  border: none;
  flex-shrink: 0;
}
.small-excellent-btn:not(.active) {
  background-color: #4CAF50;
  color: white;
}
.small-excellent-btn.active {
  background-color: #FFD700;
  color: #333;
  font-weight: bold;
}
.small-excellent-btn:disabled {
  background-color: #ccc;
  color: #666;
}

/* 大组优秀按钮样式 */
.big-excellent-btn {
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  border: none;
  flex-shrink: 0;
}
.big-excellent-btn:not(.active) {
  background-color: #2196F3;
  color: white;
}
.big-excellent-btn.active {
  background-color: #9C27B0;
  color: white;
  font-weight: bold;
}
.big-excellent-btn:disabled {
  background-color: #ccc;
  color: #666;
}

/* 底部安全区 */
.safe-area-spacer { 
  height: 200rpx; 
}
</style>