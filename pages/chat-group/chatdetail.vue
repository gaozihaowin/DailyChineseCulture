<template>
  <view class="chat-page">
    <!-- 顶部导航 -->
    <view class="art-header">
      <view class="nav-bar">
        <view class="back-btn" @click="navBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">聊天</text>
        </view>
        <view style="width: 48rpx;"></view>
      </view>
      <view class="nav-tabs">
        <view class="nav-tab" :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'"> 聊天 </view>
        <view class="nav-tab" :class="{ active: activeTab === 'members' }" @click="activeTab = 'members'"> 群成员 </view>
      </view>
    </view>

    <!-- 消息区域 -->
    <scroll-view scroll-y class="scroll-content" v-if="activeTab === 'chat'" :scroll-top="scrollTop">
      <view class="content-wrapper">
        <view class="msg-list">
          <view 
            v-for="msg in messageList" 
            :key="msg.messageId" 
            class="msg-item" 
            :class="{ 'self-msg': isSelfMsg(msg) }" 
          >
            <!-- 别人的消息：左头像 + 左消息 -->
            <view class="avatar" v-if="!isSelfMsg(msg)">
              {{ getShowName(msg.senderName, msg.senderId) }}
            </view>
            
            <view class="msg-box">
              <view class="name" v-if="!isSelfMsg(msg)">
                {{ getShowName(msg.senderName, msg.senderId) }}
              </view>
              <view class="bubble">{{ msg.content }}</view>
            </view>

            <!-- 自己的消息：右头像 + 右消息 -->
            <view class="avatar self-avatar" v-if="isSelfMsg(msg)">
              我
            </view>
          </view>
        </view>
        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>

    <!-- 群成员区域 -->
    <scroll-view scroll-y class="scroll-content" v-if="activeTab === 'members'">
      <view class="content-wrapper">
        <view class="member-list-container">
          <view class="section-title">群成员列表</view>

          <view v-for="u in memberList" :key="u.userId" class="member-item-row">
            <view class="member-left">
              <view class="member-name">{{ getShowName(u.username, u.userId) }}</view>
              <view class="member-phone">手机号：{{ u.phone || '暂无' }}</view>
            </view>

            <view class="member-right" v-if="isAdmin">
              <!-- 角色标签 -->
              <view 
                class="role-tag" 
                :class="u.role === 'admin' ? 'admin-tag' : 'member-tag'"
                @click="openChangeRole(u)"
              >
                {{ u.role === 'admin' ? '管理员' : '成员' }}
              </view>

              <!-- 删除按钮 -->
              <button class="del-btn" @click="deleteMember(u)">删除</button>
            </view>
          </view>

          <!-- 底部添加成员按钮 -->
          <view class="add-member-wrap" v-if="isAdmin">
            <view class="add-btn-circle" @click="goToAddMember">
              <text class="add-icon">+</text>
            </view>
            <text class="add-tip">添加成员</text>
          </view>
        </view>
        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>

    <!-- 底部输入栏 -->
    <view class="send-wrap" v-if="activeTab === 'chat'">
      <view class="send-target" @click="showMemberModal = true">
        <text class="target-text">{{ receiverType === 'all' ? '发送给：所有人' : '发送给：' + selectShowName }}</text>
        <text class="arrow">▼</text>
      </view>
      <view class="input-bar">
        <input v-model="content" class="input" placeholder="输入消息..." @confirm="send" />
        <button class="send-btn" @click="send" :disabled="!content.trim()">发送</button>
      </view>
    </view>

    <!-- 选择发送对象弹窗 -->
    <view v-if="showMemberModal" class="modal-mask" @click="showMemberModal = false">
      <view class="modal" @click.stop>
        <view class="modal-header">选择发送对象</view>
        <input v-model="searchKey" class="search-input" placeholder="搜索昵称/账号" />
        <scroll-view class="member-scroll" scroll-y>
          <view class="member-item" :class="{ active: receiverType === 'all' }" @click="selectAll()">
            <text>所有人</text>
            <text v-if="receiverType === 'all'" class="check">✓</text>
          </view>
          <view 
            v-for="u in filteredMemberList" 
            :key="u.userId" 
            class="member-item" 
            :class="{ active: receiverType === 'user' && receiverId === u.userId }" 
            @click="selectUser(u)"
          >
            <text>{{ getShowName(u.username, u.userId) }}</text>
            <text v-if="receiverType === 'user' && receiverId === u.userId" class="check">✓</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config.js';
