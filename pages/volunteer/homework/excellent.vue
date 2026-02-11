<template>
  <!-- 外层容器包裹页面+底部导航 -->
  <view class="page-wrapper">
    <!-- 优秀作业页面内容 -->
    <view class="excellent-homework">
      <!-- 顶部导航（和作业统计一致） -->
      <uni-nav-bar 
        title="优秀作业评选" 
        left-icon="back" 
        @clickLeft="goBack"
        background="#fdfbf7"
        color="#9e2a2b"
        border="true"
      ></uni-nav-bar>

      <!-- 筛选下拉框（放在导航栏正下方） -->
      <view class="filter-container" v-if="filterOptions.length > 0">
        <picker mode="selector" :range="filterOptions" range-key="name" @change="handleFilterChange">
          <view class="picker-content">
            {{ currentFilter.name || '请选择管理范围' }}
            <uni-icons type="down" size="16" color="#9e2a2b"></uni-icons>
          </view>
        </picker>
      </view>

      <!-- 标签切换 -->
      <view class="tab-bar" v-if="filterOptions.length > 0">
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'list' }"
          @click="switchTab('list')"
        >
          作业列表
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'excellent' }"
          @click="switchTab('excellent')"
        >
          优秀作业
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-wrapper" v-if="loading">
        <uni-load-more type="loading" text="正在加载数据..."></uni-load-more>
      </view>

      <!-- 空数据状态 -->
      <view class="empty-wrapper" v-if="!loading && filterOptions.length === 0">
        <uni-icons type="empty" size="80" color="#9e2a2b"></uni-icons>
        <text class="empty-text">暂无管理范围数据</text>
        <text class="empty-desc">请联系管理员分配管理权限</text>
      </view>
      <view class="empty-wrapper" v-if="!loading && filterOptions.length > 0 && list.length === 0">
        <uni-icons type="empty" size="80" color="#9e2a2b"></uni-icons>
        <text class="empty-text">暂无{{ currentTab === 'list' ? '作业' : '优秀作业' }}</text>
      </view>

      <!-- 作业列表 -->
      <view class="homework-list" v-if="!loading && list.length > 0">
        <view class="homework-item" v-for="(item, index) in list" :key="index">
          <view class="student-info">
            <text class="student-name">{{ item.name }}</text>
          </view>
          <view class="action-btns">
            <button 
              class="excellent-btn" 
              @click="toggleExcellent(item)"
              :style="{backgroundColor: item.isExcellent ? '#9e2a2b' : '#e0e0e0', color: item.isExcellent ? '#fff' : '#666'}"
            >
              {{ item.isExcellent ? '已选优秀' : '推选优秀' }}
            </button>
            <button class="detail-btn" @click="viewDetail(item)">作业详情</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 🔥 修改为和首页完全一致的底部导航栏 -->
    <view class="bottom-tabbar">
      <view class="tab-item" :class="{ active: activeTab === 'home' }" @tap="goToHome">
        <image :src="activeTab === 'home' ? 'https://img.icons8.com/fluency/96/home.png' : 'https://img.icons8.com/ios/96/home.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">志愿首页</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'excellent' }" @tap="goToExcellent">
        <image :src="activeTab === 'excellent' ? 'https://img.icons8.com/fluency/96/star.png' : 'https://img.icons8.com/ios/96/star.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">优秀作业</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'stats' }" @tap="goToStats">
        <image :src="activeTab === 'stats' ? 'https://img.icons8.com/fluency/96/bar-chart.png' : 'https://img.icons8.com/ios/96/bar-chart.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">志愿统计</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'profile' }" @tap="goToProfile">
        <image :src="activeTab === 'profile' ? 'https://img.icons8.com/fluency/96/user.png' : 'https://img.icons8.com/ios/96/user.png'" class="tab-icon" mode="aspectFit"></image>
        <text class="tab-text">个人中心</text>
      </view>
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../../api/config';

