<template>
  <view class="view-container">
    <view class="art-header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">志愿者管理</text>
        </view>
        <view style="width: 48rpx;"></view>
      </view>
      
      <view class="nav-tabs">
        <view 
          class="nav-tab" 
          :class="{ active: activeTab === 'members' }"
          @click="switchTab('members')"
        >
          管理成员
        </view>
        <view 
          class="nav-tab" 
          :class="{ active: activeTab === 'duty' }"
          @click="switchTab('duty')"
        >
          分配岗位
        </view>
      </view>
    </view>

    <scroll-view 
      scroll-y 
      class="scroll-content"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
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
              <view class="scope-target">{{ getScopeDisplayName(scope) }}</view>
            </view>
          </scroll-view>
        </view>

        <view v-if="activeTab === 'members'" class="section-box task-content">
          <view v-if="showHierarchyList" class="hierarchy-container">
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
                  <text class="arrow-icon" v-if="item.type === 'smallGroup'" @click.stop="gotoMemberList(item)">▶</text>
                </view>
                <view v-if="item.expanded && item.children && item.type !== 'smallGroup'" class="children-list">
                  <view
                    v-for="child in item.children"
                    :key="child.id"
                    class="child-item"
                  >
                    <view class="item-header" @click="toggleExpand(child)">
                      <text class="item-name">{{ child.name }}</text>
                      <text class="arrow-icon" v-if="child.type === 'smallGroup'" @click.stop="gotoMemberList(child)">▶</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="member-container">
            <view v-if="memberInfo.smallGroupList && memberInfo.smallGroupList.length === 0 && selectedScope" class="empty-tip">
              <text>暂无成员信息</text>
            </view>
            <view v-else-if="!selectedScope" class="empty-tip">
              <text>请先选择管理范围</text>
            </view>
            <view v-else class="member-list-wrapper">
              <view class="section-title">小组成员</view>
              <view 
                v-for="smallGroup in memberInfo.smallGroupList" 
                :key="smallGroup.smallGroupId" 
                class="small-group-section"
              >
                <view class="group-name">
                  {{ smallGroup.smallGroupName }}（{{ smallGroup.bigGroupName }} - {{ smallGroup.className }}）
                </view>
                <view class="member-list">
                  <view 
                    v-for="member in smallGroup.members" 
                    :key="member.userId" 
                    class="member-item"
                  >
                    <view class="member-info">
                      <view class="basic-item">账户名: <text class="value-text">{{ member.account || '--' }}</text></view>
                      <view class="basic-item">昵称: <text class="value-text">{{ member.nickname || '--' }}</text></view>
                      <view class="basic-item">年龄: <text class="value-text">{{ member.age || '--' }}</text></view>
                      <view class="basic-item">性别: <text class="value-text">{{ getGenderText(member.gender) }}</text></view>
                      <view class="basic-item">生日: <text class="value-text">{{ member.birthday || '--' }}</text></view>
                      <view class="basic-item">职业: <text class="value-text">{{ member.occupation || '--' }}</text></view>
                      <view class="basic-item">地区: <text class="value-text">{{ member.region || '--' }}</text></view>
                      <view class="basic-item">手机号: <text class="value-text">{{ member.phone || '--' }}</text></view>
                      <view class="basic-item study-location">学习位置：<text class="value-text">{{ getStudyLocation(member) }}</text>
                      </view>
                    </view>
                    <view class="status-tag" :class="member.status === '正在参与' ? 'ongoing' : 'ended'">
                      {{ member.status }}
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="activeTab === 'duty'">
          <view v-if="selectedScope" class="section-box duty-scope-section">
            <view class="section-title">我的管理范围</view>
            <view class="scope-info">
              <view class="item-row">
                <text class="label">营期：</text>
                <text class="value">{{ selectedScope.campName }}</text>
              </view>
              <view class="item-row">
                <text class="label">职位：</text>
                <text class="value">{{ selectedScope.dutyType }}</text>
              </view>
              <view v-if="selectedScope.className" class="item-row">
                <text class="label">班级：</text>
                <text class="value">{{ selectedScope.className }}</text>
              </view>
              <view v-if="selectedScope.bigGroupName" class="item-row">
                <text class="label">大组：</text>
                <text class="value">{{ selectedScope.bigGroupName }}</text>
              </view>
              <view v-if="selectedScope.smallGroupName" class="item-row">
                <text class="label">小组：</text>
                <text class="value">{{ selectedScope.smallGroupName }}</text>
              </view>
            </view>
          </view>

          <view v-if="selectedScope">
            <view v-if="dutyInfo.assignableDuties && dutyInfo.assignableDuties.length > 0" class="section-box duty-assign-section">
              <view class="section-title">可分配的岗位</view>
              <view 
                v-for="duty in dutyInfo.assignableDuties" 
                :key="`${duty.targetType}-${duty.targetId}-${duty.dutyType}`" 
                class="duty-card"
              >
                <view class="duty-header">
                  <view class="duty-name">{{ duty.targetName }} - {{ duty.dutyName }}</view>
                  <view class="status-tag" :class="duty.isVacant ? 'vacant' : 'ongoing'">
                    {{ duty.isVacant ? '岗位空缺' : '已分配' }}
                  </view>
                </view>
                
                <view v-if="!duty.isVacant" class="current-assignee">
                  <text>当前任职：{{ duty.currentUsername }}</text>
                  <view class="quit-btn" @click="removeDuty(duty)">移除</view>
                </view>
                
                <view v-if="duty.isVacant" class="assign-section">
                  <input 
                    v-model="searchKeywords[getDutyKey(duty)]" 
                    placeholder="搜索用户账户或昵称或手机号" 
                    class="search-input"
                    @input="debounceSearch(duty)"
                  />
                  <view class="user-list" v-if="searchResults[getDutyKey(duty)] && searchResults[getDutyKey(duty)].length > 0">
                    <view 
                      v-for="user in searchResults[getDutyKey(duty)]" 
                      :key="user.userId" 
                      class="user-item"
                    >
                      <view class="user-info" @click="gotoUserDetail(user.userId)">
                        <view class="username">{{ user.nickname || user.account || user.username || '--' }}</view>
                        <view class="phone">{{ user.phone || '--' }}</view>
                      </view>
                      <view class="assign-btn" @click="assignDuty(user, duty)">分配</view>
                    </view>
                  </view>
                  <view v-else-if="searchKeywords[getDutyKey(duty)] && searchKeywords[getDutyKey(duty)].length >= 2" class="empty-tip" style="padding: 20rpx 0;">
                    暂无搜索结果
                  </view>
                </view>
              </view>
            </view>

            <view v-else-if="!dutyInfo.assignableDuties || dutyInfo.assignableDuties.length === 0" class="section-box">
              <view class="empty-tip">
                <text>当前范围暂无可分配的岗位</text>
              </view>
            </view>
          </view>

          <view v-else class="section-box">
            <view class="empty-tip">
              <text>请选择管理范围</text>
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
import { API_CONFIG } from '../../api/config'; 

