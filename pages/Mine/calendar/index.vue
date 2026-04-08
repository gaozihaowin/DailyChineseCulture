<template>
  <view class="page-container">
    <NavBar title="笃行日历" />

    <view class="month-header">
      <view class="month-nav" @click="prevMonth">
        <uni-icons type="left" size="20" color="#5c4d3d"></uni-icons>
      </view>
      <view class="month-title">
        <text class="month-text">{{ currentYear }}年{{ currentMonth }}月</text>
      </view>
      <view class="month-nav" @click="nextMonth">
        <uni-icons type="right" size="20" color="#5c4d3d"></uni-icons>
      </view>
    </view>

    <view class="calendar-container">
      <view class="weekday-header">
        <text class="weekday-text" v-for="day in weekDays" :key="day">{{ day }}</text>
      </view>

      <view v-if="isLoading" class="loading-container">
        <view class="loading-spinner"></view>
      </view>

      <view v-else class="calendar-grid">
        <view
          class="calendar-row"
          v-for="(row, rowIndex) in calendarRows"
          :key="rowIndex"
        >
          <view
            class="calendar-cell"
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            :class="getCellClass(cell)"
            @click="onCellClick(cell)"
          >
            <view v-if="cell.day > 0" class="cell-content">
              <text class="day-number">{{ cell.day }}</text>
              <view v-if="cell.isAllCompleted === 1" class="cell-seal">
                <text class="seal-text">满</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="legend-container">
      <view class="legend-item">
        <view class="legend-dot dot-empty"></view>
        <text class="legend-label">无任务</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot dot-low"></view>
        <text class="legend-label">1-50%</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot dot-mid"></view>
        <text class="legend-label">51-99%</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot dot-full"></view>
        <text class="legend-label">100%</text>
      </view>
    </view>

    <uni-popup ref="dayPopup" type="bottom" background-color="#fff" border-radius="24rpx 24rpx 0 0">
      <view class="popup-content" v-if="selectedDay">
        <view class="popup-header">
          <text class="popup-title">{{ selectedDay.date }}</text>
          <view class="popup-close" @click="closePopup">
            <uni-icons type="closeempty" size="20" color="#9ca3af"></uni-icons>
          </view>
        </view>
        <view class="popup-body">
          <view class="rate-display">
            <view class="rate-circle" :class="getRateClass(selectedDay.completionRate)">
              <text class="rate-number">{{ selectedDay.completionRate || 0 }}%</text>
            </view>
            <text class="rate-label">当日完成率</text>
          </view>
          <view class="status-text" v-if="selectedDay.isAllCompleted === 1">
            <uni-icons type="checkmarkempty" size="18" color="#4a7c59"></uni-icons>
            <text class="status-desc">今日任务全部完成，继续精进！</text>
          </view>
          <view class="status-text" v-else-if="selectedDay.completionRate > 0">
            <uni-icons type="circle" size="18" color="#d4af37"></uni-icons>
            <text class="status-desc">笃行路上，继续努力！</text>
          </view>
          <view class="status-text" v-else>
            <uni-icons type="minus" size="18" color="#a09080"></uni-icons>
            <text class="status-desc">今日暂无任务安排</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { API_CONFIG } from '@/api/config.js';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);
const heatmapData = ref({});
const isLoading = ref(false);
const selectedDay = ref(null);
const dayPopup = ref(null);

const calendarRows = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: 0, date: '' });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayData = heatmapData.value[dateStr] || { completionRate: null, isAllCompleted: 0 };
    cells.push({
      day: d,
      date: dateStr,
      completionRate: dayData.completionRate,
      isAllCompleted: dayData.isAllCompleted
    });
  }

  const remainder = cells.length % 7;
  if (remainder > 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      cells.push({ day: 0, date: '' });
    }
  }

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return rows;
});

const getCellClass = (cell) => {
  if (cell.day === 0) return 'cell-empty';

  const rate = cell.completionRate;

  if (rate === null || rate === undefined) return 'cell-none';
  if (rate === 0) return 'cell-none';
  if (rate >= 100 || cell.isAllCompleted === 1) return 'cell-full';
  if (rate >= 51) return 'cell-mid';
  return 'cell-low';
};

const getRateClass = (rate) => {
  if (!rate || rate === 0) return 'rate-none';
  if (rate >= 100) return 'rate-full';
  if (rate >= 51) return 'rate-mid';
  return 'rate-low';
};

