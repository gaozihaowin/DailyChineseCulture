<template> 
  <scroll-view scroll-y class="page-scroll-container"> 
    <view class="view-container"> 
      <view class="art-header"> 
        <view class="nav-bar"> 
          <view class="back-btn" @tap="goBack">
            <view class="back-arrow"></view>
          </view>
          <view class="nav-brand"> 
            <text class="brand-en">ZHI LIANG ZHI</text> 
            <text class="brand-cn">作业统计</text> 
          </view> 
          <view style="width: 48rpx;"></view>
        </view> 
      </view> 

      <view class="content-wrapper"> 
        <!-- 管理范围选择 -->
        <view v-if="managementScopes.length > 0" class="section-box scope-selector"> 
          <view class="selector-title"> 
            {{ managementScopes.length > 1 ? '选择管理范围：' : '当前管理范围：' }} 
          </view> 
          
          <!-- 范围列表 -->
          <scroll-view v-if="filteredScopes.length > 1" class="scope-list" scroll-x> 
            <view 
              v-for="scope in filteredScopes" 
              :key="scope.assignmentId" 
              class="scope-item" 
              :class="{ active: selectedScope?.assignmentId === scope.assignmentId }" 
              @click="selectScope(scope)" 
            > 
              <view class="scope-duty">{{ scope.dutyType }}</view> 
              <view class="scope-target">{{ scope.fullName }}</view> 
            </view> 
          </scroll-view> 
          <view v-else class="scope-item active" v-if="selectedScope"> 
            <view class="scope-duty">{{ selectedScope.dutyType }}</view> 
            <view class="scope-target">{{ selectedScope.fullName }}</view> 
          </view> 
        </view> 

        <!-- 日期选择 -->
        <view v-if="managementScopes.length > 0" class="section-box calendar-section"> 
          <text class="section-title">作业日期：</text> 
          <picker mode="date" :value="selectedDate" start="2000-01-01" end="2026-12-31" @change="onDateChange"> 
            <view class="calendar-picker"> 
              <text class="picker-text">{{ formatDate(selectedDate) }}</text> 
              <text class="picker-arrow">▼</text> 
            </view> 
          </picker> 
        </view> 

        <!-- 搜索栏：移到日期选择下方，和评优页面格式一致 -->
        <view v-if="managementScopes.length > 0" class="section-box search-section">
          <view class="search-input-wrapper">
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="搜索大组名称"
              class="search-input"
              @input="handleSearch"
              confirm-type="search"
              @confirm="handleSearch"
            />
            <view v-if="searchKeyword" class="clear-btn" @tap="clearSearch">
              <text>×</text>
            </view>
          </view>
        </view>

        <!-- 统计数据 -->
        <view v-if="managementScopes.length > 0" class="section-box stats-container"> 
          <!-- 空数据提示 -->
          <view v-if="statistics.totalCount === 0" class="empty-tip">
            <text>暂无统计数据</text>
          </view>
          
          <!-- 有数据时显示统计卡片 -->
          <view v-else class="stats-grid"> 
            <view class="stats-card"> 
              <text class="stats-title">总人数</text> 
              <text class="stats-value">{{ statistics.totalCount }}</text> 
            </view> 
            <view class="stats-card"> 
              <text class="stats-title">已交（按时）</text> 
              <text class="stats-value completed">{{ statistics.completedCount }}</text> 
            </view> 
            <view class="stats-card"> 
              <text class="stats-title">未交</text> 
              <text class="stats-value pending">{{ statistics.pendingCount }}</text> 
            </view> 
            <view class="stats-card"> 
              <text class="stats-title">迟交</text> 
              <text class="stats-value late">{{ statistics.lateCount }}</text> 
            </view> 
            <view class="stats-card rate-card"> 
              <text class="stats-title">准时完成率</text> 
              <text class="stats-value rate">{{ statistics.completionRate }}%</text> 
            </view> 
          </view> 
        </view> 

        <!-- 饼状图区域 -->
        <view v-if="managementScopes.length > 0" class="section-box chart-container"> 
          <text class="selector-title">作业完成情况</text> 
          
          <!-- 饼状图 -->
          <view v-if="statistics.totalCount > 0" class="pie-chart"> 
            <canvas canvas-id="pieChart" style="width: 100%; height: 300rpx;"></canvas> 
          </view>
          
          <!-- 空数据提示 -->
          <view v-else class="empty-tip"> 
            <text>暂无统计数据</text> 
          </view>

          <!-- 查看详细名单按钮 -->
          <view v-if="statistics.totalCount > 0" class="detail-btn" @click="goToDetailList">
            <text class="btn-text">查看详细名单</text>
          </view>
        </view> 

        <!-- 无管理范围提示 -->
        <view v-if="managementScopes.length === 0" class="section-box empty-tip"> 
          <text>暂无管理范围权限</text> 
        </view> 

        <!-- 底部安全区占位 -->
        <view class="safe-area-spacer"></view> 
      </view> 
    </view> 
  </scroll-view> 
