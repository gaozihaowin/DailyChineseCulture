<template>
  <view class="enroll-container">
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">营期宣发</text>
    </view>

    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="cover-section" :style="{ background: getCoverBackground(campInfo.campName) }">
        <view class="cover-texture"></view>
        <view class="cover-gradient-mask"></view>
        <view class="cover-content">
          <text class="cover-title">{{ campInfo.title || '致良知修习营' }}</text>
          <text class="cover-subtitle" v-if="campInfo.batch">{{ campInfo.batch }}</text>
        </view>
      </view>

      <view class="info-card animate-fade-up" style="animation-delay: 0.1s;">
        <view class="info-row">
          <view class="info-item">
            <text class="item-label">开营日</text>
            <text class="item-value">{{ formatDate(campInfo.startTime) }}</text>
          </view>
          <view class="info-divider"></view>
          <view class="info-item">
            <text class="item-label">结营日</text>
            <text class="item-value">{{ formatDate(campInfo.endTime) }}</text>
          </view>
        </view>
        <view class="info-row-bottom">
          <view class="participant-box">
            <text class="emoji-icon">👥</text>
            <text class="participant-text">已有 <text class="highlight-num">{{ campInfo.participantCount || 0 }}</text> 位同修结缘加入</text>
          </view>
        </view>
      </view>

      <view class="intro-card animate-fade-up" style="animation-delay: 0.2s;">
        <view class="section-title">
          <view class="title-decorator"></view>
          <text class="title-text">缘起与发心</text>
        </view>
        <view class="section-content">
          <text class="paragraph first-paragraph" v-if="campInfo.description">
            {{ campInfo.description }}
          </text>
          <text class="paragraph first-paragraph" v-else>
            五百年前，阳明先生在龙场顿悟，留下“心即理”、“致良知”、“知行合一”的千古心法。这不仅是一门高深的哲学，更是一套经世致用的生命大智慧。
          </text>
          <text class="paragraph">
            在这个快节奏、充满不确定性的时代，本营期旨在带领大家暂别世俗喧嚣，向内探求。通过系统性的研读与实践，唤醒我们本自具足的“良知”，重塑内心的笃定与力量，找回生命的自在与从容。
          </text>
        </view>
      </view>

      <view class="intro-card animate-fade-up" style="animation-delay: 0.3s;">
        <view class="section-title">
          <view class="title-decorator"></view>
          <text class="title-text">修习次第</text>
        </view>
        <view class="feature-list">
          <view class="feature-item">
            <view class="icon-box"><text class="icon-emoji">📖</text></view>
            <view class="feature-text">
              <text class="f-title">原典精读：</text>
              <text class="f-desc">直击《传习录》《大学问》等核心真言，明心见性。</text>
            </view>
          </view>
          <view class="feature-item">
            <view class="icon-box"><text class="icon-emoji">🚩</text></view>
            <view class="feature-text">
              <text class="f-title">事上磨炼：</text>
              <text class="f-desc">破除“坐而论道”，将心学智慧融入工作与生活的细微处。</text>
            </view>
          </view>
          <view class="feature-item">
            <view class="icon-box"><text class="icon-emoji">✅</text></view>
            <view class="feature-text">
              <text class="f-title">省察克治：</text>
              <text class="f-desc">每日三省吾身，通过心得打卡剥落私欲，清澈心体。</text>
            </view>
          </view>
          <view class="feature-item">
            <view class="icon-box"><text class="icon-emoji">🤝</text></view>
            <view class="feature-text">
              <text class="f-title">同修印证：</text>
              <text class="f-desc">在班级小组中碰撞思想，师友同行，切磋琢磨共精进。</text>
            </view>
          </view>
        </view>
      </view>

      <view class="intro-card animate-fade-up" style="animation-delay: 0.4s;">
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

      <view class="quote-card animate-fade-up" style="animation-delay: 0.5s;">
        <view class="wisdom-border">
          <text class="quote-mark-bg">“</text>
          <text class="wisdom-text">种树者必培其根，种德者必养其心。</text>
          <view class="wisdom-footer">
            <text class="wisdom-author">—— 王阳明 ·《传习录》</text>
          </view>
        </view>
      </view>

      <view class="safe-area-spacer"></view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="price-box">
        <text class="price-symbol">公益</text>
        <text class="price-label">免费修习</text>
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
import { get } from '@/utils/request';
import { API_CONFIG } from '@/api/config';

// ========== 状态定义 ==========
const statusBarHeight = ref(20);
const campId = ref('');
const campInfo = ref({});

// ========== 颜色映射字典 (致良知高定色系) ==========
const colorMap = {
  '诚意班': 'linear-gradient(135deg, #8a2021, #b53b3c)',
  '明理班': 'linear-gradient(135deg, #1e3c72, #2a5298)',
  '笃行班': 'linear-gradient(135deg, #d35400, #e67e22)',
  '印证班': 'linear-gradient(135deg, #205e4a, #3ea07a)',
  '良知班': 'linear-gradient(135deg, #5c433b, #8b6b61)',
  '默认': 'linear-gradient(135deg, #9e2a2b, #b53b3c)'
};

