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
        >
          
          <view class="card-thumb" :class="{ 'thumb-gray': item.status === 'expired' }">
            
            <view class="status-badge" :class="getStatusClass(item.status)">
              {{ item.statusText }}
            </view>
            
            <view class="thumb-main">{{ item.type }}</view>
            <view class="thumb-sub">{{ item.enType }}</view>
          </view>
          
          <view class="card-info">
            <view class="card-title" :class="{ 'text-gray': item.status === 'expired' }">
              {{ item.title }}
            </view>
            
            <view class="info-group">
              <view class="info-row">
                <uni-icons type="calendar" size="12" color="#999"></uni-icons>
                <text>更新: {{ item.updateDate }}</text>
              </view>
              
              <view class="info-row">
                <uni-icons type="spinner" size="12" color="#999"></uni-icons>
                <text v-if="item.status === 'expired'">
                  进度: 未完成 ({{ item.progress }}%)
                </text>
                <text v-else>
                  进度: {{ item.progress }}%
                </text>
              </view>
            </view>

            <view class="card-action">
              
              <button 
                v-if="item.status === 'ing'" 
                class="btn-study" 
                hover-class="btn-hover"
              >
                继续学习 
                <uni-icons type="forward" size="12" color="#9e2a2b" style="margin-left: 4rpx;"></uni-icons>
              </button>
              
              <button 
                v-else-if="item.status === 'done'" 
                class="btn-study btn-done" 
                hover-class="btn-hover"
              >
                查看证书
              </button>
              
              <button 
                v-else-if="item.status === 'expired'" 
                class="btn-study btn-expired" 
                hover-class="btn-hover"
              >
                查看存档
              </button>
              
            </view> </view> </view> </view>

      <view v-else class="empty-state">
        <uni-icons type="folder-close" size="60" color="#e0e0e0"></uni-icons>
        <text class="empty-text">暂无课程记录</text>
      </view>
      
      <view class="safe-area-spacer"></view>

    </scroll-view>
  </view>
</template>