</template> 

<script> 
import { API_CONFIG } from '../../api/config'; 
export default { 
  name:'VolunteerStats', 
  data() { 
    return { 
      managementScopes: [], // 原始管理范围列表
      filteredScopes: [],   // 搜索过滤后的列表
      selectedScope: null, 
      selectedDate: new Date().toISOString().split('T')[0], 
      statistics: { 
        totalCount: 0, 
        completedCount: 0,  // 已交（按时）
        pendingCount: 0,    // 未交
        lateCount: 0,       // 迟交
        completionRate: 0   // 准时完成率
      },
      // 搜索相关
      searchKeyword: '',
      token: '', 
      isLoading: false ,
	  g:'',
	  h:'',
    }; 
  }, 
  mounted() {
    this.token = uni.getStorageSync('token');
    this.getManagementScopes();
    
    uni.$on('refreshVolunteerStats', () => {
      this.token = uni.getStorageSync('token');
      this.getManagementScopes();
    });
  },
  unmounted() {
    uni.$off('refreshVolunteerStats');
  },
  methods: { 
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    // 日期格式化 
    formatDate(dateStr) { 
      if (!dateStr) return ''; 
      const d = new Date(dateStr); 
      return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; 
    }, 
    
    // 日期选择变更 
    onDateChange(e) { 
      this.selectedDate = e.detail.value; 
      this.getStatistics(); 
    }, 

    // 搜索大组（参照评优页面逻辑）
    handleSearch() {
      const keyword = this.searchKeyword.trim().toLowerCase();
      if (!keyword) {
        this.filteredScopes = [...this.managementScopes];
        return;
      }
      
      // 过滤包含搜索关键词的大组
      this.filteredScopes = this.managementScopes.filter(scope => {
        return scope.fullName.toLowerCase().includes(keyword);
      });
    },
    
    // 清空搜索（新增）
    clearSearch() {
      this.searchKeyword = '';
      this.handleSearch();
    },
    
    // 获取管理范围 
    getManagementScopes() { 
      if (!this.token) return; 
      this.isLoading = true; 
      uni.request({ 
        url: `${API_CONFIG.baseUrl}${API_CONFIG.paths.getVolunteerScope}`, 
        header: { 
          'Authorization': `Bearer ${this.token}`, 
          'Content-Type': 'application/json' 
        }, 
        success: (res) => { 
          this.isLoading = false; 
          if (res.data?.code === 200) { 
            this.managementScopes = this.formatScopeData(res.data.data);
            this.filteredScopes = [...this.managementScopes]; // 初始化过滤列表
            // 有管理范围时默认选中第一个 
            if (this.managementScopes.length) { 
              this.selectedScope = this.managementScopes[0]; 
              this.getStatistics(); 
            } 
          } 
        }, 
        fail: () => { 
          this.isLoading = false; 
        } 
      }); 
    }, 
    
    // 格式化管理范围数据 
    formatScopeData(data) { 
      let scopes = []; 
      if (Array.isArray(data)) { 
        data.forEach(item => { 
          const targetType = item.targetType; 
          let type = targetType; 
          let id = null; 
          let dutyType = item.dutyType; 
          let fullName = ''; 
          
          // 获取营期名称 
          const campName = item.campName || ''; 
          
          // 根据目标类型获取ID和构建完整名称 
          if (targetType === 'class') { 
            id = item.classId || item.id; 
            fullName = campName ? campName + '-' + (item.className || item.name || '') : (item.className || item.name || ''); 
          } else if (targetType === 'big_group') { 
            id = item.bigGroupId || item.id; 
            const groupName = item.className ? item.className + '-' + (item.bigGroupName || item.name) : (item.bigGroupName || item.name || ''); 
            fullName = campName ? campName + '-' + groupName : groupName; 
            type = 'bigGroup'; // 转换为前端API需要的类型 
          } else if (targetType === 'small_group') { 
            id = item.smallGroupId || item.id; 
            const groupName = item.className ? item.className + '-' + (item.bigGroupName || '') + '-' + (item.smallGroupName || item.name) : (item.smallGroupName || item.name || ''); 
            fullName = campName ? campName + '-' + groupName : groupName; 
            type = 'smallGroup'; // 转换为前端API需要的类型 
          } 
          
          // 确保ID存在 
          if (id) { 
            scopes.push({ 
              assignmentId: item.assignmentId, 
              type: type, 
              id: id, 
              dutyType: dutyType, 
              fullName: fullName 
            }); 
          } 
        }); 
      } 
      return scopes; 
    }, 
    
    // 选择管理范围 
    selectScope(scope) { 
      this.selectedScope = scope; 
      this.getStatistics(); 
    }, 
    
    // 获取统计数据 
    getStatistics() {
      if (!this.selectedScope || !this.selectedScope.id) {
        return;
      }
      
      uni.request({
        url: `${API_CONFIG.baseUrl}/homework/stats`,
        method: 'GET',
        data: {
          type: this.selectedScope.type,
          id: this.selectedScope.id,
          date: this.selectedDate
        },
        header: {
          'Authorization': `Bearer ${this.token}`
        },
        success: (res) => {
          if (res.data.code === 200) {
            // 兼容接口返回数据，确保字段完整
            this.statistics = {
              totalCount: res.data.data.totalCount || 0,
              completedCount: res.data.data.completedCount || 0,
              pendingCount: res.data.data.pendingCount || 0,
              lateCount: res.data.data.lateCount || 0,
              completionRate: res.data.data.completionRate || 0
            };
            // 绘制饼状图
            this.drawPieChart();
          } else {
            uni.showToast({
              title: res.data.msg || '获取统计数据失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('获取统计数据失败:', err);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        }
      });
    },
    
    // 绘制饼状图（移除比例显示）
    drawPieChart() { 
      const ctx = uni.createCanvasContext('pieChart'); 
      const { totalCount, completedCount, pendingCount, lateCount } = this.statistics; 
      
      if (totalCount === 0) { 
        ctx.setFillStyle('#999'); 
        ctx.setFontSize(14); 
        ctx.textAlign = 'center'; 
        ctx.fillText('暂无数据', 150, 75); 
        ctx.draw(); 
        return; 
      } 
      
      const centerX = 150; 
      const centerY = 75; 
      const radius = 60; 
      
      // 计算各部分角度
      const completedAngle = (completedCount / totalCount) * 2 * Math.PI; 
      const lateAngle = (lateCount / totalCount) * 2 * Math.PI;
      const pendingAngle = (pendingCount / totalCount) * 2 * Math.PI; 
      
      // 统一红色系配色
      const colors = {
        completed: '#4CAF50',    // 已交-绿色（保留对比）
        late: '#FF9800',         // 迟交-橙色（红色系）
        pending: '#F44336',      // 未交-红色（主色）
        text: '#333333',
        white: '#FFFFFF'
      };
      
      let startAngle = 0;
      
      // 绘制已交部分
      if (completedCount > 0) {
        ctx.beginPath(); 
        ctx.moveTo(centerX, centerY); 
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + completedAngle); 
        ctx.closePath(); 
        ctx.setFillStyle(colors.completed); 
        ctx.fill();
        startAngle += completedAngle;
      }
      
      // 绘制迟交部分
      if (lateCount > 0) {
        ctx.beginPath(); 
        ctx.moveTo(centerX, centerY); 
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + lateAngle); 
        ctx.closePath(); 
        ctx.setFillStyle(colors.late); 
        ctx.fill();
        startAngle += lateAngle;
      }
      
      // 绘制未交部分
      if (pendingCount > 0) {
        ctx.beginPath(); 
        ctx.moveTo(centerX, centerY); 
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + pendingAngle); 
        ctx.closePath(); 
        ctx.setFillStyle(colors.pending); 
        ctx.fill();
      }
      
      // 绘制中心白色圆 
      ctx.beginPath(); 
      ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI); 
      ctx.setFillStyle(colors.white); 
      ctx.fill(); 
      
      this.drawLegend(ctx, completedCount, pendingCount, lateCount, totalCount);
      
      ctx.draw(); 
    },

    // 绘制饼状图图例
    drawLegend(ctx, completedCount, pendingCount, lateCount, totalCount) {
      const legendX = 50;
      const legendY = 130;
      const itemHeight = 20;
      const colors = {
        completed: '#4CAF50',
        late: '#FF9800',
        pending: '#F44336'
      };

      // 已交图例
      if (completedCount > 0) {
        ctx.setFillStyle(colors.completed);
        ctx.fillRect(legendX, legendY, 15, 15);
        ctx.setFillStyle('#666');
        ctx.setFontSize(12);
        ctx.textAlign = 'left';
        ctx.fillText(`已交 ${completedCount}人`, legendX + 20, legendY + 12);
      }

      // 迟交图例
      if (lateCount > 0) {
        ctx.setFillStyle(colors.late);
        ctx.fillRect(legendX, legendY + itemHeight, 15, 15);
        ctx.setFillStyle('#666');
        ctx.setFontSize(12);
        ctx.textAlign = 'left';
        ctx.fillText(`迟交 ${lateCount}人`, legendX + 20, legendY + itemHeight + 12);
      }

      // 未交图例
      if (pendingCount > 0) {
        ctx.setFillStyle(colors.pending);
        ctx.fillRect(legendX, legendY + itemHeight * 2, 15, 15);
        ctx.setFillStyle('#666');
        ctx.setFontSize(12);
        ctx.textAlign = 'left';
        ctx.fillText(`未交 ${pendingCount}人`, legendX + 20, legendY + itemHeight * 2 + 12);
      }
    },

    // 跳转到详细名单页面
    goToDetailList() {
      if (!this.selectedScope || !this.selectedDate) {
        uni.showToast({
          title: '请先选择管理范围和日期',
          icon: 'none'
        });
        return;
      }
      uni.navigateTo({
        url: `/pages/volunteer/homework/statslist?type=${this.selectedScope.type}&id=${this.selectedScope.id}&date=${this.selectedDate}&scopeName=${this.selectedScope.fullName}`
      });
    }
  } 
}; 
</script> 

