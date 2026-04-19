<template>
  <view class="view-container">
    <view class="art-header"> 
      <view class="nav-bar"> 
        <view class="back-btn" @tap="navBack">
          <view class="back-arrow"></view>
        </view>
        <view class="nav-brand"> 
          <text class="brand-en">ZHI LIANG ZHI</text> 
          <text class="brand-cn">群聊管理</text> 
        </view> 
        <view class="placeholder"></view>
      </view> 
    </view>

    <scroll-view 
      scroll-y 
      class="scroll-content"
      :enhanced="true"
      :show-scrollbar="true"
      v-if="managementScopes.length > 0"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="content-wrapper"> 
        <view class="section-box scope-selector"> 
          <view class="selector-title">选择管理范围：</view> 
          <scroll-view class="scope-list" scroll-x>
            <view
              v-for="(scope, index) in managementScopes"
              :key="`scope-${index}`"
              class="scope-item"
              :class="{ active: selectedIndex === index }"
              @click="selectScopeByIndex(index)"
            >
              <view class="scope-duty">{{ scope.dutyType }}</view>
              <view class="scope-target">{{ scope.fullName }}</view>
            </view>
          </scroll-view>
        </view> 

        <view class="section-box task-content">
          <view v-if="isLoading" class="empty-tip">
            <text>加载中...</text>
          </view>
        
          <view v-if="!hasCreatedAllRequiredGroups" class="create-btn-box">
            <text class="empty-text">当前范围未创建完成群聊</text>
            <button class="create-btn" @click="handleCreateAllGroups">
              一键创建当前范围所有群聊
            </button>
          </view>

          <view class="group-list-container" v-if="groupList.length > 0">
            <view class="section-title">我的群聊</view>
            
            <view 
              v-for="group in groupList" 
              :key="`group-${group.chatId}`" 
              class="group-item"
              @click="openGroupChat(group)"
            >
              <view class="group-tag" :class="group.typeTagClass">
                {{ group.typeText }}
              </view>
              <view class="group-name">{{ group.name }}</view>
              
              <view v-if="group.unreadCount > 0" class="unread-badge">
                {{ group.unreadCount > 99 ? '99+' : group.unreadCount }}
              </view>
            </view>
          </view>

          <view v-else-if="hasCreatedAllRequiredGroups && groupList.length === 0" class="empty-tip">
            <text>暂无群聊</text>
          </view>
        </view>

        <view class="safe-area-spacer"></view> 
      </view> 
    </scroll-view>

    <view v-else class="no-scope-tip"> 
      <text>暂无管理范围权限</text> 
    </view>
  </view>
</template>

<script>
import { API_CONFIG } from '../../api/config.js';

