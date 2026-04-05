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

				<!-- 🔥 唯一修改：地域输入框 → 点击选择框（样式完全一致） -->
				<view class="input-group">
					<view class="input-label">地域</view>
					<view 
						class="form-input region-select" 
						@tap="openRegionModal"
					>
						{{ formData.region || '请选择所在地域' }}
					</view>
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

		<!-- 🔥 新增：地域选择弹窗（带搜索，风格完全匹配页面） -->
		<view v-if="showRegionModal" class="modal-mask" @tap="showRegionModal=false">
			<view class="modal-content" @tap.stop>
				<view class="modal-header">
					<text>选择省市</text>
					<text class="close-btn" @tap="showRegionModal=false">关闭</text>
				</view>
				<input 
					class="search-input" 
					v-model="searchKey" 
					placeholder="输入省市名称搜索"
					@input="handleSearch"
				/>
				<scroll-view class="region-list" scroll-y>
					<view 
						class="region-item" 
						v-for="(item, index) in regionList" 
						:key="index"
						@tap="selectRegion(item)"
					>
						{{ item.province }} {{ item.city }}
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import { API_CONFIG } from '../../api/config';
// 🔥 新增：引入省市数据
import { provinceList, cityList } from './china-area.js';

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
			],
			// 🔥 新增：地域选择相关数据
			showRegionModal: false,
			searchKey: '',
			regionList: [],
			allRegionData: []
		};
	},
	
	onLoad() {
		// 🔥 新增：初始化省市数据
		this.initRegionData();
	},
	
	computed: {
		isFormValid() {
			return this.formData.phone !== '' && 
				   this.formData.gender !== '' &&
				   this.formData.birthday !== '';
		}
	},
	
	methods: {
		// 🔥 新增：初始化所有省市数据
		initRegionData() {
			let data = [];
			provinceList.forEach((province, pIndex) => {
				cityList[pIndex].forEach(city => {
					data.push({ province, city });
				});
			});
			this.allRegionData = data;
			this.regionList = data;
		},
		
		// 🔥 新增：打开地域选择弹窗
		openRegionModal() {
			this.showRegionModal = true;
			this.searchKey = '';
			this.regionList = this.allRegionData;
		},
		
		// 🔥 新增：搜索省市
		handleSearch() {
			if (!this.searchKey.trim()) {
				this.regionList = this.allRegionData;
				return;
			}
			const key = this.searchKey.trim();
			this.regionList = this.allRegionData.filter(item => 
				item.province.includes(key) || item.city.includes(key)
			);
		},
		
		// 🔥 新增：选择地域
		selectRegion(item) {
			this.formData.region = `${item.province} ${item.city}`;
			this.showRegionModal = false;
		},
		
		// 👇 以下所有原有方法完全保留，无任何修改
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
		
		async uploadAvatar(filePath) {
			uni.showLoading({ title: '上传中...', mask: true });
			
			try {
				const token = uni.getStorageSync('token');
				if (!token) {
					uni.hideLoading();
					uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/Login/index' });
					}, 1000);
					return;
				}
				
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
		
		selectGender(value) {
			this.formData.gender = value;
		},
		
		onBirthdayChange(e) {
			this.formData.birthday = e.detail.value;
		},
		
		async handleSubmit() {
			if (!this.validateForm()) return;
			
			this.isLoading = true;
			uni.showLoading({ title: '提交中...', mask: true });
			
			try {
				const token = uni.getStorageSync('token');
				if (!token) {
					uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/Login/index' });
					}, 1000);
					return;
				}
				
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
						
						const userInfo = uni.getStorageSync('userInfo') || {};
						uni.setStorageSync('userInfo', { ...userInfo, ...this.formData });
						
						setTimeout(() => {
							uni.reLaunch({ url: '/pages/Main/index' });
						}, 800);
					} else {
						uni.showToast({ title: res.data.msg || '提交失败', icon: 'none' });
					}
				} else {
					uni.showToast({ title: '网络连接异常', icon: 'none' });
				}
			} catch (error) {
				uni.hideLoading();
				this.isLoading = false;
				console.error('提交异常:', error);
				uni.showToast({ title: '网络连接异常', icon: 'none' });
			}
		},
		
		validateForm() {
			if (!this.formData.phone) {
				uni.showToast({ title: '请输入手机号', icon: 'none' });
				return false;
			}
			if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
				uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
				return false;
			}
			
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
		
		skipComplete() {
			uni.reLaunch({ url: '/pages/Main/index' });
		}
	}
};
</script>

<style scoped>
/* --- 原有样式完全保留，无任何修改 --- */
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
	padding-bottom: 60rpx;
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

.form-section {
	padding: 0 70rpx;
	z-index: 1;
}

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
	display: flex;
	align-items: center;
}
.form-input:focus {
	border-color: rgba(158, 42, 43, 0.15);
	background-color: #fff;
}
.custom-placeholder { color: #c4c4c4; font-size: 28rpx; }

/* 🔥 新增：地域选择框点击样式 */
.region-select {
	cursor: pointer;
	color: #333;
}
.region-select:empty::before {
	content: '请选择所在地域';
	color: #c4c4c4;
}

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

.btn-submit[disabled] {
	background: linear-gradient(135deg, #cccccc, #999999);
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
	opacity: 0.7;
	pointer-events: none;
}

.btn-skip {
	width: 100%;
	height: 100rpx;
	line-height: 100rpx;
	background-color: transparent;
	color: #9e2a2b;
	font-size: 30rpx;
	font-weight: bold;
	border-radius: 20rpx;
	border: 3rpx solid #9e2a2b;
	box-sizing: border-box;
	margin-top: 30rpx;
	letter-spacing: 4rpx;
	transition: all 0.3s ease;
}
.btn-skip::after { border: none; }
.btn-skip-hover {
	background-color: rgba(158, 42, 43, 0.05);
	transform: scale(0.98);
	opacity: 0.9;
}

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

/* 🔥 新增：地域弹窗样式（完全匹配页面风格） */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	background: rgba(0,0,0,0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}
.modal-content {
	width: 85%;
	background: #fff;
	border-radius: 20rpx;
	max-height: 70vh;
	overflow: hidden;
	box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.2);
}
.modal-header {
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1rpx solid #f0f0f0;
	font-size: 30rpx;
	font-weight: 500;
	color: #332c2b;
}
.close-btn {
	color: #9e2a2b;
	font-size: 28rpx;
}
.search-input {
	width: 100%;
	height: 80rpx;
	padding: 0 30rpx;
	background-color: #fdfbf7;
	border-bottom: 1rpx solid #f0f0f0;
	font-size: 28rpx;
	color: #333;
	box-sizing: border-box;
}
.region-list {
	max-height: 400rpx;
}
.region-item {
	padding: 24rpx 30rpx;
	border-bottom: 1rpx solid #f8f8f8;
	font-size: 28rpx;
	color: #5d5555;
}
.region-item:active {
	background-color: rgba(158, 42, 43, 0.08);
	color: #9e2a2b;
}
</style>