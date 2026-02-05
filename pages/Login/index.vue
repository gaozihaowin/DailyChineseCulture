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
					:disabled="!isFormValid || isLoading || !isAgree"
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
				
				<view class="agreement-group" @tap="toggleAgree">
					<view class="agree-checkbox" :class="isAgree ? 'agree-checked' : ''">
						<view class="check-icon" v-if="isAgree">✓</view>
					</view>
					<view class="agreement-text">
						登录即代表同意 
						<text class="highlight-text" @tap="showAgreement">《用户协议》</text> 
						与 
						<text class="highlight-text" @tap="showPrivacy">《隐私政策》</text>
					</view>
				</view>
			</view>

		</view>

		<view v-if="showWxAuthModal" class="wx-auth-modal" @tap="hideWxAuthModal">
			<view class="wx-auth-content" @tap.stop>
				<view class="wx-auth-title">完善登录资料</view>
				<view class="wx-auth-desc">选择你的微信头像和昵称，完成登录</view>
				
				<button 
					class="avatar-select-btn" 
					open-type="chooseAvatar" 
					@chooseavatar="onChooseAvatar"
				>
					<image :src="wxUserInfo.avatar" class="avatar-preview" mode="aspectFill" />
					<text class="avatar-tip" v-if="!wxUserInfo.avatar">点击选择微信头像</text>
				</button>
				
				<input 
					class="nickname-input" 
					type="nickname" 
					v-model="wxUserInfo.nickname"
					placeholder="点击选择/输入微信昵称"
					placeholder-class="nickname-placeholder"
				/>
				
				<button 
					class="wx-auth-confirm-btn" 
					@tap="submitWxLogin"
					:class="{ disabled: !wxUserInfo.avatar || !wxUserInfo.nickname }"
				>
					确认登录
				</button>
				<button class="wx-auth-cancel" @tap="hideWxAuthModal">取消</button>
			</view>
		</view>
	</view>
</template>

<script>
import { API_CONFIG } from '../../api/config';

