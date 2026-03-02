<template>
  <!-- 模板部分完全不变 -->
  <view class="view-container">
    <view class="art-header">
      <view class="nav-bar">
        <view class="placeholder"></view>
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">作业评优</text>
        </view>
        <view class="placeholder"></view>
      </view>
      
      <view class="nav-tabs">
        <view 
          class="nav-tab" 
          :class="{ active: activeTab === 'all' }"
          @click="switchTab('all')"
          v-if="managementScopes.length > 0"
        >
          作业列表
        </view>
        <view 
          class="nav-tab" 
          :class="{ active: activeTab === 'excellent' }"
          @click="switchTab('excellent')"
          v-if="managementScopes.length > 0"
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
      v-if="managementScopes.length > 0"
    >
      <view class="content-wrapper">
        <view v-if="managementScopes.length > 0" class="section-box scope-selector">
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
              <view class="scope-target">{{ scope.fullName }}</view>
            </view>
          </scroll-view>
        </view>

        <view class="section-box calendar-section">
          <text class="section-title">作业日期：</text>
          <picker 
            mode="date" 
            :value="selectedDate" 
            start="2014-01-01" 
            :end="today" 
            @change="onDateChange"
          >
            <view class="calendar-picker">
              <text class="picker-text">{{ formatDate(selectedDate) }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="section-box search-section">
          <view class="search-input-wrapper">
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="请输入所属组织关键字筛选"
              class="search-input"
              @input="handleSearch"
              confirm-type="search"
              @confirm="handleSearch"
            />
            <view v-if="searchKeyword" class="clear-btn" @tap="clearSearch">
              <text>×</text>
            </view>
          </view>
        </view>

        <view v-if="activeTab === 'all'" class="all-homework-page">
          <view class="section-box homework-list">
            <view v-for="homework in filteredHomeworkList" :key="homework.homeworkId" class="homework-item">
              <view class="homework-header">
                <view class="name-wrapper">
                  <text class="student-name">提交人员：</text>
                  <text class="name-text">{{ homework.name || '未知提交人' }}</text>
                </view>
                <text class="homework-tag excellent" v-if="homework.isExcellent">优秀作业</text>
              </view>
              <view class="homework-info">
                <text class="info-item">
                  <text class="label">提交时间：</text>{{ formatDateTime(homework.submitTime) }}
                </text>
                <text class="info-item">
                  <text class="label">所属分组：</text>{{ homework.organization || '未分组' }}
                </text>
              </view>
              <view class="homework-actions">
                <button class="action-btn detail-btn" @tap="viewDetail(homework.homeworkId)">查看详情</button>
                <button
                  class="action-btn"
                  :class="{ excellent: !homework.isExcellent, cancel: homework.isExcellent }"
                  @tap="toggleExcellent(homework.homeworkId, homework.isExcellent)"
                >
                  {{ homework.isExcellent ? '取消优秀' : '标记优秀' }}
                </button>
              </view>
            </view>
            
            <view class="empty-tip" v-if="isLoading">
              <text>加载中...</text>
            </view>
            <view class="empty-tip" v-if="!isLoading && filteredHomeworkList.length === 0 && searchKeyword">
              <text>未找到包含「{{ searchKeyword }}」的作业</text>
            </view>
            <view class="empty-tip" v-if="!isLoading && homeworkList.length === 0 && !searchKeyword">
              <text>当天暂无作业</text>
            </view>
          </view>

          <view v-if="!selectedScope?.fullName" class="section-box empty-tip">
            <text>请选择管理范围</text>
          </view>
        </view>

        <view v-if="activeTab === 'excellent'" class="excellent-homework-page">
          <view class="section-box homework-list">
            <view v-for="homework in excellentHomeworkList" :key="homework.homeworkId" class="homework-item">
              <view class="homework-header">
                <view class="name-wrapper">
                  <text class="student-name">提交人员：</text>
                  <text class="name-text">{{ homework.name || '未知提交人' }}</text>
                </view>
                <text class="homework-tag excellent">优秀作业</text>
              </view>
              <view class="homework-info">
                <text class="info-item">
                  <text class="label">提交时间：</text>{{ formatDateTime(homework.submitTime) }}
                </text>
                <text class="info-item">
                  <text class="label">所属分组：</text>{{ homework.organization || '未分组' }}
                </text>
              </view>
              <view class="homework-actions">
                <button class="action-btn detail-btn" @tap="viewDetail(homework.homeworkId)">查看详情</button>
                <button
                  class="action-btn cancel"
                  @tap="toggleExcellent(homework.homeworkId, homework.isExcellent)"
                >
                  取消优秀
                </button>
              </view>
            </view>
            
            <view class="empty-tip" v-if="isLoading">
              <text>加载中...</text>
            </view>
            <view class="empty-tip" v-if="!isLoading && excellentHomeworkList.length === 0">
              <text>当前范围暂无优秀作业</text>
            </view>
          </view>

          <view v-if="!selectedScope?.fullName" class="section-box empty-tip">
            <text>请选择管理范围</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="managementScopes.length === 0" class="no-scope-tip">
      <text>暂无管理范围权限</text>
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config';
export default {
  name:'VolunteerTask',
  data() {
    return {
      activeTab: 'all',
      managementScopes: [],
      selectedScope: null,
      selectedDate: new Date().toISOString().split('T')[0],
      today: new Date().toISOString().split('T')[0],
      homeworkList: [],
      filteredHomeworkList: [],
      excellentHomeworkList: [],
      totalHomework: 0,
      token: uni.getStorageSync('token') || '',
      isLoading: false,
      searchKeyword: ''
    };
  },
  mounted() {
    this.token = uni.getStorageSync('token');
    this.getManagementScopes();
    
    uni.$on('refreshVolunteerTask', () => {
      this.token = uni.getStorageSync('token');
      this.getManagementScopes(); 
    });
  },
  unmounted() {
    uni.$off('refreshVolunteerTask');
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '';
      const compatibleDate = dateStr.replace(/\s+/g, 'T').replace(/-/g, '/');
      const d = new Date(compatibleDate);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
    },
    
    formatDateTime(timeStr) {
      if (!timeStr) return '无提交时间';
      const compatibleTime = timeStr.replace(/\s+/g, 'T').replace(/-/g, '/');
      const d = new Date(compatibleTime);
      if (isNaN(d.getTime())) return timeStr;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hour = String(d.getHours()).padStart(2, '0');
      const minute = String(d.getMinutes()).padStart(2, '0');
      const second = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },
    
    onDateChange(e) {
      this.selectedDate = e.detail.value;
      this.getHomeworkList();
    },
    
    getManagementScopes() {
      if (!this.token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      this.isLoading = true;
      uni.request({
        url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.getVolunteerScope}`,
        header: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' },
        success: (res) => {
          this.isLoading = false;
          if (res.data?.code === 200) {
            const newScopes = this.formatScopeData(res.data.data);
            this.managementScopes = newScopes;
            
            if (newScopes.length > 0) {
              const oldSelectedId = this.selectedScope?.assignmentId;
              const exists = newScopes.find(s => s.assignmentId === oldSelectedId);
              this.selectedScope = exists || newScopes[0];
              this.getHomeworkList(); 
            } else {
              this.selectedScope = null;
              this.homeworkList = [];
              this.filteredHomeworkList = [];
              this.excellentHomeworkList = [];
            }
          } else {
            uni.showToast({ title: res.data?.msg || '获取管理范围失败', icon: 'none' });
          }
        },
        fail: (err) => {
          this.isLoading = false;
          uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
        }
      });
    },
    
    formatScopeData(data) {
      let scopes = [];
      if (Array.isArray(data)) {
        data.forEach(item => {
          const targetType = item.targetType;
          let id = null;
          let fullName = '';
          const campName = item.campName || '';
          if (targetType === 'class') {
            id = item.classId || item.id;
            fullName = campName ? `${campName}-${item.className || item.name || ''}` : (item.className || item.name || '');
          } else if (targetType === 'big_group') {
            id = item.bigGroupId || item.id;
            const groupName = item.className ? `${item.className}-${item.bigGroupName || item.name}` : (item.bigGroupName || item.name || '');
            fullName = campName ? `${campName}-${groupName}` : groupName;
          } else if (targetType === 'small_group') {
            id = item.smallGroupId || item.id;
            const groupName = item.className ? `${item.className}-${item.bigGroupName || ''}-${item.smallGroupName || item.name}` : (item.smallGroupName || item.name || '');
            fullName = campName ? `${campName}-${groupName}` : groupName;
          }
          if (id) {
            scopes.push({
              assignmentId: item.assignmentId,
              type: targetType,
              id: id,
              dutyType: item.dutyType,
              fullName: fullName
            });
          }
        });
      }
      return scopes;
    },
    
    selectScope(scope) {
      this.selectedScope = scope;
      this.getHomeworkList();
    },
    
    switchTab(tab) {
      this.activeTab = tab;
      this.loadCurrentTabData();
    },
    
    loadCurrentTabData() {
      if (!this.selectedScope?.fullName) return;
      
      if (this.activeTab === 'all') {
        this.handleSearch();
      } else if (this.activeTab === 'excellent') {
        this.loadExcellentHomework();
      }
    },
    
    getHomeworkList() {
      if (!this.token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        uni.navigateTo({ url: '/pages/login/index' });
        return;
      }
      
      if (!this.selectedScope?.id) {
        console.warn('管理范围未选择:', this.selectedScope);
        uni.showToast({ title: '请先选择管理范围', icon: 'none' });
        return;
      }
    
      if (!this.selectedDate) {
        uni.showToast({ title: '请选择日期', icon: 'none' });
        return;
      }
    
      this.isLoading = true;
      uni.request({
        url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.getHomeworkList}/${this.selectedScope.type}/${this.selectedScope.id}/all?date=${this.selectedDate}`,
        header: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' },
        success: (res) => {
          this.isLoading = false;
          if (res.data.code === 200) {
            this.homeworkList = res.data.data.list || [];
            this.totalHomework = res.data.data.total || 0;
            this.loadCurrentTabData();
          } else {
            uni.showToast({ title: res.data.msg || '获取作业列表失败', icon: 'none' });
          }
        },
        fail: () => {
          this.isLoading = false;
          uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
        }
      });
    },
    
    loadExcellentHomework() {
      const keyword = this.searchKeyword.trim().toLowerCase();
      this.excellentHomeworkList = this.homeworkList.filter(item => {
        const org = (item.organization || '').toLowerCase();
        return item.isExcellent && (!keyword || org.includes(keyword));
      });
    },
    
    handleSearch() {
      const keyword = this.searchKeyword.trim().toLowerCase();
      this.filteredHomeworkList = this.homeworkList.filter(item => {
        const org = (item.organization || '').toLowerCase();
        return !keyword || org.includes(keyword);
      });
      this.loadExcellentHomework();
    },
    
    clearSearch() {
      this.searchKeyword = '';
      this.handleSearch();
    },
    
    viewDetail(homeworkId) {
      uni.navigateTo({ url: `/pages/volunteer/homework/detail?homeworkId=${homeworkId}` });
    },
    
    toggleExcellent(homeworkId, isExcellent) {
      uni.showModal({
        content: isExcellent ? '确定取消优秀？' : '设为优秀作业？',
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.markExcellentHomework}/${homeworkId}/${isExcellent ? 0 : 1}`,
              method: 'POST',
              header: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' },
              success: (res) => {
                if (res.data.code === 200) {
                  uni.showToast({ title: '操作成功' });
                  this.getHomeworkList();
                } else {
                  uni.showToast({ title: res.data.msg || '操作失败', icon: 'none' });
                }
              },
              fail: () => uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
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
  height: 100vh; 
  display: flex;
  flex-direction: column;
  background-color: #F4F4F5;
  width: 100%;
  overflow: hidden; 
}

.art-header {
  background: linear-gradient(160deg, #A31D1D 0%, #851212 100%);
  padding: 88rpx 30rpx 30rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0; 
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
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
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; 
}

.content-wrapper {
  padding: 0 30rpx 120rpx; 
  box-sizing: border-box;
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

.search-section {
  padding: 20rpx 30rpx;
}
.search-input-wrapper {
  position: relative;
  width: 100%;
}
.search-input {
  width: 100%;
  height: 80rpx;
  padding: 0 80rpx 0 30rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 40rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #fafafa;
}
.search-input:focus {
  border-color: #A31D1D;
  background-color: #fff;
}
.clear-btn {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  border-radius: 50%;
}
.clear-btn text {
  font-size: 24rpx;
  color: #666;
  font-weight: bold;
}

.homework-list {
  padding: 0;
}
.homework-item {
  background-color: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}
.homework-item:last-child {
  margin-bottom: 0;
}

.homework-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx; 
}
.name-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.student-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
.name-text {
  font-size: 28rpx;
  color: #333;
  margin-left: 4rpx;
}
.homework-tag {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: bold;
}
.homework-tag.excellent {
  background-color: #A31D1D;
  color: white;
}

.homework-info {
  margin-bottom: 24rpx;
}
.info-item {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx; 
}
.info-item:last-child {
  margin-bottom: 0; 
}
.label {
  font-weight: bold;
  color: #333;
}

.homework-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}
.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  flex-shrink: 0;
}
.action-btn.detail-btn {
  background-color: #A31D1D;
  color: white;
}
.action-btn.excellent {
  background-color: #27ae60;
  color: white;
}
.action-btn.cancel {
  background-color: #95a5a6;
  color: white;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}

.no-scope-tip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #999;
  background-color: #F4F4F5;
}
</style>