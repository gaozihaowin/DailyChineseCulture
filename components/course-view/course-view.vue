<template>
  <view class="view-container">

    <view class="header">
      <view class="header-title">
        <text class="logo-seal">课</text>
        <text>我的课程</text>
      </view>
      <uni-icons type="person" size="24" color="#8c8686"></uni-icons>
    </view>

    <view class="tabs-container">
      <view class="tabs-wrapper">
        <view 
          class="tab-item" 
          v-for="(tab, index) in topTabs" 
          :key="index"
          :class="{ active: currentTopTab === index }"
          @tap="switchTopTab(index)"
        >
          {{ tab.name }}
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      
      <view class="course-list" v-if="displayList.length > 0">
        <view 
          class="course-card" 
          v-for="(item, index) in displayList" 
          :key="index"
          @click="navigateToCourseDetail(item.id)"
        >
          
          <view class="card-thumb" 
                :class="{ 'thumb-gray': item.status === 'hist' }"
                :style="{ background: item.status === 'hist' ? '#d1d1d1' : (colorMap[item.type] || colorMap['默认']) }">
            
            <view class="status-badge" :class="getStatusClass(item.status)">
              {{ item.statusText }}
            </view>
            
            <view class="thumb-main">{{ item.type }}</view>
            <view class="thumb-sub">{{ item.term }}</view>
          </view>
          
          <view class="card-info">
            <view class="card-title" :class="{ 'text-gray': item.status === 'hist' }">
              {{ item.title }}
            </view>
            
            <view class="info-group">
              <view class="info-row">
                <uni-icons type="calendar" size="12" color="#999"></uni-icons>
                <text>报名时间: {{ item.updateDate }}</text>
              </view>
              
              <view class="progress-section">
                <view class="progress-text">学习进度: {{ item.progress }}%</view>
                <view class="progress-track">
                  <view class="progress-fill" 
                        :style="{ width: item.progress + '%', background: item.status === 'done' ? '#16a34a' : '#9e2a2b' }">
                  </view>
                </view>
              </view>
            </view>

            <view class="card-action">
              <button 
                class="btn-action" 
                :class="'btn-' + item.status"
                hover-class="btn-hover"
              >
                {{ getActionText(item.status) }}
              </button>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <uni-icons type="folder-close" size="60" color="#e0e0e0"></uni-icons>
        <text class="empty-text">暂无课程记录</text>
      </view>
      
      <view class="safe-area-spacer"></view>

    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config';

export default {
    name: 'CourseView',
    
    data() {
      return {
        currentTopTab: 0,
        // 映射关系: 1=正在学习, 2=历史课程, 3=已结业
        topTabs: [
          { name: '正在学习', type: 1 },       
          { name: '历史课程', type: 2 },      
          { name: '已结业',   type: 3 }         
        ],
        // 班级颜色映射逻辑
        colorMap: {
          '诚意班': 'linear-gradient(135deg, #8a2021, #b53b3c)',
          '明理班': 'linear-gradient(135deg, #1e3c72, #2a5298)',
          '笃行班': 'linear-gradient(135deg, #d35400, #e67e22)',
          '印证班': 'linear-gradient(135deg, #205e4a, #3ea07a)',
          '良知班': 'linear-gradient(135deg, #5c433b, #8b6b61)',
          '默认': 'linear-gradient(135deg, #9e2a2b, #b53b3c)'
        },
        displayList: []
      }
    },

    mounted() {
      // 默认加载第一个 Tab (type: 1)
      this.fetchCourseData(this.topTabs[0].type);
    },

    methods: {
      switchTopTab(index) {
        if (this.currentTopTab === index) return;
        this.currentTopTab = index;
        this.fetchCourseData(this.topTabs[index].type);
      },

      /**
       * 统一获取数据方法
       * @param {Number} tabType - 后端需要的过滤参数
       */
      async fetchCourseData(tabType) {
        // 读取token
        const token = uni.getStorageSync('token');
        if (!token) {
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/Login/index' });
          }, 1000);
          return;
        }
        
        uni.showLoading({ title: '同步中...', mask: true });
        
        try {
          // 【优化】: 统一调用单一路径，通过 query 传参
          const res = await uni.request({
            url: API_CONFIG.baseUrl + '/courses', 
            method: 'GET',
            header: {
              'Authorization': token
            },
            data: { tabType: tabType }
          });
          
          if (res.statusCode === 200 && res.data.code === 200) {
            this.displayList = res.data.data;
          } else {
            this.displayList = [];
          }
        } catch (error) {
          uni.showToast({ title: '网络连接异常', icon: 'none' });
          this.displayList = [];
        } finally {
          uni.hideLoading();
        }
      },

      getStatusClass(status) {
        const map = { 'ing': 'badge-ing', 'done': 'badge-done', 'hist': 'badge-expired' };
        return map[status] || '';
      },

      getActionText(status) {
        const map = { 'ing': '继续学习', 'done': '查看证书', 'hist': '查看存档' };
        return map[status] || '进入课程';
      },

      navigateToCourseDetail(courseId) {
        uni.navigateTo({
          url: `/pages/CourseDetail/index?id=${courseId}`
        });
      }
    }
  }
