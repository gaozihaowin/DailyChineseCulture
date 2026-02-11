<template>
  <!-- 外层容器包裹页面+底部导航 -->
  <view class="page-wrapper">
    <!-- 作业统计页面内容 -->
    <view class="homework-stats">
      <!-- 顶部导航 -->
      <uni-nav-bar 
        title="作业统计" 
        left-icon="back" 
        @clickLeft="goBack"
        background="#fdfbf7"
        color="#9e2a2b"
        border="true"
      ></uni-nav-bar>

      <!-- 筛选下拉框 -->
      <view class="filter-container" v-if="filterOptions.length > 0">
        <picker mode="selector" :range="filterOptions" range-key="name" @change="handleFilterChange">
          <view class="picker-content">
            {{ currentFilter.name || '请选择管理范围' }}
            <uni-icons type="down" size="16" color="#9e2a2b"></uni-icons>
          </view>
        </picker>
      </view>

      <!-- 加载状态 -->
      <view class="loading-wrapper" v-if="loading">
        <uni-load-more type="loading" text="正在加载数据..."></uni-load-more>
      </view>

      <!-- 空数据状态 -->
      <view class="empty-wrapper" v-if="!loading && !statsData && filterOptions.length === 0">
        <uni-icons type="empty" size="80" color="#9e2a2b"></uni-icons>
        <text class="empty-text">暂无管理范围数据</text>
        <text class="empty-desc">请联系管理员分配管理权限</text>
      </view>

      <!-- 统计数据 -->
      <view class="stats-container" v-if="!loading && statsData">
        <!-- 整体统计 -->
        <view class="total-stats">
          <text class="stats-title">{{ currentFilter.name }} 作业完成情况</text>
          <view class="stats-card">
            <view class="stats-item">
              <text class="label">总人数</text>
              <text class="value">{{ statsData.total }}</text>
            </view>
            <view class="stats-item">
              <text class="label">已提交</text>
              <text class="value submitted">{{ statsData.submitted }}</text>
            </view>
            <view class="stats-item">
              <text class="label">迟交</text>
              <text class="value late">{{ statsData.late }}</text>
            </view>
            <view class="stats-item">
              <text class="label">未提交</text>
              <text class="value unsubmitted">{{ statsData.unsubmitted }}</text>
            </view>
            <view class="stats-item full-width">
              <text class="label">完成率</text>
              <view class="progress-bar">
                <view class="progress" :style="{ width: statsData.completionRate + '%' }"></view>
              </view>
              <text class="rate">{{ statsData.completionRate }}%</text>
            </view>
          </view>
        </view>

        <!-- 饼状图 -->
        <view class="chart-container">
          <view class="pie-chart">
            <view class="pie-inner">
              <text class="rate-text">{{ statsData.completionRate }}%</text>
              <text class="rate-desc">完成率</text>
            </view>
            <view class="pie-bg" :style="pieStyle"></view>
          </view>
          <view class="chart-legend">
            <view class="legend-item">
              <view class="dot submitted"></view>
              <text>已提交 {{ statsData.submitted }} 人</text>
            </view>
            <view class="legend-item">
              <view class="dot late"></view>
              <text>迟交 {{ statsData.late }} 人</text>
            </view>
            <view class="legend-item">
              <view class="dot unsubmitted"></view>
              <text>未提交 {{ statsData.unsubmitted }} 人</text>
            </view>
          </view>
        </view>

        <!-- 详情按钮 -->
        <view class="btn-container">
          <button class="detail-btn" @click="goToDetail">查看详细名单</button>
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
      statsData: null,
      token: uni.getStorageSync('token') || '',
      activeTab: 'stats' // 当前激活标签
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
  computed: {
    // 饼图样式计算
    pieStyle() {
      if (!this.statsData || this.statsData.total === 0) {
        return {};
      }
      
      const total = this.statsData.total;
      const submitted = this.statsData.submitted;
      const late = this.statsData.late;
      const unsubmitted = this.statsData.unsubmitted;
      
      const submittedDeg = (submitted / total) * 360;
      const lateDeg = (late / total) * 360;
      const unsubmittedDeg = (unsubmitted / total) * 360;
      
      return {
        background: `conic-gradient(
          #9e2a2b 0deg ${submittedDeg}deg,
          #c53e3f ${submittedDeg}deg ${submittedDeg + lateDeg}deg,
          #d9534f ${submittedDeg + lateDeg}deg 360deg
        )`
      };
    }
  },
  methods: {
    // 设置当前激活标签（和首页统一逻辑）
    setActiveTab() {
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
    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack();
    },

    /**
     * 底部导航跳转（和首页统一方法名+逻辑）
     */
    goToHome() {
      uni.reLaunch({ url: '/pages/volunteer/index' });
    },
    goToExcellent() {
      uni.reLaunch({ url: '/pages/volunteer/homework/excellent' });
    },
    goToStats() {
      // 当前已在统计页
    },
    goToProfile() {
      uni.reLaunch({ url: '/pages/volunteer/my' });
    },

    /**
     * 通用请求方法
     */
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

    /**
     * 初始化数据
     */
    async initData(refresh = false) {
      if (!refresh) {
        this.loading = true;
      }
      
      try {
        // 1. 获取志愿者权限范围
        const scopeRes = await this.request(API_CONFIG.paths.getVolunteerScope);
        const scope = scopeRes.data;

        // 2. 获取所有组织数据
        const [classRes, bigGroupRes, smallGroupRes] = await Promise.all([
          this.request(API_CONFIG.paths.getClassList),
          this.request(API_CONFIG.paths.getBigGroupList),
          this.request(API_CONFIG.paths.getSmallGroupList)
        ]);
        const allClasses = classRes.data || [];
        const allBigGroups = bigGroupRes.data || [];
        const allSmallGroups = smallGroupRes.data || [];

        // 3. 构建扁平化筛选选项
        this.filterOptions = this.buildFlatFilterOptions(scope, allClasses, allBigGroups, allSmallGroups);

        // 4. 默认选中第一个筛选选项
        if (this.filterOptions.length > 0) {
          this.currentFilter = this.filterOptions[0];
          await this.getStatsData();
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

    /**
     * 构建扁平化筛选选项
     */
    buildFlatFilterOptions(scope, allClasses, allBigGroups, allSmallGroups) {
      const options = [];

      // 1. 处理班级权限
      if (scope.class && scope.class.length > 0) {
        scope.class.forEach(cls => {
          options.push({
            type: 'class',
            id: cls.id,
            name: `班级：${cls.name}`
          });

          // 添加该班级下的所有大组
          const classBigGroups = allBigGroups.filter(bg => bg.class_id === cls.id);
          classBigGroups.forEach(bg => {
            options.push({
              type: 'bigGroup',
              id: bg.id,
              name: `大组：${cls.name}-${bg.name}`
            });

            // 添加该大组下的所有小组
            const bigGroupSmallGroups = allSmallGroups.filter(sg => sg.big_group_id === bg.id);
            bigGroupSmallGroups.forEach(sg => {
              options.push({
                type: 'smallGroup',
                id: sg.id,
                name: `小组：${cls.name}-${bg.name}-${sg.name}`
              });
            });
          });
        });
      }

      // 2. 处理独立的大组权限
      if (scope.bigGroup && scope.bigGroup.length > 0) {
        scope.bigGroup.forEach(bg => {
          const className = allClasses.find(cls => cls.id === bg.class_id)?.name || '未知班级';
          options.push({
            type: 'bigGroup',
            id: bg.id,
            name: `大组：${className}-${bg.name}`
          });

          // 自动添加该大组下的所有小组
          const bigGroupSmallGroups = allSmallGroups.filter(sg => sg.big_group_id === bg.id);
          bigGroupSmallGroups.forEach(sg => {
            options.push({
              type: 'smallGroup',
              id: sg.id,
              name: `小组：${className}-${bg.name}-${sg.name}`
            });
          });
        });
      }

      // 3. 处理独立的小组权限
      if (scope.smallGroup && scope.smallGroup.length > 0) {
        scope.smallGroup.forEach(sg => {
          const bigGroup = allBigGroups.find(bg => bg.id === sg.big_group_id) || {};
          const className = allClasses.find(cls => cls.id === bigGroup.class_id)?.name || '未知班级';
          const bigGroupName = bigGroup.name || '未知大组';
          
          options.push({
            type: 'smallGroup',
            id: sg.id,
            name: `小组：${className}-${bigGroupName}-${sg.name}`
          });
        });
      }

      return options;
    },

    /**
     * 获取统计数据
     */
    async getStatsData() {
      if (!this.currentFilter.type || !this.currentFilter.id) {
        return;
      }
      
      try {
        const statsRes = await this.request(`${API_CONFIG.paths.getHomeworkStats}/${this.currentFilter.type}/${this.currentFilter.id}`);
        this.statsData = statsRes.data;
      } catch (err) {
        console.error('获取统计数据失败：', err);
      }
    },

    /**
     * 切换筛选条件
     */
    async handleFilterChange(e) {
      const selectedIndex = e.detail.value;
      this.currentFilter = this.filterOptions[selectedIndex];
      
      this.loading = true;
      try {
        await this.getStatsData();
      } catch (err) {
        console.error('切换筛选条件失败：', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 跳转到详情页
     */
    goToDetail() {
      if (!this.currentFilter.type || !this.currentFilter.id) {
        uni.showToast({ title: '请先选择管理范围', icon: 'none' });
        return;
      }
      
      uni.navigateTo({
        url: `/pages/volunteer/homework/detail?type=${this.currentFilter.type}&id=${this.currentFilter.id}`
      });
    }
  }
};
</script>

<style scoped lang="scss">
/* 页面外层容器 */
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fdfbf7;
  padding-top: var(--status-bar-height);
}

/* 作业统计页面内容容器 */
.homework-stats {
  flex: 1;
  padding-bottom: 120rpx;
  padding-top: calc(var(--status-bar-height) + 88rpx + 80rpx + 20rpx);
}

/* 顶部导航 */
.uni-nav-bar {
  --uni-nav-bar-background-color: #fdfbf7 !important;
  --uni-nav-bar-text-color: #9e2a2b !important;
  --uni-nav-bar-title-text-color: #9e2a2b !important;
  --uni-nav-bar-border-color: #eee !important;
  position: fixed;
  top: var(--status-bar-height);
  left: 0;
  right: 0;
  z-index: 90;
}

/* 筛选容器 */
.filter-container {
  padding: 16rpx 24rpx;
  background-color: #fdfbf7;
  border-bottom: 1rpx solid #eee;
  position: fixed;
  top: calc(var(--status-bar-height) + 88rpx);
  left: 0;
  right: 0;
  z-index: 80;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

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

/* 统计容器 */
.stats-container {
  padding: 24rpx;
}

/* 整体统计 */
.total-stats {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);

  .stats-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #9e2a2b;
    margin-bottom: 20rpx;
    display: block;
  }

  .stats-card {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .stats-item {
      width: 45%;
      display: flex;
      flex-direction: column;

      &.full-width {
        width: 100%;
        flex-direction: row;
        align-items: center;
        margin-top: 10rpx;
      }

      .label {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 8rpx;
      }

      .value {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;

        &.submitted {
          color: #9e2a2b;
        }

        &.late {
          color: #c53e3f;
        }

        &.unsubmitted {
          color: #d9534f;
        }
      }

      .progress-bar {
        flex: 1;
        height: 20rpx;
        background-color: #f5f5f5;
        border-radius: 10rpx;
        margin: 0 16rpx;
        overflow: hidden;

        .progress {
          height: 100%;
          background-color: #9e2a2b;
          border-radius: 10rpx;
          transition: width 0.3s ease;
        }
      }

      .rate {
        font-size: 28rpx;
        color: #9e2a2b;
        font-weight: 600;
      }
    }
  }
}

/* 图表容器 */
.chart-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);

  .pie-chart {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    overflow: hidden;

    .pie-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }

    .pie-inner {
      position: absolute;
      top: 20rpx;
      left: 20rpx;
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .rate-text {
        font-size: 36rpx;
        font-weight: 800;
        color: #9e2a2b;
      }

      .rate-desc {
        font-size: 22rpx;
        color: #a09594;
      }
    }
  }

  .chart-legend {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .legend-item {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #666;

      .dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        margin-right: 10rpx;

        &.submitted {
          background-color: #9e2a2b;
        }

        &.late {
          background-color: #c53e3f;
        }

        &.unsubmitted {
          background-color: #d9534f;
        }
      }
    }
  }
}

/* 按钮容器 */
.btn-container {
  padding: 0 24rpx;

  .detail-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #9e2a2b;
    color: #fff;
    border: none;
    border-radius: 12rpx;
    font-size: 30rpx;
    box-shadow: 0 8rpx 20rpx rgba(158, 42, 43, 0.2);
  }
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