<template>
  <view class="chat-page">
    <view class="art-header">
      <view class="nav-bar">
        <view class="back-btn" @click="navBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">{{ groupName || '聊天' }}</text>
        </view>
        <view style="width: 48rpx;"></view>
      </view>
      <view class="nav-tabs">
        <view class="nav-tab" :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'"> 聊天 </view>
        <view class="nav-tab" :class="{ active: activeTab === 'members' }" @click="activeTab = 'members'"> 群成员 </view>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="scroll-content"
      v-if="activeTab === 'chat'"
      :scroll-into-view="intoView"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMoreMessages"
      @scroll="onScroll"
    >
      <view class="content-wrapper">
        <view class="msg-list">
          <view
            v-for="msg in messageList"
            :key="msg.messageId"
            :id="'msg-'+msg.messageId"
            class="msg-item"
            :class="{ 'self-msg': isSelfMsg(msg) }"
            @longpress="showMsgMenu(msg, $event)"
          >
            <view class="avatar" v-if="!isSelfMsg(msg)">
              {{ getShowName(msg.senderName, msg.senderId) }}
            </view>

            <view class="msg-box">
              <view class="name" v-if="!isSelfMsg(msg)">
                {{ getShowName(msg.senderName, msg.senderId) }}
              </view>

              <view v-if="msg.atUserList && msg.atUserList.length" class="at-tag-wrap">
                <text class="at-tag" v-for="at in msg.atUserList" :key="at.userId">
                  @{{ getShowName(at.username, at.userId) }}
                </text>
              </view>

              <view v-if="msg.messageType === 'text'" class="bubble">{{ msg.content || '' }}</view>

              <view v-else-if="msg.messageType === 'voice'" class="bubble voice-bubble" @click="playVoice(msg.voiceUrl)">
                <view class="css-voice-icon"></view>
                <view class="voice-duration">{{ msg.voiceDuration }}''</view>
              </view>

              <view v-else-if="msg.messageType === 'revoke'" class="bubble revoke-bubble">
                {{ msg.content }}
              </view>

              <view class="msg-time">{{ formatTime(msg.sendTime) }}</view>
            </view>

            <view class="avatar self-avatar" v-if="isSelfMsg(msg)">
              我
            </view>
          </view>
          <view v-if="loadingMore" class="loading-more">加载中...</view>
        </view>
        <view class="safe-area-spacer"></view>
      </view>
    </scroll-view>

    <scroll-view
      scroll-y
      class="scroll-content"
      v-if="activeTab === 'members'"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="content-wrapper">
        <view class="member-list-container">
          <view class="section-title">群成员列表</view>

          <view v-for="u in memberList" :key="u.userId" class="member-item-row">
            <view class="member-left">
              <view class="member-name">{{ getShowName(u.username, u.userId) }}</view>
              <view class="member-phone">手机号：{{ u.phone || '暂无' }}</view>
            </view>

            <view class="member-right" v-if="isAdmin">
              <view
                class="role-tag"
                :class="u.role === 'admin' ? 'admin-tag' : 'member-tag'"
                @click="openChangeRole(u)"
              >
                {{ u.role === 'admin' ? '管理员' : '成员' }}
              </view>
              <button class="del-btn" @click="deleteMember(u)">删除</button>
            </view>
          </view>

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

    <view class="send-wrap" v-if="activeTab === 'chat'">
      <view class="send-target" @click="showMemberModal = true">
        <text class="target-text">{{ receiverType === 'all' ? '发送给：所有人' : '发送给：' + selectShowName }}</text>
        <text class="arrow">▼</text>
      </view>
      <view class="input-bar">
        <view class="mode-btn" @click="toggleVoiceMode">
          <view v-if="!isVoiceMode" class="css-voice-toggle-icon"></view>
          <view v-else class="css-keyboard-toggle-icon"></view>
        </view>

        <template v-if="!isVoiceMode">
          <textarea
            v-model="content"
            class="input-textarea"
            placeholder="输入消息"
            @input="handleInputAt"
            @confirm="sendText"
            auto-height
          ></textarea>
          <button class="send-btn" @click="sendText" :disabled="!canSend">发送</button>
        </template>

        <template v-else>
          <view
            class="voice-btn"
            :class="{recording: isRecording}"
            @touchstart="startRecording"
            @touchend="stopRecording"
            @touchcancel="cancelRecording"
          >
            {{ isRecording ? '松开发送' : '按住说话' }}
          </view>
        </template>
      </view>
    </view>

    <view v-if="showAtDropdown" class="at-dropdown-mask" @click="showAtDropdown = false">
      <view class="at-dropdown-box">
        <scroll-view class="at-member-scroll" scroll-y>
          <view
            v-for="u in memberList"
            :key="u.userId"
            class="at-member-item"
            @click="chooseAtMember(u)"
          >
            <text>{{ getShowName(u.username, u.userId) }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

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

    <view v-if="showFloatMenu" class="float-menu-mask" @click="closeFloatMenu">
      <view
        class="float-menu-box"
        :style="{
          left: menuPos.left + 'rpx',
          top: menuPos.top + 'rpx'
        }"
      >
        <view
          v-for="item in currentMenuList"
          :key="item.key"
          class="float-menu-item"
          @click="handleMenuClick(item.key)"
        >
          {{ item.name }}
        </view>
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
      intoView: '',
      activeTab: 'chat',
      memberList: [],
      showMemberModal: false,
      searchKey: '',
      receiverType: 'all',
      receiverId: null,
      receiverName: '',
      isAdmin: false,
      refreshing: false,
      loadingMore: false,
      page: 1,
      limit: 20,
      ws: null,
      groupName: '',

      isVoiceMode: false,
      isRecording: false,
      recordTimer: null,
      recordSec: 0,
      audioUrl: '',
      recorder: null,
      audioContext: null,

      currentMsg: null,
      showFloatMenu: false,
      menuPos: { left: 0, top: 0 },
      currentMenuList: [],

      showAtDropdown: false,
      atUserList: [],
	  isAudioPlaying: false,
    };
  },

  onLoad(options) {
    this.chatId = options.chatId;
    this.groupName = options.groupName ? decodeURIComponent(options.groupName) : '';
    this.token = uni.getStorageSync('token');
    this.userId = uni.getStorageSync('userId') || '';

    this.recorder = uni.getRecorderManager();
    this.recorder.onStop((res) => {
      this.audioUrl = res.tempFilePath;
    });

    if (!this.userId && this.token) {
      try {
        const base64Url = this.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        this.userId = String(payload.userId || payload.sub || '');
      } catch (e) {}
    }

    this.getMembers();
    this.getMessages().then(() => {
          this.markAllMessagesAsRead();
        });
  },

  onShow() {
    this.initWebSocket();
  },

  onHide() {
    if (this.ws) {
      this.ws.onMessage(null);
    }
    if (this.isRecording) this.cancelRecording();
    this.closeFloatMenu();
  },

  onUnload() {
    if (this.ws) {
      this.ws.onMessage(null);
    }
    if (this.isRecording) this.cancelRecording();
    this.closeFloatMenu();
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
    },
    canSend() {
      return this.content.trim().length > 0;
    }
  },

  methods: {
    initWebSocket() {
      const app = getApp();
      if (app.globalData.ws) {
        this.ws = app.globalData.ws;
        this.listenWs();
        return;
      }
      if (app.globalData.isWsConnecting) return;

      app.globalData.isWsConnecting = true;
      const wsUrl = 'ws://localhost:8080/ws/group-chat';
      const ws = wx.connectSocket({
        url: wsUrl,
        header: { 'Authorization': 'Bearer ' + this.token }
      });

      ws.onOpen(() => {
        app.globalData.isWsConnecting = false;
        ws.send({
          data: JSON.stringify({
            type: 'auth',
            token: this.token,
            chatId: this.chatId
          })
        });
      });

      ws.onClose(() => {
        app.globalData.ws = null;
        app.globalData.isWsConnecting = false;
      });

      ws.onError(() => {
        app.globalData.isWsConnecting = false;
      });

      app.globalData.ws = ws;
      this.ws = ws;
      this.listenWs();
    },

    listenWs() {
      if (!this.ws) return;
      this.ws.onMessage((res) => {
        try {
          const msg = JSON.parse(res.data);
          this.handleWebSocketMessage(msg);
        } catch (e) {}
      });
    },

    handleWebSocketMessage(message) {
      if (message.type === 'message' && message.message) {
        const newMsg = message.message;
        const isSelf = String(newMsg.senderId) === String(this.userId);
        newMsg.isRead = isSelf ? 1 : 0;
        this.messageList.push(newMsg);
        this.$nextTick(() => {
          this.intoView = "msg-" + newMsg.messageId;
        });
      }

      if (message.type === 'message_revoke') {
        const msgId = message.messageId;
        const idx = this.messageList.findIndex(m => m.messageId === msgId);
        if (idx !== -1) {
          this.messageList[idx].messageType = 'revoke';
          this.messageList[idx].content = '该消息已撤回';
        }
      }
    },

    async onRefresh() {
      this.refreshing = true;
      this.page = 1;
      await this.getMessages();
      this.refreshing = false;
    },

    async loadMoreMessages() {
      if (this.loadingMore) return;
      this.loadingMore = true;
      this.page++;
      await this.getMessages(true);
      this.loadingMore = false;
    },

    async getMessages(loadMore = false) {
      return new Promise((resolve) => {
        uni.request({
          url: API_CONFIG.baseUrl + "/group-chat/message/history",
          data: { chatId: this.chatId, userId: this.userId, page: this.page, limit: this.limit },
          header: { Authorization: "Bearer " + this.token },
          success: (res) => {
            if (res.data.code === 200) {
              let list = res.data.data || [];
              list = list.filter(m => m.status !== 2);

              list.forEach(msg => {
                if (msg.isRead === undefined || msg.isRead === null) {
                  msg.isRead = 0;
                }
              });

              list.sort((a, b) => new Date(a.sendTime.replace(/-/g, '/')) - new Date(b.sendTime.replace(/-/g, '/')));

              if (loadMore) {
                this.messageList = [...list, ...this.messageList];
              } else {
                this.messageList = list;
                this.$nextTick(() => {
                  const lastMsg = this.messageList[this.messageList.length - 1];
                  if (lastMsg) this.intoView = "msg-" + lastMsg.messageId;
                });
              }
            }
            resolve();
          },
          fail: () => resolve()
        });
      });
    },

    markAllMessagesAsRead() {
      return new Promise((resolve) => {
        uni.request({
          url: API_CONFIG.baseUrl + "/group-chat/mark-all-read?chatId=" + this.chatId,
          method: "PUT",
          header: { Authorization: "Bearer " + this.token },
          success: () => {
            this.messageList.forEach(m => m.isRead = 1);
            resolve();
          },
          fail: () => resolve()
        });
      });
    },

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

    formatTime(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr.replace(/-/g, '/'));
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    onScroll(e) {
      this.closeFloatMenu();
    },

    getMembers() {
      return new Promise((resolve) => {
        uni.request({
          url: API_CONFIG.baseUrl + "/group-chat/members",
          data: { chatId: this.chatId },
          header: { Authorization: "Bearer " + this.token },
          success: (res) => {
            if (res.data.code === 200) {
              this.memberList = res.data.data || [];
              const me = this.memberList.find(u => String(u.userId) === String(this.userId));
              this.isAdmin = me && me.role === 'admin';
            }
            resolve();
          },
          fail: () => resolve()
        });
      });
    },

    openChangeRole(user) {
      const newRole = user.role === 'admin' ? 'member' : 'admin';
      uni.showModal({
        title: '修改角色',
        content: `确定设为${newRole === 'admin' ? '管理员' : 'member'}？`,
        success: (ok) => {
          if (ok.confirm) {
            uni.request({
              url: API_CONFIG.baseUrl + "/group-chat/member/role",
              method: "PUT",
              header: { Authorization: "Bearer " + this.token },
              data: { chatId: this.chatId, userId: user.userId, role: newRole },
              success: () => {
                uni.showToast({ title: '修改成功' });
                this.getMembers();
              }
            });
          }
        }
      });
    },

    deleteMember(user) {
      uni.showModal({
        title: '删除成员',
        content: '确定移出群聊？',
        success: (ok) => {
          if (ok.confirm) {
            uni.request({
              url: API_CONFIG.baseUrl + "/group-chat/member/remove",
              method: "DELETE",
              header: { Authorization: "Bearer " + this.token },
              data: { chatId: this.chatId, userId: user.userId },
              success: () => {
                uni.showToast({ title: '删除成功' });
                this.getMembers();
              }
            });
          }
        }
      });
    },

    sendText() {
      if (!this.ws || this.ws.readyState !== 1) {
        uni.showToast({ title: '未连接', icon: 'none' });
        return;
      }
      if (!this.canSend) return;
      this.ws.send({
        data: JSON.stringify({
          type: "send",
          userId: Number(this.userId),
          chatId: Number(this.chatId),
          content: this.content,
          messageType: "text",
          voiceUrl: "",
          voiceDuration: 0,
          recipientType: this.receiverType,
          recipientId: this.receiverId,
          atUserList: this.atUserList
        })
      });
      this.content = '';
      this.atUserList = [];
      this.showAtDropdown = false;
    },

    goToAddMember() {
      uni.navigateTo({ url: `/pages/chat-group/add-member?chatId=${this.chatId}` });
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
    },

    toggleVoiceMode() {
      this.isVoiceMode = !this.isVoiceMode;
    },

    startRecording() {
      this.isRecording = true;
      this.recordSec = 0;
      clearInterval(this.recordTimer);
      this.recordTimer = setInterval(() => this.recordSec++, 1000);

      this.recorder.start({
        format: 'mp3',
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000
      });
    },

    stopRecording() {
      if (!this.isRecording) return;
      this.isRecording = false;
      clearInterval(this.recordTimer);
      this.recorder.stop();

      const waitUpload = () => {
        if (this.recordSec < 1) {
          uni.showToast({ title: '录音时间太短', icon: 'none' });
          return;
        }
        if (!this.audioUrl) {
          setTimeout(waitUpload, 100);
          return;
        }
        this.sendVoice(this.audioUrl, this.recordSec);
      };
      waitUpload();
    },

    cancelRecording() {
      this.isRecording = false;
      clearInterval(this.recordTimer);
      this.recorder.stop();
    },

    sendVoice(filePath, duration) {
      uni.uploadFile({
        url: API_CONFIG.baseUrl + '/group-chat/upload-voice',
        filePath: filePath,
        name: 'file',
        header: { Authorization: 'Bearer ' + this.token },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            this.ws.send({
              data: JSON.stringify({
                type: "send",
                userId: Number(this.userId),
                chatId: Number(this.chatId),
                content: "",
                messageType: "voice",
                voiceUrl: data.data.url,
                voiceDuration: duration,
                recipientType: this.receiverType,
                recipientId: this.receiverId,
                atUserList: []
              })
            });
          }
        },
        fail: () => {
          uni.showToast({ title: '语音发送失败', icon: 'none' });
        }
      });
    },

    playVoice(url) {
      if (!url) {
        uni.showToast({ title: '语音地址不存在', icon: 'none' })
        return
      }
    
      const fullUrl = "http://localhost:8080" + url;
    
      // 初始化音频上下文
      if (!this.audioContext) {
        this.audioContext = uni.createInnerAudioContext();
        
        // 监听播放结束事件
        this.audioContext.onEnded(() => {
          this.audioContext.seek(0);
		  this.audioContext.pause(); 
        });
    
        this.audioContext.onError((err) => {
          console.error('音频播放错误:', err);
          uni.showToast({ title: '音频播放失败', icon: 'none' });
        });
      }
    
      const audio = this.audioContext;
	  
	  audio.loop = false;
    
      // 同一个音频：暂停 / 继续播放
      if (audio.src === fullUrl) {
        if (!audio.paused) {
          audio.pause();
        } else {
          audio.play();
        }
        return;
      }
      
      // 不同音频：先暂停当前
      if (!audio.paused) {
        audio.pause();
      }
    
      // 设置新地址
      audio.src = fullUrl;
      
      audio.onCanplay(() => {
        audio.play();
      });
    },

    showMsgMenu(msg, e) {
      this.currentMsg = msg;
      const isSelf = this.isSelfMsg(msg);
      const isText = msg.messageType === 'text';
      let menuList = [];

      if (isText) {
        menuList.push({ key: 'copy', name: '复制' });
      }
      if (isSelf) {
        menuList.push({ key: 'delete', name: '删除' });
      }
      if (menuList.length === 0) return;

      this.currentMenuList = menuList;

      const touch = e.touches[0];
      const systemInfo = uni.getSystemInfoSync();
      const px2rpx = 750 / systemInfo.windowWidth;
      let left = touch.clientX * px2rpx;
      const top = touch.clientY * px2rpx;
      const menuWidth = 220;

      if (isSelf) {
        left = left - menuWidth;
      }

      this.menuPos = { left, top };
      this.showFloatMenu = true;
    },

    closeFloatMenu() {
      this.showFloatMenu = false;
      this.currentMsg = null;
      this.currentMenuList = [];
    },

    async handleMenuClick(key) {
      const targetMsg = this.currentMsg;
      if (!targetMsg) {
        this.closeFloatMenu();
        return;
      }

      if (key === 'copy') {
        this.copyMsg();
      }
      if (key === 'delete') {
        await this.revokeMsg();
      }
      this.closeFloatMenu();
    },

    copyMsg() {
      if (!this.currentMsg) return;
      uni.setClipboardData({
        data: this.currentMsg.content,
        success: () => uni.showToast({ title: '复制成功' })
      })
    },

    async revokeMsg() {
      let targetMsg = this.currentMsg;
      if (!targetMsg) return;
      if (!this.isSelfMsg(targetMsg)) return;

      const confirm = await new Promise(resolve => {
        uni.showModal({
          title: '删除消息',
          content: '确定删除这条消息？',
          success: res => resolve(res.confirm)
        })
      });
      if (!confirm) return;

      const res = await uni.request({
        url: API_CONFIG.baseUrl + '/group-chat/message/revoke',
        method: 'PUT',
        header: { Authorization: 'Bearer ' + this.token },
        data: {
          messageId: targetMsg.messageId,
          chatId: this.chatId
        }
      });

      if (res.data.code === 200) {
        const idx = this.messageList.findIndex(m => m.messageId === targetMsg.messageId);
        if (idx !== -1) {
          this.messageList[idx].messageType = 'revoke';
          this.messageList[idx].content = '该消息已撤回';
        }
        uni.showToast({ title: '删除成功' });
      }
      this.currentMsg = null;
    },

    handleInputAt() {
      if (this.content.endsWith('@')) {
        this.showAtDropdown = true;
      } else {
        this.showAtDropdown = false;
      }
    },

    chooseAtMember(user) {
      const userName = this.getShowName(user.username, user.userId);
      this.content = this.content.slice(0, -1) + `@${userName} `;
      const exist = this.atUserList.some(x => x.userId === user.userId);
      if (!exist) this.atUserList.push(user);
      this.showAtDropdown = false;
    }
  }
};
</script>

