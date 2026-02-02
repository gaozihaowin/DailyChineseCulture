<template>
	<view class="view-container">
		
		<view class="header">
			<view class="header-title">
				<text class="logo-seal">课</text>
				<text>我的课程</text>
			</view>
			<uni-icons type="person" size="24" color="#8c8686"></uni-icons>
		</view>

		<view class="tabs-container">
			<view class="tabs-wrapper">
				<view 
					class="tab-item" 
					v-for="(tab, index) in topTabs" 
					:key="index"
					:class="{ active: currentTopTab === index }"
					@tap="switchTopTab(index)"
				>
					{{ tab }}
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="scroll-content">
			
			<view class="course-list">
				<view class="course-card" v-for="(item, index) in courseList" :key="index">
					<view class="card-thumb">
						<view class="status-badge">{{ item.status }}</view>
						<view class="thumb-main">{{ item.type }}</view>
						<view class="thumb-sub">{{ item.enType }}</view>
					</view>
					
					<view class="card-info">
						<view class="card-title">{{ item.title }}</view>
						
						<view class="info-group">
							<view class="info-row">
								<uni-icons type="calendar" size="12" color="#999"></uni-icons>
								<text>报名: {{ item.signDate }}</text>
							</view>
							<view class="info-row">
								<uni-icons type="spinner" size="12" color="#999"></uni-icons>
								<text>开营: {{ item.startDate }}</text>
							</view>
						</view>

						<view class="card-action">
							<button class="btn-study" hover-class="btn-hover">
								去学习 <uni-icons type="forward" size="12" color="#9e2a2b" style="margin-left: 4rpx;"></uni-icons>
							</button>
						</view>
					</view>
				</view>
			</view>

			<view class="empty-tip">没有更多内容了</view>
			
			<view class="safe-area-spacer"></view>

		</scroll-view>
	</view>
</template>

<script>
	export default {
		name: 'CourseView',
		data() {
			return {
				currentTopTab: 0,
				topTabs: ['训练营', '服务课程', '专栏'],
				courseList: [
					{
						status: '已开营',
						type: '诚意班',
						enType: 'The Sincerity',
						title: '【致良知线上课堂】诚意班第69期',
						signDate: '2025-11-25',
						startDate: '2025-12-20'
					},
					{
						status: '招募中',
						type: '笃行班',
						enType: 'Practice',
						title: '【致良知大学生】青年领袖成长计划',
						signDate: '2026-02-01',
						startDate: '2026-03-01'
					},
					{
						status: '未开始',
						type: '印证班',
						enType: 'Proof',
						title: '【企业经营】从心出发的经营之道',
						signDate: '2026-04-15',
						startDate: '2026-05-01'
					}
				]
			}
		},
		methods: {
			switchTopTab(index) {
				this.currentTopTab = index;
				// 这里可以加 API 请求，根据 index 加载不同数据
			}
		}
	}
</script>

<style scoped>
	/* 布局容器 */
	.view-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #f3f4f6; /* 比首页稍微灰一点，区分层次 */
	}

	/* Header */
	.header {
		padding: 80rpx 40rpx 30rpx;
		background: #fff;
		display: flex; justify-content: space-between; align-items: center;
		position: sticky; top: 0; z-index: 10;
	}
	.header-title { display: flex; align-items: center; font-size: 34rpx; font-weight: bold; color: #2d2424; gap: 12rpx; }
	.logo-seal { background: #9e2a2b; color: #fff; font-size: 24rpx; width: 40rpx; height: 40rpx; line-height: 40rpx; text-align: center; border-radius: 8rpx; font-family: serif; }

	/* Tabs */
	.tabs-container { background: #fff; padding: 0 40rpx 20rpx; border-radius: 0 0 32rpx 32rpx; margin-bottom: 20rpx; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02); }
	.tabs-wrapper { display: flex; background: #f3f4f6; padding: 8rpx; border-radius: 16rpx; }
	.tab-item { flex: 1; text-align: center; padding: 14rpx 0; font-size: 26rpx; color: #8c8686; border-radius: 12rpx; transition: all 0.3s; }
	.tab-item.active { background: #fff; color: #9e2a2b; font-weight: bold; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05); }

	/* Scroll Content */
	.scroll-content { flex: 1; height: 0; width: 100%; }
	.safe-area-spacer { height: 160rpx; } /* 底部垫高 */

	/* Course List */
	.course-list { padding: 0 30rpx; }
	.course-card { background: #fff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 24rpx; display: flex; gap: 24rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02); }
	
	/* 封面 - 改为红色系 */
	.card-thumb { 
		width: 160rpx; height: 160rpx; 
		background: linear-gradient(135deg, #8a2021, #b53b3c); 
		border-radius: 16rpx; 
		display: flex; flex-direction: column; justify-content: center; align-items: center; 
		color: #fff; position: relative; flex-shrink: 0; 
	}
	.status-badge { 
		position: absolute; top: 8rpx; left: 8rpx; 
		background: rgba(0,0,0,0.3); backdrop-filter: blur(4px);
		color: #fff; font-size: 18rpx; padding: 2rpx 8rpx; border-radius: 6rpx; 
	}
	.thumb-main { font-size: 30rpx; font-weight: bold; font-family: serif; }
	.thumb-sub { font-size: 16rpx; opacity: 0.8; }

	/* 信息区 */
	.card-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
	.card-title { font-size: 28rpx; font-weight: bold; color: #333; line-height: 1.4; margin-bottom: 8rpx; }
	.info-group { display: flex; flex-direction: column; gap: 4rpx; }
	.info-row { font-size: 22rpx; color: #999; display: flex; align-items: center; gap: 8rpx; }
	
	.card-action { display: flex; justify-content: flex-end; margin-top: 10rpx; }
	.btn-study { 
		margin: 0; background: rgba(158, 42, 43, 0.08); color: #9e2a2b; 
		font-size: 24rpx; padding: 0 24rpx; height: 50rpx; line-height: 50rpx; 
		border-radius: 30rpx; font-weight: 600; display: flex; align-items: center; 
	}
	.btn-study::after { border: none; }
	.btn-hover { opacity: 0.8; }

	.empty-tip { text-align: center; color: #ccc; font-size: 24rpx; margin-top: 40rpx; }
</style>