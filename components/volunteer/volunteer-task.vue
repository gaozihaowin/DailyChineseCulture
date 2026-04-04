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

    <scroll-view 
      scroll-y 
      class="scroll-content"
      :enhanced="true"
      :show-scrollbar="true"
    >
      <view class="content-wrapper"> 
        <!-- 管理范围选择 -->
        <view class="section-box scope-selector"> 
          <view class="selector-title">选择管理范围：</view> 
          
          <!-- 范围列表 -->
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
          <!-- 层级列表（仅在「作业列表」标签下，且管理范围为班/大组时显示） -->
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

          <!-- 作业列表（在「优秀作业」标签下，或管理范围为小组时显示） -->
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
                  <button class="detail-btn" @click="navigateToHomeworkDetail(homework.homeworkId, homework.userId, userName)">查看详情</button>
                  
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
import { API_CONFIG } from '../../api/config.js'; 

export default {
  data() {
    return {
      // 管理范围
      managementScopes: [],
      selectedScope: null,
      // 日期
      selectedDate: new Date().toISOString().split('T')[0],
      today: new Date().toISOString().split('T')[0],
      // 标签
      activeTab: 'all',
      tabs: [
        { label: '作业列表', value: 'all' },
        { label: '优秀作业', value: 'excellent' }
      ],
      // 层级数据
      hierarchyData: { list: [] },
      // 作业列表
      homeworkList: [],
      // 显示层级列表还是作业列表
      showHierarchyList: true,
      // 本地存储的token
      token: uni.getStorageSync('token') || ''
    };
  },
  mounted() {
	  this.init();
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
    // 日期格式化
    formatDate(dateStr) { 
      if (!dateStr) return '';
      const compatibleDate = dateStr.replace(/\s+/g, 'T').replace(/-/g, '/');
      const d = new Date(compatibleDate);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; 
    },
    
    // 初始化
    init() {
      if (this.token) {
        this.getManagementScopes();
      } else {
        uni.showToast({ title: '请先登录', icon: 'none' });
      }
    },

    // 获取管理范围
    getManagementScopes() {
      uni.request({
        url: `${API_CONFIG.baseUrl}/volunteer/scopes`,
        header: {
          'Authorization': `Bearer ${this.token}`
        },
        success: (res) => {
          if (res.data.code === 200) {
            this.managementScopes = this.formatScopeData(res.data.data);
            // 默认选中第一个管理范围
            if (this.managementScopes.length > 0) {
              this.selectScope(this.managementScopes[0]);
            }
          } else {
            uni.showToast({ title: '获取管理范围失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    },

    // 格式化管理范围数据
    formatScopeData(data) {
      return data.map(scope => {
        let label = '';
        if (scope.dutyType === '学班' || scope.dutyType === '检班') {
          label = `${scope.campName}-${scope.className}`;
        } else if (scope.dutyType === '学委' || scope.dutyType === '检委') {
          label = `${scope.campName}-${scope.className}-${scope.bigGroupName}`;
        } else if (scope.dutyType === '学组' || scope.dutyType === '检组') {
          label = `${scope.campName}-${scope.className}-${scope.bigGroupName}-${scope.smallGroupName}`;
        }
        
        // 确保 id 有值
        let id = scope.targetId;
        if (!id) {
          // 根据 dutyType 从其他字段获取 ID
          if (scope.dutyType === '学班' || scope.dutyType === '检班') {
            id = scope.classId;
          } else if (scope.dutyType === '学委' || scope.dutyType === '检委') {
            id = scope.bigGroupId;
          } else if (scope.dutyType === '学组' || scope.dutyType === '检组') {
            id = scope.smallGroupId;
          }
        }
        
        return {
          ...scope,
          label,
          id
        };
      });
    },

    // 选择管理范围
    selectScope(scope) {
      this.selectedScope = scope;
      
      if (this.activeTab === 'excellent') {
        this.showHierarchyList = false;
        this.getHomeworkList();
      } else {
        // 否则按原逻辑
        if (scope.dutyType === '学组' || scope.dutyType === '检组') {
          this.showHierarchyList = false;
          this.getHomeworkList();
        } else {
          this.showHierarchyList = true;
          this.getHomeworkHierarchyList();
        }
      }
    },

    // 日期变更
    onDateChange(e) {
      this.selectedDate = e.detail.value;
      if (this.selectedScope) {
        if (this.showHierarchyList && this.activeTab === 'all') {
          this.getHomeworkHierarchyList();
        } else {
          this.getHomeworkList();
        }
      }
    },

    // 切换标签
    switchTab(tab) {
      this.activeTab = tab;
      if (this.selectedScope) {
        if (tab === 'excellent') {
          this.showHierarchyList = false;
          this.getHomeworkList();
        } else {
          if (this.selectedScope.dutyType === '学组' || this.selectedScope.dutyType === '检组') {
            this.showHierarchyList = false;
            this.getHomeworkList();
          } else {
            this.showHierarchyList = true;
            this.getHomeworkHierarchyList();
          }
        }
      }
    },

    getHomeworkHierarchyList() {
      if (!this.token || !this.selectedScope) return;

      // 构造参数（严格匹配后端要求）
      const params = {
        date: this.selectedDate,
        status: this.activeTab === 'excellent' ? 'excellent' : undefined, 
        dutyType: this.selectedScope.dutyType,
        targetId: this.selectedScope.id
      };

      // 拼接查询字符串
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

      uni.request({
        url: `${API_CONFIG.baseUrl}/homework/hierarchy/list${queryString ? '?' + queryString : ''}`,
        method: 'GET', 
        header: {
          'Authorization': `Bearer ${this.token}` 
        },
        success: (res) => {
        
          if (res.data?.code === 200) {
            this.hierarchyData = res.data.data || { list: [] };
            this.initExpandStatus(this.hierarchyData.list);
          } else {
            uni.showToast({ title: res.data?.msg || '获取层级列表失败', icon: 'none' });
            this.hierarchyData = { list: [] };
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络错误', icon: 'none' });
          this.hierarchyData = { list: [] };
        }
      });
    },

    // 初始化展开状态
    initExpandStatus(items) {
      if (!items) return;
      items.forEach(item => {
        item.expanded = false;
        if (item.children && item.children.length > 0) {
          this.initExpandStatus(item.children);
        }
      });
    },

    // 切换展开状态
    toggleExpand(item) {
      if (item.type === 'smallGroup') {
        this.navigateToHomeworkList(item);
        return;
      }
      
      if (item.expandable) {
        item.expanded = !item.expanded;
      }
    },

    // 跳转到作业列表页面
    navigateToHomeworkList(item) {
      if (item.type === 'smallGroup') {
        uni.navigateTo({
          url: `/pages/volunteer/homework/homework-list?smallGroupId=${item.id}&smallGroupName=${item.name}&date=${this.selectedDate}&dutyType=${this.selectedScope.dutyType}`
        });
      }
    },

    // 跳转到作业详情页面
    navigateToHomeworkDetail(homeworkId, userId, userName) {
      if (!homeworkId || isNaN(Number(homeworkId))) {
        uni.showToast({ title: '作业ID无效', icon: 'none' });
        return;
      }
      uni.navigateTo({
        url: `/pages/volunteer/homework/detail?homeworkId=${Number(homeworkId)}&userId=${userId}&name=${userName}&date=${this.selectedDate}&dutyType=${this.selectedScope.dutyType}`
      });
    },

    // 获取作业列表
    getHomeworkList() {
      if (!this.token || !this.selectedScope) return;

      // 构造必需的type和id参数
      let type = '';
      let id = '';
      if (this.selectedScope.dutyType === '学班' || this.selectedScope.dutyType === '检班') {
        type = 'class';
        id = this.selectedScope.classId;
      } else if (this.selectedScope.dutyType === '学委' || this.selectedScope.dutyType === '检委') {
        type = 'big_group';
        id = this.selectedScope.bigGroupId;
      } else if (this.selectedScope.dutyType === '学组' || this.selectedScope.dutyType === '检组') {
        type = 'small_group';
        id = this.selectedScope.smallGroupId;
      }

      // 构造参数
      const params = {
        type: type, 
        id: id,     
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
			  console.log('接口返回作业列表:', res.data.data.list); // 调试日志
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

    // 权限校验：是否可操作小组优秀
    canOperateSmallGroup(homework) {
      const dutyType = this.selectedScope?.dutyType || '';
      // 所有角色都可操作小组优秀（仅范围不同）
      if (['学班', '检班', '学委', '检委', '学组', '检组'].includes(dutyType)) {
        return true;
      }
      return false;
    },

    canOperateBigGroup(homework) {
      const dutyType = this.selectedScope?.dutyType || '';
      // 1. 学组/检组：无权限操作大组优秀
      if (dutyType === '学组' || dutyType === '检组') {
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
      const dutyType = this.selectedScope?.dutyType || '';
      const homework = this.homeworkList.find(item => item.homeworkId === homeworkId);
      
      // 学组/检组无权限
      if (dutyType === '学组' || dutyType === '检组') {
        uni.showToast({ title: '无权限操作大组优秀', icon: 'none' });
        return;
      }
      
      // 未标记小组优秀（学委/检委/学班/检班通用）
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
  overflow-x: hidden;
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

/* 作业管理内容样式 */
.task-content {
  padding: 30rpx;
}

.hierarchy-container,
.homework-container {
  padding: 10rpx 0;
}

/* 空数据提示 */
.empty-tip { 
  text-align: center; 
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
} 

/* 无管理范围提示 */
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
  border-radius: 0;
  border-bottom: 1rpx solid #eee;
  overflow: hidden;
  background-color: #fff;
}

.hierarchy-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 20rpx;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.item-header:hover {
  background-color: #fafafa;
}

.item-name {
  font-size: 28rpx;
  font-weight: normal;
  color: #333;
  display: block;
}

.expand-icon {
  font-size: 20rpx;
  color: #A31D1D; 
  display: block;
}

.arrow-icon {
  font-size: 24rpx;
  color: #A31D1D; 
  cursor: pointer;
  display: block;
}

.children-list {
  padding-left: 30rpx;
  border-left: 3rpx solid #e5e5e5;
  margin-left: 20rpx;
}

.child-item {
  border: none;
  border-radius: 0;
  border-bottom: 1rpx solid #eee;
  overflow: hidden;
  margin-top: 0;
}

.child-item:last-child {
  border-bottom: none;
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

/* 统一作业信息样式 */
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
  gap: 10rpx;
}

.detail-btn {
  padding: 12rpx 20rpx;
  background-color: #A31D1D;
  color: white;
  border-radius: 12rpx;
  font-size: 24rpx;
  border: none;
  flex-shrink: 0;
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