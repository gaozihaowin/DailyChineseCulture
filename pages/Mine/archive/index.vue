<template>
  <view class="page-container">
    <NavBar title="修习档案" />

    <view class="page-header">
      <view class="motto-card">
        <text class="motto-text">学如不及，犹恐失之</text>
        <text class="motto-sub">——《论语》</text>
      </view>
    </view>

    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载修习档案...</text>
    </view>

    <view v-else-if="archiveData" class="content-wrapper">
      <view class="overview-section">
        <view class="overview-card">
          <view class="overview-item">
            <view class="overview-icon-wrap">
              <image src="https://img.icons8.com/fluency/48/graduation-cap.png" mode="aspectFit" class="overview-icon"></image>
            </view>
            <view class="overview-info">
              <text class="overview-value">{{ archiveData.totalCamps || 0 }}</text>
              <text class="overview-label">参与营期</text>
            </view>
          </view>

          <view class="overview-divider"></view>

          <view class="overview-item">
            <view class="overview-icon-wrap">
              <image src="https://img.icons8.com/fluency/48/diploma.png" mode="aspectFit" class="overview-icon"></image>
            </view>
            <view class="overview-info">
              <text class="overview-value">{{ archiveData.totalCertificates || 0 }}</text>
              <text class="overview-label">获得证书</text>
            </view>
          </view>

          <view class="overview-divider"></view>

          <view class="overview-item">
            <view class="overview-icon-wrap">
              <image src="https://img.icons8.com/fluency/48/speed.png" mode="aspectFit" class="overview-icon"></image>
            </view>
            <view class="overview-info">
              <text class="overview-value">{{ archiveData.avgCompletionRate || 0 }}%</text>
              <text class="overview-label">平均进度</text>
            </view>
          </view>
        </view>
      </view>

      <view class="radar-section">
        <view class="section-header">
          <view class="section-line"></view>
          <text class="section-title">修习雷达</text>
        </view>

        <view class="radar-card">
          <view class="radar-canvas-wrapper">
            <view class="radar-bg">
              <view
                v-for="(ring, ringIndex) in radarRings"
                :key="ringIndex"
                class="radar-ring"
              ></view>
            </view>

            <view class="radar-axes">
              <view
                v-for="(axis, axisIndex) in radarAxes"
                :key="axisIndex"
                class="radar-axis"
              >
                <view class="axis-line" :style="{ transform: `rotate(${axis.angle}deg)` }"></view>
                <text class="axis-label" :style="{ transform: `rotate(${axis.angle + 90}deg)` }">{{ axis.label }}</text>
              </view>
            </view>

            <view class="radar-polygon-wrapper">
              <view
                class="radar-polygon-fill"
                :style="polygonStyle"
              ></view>
              <view class="radar-polygon-stroke" :style="polygonStyle"></view>
            </view>

            <view class="radar-points">
              <view
                v-for="(point, pointIndex) in radarPoints"
                :key="pointIndex"
                class="radar-point"
                :style="{
                  left: point.x + 'px',
                  top: point.y + 'px'
                }"
              >
                <view class="point-inner"></view>
                <view class="point-label">{{ point.value }}</view>
              </view>
            </view>
          </view>

          <view class="radar-legend">
            <view class="legend-item" v-for="item in radarLegend" :key="item.key">
              <view class="legend-color-bar" :style="{ backgroundColor: item.color }"></view>
              <text class="legend-text">{{ item.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="action-section">
        <view class="seal-btn" @click="handleShare">
          <view class="seal-ornament left"></view>
          <view class="seal-content">
            <image src="https://img.icons8.com/fluency/24/share.png" mode="aspectFit" class="seal-icon"></image>
            <text class="seal-text">生成成就海报</text>
          </view>
          <view class="seal-ornament right"></view>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <image class="empty-icon" src="https://img.icons8.com/fluency/200/museum.png" mode="aspectFit"></image>
      <text class="empty-title">暂无修习档案</text>
      <text class="empty-desc">参与课程学习后，这里将展示您的成就</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { API_CONFIG } from '@/api/config.js';

const isLoading = ref(true);
const archiveData = ref(null);

const radarConfig = {
  centerX: 130,
  centerY: 130,
  radius: 90,
  axes: [
    { key: 'READ', label: '经典诵读', angle: -90, color: '#a83235' },
    { key: 'VIDEO', label: '导师解惑', angle: -18, color: '#4a7c59' },
    { key: 'HOMEWORK', label: '笃行作业', angle: 54, color: '#7a5c1e' },
    { key: 'EXTRA', label: '见贤拓展', angle: 126, color: '#8b6b61' }
  ]
};

const radarRings = [0.25, 0.5, 0.75, 1];

const radarAxes = radarConfig.axes;

const radarLegend = computed(() => {
  if (!archiveData.value || !archiveData.value.radarStats) return [];

  const stats = archiveData.value.radarStats;

  return radarConfig.axes.map(axis => ({
    key: axis.key,
    label: axis.label,
    value: stats[axis.key] || 0,
    color: axis.color
  }));
});

const radarPoints = computed(() => {
  if (!archiveData.value || !archiveData.value.radarStats) return [];

  const stats = archiveData.value.radarStats;

  return radarConfig.axes.map(axis => {
    const value = stats[axis.key] || 0;
    const angle = axis.angle * Math.PI / 180;
    const distance = (value / 100) * radarConfig.radius;
    return {
      key: axis.key,
      x: radarConfig.centerX + Math.cos(angle) * distance,
      y: radarConfig.centerY + Math.sin(angle) * distance,
      value: value
    };
  });
});

const polygonStyle = computed(() => {
  const points = radarPoints.value;
  if (points.length === 0) return {};

  const cx = radarConfig.centerX;
  const cy = radarConfig.centerY;

  const path = points.map((point, index) => {
    return `${point.x}px ${point.y}px`;
  }).join(', ');

  return {
    clipPath: `polygon(${path})`
  };
});

const fetchArchiveData = async () => {
  try {
    isLoading.value = true;

    const token = uni.getStorageSync('token');
    const res = await new Promise((resolve, reject) => {
      uni.request({
        url: API_CONFIG.baseUrl + API_CONFIG.paths.studyArchive,
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        success: resolve,
        fail: reject
      });
    });

    const apiData = res.data;

    if (apiData.code === 200 && apiData.data) {
      archiveData.value = apiData.data;
    } else {
      uni.showToast({
        title: apiData.message || '获取修习档案失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取修习档案失败:', error);
    uni.showToast({
      title: '网络连接异常',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
};

const handleShare = () => {
  uni.showToast({
    title: '海报功能开发中',
    icon: 'none'
  });
};

onMounted(() => {
  fetchArchiveData();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f4f1eb;
  padding: 24rpx 30rpx;
}

.page-header {
  margin-bottom: 30rpx;
}

.motto-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36rpx 40rpx;
  background: linear-gradient(135deg, #9e2a2b, #a83235);
  border-radius: 24rpx;
  position: relative;
  overflow: hidden;
}

.motto-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10rpx,
    rgba(255, 255, 255, 0.03) 10rpx,
    rgba(255, 255, 255, 0.03) 20rpx
  );
}

.motto-text {
  font-size: 36rpx;
  color: #fdfaf6;
  font-weight: 600;
  letter-spacing: 6rpx;
  margin-bottom: 10rpx;
  position: relative;
  z-index: 1;
}

.motto-sub {
  font-size: 24rpx;
  color: rgba(253, 250, 246, 0.7);
  position: relative;
  z-index: 1;
}

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 12rpx;
}

.loading-spinner {
  width: 56rpx;
  height: 56rpx;
  border: 4rpx solid rgba(158, 42, 43, 0.1);
  border-top: 4rpx solid #9e2a2b;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text,
.empty-desc {
  font-size: 26rpx;
  color: #8b7365;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  opacity: 0.6;
  margin-bottom: 20rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #4a3728;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.overview-section {
  margin-bottom: 30rpx;
}

.overview-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fdfaf6;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  border: 1rpx solid #ebe5dc;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  justify-content: center;
}

.overview-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f6f1;
  border-radius: 16rpx;
}

.overview-icon {
  width: 36rpx;
  height: 36rpx;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.overview-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #3d2f1e;
  line-height: 1;
}

.overview-label {
  font-size: 22rpx;
  color: #8b7365;
}

.overview-divider {
  width: 1rpx;
  height: 60rpx;
  background-color: #e8e4db;
}

.radar-section {
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-line {
  width: 8rpx;
  height: 32rpx;
  background: linear-gradient(180deg, #a83235, #7a5c1e);
  border-radius: 4rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #3d2f1e;
}

.radar-card {
  background-color: #fdfaf6;
  border-radius: 20rpx;
  padding: 32rpx;
  border: 1rpx solid #ebe5dc;
}

.radar-canvas-wrapper {
  position: relative;
  width: 260px;
  height: 260px;
  margin: 0 auto 32rpx;
}

.radar-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
}

.radar-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 1rpx solid #e8dcc4;
  border-radius: 50%;

  &:nth-child(1) { transform: translate(-50%, -50%) scale(0.25); }
  &:nth-child(2) { transform: translate(-50%, -50%) scale(0.5); }
  &:nth-child(3) { transform: translate(-50%, -50%) scale(0.75); }
  &:nth-child(4) { transform: translate(-50%, -50%) scale(1); }
}

.radar-axes {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
}

.radar-axis {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 1rpx;
  transform-origin: left center;
}

.axis-line {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 1rpx;
  background-color: #e8dcc4;
}

.axis-label {
  position: absolute;
  left: calc(100% + 8rpx);
  top: 50%;
  transform: translateY(-50%);
  font-size: 22rpx;
  color: #5c4d3d;
  font-weight: 500;
  white-space: nowrap;
}

.radar-polygon-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
}

.radar-polygon-fill {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(122, 92, 30, 0.12);
}

.radar-polygon-stroke {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2rpx solid #a83235;
}

.radar-points {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
}

.radar-point {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.point-inner {
  width: 14rpx;
  height: 14rpx;
  background-color: #4a7c59;
  border-radius: 50%;
  border: 3rpx solid #fdfaf6;
  box-shadow: 0 2rpx 8rpx rgba(74, 124, 89, 0.3);
}

.point-label {
  font-size: 20rpx;
  color: #4a7c59;
  font-weight: 600;
  margin-top: 4rpx;
}

.radar-legend {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-color-bar {
  width: 24rpx;
  height: 6rpx;
  border-radius: 3rpx;
}

.legend-text {
  font-size: 24rpx;
  color: #5c4d3d;
}

.action-section {
  margin-top: 20rpx;
}

.seal-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fdfaf6;
  border-radius: 16rpx;
  padding: 28rpx 40rpx;
  border: 2rpx solid #e8dcc4;
  position: relative;
}

.seal-ornament {
  width: 24rpx;
  height: 48rpx;
  background: linear-gradient(180deg, #e8dcc4, #d4c8b4);
  border-radius: 4rpx;

  &.left {
    border-right: 1rpx solid #d4c8b4;
    border-radius: 4rpx 0 0 4rpx;
  }

  &.right {
    border-left: 1rpx solid #d4c8b4;
    border-radius: 0 4rpx 4rpx 0;
  }
}

.seal-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 32rpx;
}

.seal-icon {
  width: 36rpx;
  height: 36rpx;
}

.seal-text {
  font-size: 30rpx;
  color: #5c4d3d;
  font-weight: 600;
  letter-spacing: 2rpx;
}
</style>
