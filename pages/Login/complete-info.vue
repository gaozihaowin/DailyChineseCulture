<template>
	<view class="page-container">
		<view class="mobile-frame">
			
			<view class="bg-decoration">
				<view class="bg-circle animate-pulse"></view>
			</view>

			<view class="header-section fade-in-up">
				<view class="logo-seal">良知</view>
				<view class="app-name">完善个人信息</view>
				<view class="app-slogan">请补充您的基本信息</view>
			</view>

			<view class="form-section fade-in-up-delay-1">
				
				<view class="avatar-section">
					<view class="avatar-box" @tap="chooseAvatar">
						<image v-if="formData.avatar" :src="formData.avatar" class="avatar-image" mode="aspectFill"></image>
						<view v-else class="avatar-placeholder">
							<text class="avatar-icon">+</text>
							<text class="avatar-text">上传头像</text>
						</view>
					</view>
				</view>

				<view class="input-group">
					<view class="input-label">手机号</view>
					<input 
						class="form-input" 
						type="number" 
						v-model="formData.phone"
						placeholder="请输入手机号"
						placeholder-class="custom-placeholder"
						maxlength="11"
					/>
				</view>

				<view class="input-group">
					<view class="input-label">性别</view>
					<view class="gender-options">
						<view 
							v-for="item in genderOptions" 
							:key="item.value"
							:class="['gender-item', { active: formData.gender === item.value }]"
							@tap="selectGender(item.value)"
						>
							<text>{{ item.label }}</text>
						</view>
					</view>
				</view>

				<view class="input-group">
					<view class="input-label">生日</view>
					<picker 
						mode="date" 
						:value="formData.birthday" 
						@change="onBirthdayChange"
						class="picker-input"
					>
						<view class="picker-text">
							{{ formData.birthday || '请选择生日' }}
						</view>
					</picker>
				</view>

				<view class="input-group">
					<view class="input-label">地域</view>
					<input 
						class="form-input" 
						type="text" 
						v-model="formData.region"
						placeholder="请输入所在地域"
						placeholder-class="custom-placeholder"
					/>
				</view>

				<view class="input-group">
					<view class="input-label">职业</view>
					<input 
						class="form-input" 
						type="text" 
						v-model="formData.profession"
						placeholder="请输入职业"
						placeholder-class="custom-placeholder"
					/>
				</view>

				<button 
					class="btn-submit ripple" 
					@tap="handleSubmit" 
					hover-class="btn-hover-active"
					:disabled="!isFormValid || isLoading"
				>
					<text v-if="isLoading">提交中...</text>
					<text v-else>提交信息</text>
				</button>

				<button 
					class="btn-skip ripple" 
					@tap="skipComplete" 
					hover-class="btn-skip-hover"
				>
					跳过，稍后完善
				</button>
				
			</view>

		</view>
	</view>
</template>

<script>
import { API_CONFIG } from '../../api/config';