export default {
  data() {
    return {
      chatId: '',
      userId: '',
      token: '',
      content: '',
      messageList: [],
      scrollTop: 0,
      activeTab: 'chat',
      memberList: [],
      showMemberModal: false,
      searchKey: '',
      receiverType: 'all',
      receiverId: null,
      receiverName: '',
      isAdmin: false,
    };
  },
  onLoad(options) {
    this.chatId = options.chatId;
    this.token = uni.getStorageSync('token');
    this.userId = uni.getStorageSync('userId') || '';

    if (!this.userId && this.token) {
      try {
        const base64Url = this.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        this.userId = String(payload.userId || payload.sub || '');
      } catch (e) {}
    }

    this.getMessages();
    this.getMembers();
  },
  computed: {
    filteredMemberList() {
      if (!this.searchKey) return this.memberList;
      const key = this.searchKey.trim().toLowerCase();
      return this.memberList.filter(u => {
        const name = (u.username || '').toLowerCase();
        const account = String(u.userId || '').toLowerCase();
        return name.includes(key) || account.includes(key);
      });
    },
    selectShowName() {
      if (this.receiverType === 'all') return '所有人';
      return this.receiverName || this.receiverId;
    }
  },
  methods: {
    isSelfMsg(msg) {
      if (!this.userId || !msg.senderId) return false;
      return String(msg.senderId) === String(this.userId);
    },
    getShowName(name, userId) {
      return name ? name : String(userId);
    },
    navBack() {
      uni.navigateBack();
    },
    getMessages() {
      uni.request({
        url: API_CONFIG.baseUrl + "/group-chat/messages",
        data: { 
          chatId: this.chatId, 
          userId: this.userId,
          limit: 100, 
          offset: 0 
        },
        header: { Authorization: "Bearer " + this.token },
        success: (res) => {
          if (res.data.code === 200) {
            let list = res.data.data || [];
            list.sort((a, b) => new Date(a.sendTime) - new Date(b.sendTime));
            this.messageList = list;
            this.$nextTick(() => this.scrollTop = 999999);
          }
        }
      });
    },
    getMembers() {
      uni.request({
        url: API_CONFIG.baseUrl + "/group-chat/members",
        data: { chatId: this.chatId },
        header: { Authorization: "Bearer " + this.token },
        success: (res) => {
          if (res.data.code === 200) {
            this.memberList = res.data.data || [];
            let me = this.memberList.find(u => String(u.userId) === String(this.userId));
            this.isAdmin = me && me.role === 'admin';
          }
        }
      });
    },

    // ==========================
    // 修改角色 —— 改成 POST
    // ==========================
    openChangeRole(user) {
      let newRole = user.role === 'admin' ? 'member' : 'admin';
      let roleText = newRole === 'admin' ? '管理员' : '普通成员';
      
      uni.showModal({
        title: '修改角色',
        content: `确定将【${this.getShowName(user.username, user.userId)}】设为${roleText}？`,
        success: (ok) => {
          if (ok.confirm) {
            uni.request({
              url: API_CONFIG.baseUrl + "/group-chat/member/role",
              method: "PUT", // 👈 改成 POST
              header: {
                Authorization: "Bearer " + this.token
              },
              data: {
                chatId: this.chatId,
                userId: user.userId,
                role: newRole
              },
              success: (res) => {
                if (res.data.code === 200) {
                  uni.showToast({ title: "修改成功" });
                  this.getMembers();
                }
              }
            });
          }
        }
      });
    },
    
    // ==========================
    // 删除成员 —— 改成 POST
    // ==========================
    deleteMember(user) {
      uni.showModal({
        title: '删除成员',
        content: `确定将【${this.getShowName(user.username, user.userId)}】移出群聊？`,
        success: (ok) => {
          if (ok.confirm) {
            uni.request({
              url: API_CONFIG.baseUrl + "/group-chat/member/remove",
              method: "DELETE", // 👈 改成 POST
              header: {
                Authorization: "Bearer " + this.token
              },
              data: {
                chatId: this.chatId,
                userId: user.userId
              },
              success: (res) => {
                if (res.data.code === 200) {
                  uni.showToast({ title: "删除成功" });
                  this.getMembers();
                }
              }
            });
          }
        }
      });
    },

    // ==========================
    // 以下完全不动，保持你原来代码
    // ==========================
    send() {
      if (!this.content.trim()) return;
      uni.request({
        url: API_CONFIG.baseUrl + "/group-chat/message/send",
        method: "POST",
        header: { Authorization: "Bearer " + this.token },
        data: {
          chatId: this.chatId,
          senderId: this.userId,
          content: this.content,
          recipientType: this.receiverType === 'all' ? 'all' : 'private',
          recipientId: this.receiverId
        },
        success: (res) => {
          if (res.data.code === 200) {
            this.content = '';
            this.getMessages();
          }
        }
      });
    },

    goToAddMember() {
      uni.navigateTo({
        url: `/pages/chat-group/add-member?chatId=${this.chatId}`
      });
    },
    selectAll() {
      this.receiverType = 'all';
      this.receiverId = null;
      this.receiverName = '';
      this.showMemberModal = false;
    },
    selectUser(user) {
      this.receiverType = 'user';
      this.receiverId = user.userId;
      this.receiverName = user.username;
      this.showMemberModal = false;
    }
  },
};
</script>

