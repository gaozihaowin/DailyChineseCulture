<template>
  <view class="page-container">
    <NavBar title="修习档案" bgColor="#f8f6f0" />

    <view class="content-wrapper">
      
      <view class="page-header fade-in">
        <view class="motto-card">
          <view class="motto-bg-pattern"></view>
          <text class="motto-text">学如不及，犹恐失之</text>
          <text class="motto-sub">—— 《论语》 ——</text>
        </view>
      </view>

      <view v-if="isLoading" class="loading-container">
        <view class="modern-spinner"></view>
        <text class="loading-text">加载修习数据...</text>
      </view>

      <view v-else-if="archiveData" class="data-wrapper slide-up">
        
        <view class="overview-card">
          <view class="overview-item">
            <view class="icon-circle read-bg"><text class="emoji">📚</text></view>
            <view class="overview-info">
              <text class="overview-value">{{ archiveData.totalCamps || 0 }}</text>
              <text class="overview-label">参与营期</text>
            </view>
          </view>
          
          <view class="overview-divider"></view>
          
          <view class="overview-item">
            <view class="icon-circle cert-bg"><text class="emoji">🏅</text></view>
            <view class="overview-info">
              <text class="overview-value">{{ archiveData.totalCertificates || 0 }}</text>
              <text class="overview-label">获得证书</text>
            </view>
          </view>
          
          <view class="overview-divider"></view>
          
          <view class="overview-item">
            <view class="icon-circle time-bg"><text class="emoji">⏱️</text></view>
            <view class="overview-info">
              <text class="overview-value">{{ archiveData.avgCompletionRate || 0 }}<text class="unit">%</text></text>
              <text class="overview-label">平均进度</text>
            </view>
          </view>
        </view>

        <view class="radar-section">
          <view class="section-header">
            <text class="section-title">修习维序 (Radar Stats)</text>
          </view>

          <view class="radar-card">
            <view class="radar-canvas-wrapper">
              <view class="radar-bg-webs">
                <view v-for="(web, index) in radarWebs" :key="'web-'+index" class="radar-web-polygon" :style="web.style"></view>
              </view>
              <view class="radar-axes-lines">
                <view v-for="(axis, index) in radarConfig.axes" :key="'axis-line-'+index" class="radar-axis-line" :style="{ left: `${radarConfig.centerX}px`, top: `${radarConfig.centerY}px`, width: `${radarConfig.radius}px`, transform: `rotate(${axis.angle}deg)` }"></view>
              </view>
              <view class="radar-axes-labels">
                <view v-for="(axis, index) in radarConfig.axes" :key="'label-'+index" class="radar-axis-label" :style="{ left: `${radarConfig.centerX + Math.cos(axis.angle * Math.PI / 180) * (radarConfig.radius + 38)}px`, top: `${radarConfig.centerY + Math.sin(axis.angle * Math.PI / 180) * (radarConfig.radius + 24)}px` }">
                  <text class="label-key">{{ axis.key }}</text>
                  <text class="label-val">({{ Math.round(archiveData.radarStats[axis.key] || 0) }})</text>
                </view>
              </view>
              <view class="radar-polygon-wrapper">
                <view class="radar-polygon-fill" :style="polygonStyle"></view>
                <view v-for="(line, index) in radarLines" :key="'line-'+index" class="radar-polygon-stroke" :style="{ left: `${line.x}px`, top: `${line.y}px`, width: `${line.length}px`, transform: `rotate(${line.angle}deg)` }"></view>
              </view>
              <view class="radar-points">
                <view v-for="(point, index) in radarPoints" :key="'point-'+index" class="radar-point" :style="{ left: `${point.x}px`, top: `${point.y}px` }">
                  <view class="point-inner" :style="{ backgroundColor: radarConfig.axes[index].color }"></view>
                </view>
              </view>
            </view>

            <view class="radar-legend">
              <view class="legend-item" v-for="item in radarLegend" :key="item.key">
                <view class="legend-box" :style="{ backgroundColor: item.color }"></view>
                <text class="legend-text">{{ item.key }} <text class="legend-val" :style="{ color: item.color }">{{ Math.round(item.value) }}</text></text>
              </view>
            </view>
          </view>
        </view>

        <view class="action-section">
          <view class="modern-btn" @click="generatePoster" hover-class="modern-btn-hover">
            <text class="btn-emoji">✨</text>
            <text class="btn-text">生成成就海报</text>
          </view>
        </view>
      </view>
    </view>

    <canvas canvas-id="posterCanvas" class="offscreen-canvas"></canvas>

    <view class="poster-modal" :class="{ 'modal-show': showPosterModal }" @click="showPosterModal = false">
      <view class="poster-content" @click.stop>
        <image v-if="posterImageUrl" :src="posterImageUrl" class="poster-image" mode="widthFix"></image>
        <view v-else class="poster-loading">
          <view class="modern-spinner"></view>
          <text class="loading-text" style="color: #fff">绘制海报中...</text>
        </view>
        
        <view class="poster-actions" v-if="posterImageUrl">
          <view class="save-btn" @click="savePosterToAlbum">
            <text>保存至相册</text>
          </view>
          <text class="close-text" @click="showPosterModal = false">关闭预览</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance, nextTick } from 'vue';