export default {
	data() {
		return {
			formData: {
				avatar: '',
				phone: '',
				region: '',
				birthday: '',
				profession: '',
				gender: 0
			},
			isLoading: false,
			genderOptions: [
				{ label: '未知', value: 0 },
				{ label: '男', value: 1 },
				{ label: '女', value: 2 }
			]
		};
	},
	
	computed: {
		// 计算属性：判断表单是否有效
		isFormValid() {
			return this.formData.phone !== '' && 
				   this.formData.gender !== '' &&
				   this.formData.birthday !== '';
		}
	},
	
	methods: {
		// 选择头像
		chooseAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFilePaths = res.tempFilePaths;
					this.uploadAvatar(tempFilePaths[0]);
				}
			});
		},
		
		// 上传头像
		async uploadAvatar(filePath) {
			uni.showLoading({ title: '上传中...', mask: true });
			
			try {
				// 读取token
				const token = uni.getStorageSync('token');
				if (!token) {
					uni.hideLoading();
					uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/Login/index' });
					}, 1000);
					return;
				}
				
				// 调用后端上传接口
				uni.uploadFile({
					url: API_CONFIG.baseUrl + API_CONFIG.paths.upload + '?type=avatar',
					filePath: filePath,
					name: 'file',
					header: {
						'Authorization': 'Bearer ' + token
					},
					success: (res) => {
						uni.hideLoading();

						try {
							const response = JSON.parse(res.data);

							if (response.code === 200) {
								this.formData.avatar = response.data;
								uni.showToast({ title: '上传成功', icon: 'success' });
							} else {
								uni.showToast({
									title: response.msg || response.message || '上传失败',
									icon: 'none'
								});
							}
						} catch (parseError) {
							uni.showToast({ title: '服务器返回数据格式错误', icon: 'none' });
							console.error('解析响应失败:', parseError);
						}
					},
					fail: (error) => {
						uni.hideLoading();
						console.error('上传失败:', error);
						uni.showToast({
							title: error.errMsg || '网络连接异常',
							icon: 'none'
						});
					}
				});
			} catch (error) {
				uni.hideLoading();
				console.error('上传异常:', error);
				uni.showToast({ title: '上传异常', icon: 'none' });
			}
		},
		
		// 选择性别
		selectGender(value) {
			this.formData.gender = value;
		},
		
		// 生日变化
		onBirthdayChange(e) {
			this.formData.birthday = e.detail.value;
		},
		
		// 提交表单
		async handleSubmit() {
			// 表单验证
			if (!this.validateForm()) return;
			
			// 设置加载状态
			this.isLoading = true;
			uni.showLoading({ title: '提交中...', mask: true });
			
			try {
				// 读取token
				const token = uni.getStorageSync('token');
				if (!token) {
					uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/Login/index' });
					}, 1000);
					return;
				}
				
				// 调用后端接口更新用户信息
				const res = await uni.request({
					url: API_CONFIG.baseUrl + API_CONFIG.paths.updateUser,
					method: 'POST',
					header: {
						'content-type': 'application/json',
						'Authorization': 'Bearer ' + token
					},
					data: this.formData
				});
				
				uni.hideLoading();
				this.isLoading = false;
				
				if (res.statusCode === 200) {
					if (res.data.code === 200) {
						uni.showToast({ title: '信息提交成功', icon: 'success' });
						
						// 更新本地用户信息
						const userInfo = uni.getStorageSync('userInfo') || {};
						uni.setStorageSync('userInfo', { ...userInfo, ...this.formData });
						
						// 延迟跳转到首页
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/Main/index'
							});
						}, 800); // 800ms延迟，确保用户能看清提示
					} else {
						// 后端返回非200错误
						uni.showToast({ 
							title: res.data.msg || '提交失败', 
							icon: 'none' 
						});
					}
				} else {
					// HTTP状态码非200
					uni.showToast({ 
						title: '网络连接异常', 
						icon: 'none' 
					});
				}
			} catch (error) {
				uni.hideLoading();
				this.isLoading = false;
				console.error('提交异常:', error);
				uni.showToast({ title: '网络连接异常', icon: 'none' });
			}
		},
		
		// 表单验证
		validateForm() {
			// 手机号验证：必填且满足11位手机号正则
			if (!this.formData.phone) {
				uni.showToast({ title: '请输入手机号', icon: 'none' });
				return false;
			}
			if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
				uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
				return false;
			}
			
			// 其他必填项验证
			if (!this.formData.gender) {
				uni.showToast({ title: '请选择性别', icon: 'none' });
				return false;
			}
			if (!this.formData.birthday) {
				uni.showToast({ title: '请选择生日', icon: 'none' });
				return false;
			}
			
			return true;
		},
		
		// 跳过完善，直接去首页
		skipComplete() {
			uni.reLaunch({
				url: '/pages/Main/index'
			});
		}
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
	padding-bottom: 60rpx; /* 增加底部内边距，防止按钮贴底 */
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
	padding-top: 100rpx;
	padding-bottom: 40rpx;
	text-align: center;
	z-index: 1;
}
.logo-seal {
	width: 100rpx;
	height: 100rpx;
	background-color: #9e2a2b;
	color: #fff;
	font-size: 50rpx;
	line-height: 100rpx;
	border-radius: 20rpx;
	margin: 0 auto 24rpx;
	box-shadow: 0 12rpx 40rpx rgba(158, 42, 43, 0.25);
	font-weight: bold;
}
.app-name {
	font-size: 36rpx;
	font-weight: 700;
	color: #332c2b;
	letter-spacing: 4rpx;
}
.app-slogan {
	font-size: 24rpx;
	color: #a09594;
	margin-top: 8rpx;
}