export default {
  data() {
    return {
      loading: false,
      filterOptions: [],
      currentFilter: {},
      currentTab: 'list',
      list: [],
      token: uni.getStorageSync('token') || '',
      activeTab: 'excellent'
    };
  },
  onLoad() {
    this.initData();
    this.setActiveTab();
  },
  onShow() {
    // 页面显示时重新设置激活态，保证导航栏选中正确
    this.setActiveTab();
  },
  onPullDownRefresh() {
    this.initData(true);
  },
  methods: {
    setActiveTab() {
      // 和首页保持一致的激活态判断逻辑
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1].route;
      if (currentPage.includes('volunteer/index')) {
        this.activeTab = 'home';
      } else if (currentPage.includes('homework/excellent')) {
        this.activeTab = 'excellent';
      } else if (currentPage.includes('homework/stats')) {
        this.activeTab = 'stats';
      } else if (currentPage.includes('volunteer/my')) {
        this.activeTab = 'profile';
      }
    },
    goBack() {
      uni.navigateBack();
    },
    // 和首页一致的导航跳转方法
    goToHome() {
      uni.reLaunch({ url: '/pages/volunteer/index' });
    },
    goToExcellent() {
      uni.reLaunch({ url: '/pages/volunteer/homework/excellent' });
    },
    goToStats() {
      uni.reLaunch({ url: '/pages/volunteer/homework/stats' });
    },
    goToProfile() {
      uni.reLaunch({ url: '/pages/volunteer/my' });
    },
    request(url, data = {}, method = 'GET') {
      const fullUrl = `${API_CONFIG.baseUrl}${url}`;
      return new Promise((resolve, reject) => {
        uni.request({
          url: fullUrl,
          method,
          data,
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          success: (res) => {
            if (res.data.code === 0) {
              resolve(res.data);
            } else {
              if (res.data.code === -1 && res.data.msg.includes('Token')) {
                uni.removeStorageSync('token');
                uni.redirectTo({ url: '/pages/login/login' });
              }
              uni.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
              reject(res.data);
            }
          },
          fail: (err) => {
            uni.showToast({ title: '网络请求失败', icon: 'none', duration: 2000 });
            reject(err);
          }
        });
      });
    },
    async initData(refresh = false) {
      if (!refresh) {
        this.loading = true;
      }
      try {
        const scopeRes = await this.request(API_CONFIG.paths.getVolunteerScope);
        const scope = scopeRes.data;
        const [classRes, bigGroupRes, smallGroupRes] = await Promise.all([
          this.request(API_CONFIG.paths.getClassList),
          this.request(API_CONFIG.paths.getBigGroupList),
          this.request(API_CONFIG.paths.getSmallGroupList)
        ]);
        const allClasses = classRes.data || [];
        const allBigGroups = bigGroupRes.data || [];
        const allSmallGroups = smallGroupRes.data || [];
        this.filterOptions = this.buildFlatFilterOptions(scope, allClasses, allBigGroups, allSmallGroups);
        if (this.filterOptions.length > 0) {
          this.currentFilter = this.filterOptions[0];
          await this.loadHomeworkList();
        }
      } catch (err) {
        console.error('初始化数据失败：', err);
      } finally {
        this.loading = false;
        if (refresh) {
          uni.stopPullDownRefresh();
        }
      }
    },
    buildFlatFilterOptions(scope, allClasses, allBigGroups, allSmallGroups) {
      const options = [];
      if (scope.class && scope.class.length > 0) {
        scope.class.forEach(cls => {
          options.push({type: 'class',id: cls.id,name: `班级：${cls.name}`});
          const classBigGroups = allBigGroups.filter(bg => bg.class_id === cls.id);
          classBigGroups.forEach(bg => {
            options.push({type: 'bigGroup',id: bg.id,name: `大组：${cls.name}-${bg.name}`});
            const bigGroupSmallGroups = allSmallGroups.filter(sg => sg.big_group_id === bg.id);
            bigGroupSmallGroups.forEach(sg => {
              options.push({type: 'smallGroup',id: sg.id,name: `小组：${cls.name}-${bg.name}-${sg.name}`});
            });
          });
        });
      }
      if (scope.bigGroup && scope.bigGroup.length > 0) {
        scope.bigGroup.forEach(bg => {
          const className = allClasses.find(cls => cls.id === bg.class_id)?.name || '未知班级';
          options.push({type: 'bigGroup',id: bg.id,name: `大组：${className}-${bg.name}`});
          const bigGroupSmallGroups = allSmallGroups.filter(sg => sg.big_group_id === bg.id);
          bigGroupSmallGroups.forEach(sg => {
            options.push({type: 'smallGroup',id: sg.id,name: `小组：${className}-${bg.name}-${sg.name}`});
          });
        });
      }
      if (scope.smallGroup && scope.smallGroup.length > 0) {
        scope.smallGroup.forEach(sg => {
          const bigGroup = allBigGroups.find(bg => bg.id === sg.big_group_id) || {};
          const className = allClasses.find(cls => cls.id === bigGroup.class_id)?.name || '未知班级';
          const bigGroupName = bigGroup.name || '未知大组';
          options.push({type: 'smallGroup',id: sg.id,name: `小组：${className}-${bigGroupName}-${sg.name}`});
        });
      }
      return options;
    },
    async handleFilterChange(e) {
      const selectedIndex = e.detail.value;
      this.currentFilter = this.filterOptions[selectedIndex];
      this.loading = true;
      try {
        await this.loadHomeworkList();
      } catch (err) {
        console.error('切换筛选条件失败：', err);
      } finally {
        this.loading = false;
      }
    },
    switchTab(tab) {
      this.currentTab = tab;
      this.loadHomeworkList();
    },
    async loadHomeworkList() {
      if (!this.currentFilter.type || !this.currentFilter.id) return;
      this.loading = true;
      try {
        const { type, id } = this.currentFilter;
        const status = this.currentTab === 'excellent' ? 'excellent' : 'all';
        const res = await this.request(`/homework/excellent/list/${type}/${id}/${status}`);
        if (res.code === 0) this.list = res.data || [];
      } catch (err) {
        console.error('加载作业失败：', err);
        uni.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },
    async toggleExcellent(item) {
      try {
        const res = await this.request(`/camp/homework/mark/${item.homeworkId}/${item.isExcellent ? 0 : 1}`, {}, 'POST');
        if (res.code === 0) {
          item.isExcellent = !item.isExcellent;
          uni.showToast({ title: item.isExcellent ? '推选优秀成功' : '取消优秀成功' });
        }
      } catch (err) {
        console.error('操作失败：', err);
        uni.showToast({ title: '操作失败', icon: 'none' });
      }
    },
    viewDetail(item) {
      uni.navigateTo({url: `/pages/volunteer/homework/details?homeworkId=${item.homeworkId}`});
    }
  }
};
</script>

