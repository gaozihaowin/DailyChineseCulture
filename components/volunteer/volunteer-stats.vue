<template>
  <view class="view-container">
    <!-- 顶部标题栏 -->
    <view class="art-header"> 
      <view class="nav-bar"> 
        <view class="placeholder"></view>
        <view class="nav-brand"> 
          <text class="brand-en">ZHI LIANG ZHI</text> 
          <text class="brand-cn">作业统计</text> 
        </view> 
        <view class="placeholder"></view>
      </view> 
    </view>

    <scroll-view 
      scroll-y 
      class="scroll-content"
      :enhanced="true"
      :show-scrollbar="true"
      v-if="managementScopes.length > 0"
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
              v-for="scope in filteredScopes" 
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

        <view class="section-box hierarchy-container">
          <view v-if="isLoading" class="empty-tip">
            <text>加载中...</text>
          </view>
          <view v-else-if="!hasHomework" class="empty-tip">
            <text>暂无统计数据</text>
          </view>
          <view v-else>
            <!-- 根层级列表 - 只展示名称 -->
            <view 
              v-for="rootItem in hierarchyData" 
              :key="rootItem.id" 
              class="hierarchy-item root-item"
            >
              <!-- 层级名称展示 -->
              <view class="item-header" @click="toggleShowStats(rootItem)">
                <text class="item-name">{{ rootItem.name }}</text>
                <text class="detail-icon">{{ rootItem.showStats ? '▲' : '▼' }}</text>
              </view>

              <!-- 统计数据 -->
              <view v-if="rootItem.showStats" class="stats-container">
                <view class="stats-row-1">
                  <view class="stats-item">
                    <text class="stats-label">总人数</text>
                    <text class="stats-value">{{ rootItem.totalCount }}</text>
                  </view>
                  <view class="stats-item">
                    <text class="stats-label">准时</text>
                    <text class="stats-value completed">{{ rootItem.completedCount }}</text>
                  </view>
                  <view class="stats-item">
                    <text class="stats-label">未交</text>
                    <text class="stats-value pending">{{ rootItem.pendingCount }}</text>
                  </view>
                  <view class="stats-item">
                    <text class="stats-label">迟交</text>
                    <text class="stats-value late">{{ rootItem.lateCount }}</text>
                  </view>
                </view>

                <view class="stats-row-2">
                  <view class="rate-item">
                    <text class="stats-label">按时完成率</text>
                    <text class="stats-value rate">{{ rootItem.onTimeRate || rootItem.completionRate }}%</text>
                  </view>
                  <view class="detail-btn" @click="goToDetailList(rootItem.type, rootItem.id, rootItem.name)">
                    <text class="btn-text">查看详细名单</text>
                  </view>
                </view>
              </view>

              <!-- 子层级列表 -->
              <view class="children-list">
                <view 
                  v-for="child in rootItem.children" 
                  :key="child.id" 
                  class="hierarchy-item child-item"
                >
                  <view class="item-header" @click="toggleShowStats(child)">
                    <text class="item-name">{{ child.name }}</text>
                    <text class="detail-icon">{{ child.showStats ? '▲' : '▼' }}</text>
                  </view>

                  <!-- 子层级统计数据 -->
                  <view v-if="child.showStats" class="stats-container">
                    <view class="stats-row-1">
                      <view class="stats-item">
                        <text class="stats-label">总人数</text>
                        <text class="stats-value">{{ child.totalCount }}</text>
                      </view>
                      <view class="stats-item">
                        <text class="stats-label">准时</text>
                        <text class="stats-value completed">{{ child.completedCount }}</text>
                      </view>
                      <view class="stats-item">
                        <text class="stats-label">未交</text>
                        <text class="stats-value pending">{{ child.pendingCount }}</text>
                      </view>
                      <view class="stats-item">
                        <text class="stats-label">迟交</text>
                        <text class="stats-value late">{{ child.lateCount }}</text>
                      </view>
                    </view>
                    <view class="stats-row-2">
                      <view class="rate-item">
                        <text class="stats-label">按时完成率</text>
                        <text class="stats-value rate">{{ child.onTimeRate || child.completionRate }}%</text>
                      </view>
                      <view class="detail-btn" @click="goToDetailList(child.type, child.id, child.name)">
                        <text class="btn-text">查看详细名单</text>
                      </view>
                    </view>
                  </view>

                  <!-- 孙层级列表 -->
                  <view class="grandchildren-list">
                    <view 
                      v-for="grandchild in child.children" 
                      :key="grandchild.id" 
                      class="hierarchy-item grandchild-item"
                    >
                      <view class="item-header" @click="toggleShowStats(grandchild)">
                        <text class="item-name">{{ grandchild.name }}</text>
                        <text class="detail-icon">{{ grandchild.showStats ? '▲' : '▼' }}</text>
                      </view>

                      <!-- 孙层级统计数据 -->
                      <view v-if="grandchild.showStats" class="stats-container">
                        <view class="stats-row-1">
                          <view class="stats-item">
                            <text class="stats-label">总人数</text>
                            <text class="stats-value">{{ grandchild.totalCount }}</text>
                          </view>
                          <view class="stats-item">
                            <text class="stats-label">准时</text>
                            <text class="stats-value completed">{{ grandchild.completedCount }}</text>
                          </view>
                          <view class="stats-item">
                            <text class="stats-label">未交</text>
                            <text class="stats-value pending">{{ grandchild.pendingCount }}</text>
                          </view>
                          <view class="stats-item">
                            <text class="stats-label">迟交</text>
                            <text class="stats-value late">{{ grandchild.lateCount }}</text>
                          </view>
                        </view>
                        <view class="stats-row-2">
                          <view class="rate-item">
                            <text class="stats-label">按时完成率</text>
                            <text class="stats-value rate">{{ grandchild.onTimeRate}}%</text>
                          </view>
                          <view class="detail-btn" @click="goToDetailList(grandchild.type, grandchild.id, grandchild.name)">
                            <text class="btn-text">查看详细名单</text>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部安全区占位 -->
        <view class="safe-area-spacer"></view> 
      </view> 
    </scroll-view>

    <!-- 无管理范围提示 -->
    <view v-if="managementScopes.length === 0" class="no-scope-tip"> 
      <text>暂无管理范围权限</text> 
    </view> 
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config'; 
export default { 
  name:'VolunteerStats', 
  data() { 
    return { 
      managementScopes: [], 
      filteredScopes: [],   
      selectedScope: null, 
      selectedDate: new Date().toISOString().split('T')[0], 
      today: new Date().toISOString().split('T')[0],
      hierarchyData: [], 
      token: '', 
      isLoading: false,
      hasHomework: false,
      refreshing: false
    }; 
  }, 
  mounted() {
    this.token = uni.getStorageSync('token');
    this.getManagementScopes();
    
    uni.$on('refreshVolunteerStats', () => {
      this.token = uni.getStorageSync('token');
      this.getManagementScopes();
    });
  },
  unmounted() {
    uni.$off('refreshVolunteerStats');
  },
  methods: { 
    // 下拉刷新方法
    async onRefresh() {
      this.refreshing = true;
      // 重新加载数据
      await this.getManagementScopes();
      // 结束刷新
      this.refreshing = false;
    },
    
    formatDate(dateStr) { 
      if (!dateStr) return '';
      const compatibleDate = dateStr.replace(/\s+/g, 'T').replace(/-/g, '/');
      const d = new Date(compatibleDate);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; 
    }, 
    
    onDateChange(e) { 
      this.selectedDate = e.detail.value; 
      this.getHierarchyStatistics(); 
    }, 

    getManagementScopes() { 
      if (!this.token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      
      this.isLoading = true; 
      uni.request({ 
        url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.getVolunteerScope}`, 
        header: { 
          'Authorization': `Bearer ${this.token}`, 
          'Content-Type': 'application/json' 
        }, 
        success: (res) => { 
          this.isLoading = false; 
          if (res.data?.code === 200) { 
            this.managementScopes = this.formatScopeData(res.data.data);
            this.filteredScopes = [...this.managementScopes];
            if (this.managementScopes.length) { 
              this.selectedScope = this.managementScopes[0]; 
              this.getHierarchyStatistics(); 
            } 
          } else {
            uni.showToast({ title: res.data?.msg || '获取管理范围失败', icon: 'none' });
          }
        }, 
        fail: () => { 
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
      this.getHierarchyStatistics(); 
    }, 
    
    getHierarchyStatistics() {
      return new Promise((resolve) => {
        if (!this.selectedScope || !this.selectedScope.id) {
          resolve();
          return;
        }
        
        this.isLoading = true;
        uni.request({
          url: `${API_CONFIG.baseUrl}/homework/statistics/hierarchy`,
          method: 'GET',
          data: {
            type: this.selectedScope.type,
            id: this.selectedScope.id,
            date: this.selectedDate
          },
          header: {
            'Authorization': `Bearer ${this.token}`
          },
          success: (res) => {
            this.isLoading = false;
            console.log('接口返回数据：', res.data);
            
            if (res.data.code === 200) {
              const rawList = res.data.data?.list || [];
              this.hasHomework = rawList.length > 0 ? rawList[0].hasHomework : false;
              this.hierarchyData = this.formatHierarchyData(rawList.filter(item => item.hasHomework));
            } else {
              this.hasHomework = false;
              this.hierarchyData = [];
              uni.showToast({ title: res.data.msg || '获取统计数据失败', icon: 'none' });
            }
            resolve();
          },
          fail: (err) => {
            this.isLoading = false;
            this.hasHomework = false;
            this.hierarchyData = [];
            console.error('接口请求失败：', err);
            uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
            resolve();
          }
        });
      })
    },
    
    // 格式化数据
    formatHierarchyData(rawList) {
      if (!rawList || !Array.isArray(rawList)) return [];
      
      const formatNode = (node) => ({
        ...node,
        showStats: false,
        type: node.type === 'bigGroup' ? 'big_group' : 
              node.type === 'smallGroup' ? 'small_group' : 
              node.type === 'class' ? 'class' : node.type,
        children: node.children && Array.isArray(node.children) 
          ? node.children.filter(child => child?.hasHomework).map(formatNode) 
          : []
      });
      
      return rawList.map(formatNode);
    },
    
    // 切换显示/隐藏统计数据
    toggleShowStats(item) {
      item.showStats = !item.showStats;
    },
    
    goToDetailList(type, id, name) {
      if (!type || !id || !this.selectedDate) {
        uni.showToast({ title: '缺少必要参数', icon: 'none' });
        return;
      }
      uni.navigateTo({
        url: `/pages/volunteer/homework/statslist?type=${type}&id=${id}&date=${this.selectedDate}&scopeName=${encodeURIComponent(name)}`
      });
    }
  } 
}; 
</script>

<style scoped> 
/* 基础布局样式  */
.view-container {
  height: 100vh; 
  display: flex;
  flex-direction: column;
  background-color: #F4F4F5;
  width: 100%;
  overflow-x: hidden; 
  position: relative;
}

/* 顶部标题栏 */
.art-header { 
  background: linear-gradient(160deg, #A31D1D 0%, #851212 100%);
  padding: 88rpx 30rpx 30rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0; 
  margin-bottom: 30rpx;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
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

.scroll-content {
  flex: 1;
  height: 0; 
  box-sizing: border-box; 
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden; 
  padding-top: 220rpx;
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

/* 管理范围选择 */
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

.hierarchy-container {
  padding: 10rpx 0; 
}

/* 层级列表样式  */
.hierarchy-item {
  margin-bottom: 12rpx;
  border-radius: 16rpx;
  background-color: #fff;
  overflow: hidden;
  border: none;
  border-bottom: 1rpx solid #eee;
}

.root-item {
  border: none;
  border-bottom: 1rpx solid #eee;
}

.child-item {
  margin-left: 30rpx;
  border: none;
  border-bottom: 1rpx solid #eee;
}

.grandchild-item {
  margin-left: 60rpx;
  border: none;
  border-bottom: 1rpx solid #eee;
}

/* 层级标题栏 */
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  cursor: pointer;
}

.item-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.detail-icon {
  font-size: 24rpx;
  color: #A31D1D;
  user-select: none;
}

/* 统计数据容器 */
.stats-container {
  padding: 0 20rpx 20rpx;
  border-top: 1rpx dashed #f0f0f0;
}

/* 子层级列表缩进 */
.children-list {
  margin-top: 8rpx;
}

.grandchildren-list {
  margin-top: 8rpx;
}

.stats-row-1 {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.stats-row-1 .stats-item {
  flex: 1;
  text-align: center;
  padding: 12rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
}

.stats-row-2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.rate-item {
  flex: 1;
  text-align: center;
  padding: 12rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
}

/* 方块按钮样式 */
.detail-btn {
  flex: 1;
  text-align: center;
  padding: 12rpx 16rpx;
  background-color: #A31D1D;
  color: #fff;
  border-radius: 8rpx;
  font-size: 24rpx;
  cursor: pointer;
}

.btn-text {
  font-size: 24rpx;
  color: #fff;
}

.stats-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 4rpx;
  display: block;
}

.stats-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.stats-value.completed {
  color: #4CAF50;
}

.stats-value.pending {
  color: #A31D1D;
}

.stats-value.late {
  color: #FF9800;
}

.stats-value.rate {
  color: #A31D1D;
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
  padding-top: 220rpx;
}

/* 底部安全区 */
.safe-area-spacer { 
  height: 200rpx; 
} 
</style>