// 工具函数：获取封面背景色
const getCoverBackground = (campName) => {
  if (!campName) return colorMap['默认'];
  for (const key in colorMap) {
    if (campName.includes(key.replace('班', ''))) {
      return colorMap[key];
    }
  }
  return colorMap['默认'];
};

// 工具函数：安全格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  let safeStr = dateString;
  if (typeof dateString === 'string' && !dateString.includes('T')) {
    safeStr = dateString.replace(/-/g, '/');
  }
  const date = new Date(safeStr);
  if (isNaN(date.getTime())) return '待定';
  
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
};

// ========== 生命周期 ==========
onLoad((options) => {
  if (options.id) {
    campId.value = options.id;
    fetchCampDetail(options.id);
  }
  
  const systemInfo = uni.getSystemInfoSync();
  if (systemInfo.statusBarHeight) {
    statusBarHeight.value = systemInfo.statusBarHeight;
  }
});

// ========== 获取营期详情 ==========
const fetchCampDetail = async (id) => {
  uni.showLoading({ title: '铺陈书卷...', mask: true });
  try {
    const res = await get(API_CONFIG.paths.courseDetail, { id });
    const resultData = (res.data && res.data.code) ? res.data : res;
    
    if (resultData.code === 200 && resultData.data) {
      campInfo.value = resultData.data;
    } else {
      uni.showToast({ title: resultData.msg || '获取详情失败', icon: 'none' });
    }
  } catch (error) {
    console.error('Fetch camp detail error:', error);
    uni.showToast({ title: '网络异常，请重试', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.switchTab({ url: '/pages/Main/index' });
    }
  });
};

// ========== 报名交互 ==========
const handleEnroll = () => {
  if (!campId.value) {
    uni.showToast({ title: '营期信息异常', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '结缘报名中...', mask: true });
  
  // 模拟网络延迟与真实的 redirectTo 逻辑
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '报名成功',
      icon: 'success',
      duration: 1500
    });
    
    setTimeout(() => {
      uni.redirectTo({
        url: `/pages/CourseDetail/index?id=${campId.value}&source=enroll`
      });
    }, 1500);
  }, 1500);
};
</script>

<style scoped lang="scss">
/* ========== 全局重置与动画 ========== */
.enroll-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #faf8f5; /* 雅致的暖宣纸色 */
  position: relative;
}

@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(40rpx); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  opacity: 0; 
  animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* ========== 自定义导航栏 ========== */
.nav-bar {
  position: absolute; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center; height: 44px;
}
.back-btn {
  position: absolute; left: 30rpx; width: 64rpx; height: 64rpx;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.15); border-radius: 50%; backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
}
.back-icon { font-size: 36rpx; color: #ffffff; font-weight: bold; margin-top: -4rpx; }
.nav-title { font-size: 32rpx; color: #ffffff; font-weight: 600; letter-spacing: 2rpx; text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);}

.scroll-content { flex: 1; height: 0; }

/* ========== 1. 顶部封面区 ========== */
.cover-section {
  position: relative; height: 500rpx; width: 100%;
  border-bottom-left-radius: 60rpx; border-bottom-right-radius: 60rpx; overflow: hidden;
}
.cover-texture {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px);
  background-size: 30px 30px; opacity: 0.8;
}
.cover-gradient-mask {
  position: absolute; bottom: 0; left: 0; right: 0; height: 60%;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
}
.cover-content {
  position: absolute; bottom: 130rpx; left: 40rpx; right: 40rpx;
  display: flex; flex-direction: column; z-index: 10;
}
.cover-title {
  font-size: 60rpx; font-weight: 900; color: #ffffff; letter-spacing: 4rpx;
  margin-bottom: 20rpx; text-shadow: 0 6rpx 16rpx rgba(0,0,0,0.2);
}
.cover-subtitle {
  font-size: 24rpx; color: #ffffff; font-weight: 500; letter-spacing: 2rpx;
  background: rgba(255, 255, 255, 0.2); padding: 6rpx 24rpx; border-radius: 30rpx;
  align-self: flex-start; backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.3);
}