<style scoped>
/* 样式完全不变，保持你原来的样式 */
.chat-page {
  height: 100vh;
  background-color: #F4F4F5;
  display: flex;
  flex-direction: column;
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
  margin-bottom: 30rpx;
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
  color: rgba(255, 255, 255, 0.5);
  display: block;
  margin-bottom: 4rpx;
}

.brand-cn {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.nav-tabs {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-top: 20rpx;
}

.nav-tab {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  padding: 10rpx 20rpx;
  border-bottom: 4rpx solid transparent;
}

.nav-tab.active {
  color: #fff;
  border-bottom-color: #fff;
}

.scroll-content {
  flex: 1;
  height: 0;
  box-sizing: border-box;
}

.content-wrapper {
  padding: 0 30rpx;
  box-sizing: border-box;
}

.msg-list {
  padding: 10rpx 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.msg-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 20rpx;
}

.msg-item.self-msg {
  margin-left: auto;
  justify-content: flex-end;
}

.avatar {
  width: 52rpx;
  height: 52rpx;
  background: #A31D1D;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  flex-shrink: 0;
  margin: 0 12rpx;
}

.self-avatar {
  background: #07c160 !important;
}

.msg-box {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.bubble {
  background: #fff;
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.05);
  display: inline-block;
  max-width: 100%;
  word-break: break-all;
  white-space: pre-wrap;
}

.msg-item.self-msg .bubble {
  background: #07c160;
  color: #fff;
}

.name {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
}

.safe-area-spacer {
  height: 200rpx;
}

.send-wrap {
  background: #ffffff;
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.send-target {
  padding: 12rpx 30rpx;
  font-size: 26rpx;
  color: #A31D1D;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #eee;
}

.arrow {
  color: #999;
  font-size: 22rpx;
}

.input-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  box-sizing: border-box;
}

.input {
  flex: 1;
  height: 60rpx;
  background: #f2f3f5;
  border-radius: 30rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  margin-right: 16rpx;
}

.send-btn {
  width: 110rpx;
  height: 60rpx;
  background: #A31D1D;
  color: #fff;
  border-radius: 30rpx;
  font-size: 28rpx;
  border: none;
}

.send-btn[disabled] {
  background: #d8d8d8;
}

.member-list-container {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin: 30rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
  width: 100%;
  box-sizing: border-box;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.member-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.member-left {
  flex: 1;
}

.member-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.member-phone {
  font-size: 24rpx;
  color: #999;
}

.member-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.role-tag {
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.admin-tag {
  background: #fff2f2;
  color: #A31D1D;
}

.member-tag {
  background: #f5f5f5;
  color: #666;
}

.del-btn {
  background: #ff4d4f;
  color: #fff;
  font-size: 22rpx;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  border: none;
}

.add-member-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40rpx;
}

.add-btn-circle {
  width: 80rpx;
  height: 80rpx;
  background: #A31D1D;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.add-tip {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.modal {
  background: #fff;
  width: 100%;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 60vh;
}

.modal-header {
  text-align: center;
  padding: 24rpx;
  font-size: 30rpx;
  font-weight: 500;
  border-bottom: 1rpx solid #eee;
}

.search-input {
  height: 64rpx;
  background: #f2f3f5;
  border-radius: 32rpx;
  margin: 20rpx 30rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
}

.member-scroll {
  max-height: 40vh;
}

.member-item {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  font-size: 28rpx;
  border-bottom: 1rpx solid #f2f2f2;
}

.member-item.active {
  color: #A31D1D;
}

.check {
  color: #A31D1D;
  font-weight: bold;
}
</style>