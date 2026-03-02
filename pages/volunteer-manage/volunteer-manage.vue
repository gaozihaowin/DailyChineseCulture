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

    <scroll-view scroll-y class="scroll-content">
      <view v-if="managementScopes.length > 0" class="section-box scope-selector">
        <view class="selector-title">选择管理范围：</view>
        <scroll-view class="scope-list" scroll-x>
          <view 
            v-for="scope in managementScopes" 
            :key="scope.assignmentId"
            class="scope-item"
            :class="{ active: selectedScope.assignmentId === scope.assignmentId }"
            @click="selectScope(scope)"
          >
            <view class="scope-duty">{{ scope.dutyType }}</view>
            <view class="scope-target">{{ getScopeDisplayName(scope) }}</view>
          </view>
        </scroll-view>
      </view>

      <view v-if="activeTab === 'members'" class="member-page">
        <view class="section-box camp-info" v-if="selectedScope.campName">
          <view class="camp-name">{{ selectedScope.campName }}</view>
          <view class="status-tag ongoing">进行中</view>
        </view>

        <view v-if="selectedScope.targetType === 'class' && memberInfo.classList && memberInfo.classList.length > 0" class="section-box">
          <view class="section-title">班级成员</view>
          <view 
            v-for="classItem in memberInfo.classList" 
            :key="classItem.classId" 
            class="class-section"
          >
            <view class="class-name">{{ classItem.className }}</view>
            <view class="member-list">
              <view 
                v-for="member in classItem.members" 
                :key="member.userId" 
                class="member-item"
                @click="gotoUserDetail(member.userId)"
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
                  <view class="basic-item study-location">
                    学习位置：<text class="value-text">{{ getStudyLocation(member) }}</text>
                  </view>
                </view>
                <view class="status-tag" :class="member.status === '正在参与' ? 'ongoing' : 'ended'">
                  {{ member.status }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 大组成员 -->
        <view v-if="selectedScope.targetType === 'big_group' && memberInfo.bigGroupList && memberInfo.bigGroupList.length > 0" class="section-box">
          <view class="section-title">大组成员</view>
          <view 
            v-for="bigGroup in memberInfo.bigGroupList" 
            :key="bigGroup.bigGroupId" 
            class="big-group-section"
          >
            <view class="group-name">{{ bigGroup.bigGroupName }}（{{ bigGroup.className }}）</view>
            <view class="member-list">
              <view 
                v-for="member in bigGroup.members" 
                :key="member.userId" 
                class="member-item"
                @click="gotoUserDetail(member.userId)"
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
                  <view class="basic-item study-location">
                    学习位置：<text class="value-text">{{ getStudyLocation(member) }}</text>
                  </view>
                </view>
                <view class="status-tag" :class="member.status === '正在参与' ? 'ongoing' : 'ended'">
                  {{ member.status }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 小组成员 -->
        <view v-if="selectedScope.targetType === 'small_group' && memberInfo.smallGroupList && memberInfo.smallGroupList.length > 0" class="section-box">
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
                @click="gotoUserDetail(member.userId)"
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
                  <view class="basic-item study-location">
                    学习位置：<text class="value-text">{{ getStudyLocation(member) }}</text>
                  </view>
                </view>
                <view class="status-tag" :class="member.status === '正在参与' ? 'ongoing' : 'ended'">
                  {{ member.status }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="!selectedScope.campName" class="section-box empty-tip">
          <text>请选择管理范围</text>
        </view>
        <view v-else-if="!hasMembers" class="section-box empty-tip">
          <text>当前范围暂无成员</text>
        </view>
      </view>

      <!-- 分配岗位页面 -->
      <view v-if="activeTab === 'duty'" class="duty-page">
        <view v-if="selectedScope.campName" class="section-box management-scope">
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

        <view v-if="dutyInfo.assignableDuties && dutyInfo.assignableDuties.length > 0" class="section-box">
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
            
            <view v-if="!duty.isVacant" class="current-assignee item-row">
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
                    <view class="username">{{ user.username }}</view>
                    <view class="phone">{{ user.phone }}</view>
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

        <view v-if="!selectedScope.campName" class="section-box empty-tip">
          <text>请选择管理范围</text>
        </view>
        <view v-else-if="!dutyInfo.assignableDuties || dutyInfo.assignableDuties.length === 0" class="section-box empty-tip">
          <text>当前范围暂无可分配的岗位</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config'; 

export default {
  data() {
    return {
      activeTab: 'members', 
      managementScopes: [], 
      selectedScope: {}, 
      memberInfo: {}, 
      dutyInfo: {}, 
      searchKeywords: {}, 
      searchResults: {}, 
      searchTimer: null, 
      token: uni.getStorageSync('token') || '' 
    }
  },
  
  computed: {
    hasMembers() {
      return (this.memberInfo.classList && this.memberInfo.classList.length > 0) ||
             (this.memberInfo.bigGroupList && this.memberInfo.bigGroupList.length > 0) ||
             (this.memberInfo.smallGroupList && this.memberInfo.smallGroupList.length > 0)
    }
  },
  
  onLoad() {
    this.loadManagementScopes()
  },
  
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1, 
        fail: () => {
          uni.redirectTo({
            url: '/components/volunteer/volunteer-home' 
          })
        }
      })
    },
    
    getScopeDisplayName(scope) {
      if (scope.targetType === 'class') {
        return scope.className
      } else if (scope.targetType === 'big_group') {
        return `${scope.className} - ${scope.bigGroupName}`
      } else if (scope.targetType === 'small_group') {
        return `${scope.className} - ${scope.bigGroupName} - ${scope.smallGroupName}`
      }
      return '未知范围'
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
    
    async loadManagementScopes() {
      try {
        if (!this.token) {
          uni.showToast({ title: '请先登录', icon: 'none' });
          uni.redirectTo({ url: '/pages/login/login' });
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
    
    selectScope(scope) {
      this.selectedScope = scope;
      this.loadCurrentTabData();
      this.searchKeywords = {};
      this.searchResults = {};
    },
    
    switchTab(tab) {
      this.activeTab = tab;
      this.loadCurrentTabData();
    },
    
    loadCurrentTabData() {
      if (!this.selectedScope.campName) return;
      
      if (this.activeTab === 'members') {
        this.loadMemberInfo();
      } else if (this.activeTab === 'duty') {
        this.loadDutyInfo();
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
    }
  }
}
</script>

<style scoped>
.view-container {
  min-height: 100vh;
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
  margin-bottom: 30rpx;
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
}
.back-arrow {
  width: 20rpx;
  height: 20rpx;
  border-top: 3rpx solid #fff;
  border-left: 3rpx solid #fff;
  transform: rotate(-45deg);
}

.nav-brand {
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
  padding: 0 30rpx;
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

.camp-info .camp-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.class-name, .group-name {
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
}
.basic-item.study-location {
  word-wrap: break-word; 
  word-break: break-all;
  line-height: 1.6;
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
  margin-left: 12rpx;
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
}
.assign-btn {
  background: #A31D1D;
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  flex-shrink: 0;
  margin-left: 20rpx;
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

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}

.current-assignee {
  background: #f8f8f8;
  padding: 15rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
}
</style>