<script>
  export default {
    name: 'CourseView',
    
    data() {
      return {
        // 当前选中的 Tab 索引
        currentTopTab: 0,

        // 顶部 Tab 配置
        // key 用于筛选逻辑: 
        // 'filter_ing' = 只看进行中
        // 'all_history' = 看全部 (全集)
        // 'filter_done' = 只看已完成
        topTabs: [
          { name: '正在学习', key: 'filter_ing' },       
          { name: '历史课程', key: 'all_history' },      
          { name: '已结业',   key: 'filter_done' }         
        ],
        
        // 当前页面实际渲染的列表数据
        displayList: [],

        // 【模拟数据库 Mock Data】
        // 在真实项目中，这里的数据应从后端 API 获取
        mockDatabase: [
          {
            id: 1, 
            status: 'ing', statusText: '学习中',
            type: '诚意班', enType: 'The Sincerity',
            title: '【致良知线上课堂】诚意班第69期',
            updateDate: '2025-11-25', progress: 45
          },
          {
            id: 2, 
            status: 'ing', statusText: '进行中',
            type: '笃行班', enType: 'Practice',
            title: '【致良知大学生】青年领袖成长计划',
            updateDate: '2026-02-01', progress: 12
          },
          {
            id: 3, 
            status: 'done', statusText: '已结业',
            type: '明理班', enType: 'Theory',
            title: '中华文化精髓概论 (2024版)',
            updateDate: '2024-12-31', progress: 100
          },
          {
            id: 4, 
            status: 'expired', statusText: '未完成',
            type: '印证班', enType: 'Proof',
            title: '【企业经营】从心出发的经营之道',
            updateDate: '2023-05-01', progress: 30 
          },
          {
            id: 5, 
            status: 'expired', statusText: '已结束',
            type: '亲子班', enType: 'Family',
            title: '【家庭教育】建设最美家庭第3期',
            updateDate: '2022-08-15', progress: 0
          }
        ]
      }
    },

    /**
     * 生命周期: 组件挂载后触发
     * 默认加载第一个 Tab 的数据
     */
    mounted() {
      this.fetchCourseData(this.topTabs[0].key);
    },

    methods: {
      /**
       * 切换顶部 Tab 事件
       * @param {Number} index - 点击的 Tab 索引
       */
      switchTopTab(index) {
        if (this.currentTopTab === index) return;
        
        this.currentTopTab = index;
        const filterKey = this.topTabs[index].key;
        
        // 根据 key 重新筛选数据
        this.fetchCourseData(filterKey);
      },

      /**
       * 【核心逻辑】模拟后端数据筛选接口
       * @param {String} filterKey - 筛选关键字
       */
      fetchCourseData(filterKey) {
        // 1. 显示加载动画
        uni.showLoading({ title: '同步中...', mask: true });
        
        // 2. 模拟网络请求延迟 (400ms)
        setTimeout(() => {
          let result = [];
          const allData = this.mockDatabase; // 获取全量数据源

          if (filterKey === 'filter_ing') {
            // 逻辑 A: 正在学习 -> 只筛选 status === 'ing'
            result = allData.filter(item => item.status === 'ing');
          
          } else if (filterKey === 'filter_done') {
            // 逻辑 B: 已结业 -> 只筛选 status === 'done'
            result = allData.filter(item => item.status === 'done');
          
          } else if (filterKey === 'all_history') {
            // 逻辑 C: 历史课程 -> 显示【全部】数据 (包含进行中、已结束、已完成)
            // 通常按时间倒序排列 (最新的在前)
            result = [...allData].sort((a, b) => {
              return new Date(b.updateDate) - new Date(a.updateDate);
            });
          }

          // 3. 更新视图数据 & 隐藏 Loading
          this.displayList = result;
          uni.hideLoading();
          
        }, 400);
      },

      /**
       * 工具方法: 根据状态返回对应的 CSS 类名
       * @param {String} status - 课程状态
       */
      getStatusClass(status) {
        const map = {
          'ing': 'badge-ing',
          'done': 'badge-done',
          'expired': 'badge-expired'
        };
        return map[status] || '';
      }
    }
  }
</script>

