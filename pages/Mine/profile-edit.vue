<template>
	<view class="page-container">
		<view class="header-section">
			<view class="header-bg"></view>
			<view class="nav-bar">
				<view class="nav-back" @tap="goBack">
					<uni-icons type="back" size="20" color="#fff"></uni-icons>
				</view>
				<text class="nav-title">个人资料编辑</text>
				<view class="nav-placeholder"></view>
			</view>
		</view>

		<view class="content-section">
			<view class="section-box">
				
				<view class="form-item" @tap="chooseAvatar">
					<view class="form-label">头像</view>
					<view class="form-value">
						<image v-if="form.avatar" :src="form.avatar" class="avatar-preview" mode="aspectFill"></image>
						<view v-else class="avatar-placeholder">
							<text class="avatar-icon">+</text>
							<text class="avatar-text">上传头像</text>
						</view>
						<uni-icons type="right" size="16" color="#ccc"></uni-icons>
					</view>
				</view>

				<view class="form-item" @tap="editNickname">
					<view class="form-label">昵称</view>
					<view class="form-value">
						<text class="value-text">{{ form.nickname || '请设置昵称' }}</text>
						<uni-icons type="right" size="16" color="#ccc"></uni-icons>
					</view>
				</view>

				<view class="form-item">
					<view class="form-label">账号</view>
					<view class="form-value disabled">
						<text class="value-text disabled-text">{{ form.account || '-' }}</text>
					</view>
				</view>

				<view class="form-item" @tap="editPassword">
					<view class="form-label">密码</view>
					<view class="form-value">
						<text class="value-text">点击修改</text>
						<uni-icons type="right" size="16" color="#ccc"></uni-icons>
					</view>
				</view>

				<view class="form-item" @tap="editPhone">
					<view class="form-label">手机号</view>
					<view class="form-value">
						<text class="value-text">{{ form.phone || '请设置手机号' }}</text>
						<uni-icons type="right" size="16" color="#ccc"></uni-icons>
					</view>
				</view>

				<view class="form-item" @tap="editRegion">
					<view class="form-label">地区</view>
					<view class="form-value">
						<text class="value-text">{{ form.region || '请设置地区' }}</text>
						<uni-icons type="right" size="16" color="#ccc"></uni-icons>
					</view>
				</view>

				<view class="form-item" @tap="editProfession">
					<view class="form-label">职业</view>
					<view class="form-value">
						<text class="value-text">{{ form.profession || '请设置职业' }}</text>
						<uni-icons type="right" size="16" color="#ccc"></uni-icons>
					</view>
				</view>

				<view class="form-item" @tap="editGender">
					<view class="form-label">性别</view>
					<view class="form-value">
						<text class="value-text">{{ genderText }}</text>
						<uni-icons type="right" size="16" color="#ccc"></uni-icons>
					</view>
				</view>

				<picker mode="date" :value="form.birthday" @change="onBirthdayChange">
					<view class="form-item">
						<view class="form-label">生日</view>
						<view class="form-value">
							<text class="value-text">{{ form.birthday || '请选择生日' }}</text>
							<uni-icons type="right" size="16" color="#ccc"></uni-icons>
						</view>
					</view>
				</picker>

			</view>

			<view class="save-btn-container">
				<button class="btn-save" @tap="handleSave" hover-class="btn-save-hover">
					<text v-if="isLoading">保存中...</text>
					<text v-else>保存修改</text>
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
			form: {
				avatar: '',
				nickname: '',
				account: '',
				password: '',
				phone: '',
				region: '',
				profession: '',
				gender: 0,
				birthday: ''
			},
			isLoading: false,
			token: ''
		};
	},

	computed: {
		genderText() {
			const genderMap = {
				0: '保密',
				1: '男',
				2: '女'
			};
			return genderMap[this.form.gender] || '保密';
		}
	},

	onLoad() {
		this.token = uni.getStorageSync('token');
		this.fetchUserInfo();
	},

	methods: {
		async fetchUserInfo() {
			if (!this.token) {
				uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
				setTimeout(() => {
					uni.reLaunch({ url: '/pages/Login/index' });
				}, 1000);
				return;
			}

			uni.showLoading({ title: '加载中...', mask: true });

			try {
				const res = await uni.request({
					url: `${API_CONFIG.baseUrl}/user/detail`,
					method: 'GET',
					header: {
						'Authorization': `Bearer ${this.token}`,
						'Content-Type': 'application/json'
					}
				});

				if (res.statusCode === 200 && res.data.code === 200) {
					const data = res.data.data;
					this.form = {
						avatar: data.avatar || '',
						nickname: data.nickname || '',
						account: data.account || '',
						password: data.password || '',
						phone: data.phone || '',
						region: data.region || '',
						profession: data.profession || '',
						gender: data.gender || 0,
						birthday: data.birthday || ''
					};
				} else {
					uni.showToast({ title: res.data.msg || '获取用户信息失败', icon: 'none' });
				}
			} catch (error) {
				console.error('获取用户信息失败:', error);
				uni.showToast({ title: '网络连接异常', icon: 'none' });
			} finally {
				uni.hideLoading();
			}
		},

		chooseAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0];
					
					uni.showLoading({ title: '上传中...', mask: true });
					
					uni.uploadFile({
						url: API_CONFIG.baseUrl + API_CONFIG.paths.upload,
						filePath: tempFilePath,
						name: 'file',
						header: {
							'Authorization': 'Bearer ' + this.token
						},
						success: (uploadRes) => {
							uni.hideLoading();
							try {
								const data = JSON.parse(uploadRes.data);
								if (data.code === 200) {
									this.form.avatar = data.data;
									uni.showToast({ title: '上传成功', icon: 'success' });
								} else {
									uni.showToast({ title: data.msg || '上传失败', icon: 'none' });
								}
							} catch (error) {
								uni.showToast({ title: '上传失败，请重试', icon: 'none' });
							}
						},
						fail: (error) => {
							uni.hideLoading();
							console.error('上传失败:', error);
							uni.showToast({ title: '网络连接异常', icon: 'none' });
						}
					});
				}
			});
		},

		editNickname() {
			uni.showModal({
				title: '编辑昵称',
				placeholderText: '请输入你的昵称',
				editable: true,
				inputValue: this.form.nickname,
				success: (res) => {
					if (res.confirm && res.content) {
						this.form.nickname = res.content.trim();
					}
				}
			});
		},

		editPassword() {
			uni.showModal({
				title: '修改密码',
				placeholderText: '请输入新密码',
				editable: true,
				password: true,
				success: (res) => {
					if (res.confirm && res.content) {
						this.form.password = res.content;
					}
				}
			});
		},

		editPhone() {
			uni.showModal({
				title: '修改手机号',
				placeholderText: '请输入手机号',
				editable: true,
				inputValue: this.form.phone,
				success: (res) => {
					if (res.confirm && res.content) {
						this.form.phone = res.content.trim();
					}
				}
			});
		},

		editRegion() {
			uni.showModal({
				title: '修改地区',
				placeholderText: '请输入所在地区',
				editable: true,
				inputValue: this.form.region,
				success: (res) => {
					if (res.confirm && res.content) {
						this.form.region = res.content.trim();
					}
				}
			});
		},

		editProfession() {
			uni.showModal({
				title: '修改职业',
				placeholderText: '请输入职业',
				editable: true,
				inputValue: this.form.profession,
				success: (res) => {
					if (res.confirm && res.content) {
						this.form.profession = res.content.trim();
					}
				}
			});
		},

		editGender() {
			uni.showActionSheet({
				itemList: ['男', '女', '保密'],
				success: (res) => {
					const map = [1, 2, 0];
					this.form.gender = map[res.tapIndex];
				}
			});
		},

		onBirthdayChange(e) {
			this.form.birthday = e.detail.value;
		},



		async handleSave() {
			uni.showLoading({ title: '保存中...', mask: true });
			this.isLoading = true;

			try {
				const res = await uni.request({
					url: `${API_CONFIG.baseUrl}/user/updateAll`,
					method: 'POST',
					header: {
						'Authorization': `Bearer ${this.token}`,
						'Content-Type': 'application/json'
					},
					data: this.form
				});

				if (res.statusCode === 200 && res.data.code === 200) {
					uni.hideLoading();
					this.isLoading = false;
					uni.showToast({ title: '保存成功', icon: 'success' });

					setTimeout(() => {
						const pages = getCurrentPages();
						if (pages.length > 1) {
							const prevPage = pages[pages.length - 2];
							if (prevPage.$vm && prevPage.$vm.fetchUserInfo) {
								prevPage.$vm.fetchUserInfo();
							}
						}
						uni.navigateBack();
					}, 500);
				} else {
					uni.hideLoading();
					this.isLoading = false;
					uni.showToast({ title: res.data.msg || '保存失败', icon: 'none' });
				}
			} catch (error) {
				uni.hideLoading();
				this.isLoading = false;
				console.error('保存失败:', error);
				uni.showToast({ title: '网络连接异常', icon: 'none' });
			}
		},

		goBack() {
			uni.navigateBack();
		}
	}
};
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;
}