const isLoading = ref(true);
const archiveData = ref(null);
const showPosterModal = ref(false);
const posterImageUrl = ref('');
const instance = getCurrentInstance();

const animatedStats = ref({ read: 0, video: 0, homework: 0, extra: 0 });

// 配色升级：主色为略微柔和的绛红，其他维度颜色对应调节
const radarConfig = {
  centerX: 150, centerY: 150, radius: 95,
  axes: [
    { key: 'read', angle: -90, color: '#a33336' },
    { key: 'video', angle: 0, color: '#4a7c59' },
    { key: 'homework', angle: 90, color: '#d48a3f' },
    { key: 'extra', angle: 180, color: '#7a6b61' }
  ]
};

// 动态比例尺核心算法
const maxStatValue = computed(() => {
  if (!archiveData.value || !archiveData.value.radarStats) return 10;
  const vals = Object.values(archiveData.value.radarStats);
  const max = Math.max(...vals, 0);
  if (max === 0) return 4;
  if (max <= 4) return 4;
  if (max <= 10) return 10;
  if (max <= 50) return Math.ceil(max / 10) * 10;
  if (max <= 100) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / magnitude) * magnitude;
});

// UI计算属性
const radarWebs = computed(() => {
  return [0.25, 0.5, 0.75, 1].map(scale => {
    const points = radarConfig.axes.map(axis => {
      const angle = axis.angle * Math.PI / 180;
      const x = radarConfig.centerX + Math.cos(angle) * radarConfig.radius * scale;
      const y = radarConfig.centerY + Math.sin(angle) * radarConfig.radius * scale;
      return `${x}px ${y}px`;
    });
    return { style: { clipPath: `polygon(${points.join(', ')})` } };
  });
});

const radarLegend = computed(() => radarConfig.axes.map(a => ({ key: a.key, value: archiveData.value?.radarStats[a.key] || 0, color: a.color })));

const radarPoints = computed(() => radarConfig.axes.map(axis => {
  const value = animatedStats.value[axis.key] || 0;
  const dist = (value / maxStatValue.value) * radarConfig.radius;
  return {
    key: axis.key,
    x: radarConfig.centerX + Math.cos(axis.angle * Math.PI / 180) * dist,
    y: radarConfig.centerY + Math.sin(axis.angle * Math.PI / 180) * dist,
    value: value
  };
}));

const polygonStyle = computed(() => ({ clipPath: `polygon(${radarPoints.value.map(p => `${p.x}px ${p.y}px`).join(', ')})` }));

const radarLines = computed(() => {
  const pts = radarPoints.value;
  if (pts.length === 0) return [];
  return pts.map((p1, i) => {
    const p2 = pts[(i + 1) % pts.length];
    return { x: p1.x, y: p1.y, length: Math.hypot(p2.x - p1.x, p2.y - p1.y), angle: Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI) };
  });
});

