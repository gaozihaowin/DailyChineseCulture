<template>
	<view class="page-container">
		<view class="header-section">
			<view class="header-bg"></view>
			<NavBar title="个人资料编辑" :isTransparent="true" titleColor="#ffffff" />
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
						<text class="value-text disabled-text">{{ account || '-' }}</text>
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

				<!-- 地区：支持搜索 + 只选省市 -->
				<view class="form-item" @tap="openAreaSelector">
					<view class="form-label">地区</view>
					<view class="form-value">
						<text class="value-text">{{ form.region || '请选择省市' }}</text>
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

		<!-- 地区选择弹窗：搜索 + 省市两级 -->
		<view v-if="showAreaModal" class="modal-mask" @tap="showAreaModal=false">
			<view class="modal-content" @tap.stop>
				<view class="modal-header">
					<text>选择省市</text>
					<text @tap="showAreaModal=false" style="color:#999">关闭</text>
				</view>
				<input class="search-input" v-model="searchKey" placeholder="输入省市名称搜索" @input="doSearch"/>
				<scroll-view class="result-list" scroll-y>
					<view class="item" v-for="(item,idx) in searchList" :key="idx" @tap="selectArea(item)">
						{{ item.province }} {{ item.city }}
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import { API_CONFIG } from '../../api/config';
import { provinceList, cityList } from './china-area.js';

export default {
	data() {
		return {
			form: {
				avatar: '',nickname: '',account: '',password: '',phone: '',
				region: '',profession: '',gender: 0,birthday: ''
			},
			isLoading: false,token: '',
			// 地区搜索
			showAreaModal: false,
			searchKey: '',
			searchList: [],
			// 所有省市数据
			allArea: []
		};
	},

	computed: {
		genderText() {
			const m = {0:'保密',1:'男',2:'女'};
			return m[this.form.gender] || '保密';
		}
	},

	onLoad() {
		this.token = uni.getStorageSync('token');
		this.fetchUserInfo();
		this.initAllArea();
	},

	methods: {
		// 初始化所有省市数据
		initAllArea() {
			let list = [];
			provinceList.forEach((province, pIdx) => {
				cityList[pIdx].forEach(city => {
					list.push({ province, city });
				});
			});
			this.allArea = list;
			this.searchList = list;
		},

		// 打开地区选择器
		openAreaSelector() {
			this.showAreaModal = true;
			this.searchKey = '';
			this.searchList = this.allArea;
		},

		// 搜索
		doSearch() {
			if (!this.searchKey) {
				this.searchList = this.allArea;
				return;
			}
			let key = this.searchKey.trim();
			this.searchList = this.allArea.filter(item => 
				item.province.includes(key) || item.city.includes(key)
			);
		},

		// 选择省市
		selectArea(item) {
			this.form.region = `${item.province} ${item.city}`;
			this.showAreaModal = false;
		},

		// ==================== 修复：补全所有缺失的修改弹窗 ====================
		async fetchUserInfo() {
			if (!this.token) {
				uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
				setTimeout(()=>uni.reLaunch({url:'/pages/Login/index'}),1000);
				return;
			}
			uni.showLoading({title:'加载中...'});
			try {
				const res = await uni.request({
					url: `${API_CONFIG.baseUrl}/user/detail`,
					header: {Authorization:`Bearer ${this.token}`}
				});
				if (res.statusCode===200&&res.data.code===200) {
					this.form = {...this.form,...res.data.data};
				}
			} catch(e){
				uni.showToast({title:'网络异常',icon:'none'});
			} finally {
				uni.hideLoading();
			}
		},

		chooseAvatar() {
			uni.chooseImage({count:1,success:res=>{
				uni.showLoading({title:'上传中...'});
				uni.uploadFile({
					url:API_CONFIG.baseUrl+API_CONFIG.paths.upload+'?type=avatar',
					filePath:res.tempFilePaths[0],name:'file',
					header:{Authorization:'Bearer '+this.token},
					success:uploadRes=>{
						uni.hideLoading();
						let data=JSON.parse(uploadRes.data);
						if(data.code===200)this.form.avatar=data.data;
					},fail:()=>uni.hideLoading()
				});
			}});
		},

		editNickname(){
			uni.showModal({
				title:'编辑昵称',
				editable:true,
				inputValue:this.form.nickname,
				success:res=>{
					if(res.confirm && res.content.trim()){
						this.form.nickname = res.content.trim();
					}
				}
			});
		},
		
		// 修复：密码修改
		editPassword(){
			uni.showModal({
				title:'修改密码',
				password:true,
				editable:true,
				placeholderText:'请输入新密码',
				success:res=>{
					if(res.confirm && res.content.trim()){
						this.form.password = res.content.trim();
					}
				}
			});
		},
		
		// 修复：手机号修改
		editPhone(){
			uni.showModal({
				title:'修改手机号',
				editable:true,
				inputValue:this.form.phone || '',
				placeholderText:'请输入手机号',
				success:res=>{
					if(res.confirm && res.content.trim()){
						this.form.phone = res.content.trim();
					}
				}
			});
		},
		
		// 修复：职业修改
		editProfession(){
			uni.showModal({
				title:'修改职业',
				editable:true,
				inputValue:this.form.profession || '',
				placeholderText:'请输入职业',
				success:res=>{
					if(res.confirm && res.content.trim()){
						this.form.profession = res.content.trim();
					}
				}
			});
		},
		
		editGender(){
			uni.showActionSheet({itemList:['男','女','保密'],
				success:res=>this.form.gender=[1,2,0][res.tapIndex]
			});
		},
		onBirthdayChange(e){
			this.form.birthday=e.detail.value;
		},
		async handleSave(){
			uni.showLoading({title:'保存中...'});
			try {
				const res=await uni.request({
					url:`${API_CONFIG.baseUrl}/user/updateAll`,
					method:'POST',header:{Authorization:`Bearer ${this.token}`},
					data:this.form
				});
				if(res.data.code===200){
					uni.showToast({title:'保存成功'});
					setTimeout(()=>uni.navigateBack(),500);
				}
			}catch(e){
				uni.showToast({title:'保存失败',icon:'none'});
			}finally{
				uni.hideLoading();
			}
		}
	}
};
</script>

