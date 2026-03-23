<template>
  <view class="enroll-container">
    <NavBar title="" :isTransparent="true" />

    <view class="fixed-top-zone">
      <view class="cover-section" :style="{ background: getCoverBackground(campInfo.campName) }">
        <view class="cover-texture"></view>
        <view class="cover-gradient-mask"></view>
        <view class="cover-content">
          <text class="cover-title">{{ campInfo.title || '致良知修习营' }}</text>
          <view class="batch-wrapper" v-if="campInfo.batch">
            <text class="cover-subtitle">{{ campInfo.batch }}</text>
          </view>
        </view>
      </view>

      <view class="info-card-wrapper animate-fade-up" style="animation-delay: 0.1s;">
        <view class="info-card">
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
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="scroll-inner">
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
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="price-box">
        <text class="price-symbol">公益</text>
        <text class="price-label">免费修习</text>
      </view>
      <view class="enroll-btn" :class="{ 'is-disabled': isEnrolled || isCampEnded }" @click="handleEnroll">
        <text class="btn-text">{{ isEnrolled ? '已结缘' : (isCampEnded ? '已结营' : '立即报名') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { get, post } from '@/utils/request';
import { API_CONFIG } from '@/api/config';

// ========== 状态定义 ==========
const campId = ref('');
const campInfo = ref({});
const isEnrolled = ref(false);
const enrollLoading = ref(false);

// ========== 基于时间的营期结束判断（废弃 status 字段依赖） ==========
const isCampEnded = computed(() => {
  if (!campInfo.value.endTime) return false;
  const endStr = campInfo.value.endTime.replace(/-/g, '/');
  const endTime = new Date(endStr).getTime();
  const nowTime = new Date().getTime();
  return nowTime > endTime;
}); 

// ========== 颜色映射字典 (致良知高定色系) ==========
const colorMap = {
  '诚意班': 'linear-gradient(135deg, #8a2021, #b53b3c)',
  '明理班': 'linear-gradient(135deg, #1e3c72, #2a5298)',
  '笃行班': 'linear-gradient(135deg, #d35400, #e67e22)',
  '印证班': 'linear-gradient(135deg, #205e4a, #3ea07a)',
  '良知班': 'linear-gradient(135deg, #5c433b, #8b6b61)',
  '默认': 'linear-gradient(135deg, #9e2a2b, #b53b3c)'
};

const getCoverBackground = (campName) => {
  if (!campName) return colorMap['默认'];
  for (const key in colorMap) {
    if (campName.includes(key.replace('班', ''))) {
      return colorMap[key];
    }
  }
  return colorMap['默认'];
};

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
});

// 获取营期详情
const fetchCampDetail = async (id) => {
  uni.showLoading({ title: '铺陈书卷...', mask: true });
  try {
    const res = await get(API_CONFIG.paths.courseDetail, { id });
    const resultData = (res.data && res.data.code) ? res.data : res;

    if (resultData.code === 200 && resultData.data) {
      campInfo.value = resultData.data;

      // 【新增排查日志】确认后端返回的 endTime 字段
      console.log('===== 营期详情接口数据获取成功 =====');
      console.log('后端返回的完整 campInfo:', campInfo.value);
      console.log('关键字段 endTime 的值:', campInfo.value.endTime);
      console.log('====================================');

      if (resultData.data.isEnrolled !== undefined) {
         isEnrolled.value = resultData.data.isEnrolled;
      }
    } else {
      uni.showToast({ title: resultData.msg || '获取详情失败', icon: 'none' });
    }
  } catch (error) {
    console.error('Fetch camp detail error:', error);
    uni.showToast({ title: '网络请求失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

// ========== 报名交互 ==========
const handleEnroll = async () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/Login/index' });
    }, 1000);
    return;
  }

  if (!campId.value) {
    uni.showToast({ title: '营期信息异常', icon: 'none' });
    return;
  }

  // 基于时间的前端防御拦截（替换原来的 status === 2 判断）
  if (isCampEnded.value) {
    uni.showToast({ title: '当前营期已结束，不可报名', icon: 'none' });
    return;
  }

  if (isEnrolled.value) {
    uni.showToast({ title: '您已结缘该营期，无需重复报名', icon: 'none' });
    return;
  }
  if (enrollLoading.value) return;

  enrollLoading.value = true;
  uni.showLoading({ title: '结缘报名中...', mask: true });

  try {
    // 真实调用后端原生 MyBatis 接口，注意无 /api/ 前缀
    const res = await post('/camp/enroll', { campId: Number(campId.value) });
    const resultData = res.data || res;

    if (resultData.code === 200) {
      uni.showToast({ title: '报名成功', icon: 'success' });
      isEnrolled.value = true;
      // 本地页面人数+1，增加反馈真实感
      if (campInfo.value.participantCount !== undefined) {
        campInfo.value.participantCount += 1;
      }
    } else {
      uni.showToast({ title: resultData.message || '报名失败', icon: 'none' });
    }
  } catch (error) {
    console.error('Enroll API error:', error);
    uni.showToast({ title: '网络请求异常', icon: 'none' });
  } finally {
    enrollLoading.value = false;
    uni.hideLoading();
  }
};
</script>