// 动画执行
const runEntryAnimation = (targetStats) => {
  const duration = 800, startTime = Date.now();
  const animate = () => {
    const progress = Math.min((Date.now() - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    radarConfig.axes.forEach(axis => animatedStats.value[axis.key] = (targetStats[axis.key] || 0) * ease);
    if (progress < 1) setTimeout(animate, 16);
    else animatedStats.value = { ...targetStats };
  };
  animate();
};

const fetchArchiveData = () => {
  isLoading.value = true;
  setTimeout(() => {
    archiveData.value = {
      avgCompletionRate: 100,
      radarStats: { extra: 0, homework: 1, read: 2, video: 1 },
      totalCamps: 1, totalCertificates: 0
    };
    runEntryAnimation(archiveData.value.radarStats);
    isLoading.value = false;
  }, 500);
};

// ================= 海报生成逻辑 (适配新版UI) =================
// 辅助函数：绘制圆角矩形
const drawRoundRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
};

const generatePoster = async () => {
  showPosterModal.value = true;
  posterImageUrl.value = ''; 
  await nextTick();
  
  const W = 375;
  const H = 812;
  const ctx = uni.createCanvasContext('posterCanvas', instance);

  // 1. 背景 (温暖的米白色)
  ctx.setFillStyle('#f8f6f0');
  ctx.fillRect(0, 0, W, H);

  // 2. 顶部红底圆角卡片
  ctx.setFillStyle('#a33336');
  drawRoundRect(ctx, 20, 24, W - 40, 110, 12);
  ctx.fill();

  ctx.setFillStyle('#ffffff');
  ctx.setTextAlign('center');
  ctx.setFontSize(22);
  ctx.fillText('学如不及，犹恐失之', W / 2, 75);
  ctx.setFontSize(14);
  ctx.setFillStyle('rgba(255,255,255,0.7)');
  ctx.fillText('—— 《论语》 ——', W / 2, 105);

  // 3. 数据概览白底卡片
  const statsY = 160;
  ctx.setFillStyle('#ffffff');
  drawRoundRect(ctx, 20, statsY, W - 40, 90, 12);
  ctx.setShadow(0, 4, 16, 'rgba(0,0,0,0.03)');
  ctx.fill();
  ctx.setShadow(0, 0, 0, 'transparent'); // 清除阴影

  ctx.setFillStyle('#332d29');
  ctx.setTextAlign('center');
  
  ctx.setFontSize(26);
  ctx.fillText(archiveData.value.totalCamps.toString(), W/6 + 10, statsY + 45);
  ctx.fillText(archiveData.value.totalCertificates.toString(), W/2, statsY + 45);
  ctx.fillText(archiveData.value.avgCompletionRate.toString() + '%', W*5/6 - 10, statsY + 45);

  ctx.setFontSize(12);
  ctx.setFillStyle('#8b7f77');
  ctx.fillText('参与营期', W/6 + 10, statsY + 70);
  ctx.fillText('获得证书', W/2, statsY + 70);
  ctx.fillText('平均进度', W*5/6 - 10, statsY + 70);

  // 4. 雷达图背景卡片
  const rCardY = 270;
  ctx.setFillStyle('#ffffff');
  drawRoundRect(ctx, 20, rCardY, W - 40, 400, 12);
  ctx.setShadow(0, 4, 20, 'rgba(0,0,0,0.03)');
  ctx.fill();
  ctx.setShadow(0, 0, 0, 'transparent');

  // 雷达图绘制
  const rX = W / 2;
  const rY = rCardY + 180;
  const rRadius = 100;
  const maxVal = maxStatValue.value;
  const stats = archiveData.value.radarStats;

  ctx.setStrokeStyle('#e8e4db');
  ctx.setLineWidth(1);
  [0.25, 0.5, 0.75, 1].forEach((scale, idx) => {
    ctx.setFillStyle(idx % 2 === 0 ? 'rgba(240, 237, 230, 0.3)' : 'rgba(240, 237, 230, 0.6)');
    ctx.beginPath();
    radarConfig.axes.forEach((axis, i) => {
      const angle = axis.angle * Math.PI / 180;
      const x = rX + Math.cos(angle) * rRadius * scale;
      const y = rY + Math.sin(angle) * rRadius * scale;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // 轴线
  ctx.beginPath();
  radarConfig.axes.forEach(axis => {
    const angle = axis.angle * Math.PI / 180;
    ctx.moveTo(rX, rY);
    ctx.lineTo(rX + Math.cos(angle) * rRadius, rY + Math.sin(angle) * rRadius);
  });
  ctx.stroke();

  // 数据多边形
  ctx.beginPath();
  const rPoints = radarConfig.axes.map((axis, i) => {
    const val = stats[axis.key] || 0;
    const angle = axis.angle * Math.PI / 180;
    const dist = (val / maxVal) * rRadius;
    const x = rX + Math.cos(angle) * dist;
    const y = rY + Math.sin(angle) * dist;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    return { x, y, color: axis.color };
  });
  ctx.closePath();
  ctx.setFillStyle('rgba(163, 51, 54, 0.2)');
  ctx.fill();
  ctx.setStrokeStyle('#a33336');
  ctx.setLineWidth(2);
  ctx.stroke();

  // 数据圆点
  rPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
    ctx.setFillStyle(p.color);
    ctx.fill();
    ctx.setStrokeStyle('#ffffff');
    ctx.setLineWidth(2);
    ctx.stroke();
  });

  // 雷达文字标签
  radarConfig.axes.forEach(axis => {
    const angle = axis.angle * Math.PI / 180;
    const x = rX + Math.cos(angle) * (rRadius + 28);
    const y = rY + Math.sin(angle) * (rRadius + 20);
    ctx.setTextAlign('center');
    ctx.setFontSize(14);
    ctx.setFillStyle('#332d29');
    ctx.fillText(axis.key, x, y - 5);
    ctx.setFontSize(12);
    ctx.setFillStyle(axis.color);
    ctx.fillText(`(${stats[axis.key] || 0})`, x, y + 12);
  });

  // 5. 底部装饰
  const bottomY = 730;
  ctx.setFillStyle('#a33336');
  drawRoundRect(ctx, W/2 - 35, bottomY - 15, 70, 30, 6);
  ctx.fill();
  ctx.setFillStyle('#ffffff');
  ctx.setFontSize(12);
  ctx.setTextAlign('center');
  ctx.fillText('成就印记', W/2, bottomY + 4);

  // 导出
  ctx.draw(false, () => {
    setTimeout(() => {
      uni.canvasToTempFilePath({
        canvasId: 'posterCanvas',
        destWidth: W * 3, destHeight: H * 3,
        success: (res) => { posterImageUrl.value = res.tempFilePath; },
        fail: () => { uni.showToast({ title: '海报生成失败', icon: 'none' }); }
      }, instance);
    }, 200);
  });
};

const savePosterToAlbum = () => {
  if (!posterImageUrl.value) return;
  uni.saveImageToPhotosAlbum({
    filePath: posterImageUrl.value,
    success: () => {
      uni.showToast({ title: '已保存至相册', icon: 'success' });
      showPosterModal.value = false;
    },
    fail: () => { uni.showToast({ title: '保存失败或无权限', icon: 'none' }); }
  });
};

onMounted(() => { fetchArchiveData(); });
</script>

<style lang="scss" scoped>
/* 基础配色与布局 */
.page-container {
  min-height: 100vh;
  background-color: #f8f6f0; 
  color: #332d29;
  box-sizing: border-box;
}

.content-wrapper { padding: 24rpx 30rpx; }

/* 基础动画 */
.fade-in { animation: fadeIn 0.6s ease-out; }
.slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30rpx); } to { opacity: 1; transform: translateY(0); } }