export default { 
   data() { 
     return { 
       activeTab: 'members', 
       managementScopes: [], 
       selectedScope: null, 
       hierarchyData: { list: [] }, 
       memberInfo: {}, 
       dutyInfo: {}, 
       searchKeywords: {}, 
       searchResults: {}, 
       searchTimer: null, 
       token: uni.getStorageSync('token') || '', 
       showHierarchyList: true, 
       refreshing: false
     } 
   }, 
   
   onLoad() { 
     this.init(); 
   }, 
   
   methods: { 
     async onRefresh() {
       this.refreshing = true;
       await this.loadManagementScopes();
       this.refreshing = false;
     },
     
     init() { 
       if (this.token) { 
         this.loadManagementScopes(); 
       } else { 
         uni.showToast({ title: '请先登录', icon: 'none' }); 
         uni.redirectTo({ url: '/pages/Login/index' }); 
       } 
     }, 
     
     goBack() { 
       uni.navigateBack({ 
         delta: 1, 
         fail: () => { 
           uni.redirectTo({ 
             url: '/components/volunteer/volunteer-home' 
           }) 
         } 
       }); 
     }, 
     
     async loadManagementScopes() { 
       try { 
         if (!this.token) { 
           uni.showToast({ title: '请先登录', icon: 'none' }); 
           uni.redirectTo({ url: '/pages/Login/index' }); 
           return; 
         } 
         
         const response = await uni.request({ 
           url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.getVolunteerScope}`, 
           method: 'GET', 
           header: { 
             'Authorization': `Bearer ${this.token}`, 
             'Content-Type': 'application/json' 
           } 
         }); 
 
         if (!response || response.statusCode !== 200) { 
           uni.showToast({ title: '获取管理范围失败', icon: 'none' }); 
           return; 
         } 
 
         const resData = response.data || {}; 
         if (resData.code === 200) { 
           this.managementScopes = resData.data || []; 
           if (this.managementScopes.length > 0) { 
             this.selectedScope = this.managementScopes[0]; 
             this.loadCurrentTabData(); 
           } 
         } else { 
           uni.showToast({ 
             title: resData.msg || '获取管理范围失败', 
             icon: 'none' 
           }); 
         } 
       } catch (error) { 
         console.error('加载管理范围失败:', error); 
         uni.showToast({ 
           title: '网络异常，请检查网络', 
           icon: 'none' 
         }); 
       } 
     }, 
     
     getScopeDisplayName(scope) { 
       if (scope.targetType === 'class') { 
         return `${scope.campName || ''} - ${scope.className || ''}`; 
       } else if (scope.targetType === 'big_group') { 
         return `${scope.campName || ''} - ${scope.className || ''} - ${scope.bigGroupName || ''}`; 
       } else if (scope.targetType === 'small_group') { 
         return `${scope.campName || ''} - ${scope.className || ''} - ${scope.bigGroupName || ''} - ${scope.smallGroupName || ''}`; 
       } 
       return '未知范围'; 
     }, 
     
     selectScope(scope) { 
       this.selectedScope = scope; 
       
       if (this.activeTab === 'members') { 
         if (scope.targetType === 'small_group') { 
           this.showHierarchyList = false; 
           this.loadMemberInfo(); 
         } else { 
           this.showHierarchyList = true; 
           this.loadMemberHierarchyList(); 
         } 
       } else if (this.activeTab === 'duty') { 
         this.loadDutyInfo(); 
       } 
       
       this.searchKeywords = {}; 
       this.searchResults = {}; 
     }, 
     
     switchTab(tab) { 
       this.activeTab = tab; 
       if (this.selectedScope) { 
         if (tab === 'members') { 
           if (this.selectedScope.targetType === 'small_group') { 
             this.showHierarchyList = false; 
             this.loadMemberInfo(); 
           } else { 
             this.showHierarchyList = true; 
             this.loadMemberHierarchyList(); 
           } 
         } else if (tab === 'duty') { 
           this.loadDutyInfo(); 
         } 
       } 
     }, 
     
     loadCurrentTabData() { 
       if (!this.selectedScope) return; 
       
       if (this.activeTab === 'members') { 
         if (this.selectedScope.targetType === 'small_group') { 
           this.showHierarchyList = false; 
           this.loadMemberInfo(); 
         } else { 
           this.showHierarchyList = true; 
           this.loadMemberHierarchyList(); 
         } 
       } else if (this.activeTab === 'duty') { 
         this.loadDutyInfo(); 
       } 
     }, 
     
     loadMemberHierarchyList() { 
       if (!this.token || !this.selectedScope) return; 
 
       let targetId;
       if (this.selectedScope.targetType === 'class') {
         targetId = this.selectedScope.classId;
       } else if (this.selectedScope.targetType === 'big_group') {
         targetId = this.selectedScope.bigGroupId;
       } else if (this.selectedScope.targetType === 'small_group') {
         targetId = this.selectedScope.smallGroupId;
       }
 
       const params = { 
         dutyType: this.selectedScope.dutyType, 
         targetId: targetId 
       }; 
 
       const queryString = Object.keys(params) 
         .filter(key => params[key] !== undefined && params[key] !== null) 
         .map(key => `${key}=${encodeURIComponent(params[key])}`) 
         .join('&'); 
 
       uni.request({ 
         url: `${API_CONFIG.baseUrl}/homework/hierarchy/list${queryString ? '?' + queryString : ''}`, 
         header: { 
           'Authorization': `Bearer ${this.token}` 
         }, 
         success: (res) => { 
           if (res.data && res.data.code === 200) { 
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
    
    initExpandStatus(items) {
      if (!items) return;
      items.forEach(item => {
        item.expanded = false;
        if (item.children && item.children.length > 0) {
          this.initExpandStatus(item.children);
        }
      });
    },
    
    toggleExpand(item) {
      if (item.type === 'smallGroup') {
        this.gotoMemberList(item);
        return;
      }
      
      if (item.expandable) {
        item.expanded = !item.expanded;
      }
    },
    
    gotoMemberList(item) {
      if (item.type === 'smallGroup' && item.id) {
        uni.navigateTo({
          url: `/pages/volunteer-manage/member-list?
            campId=${this.selectedScope.campId}
            &classId=${this.selectedScope.classId}
            &bigGroupId=${item.pid}
            &smallGroupId=${item.id}
            &smallGroupName=${item.name}
            &assignmentId=${this.selectedScope.assignmentId}
          `.replace(/\s+/g, '')
        });
      }
    },
    
    async loadMemberInfo() {
      try {
        if (!this.token || !this.selectedScope.assignmentId) {
          return;
        }
        
        const requestUrl = `${API_CONFIG.baseUrl}${API_CONFIG.paths.getVolunteerMembers}?assignmentId=${this.selectedScope.assignmentId}`;
        const response = await uni.request({
          url: requestUrl,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response || response.statusCode !== 200) {
          uni.showToast({ title: '获取成员信息失败', icon: 'none' });
          return;
        }

        const resData = response.data || {};
        if (resData.code === 200) {
          this.memberInfo = resData.data || {};
        } else {
          uni.showToast({
            title: resData.msg || '获取成员信息失败',
            icon: 'none',
            duration: 3000
          });
        }
      } catch (error) {
        console.error('加载管理成员信息异常:', error);
        uni.showToast({
          title: '获取成员信息失败（网络异常）',
          icon: 'none'
        });
      }
    },
    
    async loadDutyInfo() {
      try {
        if (!this.token || !this.selectedScope.assignmentId) {
          return;
        }
        
        const requestUrl = `${API_CONFIG.baseUrl}${API_CONFIG.paths.getDutyAssignment}?assignmentId=${this.selectedScope.assignmentId}`;
        const response = await uni.request({
          url: requestUrl,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response || response.statusCode !== 200) {
          uni.showToast({ title: '获取岗位信息失败', icon: 'none' });
          return;
        }

        const resData = response.data || {};
        if (resData.code === 200) {
          this.dutyInfo = resData.data || {};
        } else {
          uni.showToast({
            title: resData.msg || '获取岗位信息失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载分配岗位信息失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    },
    
    getDutyKey(duty) {
      return `${duty.targetType}-${duty.targetId}-${duty.dutyType}`
    },
    
    getGenderText(gender) {
      if (gender === 1) return '男';
      if (gender === 2) return '女';
      return '--';
    },
    
    getStudyLocation(member) {
      const parts = [];
      if (member.campName) parts.push(member.campName);
      if (member.className) parts.push(member.className);
      if (member.bigGroupName) parts.push(member.bigGroupName);
      if (member.smallGroupName) parts.push(member.smallGroupName);
      return parts.join('') || '--';
    },
    
    debounceSearch(duty) {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      
      this.searchTimer = setTimeout(() => {
        this.searchUser(duty);
      }, 500);
    },
    
    async searchUser(duty) {
      const keyword = this.searchKeywords[this.getDutyKey(duty)];
      if (!keyword || keyword.length < 2) {
        this.searchResults[this.getDutyKey(duty)] = [];
        return;
      }
      
      try {
        const requestUrl = `${API_CONFIG.baseUrl}${API_CONFIG.paths.searchUser}?keyword=${encodeURIComponent(keyword)}`;
        const response = await uni.request({
          url: requestUrl,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response || response.statusCode !== 200) {
          this.searchResults[this.getDutyKey(duty)] = [];
          return;
        }

        const resData = response.data || {};
        if (resData.code === 200) {
          this.searchResults[this.getDutyKey(duty)] = resData.data || [];
        } else {
          uni.showToast({
            title: resData.msg || '搜索用户失败',
            icon: 'none'
          });
          this.searchResults[this.getDutyKey(duty)] = [];
        }
      } catch (error) {
        console.error('搜索用户失败:', error);
        this.searchResults[this.getDutyKey(duty)] = [];
      }
    },
    
    async assignDuty(user, duty) {
      try {
        if (!this.token || !user?.userId || !duty) {
          uni.showToast({ title: '参数错误', icon: 'none' });
          return;
        }
        
        const response = await uni.request({
          url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.assignDuty}`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          data: {
            assignmentId: this.selectedScope.assignmentId,
            targetUserId: user.userId,
            targetType: duty.targetType,
            targetId: duty.targetId,
            dutyType: duty.dutyType
          }
        });

        if (!response || response.statusCode !== 200) {
          uni.showToast({ title: '分配失败', icon: 'none' });
          return;
        }

        const resData = response.data || {};
        if (resData.code === 200) {
          uni.showToast({
            title: '分配成功',
            icon: 'success'
          });
          this.loadDutyInfo();
          this.searchKeywords[this.getDutyKey(duty)] = '';
          this.searchResults[this.getDutyKey(duty)] = [];
        } else {
          uni.showToast({
            title: resData.msg || '分配失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('分配岗位失败:', error);
        uni.showToast({
          title: '分配失败',
          icon: 'none'
        });
      }
    },
    
    async removeDuty(duty) { 
      uni.showModal({ 
        title: '确认移除', 
        content: `确定要移除 ${duty.currentUsername} 的 ${duty.dutyName} 职位吗？`, 
        success: async (res) => { 
          if (res.confirm) { 
            try { 
              if (!this.token || !duty?.assignmentId) { 
                uni.showToast({ title: '参数错误，无法移除该岗位', icon: 'none' }); 
                return; 
              } 
              
              const response = await uni.request({ 
                url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.removeDuty}`, 
                method: 'POST', 
                header: { 
                  'Authorization': `Bearer ${this.token}`, 
                  'Content-Type': 'application/json' 
                }, 
                data: { 
                  assignmentId: duty.assignmentId 
                } 
              }); 

              if (!response || response.statusCode !== 200) {
                uni.showToast({ title: '移除失败', icon: 'none' });
                return;
              }

              const resData = response.data || {};
              if (resData.code === 200) {
                uni.showToast({
                  title: '移除成功',
                  icon: 'success'
                });
                this.loadDutyInfo();
              } else {
                uni.showToast({
                  title: resData.msg || '移除失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              console.error('移除岗位失败:', error);
              uni.showToast({
                title: '移除失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },
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
  padding: 80rpx 30rpx 30rpx; 
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  width: 100%;
  box-sizing: border-box;
} 

.nav-bar { 
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
} 

.back-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  cursor: pointer;
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
  cursor: pointer;
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

.task-content {
  padding: 30rpx;
}

.hierarchy-container,
.member-container {
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

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.small-group-section {
  margin-bottom: 30rpx;
}

.group-name {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: bold;
}

.member-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
}
.member-item:last-child {
  border-bottom: none;
}
.member-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  gap: 8rpx; 
  padding-right: 12rpx;
}

.basic-item {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  width: 100%;
  white-space: nowrap;
}
.basic-item.study-location {
  word-wrap: break-word; 
  word-break: break-all;
  line-height: 1.6;
  white-space: normal; 
}

.value-text {
  color: #666;
  font-weight: normal;
  margin-left: 8rpx;
}

.status-tag {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  flex-shrink: 0;
  margin-top: 8rpx;
  margin-left: 10rpx;
}
.status-tag.ongoing {
  background-color: #e6f7ff;
  color: #1890ff;
}
.status-tag.ended {
  background-color: #f5f5f5;
  color: #999;
}
.status-tag.vacant {
  background-color: #fff2e8;
  color: #FF6B35;
}

.duty-scope-section, .duty-assign-section {
  padding: 30rpx;
}

.management-scope {
  margin-bottom: 30rpx;
}

.duty-card {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.duty-card:last-child {
  border-bottom: none;
}
.duty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.duty-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.item-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.label {
  font-size: 28rpx;
  color: #666;
  width: 120rpx;
}
.value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.quit-btn, .remove-btn {
  color: #ff4d4f;
  font-size: 26rpx;
  padding: 8rpx 0;
  cursor: pointer;
}
.assign-btn {
  background: #A31D1D;
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  flex-shrink: 0;
  margin-left: 20rpx;
  cursor: pointer;
}

.search-input {
  width: 100%;
  height: 60rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  margin-bottom: 15rpx;
  box-sizing: border-box;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.user-item:last-child {
  border-bottom: none;
}
.user-item .user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: flex-start;
  cursor: pointer;
}
.user-item .username {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
}
.user-item .phone {
  font-size: 24rpx;
  color: #666;
}

.current-assignee {
  background: #f8f8f8;
  padding: 15rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.safe-area-spacer { 
  height: 200rpx; 
}
</style>