/* --- 表单区域 --- */
.form-section {
	padding: 0 70rpx;
	z-index: 1;
}

/* --- 头像区域 --- */
.avatar-section {
	display: flex;
	justify-content: center;
	margin-bottom: 40rpx;
}
.avatar-box {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	background-color: #fff;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid rgba(158, 42, 43, 0.1);
}
.avatar-image {
	width: 100%;
	height: 100%;
}
.avatar-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #ccc;
}
.avatar-icon {
	font-size: 60rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
}
.avatar-text {
	font-size: 20rpx;
}

/* --- 输入组 --- */
.input-group {
	margin-bottom: 32rpx;
}
.input-label {
	font-size: 28rpx;
	color: #5d5555;
	margin-bottom: 16rpx;
	font-weight: 500;
}
.form-input {
	width: 100%;
	height: 100rpx;
	padding: 0 32rpx;
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

/* --- 性别选择 --- */
.gender-options {
	display: flex;
	gap: 24rpx;
}
.gender-item {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	border: 2rpx solid transparent;
	font-size: 28rpx;
	color: #888;
	transition: all 0.3s ease;
}
.gender-item.active {
	background-color: rgba(158, 42, 43, 0.08);
	border-color: #9e2a2b;
	color: #9e2a2b;
	font-weight: bold;
}

/* --- 选择器 --- */
.picker-input {
	width: 100%;
}
.picker-text {
	width: 100%;
	height: 100rpx;
	padding: 0 32rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	font-size: 30rpx;
	color: #333;
	box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);
	display: flex;
	align-items: center;
	border: 2rpx solid transparent;
	transition: all 0.3s;
}
.picker-text:active {
	border-color: rgba(158, 42, 43, 0.15);
}

/* --- 提交按钮 --- */
.btn-submit {
	width: 100%;
	height: 100rpx;
	line-height: 100rpx;
	background: linear-gradient(135deg, #9e2a2b, #c53e3f);
	color: #fff;
	font-size: 32rpx;
	font-weight: bold;
	border-radius: 20rpx;
	box-shadow: 0 16rpx 36rpx rgba(158, 42, 43, 0.2);
	margin-top: 40rpx;
	letter-spacing: 8rpx;
	transition: all 0.3s ease;
}
.btn-submit::after { border: none; }
.btn-hover-active { transform: scale(0.98); opacity: 0.95; }

/* 按钮禁用状态 */
.btn-submit[disabled] {
	background: linear-gradient(135deg, #cccccc, #999999);
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
	opacity: 0.7;
	pointer-events: none;
}

/* --- 跳过按钮 (新) --- */
.btn-skip {
	width: 100%;
	height: 100rpx;
	line-height: 100rpx;
	background-color: transparent; /* 透明背景 */
	color: #9e2a2b; /* 主色调文字 */
	font-size: 30rpx;
	font-weight: bold;
	border-radius: 20rpx;
	border: 3rpx solid #9e2a2b; /* 主色调边框 */
	box-sizing: border-box; /* 确保边框计入宽高 */
	margin-top: 30rpx; /* 与提交按钮拉开间距 */
	letter-spacing: 4rpx;
	transition: all 0.3s ease;
}
.btn-skip::after { border: none; }

/* 点击态 */
.btn-skip-hover {
	background-color: rgba(158, 42, 43, 0.05); /* 轻微背景色 */
	transform: scale(0.98);
	opacity: 0.9;
}

/* --- 动画 --- */
.fade-in-up { animation: fadeInUp 0.8s ease-out both; }
.fade-in-up-delay-1 { animation: fadeInUp 0.8s ease-out 0.2s both; }

@keyframes fadeInUp {
	from { opacity: 0; transform: translateY(40rpx); }
	to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
	0%, 100% { transform: scale(1); opacity: 0.05; }
	50% { transform: scale(1.1); opacity: 0.1; }
}
</style>