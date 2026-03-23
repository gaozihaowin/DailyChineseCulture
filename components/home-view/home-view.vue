<template>
  <view class="view-container">
    
    <view class="header" :class="{ 'animate-fade-down': isFirstLoad }">
      <view class="logo-text">
        <text class="logo-seal">良知</text>
        <text>致良知教育</text>
      </view>
      
     
    </view>


    <scroll-view scroll-y class="scroll-content">
      
      <view class="hero-banner" :class="{ 'animate-slide-up-1': isFirstLoad }">
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
          :class="{ 'animate-pop-in': isFirstLoad }" 
          v-for="(item, index) in navList" 
          :key="index"
          :style="{ 'animation-delay': isFirstLoad ? (index * 0.08 + 0.1) + 's' : '0s' }"
          @click="handleNavClick(item, index)"
        >
          <view class="icon-box" :style="{ backgroundColor: item.bgColor }">
            <image :src="item.iconUrl" class="nav-icon-img" mode="aspectFit"></image>
          </view>
          <text class="nav-label">{{ item.name }}</text>
        </view>
      </view>

      <view class="wisdom-section" :class="{ 'animate-slide-up-2': isFirstLoad }">
        <view class="wisdom-border">
          <text class="wisdom-text">种树者必培其根，种德者必养其心。</text>
          <view class="wisdom-footer">
            <text class="wisdom-author">—— 王阳明 ·《传习录》</text>
          </view>
        </view>
      </view>

      <view class="section-header" :class="{ 'animate-slide-up-3': isFirstLoad }">
        <text class="section-title">热门课程</text>
        <view class="section-more" hover-class="more-hover" @click="goToAllCourses">
          <text class="more-text">全部课程</text>
          <uni-icons type="right" size="14" color="#8c8686"></uni-icons>
        </view>
      </view>

      <view class="course-list">
        <view 
          class="course-card"
          :class="{ 'animate-slide-up-stagger': isFirstLoad }" 
          v-for="(course, index) in courseList" 
          :key="index" 
          :style="{ 'animation-delay': isFirstLoad ? (index * 0.1 + 0.3) + 's' : '0s' }"
          @click="goToDetail(course.id)"
        >
          
          <view class="card-thumb" :style="{ background: colorMap[course.type] || colorMap['默认'] }">
            <view class="thumb-tag" v-if="course.tag">{{ course.tag }}</view>
            <view class="thumb-title">{{ course.type }}</view>
            <view class="thumb-sub">{{ course.term }}</view>
          </view>
          
          <view class="card-info">
            <view class="info-title">{{ course.title }}</view>
            <view class="info-meta">
              <text class="meta-count">👥 {{ course.count }} 人已加入</text>
              <view class="meta-btn">去学习</view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="footer-art" :class="{ 'animate-fade-in-slow': isFirstLoad }">
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


    <view class="popup-overlay" v-if="showPopup" @click="closePopup">
      <view class="popup-content" @click.stop>
        
        <view class="popup-header">
          <text class="popup-title">{{ currentPopupTitle }}</text>
          <view class="popup-close" @click="closePopup">
            <image src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMTUgNUw1IDE1IiBzdHJva2U9IiM5ZTJhMmIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTUgNUwxNSAxNSIgc3Ryb2tlPSIjOWUyYTJiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==" mode="aspectFit" style="width: 20rpx; height: 20rpx;"></image>
          </view>
        </view>
        
        <view class="popup-body">
          <view class="tree-structure">
            <view class="tree-node level-1">
              <view class="node-content node-anim-1">致知班</view>
            </view>
            <view class="tree-connector conn-anim-1"></view>
            <view class="tree-node level-2">
              <view class="node-content node-anim-2">格物班</view>
            </view>
            <view class="tree-connector conn-anim-2"></view>
            <view class="tree-node level-3">
              <view class="node-content node-anim-3">正心班</view>
            </view>
            <view class="tree-connector conn-anim-3"></view>
            <view class="tree-node level-4">
              <view class="node-content node-anim-4">诚意班</view>
            </view>
          </view>
        </view>

      </view>
    </view>

  </view>