<style scoped> 
/* 基础样式 */
.page-scroll-container { 
  height: 100vh; 
  background-color: #F4F4F5; 
} 

.view-container { 
  min-height: 100%; 
} 

/* 头部样式 */
.art-header { 
  background: linear-gradient(160deg, #A31D1D 0%, #851212 100%);
  padding: 88rpx 30rpx 30rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  margin-bottom: 30rpx;
  width: 100%;
  box-sizing: border-box;
} 

.nav-bar { 
  display: flex; 
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
} 

.back-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-arrow {
  width: 20rpx;
  height: 20rpx;
  border-top: 3rpx solid #fff;
  border-left: 3rpx solid #fff;
  transform: rotate(-45deg);
}

.nav-brand { 
  text-align: center;
} 

.brand-en { 
  font-size: 18rpx;
  color: rgba(255,255,255,0.5);
  display: block;
  margin-bottom: 4rpx;
} 

.brand-cn { 
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
} 

/* 内容区域 */
.content-wrapper { 
  padding: 0 30rpx 120rpx;
  box-sizing: border-box;
} 

.section-box { 
  background: #fff;
  margin-bottom: 30rpx;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  width: 100%;
  box-sizing: border-box;
} 

.selector-title { 
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: bold;
} 

/* 搜索栏样式*/
.search-section {
  padding: 20rpx 30rpx;
}
.search-input-wrapper {
  position: relative;
  width: 100%;
}
.search-input {
  width: 100%;
  height: 80rpx;
  padding: 0 80rpx 0 30rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 40rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #fafafa;
}
.search-input:focus {
  border-color: #A31D1D;
  background-color: #fff;
}
.clear-btn {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  border-radius: 50%;
}
.clear-btn text {
  font-size: 24rpx;
  color: #666;
  font-weight: bold;
}

/* 范围选择 */
.scope-list { 
  white-space: nowrap;
} 

.scope-item { 
  display: inline-block;
  padding: 15rpx 25rpx;
  margin-right: 15rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  background: #fafafa;
  min-width: 200rpx;
} 

.scope-item.active { 
  border-color: #A31D1D;
  background: #fdf2f2;
  color: #A31D1D;
} 

.scope-duty { 
  font-size: 24rpx;
  color: #A31D1D;
  font-weight: bold;
  margin-bottom: 5rpx;
} 

.scope-target { 
  font-size: 22rpx;
  color: #666;
} 

/* 日期选择 */
.calendar-section { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
} 

.section-title { 
  font-size: 28rpx;
  color: #333;
} 

.calendar-picker { 
  display: flex; 
  align-items: center; 
  gap: 8rpx; 
  padding: 12rpx 20rpx; 
  border: 1rpx solid #e0e0e0; 
  border-radius: 8rpx; 
  background-color: #f9f9f9; 
} 

.picker-text { 
  font-size: 28rpx; 
  color: #333; 
} 

.picker-arrow { 
  font-size: 24rpx; 
  color: #666; 
} 

/* 统计数据 */
.stats-container { 
  padding: 0; 
} 

.stats-grid { 
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 16rpx; 
  padding: 20rpx; 
}

.rate-card {
  grid-column: span 2; /* 完成率占两列 */
}

.stats-card { 
  text-align: center; 
  padding: 16rpx; 
  background-color: #f9f9f9; 
  border-radius: 8rpx; 
} 

.stats-title { 
  font-size: 28rpx; 
  color: #666; 
  margin-bottom: 8rpx; 
} 

.stats-value { 
  font-size: 36rpx; 
  font-weight: bold; 
  color: #333; 
} 

.stats-value.completed { 
  color: #4CAF50; /* 已交-绿色 */
} 

.stats-value.pending { 
  color: #F44336; /* 未交-红色（主色） */
} 

.stats-value.late { 
  color: #FF9800; /* 迟交-橙色（红色系） */
} 

.stats-value.rate { 
  color: #A31D1D; /* 完成率-统一红色 */
} 

/* 饼状图 */
.chart-container { 
  text-align: center; 
} 

.pie-chart { 
  margin: 20rpx 0; 
} 

/* 查看详细名单按钮 */
.detail-btn {
  margin-top: 20rpx;
  padding: 16rpx;
  background-color: #A31D1D;
  color: white;
  border-radius: 12rpx;
  text-align: center;
  cursor: pointer;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

/* 空数据提示 */
.empty-tip { 
  text-align: center; 
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
} 

/* 底部安全区 */
.safe-area-spacer { 
  height: 40rpx; 
} 
</style>