<style scoped>
  /* ================================= */
  /* 1. 基础布局 Layout                 */
  /* ================================= */
  .view-container { 
    height: 100%; 
    display: flex; 
    flex-direction: column; 
    background-color: #f3f4f6; /* 浅灰背景 */
  }

  /* ================================= */
  /* 2. 头部导航 Header                 */
  /* ================================= */
  .header { 
    padding: 80rpx 40rpx 30rpx; 
    background: #fff; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    position: sticky; /* 吸顶效果 */
    top: 0; 
    z-index: 10; 
  }

  .header-title { 
    display: flex; 
    align-items: center; 
    font-size: 34rpx; 
    font-weight: bold; 
    color: #2d2424; 
    gap: 12rpx; 
  }

  .logo-seal { 
    background: #9e2a2b; /* 品牌红 */
    color: #fff; 
    font-size: 24rpx; 
    width: 40rpx; height: 40rpx; 
    line-height: 40rpx; 
    text-align: center; 
    border-radius: 8rpx; 
    font-family: serif; /* 衬线体 */
  }

  /* ================================= */
  /* 3. 选项卡 Tabs                     */
  /* ================================= */
  .tabs-container { 
    background: #fff; 
    padding: 0 40rpx 20rpx; 
    border-radius: 0 0 32rpx 32rpx; /* 下方圆角 */
    margin-bottom: 20rpx; 
    box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02); 
  }

  .tabs-wrapper { 
    display: flex; 
    background: #f3f4f6; 
    padding: 8rpx; 
    border-radius: 16rpx; 
  }

  .tab-item { 
    flex: 1; 
    text-align: center; 
    padding: 14rpx 0; 
    font-size: 26rpx; 
    color: #8c8686; 
    border-radius: 12rpx; 
    transition: all 0.3s; 
  }

  .tab-item.active { 
    background: #fff; 
    color: #9e2a2b; /* 选中变红 */
    font-weight: bold; 
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05); 
  }

  /* ================================= */
  /* 4. 滚动列表区 Course List          */
  /* ================================= */
  .scroll-content { 
    flex: 1; 
    height: 0; 
    width: 100%; 
  }
  
  .safe-area-spacer { 
    height: 160rpx; /* 底部垫高，防止被 TabBar 遮挡 */
  }

  .course-list { 
    padding: 0 30rpx; 
  }

  .course-card { 
    background: #fff; 
    border-radius: 24rpx; 
    padding: 24rpx; 
    margin-bottom: 24rpx; 
    display: flex; 
    gap: 24rpx; 
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02); 
  }

  /* --- 左侧封面 --- */
  .card-thumb { 
    width: 160rpx; height: 160rpx; 
    background: linear-gradient(135deg, #8a2021, #b53b3c); 
    border-radius: 16rpx; 
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    align-items: center; 
    color: #fff; 
    position: relative; 
    flex-shrink: 0; 
    transition: all 0.3s;
  }
  
  /* 已过期状态：封面置灰 */
  .thumb-gray { 
    filter: grayscale(100%); 
    opacity: 0.7; 
  }

  .thumb-main { font-size: 30rpx; font-weight: bold; font-family: serif; }
  .thumb-sub  { font-size: 16rpx; opacity: 0.8; }

  /* 状态徽标 */
  .status-badge { 
    position: absolute; top: 8rpx; left: 8rpx; 
    font-size: 18rpx; 
    padding: 2rpx 8rpx; 
    border-radius: 6rpx; 
    color: #fff; 
    backdrop-filter: blur(4px); 
  }
  .badge-ing     { background: rgba(0,0,0,0.3); }      /* 进行中 */
  .badge-done    { background: rgba(34, 197, 94, 0.9); } /* 已完成 (绿) */
  .badge-expired { background: rgba(50,50,50, 0.6); }    /* 已过期 (灰) */

  /* --- 右侧信息 --- */
  .card-info { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    justify-content: space-between; 
  }

  .card-title { 
    font-size: 28rpx; 
    font-weight: bold; 
    color: #333; 
    line-height: 1.4; 
    margin-bottom: 8rpx; 
  }
  .text-gray { color: #999; }

  .info-group { 
    display: flex; 
    flex-direction: column; 
    gap: 6rpx; 
  }
  
  .info-row { 
    font-size: 22rpx; 
    color: #999; 
    display: flex; 
    align-items: center; 
    gap: 8rpx; 
  }

  .card-action { 
    display: flex; 
    justify-content: flex-end; 
    margin-top: 10rpx; 
  }

  /* --- 按钮样式 --- */
  .btn-study { 
    margin: 0; 
    font-size: 24rpx; 
    padding: 0 24rpx; 
    height: 50rpx; 
    line-height: 50rpx; 
    border-radius: 30rpx; 
    font-weight: 600; 
    display: flex; 
    align-items: center; 
  }
  .btn-study::after { border: none; } /* 去除小程序原生边框 */
  
  /* 状态 1: 学习中 */
  .btn-study { 
    background: rgba(158, 42, 43, 0.08); 
    color: #9e2a2b; 
  }
  /* 状态 2: 已完成 */
  .btn-done { 
    background: rgba(34, 197, 94, 0.1); 
    color: #16a34a; 
  }
  /* 状态 3: 已过期 */
  .btn-expired { 
    background: #f3f4f6; 
    color: #6b7280; 
  }

  /* ================================= */
  /* 5. 空状态 Empty State              */
  /* ================================= */
  .empty-state { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    padding-top: 100rpx; 
  }
  .empty-text { 
    font-size: 26rpx; 
    color: #bbb; 
    margin-top: 20rpx; 
  }
</style>