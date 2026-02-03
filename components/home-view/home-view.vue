<template>
  <view class="view-container">
    
    <view class="header">
      <view class="logo-text">
        <text class="logo-seal">良知</text>
        <text>致良知教育</text>
      </view>
      
      <view class="header-actions">
        <uni-icons 
          type="search" 
          size="24" 
          color="#2d2424" 
          style="margin-right: 30rpx;"
        ></uni-icons>
        <uni-icons 
          type="notification" 
          size="24" 
          color="#2d2424"
        ></uni-icons>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      
      <view class="hero-banner">
        <view class="hero-title">致良知教育研究院</view>
        <view class="hero-subtitle">让身边多一位致良知的中国人</view>
        <view class="quote-box">
          <text class="quote-mark">“</text> 
          成为带给人们温暖与光明的家园
        </view>
      </view>

      <view class="grid-nav">
        <view 
          class="nav-item" 
          v-for="(item, index) in navList" 
          :key="index"
          @click="handleNavClick(item, index)"
        >
          <view class="icon-box" :style="{ backgroundColor: item.bgColor }">
            <image :src="item.iconUrl" class="nav-icon-img" mode="aspectFit"></image>
          </view>
          <text class="nav-label">{{ item.name }}</text>
        </view>
      </view>

      <view class="wisdom-section">
        <view class="wisdom-border">
          <text class="wisdom-text">种树者必培其根，种德者必养其心。</text>
          <view class="wisdom-footer">
            <text class="wisdom-author">—— 王阳明 ·《传习录》</text>
          </view>
        </view>
      </view>

      <view class="section-header">
        <text class="section-title">热门课程</text>
        <view class="section-more">
          <uni-icons type="right" size="12" color="#8c8686"></uni-icons>
        </view>
      </view>

      <view class="course-list">
        <view 
          class="course-card" 
          v-for="(course, index) in courseList" 
          :key="index"
        >
          <view class="card-thumb" :style="{ background: course.bgGradient }">
            <view class="thumb-tag">{{ course.tag }}</view>
            <view class="thumb-title">{{ course.type }}</view>
            <view class="thumb-sub">{{ course.term }}</view>
          </view>
          
          <view class="card-info">
            <view class="info-title">{{ course.title }}</view>
            <view class="info-meta">
              <text class="meta-count">{{ course.count }} 人已加入</text>
              <view class="meta-btn">去学习</view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="footer-art">
        <view class="art-line"></view>
        
        <view class="art-content">
          <text class="art-quote">此心光明 · 亦复何言</text>
          
          <view class="art-seal">
            <text>阳明</text>
          </view>
        </view>
        
        <view class="footer-version">致良知教育</view>
      </view>

      <view class="safe-area-spacer"></view>

    </scroll-view>

    <!-- 弹出窗口遮罩层 -->
    <view class="popup-overlay" v-if="showPopup" @click="closePopup">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">{{ currentPopupTitle }}</text>
          <view class="popup-close" @click="closePopup">
            <uni-icons type="close" size="20" color="#666"></uni-icons>
          </view>
        </view>
        
        <view class="popup-body">
          <!-- 树状图占位内容 - 从上往下 -->
          <view class="tree-structure">
            <view class="tree-node level-1">
              <view class="node-content">致知班</view>
            </view>
            <view class="tree-connector"></view>
            <view class="tree-node level-2">
              <view class="node-content">格物班</view>
            </view>
            <view class="tree-connector"></view>
            <view class="tree-node level-3">
              <view class="node-content">正心班</view>
            </view>
            <view class="tree-connector"></view>
            <view class="tree-node level-4">
              <view class="node-content">诚意班</view>
            </view>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
// 引入API配置
import { API_CONFIG } from '../../api/config';

/**
 * HomeView - 首页视图组件
 * 包含 Banner、导航宫格、名言展示、课程列表及底部文化留白
 */
