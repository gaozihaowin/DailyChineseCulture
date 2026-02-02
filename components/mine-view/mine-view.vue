<template>
	<view class="view-container">
		
		<view class="header">
			<view class="header-brand">
				<text class="logo-seal">良知</text>
				<text>致良知教育</text>
			</view>
			<view class="header-actions">
				<uni-icons type="notification" size="24" color="#333" style="margin-right: 30rpx;"></uni-icons>
				<uni-icons type="gear" size="24" color="#333"></uni-icons>
			</view>
		</view>

		<scroll-view scroll-y class="scroll-content">
			
			<view class="user-section">
				<view class="user-card">
					<view class="bg-circle"></view>
					
					<view class="user-profile">
						<image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
						<view class="user-info">
							<text class="user-name">{{ userInfo.nickname || '致良知学员' }}</text>
							<view class="user-tag">
								<uni-icons type="vip-filled" size="12" color="#fcd34d"></uni-icons>
								<text>资深学员</text>
							</view>
						</view>
					</view>
					
					<view class="stats-grid">
						<view class="stat-box">
							<text class="stat-num">¥0.00</text>
							<text class="stat-label">账户余额</text>
						</view>
						<view class="stat-box">
							<text class="stat-num">2</text>
							<text class="stat-label">优惠券</text>
						</view>
						<view class="stat-box">
							<text class="stat-num">120</text>
							<text class="stat-label">我的积分</text>
						</view>
					</view>
				</view>
			</view>

			<view class="grid-nav">
				<view class="grid-item" v-for="(item, index) in gridList" :key="index" @tap="handleGridClick(item)">
					<view class="icon-box" :style="{ background: item.bgColor }">
						<uni-icons :type="item.icon" size="24" :color="item.iconColor"></uni-icons>
					</view>
					<text class="grid-label">{{ item.text }}</text>
				</view>
			</view>

			<view class="list-group">
				<view class="list-item" v-for="(item, index) in menuGroup1" :key="index">
					<view class="list-icon-wrapper">
						<uni-icons :type="item.icon" size="20" :color="item.color"></uni-icons>
					</view>
					<text class="list-text">{{ item.text }}</text>
					<uni-icons type="right" size="14" color="#d1d5db"></uni-icons>
				</view>
			</view>

			<view class="list-group">
				<view class="list-item" v-for="(item, index) in menuGroup2" :key="index">
					<view class="list-icon-wrapper">
						<uni-icons :type="item.icon" size="20" :color="item.color"></uni-icons>
					</view>
					<text class="list-text">{{ item.text }}</text>
					<uni-icons type="right" size="14" color="#d1d5db"></uni-icons>
				</view>
			</view>
			
			<view class="copyright">
				<text>v1.0.0 · 致良知教育研究院</text>
			</view>

			<view class="safe-area-spacer"></view>

		</scroll-view>
	</view>
</template>

<script>
	export default {
		name: 'MineView',
		data() {
			return {
				// 用户信息 (实际开发中从 vuex 或 storage 获取)
				userInfo: {
					nickname: 'Mystery',
					avatar: ''
				},
				// 宫格导航数据
				gridList: [
					{ text: '我的课程', icon: 'shop', bgColor: '#fff1f2', iconColor: '#9e2a2b' }, // 红调
					{ text: '我的订单', icon: 'cart', bgColor: '#fff7ed', iconColor: '#f97316' }, // 橙调
					{ text: '我的证书', icon: 'vip', bgColor: '#f3e8ff', iconColor: '#a855f7' },   // 紫调
					{ text: '我的考试', icon: 'compose', bgColor: '#f0fdf4', iconColor: '#22c55e' } // 绿调
				],
				// 菜单组 1
				menuGroup1: [
					{ text: '咨询服务单', icon: 'headphones', color: '#ef4444' },
					{ text: '返现与提现', icon: 'wallet', color: '#f59e0b' }
				],
				// 菜单组 2
				menuGroup2: [
					{ text: '加入社群', icon: 'staff', color: '#3b82f6' },
					{ text: '用户协议', icon: 'info', color: '#10b981' },
					{ text: '关于我们', icon: 'help', color: '#6b7280' },
					{ text: '退出登录', icon: 'close', color: '#999' } // 增加退出功能
				]
			}
		},
		methods: {
			handleGridClick(item) {
				uni.showToast({
					title: `点击了: ${item.text}`,
					icon: 'none'
				});
			}
		}
	}