<style scoped lang="scss">
/* ========== 1. 全局重置与架构 ========== */
.enroll-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #faf8f5; 
  position: relative;
  overflow: hidden; 
}

@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(40rpx); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  opacity: 0; 
  animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* ========== 2. 上半部固定区 ========== */
.fixed-top-zone {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

.cover-section {
  position: relative; 
  height: 460rpx; 
  width: 100%;
  border-bottom-left-radius: 60rpx; 
  border-bottom-right-radius: 60rpx; 
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 60rpx; 
}
.cover-texture {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px);
  background-size: 30px 30px; opacity: 0.8;
}
.cover-gradient-mask {
  position: absolute; bottom: 0; left: 0; right: 0; height: 50%;
  background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
}
.cover-content {
  position: relative; 
  z-index: 10;
  display: flex; 
  flex-direction: column; 
  align-items: center;
  padding: 0 40rpx;
}
.cover-title {
  font-size: 52rpx; 
  font-weight: 900; 
  color: #ffffff; 
  letter-spacing: 4rpx;
  line-height: 1.4;
  text-align: center; 
  margin-bottom: 24rpx; 
  text-shadow: 0 6rpx 16rpx rgba(0,0,0,0.2);
}
.batch-wrapper {
  display: flex;
  justify-content: center;
}
.cover-subtitle {
  font-size: 24rpx; 
  color: #ffffff; 
  font-weight: 600; 
  letter-spacing: 2rpx;
  background: rgba(255, 255, 255, 0.15); 
  padding: 6rpx 30rpx; 
  border-radius: 30rpx;
  backdrop-filter: blur(8px); 
  border: 1px solid rgba(255,255,255,0.2);
}

.info-card-wrapper {
  padding: 0 30rpx;
  margin-top: -60rpx; 
  margin-bottom: 20rpx;
  position: relative; 
  z-index: 20;
}
.info-card {
  background: #ffffff; 
  border-radius: 30rpx; 
  padding: 40rpx 40rpx 30rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.05); 
  border: 1px solid rgba(0,0,0,0.02);
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

/* ========== 3. 下半部独立滚动区 ========== */
.scroll-content { 
  flex: 1; 
  height: 0; 
}
.scroll-inner {
  padding-top: 10rpx;
}
.intro-card {
  background-color: #ffffff; border-radius: 30rpx; padding: 40rpx 36rpx;
  margin: 0 30rpx 30rpx; box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.02);
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

.safe-area-spacer { height: 160rpx; }

/* ========== 4. 底部吸底操作栏 ========== */
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; 
  height: 120rpx; 
  background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0,0,0,0.03);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40rpx; padding-bottom: env(safe-area-inset-bottom); z-index: 999;
}
.price-box { display: flex; align-items: center; gap: 12rpx; }
.price-symbol { 
  font-size: 20rpx; font-weight: bold; color: #9e2a2b; 
  border: 1px solid #9e2a2b; padding: 2rpx 8rpx; border-radius: 6rpx; 
}
.price-label { font-size: 34rpx; font-weight: 900; color: #9e2a2b; }

.enroll-btn {
  background: linear-gradient(135deg, #b53b3c 0%, #8a2021 100%);
  padding: 16rpx 44rpx; 
  border-radius: 50rpx;
  box-shadow: 0 8rpx 20rpx rgba(138, 32, 33, 0.2);
  transition: all 0.2s ease;
}
.enroll-btn:active { transform: scale(0.95); box-shadow: 0 4rpx 10rpx rgba(138, 32, 33, 0.15); }
.btn-text { color: #ffffff; font-size: 28rpx; font-weight: bold; letter-spacing: 2rpx; }

/* === 核心新增：已报名（置灰禁用）状态 === */
.enroll-btn.is-disabled {
  background: #cccccc;
  box-shadow: none;
  pointer-events: none; 
}
.enroll-btn.is-disabled:active {
  transform: none; 
}
</style>