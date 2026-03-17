<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	/* 品牌级全局色彩系统 - 同步首页暖象牙白 */
	:root {
		--theme-bg-color: #f9f7f2; /* 暖象牙白 - 与首页完全一致 */
		--theme-card-color: #ffffff; /* 纯白卡片色 */
	}

	/* 强制重写微信小程序原生 page 节点 */
	page {
		background-color: #f9f7f2 !important; /* 绝对同步首页的暖象牙白 */
		min-height: 100vh;
		box-sizing: border-box;
	}

	/* 全局纯白卡片样式类 */
	.global-white-card {
		background-color: #ffffff !important;
		border-radius: 30rpx; /* 匹配首页的 30rpx 圆角 */
		margin: 24rpx 30rpx;
		padding: 30rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03); /* 匹配首页的细腻阴影 */
		border: 1px solid rgba(255, 255, 255, 0.5);
	}
</style>
