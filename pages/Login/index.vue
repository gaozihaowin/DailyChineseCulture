<template>
	<view class="page-container">
		<view class="mobile-frame">
			
			<view class="bg-decoration">
				<view class="bg-circle animate-pulse"></view>
			</view>

			<view class="header-section fade-in-up">
				<view class="logo-seal">良知</view>
				<view class="app-name">致良知教育</view>
				<view class="app-slogan">让内心充满力量的生命哲学课</view>
			</view>

			<view class="form-section fade-in-up-delay-1">
				
				<view class="input-group">
					<view class="input-icon-box">
						<view class="css-icon-user">
							<view class="user-head"></view>
							<view class="user-body"></view>
						</view>
					</view>
					<input 
						class="form-input" 
						type="text" 
						v-model="username"
						placeholder="请输入手机号/账号"
						placeholder-class="custom-placeholder"
					/>
				</view>

				<view class="input-group">
					<view class="input-icon-box">
						<view class="css-icon-lock">
							<view class="lock-shackle"></view>
							<view class="lock-body"></view>
						</view>
					</view>
					<input 
						class="form-input" 
						:type="showPassword ? 'text' : 'password'"
						v-model="password"
						placeholder="请输入密码"
						placeholder-class="custom-placeholder"
					/>
					<view class="toggle-password" @tap="togglePassword">
						<view :class="['eye-icon', showPassword ? 'eye-open' : '']"></view>
					</view>
				</view>

				<button class="btn-login ripple" @tap="handleLogin" hover-class="btn-hover-active">登录/注册</button>

				<view class="links-row">
					<text class="link-text" @tap="forgetPassword">忘记密码?</text>
					<view class="link-divider"></view>
					<text class="link-text highlight" @tap="register">立即注册</text>
				</view>
			</view>

			<view class="footer-section fade-in-up-delay-2">
				<view class="divider">
					<view class="divider-line"></view>
					<text class="divider-text">其他登录方式</text>
					<view class="divider-line"></view>
				</view>
				
				<button class="btn-wechat" @tap="wechatLogin" hover-class="wechat-hover">
					<image class="wechat-icon" src="https://img.icons8.com/ios-filled/50/ffffff/wechat.png" mode="aspectFit"></image>
					<text class="wechat-text">微信一键登录</text>
				</button>
				
				<view class="agreement-text">
					登录即代表同意 <text class="highlight-text" @tap="showAgreement">《用户协议》</text> 与 <text class="highlight-text" @tap="showPrivacy">《隐私政策》</text>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
// 引入API配置
import { API_CONFIG } from '../../api/config';

export default {
	data() {
		return {
			username: '',
			password: '',
			showPassword: false
		};
	},
	methods: {
		togglePassword() {
			this.showPassword = !this.showPassword;
		},
		
		// --- 改造后的登录方法 ---
		async handleLogin() {
			// 1. 本地校验
			if (!this.username || !this.password) {
				uni.showToast({ title: '请输入账号和密码', icon: 'none' });
				return;
			}

			// 2. 显示加载动画
			uni.showLoading({ title: '登录中...', mask: true });

			try {
				// 3. 发起网络请求
				const res = await uni.request({
					url: API_CONFIG.baseUrl + API_CONFIG.paths.login, // 接口路径，需与 Apifox 一致
					method: 'POST',
					header: {
						'content-type': 'application/json' 
					},
					data: {
						username: this.username,
						password: this.password
					}
				});
				
				// 隐藏加载动画
				uni.hideLoading();

				// uni.request 返回的 res 结构：{ data: { code: 200, ... }, statusCode: 200, ... }
				// 这里假设后端返回格式为: { code: 200, msg: "success", data: { token: "..." } }
				const apiData = res.data;

				// 4. 处理响应结果
				if (res.statusCode === 200 && apiData.code === 200) {
					
					// 登录成功：保存 Token
					uni.setStorageSync('token', apiData.data.token);
					uni.setStorageSync('userInfo', apiData.data.userInfo);

					uni.showToast({ title: '登录成功', icon: 'success' });

					// 延迟跳转到首页 (假设首页路径为 /pages/home/index)
					setTimeout(() => {
						// uni.switchTab({ url: '/pages/home/index' }); // 如果是 TabBar 页面
						// uni.navigateTo({ url: '/pages/home/index' }); // 如果是普通页面
						
						uni.reLaunch({
						            url: '/pages/Main/index' 
						        });
						
						console.log("跳转首页...", apiData.data.token);
					}, 1500);

				} else {
					// 登录失败 (如密码错误)
					uni.showToast({ 
						title: apiData.msg || '登录失败，请检查账号密码', 
						icon: 'none',
						duration: 2000
					});
				}

			} catch (error) {
				uni.hideLoading();
				console.error('API Error:', error);
				uni.showToast({ title: '网络连接异常', icon: 'none' });
			}
		},

		wechatLogin() {
			uni.showToast({ title: '功能开发中...', icon: 'none' });
		},
		forgetPassword() {
			uni.showToast({ title: '请联系管理员重置', icon: 'none' });
		},
		register() {
			uni.showToast({ title: '暂未开放注册', icon: 'none' });
		},
		showAgreement() {},
		showPrivacy() {}
	}
};
</script>

