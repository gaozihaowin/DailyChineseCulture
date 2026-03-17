<template>
  <view class="enroll-container">
    <!-- 顶部导航栏 (自定义) -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">课程报名</text>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <!-- 1. 顶部封面区 -->
      <view class="hero-cover">
        <view class="hero-bg"></view>
        <view class="hero-content">
          <text class="hero-title">致良知修习营</text>
          <text class="hero-subtitle">格物致知 · 诚意正心</text>
        </view>
      </view>

      <!-- 2. 核心信息卡片 (悬浮) -->
      <view class="info-card">
        <view class="info-row">
          <view class="info-item">
            <text class="item-label">开营时间</text>
            <text class="item-value">2025.12.19</text>
          </view>
          <view class="info-divider"></view>
          <view class="info-item">
            <text class="item-label">结营时间</text>
            <text class="item-value">2026.03.19</text>
          </view>
        </view>
        <view class="info-row-bottom">
          <view class="participant-box">
            <text class="emoji-icon">👥</text>
            <text class="participant-text"><text class="highlight-num">573</text> 位同修已加入</text>
          </view>
        </view>
      </view>

      <!-- 3. 富文本介绍区 -->
      <view class="intro-section">
        <view class="section-header">
          <text class="section-title">课程简介</text>
          <view class="title-line"></view>
        </view>
        
        <view class="intro-content">
          <text class="paragraph">
            《大学》有云：“大学之道，在明明德，在亲民，在止于至善。”
          </text>
          <text class="paragraph">
            本修习营旨在通过系统化的学习与践行，帮助学员深入理解阳明心学的核心精髓。课程涵盖《传习录》精读、静坐体悟、事上磨炼等多个环节。
          </text>
          <text class="paragraph">
            我们期望每一位加入的同修，都能在喧嚣的现代生活中，找到内心的宁静与力量，真正做到“知行合一”。
          </text>
        </view>

        <view class="section-header" style="margin-top: 60rpx;">
          <text class="section-title">修习须知</text>
          <view class="title-line"></view>
        </view>

        <view class="notice-list">
          <view class="notice-item">
            <text class="notice-dot">·</text>
            <text class="notice-text">本课程为纯公益性质，全程免费。</text>
          </view>
          <view class="notice-item">
            <text class="notice-dot">·</text>
            <text class="notice-text">请确保能按时完成每日的学习与打卡任务。</text>
          </view>
          <view class="notice-item">
            <text class="notice-dot">·</text>
            <text class="notice-text">报名后请主动添加班主任微信进入专属班级群。</text>
          </view>
        </view>
      </view>

      <!-- 底部安全距离 -->
      <view class="safe-area-spacer"></view>
    </scroll-view>

    <!-- 4. 底部吸底操作栏 (Fixed Bottom) -->
    <view class="bottom-bar">
      <view class="price-box">
        <text class="price-label">公益免费</text>
      </view>
      <view class="enroll-btn" @click="handleEnroll">
        <text class="btn-text">立即报名加入</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const statusBarHeight = ref(20); // 默认状态栏高度
const campId = ref('');

onLoad((options) => {
  if (options.id) {
    campId.value = options.id;
  }
  
  // 获取系统状态栏高度
  const systemInfo = uni.getSystemInfoSync();
  if (systemInfo.statusBarHeight) {
    statusBarHeight.value = systemInfo.statusBarHeight;
  }
});

const goBack = () => {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.switchTab({ url: '/pages/Main/index' });
    }
  });
};

const handleEnroll = () => {
  uni.showToast({
    title: '准备调用报名接口...',
    icon: 'none',
    duration: 2000
  });
};
</script>

<style scoped lang="scss">
.enroll-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fdfbf7;
  position: relative;
}

/* 自定义导航栏 */
.nav-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  background: transparent;
}
.back-btn {
  position: absolute;
  left: 30rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(4px);
}
.back-icon {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: bold;
}
.nav-title {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
  opacity: 0.9;
}

.scroll-content {
  flex: 1;
  height: 0;
}

/* 1. 顶部封面区 */
.hero-cover {
  position: relative;
  height: 540rpx;
  width: 100%;
}
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #7b1e1e 0%, #a22929 50%, #8c2323 100%);
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
}
/* 添加点阵纹理 */
.hero-bg::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.hero-content {
  position: absolute;
  top: 40%;
  left: 0;
  width: 100%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}
.hero-title {
  font-size: 64rpx;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 8rpx;
  margin-bottom: 24rpx;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
}
.hero-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 12rpx;
  padding: 8rpx 32rpx;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 40rpx;
}

/* 2. 核心信息卡片 */
.info-card {
  margin: -80rpx 40rpx 0;
  position: relative;
  z-index: 20;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 16rpx 40rpx rgba(138, 32, 33, 0.08);
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}
.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.item-label {
  font-size: 24rpx;
  color: #8c8686;
  margin-bottom: 12rpx;
}
.item-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #2d2424;
}
.info-divider {
  width: 2rpx;
  height: 40rpx;
  background: #eeeeee;
}

.info-row-bottom {
  padding-top: 30rpx;
  border-top: 2rpx dashed #f0f0f0;
  display: flex;
  justify-content: center;
}
.participant-box {
  display: flex;
  align-items: center;
  background: #fdfaf7;
  padding: 12rpx 32rpx;
  border-radius: 30rpx;
}
.emoji-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}
.participant-text {
  font-size: 26rpx;
  color: #5d5555;
}
.highlight-num {
  color: #9e2a2b;
  font-weight: bold;
  font-size: 30rpx;
  margin: 0 4rpx;
}

/* 3. 富文本介绍区 */
.intro-section {
  padding: 60rpx 40rpx;
}
.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}
.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2d2424;
  letter-spacing: 4rpx;
  margin-bottom: 12rpx;
}
.title-line {
  width: 60rpx;
  height: 6rpx;
  background: #9e2a2b;
  border-radius: 4rpx;
}

.intro-content {
  background: #ffffff;
  padding: 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
}
.paragraph {
  display: block;
  font-size: 28rpx;
  color: #4a4a4a;
  line-height: 1.8;
  margin-bottom: 24rpx;
  text-indent: 2em;
  text-align: justify;
}
.paragraph:last-child {
  margin-bottom: 0;
}

.notice-list {
  padding: 0 20rpx;
}
.notice-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}
.notice-dot {
  color: #9e2a2b;
  font-weight: bold;
  margin-right: 12rpx;
}
.notice-text {
  font-size: 26rpx;
  color: #8c8686;
  line-height: 1.5;
  flex: 1;
}

.safe-area-spacer {
  height: 180rpx;
}

/* 4. 底部吸底操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40rpx;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}
.price-box {
  display: flex;
  align-items: baseline;
}
.price-label {
  font-size: 36rpx;
  font-weight: bold;
  color: #9e2a2b;
}
.enroll-btn {
  background: linear-gradient(90deg, #b53b3c 0%, #8a2021 100%);
  padding: 24rpx 60rpx;
  border-radius: 60rpx;
  box-shadow: 0 8rpx 24rpx rgba(138, 32, 33, 0.3);
  transition: transform 0.1s;
}
.enroll-btn:active {
  transform: scale(0.96);
}
.btn-text {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}
</style>