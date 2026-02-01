<template>
	<view class="page-container">
		
		<view class="header">
			<view class="logo-text">
				<text class="logo-seal">良知</text>
				<text>致良知教育</text>
			</view>
			<view class="header-actions">
				<uni-icons type="search" size="24" color="#2d2424" style="margin-right: 30rpx;"></uni-icons>
				<uni-icons type="notification" size="24" color="#2d2424"></uni-icons>
			</view>
		</view>

		<scroll-view scroll-y class="scroll-content">
			
			<view class="hero-banner">
				<view class="hero-title">致良知教育研究院</view>
				<view class="hero-subtitle">让身边多一位致良知的中国人</view>
				<view class="quote-box">
					<text class="quote-mark">“</text> 成为带给人们温暖与光明的家园
				</view>
			</view>

			<view class="grid-nav">
				<view class="nav-item" v-for="(item, index) in navList" :key="index">
					<view class="icon-box">
						<uni-icons :type="item.icon" size="24" color="#9e2a2b"></uni-icons>
					</view>
					<text class="nav-label">{{ item.name }}</text>
				</view>
			</view>

			<view class="section-header">
				<text class="section-title">热门课程</text>
				<view class="section-more">
					全部 <uni-icons type="right" size="12" color="#8c8686"></uni-icons>
				</view>
			</view>

			<view class="course-list">
				<view class="course-card" v-for="(course, index) in courseList" :key="index">
					<view class="card-thumb" :style="{ background: course.bgGradient }">
						<view class="thumb-tag">{{ course.tag }}</view>
						<view class="thumb-title">{{ course.type }}</view>
						<view class="thumb-sub">{{ course.term }}</view>
					</view>
					<view class="card-info">
						<view class="info-title">{{ course.title }}</view>
						<view class="info-meta">
							<text class="meta-count">{{ course.count }} 人已加入</text>
							<view class="meta-btn">去学习</view>
						</view>
					</view>
				</view>
			</view>
			
			<view style="height: 120rpx;"></view>

		</scroll-view>

		<view class="bottom-nav">
			<view class="nav-btn active">
				<uni-icons type="home-filled" size="24" color="#9e2a2b"></uni-icons>
				<text>主页</text>
			</view>
			<view class="nav-btn">
				<uni-icons type="shop" size="24" color="#cccccc"></uni-icons>
				<text>课程</text>
			</view>
			<view class="nav-btn">
				<uni-icons type="person" size="24" color="#cccccc"></uni-icons>
				<text>我的</text>
			</view>
			<view class="nav-btn">
				<uni-icons type="gift" size="24" color="#cccccc"></uni-icons>
				<text>文创</text>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 模拟导航数据
				navList: [
					{ name: '明理班', icon: 'book' },
					{ name: '笃行班', icon: 'flag' }, // 这里的icon是uni-icons内置的，可根据需要换图片
					{ name: '印证班', icon: 'checkmarkempty' },
					{ name: '良知班', icon: 'heart' }
				],
				// 模拟课程数据
				courseList: [
					{
						tag: '热招',
						type: '诚意班',
						term: '第69期',
						title: '【致良知线上课堂】诚意班全年订阅计划',
						count: '575,563',
						bgGradient: 'linear-gradient(135deg, #8a2021, #b53b3c)'
					},
					{
						tag: '大学生',
						type: '诚意班',
						term: '第13期',
						title: '【致良知大学生】青年领袖成长计划',
						count: '10,987',
						bgGradient: 'linear-gradient(135deg, #a65d5e, #c77d7e)'
					},
					{
						tag: '青少年',
						type: '诚意班',
						term: '第13期',
						title: '【致良知好少年】中华文化启蒙班',
						count: '12,103',
						bgGradient: 'linear-gradient(135deg, #c58e65, #e0b48d)'
					}
				]
			}
		},
		methods: {
			
		}
	}
</script>