<style scoped>
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

.at-tag-wrap {
  margin-bottom: 6rpx;
}
.at-tag {
  color: #A31D1D;
  font-size: 24rpx;
  margin-right: 8rpx;
  font-weight: 500;
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

.voice-bubble {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 150rpx;
}
.voice-duration {
  font-size: 24rpx;
  color: #666;
}
.msg-item.self-msg .voice-bubble {
  background: #07c160;
  color: #fff;
}
.msg-item.self-msg .voice-duration {
  color: #fff;
}

.msg-item.self-msg .bubble {
  background: #07c160;
  color: #fff;
}

.bubble.revoke-bubble {
  background: #eee;
  color: #999;
  font-size: 24rpx;
  padding: 10rpx 16rpx;
}

.name {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
}

.msg-time {
  font-size: 20rpx;
  color: #999;
  margin-top: 4rpx;
  margin-left: 8rpx;
}

.loading-more {
  text-align: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;
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
  align-items: flex-end;
  padding: 16rpx 20rpx;
  box-sizing: border-box;
  gap: 12rpx;
}

.mode-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  }
    input-textarea {
      flex: 1;
      min-height: 60rpx;
      max-height: 240rpx;
      background: #f2f3f5;
      border-radius: 30rpx;
      padding: 18rpx 24rpx;
      font-size: 28rpx;
      line-height: 1.5;
      word-break: break-all;
      white-space: pre-wrap;
      overflow-y: auto;
    }
  
    .send-btn {
      width: 110rpx;
      height: 60rpx;
      background: #A31D1D;
      color: #fff;
      border-radius: 30rpx;
      font-size: 28rpx;
      border: none;
      flex-shrink: 0;
    }
  
    .send-btn[disabled] {
      background: #d8d8d8;
    }
  
    .voice-btn {
      flex: 1;
      height: 60rpx;
      background: #f2f3f5;
      border-radius: 30rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #333;
    }
    .voice-btn.recording {
      background: #e0e0e0;
      color: #A31D1D;
    }
  
    .css-voice-toggle-icon {
      width: 48rpx;
      height: 48rpx;
      border: 3rpx solid #333;
      border-radius: 50%;
      position: relative;
    }
    .css-voice-toggle-icon::before,
    .css-voice-toggle-icon::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background-color: #333;
    }
    .css-voice-toggle-icon::before {
      width: 12rpx;
      height: 12rpx;
      clip-path: polygon(0 0, 100% 50%, 0 100%);
    }
    .css-voice-toggle-icon::after {
      width: 20rpx;
      height: 3rpx;
      left: calc(50% + 6rpx);
    }
  
    .css-keyboard-toggle-icon {
      width: 48rpx;
      height: 48rpx;
      border: 3rpx solid #333;
      border-radius: 50%;
      position: relative;
    }
    .css-keyboard-toggle-icon::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 28rpx;
      height: 20rpx;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 3rpx;
      background-color: #333;
      border-radius: 1rpx;
    }
  
    .css-voice-icon {
      width: 32rpx;
      height: 32rpx;
      background-color: #333;
      clip-path: polygon(0 0, 100% 50%, 0 100%);
    }
    .msg-item.self-msg .css-voice-icon {
      background-color: #fff;
    }
  
    .at-dropdown-mask {
      position: fixed;
      bottom: 180rpx;
      left: 0;
      right: 0;
      z-index: 999;
    }
    .at-dropdown-box {
      margin: 0 30rpx;
      background: #fff;
      border-radius: 16rpx;
      box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.15);
      max-height: 400rpx;
    }
    .at-member-scroll {
      max-height: 400rpx;
    }
    .at-member-item {
      padding: 24rpx 30rpx;
      font-size: 28rpx;
      border-bottom: 1rpx solid #f2f2f2;
    }
    .at-member-item:active {
      background-color: #f5f5f5;
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
      z-index: 9999;
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
  
    .float-menu-mask {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 99999;
    }
    .float-menu-box {
      position: absolute;
      width: 220rpx;
      background: #ffffff;
      border-radius: 12rpx;
      box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.18);
      overflow: hidden;
    }
    .float-menu-item {
      padding: 28rpx 32rpx;
      font-size: 28rpx;
      color: #333;
      border-bottom: 1rpx solid #f1f1f1;
    }
    .float-menu-item:last-child {
      border-bottom: none;
    }
    .float-menu-item:active {
      background-color: #f5f5f5;
    }
  </style>