.header-section {
	position: relative;
	background: linear-gradient(160deg, #A31D1D 0%, #851212 100%);
	padding-top: 44px;
	padding-bottom: 20px;
}

.header-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(160deg, #A31D1D 0%, #851212 100%);
	z-index: 0;
}

.nav-bar {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20px;
	height: 44px;
}

.nav-back {
	width: 44px;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 18px;
	font-weight: bold;
	color: #fff;
}

.nav-placeholder {
	width: 44px;
}

.content-section {
	flex: 1;
	padding: 20px;
}

.section-box {
	background-color: #fff;
	border-radius: 16px;
	padding: 20px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-item {
	display: flex;
	align-items: center;
	padding: 16px 0;
	border-bottom: 1px solid #f5f5f5;
}

.form-item:last-child {
	border-bottom: none;
}

.form-label {
	width: 100px;
	font-size: 15px;
	color: #333;
	font-weight: 500;
}

.form-value {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 24px;
}

.value-text {
	font-size: 15px;
	color: #666;
}

.disabled-text {
	color: #999;
}

.avatar-preview {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	border: 2px solid #f5f5f5;
}

.avatar-placeholder {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	border: 2px dashed #ddd;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #fafafa;
}

.avatar-icon {
	font-size: 24px;
	color: #ccc;
	margin-bottom: 4px;
}

.avatar-text {
	font-size: 12px;
	color: #999;
}

.save-btn-container {
	margin-top: 30px;
	padding: 0 20px 20px;
}

.btn-save {
	width: 100%;
	height: 48px;
	line-height: 48px;
	background: linear-gradient(135deg, #9e2a2b, #c53e3f);
	color: #fff;
	font-size: 16px;
	font-weight: bold;
	border-radius: 8px;
	border: none;
	box-shadow: 0 4px 12px rgba(158, 42, 43, 0.2);
}

.btn-save::after {
	border: none;
}

.btn-save-hover {
	opacity: 0.9;
	transform: scale(0.98);
}
</style>