</script>

<style scoped>
	/* --- 全局容器 --- */
	.view-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #f4f6f8; /* 浅灰背景 */
	}

	/* --- Header --- */
	.header {
		padding: 80rpx 40rpx 30rpx;
		background: #fff;
		display: flex; justify-content: space-between; align-items: center;
		position: sticky; top: 0; z-index: 10;
	}
	.header-brand { display: flex; align-items: center; gap: 12rpx; font-size: 34rpx; font-weight: bold; color: #333; }
	.logo-seal { background: #9e2a2b; color: #fff; font-size: 24rpx; padding: 4rpx 8rpx; border-radius: 8rpx; }

	/* --- Scroll Content --- */
	.scroll-content { flex: 1; height: 0; }
	.safe-area-spacer { height: 160rpx; } /* 底部留白 */

	/* --- 用户卡片区 --- */
	.user-section {
		background: #fff;
		padding: 20rpx 32rpx 40rpx;
		border-radius: 0 0 48rpx 48rpx; /* 下方圆角 */
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
		margin-bottom: 30rpx;
	}
	.user-card {
		/* 改为品牌红渐变 */
		background: linear-gradient(135deg, #8a2021, #b53b3c);
		border-radius: 32rpx;
		padding: 40rpx 40rpx;
		color: #fff;
		box-shadow: 0 10rpx 30rpx rgba(158, 42, 43, 0.3);
		position: relative;
		overflow: hidden;
	}
	/* 装饰圆圈 */
	.bg-circle {
		position: absolute; top: -60rpx; right: -60rpx;
		width: 200rpx; height: 200rpx;
		background: rgba(255,255,255,0.1);
		border-radius: 50%;
	}
	
	.user-profile { display: flex; align-items: center; margin-bottom: 40rpx; position: relative; z-index: 1; }
	.avatar {
		width: 110rpx; height: 110rpx; border-radius: 50%;
		border: 4rpx solid rgba(255,255,255,0.6);
		background-color: #fff; margin-right: 24rpx;
	}
	.user-info { display: flex; flex-direction: column; gap: 8rpx; }
	.user-name { font-size: 36rpx; font-weight: bold; }
	.user-tag {
		background: rgba(0,0,0,0.2);
		padding: 4rpx 16rpx; border-radius: 20rpx;
		font-size: 22rpx; display: flex; align-items: center; gap: 8rpx;
		align-self: flex-start; /* 靠左对齐 */
	}

	.stats-grid { display: flex; justify-content: space-between; position: relative; z-index: 1; }
	.stat-box { display: flex; flex-direction: column; align-items: center; flex: 1; }
	.stat-num { font-size: 36rpx; font-weight: bold; margin-bottom: 4rpx; }
	.stat-label { font-size: 22rpx; opacity: 0.8; }

	/* --- 宫格导航 --- */
	.grid-nav {
		background: #fff;
		margin: 0 32rpx 32rpx;
		padding: 30rpx 20rpx;
		border-radius: 32rpx;
		display: flex; justify-content: space-between;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);
	}
	.grid-item { display: flex; flex-direction: column; align-items: center; gap: 16rpx; flex: 1; }
	.icon-box {
		width: 88rpx; height: 88rpx; border-radius: 28rpx;
		display: flex; justify-content: center; align-items: center;
		transition: transform 0.2s;
	}
	.grid-item:active .icon-box { transform: scale(0.9); }
	.grid-label { font-size: 24rpx; color: #333; font-weight: 500; }

	/* --- 列表组 --- */
	.list-group {
		background: #fff;
		margin: 0 32rpx 32rpx;
		border-radius: 32rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);
	}
	.list-item {
		display: flex; align-items: center;
		padding: 30rpx 40rpx;
		position: relative;
	}
	.list-item:active { background-color: #f9fafb; }
	/* 分割线 */
	.list-item:not(:last-child)::after {
		content: ''; position: absolute; bottom: 0; left: 100rpx; right: 0;
		height: 1px; background: #f3f4f6;
	}
	.list-icon-wrapper { width: 40rpx; margin-right: 20rpx; display: flex; justify-content: center; }
	.list-text { flex: 1; font-size: 28rpx; color: #333; }
	
	.copyright { text-align: center; color: #ccc; font-size: 22rpx; margin-top: 20rpx; }
</style>