export default {
  data() {
    return {
      token: '',
      managementScopes: [],
      selectedScope: null,
      groupList: [],
      hasCreatedAllRequiredGroups: false,
      isLoading: false,
      refreshing: false,
      ws: null,
      selectedIndex: 0
    };
  },

  onLoad() {
    this.token = uni.getStorageSync('token');
    this.getManagementScopes();
    this.initWebSocket();
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
    async onRefresh() {
      this.refreshing = true;
      await this.reloadGroupList();
      this.refreshing = false;
    },
    
    async reloadGroupList() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.token = uni.getStorageSync('token');
    
      await this.getManagementScopes();
      if (this.selectedScope) {
        await this.loadGroupListByScope();
        await this.loadUnreadCounts();
      }
      
      this.isLoading = false;
    },

    // 全局唯一 WebSocket
    initWebSocket() {
      const app = getApp();
      if (app.globalData.ws) {
        this.ws = app.globalData.ws;
        this.listenWs();
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
          data: JSON.stringify({ type: 'auth', token: this.token })
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
          if (msg.type === 'message') {
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

    async loadUnreadCounts() {
      for (let group of this.groupList) {
        try {
          group.unreadCount = await this.getUnreadCount(group.chatId);
        } catch (e) {
          group.unreadCount = 0;
        }
      }
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

    navBack() {
      uni.navigateBack();
    },
    
    getManagementScopes() {
      return new Promise((resolve) => {
        if (!this.token) {
          uni.showToast({ title: '请先登录', icon: 'none' });
          resolve();
          return;
        }
        this.isLoading = true;
        uni.request({
          url: `${API_CONFIG.baseUrl}/volunteer/scopes`,
          header: { Authorization: `Bearer ${this.token}` },
          success: (res) => {
            this.isLoading = false;
            if (res.data.code === 200) {
              this.managementScopes = this.formatScopeData(res.data.data);
              if (this.managementScopes.length > 0) {
                this.selectedIndex = 0;
                this.selectedScope = this.managementScopes[0];
                this.loadGroupListByScope().finally(() => resolve());
              } else {
                resolve();
              }
            } else {
              resolve();
            }
          },
          fail: () => {
            this.isLoading = false;
            resolve();
          }
        });
      });
    },

    formatScopeData(data) {
      let scopes = [];
      if (Array.isArray(data)) {
        data.forEach(item => {
          const targetType = item.targetType;
          let id = null;
          let fullName = '';
          const campName = item.campName || '';
          const campId = item.campId;

          if (targetType === 'class') {
            id = item.classId || item.id;
            fullName = campName ? `${campName}-${item.className || item.name}` : (item.className || item.name);
          } else if (targetType === 'big_group') {
            id = item.bigGroupId || item.id;
            const groupName = item.className ? `${item.className}-${item.bigGroupName}` : (item.bigGroupName || item.name);
            fullName = campName ? `${campName}-${groupName}` : groupName;
          } else if (targetType === 'small_group') {
            id = item.smallGroupId || item.id;
            const groupName = item.className ? `${item.className}-${item.bigGroupName || ''}-${item.smallGroupName}` : (item.smallGroupName || item.name);
            fullName = campName ? `${campName}-${groupName}` : groupName;
          }

          if (id) {
            scopes.push({
              ...item,
              campId: campId,
              id: id,
              fullName: fullName
            });
          }
        });
      }
      return scopes;
    },

    selectScopeByIndex(index) {
      this.selectedIndex = index;
      this.selectedScope = this.managementScopes[index];
      this.loadGroupListByScope();
    },

    loadGroupListByScope() {
      return new Promise(async (resolve) => {
        if (!this.selectedScope) {
          resolve();
          return;
        }
        this.isLoading = true;

        uni.request({
          url: `${API_CONFIG.baseUrl}/group-chat/list`,
          header: { Authorization: `Bearer ${this.token}` },
          data: {
            dutyType: this.selectedScope.dutyType,
            targetId: this.selectedScope.id
          },
          success: async (res) => {
            this.isLoading = false;
            if (res.data.code === 200) {
              this.groupList = res.data.data.map(item => {
                let typeTagClass, typeText;
                if (item.type === '班级群') {
                  typeTagClass = 'class';
                  typeText = '班级群';
                } else if (item.type === '大组群') {
                  typeTagClass = 'big';
                  typeText = '大组群';
                } else {
                  typeTagClass = 'small';
                  typeText = '小组群';
                }
                return {
                  ...item,
                  typeTagClass,
                  typeText,
                  unreadCount: 0
                };
              });

              const dutyType = this.selectedScope.dutyType;
              const hasClassGroup = this.groupList.some(g => g.type === '班级群');
              const hasBigGroup = this.groupList.some(g => g.type === '大组群');
              const hasSmallGroup = this.groupList.some(g => g.type === '小组群');
              
              if (["学组", "检组"].includes(dutyType)) {
                this.hasCreatedAllRequiredGroups = hasSmallGroup;
              } 
              else if (["学委", "检委"].includes(dutyType)) {
                this.hasCreatedAllRequiredGroups = hasBigGroup && hasSmallGroup;
              } 
              else if (["学班", "检班"].includes(dutyType)) {
                this.hasCreatedAllRequiredGroups = hasClassGroup && hasBigGroup && hasSmallGroup;
              } 
              else {
                this.hasCreatedAllRequiredGroups = false;
              }

              await this.loadUnreadCounts();
            }
            resolve();
          },
          fail: () => {
            this.isLoading = false;
            this.hasCreatedAllRequiredGroups = false;
            this.groupList = [];
            resolve();
          }
        });
      });
    },

    handleCreateAllGroups() {
      const s = this.selectedScope;
      if (!s) {
        uni.showToast({ title: "请选择管理范围", icon: "none" });
        return;
      }

      uni.showModal({
        title: '确认创建',
        content: `确定为【${s.fullName}】创建所有群聊吗？`,
        success: (ok) => {
          if (ok.confirm) {
            uni.showLoading({ title: "创建中..." });
            
            uni.request({
              url: `${API_CONFIG.baseUrl}/group-chat/auto-create`,
              method: 'POST',
              header: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json"
              },
              data: {
                campId: s.campId,
                targetId: s.id,
                dutyType: s.dutyType
              },
              success: (res) => {
                uni.hideLoading();
                let result = res.data || res;
                
                if (result.code === 200 || result.msg?.includes("已存在") || result.msg?.includes("重复")) {
                  uni.showToast({ title: "创建成功", icon: "success" });
                } else {
                  uni.showToast({ title: result.msg || "创建完成", icon: "success" });
                }
                
                setTimeout(() => this.loadGroupListByScope(), 800);
              },
              fail: (err) => {
                uni.hideLoading();
                uni.showToast({ title: "创建完成", icon: "success" });
                setTimeout(() => this.loadGroupListByScope(), 800);
              }
            });
          }
        }
      });
    },

    openGroupChat(group) {
      this.markAllMessagesAsRead(group.chatId).then(() => {
        group.unreadCount = 0;
        uni.navigateTo({
          url: `/pages/chat-group/chatdetail?chatId=${group.chatId}&groupName=${encodeURIComponent(group.name)}`
        });
      }).catch(() => {
        uni.navigateTo({
          url: `/pages/chat-group/chatdetail?chatId=${group.chatId}&groupName=${encodeURIComponent(group.name)}`
        });
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
  overflow-x: hidden; 
  position: relative;
}
.art-header { 
  background: linear-gradient(160deg, #A31D1D 0%, #801212 100%);
  padding: 88rpx 30rpx 30rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0; 
  margin-bottom: 30rpx;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
} 
.nav-bar { 
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
  width: 100%;
} 

.back-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.back-arrow {
  width: 20rpx;
  height: 20rpx;
  border-top: 3rpx solid #fff;
  border-left: 3rpx solid #fff;
  transform: rotate(-45deg);
}
.placeholder { width: 48rpx; height: 48rpx; }
.nav-brand { flex: 1; text-align: center; } 
.brand-en { font-size: 18rpx; color: rgba(255,255,255,0.5); display: block; margin-bottom: 4rpx; } 
.brand-cn { font-size: 36rpx; font-weight: bold; color: #fff; }
.scroll-content {
  flex: 1;
  height: 0; 
  box-sizing: border-box; 
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden; 
  padding-top: 220rpx;
}
.content-wrapper { padding: 0 30rpx; box-sizing: border-box; min-height: calc(100% + 1px); }
.section-box { 
  background: #fff;
  margin: 30rpx 0; 
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  width: 100%;
  box-sizing: border-box;
}
.scope-selector .selector-title { font-size: 28rpx; color: #333; margin-bottom: 20rpx; font-weight: bold; }
.scope-list { white-space: nowrap; }
.scope-item {
  display: inline-block;
  padding: 15rpx 25rpx;
  margin-right: 15rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  background: #fafafa;
  min-width: 200rpx;
}
.scope-item.active { border-color: #A31D1D; background: #fdf2f2; }
.scope-duty { font-size: 24rpx; color: #A31D1D; font-weight: bold; margin-bottom: 5rpx; }
.scope-target { font-size: 22rpx; color: #666; }
.task-content { padding: 10rpx 0; }
.empty-tip { text-align: center; padding: 80rpx 0; color: #999; font-size: 28rpx; } 
.create-btn-box { text-align: center; padding: 20rpx 0 40rpx; }
.empty-text { display: block; font-size: 28rpx; color: #999; margin-bottom: 30rpx; }
.create-btn { background-color: #A31D1D; color: #fff; padding: 20rpx 30rpx; border-radius: 16rpx; font-size: 28rpx; border: none; }

.section-title { 
  font-size: 28rpx; 
  font-weight: bold; 
  margin: 0 20rpx 20rpx 20rpx;
  color: #333; 
  padding-bottom: 10rpx; 
  border-bottom: 1rpx solid #f0f0f0;
}

.group-item { 
  padding: 25rpx 20rpx; 
  border-bottom: 1rpx solid #f0f0f0; 
  position: relative; 
  border-radius: 12rpx;
  margin-bottom: 6rpx;
}
.group-item:last-child {
  border-bottom: none;
}
.group-item:active {
  background: #f7f7f7;
}

.group-tag { position: absolute; right: 20rpx; top: 25rpx; padding: 6rpx 12rpx; border-radius: 8rpx; font-size: 20rpx; color: #fff; }
.group-tag.class { background-color: #A31D1D; }
.group-tag.big { background-color: #4CAF50; }
.group-tag.small { background-color: #2196F3; }
.group-name { font-size: 30rpx; font-weight: bold; margin-bottom: 10rpx; color: #333; }

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
  z-index: 10;
}

.no-scope-tip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #999;
  background-color: #F4F4F5;
  padding-top: 220rpx;
}
.safe-area-spacer { height: 200rpx; }
</style>