<style scoped>
	/* --- 全局变量适配 --- */
	.page-container {
		min-height: 100vh;
		background-color: #f9f7f2; /* 宣纸白背景 */
		display: flex;
		flex-direction: column;
	}

	/* --- Header --- */
	.header {
		padding: 80rpx 40rpx 30rpx; /* 增加顶部 padding 适配刘海屏 */
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: rgba(249, 247, 242, 0.98);
		position: sticky;
		top: 0;
		z-index: 100;
	}
	.logo-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #9e2a2b;
		display: flex;
		align-items: center;
		gap: 16rpx;
	}
	.logo-seal {
		background-color: #9e2a2b;
		color: #fff;
		font-size: 24rpx;
		padding: 4rpx 8rpx;
		border-radius: 8rpx;
	}

	/* --- Scroll Content --- */
	.scroll-content {
		flex: 1;
		height: 0; /* 配合 flex-grow 撑满剩余空间 */
	}

	/* --- Hero Banner --- */
	.hero-banner {
		padding: 60rpx 40rpx;
		background: radial-gradient(circle at top right, #fcefe9, transparent);
		text-align: center;
		margin-bottom: 20rpx;
	}
	.hero-title {
		font-size: 56rpx;
		color: #9e2a2b;
		margin-bottom: 16rpx;
		letter-spacing: 4rpx;
		font-weight: bold;
	}
	.hero-subtitle {
		font-size: 26rpx;
		color: #8c8686;
		letter-spacing: 2rpx;
		margin-bottom: 40rpx;
		position: relative;
		display: inline-block;
	}
	/* 伪元素做横线 */
	.hero-subtitle::before, .hero-subtitle::after {
		content: ''; position: absolute; top: 50%; width: 40rpx; height: 2rpx; background: #ddd;
	}
	.hero-subtitle::before { left: -60rpx; }
	.hero-subtitle::after { right: -60rpx; }

	.quote-box {
		font-size: 24rpx;
		color: #9e2a2b;
		font-weight: bold;
		margin-top: 20rpx;
	}
	.quote-mark {
		font-family: serif;
		font-size: 40rpx;
		margin-right: 8rpx;
	}

	/* --- Grid Nav --- */
	.grid-nav {
		display: flex;
		justify-content: space-between;
		padding: 0 40rpx;
		margin-bottom: 48rpx;
	}
	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}
	.icon-box {
		width: 96rpx; height: 96rpx;
		border-radius: 32rpx;
		background: #fff;
		display: flex; justify-content: center; align-items: center;
		box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.05);
		border: 2rpx solid rgba(158, 42, 43, 0.1);
	}
	.nav-label { font-size: 24rpx; color: #2d2424; font-weight: 500; }

	/* --- Section Header --- */
	.section-header {
		padding: 0 40rpx;
		margin-bottom: 24rpx;
		display: flex; justify-content: space-between; align-items: flex-end;
	}
	.section-title { font-size: 36rpx; font-weight: bold; color: #2d2424; }
	.section-more { font-size: 24rpx; color: #8c8686; display: flex; align-items: center; }

	/* --- Course Card --- */
	.course-list { padding: 0 40rpx; }
	.course-card {
		background: #fff;
		border-radius: 32rpx;
		padding: 24rpx;
		margin-bottom: 32rpx;
		display: flex;
		gap: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
	}

	.card-thumb {
		width: 200rpx; height: 140rpx;
		border-radius: 16rpx;
		display: flex; flex-direction: column;
		justify-content: center; align-items: center;
		color: #fff; text-align: center;
		position: relative;
		flex-shrink: 0;
	}
	.thumb-title { font-size: 36rpx; font-weight: bold; }
	.thumb-sub { font-size: 20rpx; opacity: 0.9; }
	.thumb-tag {
		position: absolute; top: 0; left: 0;
		background: #c5a065; color: #fff;
		font-size: 18rpx; padding: 4rpx 10rpx;
		border-top-left-radius: 16rpx; border-bottom-right-radius: 16rpx;
	}

	.card-info {
		flex: 1;
		display: flex; flex-direction: column; justify-content: space-between;
	}
	.info-title {
		font-size: 28rpx; font-weight: bold; color: #2d2424;
		line-height: 1.4;
		/* 多行省略 */
		display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
	}
	.info-meta {
		display: flex; justify-content: space-between; align-items: center;
	}
	.meta-count { font-size: 22rpx; color: #8c8686; }
	.meta-btn {
		background: rgba(158, 42, 43, 0.1); color: #9e2a2b;
		font-size: 22rpx; padding: 8rpx 20rpx; border-radius: 24rpx;
		font-weight: 600;
	}

	/* --- Bottom Nav --- */
	.bottom-nav {
		height: 140rpx; /* 增加高度适配底部安全区 */
		background: #fff;
		border-top: 1rpx solid rgba(0,0,0,0.05);
		display: flex; justify-content: space-around;
		padding-top: 20rpx;
		padding-bottom: 40rpx; /* 底部留白 */
	}
	.nav-btn {
		display: flex; flex-direction: column; align-items: center; gap: 8rpx;
		font-size: 20rpx; color: #ccc;
	}
	.nav-btn.active { color: #9e2a2b; }
</style>