</template>

<script>
// 引入 API 配置
import { API_CONFIG } from '../../api/config';
import { get } from '../../utils/request';

export default {
  name: 'HomeView',
  
  /** ------------------------------------------------------------------
   * 页面数据 (Data)
   * ------------------------------------------------------------------ */
  data() {
    return {
      // 【新增】首次加载控制标识
      isFirstLoad: true,
      
      // 导航配置：四大核心班级
      navList: [
        { name: '明理班', iconUrl: 'https://img.icons8.com/fluency/96/books.png',   bgColor: '#FFF0F0' },
        { name: '笃行班', iconUrl: 'https://img.icons8.com/color/96/walking.png', bgColor: '#F0F8FF' },
        { name: '印证班', iconUrl: 'https://img.icons8.com/fluency/96/star.png',   bgColor: '#FFFAF0' },
        { name: '良知班', iconUrl: 'https://img.icons8.com/color/96/brain.png',    bgColor: '#F0FFF4' }
      ],
      
      // 前端本地维护的班级颜色映射表
      colorMap: {
        '诚意班': 'linear-gradient(135deg, #8a2021, #b53b3c)',
        '明理班': 'linear-gradient(135deg, #1e3c72, #2a5298)',
        '笃行班': 'linear-gradient(135deg, #d35400, #e67e22)',
        '印证班': 'linear-gradient(135deg, #205e4a, #3ea07a)',
        '良知班': 'linear-gradient(135deg, #5c433b, #8b6b61)',
        '默认': 'linear-gradient(135deg, #9e2a2b, #b53b3c)' // 兜底颜色
      },
      
      // 课程数据列表（从API获取）
      courseList: [],
      
      // 弹出窗口状态
      showPopup: false,
      currentPopupTitle: ''
    }
  },
  
  /** ------------------------------------------------------------------
   * 生命周期 (Lifecycle)
   * ------------------------------------------------------------------ */
  mounted() {
    this.fetchHotCourses();
    
    // 【新增】在最长的一波入场动画完成后，解除动画绑定，保证后续切换零延迟
    setTimeout(() => {
      this.isFirstLoad = false;
    }, 2000); // 2秒足以覆盖所有 stagger 和 slow-fade 动画
  },
  
  /** ------------------------------------------------------------------
   * 组件方法 (Methods)
   * ------------------------------------------------------------------ */
  methods: {
    // 导航点击处理
    handleNavClick(item, index) {
      if (item.name === '明理班') {
        this.currentPopupTitle = item.name;
        this.showPopup = true;
      } else {
        console.log('点击了:', item.name);
      }
    },
    
    // 关闭弹窗
    closePopup() {
      this.showPopup = false;
    },

    // 跳转到全部课程页面
    goToAllCourses() {
      uni.navigateTo({
        url: '/pages/CourseList/index'
      });
    },

    // 获取热门课程接口
    async fetchHotCourses() {
      try {
        const res = await uni.request({
          url: API_CONFIG.baseUrl + API_CONFIG.paths.hotCourses,
          method: 'GET'
        });
        
        if (res.statusCode === 200 && res.data.code === 200) {
          this.courseList = res.data.data;
        } else {
          uni.showToast({ title: '获取课程列表失败', icon: 'none' });
        }
      } catch (error) {
        console.error('获取热门课程失败:', error);
        uni.showToast({ title: '网络连接异常', icon: 'none' });
      }
    },

    // 卡片点击拦截
    async goToDetail(id) {
      if (!id) return;
      uni.showLoading({ title: '核实身份中...', mask: true });
      try {
        const res = await get(API_CONFIG.paths.checkEnroll, { campId: id });
        const resultData = (res.data && res.data.code) ? res.data : res;
        
        if (resultData.code === 200) {
          if (resultData.data === true) {
            uni.navigateTo({ url: `/pages/CourseDetail/index?id=${id}&source=list` });
          } else {
            uni.navigateTo({ url: `/pages/CampEnroll/index?id=${id}` });
          }
        } else {
          uni.showToast({ title: resultData.msg || '核实失败', icon: 'none' });
        }
      } catch (error) {
        console.error('Check enrollment error:', error);
        uni.showToast({ title: '网络请求失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    }
  }
}
</script>

<style scoped>
/* =========================================================================
   [0] 动画定义区 (Animations)
   ========================================================================= */
@keyframes fadeSlideDown {
  0% { opacity: 0; transform: translateY(-30rpx); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes fadeSlideUp {
  0% { opacity: 0; transform: translateY(40rpx); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes popIn {
  0% { opacity: 0; transform: scale(0.85); }
  70% { transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes slowFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes growLine {
  0% { height: 0; opacity: 0; }
  100% { height: 40rpx; opacity: 1; }
}

.animate-fade-down { animation: fadeSlideDown 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.animate-slide-up-1 { opacity: 0; animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards; }
.animate-slide-up-2 { opacity: 0; animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s forwards; }
.animate-slide-up-3 { opacity: 0; animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s forwards; }
.animate-pop-in { opacity: 0; animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.animate-slide-up-stagger { opacity: 0; animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.animate-fade-in-slow { opacity: 0; animation: slowFadeIn 1.2s ease 0.6s forwards; }

/* =========================================================================
   [1] 全局与基础布局 (Global Layout)
   ========================================================================= */
.view-container {
  height: 100%; 
  display: flex;
  flex-direction: column;
  background-color: #f9f7f2; 
}
.scroll-content { 
  flex: 1; 
  height: 0; 
  width: 100%; 
}
.safe-area-spacer { 
  height: 160rpx; 
} 

/* =========================================================================
   [2] 顶部导航栏 (Header)
   ========================================================================= */
.header {
  padding: 80rpx 40rpx 30rpx; 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  background: rgba(249, 247, 242, 0.98); 
  z-index: 10;
}
.logo-text { 
  font-size: 38rpx; 
  font-weight: 800; 
  color: #9e2a2b; 
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
  font-family: serif; 
}

/* =========================================================================
   [3] 英雄大图横幅 (Hero Banner)
   ========================================================================= */
.hero-banner { 
  padding: 40rpx 40rpx 60rpx; 
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
.hero-subtitle::before, .hero-subtitle::after { 
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
  background: rgba(158, 42, 43, 0.05); 
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
   [4] 宫格导航区 (Grid Nav)
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
  box-shadow: 0 10rpx 30rpx rgba(158, 42, 43, 0.08);
  border: 1px solid rgba(158, 42, 43, 0.05);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
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
.icon-box:active {
  transform: scale(0.9);
  box-shadow: 0 4rpx 15rpx rgba(158, 42, 43, 0.05);
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
   [5] 名言警句区 (Wisdom Section)
   ========================================================================= */
.wisdom-section { 
  padding: 0 40rpx; 
  margin-bottom: 50rpx; 
}
.wisdom-border { 
  position: relative; 
  background: rgba(158, 42, 43, 0.03); 
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
   [6] 课程列表区 (Course List)
   ========================================================================= */
.section-header {
  padding: 0 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center; 
}
.section-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #2d2424;
}
.section-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 10rpx 0 10rpx 20rpx; 
  transition: opacity 0.2s;
}
.more-hover {
  opacity: 0.6;
}
.more-text {
  font-size: 26rpx;
  color: #8c8686;
  font-weight: 500;
}
.course-list { 
  padding: 0 40rpx; 
}
.course-card { 
  background: #fff; 
  border-radius: 30rpx; 
  padding: 20rpx; 
  margin-bottom: 32rpx; 
  display: flex; 
  gap: 24rpx; 
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03); 
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.course-card:active {
  transform: scale(0.96);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02); 
}
.card-thumb { 
  width: 200rpx; 
  height: 200rpx; 
  border-radius: 24rpx; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  color: #fff; 
  text-align: center; 
  position: relative; 
  flex-shrink: 0; 
  overflow: hidden; 
}
.thumb-title { font-size: 36rpx; font-weight: 900; letter-spacing: 2rpx; }
.thumb-sub { font-size: 22rpx; opacity: 0.9; margin-top: 8rpx; }
.thumb-tag { 
  position: absolute; 
  top: 0; 
  left: 0; 
  background: linear-gradient(90deg, #d4af37, #c5a065); 
  color: #fff; 
  font-size: 18rpx; 
  padding: 6rpx 16rpx; 
  border-bottom-right-radius: 16rpx; 
  font-weight: bold; 
}
.card-info { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  padding: 10rpx 0; 
}
.info-title { 
  font-size: 30rpx; 
  font-weight: bold; 
  color: #2d2424; 
  line-height: 1.5; 
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
.meta-count { font-size: 22rpx; color: #a09a9a; font-weight: 500;}
.meta-btn { 
  background: rgba(158, 42, 43, 0.08); 
  color: #9e2a2b; 
  font-size: 24rpx; 
  padding: 10rpx 30rpx; 
  border-radius: 40rpx; 
  font-weight: 700; 
}

/* =========================================================================
   [7] 底部艺术留白 (Footer Art)
   ========================================================================= */
.footer-art {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40rpx;
  margin-bottom: 20rpx;
  opacity: 0.8;
}
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
  font-family: serif; 
  font-size: 28rpx;
  color: #8c7b7b; 
  letter-spacing: 4rpx;
  font-weight: 500;
  text-shadow: 0 1px 1px rgba(255,255,255,0.8);
}
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
  writing-mode: vertical-lr; 
  letter-spacing: 2rpx;
}
.footer-version {
  margin-top: 24rpx;
  font-size: 20rpx;
  color: #dcdcdc;
}

/* =========================================================================
   [8] 弹窗遮罩层与内部元素 (Popup & Tree)
   ========================================================================= */
.popup-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.popup-content {
  width: 600rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
}
@keyframes slideUp { from { transform: translateY(60rpx); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

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
  background: rgba(158, 42, 43, 0.08); 
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(158, 42, 43, 0.1); 
}
.popup-close:active {
  transform: scale(0.9);
  background: rgba(158, 42, 43, 0.15); 
  box-shadow: 0 1rpx 4rpx rgba(158, 42, 43, 0.15);
}
.popup-body {
  padding: 32rpx;
  overflow-y: auto;
  max-height: calc(80vh - 120rpx);
}

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
.tree-node.level-1 { padding-bottom: 0; }
.tree-node.level-1 .node-content {
  background: #9e2a2b; color: #fff; font-size: 32rpx; font-weight: bold; padding: 20rpx 40rpx; box-shadow: 0 8rpx 24rpx rgba(158, 42, 43, 0.3);
}
.tree-node.level-2 .node-content {
  background: #ff7e5f; color: #fff; font-size: 30rpx; font-weight: bold; padding: 18rpx 36rpx; box-shadow: 0 6rpx 20rpx rgba(255, 126, 95, 0.25);
}
.tree-node.level-3 .node-content {
  background: #feb47b; color: #fff; font-size: 28rpx; font-weight: bold; padding: 16rpx 32rpx; box-shadow: 0 4rpx 16rpx rgba(254, 180, 123, 0.2);
}
.tree-node.level-4 .node-content {
  background: #ffd93d; color: #fff; font-size: 26rpx; font-weight: bold; padding: 14rpx 28rpx; box-shadow: 0 2rpx 12rpx rgba(255, 217, 61, 0.15);
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
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 12rpx; height: 12rpx;
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

/* 弹窗内进阶动画 (依次出现) */
.node-anim-1 { opacity: 0; animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards; }
.conn-anim-1 { opacity: 0; animation: growLine 0.4s ease 0.3s forwards; }
.node-anim-2 { opacity: 0; animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards; }
.conn-anim-2 { opacity: 0; animation: growLine 0.4s ease 0.7s forwards; }
.node-anim-3 { opacity: 0; animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s forwards; }
.conn-anim-3 { opacity: 0; animation: growLine 0.4s ease 1.1s forwards; }
.node-anim-4 { opacity: 0; animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.3s forwards; }

</style>