export default {
  name: 'HomeView',
  
  data() {
    return {
      // 导航配置：四大核心班级
      navList: [
        { 
          name: '明理班', 
          iconUrl: 'https://img.icons8.com/fluency/96/books.png', 
          bgColor: '#FFF0F0' // 淡红背景，象征学习明理
        },
        { 
          name: '笃行班', 
          iconUrl: 'https://img.icons8.com/color/96/walking.png', 
          bgColor: '#F0F8FF' // 淡蓝背景，象征实践行动
        },
        { 
          name: '印证班', 
          iconUrl: 'https://img.icons8.com/fluency/96/star.png', 
          bgColor: '#FFFAF0' // 淡黄背景，象征成就印证
        },
        { 
          name: '良知班', 
          iconUrl: 'https://img.icons8.com/color/96/brain.png', 
          bgColor: '#F0FFF4' // 淡绿背景，象征智慧良知
        }
      ],
      
      // 课程数据列表（从API获取）
      courseList: [],
      
      // 弹出窗口状态
      showPopup: false,
      currentPopupTitle: ''
    }
  },
  
  mounted() {
    this.fetchHotCourses();
  },
  
  methods: {
    handleNavClick(item, index) {
      // 只为"明理班"显示弹出窗口
      if (item.name === '明理班') {
        this.currentPopupTitle = item.name;
        this.showPopup = true;
      } else {
        // 其他班级可以添加其他逻辑
        console.log('点击了:', item.name);
      }
    },
    
    closePopup() {
      this.showPopup = false;
    },
    
    async fetchHotCourses() {
      try {
        const res = await uni.request({
          url: API_CONFIG.baseUrl + API_CONFIG.paths.hotCourses,
          method: 'GET'
        });
        
        if (res.statusCode === 200 && res.data.code === 200) {
          this.courseList = res.data.data;
        } else {
          uni.showToast({
            title: '获取课程列表失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取热门课程失败:', error);
        uni.showToast({
          title: '网络连接异常',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style scoped>
/* =========================================================================
   Global Layout (全局布局)
   ========================================================================= */
.view-container {
  height: 100%; 
  display: flex;
  flex-direction: column;
  /* 全局背景色：暖米色，模拟纸张质感，保护视力 */
  background-color: #f9f7f2; 
}

/* =========================================================================
   Header Styles (顶部导航样式)
   ========================================================================= */
.header {
  padding: 80rpx 40rpx 30rpx; /* 适配异形屏顶部 */
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  /* 98%透明度背景，实现轻微的毛玻璃遮挡效果 */
  background: rgba(249, 247, 242, 0.98); 
  z-index: 10;
}

.logo-text { 
  font-size: 38rpx; 
  font-weight: 800; 
  color: #9e2a2b; /* 品牌主色：深红 */
  display: flex; 
  align-items: center; 
  gap: 16rpx; 
}

.logo-seal { 
  background-color: #9e2a2b; 
  color: #fff; 
  font-size: 24rpx; 
  padding: 4rpx 10rpx; 
  border-radius: 8rpx; 
  font-family: serif; /* 衬线体，增强印章感 */
}

/* =========================================================================
   Main Scroll Content (滚动区域样式)
   ========================================================================= */
.scroll-content { 
  flex: 1; 
  height: 0; 
  width: 100%; 
}

.safe-area-spacer { 
  height: 160rpx; /* 预留底部 TabBar 高度 */
} 

/* =========================================================================
   Hero Banner (首屏大图区域)
   ========================================================================= */
.hero-banner { 
  padding: 40rpx 40rpx 60rpx; 
  /* 径向渐变：右上角高光，模拟自然光照 */
  background: radial-gradient(circle at top right, rgba(252, 239, 233, 0.8), transparent 70%); 
  text-align: center; 
}

.hero-title { 
  font-size: 56rpx; 
  color: #9e2a2b; 
  margin-bottom: 16rpx; 
  letter-spacing: 4rpx; 
  font-weight: 900; 
}

.hero-subtitle { 
  font-size: 28rpx; 
  color: #5d5555; 
  letter-spacing: 2rpx; 
  margin-bottom: 40rpx; 
  position: relative; 
  display: inline-block; 
}

/* 伪元素绘制副标题两侧的装饰线 */
.hero-subtitle::before, 
.hero-subtitle::after { 
  content: ''; 
  position: absolute; 
  top: 50%; 
  width: 60rpx; 
  height: 1px; 
  background: #ddd; 
}
.hero-subtitle::before { left: -80rpx; } 
.hero-subtitle::after { right: -80rpx; }

.quote-box { 
  font-size: 26rpx; 
  color: #9e2a2b; 
  font-weight: bold; 
  margin-top: 20rpx; 
  background: rgba(158, 42, 43, 0.05); /* 极淡的红色背景 */
  display: inline-block; 
  padding: 10rpx 30rpx; 
  border-radius: 40rpx; 
}

.quote-mark { 
  font-family: serif; 
  font-size: 40rpx; 
  margin-right: 8rpx; 
  vertical-align: -6rpx; 
}

/* =========================================================================
   Grid Navigation (宫格导航)
   ========================================================================= */
.grid-nav { 
  display: flex; 
  justify-content: space-between; 
  padding: 0 50rpx; 
  margin-bottom: 40rpx; 
}

.nav-item { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 16rpx; 
}

.icon-box {
  width: 100rpx;
  height: 100rpx;
  border-radius: 36rpx;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 柔和的投影，增加立体感 */
  box-shadow: 0 10rpx 30rpx rgba(158, 42, 43, 0.08);
  border: 1px solid rgba(158, 42, 43, 0.05);
  /* 增加传统中国风元素 */
  position: relative;
  overflow: hidden;
}

/* 为图标添加传统中国风装饰 */
.icon-box::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(158, 42, 43, 0.05) 0%, transparent 70%);
  transform: rotate(45deg);
}

/* 图标容器悬停效果 */
.icon-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 15rpx 40rpx rgba(158, 42, 43, 0.12);
  transition: all 0.3s ease;
}

.nav-label { 
  font-size: 26rpx; 
  color: #2d2424; 
  font-weight: 500; 
}

.nav-icon-img { 
  width: 48rpx; 
  height: 48rpx; 
}

/* =========================================================================
   Wisdom Section (名言警句区 - 中段)
   ========================================================================= */
.wisdom-section { 
  padding: 0 40rpx; 
  margin-bottom: 50rpx; 
}

.wisdom-border { 
  position: relative; 
  background: rgba(158, 42, 43, 0.03); 
  /* 虚线边框，营造手抄本的感觉 */
  border: 1px dashed rgba(158, 42, 43, 0.3); 
  border-radius: 20rpx; 
  padding: 30rpx 40rpx; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 16rpx; 
}

.wisdom-text { 
  font-size: 30rpx; 
  color: #5d4037; 
  font-family: serif; 
  font-weight: 600; 
  letter-spacing: 2rpx; 
  line-height: 1.6; 
  text-align: center; 
}

.wisdom-footer { 
  width: 100%; 
  display: flex; 
  justify-content: flex-end; 
}

.wisdom-author { 
  font-size: 22rpx; 
  color: #9e2a2b; 
  opacity: 0.8; 
  font-weight: bold; 
}

/* =========================================================================
   Course List Styles (课程列表)
   ========================================================================= */
.section-header { 
  padding: 0 40rpx; 
  margin-bottom: 30rpx; 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-end; 
}

.section-title { 
  font-size: 38rpx; 
  font-weight: 800; 
  color: #2d2424; 
}

.section-more { 
  font-size: 26rpx; 
  color: #8c8686; 
  display: flex; 
  align-items: center; 
}

.course-list { 
  padding: 0 40rpx; 
}

.course-card { 
  background: #fff; 
  border-radius: 36rpx; 
  padding: 24rpx; 
  margin-bottom: 32rpx; 
  display: flex; 
  gap: 24rpx; 
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04); 
}

.card-thumb { 
  width: 200rpx; 
  height: 150rpx; 
  border-radius: 20rpx; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  color: #fff; 
  text-align: center; 
  position: relative; 
  flex-shrink: 0; 
}

.thumb-title { font-size: 38rpx; font-weight: 900; }
.thumb-sub { font-size: 20rpx; opacity: 0.9; margin-top: 4rpx; }

.thumb-tag { 
  position: absolute; 
  top: 0; 
  left: 0; 
  background: #c5a065; 
  color: #fff; 
  font-size: 18rpx; 
  padding: 4rpx 12rpx; 
  /* 异形圆角：左上和右下 */
  border-top-left-radius: 20rpx; 
  border-bottom-right-radius: 16rpx; 
  font-weight: bold; 
}

.card-info { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  padding: 6rpx 0; 
}

.info-title { 
  font-size: 30rpx; 
  font-weight: bold; 
  color: #2d2424; 
  line-height: 1.5; 
  /* 限制两行文本，超出省略 */
  display: -webkit-box; 
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
}

.info-meta { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.meta-count { font-size: 22rpx; color: #999; }

.meta-btn { 
  background: rgba(158, 42, 43, 0.08); 
  color: #9e2a2b; 
  font-size: 24rpx; 
  padding: 10rpx 24rpx; 
  border-radius: 30rpx; 
  font-weight: 700; 
}

/* =========================================================================
   Footer Art (底部艺术留白区 - 核心亮点)
   ========================================================================= */
.footer-art {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40rpx;
  margin-bottom: 20rpx;
  opacity: 0.8; /* 整体半透明，不抢视觉重心 */
}

/* 装饰线条：两头虚中间实的渐变线 */
.art-line {
  width: 60rpx;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d3c0c0, transparent);
  margin-bottom: 24rpx;
}

.art-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.art-quote {
  font-family: serif; /* 宋体/衬线体 */
  font-size: 28rpx;
  color: #8c7b7b; /* 类似陈旧墨迹的灰褐色 */
  letter-spacing: 4rpx;
  font-weight: 500;
  /* 文字凹凸感：白色微阴影 */
  text-shadow: 0 1px 1px rgba(255,255,255,0.8);
}

/* 纯CSS绘制印章效果 */
.art-seal {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #b53b3c;
  border-radius: 4rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(181, 59, 60, 0.05);
}

.art-seal text {
  font-size: 16rpx;
  color: #b53b3c;
  font-weight: bold;
  line-height: 1;
  writing-mode: vertical-lr; /* 竖排文字：增强印章感 */
  letter-spacing: 2rpx;
}

.footer-version {
  margin-top: 24rpx;
  font-size: 20rpx;
  color: #dcdcdc;
}

/* =========================================================================
   Popup Styles (弹出窗口样式)
   ========================================================================= */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.popup-content {
  width: 600rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(50rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1px solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2d2424;
}

.popup-close {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.popup-close:active {
  transform: scale(0.9);
  background: #e0e0e0;
}

.popup-body {
  padding: 32rpx;
  overflow-y: auto;
  max-height: calc(80vh - 120rpx);
}

/* 树状图样式 - 从顶部向下 */
.tree-structure {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 40rpx 0;
}

.tree-node {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.tree-node.level-1 {
  padding-bottom: 0;
}

.tree-node.level-1 .node-content {
  background: #9e2a2b;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  padding: 20rpx 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(158, 42, 43, 0.3);
}

.tree-node.level-2 .node-content {
  background: #ff7e5f;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  padding: 18rpx 36rpx;
  box-shadow: 0 6rpx 20rpx rgba(255, 126, 95, 0.25);
}

.tree-node.level-3 .node-content {
  background: #feb47b;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  padding: 16rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(254, 180, 123, 0.2);
}

.tree-node.level-4 .node-content {
  background: #ffd93d;
  color: #fff;
  font-size: 26rpx;
  font-weight: bold;
  padding: 14rpx 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(255, 217, 61, 0.15);
}

.tree-connector {
  height: 40rpx;
  width: 4rpx;
  background: linear-gradient(to top, #e0e0e0, #9e2a2b);
  margin: 0 auto;
  position: relative;
}

.tree-connector::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 12rpx;
  height: 12rpx;
  background: #9e2a2b;
  border-radius: 50%;
  box-shadow: 0 0 0 4rpx rgba(158, 42, 43, 0.2);
}

.node-content {
  display: inline-block;
  border-radius: 16rpx;
  color: #2d2424;
  font-weight: 500;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.node-content:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}


</style>