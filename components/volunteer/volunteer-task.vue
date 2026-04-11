<template>
  <view class="view-container">
    <!-- 顶部标题栏 -->
    <view class="art-header"> 
      <view class="nav-bar"> 
        <view class="placeholder"></view>
        <view class="nav-brand"> 
          <text class="brand-en">ZHI LIANG ZHI</text> 
          <text class="brand-cn">作业评优</text> 
        </view> 
        <view class="placeholder"></view>
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

    <!-- 下拉刷新 -->
    <scroll-view 
      scroll-y 
      class="scroll-content"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="content-wrapper"> 
        <!-- 管理范围选择 -->
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

        <!-- 作业管理内容 -->
        <view class="section-box task-content">
          <!-- 层级列表 -->
          <view v-if="showHierarchyList && activeTab === 'all'" class="hierarchy-container">
            <view v-if="hierarchyData.list.length === 0 && selectedScope" class="empty-tip">
              <text>暂无数据</text>
            </view>
            <view v-else-if="!selectedScope" class="empty-tip">
              <text>请先选择管理范围</text>
            </view>
            <view v-else class="hierarchy-list">
              <view
                v-for="item in hierarchyData.list"
                :key="item.id"
                class="hierarchy-item"
              >
                <view class="item-header" @click="toggleExpand(item)">
                  <text class="item-name">{{ item.name }}</text>
                  <text class="expand-icon" v-if="item.expandable && item.type !== 'smallGroup'">{{ item.expanded ? '▼' : '▶' }}</text>
                  <text class="arrow-icon" v-if="item.type === 'smallGroup'" @click.stop="navigateToHomeworkList(item)">▶</text>
                </view>
                <view v-if="item.expanded && item.children && item.type !== 'smallGroup'" class="children-list">
                  <view
                    v-for="child in item.children"
                    :key="child.id"
                    class="child-item"
                  >
                    <view class="item-header" @click="toggleExpand(child)">
                      <text class="item-name">{{ child.name }}</text>
                      <text class="arrow-icon" v-if="child.type === 'smallGroup'" @click.stop="navigateToHomeworkList(child)">▶</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 作业列表（万能证书角标） -->
          <view v-else class="homework-container">
            <view v-if="homeworkList.length === 0 && selectedScope" class="empty-tip">
              <text>{{ activeTab === 'excellent' ? '暂无优秀作业' : '暂无作业' }}</text>
            </view>
            <view v-else-if="!selectedScope" class="empty-tip">
              <text>请先选择管理范围</text>
            </view>
            <view v-else class="homework-list">
              <view
                v-for="homework in homeworkList"
                :key="homework.homeworkId"
                class="homework-item"
              >
                <!-- 所有证书角标（自动显示所有类型：小组/大组/自定义） -->
                <view class="cert-tags-container">
                    <view 
                        v-for="tag in homework.certificateTags" 
                        :key="tag.key"
                        class="cert-tag"
                    >
                  {{ tag.text }}
                    </view>                
                </view>

                <view class="homework-header">
                  <text class="homework-info">提交人员：{{ homework.name }}</text>
                  <text class="homework-info">提交时间：{{ formatDateTime(homework.submitTime) }}</text>
                  <text class="homework-info">所属分组：{{ homework.organization }}</text>
                </view>
                
                <view class="homework-footer">
                  <button class="detail-btn" @click="navigateToHomeworkDetail(homework.homeworkId, homework.userId, homework.name)">查看详情</button>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="safe-area-spacer"></view> 
      </view> 
    </scroll-view>

    <view v-if="managementScopes.length === 0" class="no-scope-tip"> 
      <text>暂无管理范围权限</text> 
    </view> 
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config.js'; 