/* ========== 2. 核心信息卡片 ========== */
.info-card {
  margin: -70rpx 30rpx 30rpx; position: relative; z-index: 20;
  background: #ffffff; border-radius: 30rpx; padding: 40rpx;
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.05); border: 1px solid rgba(0,0,0,0.02);
}
.info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30rpx; }
.info-item { display: flex; flex-direction: column; align-items: center; flex: 1; }
.item-label { font-size: 24rpx; color: #8c8686; margin-bottom: 12rpx; letter-spacing: 2rpx;}
.item-value { font-size: 32rpx; font-weight: 800; color: #2d2424; font-family: monospace;}
.info-divider { width: 2rpx; height: 50rpx; background: #f0ece6; }

.info-row-bottom {
  padding-top: 30rpx; border-top: 2rpx dashed #f0ece6; display: flex; justify-content: center;
}
.participant-box { display: flex; align-items: center; background: #faf8f5; padding: 12rpx 40rpx; border-radius: 40rpx; }
.emoji-icon { font-size: 28rpx; margin-right: 12rpx; }
.participant-text { font-size: 24rpx; color: #5d5555; font-weight: 500;}
.highlight-num { color: #9e2a2b; font-weight: 900; font-size: 32rpx; margin: 0 8rpx; }

/* ========== 公共白底内容卡片 (融合自 camp-intro) ========== */
.intro-card {
  background-color: #ffffff; border-radius: 30rpx; padding: 40rpx 36rpx;
  margin: 0 30rpx 30rpx; box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.02);
}

.section-title {
  display: flex; align-items: center; margin-bottom: 32rpx;
  .title-decorator { width: 8rpx; height: 32rpx; background-color: #9e2a2b; border-radius: 6rpx; margin-right: 16rpx; }
  .title-text { font-size: 34rpx; font-weight: 900; color: #2d2424; letter-spacing: 4rpx; }
}

.section-content {
  .paragraph {
    display: block; font-size: 28rpx; color: #5d5555; line-height: 1.8;
    margin-bottom: 24rpx; text-align: justify; letter-spacing: 1rpx;
  }
  .paragraph:last-child { margin-bottom: 0; }
  .first-paragraph { font-weight: bold; color: #4a4040; }
}

/* ========== 4. 修习次第 (原生 Emoji 版) ========== */
.feature-list { display: flex; flex-direction: column; gap: 36rpx; }
.feature-item {
  display: flex; align-items: flex-start;
  .icon-box {
    width: 60rpx; height: 60rpx; border-radius: 16rpx; background: rgba(158, 42, 43, 0.06);
    display: flex; align-items: center; justify-content: center; margin-right: 24rpx; flex-shrink: 0;
  }
  .icon-emoji { font-size: 30rpx; }
  .feature-text {
    flex: 1; font-size: 28rpx; line-height: 1.6; padding-top: 6rpx;
    .f-title { font-weight: 800; color: #2d2424; margin-right: 8rpx; }
    .f-desc { color: #8c8686; }
  }
}

/* ========== 5. 同修契机 ========== */
.target-list { display: flex; flex-direction: column; gap: 24rpx; }
.target-item {
  display: flex; align-items: flex-start; background: #faf8f4; padding: 24rpx; border-radius: 20rpx;
  .check-mark {
    background-color: #9e2a2b; color: #fff; width: 32rpx; height: 32rpx; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 20rpx; font-weight: bold;
    margin-right: 16rpx; margin-top: 4rpx; flex-shrink: 0;
  }
  .t-text { font-size: 28rpx; color: #5d5555; line-height: 1.6; }
}

/* ========== 6. 圣贤寄语引言卡 ========== */
.quote-card { margin: 0 30rpx 40rpx; }
.wisdom-border { 
  position: relative; background: rgba(158, 42, 43, 0.02); 
  border: 1px dashed rgba(158, 42, 43, 0.2); border-radius: 24rpx; 
  padding: 50rpx 40rpx; display: flex; flex-direction: column; align-items: center; overflow: hidden;
}
.quote-mark-bg {
  position: absolute; top: -10rpx; left: 20rpx; font-size: 120rpx; color: rgba(158,42,43,0.06); font-family: serif; line-height: 1;
}
.wisdom-text { 
  font-size: 32rpx; color: #5d4037; font-family: serif; font-weight: bold; 
  letter-spacing: 4rpx; line-height: 1.6; text-align: center; position: relative; z-index: 2;
}
.wisdom-footer { width: 100%; display: flex; justify-content: flex-end; margin-top: 30rpx; position: relative; z-index: 2;}
.wisdom-author { font-size: 24rpx; color: #9e2a2b; opacity: 0.9; font-weight: bold; }

.safe-area-spacer { height: 180rpx; }

/* ========== 7. 底部吸底操作栏 ========== */
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; height: 140rpx;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0,0,0,0.03);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40rpx; padding-bottom: env(safe-area-inset-bottom); z-index: 999;
}
.price-box { display: flex; align-items: center; gap: 12rpx; }
.price-symbol { 
  font-size: 22rpx; font-weight: bold; color: #9e2a2b; 
  border: 1px solid #9e2a2b; padding: 2rpx 10rpx; border-radius: 6rpx; 
}
.price-label { font-size: 38rpx; font-weight: 900; color: #9e2a2b; }

.enroll-btn {
  background: linear-gradient(135deg, #b53b3c 0%, #8a2021 100%);
  padding: 24rpx 50rpx; border-radius: 60rpx;
  box-shadow: 0 10rpx 20rpx rgba(138, 32, 33, 0.25);
  transition: all 0.2s ease;
}
.enroll-btn:active { transform: scale(0.95); box-shadow: 0 4rpx 10rpx rgba(138, 32, 33, 0.2); }
.btn-text { color: #ffffff; font-size: 32rpx; font-weight: 900; letter-spacing: 2rpx; margin-right: -2rpx;}
</style>