export default {
	data() {
		return {
			username: '',
			password: '',
			showPassword: false,
			isLoading: false,
			isAgree: false,
			showWxAuthModal: false, 
			wxCode: '', 
			isWxSubmitting: false, 
			wxUserInfo: { 
				avatar: '',
				nickname: ''
			}
		};
	},
	
	computed: {
		isFormValid() {
			return this.username.trim() !== '' && this.password.trim() !== '';
		},
		
		usernamePlaceholder() {
			return this.username.trim() === '' ? '请输入手机号/账号' : '';
		}
	},
	
	methods: {
		togglePassword() {
			this.showPassword = !this.showPassword;
		},
		
		toggleAgree() {
			this.isAgree = !this.isAgree;
		},
		
		// 账号密码登录 - 修复跳转逻辑
		handleLogin() {
			if (!this.isAgree) {
				uni.showToast({ title: '请先同意协议', icon: 'none' });
				return;
			}
			if (!this.validateForm()) return;

			this.isLoading = true;
			uni.showLoading({ title: '登录中...', mask: true });

			try {
				uni.request({
					url: API_CONFIG.baseUrl + API_CONFIG.paths.login,
					method: 'POST',
					header: { 'content-type': 'application/json' },
					data: {
						username: this.username.trim(),
						password: this.password.trim()
					},
					success: (res) => {
						uni.hideLoading();
						this.isLoading = false;
						const apiData = res.data;

						if (res.statusCode === 200 && apiData.code === 0) {
							// 修复1：确保缓存成功后再跳转
							uni.setStorageSync('token', apiData.data.token);
							uni.setStorageSync('userInfo', apiData.data.userInfo);
							uni.showToast({ title: '登录成功', icon: 'success' });
							
							// 修复2：使用try-catch捕获跳转错误，添加延时确保Toast显示
							setTimeout(() => {
								try {
									// 重点：确认路径正确！如果首页路径是/pages/index/index，需修改为对应路径
									uni.reLaunch({ 
										url: '/pages/Main/index',
										success: () => {
											console.log('跳转成功：已进入首页');
										},
										fail: (err) => {
											// 修复3：打印跳转失败原因，方便排查路径问题
											console.error('跳转失败：', err);
											uni.showToast({ title: `跳转失败：${err.errMsg}`, icon: 'none' });
										}
									});
								} catch (error) {
									console.error('跳转异常：', error);
									uni.showToast({ title: '页面跳转异常', icon: 'none' });
								}
							}, 1000);
						} else {
							uni.showToast({ 
								title: apiData.msg || '登录失败，请检查账号密码', 
								icon: 'none',
								duration: 2000
							});
						}
					},
					fail: (error) => {
						uni.hideLoading();
						this.isLoading = false;
						console.error('API Error:', error);
						uni.showToast({ title: '网络连接异常', icon: 'none' });
					}
				});
			} catch (error) {
				uni.hideLoading();
				this.isLoading = false;
				console.error('登录失败:', error);
				uni.showToast({ title: '网络连接异常', icon: 'none' });
			}
		},
		
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
			if (/^1[3-9]\d{9}$/.test(username) && password.length < 6) {
				uni.showToast({ title: '密码长度不能少于6位', icon: 'none' });
				return false;
			}
			return true;
		},
		
		onUsernameInput(e) {
			this.username = e.detail.value;
		},
		
		onPasswordInput(e) {
			this.password = e.detail.value;
		},
		
		async wechatLogin() {
			if (!this.isAgree) {
				uni.showToast({ title: '请先同意协议', icon: 'none' });
				return;
			}
			
			try {
				const wxLoginRes = await new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: resolve,
						fail: (err) => reject(new Error(`微信授权失败：${err.errMsg}`))
					});
				});

				if (!wxLoginRes.code) {
					uni.showToast({ title: '微信授权失败', icon: 'none' });
					return;
				}
				
				this.wxCode = wxLoginRes.code;
				this.showWxAuthModal = true;
			} catch (error) {
				uni.showToast({ title: error.message, icon: 'none', duration: 2000 });
			}
		},

		onChooseAvatar(e) {
			this.wxUserInfo.avatar = e.detail.avatarUrl;
		},
		
		// 微信登录 - 修复跳转逻辑
		async submitWxLogin() {
			if (!this.wxUserInfo.avatar) {
				uni.showToast({ title: '请先选择微信头像', icon: 'none' });
				return;
			}
			if (!this.wxUserInfo.nickname) {
				uni.showToast({ title: '请选择/输入微信昵称', icon: 'none' });
				return;
			}
			if (this.isWxSubmitting) return;
			this.isWxSubmitting = true;

			try {
				uni.showLoading({ title: '微信登录中...', mask: true });
				
				const response = await uni.request({
					url: API_CONFIG.baseUrl + API_CONFIG.paths.wechatLogin,
					method: 'POST',
					header: { 'content-type': 'application/json' },
					data: {
						code: this.wxCode,
						nickname: this.wxUserInfo.nickname,
						avatar: this.wxUserInfo.avatar
					}
				});
				uni.hideLoading();
				
				const apiData = response.data || {};
				if (response.statusCode === 200 && apiData.code === 0) {
					uni.setStorageSync('token', apiData.data.token);
					uni.setStorageSync('userInfo', {
						nickname: this.wxUserInfo.nickname,
						avatar: this.wxUserInfo.avatar,
						...apiData.data.userInfo
					});
					uni.showToast({ title: '微信登录成功', icon: 'success' });
					
					// 同样修复微信登录的跳转逻辑
					setTimeout(() => {
						try {
							uni.reLaunch({
								url: '/pages/Main/index',
								success: () => {
									console.log('微信登录跳转成功');
								},
								fail: (err) => {
									console.error('微信登录跳转失败：', err);
									uni.showToast({ title: `跳转失败：${err.errMsg}`, icon: 'none' });
								}
							});
						} catch (error) {
							console.error('微信登录跳转异常：', error);
							uni.showToast({ title: '页面跳转异常', icon: 'none' });
						}
					}, 500);
				} else {
					uni.showToast({
						title: apiData.msg || '微信登录失败，请稍后重试',
						icon: 'none',
						duration: 2000
					});
				}
			} catch (error) {
				uni.hideLoading();
				uni.showToast({ title: error.message || '微信登录异常', icon: 'none', duration: 2000 });
			} finally {
				this.isWxSubmitting = false;
				this.hideWxAuthModal();
			}
		},

		hideWxAuthModal() {
			this.showWxAuthModal = false;
			this.wxUserInfo = { avatar: '', nickname: '' };
		},
		
		forgetPassword() {
			uni.showToast({ title: '请联系管理员重置', icon: 'none' });
		},
		
		register() {
			uni.showToast({ title: '暂未开放注册', icon: 'none' });
		},
		
		showAgreement() {
			uni.showToast({ title: '用户协议', icon: 'none' });
		},
		
		showPrivacy() {
			uni.showToast({ title: '隐私政策', icon: 'none' });
		},
	}
};
</script>