/* 卷首语 (现代圆角 + 柔和渐变) */
.motto-card {
  position: relative;
  background: linear-gradient(135deg, #a33336, #872528);
  border-radius: 24rpx;
  padding: 46rpx 20rpx;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 24rpx rgba(163, 51, 54, 0.15);
  overflow: hidden;
}
.motto-bg-pattern {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10rpx, rgba(255,255,255,0.03) 10rpx, rgba(255,255,255,0.03) 20rpx);
}
.motto-text { font-size: 38rpx; color: #fff; font-weight: 600; letter-spacing: 4rpx; margin-bottom: 12rpx; z-index: 1; }
.motto-sub { font-size: 24rpx; color: rgba(255, 255, 255, 0.8); letter-spacing: 2rpx; z-index: 1; }

/* 加载态 */
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; gap: 20rpx; }
.modern-spinner { width: 44rpx; height: 44rpx; border: 4rpx solid rgba(163, 51, 54, 0.15); border-top-color: #a33336; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.loading-text { font-size: 26rpx; color: #8b7f77; }

/* 概览数据卡片 (白底 + 阴影 + 小图标) */
.overview-card {
  display: flex; align-items: center; justify-content: space-between;
  background-color: #fff; border-radius: 24rpx; padding: 36rpx 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03); margin-bottom: 36rpx;
}
.overview-item { display: flex; align-items: center; gap: 16rpx; flex: 1; justify-content: center; }

/* 柔和的图标底色背景 */
.icon-circle { width: 64rpx; height: 64rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.read-bg { background-color: rgba(163, 51, 54, 0.08); }
.cert-bg { background-color: rgba(212, 138, 63, 0.1); }
.time-bg { background-color: rgba(74, 124, 89, 0.1); }
.emoji { font-size: 30rpx; }

.overview-info { display: flex; flex-direction: column; }
.overview-value { font-size: 36rpx; font-weight: 700; color: #332d29; line-height: 1.2; font-family: -apple-system, sans-serif; }
.unit { font-size: 22rpx; margin-left: 4rpx; color: #8b7f77; font-weight: normal; }
.overview-label { font-size: 22rpx; color: #8b7f77; }
.overview-divider { width: 1px; height: 50rpx; background-color: #eee; }

/* 雷达区块 */
.radar-section { margin-bottom: 40rpx; }
.section-header { margin-bottom: 24rpx; padding-left: 10rpx; border-left: 8rpx solid #a33336; border-radius: 4rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #332d29; }

.radar-card { background-color: #fff; border-radius: 24rpx; padding: 50rpx 20rpx 40rpx; box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03); }

/* 雷达核心画板 */
.radar-canvas-wrapper { position: relative; width: 300px; height: 300px; margin: 0 auto 50rpx; }

.radar-bg-webs, .radar-polygon-wrapper, .radar-points { position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
.radar-web-polygon { position: absolute; width: 100%; height: 100%; background-color: rgba(240, 237, 230, 0.3); border: 1px solid rgba(230, 225, 215, 0.6); }
.radar-web-polygon:nth-child(even) { background-color: rgba(240, 237, 230, 0.6); }
.radar-axis-line { position: absolute; height: 1px; background-color: rgba(200, 194, 184, 0.5); transform-origin: left center; }

/* 文本标签 */
.radar-axes-labels { position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
.radar-axis-label { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; }
.label-key { font-size: 24rpx; color: #332d29; font-weight: 500; font-family: -apple-system, sans-serif; }
.label-val { font-size: 24rpx; font-weight: bold; margin-top: 4rpx; font-family: -apple-system, sans-serif;}

/* 数据多边形 */
.radar-polygon-fill { width: 100%; height: 100%; background: rgba(163, 51, 54, 0.15); transition: clip-path 0.2s ease-out; }
.radar-polygon-stroke { position: absolute; height: 2px; background-color: #a33336; transform-origin: left center; box-shadow: 0 2rpx 4rpx rgba(163, 51, 54, 0.2); }

/* 数据点位 (精致带边框) */
.radar-point { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; z-index: 10; }
.point-inner { width: 14rpx; height: 14rpx; border-radius: 50%; border: 4rpx solid #fff; box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1); }

/* 底部图例 (恢复小圆角矩形) */
.radar-legend { display: flex; justify-content: center; gap: 32rpx; flex-wrap: wrap; padding: 0 10rpx; }
.legend-item { display: flex; align-items: center; gap: 10rpx; }
.legend-box { width: 18rpx; height: 18rpx; border-radius: 4rpx; }
.legend-text { font-size: 24rpx; color: #5c534c; font-family: -apple-system, sans-serif; }
.legend-val { font-weight: bold; margin-left: 4rpx; }

/* 生成海报按钮 (现代胶囊型) */
.action-section { display: flex; justify-content: center; padding: 10rpx 0 30rpx; }
.modern-btn { 
  display: flex; align-items: center; gap: 12rpx; 
  background: #332d29; border-radius: 100rpx; 
  padding: 26rpx 64rpx; 
  box-shadow: 0 8rpx 20rpx rgba(51, 45, 41, 0.2); transition: all 0.2s; 
}
.modern-btn-hover { opacity: 0.9; transform: translateY(2rpx); box-shadow: 0 4rpx 10rpx rgba(51, 45, 41, 0.15); }
.btn-emoji { font-size: 28rpx; }
.btn-text { font-size: 30rpx; color: #fff; font-weight: 500; letter-spacing: 2rpx; }

/* ================= 海报弹窗样式 ================= */
.offscreen-canvas { position: fixed; left: -9999px; top: -9999px; width: 375px; height: 812px; }

.poster-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0,0,0.75); z-index: 999; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; backdrop-filter: blur(5px); }
.poster-modal.modal-show { opacity: 1; pointer-events: auto; }

.poster-content { display: flex; flex-direction: column; align-items: center; width: 78%; max-width: 320px; }
.poster-image { width: 100%; border-radius: 16rpx; box-shadow: 0 20rpx 50rpx rgba(0,0,0,0.3); margin-bottom: 40rpx; display: block; }

.poster-loading { display: flex; flex-direction: column; align-items: center; gap: 20rpx; padding: 100rpx 0; }
.poster-loading .modern-spinner { border-color: rgba(255,255,255,0.2); border-top-color: #fff; }

.poster-actions { display: flex; flex-direction: column; align-items: center; gap: 24rpx; width: 100%; }
.save-btn { width: 100%; background-color: #a33336; color: #fff; text-align: center; padding: 26rpx 0; border-radius: 100rpx; font-size: 30rpx; letter-spacing: 2rpx; font-weight: 500; box-shadow: 0 8rpx 20rpx rgba(163, 51, 54, 0.3); }
.close-text { color: rgba(255,255,255,0.7); font-size: 26rpx; padding: 10rpx; }
</style>