<style scoped lang="scss">
/* 页面容器 */
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fdfbf7;
  padding-top: var(--status-bar-height);
}

/* 页面内容容器：删除多余上边距，让筛选栏紧贴导航栏 */
.excellent-homework {
  flex: 1;
  background-color: #fdfbf7;
  padding-bottom: 120rpx; /* 适配底部导航高度 */
  padding-top: 0; /* 关键：删除多余上边距 */
}

/* 顶部导航：保留原有样式 */
.uni-nav-bar {
  --uni-nav-bar-background-color: #fdfbf7 !important;
  --uni-nav-bar-text-color: #9e2a2b !important;
  --uni-nav-bar-title-text-color: #9e2a2b !important;
  --uni-nav-bar-border-color: #eee !important;
  position: static; /* 关键：改为静态定位，让筛选栏紧贴下方 */
  top: auto;
  left: auto;
  right: auto;
  z-index: auto;
}

/* 筛选容器：紧贴导航栏下方 */
.filter-container {
  padding: 16rpx 24rpx;
  background-color: #fdfbf7;
  border-bottom: 1rpx solid #eee;
  position: static; /* 静态定位，跟随导航栏 */
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 16rpx;

  .picker-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 16rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 标签栏 */
.tab-bar {
  display: flex;
  margin: 0 24rpx 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}
.tab-item {
  flex: 1;
  padding: 20rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  position: relative;
}
.tab-item.active {
  color: #9e2a2b;
  font-weight: 600;
}
/* 🔥 删除了下划线样式：.tab-item.active::after 整个区块 */

/* 加载/空状态 */
.loading-wrapper, .empty-wrapper {
  padding: 100rpx 0;
  text-align: center;
}
.empty-text {
  font-size: 28rpx;
  color: #9e2a2b;
  margin-top: 20rpx;
}
.empty-desc {
  font-size: 24rpx;
  color: #a09594;
  margin-top: 10rpx;
}

/* 作业列表 */
.homework-list {
  margin: 0 24rpx;
}
.homework-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);
}
.student-info {
  flex: 1;
}
.student-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
.action-btns {
  display: flex;
  gap: 16rpx;
}
.excellent-btn, .detail-btn {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: none;
}
.excellent-btn {
  background-color: #e0e0e0;
  color: #666;
}
.detail-btn {
  background-color: #f0f0f0;
  color: #666;
}

/* 🔥 和首页完全一致的底部导航栏样式 */
.bottom-tabbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  /* 适配安全区：高度改为auto + 最小高度 + 底部内边距 */
  height: auto;
  min-height: 100rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  border-top: 1rpx solid #eee;
  z-index: 99;
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  flex: 1;
  /* 保证每个tab项的最小高度 */
  min-height: 100rpx;
}
.tab-icon {
  width: 48rpx;
  height: 48rpx;
}
.tab-text {
  font-size: 22rpx;
  color: #666;
}
.tab-item.active .tab-text {
  color: #A31D1D;
}
.tab-item.active .tab-icon {
  /* 激活态图标染成红色，和首页一致 */
  filter: brightness(0) saturate(100%) invert(14%) sepia(88%) saturate(3841%) hue-rotate(356deg) brightness(90%) contrast(101%);
}
</style>