<style scoped>
/* 原有样式完全保留 */
.page-container {min-height:100vh;background:#f5f5f5;display:flex;flex-direction:column;}
.header-section {position:relative;background:linear-gradient(160deg,#A31D1D 0%,#851212 100%);padding-top:44px;padding-bottom:20px;}
.header-bg {position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(160deg,#A31D1D 0%,#851212 100%);z-index:0;}
.content-section {flex:1;padding:20px;}
.section-box {background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.08);}
.form-item {display:flex;align-items:center;padding:16px 0;border-bottom:1px solid #f5f5f5;}
.form-item:last-child {border-bottom:none;}
.form-label {width:100px;font-size:15px;color:#333;font-weight:500;}
.form-value {flex:1;display:flex;align-items:center;justify-content:space-between;min-height:24px;}
.value-text {font-size:15px;color:#666;}
.disabled-text {color:#999;}
.avatar-preview {width:60px;height:60px;border-radius:50%;border:2px solid #f5f5f5;}
.avatar-placeholder {width:60px;height:60px;border-radius:50%;border:2px dashed #ddd;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fafafa;}
.avatar-icon {font-size:24px;color:#ccc;margin-bottom:4px;}
.avatar-text {font-size:12px;color:#999;}
.save-btn-container {margin-top:30px;padding:0 20px 20px;}
.btn-save {width:100%;height:48px;line-height:48px;background:linear-gradient(135deg,#9e2a2b,#c53e3f);color:#fff;font-size:16px;font-weight:bold;border-radius:8px;border:none;box-shadow:0 4px 12px rgba(158,42,43,0.2);}
.btn-save::after {border:none;}
.btn-save-hover {opacity:0.9;transform:scale(0.98);}

/* 新增：搜索弹窗样式 */
.modal-mask {position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999;}
.modal-content {width:80%;background:#fff;border-radius:12px;max-height:70vh;overflow:hidden;}
.modal-header {padding:16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;}
.search-input {padding:10px 16px;border-bottom:1px solid #eee;font-size:14px;}
.result-list {max-height:400px;}
.item {padding:12px 16px;border-bottom:1px solid #f5f5f5;font-size:15px;}
.item:active {background:#f5f5f5;}
</style>