<style scoped>
/* 原样式不变，此处省略重复样式 */
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
	padding: 0 100rpx;
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
.form-input[disabled] {
	background-color: #f5f5f5;
	color: #999;
}
.custom-placeholder { color: #c4c4c4; font-size: 28rpx; }

.input-icon-box {
	position: absolute;
	left: 36rpx;
	top: 0;
	height: 110rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}
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
.btn-login[disabled] {
	background: linear-gradient(135deg, #cccccc, #999999);
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
	opacity: 0.7;
	pointer-events: none;
}

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

.footer-section {
  margin-top: 120rpx;
  padding: 0 70rpx 80rpx;
  z-index: 1;
}
.divider {
	display: flex;
	align-items: center;
	margin-bottom: 50rpx;
}
.divider-line { flex: 1; height: 1rpx; background: linear-gradient(to right, transparent, #eee, transparent); }
.divider-text { color: #bbb; font-size: 22rpx; margin: 0 24rpx; }

.btn-wechat {
	width: 100%;
	height: 100rpx;
  background-color: #07c160 !important;
	border-radius: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.2);
	border: none;
	position: relative;
	overflow: hidden;
  margin-bottom: 30rpx;
}
.btn-wechat::after { border: none !important; }
.wechat-hover { opacity: 0.95; transform: scale(0.99); }
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

.agreement-group {
	display: flex;
	align-items: center;
	justify-content: center;
}
.agree-checkbox {
	width: 28rpx;
	height: 28rpx;
	border: 2rpx solid #ccc;
	border-radius: 6rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12rpx;
}
.agree-checked {
	background-color: #9e2a2b;
	border-color: #9e2a2b;
}
.check-icon {
	color: #fff;
	font-size: 20rpx;
}
.agreement-text {
	font-size: 22rpx;
	color: #aaa;
	text-align: center;
}
.highlight-text { color: #9e2a2b; }

.wx-auth-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.wx-auth-content {
  width: 85%;
  max-width: 650rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx 30rpx;
  text-align: center;
}
.wx-auth-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}
.wx-auth-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}
.avatar-select-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto 40rpx;
  padding: 0;
  border: 2rpx dashed #ddd;
}
.avatar-select-btn::after { border: none; }
.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.avatar-tip {
  font-size: 24rpx;
  color: #999;
}
.nickname-input {
  width: 100%;
  height: 90rpx;
  padding: 0 30rpx;
  background-color: #f9f9f9;
  border-radius: 45rpx;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 36rpx;
  box-sizing: border-box;
}
.nickname-placeholder {
  color: #bbb;
  font-size: 26rpx;
}
.wx-auth-confirm-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background-color: #07c160;
  color: #fff;
  font-size: 32rpx;
  border-radius: 48rpx;
  margin-bottom: 20rpx;
}
.wx-auth-confirm-btn::after { border: none; }
.wx-auth-confirm-btn.disabled {
  background-color: #ccc;
  color: #fff;
  opacity: 0.7;
  pointer-events: none;
}
.wx-auth-cancel {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background-color: #f5f5f5;
  color: #666;
  font-size: 32rpx;
  border-radius: 48rpx;
}
.wx-auth-cancel::after { border: none; }

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