<template>
  <view class="view-container">
    <view class="art-header">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">添加成员</text>
        </view>
        <view style="width: 48rpx;"></view>
      </view>
    </view>

    <!-- 可滚动内容 -->
    <scroll-view
      scroll-y
      class="scroll-content"
      :enhanced="true"
      :show-scrollbar="false"
      :enable-back-to-top="true"
    >
      <view class="content-wrapper">
        <!-- 成员列表卡片 -->
        <view class="section-box task-content">
          <view v-if="userList.length === 0" class="empty-tip">
            <text>暂无用户可添加</text>
          </view>

          <view class="homework-list">
            <view
              v-for="user in userList"
              :key="user.userId"
              class="homework-item"
            >
              <view class="homework-header">
                <text class="homework-info">姓名：{{ getUserDisplayName(user) }}</text>
                <text class="homework-info">类型：{{ user.type === 'student' ? '学员' : '志愿者' }}</text>
                <text v-if="user.phone" class="homework-info">
                  手机号：{{ user.phone }}
                </text>
              </view>

              <view class="homework-footer">
                <view v-if="user.inGroup" class="in-group-tag">已在群</view>
                <checkbox v-else class="checkbox" :checked="user.checked" @click="toggleSelect(user)" />
              </view>
            </view>
          </view>
        </view>

        <!-- 底部安全区 -->
        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>

    <!-- 底部固定按钮 -->
    <view class="footer-bar">
      <button class="confirm-btn" @click="doAdd">确认添加</button>
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config.js';

export default {
  data() {
    return {
      chatId: '',
      token: '',
      userList: []
    };
  },

  onLoad(options) {
    this.chatId = options.chatId;
    this.token = uni.getStorageSync('token');
    this.getAvailableMembers();
  },

  methods: {
    goBack() {
      uni.navigateBack();
    },

    getUserDisplayName(user) {
      return user.username || user.nickname || user.account || '未知用户';
    },

    // 获取可添加成员
    getAvailableMembers() {
      uni.request({
        url: API_CONFIG.baseUrl + '/group-chat/available-members',
        method: 'GET',
        data: { chatId: this.chatId },
        header: { Authorization: 'Bearer ' + this.token },
        success: (res) => {
          try {
            if (res.data.code === 200) {
              const data = res.data.data || {};
              const list = data.members || [];
              this.userList = list.map(u => {
                u.checked = false;
                return u;
              });
            } else {
              uni.showToast({ title: '加载失败', icon: 'none' });
              this.userList = [];
            }
          } catch (e) {
            this.userList = [];
            uni.showToast({ title: '数据异常', icon: 'none' });
          }
        },
        fail: () => {
          uni.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    },

    toggleSelect(user) {
      if (user.inGroup) return;
      user.checked = !user.checked;
    },

    // 批量添加
    doAdd() {
      const selectIds = this.userList
        .filter(u => !u.inGroup && u.checked)
        .map(u => u.userId);

      if (selectIds.length === 0) {
        uni.showToast({ title: '请选择用户', icon: 'none' });
        return;
      }

      uni.request({
        url: API_CONFIG.baseUrl + '/group-chat/member/batch-add',
        method: 'POST',
        header: {
          Authorization: 'Bearer ' + this.token,
          'content-type': 'application/json'
        },
        data: {
          chatId: this.chatId,
          userIds: selectIds,
          role: "member"
        },
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: res.data.message || '添加成功' });
            setTimeout(() => uni.navigateBack(), 1500);
          } else {
            uni.showToast({ title: res.data.message || '添加失败', icon: 'none' });
          }
        },
        fail: () => {
          uni.showToast({ title: '请求失败', icon: 'none' });
        }
      });
    }
  }
};
</script>

<style scoped>
.view-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F4F4F5;
  width: 100%;
  overflow: hidden;
}

.art-header {
  background: linear-gradient(160deg, #A31D1D 0%, #851212 100%);
  padding: 88rpx 30rpx 30rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  width: 100%;
}

.back-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  width: 20rpx;
  height: 20rpx;
  border-top: 3rpx solid #fff;
  border-left: 3rpx solid #fff;
  transform: rotate(-45deg);
}

.nav-brand {
  flex: 1;
  text-align: center;
}

.brand-en {
  font-size: 18rpx;
  color: rgba(255,255,255,0.5);
  display: block;
  margin-bottom: 4rpx;
}

.brand-cn {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

/* 滚动内容 */
.scroll-content {
  flex: 1;
  height: 0;
  box-sizing: border-box;
}

.content-wrapper {
  padding: 0 30rpx;
  box-sizing: border-box;
}

/* 卡片样式 */
.section-box {
  background: #fff;
  margin-bottom: 30rpx;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  width: 100%;
  box-sizing: border-box;
}

/* 空数据 */
.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 列表样式 */
.homework-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.homework-item {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  position: relative;
  border: none;
}

.homework-header {
  margin-bottom: 20rpx;
}

.homework-info {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.homework-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #e5e5e5;
}

.in-group-tag {
  color: #999;
  font-size: 26rpx;
  padding: 6rpx 12rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.checkbox {
  transform: scale(0.9);
}

/* 底部安全区 */
.safe-area-spacer {
  height: 160rpx;
}

/* 底部按钮 */
.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.confirm-btn {
  width: 600rpx;
  height: 96rpx;
  background: #A31D1D;
  color: #fff;
  border: none;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 96rpx;
  text-align: center;
}
</style>