</script>

<style scoped>
  /* 基础容器 */
  .view-container { 
    height: 100%; 
    display: flex; 
    flex-direction: column; 
    background-color: #f8f9fa; 
  }

  /* 头部吸顶 */
  .header { 
    padding: 80rpx 40rpx 30rpx; 
    background: #fff; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    position: sticky;
    top: 0; 
    z-index: 10; 
  }
  .header-title { display: flex; align-items: center; font-size: 34rpx; font-weight: bold; color: #2d2424; gap: 12rpx; }
  .logo-seal { background: #9e2a2b; color: #fff; font-size: 24rpx; width: 44rpx; height: 44rpx; line-height: 44rpx; text-align: center; border-radius: 8rpx; font-family: serif; }

  /* Tab 样式优化 */
  .tabs-container { background: #fff; padding: 0 40rpx 24rpx; border-radius: 0 0 40rpx 40rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03); }
  .tabs-wrapper { display: flex; background: #f1f3f5; padding: 8rpx; border-radius: 20rpx; }
  .tab-item { flex: 1; text-align: center; padding: 16rpx 0; font-size: 26rpx; color: #8c8686; border-radius: 16rpx; transition: all 0.2s; }
  .tab-item.active { background: #fff; color: #9e2a2b; font-weight: bold; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05); }

  /* 列表与卡片 */
  .scroll-content { flex: 1; height: 0; width: 100%; }
  .course-list { padding: 0 32rpx; }
  .course-card { background: #fff; border-radius: 32rpx; padding: 28rpx; margin-bottom: 28rpx; display: flex; gap: 28rpx; box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.02); }

  /* 封面图 */
  .card-thumb { width: 180rpx; height: 180rpx; border-radius: 20rpx; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; position: relative; flex-shrink: 0; }
  .thumb-gray { filter: grayscale(100%); opacity: 0.6; }
  .thumb-main { font-size: 32rpx; font-weight: bold; font-family: serif; }
  .thumb-sub  { font-size: 18rpx; opacity: 0.8; margin-top: 4rpx; }

  /* 状态徽标 */
  .status-badge { position: absolute; top: 12rpx; left: 12rpx; font-size: 18rpx; padding: 4rpx 12rpx; border-radius: 8rpx; color: #fff; }
  .badge-ing     { background: rgba(0,0,0,0.25); }
  .badge-done    { background: #16a34a; }
  .badge-expired { background: #6b7280; }

  /* 信息排版 */
  .card-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
  .card-title { font-size: 28rpx; font-weight: bold; color: #333; line-height: 1.5; }
  .text-gray { color: #999; }
  .info-group { display: flex; flex-direction: column; gap: 12rpx; margin-top: 10rpx; }
  .info-row { font-size: 22rpx; color: #999; display: flex; align-items: center; gap: 8rpx; }

  /* 进度条样式 */
  .progress-section { margin-top: 4rpx; }
  .progress-text { font-size: 20rpx; color: #999; margin-bottom: 8rpx; }
  .progress-track { height: 6rpx; background: #eee; border-radius: 10rpx; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 10rpx; transition: width 0.8s ease-out; }

  /* 按钮 */
  .card-action { display: flex; justify-content: flex-end; margin-top: 12rpx; }
  .btn-action { margin: 0; font-size: 24rpx; padding: 0 28rpx; height: 56rpx; line-height: 56rpx; border-radius: 40rpx; font-weight: bold; border: none; }
  .btn-action::after { border: none; }
  .btn-ing { background: rgba(158, 42, 43, 0.08); color: #9e2a2b; }
  .btn-done { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
  .btn-hist { background: #f3f4f6; color: #6b7280; }
  .btn-hover { opacity: 0.7; transform: scale(0.96); }

  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 160rpx; }
  .empty-text { font-size: 26rpx; color: #ccc; margin-top: 24rpx; }
  .safe-area-spacer { height: 160rpx; }
</style>