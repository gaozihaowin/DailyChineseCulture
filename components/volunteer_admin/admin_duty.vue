<template>
  <view class="view-container">
    <view class="art-header">
      <view class="nav-bar">
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">分配岗位</text>
        </view>
        <view style="width: 48rpx;"></view>
      </view>
    </view>

    <!-- 下拉刷新添加 -->
    <scroll-view
      scroll-y
      class="scroll-content"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="content-wrapper">
        <!-- 营期选择（仅显示进行中） -->
        <view v-if="campList.length > 0" class="section-box scope-selector">
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

        <!-- 班级列表 + 学班/检班分配 -->
        <view v-if="selectedCamp" class="section-box">
          <view class="section-title">班级岗位分配</view>
          
          <view 
            v-for="cls in classList" 
            :key="cls.classId" 
            class="duty-card"
          >
            <view class="duty-header">
              <view class="duty-name">{{ cls.className }}</view>
            </view>

            <!-- 学班 -->
            <view class="duty-row">
              <view class="duty-label">学班：</view>
              <view v-if="cls.learnMonitor" class="assigned-user">
                {{ cls.learnMonitor.nickname || cls.learnMonitor.username ||cls.learnMonitor.account}}
                <view class="quit-btn" @click="removeDuty(cls, 'learnMonitor')">移除</view>
              </view>
              <view v-else class="assign-row">
                <input 
                  v-model="searchMap[cls.classId + '_learn']" 
                  placeholder="搜索账号/昵称/手机号" 
                  class="search-input"
                  @input="debounceSearch(cls, 'learn')"
                />
                <view class="user-list" v-if="userResultMap[cls.classId + '_learn']">
                  <view 
                    v-for="user in userResultMap[cls.classId + '_learn']" 
                    :key="user.userId" 
                    class="user-item"
                  >
                    <view class="user-info">
                       <view class="username">{{ user.nickname || user.account || user.username || '--' }}</view>
                      <view class="phone">{{ user.phone || '--' }}</view>
                    </view>
                    <view class="assign-btn" @click="assignDuty(cls, user, 'learnMonitor')">分配</view>
                  </view>
                </view>
              </view>
            </view>

            <!-- 检班 -->
            <view class="duty-row">
              <view class="duty-label">检班：</view>
              <view v-if="cls.checkMonitor" class="assigned-user">
                {{ cls.checkMonitor.nickname || cls.checkMonitor.username ||cls.checkMonitor.account}}
                <view class="quit-btn" @click="removeDuty(cls, 'checkMonitor')">移除</view>
              </view>
              <view v-else class="assign-row">
                <input 
                  v-model="searchMap[cls.classId + '_check']" 
                  placeholder="搜索账号/昵称/手机号" 
                  class="search-input"
                  @input="debounceSearch(cls, 'check')"
                />
                <view class="user-list" v-if="userResultMap[cls.classId + '_check']">
                  <view 
                    v-for="user in userResultMap[cls.classId + '_check']" 
                    :key="user.userId" 
                    class="user-item"
                  >
                    <view class="user-info">
                      <view class="username">{{ user.nickname || user.username ||user.account}}</view>
                      <view class="phone">{{ user.phone || '--' }}</view>
                    </view>
                    <view class="assign-btn" @click="assignDuty(cls, user, 'checkMonitor')">分配</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="campList.length === 0" class="empty-tip">
          <text>暂无进行中的营期</text>
        </view>

        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '@/api/config';