<style scoped>
/* --- 基础容器 --- */
.page-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background-color: #f0f0f0;
}

.mobile-frame {
	width: 100%;
	max-width: 750rpx;
	min-height: 100vh;
	background-color: #fdfbf7;
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

/* --- 背景装饰 --- */
.bg-decoration {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
	pointer-events: none;
}
.bg-circle {
	position: absolute;
	top: -100rpx;
	left: -100rpx;
	width: 400rpx;
	height: 400rpx;
	background: radial-gradient(circle, rgba(158, 42, 43, 0.05), transparent 70%);
	border-radius: 50%;
}
.animate-pulse { animation: pulse 4s infinite ease-in-out; }

/* --- Logo 区域 --- */
.header-section {
	padding-top: 140rpx;
	padding-bottom: 60rpx;
	text-align: center;
	z-index: 1;
}
.logo-seal {
	width: 136rpx;
	height: 136rpx;
	background-color: #9e2a2b;
	color: #fff;
	font-size: 68rpx;
	line-height: 136rpx;
	border-radius: 24rpx;
	margin: 0 auto 36rpx;
	box-shadow: 0 12rpx 40rpx rgba(158, 42, 43, 0.25);
	font-weight: bold;
}
.app-name {
	font-size: 44rpx;
	font-weight: 700;
	color: #332c2b;
	letter-spacing: 6rpx;
}
.app-slogan {
	font-size: 26rpx;
	color: #a09594;
	margin-top: 12rpx;
}

/* --- 表单区域 --- */
.form-section {
	padding: 0 70rpx;
	z-index: 1;
}
.input-group {
	position: relative;
	margin-bottom: 36rpx;
}
.form-input {
	width: 100%;
	height: 110rpx;
	padding: 0 100rpx; /* 左侧留出图标空间 */
	background-color: #ffffff;
	border-radius: 20rpx;
	font-size: 30rpx;
	color: #333;
	box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);
	box-sizing: border-box;
	border: 2rpx solid transparent;
	transition: all 0.3s;
}
.form-input:focus {
	border-color: rgba(158, 42, 43, 0.15);
	background-color: #fff;
}
.custom-placeholder { color: #c4c4c4; font-size: 28rpx; }

/* --- CSS 极简图标绘制 (无需图片) --- */
.input-icon-box {
	position: absolute;
	left: 36rpx;
	top: 0;
	height: 110rpx; /* 高度撑满，方便垂直居中 */
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

/* 用户图标：一个圆头 + 半圆身子 */
.css-icon-user {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.user-head {
	width: 18rpx;
	height: 18rpx;
	border: 3rpx solid #9e2a2b;
	border-radius: 50%;
	margin-bottom: 2rpx;
}
.user-body {
	width: 30rpx;
	height: 14rpx;
	border: 3rpx solid #9e2a2b;
	border-radius: 16rpx 16rpx 0 0;
	border-bottom: none;
}

/* 锁图标：一个倒U锁梁 + 方形锁体 */
.css-icon-lock {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.lock-shackle {
	width: 14rpx;
	height: 12rpx;
	border: 3rpx solid #9e2a2b;
	border-bottom: none;
	border-radius: 8rpx 8rpx 0 0;
}
.lock-body {
	width: 26rpx;
	height: 18rpx;
	border: 3rpx solid #9e2a2b;
	border-radius: 4rpx;
}

/* --- 密码可见图标 --- */
.toggle-password {
	position: absolute;
	right: 40rpx;
	top: 0;
	height: 110rpx;
	display: flex;
	align-items: center;
	z-index: 10;
	padding-left: 20rpx;
}
.eye-icon {
	width: 32rpx;
	height: 20rpx;
	border: 2rpx solid #ccc;
	border-radius: 50% 50%;
	position: relative;
}
.eye-open { border-color: #9e2a2b; }
.eye-open::after {
	content: '';
	position: absolute;
	left: 10rpx;
	top: 4rpx;
	width: 8rpx;
	height: 8rpx;
	background: #9e2a2b;
	border-radius: 50%;
}

/* --- 登录按钮 --- */
.btn-login {
	width: 100%;
	height: 110rpx;
	line-height: 110rpx;
	background: linear-gradient(135deg, #9e2a2b, #c53e3f);
	color: #fff;
	font-size: 34rpx;
	font-weight: bold;
	border-radius: 20rpx;
	box-shadow: 0 16rpx 36rpx rgba(158, 42, 43, 0.2);
	margin-top: 40rpx;
	letter-spacing: 12rpx;
}
.btn-login::after { border: none; }
.btn-hover-active { transform: scale(0.98); opacity: 0.95; }

/* 链接区域 */
.links-row {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 40rpx;
	font-size: 26rpx;
}
.link-divider {
	width: 2rpx;
	height: 24rpx;
	background-color: #ddd;
	margin: 0 30rpx;
}
.link-text { color: #888; }
.link-text.highlight { color: #9e2a2b; font-weight: bold; }

/* --- 底部微信登录 (绿色版) --- */
.footer-section {
	margin-top: auto;
	padding: 0 70rpx 80rpx;
}
.divider {
	display: flex;
	align-items: center;
	margin-bottom: 40rpx;
}
.divider-line { flex: 1; height: 1rpx; background: linear-gradient(to right, transparent, #eee, transparent); }
.divider-text { color: #bbb; font-size: 22rpx; margin: 0 24rpx; }

/* 微信按钮样式 */
.btn-wechat {
	width: 100%;
	height: 100rpx;
	background-color: #07c160; /* 微信标准绿 */
	border-radius: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.2);
	border: none;
	position: relative;
	overflow: hidden;
}
.btn-wechat::after { border: none; }
.wechat-hover { opacity: 0.9; transform: scale(0.99); }

.wechat-icon {
	width: 44rpx;
	height: 44rpx;
	margin-right: 16rpx;
}
.wechat-text {
	color: #ffffff;
	font-size: 30rpx;
	font-weight: 500;
}

.agreement-text {
	font-size: 22rpx;
	color: #aaa;
	text-align: center;
	margin-top: 40rpx;
}
.highlight-text { color: #9e2a2b; }

/* --- 动画 --- */
.fade-in-up { animation: fadeInUp 0.8s ease-out both; }
.fade-in-up-delay-1 { animation: fadeInUp 0.8s ease-out 0.2s both; }
.fade-in-up-delay-2 { animation: fadeInUp 0.8s ease-out 0.4s both; }

@keyframes fadeInUp {
	from { opacity: 0; transform: translateY(40rpx); }
	to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
	0%, 100% { transform: scale(1); opacity: 0.05; }
	50% { transform: scale(1.1); opacity: 0.1; }
}
</style>