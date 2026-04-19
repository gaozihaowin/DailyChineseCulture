<template>
  <view class="chat-list-page">
    <scroll-view
      scroll-y
      class="scroll-content"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
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
      <view class="content-wrapper" v-else>
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
          <view v-if="group.unreadCount > 0" class="unread-badge">
            {{ group.unreadCount > 99 ? '99+' : group.unreadCount }}
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config.js';
export default {
  data() {
    return {
      token: '',
      userId: '',
      groupList: [],
      currentGroupInfo: null,
      refreshing: false,
      isLoading: false,
      ws: null
    };
  },

  mounted() {
    this.token = uni.getStorageSync('token');
    this.userId = uni.getStorageSync('userId') || '';
    this.reloadGroupList();
    this.initWebSocket();
  },

  onShow() {
    // 只刷新未读数，不刷新整个群列表（不闪屏、不卡顿）
    this.loadUnreadCounts();
  },

  onHide() {
    if (this.ws) {
      this.ws.onMessage(null);
    }
  },

  onUnload() {
    if (this.ws) {
      this.ws.onMessage(null);
    }
  },

  methods: {
    initWebSocket() {
      const app = getApp();
      if (app.globalData.ws) {
        this.ws = app.globalData.ws;
        this.listenWsMessage();
        return;
      }
      if (app.globalData.isWsConnecting) return;

      app.globalData.isWsConnecting = true;
      this.token = uni.getStorageSync('token');
      if (!this.token) return;

      const wsUrl = 'ws://localhost:8080/ws/group-chat';
      const ws = wx.connectSocket({
        url: wsUrl,
        header: { Authorization: 'Bearer ' + this.token }
      });

      ws.onOpen(() => {
        app.globalData.isWsConnecting = false;
        ws.send({
          data: JSON.stringify({
            type: 'auth',
            token: this.token
          })
        });
      });

      ws.onClose(() => {
        app.globalData.ws = null;
        app.globalData.isWsConnecting = false;
      });

      ws.onError(() => {
        app.globalData.ws = null;
        app.globalData.isWsConnecting = false;
      });

      app.globalData.ws = ws;
      this.ws = ws;
      this.listenWsMessage();
    },

    listenWsMessage() {
      if (!this.ws) return;
      this.ws.onMessage((res) => {
        try {
          const msg = JSON.parse(res.data);
          if (msg.type === 'message' || msg.type === 'unreadCount') {
            this.loadUnreadCounts();
          }
        } catch (e) {}
      });
    },

    updateUnreadCount(chatId, unreadCount) {
      const group = this.groupList.find(g => g.chatId === chatId);
      if (group) {
        group.unreadCount = unreadCount;
      }
    },

    async onRefresh() {
      this.refreshing = true;
      await this.reloadGroupList();
      this.refreshing = false;
    },

    async reloadGroupList() {
      if (this.isLoading) return;
      this.isLoading = true;

      this.token = uni.getStorageSync('token');
      if (!this.token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        this.isLoading = false;
        return;
      }

      try { await this.getCurrentGroupInfo(); } catch (e) {}
      await this.getUserGroups();
      await this.loadUnreadCounts();
      this.isLoading = false;
    },

    getCurrentGroupInfo() {
      return new Promise((resolve, reject) => {
        const currentCampId = uni.getStorageSync('currentCampId') || 1;
        uni.request({
          url: API_CONFIG.baseUrl + "/user/current-group",
          data: { campId: currentCampId },
          header: { Authorization: "Bearer " + this.token },
          success: (res) => {
            if (res.data.code === 200 && res.data.data) {
              this.currentGroupInfo = res.data.data;
              resolve();
            } else {
              this.currentGroupInfo = null;
              reject();
            }
          },
          fail: () => {
            this.currentGroupInfo = null;
            reject();
          }
        });
      });
    },

    getUserGroups() {
      return new Promise((resolve) => {
        uni.request({
          url: API_CONFIG.baseUrl + "/group-chat/user-groups",
          data: { limit: 100, offset: 0 },
          header: { Authorization: "Bearer " + this.token },
          success: (res) => {
            if (res.data.code === 200) {
              let groups = res.data.data || [];

              if (this.currentGroupInfo) {
                const { classId, bigGroupId, smallGroupId } = this.currentGroupInfo;
                groups = groups.filter(group => {
                  if (group.type === '班级群' && group.classId === classId) return true;
                  if (group.type === '大组群' && group.bigGroupId === bigGroupId) return true;
                  if (group.type === '小组群' && group.smallGroupId === smallGroupId) return true;
                  return false;
                });
              } else {
                groups = [];
              }

              this.groupList = groups;
            }
            resolve();
          },
          fail: () => resolve()
        });
      });
    },

    getUnreadCount(chatId) {
      return new Promise((resolve) => {
        uni.request({
          url: API_CONFIG.baseUrl + "/group-chat/unread-count",
          data: { chatId },
          header: { Authorization: "Bearer " + this.token },
          success: (res) => {
            resolve(res.data.code === 200 ? res.data.data || 0 : 0);
          },
          fail: () => resolve(0)
        });
      });
    },

    async loadUnreadCounts() {
      if (!this.groupList.length) return;
      try {
        const promises = this.groupList.map(g => this.getUnreadCount(g.chatId));
        const counts = await Promise.all(promises);
        this.groupList.forEach((g, index) => {
          g.unreadCount = counts[index];
        });
      } catch (e) {}
    },

    markAllMessagesAsRead(chatId) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: API_CONFIG.baseUrl + "/group-chat/mark-all-read?chatId=" +this.chatId,
          method: "PUT",
          header: { Authorization: "Bearer " + this.token },
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });
      });
    },

    // 进入聊天：标记已读 + 清角标
    async goToChat(group) {
      try {
        await this.markAllMessagesAsRead(group.chatId);
        group.unreadCount = 0;
      } catch (error) {
        console.error('标记已读失败', error);
      }
      uni.navigateTo({
        url: `/pages/chat-group/chatdetail?chatId=${group.chatId}&groupName=${encodeURIComponent(group.name)}`
      });
    },
  }
};
</script>

<style scoped>
.chat-list-page {
  height: 100vh;
  background-color: #f4f4f5;
}
.scroll-content {
  height: 100vh;
  box-sizing: border-box;
}

.art-header {
  background: #a31d1d;
  padding: calc(var(--status-bar-height) + 20rpx) 30rpx 24rpx;
}

.placeholder {
  width: 48rpx;
  height: 48rpx;
}
.nav-brand {
  flex: 1;
  text-align: center;
}
.brand-en {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  margin-bottom: 4rpx;
}
.brand-cn {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.empty-state {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-text {
  font-size: 28rpx;
  color: #999;
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
  position: relative;
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
.unread-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: #ff4757;
  color: #fff;
  font-size: 20rpx;
  font-weight: bold;
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12rpx;
}
</style>