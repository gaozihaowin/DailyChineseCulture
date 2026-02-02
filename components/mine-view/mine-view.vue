<template>
  <view class="view-container">
    
    <view class="immersive-header">
      
      <view class="nav-bar">
        <view class="nav-brand">
          <text class="brand-text">致良知教育</text>
        </view>
        <view class="nav-actions">
          <view class="icon-btn">
            <uni-icons type="chat" size="24" color="#fff"></uni-icons>
            <view class="badge-dot"></view> </view>
          <view class="icon-btn" style="margin-left: 30rpx;">
            <uni-icons type="gear" size="24" color="#fff"></uni-icons>
          </view>
        </view>
      </view>

      <view class="user-profile-box">
        <view class="profile-left">
          <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
          <view class="info">
            <view class="name-row">
              <text class="nickname">{{ userInfo.nickname || '点击登录' }}</text>
            </view>
            <view class="tag-row">
              <view class="level-tag">
                <uni-icons type="vip-filled" size="12" color="#78350f"></uni-icons>
                <text class="level-text">正式学员</text>
              </view>
            </view>
          </view>
        </view>
        <view class="signin-btn">
          <uni-icons type="calendar-filled" size="16" color="#9e2a2b"></uni-icons>
          <text>每日签到</text>
        </view>
      </view>
      
      <view class="bg-pattern"></view>
    </view>

    <view class="stats-card">
      <view class="stat-item" v-for="(item, index) in statsList" :key="index">
        <text class="stat-num">{{ item.value }}</text>
        <text class="stat-label">{{ item.label }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      
      <view class="section-box">
        <view class="section-header">
          <text class="section-title">我的学习</text>
        </view>
        <view class="grid-container">
          <view 
            class="grid-item" 
            v-for="(item, index) in coreServices" 
            :key="index"
            @tap="handleMenuClick(item)"
          >
            <view class="grid-icon-box" :style="{ background: item.bgColor }">
              <uni-icons :type="item.icon" size="28" :color="item.iconColor"></uni-icons>
            </view>
            <text class="grid-text">{{ item.text }}</text>
          </view>
        </view>
      </view>

      <view class="section-box no-padding">
        <view 
          class="list-item" 
          v-for="(item, index) in financeServices" 
          :key="index"
          @tap="handleMenuClick(item)"
        >
          <view class="list-left">
            <uni-icons :type="item.icon" size="22" :color="item.color"></uni-icons>
            <text class="list-title">{{ item.text }}</text>
          </view>
          <view class="list-right">
             <text class="list-extra" v-if="item.extra">{{ item.extra }}</text>
             <uni-icons type="right" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>

      <view class="section-box no-padding">
        <view 
          class="list-item" 
          v-for="(item, index) in otherServices" 
          :key="index"
          @tap="handleMenuClick(item)"
        >
          <view class="list-left">
            <uni-icons :type="item.icon" size="22" :color="item.color"></uni-icons>
            <text class="list-title">{{ item.text }}</text>
          </view>
          <view class="list-right">
             <uni-icons type="right" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>

      <view class="footer-version">
        <text>致良知教育 v1.2.0</text>
      </view>
      
      <view class="safe-area-spacer"></view>

    </scroll-view>
  </view>
</template>

<script>
  export default {
    name: 'MineView',
    data() {
      return {
        // 用户信息
        userInfo: {
          nickname: 'Mystery',
          avatar: '/static/logo.png',
        },
        
        // 顶部统计数据
        statsList: [
          { label: '余额', value: '0.00' },
          { label: '优惠券', value: '2' },
          { label: '积分', value: '1,280' },
          { label: '学时', value: '45h' }
        ],

        // 1. 核心学习服务 (宫格)
        // 设计思路：高频使用的放在这里，bgColor 是图标背景色，iconColor 是图标颜色
        coreServices: [
          { text: '我的课程', icon: 'videocam-filled', bgColor: '#E0F2F1', iconColor: '#009688' }, // 类似截图的青色
          { text: '我的订单', icon: 'cart-filled',     bgColor: '#E3F2FD', iconColor: '#2196F3' }, // 蓝色
          { text: '我的证书', icon: 'vip-filled',      bgColor: '#FFEBEE', iconColor: '#F44336' }, // 红色
          { text: '我的考试', icon: 'compose',         bgColor: '#E8F5E9', iconColor: '#4CAF50' }  // 绿色
        ],

        // 2. 资产与咨询 (列表组1)
        financeServices: [
          { text: '咨询单',   icon: 'headphones', color: '#FF9800', extra: '' },         // 橙色
          { text: '优惠券',   icon: 'location',   color: '#03A9F4', extra: '2张可用' },  // 蓝色
          { text: '返现券',   icon: 'wallet',     color: '#E91E63', extra: '' }          // 粉红
        ],

        // 3. 其他服务 (列表组2)
        otherServices: [
          { text: '用户协议', icon: 'info',       color: '#607D8B' }, // 蓝灰
          { text: '我的社群', icon: 'staff',      color: '#673AB7' }, // 紫色
          { text: '设置',     icon: 'gear',       color: '#9E9E9E' }  // 灰色
        ]
      }
    },
    methods: {
      // 统一处理菜单点击
      handleMenuClick(item) {
        uni.showToast({ title: `点击了: ${item.text}`, icon: 'none' });
      }
    }
  }
</script>

<style scoped>
  /* ====================== */
  /* 全局基础样式           */
  /* ====================== */
  .view-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #F5F7FA; /* 现代感的灰白背景 */
  }
  
  /* ====================== */
  /* 1. 沉浸式头部         */
  /* ====================== */
  .immersive-header {
    /* 品牌红渐变背景 */
    background: linear-gradient(135deg, #9e2a2b 0%, #c53e3e 100%);
    padding: 80rpx 40rpx 120rpx; /* 底部预留空间给悬浮卡片 */
    position: relative;
    border-radius: 0 0 40rpx 40rpx;
    overflow: hidden;
  }
  
  /* 背景纹理 */
  .bg-pattern {
    position: absolute;
    top: -100rpx; right: -100rpx;
    width: 400rpx; height: 400rpx;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .nav-bar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 40rpx; position: relative; z-index: 2;
  }
  .brand-text { font-size: 36rpx; font-weight: 800; color: #fff; letter-spacing: 2rpx; }
  
  .nav-actions { display: flex; align-items: center; }
  .icon-btn { position: relative; display: flex; align-items: center; }
  .badge-dot {
    position: absolute; top: -4rpx; right: -4rpx;
    width: 16rpx; height: 16rpx;
    background: #FF4D4F; border: 2rpx solid #9e2a2b; border-radius: 50%;
  }

  .user-profile-box {
    display: flex; justify-content: space-between; align-items: center;
    position: relative; z-index: 2;
  }
  .profile-left { display: flex; align-items: center; }
  .avatar {
    width: 120rpx; height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255,255,255,0.3);
    background: #fff; margin-right: 24rpx;
  }
  .info { display: flex; flex-direction: column; gap: 8rpx; }
  .nickname { font-size: 38rpx; font-weight: bold; color: #fff; }
  
  .level-tag {
    background: linear-gradient(90deg, #FCD34D, #F59E0B);
    padding: 4rpx 16rpx; border-radius: 20rpx;
    display: flex; align-items: center; gap: 6rpx;
  }
  .level-text { font-size: 20rpx; color: #78350f; font-weight: bold; }

  .signin-btn {
    background: rgba(255,255,255,0.9);
    padding: 10rpx 24rpx; border-radius: 40rpx;
    display: flex; align-items: center; gap: 8rpx;
    font-size: 24rpx; color: #9e2a2b; font-weight: 600;
    box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
  }

  /* ====================== */
  /* 2. 悬浮统计卡片       */
  /* ====================== */
  .stats-card {
    background: #fff;
    margin: -80rpx 30rpx 30rpx; /* 关键：负margin实现悬浮 */
    border-radius: 24rpx;
    padding: 30rpx 0;
    display: flex; justify-content: space-around;
    position: relative; z-index: 3;
    box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.05);
  }
  .stat-item { display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
  .stat-num { font-size: 36rpx; font-weight: 800; color: #333; font-family: DINAlternate-Bold, sans-serif; }
  .stat-label { font-size: 24rpx; color: #999; }

  /* ====================== */
  /* 3. 内容区域           */
  /* ====================== */
  .scroll-content { flex: 1; height: 0; }
  
  /* 通用板块盒子 */
  .section-box {
    background: #fff;
    margin: 0 30rpx 30rpx;
    border-radius: 24rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  }
  .no-padding { padding: 0; overflow: hidden; }

  .section-header { margin-bottom: 24rpx; }
  /* 左侧红色竖条标题样式 */
  .section-title { 
    font-size: 30rpx; font-weight: bold; color: #333; 
    border-left: 8rpx solid #9e2a2b; padding-left: 16rpx; 
  }

  /* 宫格布局 (用于核心服务) */
  .grid-container { display: flex; justify-content: space-between; }
  .grid-item { display: flex; flex-direction: column; align-items: center; gap: 16rpx; flex: 1; }
  .grid-icon-box {
    width: 100rpx; height: 100rpx; border-radius: 36rpx;
    display: flex; justify-content: center; align-items: center;
    /* 细微的图标动效 */
    transition: transform 0.2s;
  }
  .grid-item:active .grid-icon-box { transform: scale(0.95); }
  .grid-text { font-size: 24rpx; color: #333; font-weight: 500; }

  /* 列表布局 (用于次要服务) */
  .list-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 32rpx 30rpx;
    position: relative;
  }
  .list-item:active { background-color: #f9f9f9; }
  /* 列表分隔线 */
  .list-item:not(:last-child)::after {
    content: ''; position: absolute; bottom: 0; left: 100rpx; right: 0;
    height: 1px; background: #f0f0f0;
  }
  .list-left { display: flex; align-items: center; gap: 24rpx; }
  .list-title { font-size: 28rpx; color: #333; }
  .list-right { display: flex; align-items: center; gap: 10rpx; }
  .list-extra { font-size: 24rpx; color: #999; }

  .footer-version { text-align: center; color: #d1d5db; font-size: 22rpx; margin-top: 20rpx; }
  .safe-area-spacer { height: 160rpx; }
</style>