const fetchHeatmapData = async (year, month) => {
  try {
    isLoading.value = true;

    const token = uni.getStorageSync('token');
    const res = await new Promise((resolve, reject) => {
      uni.request({
        url: API_CONFIG.baseUrl + API_CONFIG.paths.dailyHeatmap,
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: { year, month },
        success: resolve,
        fail: reject
      });
    });

    const apiData = res.data;

    if (apiData.code === 200 && apiData.data) {
      const dataMap = {};
      (apiData.data || []).forEach(item => {
        dataMap[item.date] = {
          completionRate: item.completionRate,
          isAllCompleted: item.isAllCompleted
        };
      });
      heatmapData.value = dataMap;
    }
  } catch (error) {
    console.error('获取热力图数据失败:', error);
    uni.showToast({ title: '网络连接异常', icon: 'none' });
  } finally {
    isLoading.value = false;
  }
};

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  const now = new Date();
  const currentYearNum = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  if (currentYear.value < currentYearNum) {
    currentMonth.value++;
    if (currentMonth.value > 12) {
      currentMonth.value = 1;
      currentYear.value++;
    }
  } else if (currentYear.value === currentYearNum && currentMonth.value < currentMonthNum) {
    currentMonth.value++;
  }
};

const onCellClick = (cell) => {
  if (cell.day === 0) return;

  selectedDay.value = {
    date: cell.date,
    completionRate: cell.completionRate || 0,
    isAllCompleted: cell.isAllCompleted
  };
  dayPopup.value.open();
};

const closePopup = () => {
  dayPopup.value.close();
};

watch([currentYear, currentMonth], ([newYear, newMonth]) => {
  fetchHeatmapData(newYear, newMonth);
});

onMounted(() => {
  fetchHeatmapData(currentYear.value, currentMonth.value);
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f4f1eb;
  padding: 24rpx 30rpx;
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
  padding: 20rpx 30rpx;
  background-color: #fdfaf6;
  border-radius: 20rpx;
}

.month-nav {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f1eb;
  border-radius: 50%;
}

.month-title {
  flex: 1;
  display: flex;
  justify-content: center;
}

.month-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #3d2f1e;
}

.calendar-container {
  background-color: #fdfaf6;
  border-radius: 20rpx;
  padding: 24rpx;
}

.weekday-header {
  display: flex;
  margin-bottom: 16rpx;
}

.weekday-text {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #8b7365;
  font-weight: 500;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 0;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid rgba(158, 42, 43, 0.1);
  border-top: 4rpx solid #9e2a2b;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.calendar-row {
  display: flex;
  gap: 8rpx;
}

.calendar-cell {
  flex: 1;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  min-height: 64rpx;
}

.cell-empty {
  background-color: transparent;
}

.cell-none {
  background-color: #fdfaf6;
  border: 1rpx solid #ebe8e4;
}

.cell-low {
  background-color: #e8dcc4;
}

.cell-mid {
  background-color: #d4af37;
}

.cell-full {
  background-color: #a83235;
}

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
}

.day-number {
  font-size: 24rpx;
  color: #5c4d3d;
}

.cell-full .day-number {
  color: #ffffff;
}

.cell-seal {
  width: 28rpx;
  height: 28rpx;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seal-text {
  font-size: 16rpx;
  color: #ffffff;
  font-weight: 600;
}

.legend-container {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #fdfaf6;
  border-radius: 16rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 6rpx;
}

.dot-empty {
  background-color: #fdfaf6;
  border: 1rpx solid #ebe8e4;
}

.dot-low {
  background-color: #e8dcc4;
}

.dot-mid {
  background-color: #d4af37;
}

.dot-full {
  background-color: #a83235;
}

.legend-label {
  font-size: 22rpx;
  color: #8b7365;
}

.popup-content {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.popup-close {
  padding: 8rpx;
}

.popup-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  gap: 24rpx;
}

.rate-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.rate-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rate-none {
  background-color: #f4f1eb;
}

.rate-low {
  background-color: #e8dcc4;
}

.rate-mid {
  background-color: #d4af37;
}

.rate-full {
  background-color: #4a7c59;
}

.rate-number {
  font-size: 42rpx;
  font-weight: 700;
  color: #3d2f1e;
}

.rate-full .rate-number {
  color: #ffffff;
}

.rate-label {
  font-size: 26rpx;
  color: #8b7365;
}

.status-text {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.status-desc {
  font-size: 28rpx;
  color: #5c4d3d;
}
</style>
