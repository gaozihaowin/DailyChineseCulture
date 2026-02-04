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
						:placeholder="usernamePlaceholder"
						placeholder-class="custom-placeholder"
						@input="onUsernameInput"
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
						@input="onPasswordInput"
					/>
					<view class="toggle-password" @tap="togglePassword">
						<view :class="['eye-icon', showPassword ? 'eye-open' : '']"></view>
					</view>
				</view>

				<button 
					class="btn-login ripple" 
					@tap="handleLogin" 
					hover-class="btn-hover-active"
					:disabled="!isFormValid || isLoading"
				>
					<text v-if="isLoading">登录中...</text>
					<text v-else>登录/注册</text>
				</button>

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
// 引入优化后的工具类
import apiClient from '@/utils/request';
import { isValidPhone, debounce } from '@/utils/common';

export default {
	data() {
		return {
			username: '',
			password: '',
			showPassword: false,
			isLoading: false
		};
	},
	
	computed: {
		// 计算属性：判断表单是否有效
		isFormValid() {
			return this.username.trim() !== '' && this.password.trim() !== '';
		},
		
		// 计算属性：用户名输入提示
		usernamePlaceholder() {
			return this.username.trim() === '' ? '请输入手机号/账号' : '';
		}
	},
	
	methods: {
		togglePassword() {
			this.showPassword = !this.showPassword;
		},
		
		// 防抖处理的登录方法
		handleLogin: debounce(async function() {
			await this.performLogin();
		}, 300),
		
		// 核心登录逻辑
		async performLogin() {
			// 1. 表单验证
			if (!this.validateForm()) return;
			
			// 2. 设置加载状态
			this.isLoading = true;
			
			try {
				// 3. 调用API
				const result = await apiClient.post('/login', {
					username: this.username.trim(),
					password: this.password.trim()
				}, {
					loadingText: '登录中...'
				});
				
				// 4. 处理登录成功
				this.handleLoginSuccess(result);
				
			} catch (error) {
				// 5. 处理登录失败
				this.handleLoginError(error);
			} finally {
				// 6. 重置加载状态
				this.isLoading = false;
			}
		},
		
		// 表单验证
		validateForm() {
			const username = this.username.trim();
			const password = this.password.trim();
			
			if (!username) {
				uni.showToast({ title: '请输入账号', icon: 'none' });
				return false;
			}
			
			if (!password) {
				uni.showToast({ title: '请输入密码', icon: 'none' });
				return false;
			}
			
			// 手机号格式验证（如果是手机号登录）
			if (isValidPhone(username)) {
				if (password.length < 6) {
					uni.showToast({ title: '密码长度不能少于6位', icon: 'none' });
					return false;
				}
			}
			
			return true;
		},
		
		// 登录成功处理
		handleLoginSuccess(result) {
			// 保存用户信息
			uni.setStorageSync('token', result.token);
			uni.setStorageSync('userInfo', result.userInfo);
			
			uni.showToast({ 
				title: '登录成功', 
				icon: 'success',
				duration: 1500
			});
			
			// 延迟跳转
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/Main/index'
				});
			}, 1000);
		},
		
		// 登录失败处理
		handleLoginError(error) {
			console.error('登录失败:', error);
			// 错误已在apiClient中统一处理，这里可以添加额外的业务逻辑
		},
		
		// 用户名输入处理
		onUsernameInput(e) {
			this.username = e.detail.value;
			// 可以添加实时验证逻辑
		},
		
		// 密码输入处理
		onPasswordInput(e) {
			this.password = e.detail.value;
			// 可以添加密码强度提示
		},
		

		// 微信登录
		async wechatLogin() {
			try {
				// 检查是否支持微信登录
				// #ifdef MP-WEIXIN
				const [err, loginRes] = await uni.login();
				if (err) {
					throw new Error('微信登录失败');
				}
				
				// 调用后端微信登录接口
				const result = await apiClient.post('/auth/wechat-login', {
					code: loginRes.code
				});
				
				this.handleLoginSuccess(result);
				// #endif
				
				// #ifndef MP-WEIXIN
				uni.showToast({ title: '请在微信中使用此功能', icon: 'none' });
				// #endif
			} catch (error) {
				console.error('微信登录异常:', error);
				uni.showToast({ title: '微信登录失败', icon: 'none' });
			}
		},
		
		// 忘记密码
		forgetPassword() {
			uni.showToast({ title: '请联系管理员重置', icon: 'none' });
		},
		
		// 注册
		register() {
			uni.showToast({ title: '暂未开放注册', icon: 'none' });
		},
		
		// 显示用户协议
		showAgreement() {
			uni.navigateTo({
				url: '/pages/Agreement/index?type=user'
			});
		},
		
		// 显示隐私政策
		showPrivacy() {
			uni.navigateTo({
				url: '/pages/Agreement/index?type=privacy'
			});
		},
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

/* 输入框禁用状态 */
.form-input[disabled] {
	background-color: #f5f5f5;
	color: #999;
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
	transition: all 0.3s ease;
}
.btn-login::after { border: none; }
.btn-hover-active { transform: scale(0.98); opacity: 0.95; }

/* 按钮禁用状态 */
.btn-login[disabled] {
	background: linear-gradient(135deg, #cccccc, #999999);
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
	opacity: 0.7;
	pointer-events: none;
}

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