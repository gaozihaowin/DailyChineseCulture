<template>
	<view class="page-container">
		<view class="mobile-frame">
			
			<!-- 背景装饰 -->
			<view class="bg-decoration">
				<view class="bg-circle"></view>
			</view>

			<!-- 顶部 Logo 区 -->
			<view class="header-section">
				<view class="logo-seal">良知</view>
				<view class="app-name">致良知教育</view>
				<view class="app-slogan">让内心充满力量的生命哲学课</view>
			</view>

			<!-- 表单区域 -->
			<view class="form-section">
				
				<!-- 账号输入 -->
				<view class="input-group">
					<input 
						class="form-input" 
						type="text" 
						v-model="username"
						placeholder="请输入手机号/账号"
						placeholder-style="color: #8c8686"
					/>
					<text class="input-icon">👤</text>
				</view>

				<!-- 密码输入 -->
				<view class="input-group">
					<input 
						class="form-input" 
						:type="showPassword ? 'text' : 'password'"
						v-model="password"
						placeholder="请输入密码"
						placeholder-style="color: #8c8686"
					/>
					<text class="input-icon">🔒</text>
					<text 
						class="toggle-password" 
						@tap="togglePassword"
					>{{ showPassword ? '👁' : '👁‍🗨' }}</text>
				</view>

				<!-- 登录按钮 -->
				<button class="btn-login" @tap="handleLogin" hover-class="btn-login-hover">登录</button>

				<!-- 辅助链接 -->
				<view class="links-row">
					<text class="link-text" @tap="forgetPassword">忘记密码?</text>
					<text class="link-text highlight" @tap="register">立即注册</text>
				</view>
			</view>

			<!-- 底部第三方登录 -->
			<view class="footer-section">
				<view class="divider">
					<view class="divider-line"></view>
					<text class="divider-text">其他方式登录</text>
					<view class="divider-line"></view>
				</view>
				
				<view class="social-icons">
					<view class="social-btn wechat" @tap="wechatLogin" hover-class="social-btn-hover">
						<image 
							class="social-icon-img" 
							src="/static/icons/wechat.png" 
							mode="aspectFit"
						></image>
					</view>
					<view class="social-btn qq" @tap="qqLogin" hover-class="social-btn-hover">
						<image 
							class="social-icon-img" 
							src="/static/icons/qq.png" 
							mode="aspectFit"
						></image>
					</view>
				</view>
				
				<view class="agreement-text">
					登录即代表同意 <text class="highlight-text" @tap="showAgreement">《用户协议》</text> 和 <text class="highlight-text" @tap="showPrivacy">《隐私政策》</text>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			username: '',
			password: '',
			showPassword: false
		};
	},
	methods: {
		// 切换密码显示
		togglePassword() {
			this.showPassword = !this.showPassword;
		},
		
		// 登录
		handleLogin() {
			if (!this.username) {
				uni.showToast({
					title: '请输入账号',
					icon: 'none'
				});
				return;
			}
			if (!this.password) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				});
				return;
			}
			
			// 显示加载
			uni.showLoading({
				title: '登录中...'
			});
			
			// 模拟登录请求
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				});
				
				// 登录成功后跳转
				// uni.switchTab({
				// 	url: '/pages/index/index'
				// });
			}, 1500);
		},
		
		// 忘记密码
		forgetPassword() {
			uni.showToast({
				title: '跳转找回密码页面',
				icon: 'none'
			});
			// uni.navigateTo({
			// 	url: '/pages/forget/forget'
			// });
		},
		
		// 注册
		register() {
			uni.showToast({
				title: '跳转注册页面',
				icon: 'none'
			});
			// uni.navigateTo({
			// 	url: '/pages/register/register'
			// });
		},
		
		// 微信登录
		wechatLogin() {
			uni.showToast({
				title: '微信登录',
				icon: 'none'
			});
			// 调用微信登录API
			// uni.login({
			// 	provider: 'weixin',
			// 	success: (res) => {
			// 		console.log('微信登录成功', res);
			// 	}
			// });
		},
		
		// QQ登录
		qqLogin() {
			uni.showToast({
				title: 'QQ登录',
				icon: 'none'
			});
			// 调用QQ登录API
		},
		
		// 查看用户协议
		showAgreement() {
			uni.navigateTo({
				url: '/pages/webview/webview?type=agreement'
			});
		},
		
		// 查看隐私政策
		showPrivacy() {
			uni.navigateTo({
				url: '/pages/webview/webview?type=privacy'
			});
		}
	}
};
</script>

<style scoped>
/* 页面容器 */
.page-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background-color: #e0e0e0;
}