export default {
  name: 'AdminDuty',
  data() {
    return {
      token: '',
      campList: [],
      selectedCamp: null,
      classList: [],
      searchMap: {},
      userResultMap: {},
      searchTimer: null,
      // 下拉刷新状态
      refreshing: false
    };
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
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true;
      await this.loadOngoingCamps();
      this.refreshing = false;
    },

    // 加载所有进行中的营期
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
        } else {
          uni.showToast({ title: res.data?.msg || '加载营期失败', icon: 'none' });
        }
      } catch (error) {
        console.error('加载营期失败:', error);
        uni.showToast({ title: '网络异常', icon: 'none' });
      }
    },

    // 选择营期，加载对应班级和班长信息
    async selectCamp(camp) {
      this.selectedCamp = camp;
      this.searchMap = {};
      this.userResultMap = {};

      try {
        // 同时请求班级列表和班长列表
        const [classesRes, monitorsRes] = await Promise.all([
          uni.request({
            url: `${API_CONFIG.baseUrl}/volunteer/admin/classes`,
            method: 'GET',
            data: { campId: camp.campId },
            header: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          }),
          uni.request({
            url: `${API_CONFIG.baseUrl}/volunteer/admin/monitors`,
            method: 'GET',
            data: { campId: camp.campId },
            header: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (classesRes.statusCode === 200 && classesRes.data.code === 200) {
          let classes = classesRes.data.data || [];
          
          // 如果班长列表请求成功，将班长信息与班级信息关联
          if (monitorsRes.statusCode === 200 && monitorsRes.data.code === 200) {
            const monitors = monitorsRes.data.data || [];
            
            // 为每个班级添加学班和检班信息
            classes = classes.map(cls => {
              const learnMonitor = monitors.find(mon => mon.className === cls.className && mon.dutyType === '学班');
              const checkMonitor = monitors.find(mon => mon.className === cls.className && mon.dutyType === '检班');
              
              return {
                ...cls,
                learnMonitor,
                checkMonitor
              };
            });
          }
          
          this.classList = classes;
        } else {
          uni.showToast({ title: classesRes.data?.msg || '加载班级失败', icon: 'none' });
        }
      } catch (error) {
        console.error('加载班级失败:', error);
        uni.showToast({ title: '网络异常', icon: 'none' });
      }
    },

    // 防抖搜索用户
    debounceSearch(cls, type) {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.doSearch(cls, type);
      }, 500);
    },

    // 执行搜索
    async doSearch(cls, type) {
      const key = `${cls.classId}_${type}`;
      const keyword = this.searchMap[key];
      
      if (!keyword || keyword.length < 2) {
        this.userResultMap[key] = [];
        return;
      }

      try {
        const res = await uni.request({
          url:`${API_CONFIG.baseUrl}${API_CONFIG.paths.searchUser}?keyword=${encodeURIComponent(keyword)}`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.statusCode === 200 && res.data.code === 200) {
          this.userResultMap[key] = res.data.data || [];
        } else {
          this.userResultMap[key] = [];
        }
      } catch (error) {
        console.error('搜索用户失败:', error);
        this.userResultMap[key] = [];
      }
    },

    // 分配岗位
    async assignDuty(cls, user, dutyType) {
      try {
        const res = await uni.request({
          url: `${API_CONFIG.baseUrl}/volunteer/manage/assign-duty`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          data: {
            targetUserId: user.userId,
            targetType: 'class',
            targetId: cls.classId,
            dutyType: dutyType === 'learnMonitor' ? '学班' : '检班'
          }
        });

        if (res.statusCode === 200 && res.data.code === 200) {
          uni.showToast({ title: '分配成功', icon: 'success' });
          this.selectCamp(this.selectedCamp);
        } else {
          uni.showToast({ title: res.data?.msg || '分配失败', icon: 'none' });
        }
      } catch (error) {
        console.error('分配失败:', error);
        uni.showToast({ title: '网络异常', icon: 'none' });
      }
    },

    // 移除岗位
    async removeDuty(cls, dutyType) {
      uni.showModal({
        title: '确认移除',
        content: `确定要移除该${dutyType === 'learnMonitor' ? '学班' : '检班'}吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const res2 = await uni.request({
                url: `${API_CONFIG.baseUrl}/volunteer/manage/remove-duty`,
                method: 'POST',
                header: {
                  'Authorization': `Bearer ${this.token}`,
                  'Content-Type': 'application/json'
                },
                data: {
                  assignmentId: dutyType === 'learnMonitor' ? cls.learnMonitor.assignmentId : cls.checkMonitor.assignmentId
                }
              });

              if (res2.statusCode === 200 && res2.data.code === 200) {
                uni.showToast({ title: '移除成功', icon: 'success' });
                this.selectCamp(this.selectedCamp);
              } else {
                uni.showToast({ title: res2.data?.msg || '移除失败', icon: 'none' });
              }
            } catch (error) {
              console.error('移除失败:', error);
              uni.showToast({ title: '网络异常', icon: 'none' });
            }
          }
        }
      });
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

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.duty-card {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}
.duty-card:last-child {
  border-bottom: none;
}
.duty-header {
  margin-bottom: 16rpx;
}
.duty-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.duty-row {
  display: flex;
  align-items: center;
  margin: 16rpx 0;
}
.duty-label {
  width: 100rpx;
  font-size: 28rpx;
  color: #333;
}
.assigned-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.quit-btn {
  color: #ff4d4f;
  font-size: 26rpx;
  padding: 0 10rpx;
  cursor: pointer;
}
.assign-row {
  flex: 1;
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
.user-list {
  max-height: 300rpx;
  overflow-y: auto;
}
.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.user-item:last-child {
  border-bottom: none;
}
.user-info {
  flex: 1;
}
.username {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
}
.phone {
  font-size: 24rpx;
  color: #666;
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

.empty-tip { 
  text-align: center; 
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
} 

.safe-area-spacer { 
  height: 200rpx; 
}
</style>