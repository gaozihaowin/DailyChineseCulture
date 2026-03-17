<template>
  <view class="camp-intro-container">
    
    <view class="intro-card">
      <view class="section-title">
        <view class="title-decorator"></view>
        <text class="title-text">缘起与发心</text>
      </view>
      <view class="section-content">
        <text class="paragraph first-paragraph">五百年前，阳明先生在龙场顿悟，留下“心即理”、“致良知”、“知行合一”的千古心法。这不仅是一门高深的哲学，更是一套经世致用的生命大智慧。</text>
        <text class="paragraph">在这个快节奏、充满不确定性的时代，本营期旨在带领大家暂别世俗喧嚣，向内探求。通过系统性的研读与实践，唤醒我们本自具足的“良知”，重塑内心的笃定与力量，找回生命的自在与从容。</text>
      </view>
    </view>

    <view class="intro-card">
      <view class="section-title">
        <view class="title-decorator"></view>
        <text class="title-text">修习次第</text>
      </view>
      <view class="feature-list">
        <view class="feature-item">
          <view class="icon-box">
            <uni-icons type="book" size="18" color="#9e2a2b"></uni-icons>
          </view>
          <view class="feature-text">
            <text class="f-title">原典精读：</text>
            <text class="f-desc">直击《传习录》《大学问》等核心真言，明心见性。</text>
          </view>
        </view>
        <view class="feature-item">
          <view class="icon-box">
            <uni-icons type="flag" size="18" color="#9e2a2b"></uni-icons>
          </view>
          <view class="feature-text">
            <text class="f-title">事上磨炼：</text>
            <text class="f-desc">破除“坐而论道”，将心学智慧融入工作与生活的细微处。</text>
          </view>
        </view>
        <view class="feature-item">
          <view class="icon-box">
            <uni-icons type="checkbox" size="18" color="#9e2a2b"></uni-icons>
          </view>
          <view class="feature-text">
            <text class="f-title">省察克治：</text>
            <text class="f-desc">每日三省吾身，通过心得打卡剥落私欲，清澈心体。</text>
          </view>
        </view>
        <view class="feature-item">
          <view class="icon-box">
            <uni-icons type="staff" size="18" color="#9e2a2b"></uni-icons>
          </view>
          <view class="feature-text">
            <text class="f-title">同修印证：</text>
            <text class="f-desc">在班级小组中碰撞思想，师友同行，切磋琢磨共精进。</text>
          </view>
        </view>
      </view>
    </view>

    <view class="intro-card">
      <view class="section-title">
        <view class="title-decorator"></view>
        <text class="title-text">同修契机</text>
      </view>
      <view class="target-list">
        <view class="target-item">
          <view class="check-mark">✓</view>
          <text class="t-text">在快节奏生活中感到焦虑迷茫，渴望寻回内心宁静的修习者；</text>
        </view>
        <view class="target-item">
          <view class="check-mark">✓</view>
          <text class="t-text">面临事业或人生瓶颈，亟需破局智慧与行动力量的探索者；</text>
        </view>
        <view class="target-item">
          <view class="check-mark">✓</view>
          <text class="t-text">愿以真诚之心，与一群志同道合的师友共同成长的你。</text>
        </view>
      </view>
    </view>

    <view class="quote-card">
      <view class="wisdom-border">
        <text class="wisdom-text">种树者必培其根，种德者必养其心。</text>
        <view class="wisdom-footer">
          <text class="wisdom-author">—— 王阳明 ·《传习录》</text>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  courseInfo: {
    type: Object,
    default: () => ({})
  }
});
</script>

<style scoped lang="scss">
.camp-intro-container {
  padding: 20rpx 30rpx; /* 容器本身透明，留出内边距给卡片 */
  background-color: transparent;
}

/* 🚨 核心：纯白悬浮卡片 */
.intro-card {
  background-color: #ffffff;
  border-radius: 30rpx;
  padding: 40rpx 36rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); /* 细腻的悬浮阴影 */
  border: 1px solid rgba(0, 0, 0, 0.02);
}

/* 标题样式：融合首页基因的装饰 */
.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
  
  .title-decorator {
    width: 8rpx;
    height: 32rpx;
    background-color: #9e2a2b; /* 阳明红 */
    border-radius: 6rpx;
    margin-right: 16rpx;
  }
  
  .title-text {
    font-size: 36rpx;
    font-weight: 800;
    color: #2d2424; /* 首页同款深色 */
    letter-spacing: 2rpx;
  }
}

/* 正文段落排版 */
.section-content {
  .paragraph {
    display: block;
    font-size: 28rpx;
    color: #5d5555; /* 首页同款沉稳灰 */
    line-height: 1.8;
    margin-bottom: 24rpx;
    text-align: justify;
    letter-spacing: 1rpx;
  }
  .paragraph:last-child {
    margin-bottom: 0;
  }
  
  /* 首段首字下沉或重点强调 */
  .first-paragraph {
    font-weight: 500;
    color: #4a4040;
  }
}

/* 修习次第列表 (重新设计的图标排版) */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  
  .icon-box {
    width: 60rpx;
    height: 60rpx;
    border-radius: 16rpx;
    background: rgba(158, 42, 43, 0.06); /* 淡淡的阳明红背景 */
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    flex-shrink: 0;
  }
  
  .feature-text {
    flex: 1;
    font-size: 28rpx;
    line-height: 1.6;
    padding-top: 6rpx;
    
    .f-title {
      font-weight: 800;
      color: #2d2424;
      margin-right: 8rpx;
    }
    .f-desc {
      color: #8c8686;
    }
  }
}

/* 适合人群列表 */
.target-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.target-item {
  display: flex;
  align-items: flex-start;
  background: #faf8f4; /* 内部小区块使用极淡的底色区分 */
  padding: 24rpx;
  border-radius: 20rpx;
  
  .check-mark {
    background-color: #9e2a2b;
    color: #fff;
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20rpx;
    font-weight: bold;
    margin-right: 16rpx;
    margin-top: 4rpx;
    flex-shrink: 0;
  }
  
  .t-text {
    font-size: 28rpx;
    color: #5d5555;
    line-height: 1.6;
  }
}

/* 圣贤寄语 (同步首页的高度复用样式) */
.quote-card {
  margin-bottom: 30rpx;
}

.wisdom-border { 
  position: relative; 
  background: rgba(158, 42, 43, 0.03); 
  border: 1px dashed rgba(158, 42, 43, 0.3); 
  border-radius: 24rpx; 
  padding: 40rpx; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 20rpx; 
}

.wisdom-text { 
  font-size: 32rpx; 
  color: #5d4037; 
  font-family: serif; 
  font-weight: 600; 
  letter-spacing: 4rpx; 
  line-height: 1.6; 
  text-align: center; 
}

.wisdom-footer { 
  width: 100%; 
  display: flex; 
  justify-content: flex-end; 
  margin-top: 10rpx;
}

.wisdom-author { 
  font-size: 24rpx; 
  color: #9e2a2b; 
  opacity: 0.8; 
  font-weight: bold; 
}
</style>