/* 手机容器 */
.mobile-frame {
	width: 100%;
	max-width: 750rpx;
	min-height: 100vh;
	background-color: #f9f7f2;
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

/* 背景装饰 */
.bg-decoration {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 35%;
	background: linear-gradient(to top, rgba(197, 160, 101, 0.1), transparent);
	z-index: 0;
	pointer-events: none;
}

.bg-circle {
	position: absolute;
	bottom: -100rpx;
	right: -100rpx;
	width: 600rpx;
	height: 600rpx;
	background: radial-gradient(circle, rgba(158, 42, 43, 0.05), transparent 70%);
	border-radius: 50%;
}

/* 顶部 Logo 区 */
.header-section {
	padding-top: 160rpx;
	padding-bottom: 80rpx;
	text-align: center;
	z-index: 1;
}

.logo-seal {
	width: 128rpx;
	height: 128rpx;
	background-color: #9e2a2b;
	color: #fff;
	font-size: 64rpx;
	line-height: 128rpx;
	border-radius: 16rpx;
	margin: 0 auto 32rpx;
	box-shadow: 0 8rpx 30rpx rgba(158, 42, 43, 0.3);
	border: 4rpx solid rgba(255, 255, 255, 0.2);
	font-weight: bold;
}

.app-name {
	font-size: 40rpx;
	font-weight: bold;
	color: #2d2424;
	letter-spacing: 4rpx;
	margin-bottom: 8rpx;
}

.app-slogan {
	font-size: 24rpx;
	color: #8c8686;
	padding: 0 40rpx;
}

/* 表单区域 */
.form-section {
	padding: 0 64rpx;
	z-index: 1;
}

.input-group {
	position: relative;
	margin-bottom: 48rpx;
}

.input-icon {
	position: absolute;
	left: 32rpx;
	top: 50%;
	transform: translateY(-50%);
	font-size: 40rpx;
	z-index: 1;
}

.form-input {
	width: 100%;
	height: 104rpx;
	padding: 0 32rpx 0 96rpx;
	background-color: #fff;
	border-radius: 24rpx;
	font-size: 28rpx;
	color: #2d2424;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.03);
	border: 2rpx solid transparent;
}

/* 密码切换 */
.toggle-password {
	position: absolute;
	right: 32rpx;
	top: 50%;
	transform: translateY(-50%);
	font-size: 40rpx;
	z-index: 1;
}

/* 登录按钮 */
.btn-login {
	width: 100%;
	height: 100rpx;
	background: linear-gradient(135deg, #9e2a2b, #b53b3c);
	color: #fff;
	font-size: 32rpx;
	font-weight: 600;
	border: none;
	border-radius: 100rpx;
	box-shadow: 0 16rpx 40rpx rgba(158, 42, 43, 0.25);
	margin-top: 20rpx;
	letter-spacing: 8rpx;
	line-height: 100rpx;
}

.btn-login::after {
	border: none;
}

.btn-login-hover {
	opacity: 0.9;
	transform: scale(0.98);
}

/* 辅助链接行 */
.links-row {
	display: flex;
	justify-content: space-between;
	margin-top: 32rpx;
	font-size: 24rpx;
}

.link-text {
	color: #8c8686;
	padding: 10rpx;
}

.link-text.highlight {
	color: #c5a065;
	font-weight: 500;
}

/* 底部第三方登录 */
.footer-section {
	margin-top: auto;
	padding-bottom: 80rpx;
	text-align: center;
	z-index: 1;
}

.divider {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
	padding: 0 64rpx;
}

.divider-line {
	flex: 1;
	height: 2rpx;
	background-color: #e0e0e0;
}

.divider-text {
	color: #ccc;
	font-size: 20rpx;
	margin: 0 20rpx;
	white-space: nowrap;
}

.social-icons {
	display: flex;
	justify-content: center;
	margin: 0 auto;
}

.social-btn {
	width: 88rpx;
	height: 88rpx;
	border-radius: 50%;
	background: #fff;
	border: 2rpx solid #eee;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0 24rpx;
}

.social-btn-hover {
	transform: translateY(-6rpx);
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
}

.social-btn.wechat {
	border-color: #e6f7ed;
}

.social-btn.qq {
	border-color: #e6f3fb;
}

.social-icon-img {
	width: 48rpx;
	height: 48rpx;
}

.agreement-text {
	font-size: 20rpx;
	color: #999;
	margin-top: 40rpx;
	padding: 0 40rpx;
	line-height: 1.6;
}

.highlight-text {
	color: #9e2a2b;
}
</style>