export default {
  data() {
    return {
      managementScopes: [],
      selectedScope: null,
      selectedDate: new Date().toISOString().split('T')[0],
      today: new Date().toISOString().split('T')[0],
      activeTab: 'all',
      hierarchyData: { list: [] },
      homeworkList: [],
      showHierarchyList: true,
      token: uni.getStorageSync('token') || '',
      refreshing: false
    };
  },
  mounted() {
    this.init();
    uni.$on('refreshVolunteerTask', () => {
      this.getManagementScopes(); 
    });
  },
  unmounted() {
    uni.$off('refreshVolunteerTask');
  },
  methods: {
    async onRefresh() {
      this.refreshing = true;
      if (this.selectedScope) {
        this.showHierarchyList ? await this.getHomeworkHierarchyList() : await this.getHomeworkList();
      }
      this.refreshing = false;
    },
    formatDate(dateStr) { 
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; 
    },
    init() {
      this.token ? this.getManagementScopes() : uni.showToast({ title: '请先登录', icon: 'none' });
    },
    getManagementScopes() {
      return new Promise((resolve) => {
        uni.request({
          url: `${API_CONFIG.baseUrl}/volunteer/scopes`,
          header: { Authorization: `Bearer ${this.token}` },
          success: (res) => {
            if (res.data.code === 200) {
              this.managementScopes = this.formatScopeData(res.data.data);
              this.managementScopes.length > 0 && this.selectScope(this.managementScopes[0]);
            }
            resolve();
          }
        });
      })
    },
    formatScopeData(data) {
      return data.map(scope => {
        let label = '';
        const camp = scope.camp_name || scope.campName;
        if (['学班','检班'].includes(scope.dutyType)) label = `${camp}-${scope.className}`;
        if (['学委','检委'].includes(scope.dutyType)) label = `${camp}-${scope.className}-${scope.bigGroupName}`;
        if (['学组','检组'].includes(scope.dutyType)) label = `${camp}-${scope.className}-${scope.bigGroupName}-${scope.smallGroupName}`;
        return { ...scope, label, id: scope.targetId || scope.classId || scope.bigGroupId || scope.smallGroupId };
      });
    },
    selectScope(scope) {
      this.selectedScope = scope;
      if (this.activeTab === 'excellent') {
        this.showHierarchyList = false;
        this.getHomeworkList();
      } else {
        const isGroup = ['学组','检组'].includes(scope.dutyType);
        this.showHierarchyList = !isGroup;
        isGroup ? this.getHomeworkList() : this.getHomeworkHierarchyList();
      }
    },
    onDateChange(e) {
      this.selectedDate = e.detail.value;
      this.showHierarchyList ? this.getHomeworkHierarchyList() : this.getHomeworkList();
    },
    switchTab(tab) {
      this.activeTab = tab;
      if (tab === 'excellent') {
        this.showHierarchyList = false;
        this.getHomeworkList();
      } else {
        const isGroup = ['学组','检组'].includes(this.selectedScope.dutyType);
        this.showHierarchyList = !isGroup;
        isGroup ? this.getHomeworkList() : this.getHomeworkHierarchyList();
      }
    },
    getHomeworkHierarchyList() {
      return new Promise((resolve) => {
        uni.request({
          url: `${API_CONFIG.baseUrl}/homework/hierarchy/list?date=${this.selectedDate}&dutyType=${this.selectedScope.dutyType}&targetId=${this.selectedScope.id}`,
          header: { Authorization: `Bearer ${this.token}` },
          success: (res) => {
            if (res.data.code === 200) {
              this.hierarchyData = res.data.data || { list: [] };
              this.initExpandStatus(this.hierarchyData.list);
            }
            resolve();
          }
        });
      })
    },
    initExpandStatus(items) {
      items.forEach(i => { i.expanded = false; i.children && this.initExpandStatus(i.children); });
    },
    toggleExpand(item) {
      item.type === 'smallGroup' ? this.navigateToHomeworkList(item) : item.expandable && (item.expanded = !item.expanded);
    },
    navigateToHomeworkList(item) {
      uni.navigateTo({
        url: `/pages/volunteer/homework/homework-list?smallGroupId=${item.id}&date=${this.selectedDate}&dutyType=${this.selectedScope.dutyType}`
      });
    },
    navigateToHomeworkDetail(homeworkId, userId, name) {
      uni.navigateTo({
        url: `/pages/volunteer/homework/detail?homeworkId=${homeworkId}&userId=${userId}&name=${name}&date=${this.selectedDate}&dutyType=${this.selectedScope.dutyType}`
      });
    },

    // 获取作业列表 + 自动组装所有证书角标
    getHomeworkList() {
      return new Promise((resolve) => {
        let type = '', id = '';
        const duty = this.selectedScope.dutyType;
        if (['学班','检班'].includes(duty)) { type='class'; id=this.selectedScope.classId }
        if (['学委','检委'].includes(duty)) { type='big_group'; id=this.selectedScope.bigGroupId }
        if (['学组','检组'].includes(duty)) { type='small_group'; id=this.selectedScope.smallGroupId }

        uni.request({
          url: `${API_CONFIG.baseUrl}/homework/list?type=${type}&id=${id}&status=${this.activeTab === 'excellent' ? 'excellent' : ''}&date=${this.selectedDate}`,
          header: { Authorization: `Bearer ${this.token}` },
          success: (res) => {
            if (res.data.code === 200) {
              this.homeworkList = (res.data.data.list || []).map(item => {
                const tags = [];
                if(Number(item.isSmallGroupExcellent)===1) tags.push({type:'small',text:'小组优秀'});
                if(Number(item.isBigGroupExcellent)===1) tags.push({type:'big',text:'大组优秀'});
                // 处理多个证书
                if(item.certificates && Array.isArray(item.certificates)) {
                    item.certificates.forEach(cert => {
                    tags.push({type:'custom',text:cert.type});
                    });
                }
				return { ...item, certificateTags: tags };
              });
            }
            resolve();
          }
        });
      })
    },

    formatDateTime(dt) {
      if (!dt) return '';
      const d = new Date(dt);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,0)}-${String(d.getDate()).padStart(2,0)} ${String(d.getHours()).padStart(2,0)}:${String(d.getMinutes()).padStart(2,0)}`;
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
.task-content {
  padding: 10rpx 0;
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
.hierarchy-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.hierarchy-item {
  border: none;
  border-bottom: 1rpx solid #eee;
  overflow: hidden;
  background-color: #fff;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 20rpx;
  cursor: pointer;
}
.item-name {
  font-size: 28rpx;
  color: #333;
}
.expand-icon,.arrow-icon {
  color: #A31D1D; 
}
.children-list {
  padding-left: 30rpx;
  border-left: 3rpx solid #e5e5e5;
  margin-left: 20rpx;
}
.child-item {
  border-bottom: 1rpx solid #eee;
}

/* 证书角标样式 */
.cert-tags-container {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  display: flex;
  gap: 8rpx;
  z-index: 2;
}
.cert-tag {
  font-size: 20rpx;
  font-weight: bold;
  padding: 4rpx 12rpx;
    border-radius: 6rpx;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
}

.cert-tag:active {
  transform: scale(0.95);
}
/* 小组优秀角标 */
.cert-tag:nth-child(1) {
  background-color: #4CAF50;
}
/* 大组优秀角标 */
.cert-tag:nth-child(2) {
  background-color: #2196F3;
}
/* 自定义证书角标 */
.cert-tag:nth-child(n+3) {
  background-color: #FFD700;
  color: #333;
}
.homework-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.homework-item {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  position: relative;
}
.homework-info {
  font-size: 26rpx;  
  color: #333;         
  display: block;
  margin-bottom: 8rpx;
}
.homework-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1rpx solid #e5e5e5;
}
.detail-btn {
  padding: 12rpx 20rpx;
  background: #A31D1D;
  color: white;
  border-radius: 12rpx;
  font-size: 24rpx;
  border: none;
}
.safe-area-spacer { 
  height: 200rpx; 
}
</style>