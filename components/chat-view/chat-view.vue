<template>
  <view class="chat-list-page">
    <!-- 顶部导航 -->
    <view class="art-header">
      <view class="nav-brand">
        <text class="brand-en">ZHI LIANG ZHI</text> 
        <text class="brand-cn">群聊管理</text> 
      </view> 
	  <view class="placeholder"></view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="groupList.length === 0">
      <text class="empty-text">暂无加入的群聊</text>
    </view>

    <!-- 群聊列表 -->
    <scroll-view scroll-y class="scroll-content" v-else>
      <view class="content-wrapper">
        <view 
          v-for="group in groupList" 
          :key="group.chatId" 
          class="group-item" 
          @click="goToChat(group)"
        >
          <view class="group-avatar">
            {{ group.name ? group.name.charAt(0) : '群' }}
          </view>
          <view class="group-info">
            <view class="group-name">{{ group.name || '未知群聊' }}</view>
            <view class="group-desc">{{ group.content || '班级群聊' }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config.js';
export default {
  mounted() {
    this.loadGroupList();
  },
  
  onShow() {
    this.loadGroupList();
  },

  data() {
    return {
      token: '',
      groupList: []
    };
  },

  methods: {
    loadGroupList() {
      // 取缓存里的 userId 和 token
      const storageUserId = uni.getStorageSync('userId');
      this.token = uni.getStorageSync('token');

      if (!this.token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }

      uni.request({
        url: API_CONFIG.baseUrl + "/group-chat/user-groups",
        data: { limit: 100, offset: 0 },
        header: {
          "Authorization": "Bearer " + this.token
        },
        success: (res) => {
          
          if (res.data.code === 200) {
            this.groupList = res.data.data || [];
          } else {
            uni.showToast({ title: '加载失败', icon: 'none' });
          }
        },
        fail: () => {
          uni.showToast({ title: '网络异常', icon: 'none' });
        }
      });
    },

    goToChat(group) {
      uni.navigateTo({
        url: `/pages/chat-group/chatdetail?chatId=${group.chatId}&groupName=${encodeURIComponent(group.name)}`
      });
    }
  }
};
</script>

<style scoped>
.chat-list-page {
  height: 100vh;
  background-color: #f4f4f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.art-header {
  background: #a31d1d;
  padding: 48rpx 30rpx 24rpx;
}
.placeholder { width: 48rpx; height: 48rpx; }
.nav-brand { flex: 1; text-align: center; } 
.brand-en { font-size: 18rpx; color: rgba(255,255,255,0.5); display: block; margin-bottom: 4rpx; } 
.brand-cn { font-size: 36rpx; font-weight: bold; color: #fff; }
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-text {
  font-size: 28rpx;
  color: #999;
}
.scroll-content {
  flex: 1;
}
.content-wrapper {
  padding: 20rpx 30rpx;
}
.group-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}
.group-avatar {
  width: 70rpx;
  height: 70rpx;
  background: #a31d1d;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}
.group-name {
  font-size: 32rpx;
  font-weight: bold;
}
.group-desc {
  font-size: 24rpx;
  color: #999;
}
</style>