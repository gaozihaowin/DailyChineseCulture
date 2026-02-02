<template>
  <view class="view-container">
    
    <view class="art-header">
      
      <view class="nav-bar">
        <view class="nav-brand">
          <text class="brand-en">ZHI LIANG ZHI</text>
          <text class="brand-cn">致良知教育</text>
        </view>
        </view>

      <view class="user-card-inner">
        <view class="card-glass-bg"></view>
        
        <view class="user-content">
          <view class="avatar-wrapper">
             <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
             <image class="avatar-crown" src="https://img.icons8.com/emoji/48/crown-emoji.png" mode="widthFix"></image>
          </view>
          
          <view class="info-block">
            <view class="name-row">
              <text class="nickname">{{ userInfo.nickname }}</text>
            </view>
            <view class="motto-row">
              <text class="motto">当前身份：{{ currentIdentity }}</text>
            </view>
            <view class="tags-row">
              <view class="vip-tag">
                <uni-icons type="vip-filled" size="12" color="#5d4037"></uni-icons>
                <text>正式学员</text>
              </view>
            </view>
          </view>
          
          <view class="identity-wrapper">
            <view class="identity-btn" @tap.stop="toggleIdentityMenu">
              <text>切换身份</text>
              <uni-icons :type="isIdentityOpen ? 'top' : 'bottom'" size="12" color="#fff" style="margin-left: 4rpx;"></uni-icons>
            </view>

            <view class="identity-dropdown" v-if="isIdentityOpen">
              <view 
                class="dropdown-item" 
                v-for="(role, index) in identityOptions" 
                :key="index"
                @tap.stop="switchIdentity(role)"
              >
                <uni-icons :type="role.icon" size="16" :color="currentIdentity === role.name ? '#9e2a2b' : '#666'"></uni-icons>
                <text :class="{ 'active-role': currentIdentity === role.name }">{{ role.name }}</text>
                <uni-icons v-if="currentIdentity === role.name" type="checkmarkempty" size="14" color="#9e2a2b"></uni-icons>
              </view>
            </view>
          </view>
          </view>

        <view class="stats-row">
          <view class="stat-item" v-for="(item, index) in statsList" :key="index">
            <text class="stat-num">{{ item.value }}</text>
            <text class="stat-label">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" @tap="closeIdentityMenu">
      
      <view class="section-box fade-in-up">
        <view class="grid-container">
          <view 
            class="grid-item" 
            v-for="(item, index) in coreServices" 
            :key="index"
            @tap="handleMenuClick(item)"
          >
            <view class="grid-icon-box" :style="{ backgroundColor: item.bgColor }">
              <uni-icons :type="item.icon" size="30" :color="item.iconColor"></uni-icons>
            </view>
            <text class="grid-text">{{ item.text }}</text>
          </view>
        </view>
      </view>

      <view class="section-box fade-in-up delay-1">
        <view class="section-title-row">
          <text class="section-title">常用服务</text>
        </view>
        <view class="menu-item" v-for="(item, index) in commonServices" :key="index" @tap="handleMenuClick(item)">
          <view class="menu-left">
            <view class="list-icon-box" :style="{ backgroundColor: item.lightColor }">
                <uni-icons :type="item.icon" size="20" :color="item.color"></uni-icons>
            </view>
            <text class="menu-text">{{ item.text }}</text>
          </view>
          <view class="menu-right">
             <text class="menu-extra" v-if="item.extra">{{ item.extra }}</text>
             <uni-icons type="right" size="14" color="#ddd"></uni-icons>
          </view>
        </view>
      </view>

      <view class="section-box fade-in-up delay-2">
        <view class="menu-item" v-for="(item, index) in otherServices" :key="index" @tap="handleMenuClick(item)">
          <view class="menu-left">
            <view class="list-icon-box" :style="{ backgroundColor: item.lightColor }">
               <uni-icons :type="item.icon" size="20" :color="item.color"></uni-icons>
            </view>
            <text class="menu-text">{{ item.text }}</text>
          </view>
          <view class="menu-right">
             <uni-icons type="right" size="14" color="#ddd"></uni-icons>
          </view>
        </view>
      </view>

      <view class="footer-info">
        <text>致良知教育 v1.3.0</text>
      </view>
      
      <view class="safe-area-spacer"></view>

    </scroll-view>
  </view>
</template>

<script>
  export default {
    name: 'MineView',
    
    data() {
      return {
        // --- 用户基础数据 ---
        userInfo: { 
          nickname: 'Mystery', 
          avatar: '/static/logo.png' 
        },
        
        // --- 身份切换控制 ---
        isIdentityOpen: false, // 控制弹窗显隐
        currentIdentity: '学员端',
        identityOptions: [
          { name: '学员端', icon: 'person' },
          { name: '讲师端', icon: 'staff' },
          { name: '访客端', icon: 'eye' }
        ],

        // --- 顶部统计数据 ---
        statsList: [
          { label: '余额', value: '0.00' },
          { label: '优惠券', value: '2' },
          { label: '积分', value: '1.2k' },
          { label: '学时', value: '45h' }
        ],

        /**
         * [配置项] 核心服务 (宫格)
         * 使用 uni-icons 确保图标 100% 显示
         * 风格：扁平化、无描边、莫兰迪底色
         */
        coreServices: [
          { 
            text: '我的课程', 
            icon: 'book-filled',   
            bgColor: '#E3F2FD',    // 淡蓝背景
            iconColor: '#2196F3'   // 深蓝图标
          },
          { 
            text: '我的订单', 
            icon: 'list',          
            bgColor: '#FFF3E0',    // 淡橙背景
            iconColor: '#FF9800'   // 深橙图标
          },
          { 
            text: '我的证书', 
            icon: 'vip-filled',    
            bgColor: '#F3E5F5',    // 淡紫背景
            iconColor: '#9C27B0'   // 深紫图标
          },
          { 
            text: '我的考试', 
            icon: 'compose',       
            bgColor: '#E8F5E9',    // 淡绿背景
            iconColor: '#4CAF50'   // 深绿图标
          }
        ],

        /**
         * [配置项] 常用服务 (列表)
         */
        commonServices: [
          { text: '咨询服务单', icon: 'headphones', color: '#FF5722', lightColor: '#FBE9E7', extra: '' },
          { text: '返现与提现', icon: 'wallet',     color: '#E91E63', lightColor: '#FCE4EC', extra: '' },
          { text: '我的社群',   icon: 'staff-filled', color: '#673AB7', lightColor: '#EDE7F6', extra: '加入' }
        ],

        /**
         * [配置项] 其他服务 (列表)
         */
        otherServices: [
          { text: '用户协议', icon: 'info',       color: '#607D8B', lightColor: '#ECEFF1' },
          { text: '关于我们', icon: 'help',       color: '#607D8B', lightColor: '#ECEFF1' },
          { text: '设置',     icon: 'gear-filled', color: '#607D8B', lightColor: '#ECEFF1' }
        ]
      }
    },

    methods: {
      /**
       * 切换身份菜单的展开/收起
       * 使用 stop 修饰符防止冒泡
       */
      toggleIdentityMenu() {
        this.isIdentityOpen = !this.isIdentityOpen;
      },

      /**
       * 点击页面其他区域时关闭菜单
       */
      closeIdentityMenu() {
        if (this.isIdentityOpen) this.isIdentityOpen = false;
      },

      /**
       * 执行身份切换逻辑
       * @param {Object} role - 选中的角色对象
       */
      switchIdentity(role) {
        this.currentIdentity = role.name;
        this.isIdentityOpen = false;
        
        // 模拟网络请求延迟
        uni.showLoading({ title: '切换中...' });
        setTimeout(() => {
          uni.hideLoading();
          uni.showToast({ title: `已切换为${role.name}`, icon: 'success' });
        }, 500);
      },

      /**
       * 统一处理菜单点击跳转
       */
      handleMenuClick(item) {
        uni.showToast({ title: item.text, icon: 'none' });
      }
    }
  }
</script>

<style scoped>
  /* ================================================================= */
  /* [CSS SECTION 1] 布局与容器                                         */
  /* ================================================================= */
  .view-container { 
    height: 100%; 
    display: flex; 
    flex-direction: column; 
    background-color: #F4F5F7; /* 统一底色 */
  }
  
  /* ================================================================= */
  /* [CSS SECTION 2] 艺术头部 (Header)                                  */
  /* ================================================================= */
  .art-header { 
    /* 品牌红黑渐变背景 */
    background: linear-gradient(160deg, #A31D1D 0%, #680E0E 100%); 
    padding: 80rpx 30rpx 30rpx; 
    border-bottom-left-radius: 48rpx; 
    border-bottom-right-radius: 48rpx; 
  }
  
  .nav-bar { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 30rpx; 
    padding: 0 10rpx; 
  }
  .brand-en { 
    font-size: 18rpx; color: rgba(255,255,255,0.5); 
    letter-spacing: 4rpx; display: block; margin-bottom: 4rpx; 
  }
  .brand-cn { 
    font-size: 34rpx; font-weight: bold; color: #fff; letter-spacing: 2rpx; 
  }
  
  /* ================================================================= */
  /* [CSS SECTION 3] 用户卡片 (User Card)                               */
  /* ================================================================= */
  .user-card-inner { 
    position: relative; 
    border-radius: 32rpx; 
    padding: 40rpx; 
    box-shadow: 0 12rpx 30rpx rgba(50, 10, 10, 0.2); 
    /* 注意：移除了 overflow:hidden 以便让下拉菜单能显示出来 */
  }
  
  /* 磨砂背景装饰层 */
  .card-glass-bg { 
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(255,255,255,0.08); 
    border: 1px solid rgba(255,255,255,0.1); 
    border-radius: 32rpx; 
    z-index: 0; 
    pointer-events: none; /* 防止遮挡点击 */
  }

  .user-content { 
    position: relative; z-index: 10; 
    display: flex; align-items: center; margin-bottom: 40rpx; 
  }
  
  /* 头像样式 */
  .avatar-wrapper { position: relative; margin-right: 24rpx; }
  .avatar { 
    width: 120rpx; height: 120rpx; 
    border-radius: 50%; 
    border: 4rpx solid rgba(255,255,255,0.9); 
  }
  .avatar-crown { 
    position: absolute; top: -12rpx; right: -8rpx; width: 36rpx; transform: rotate(15deg); 
  }

  /* 文本信息样式 */
  .info-block { flex: 1; display: flex; flex-direction: column; }
  .nickname { font-size: 38rpx; font-weight: bold; color: #fff; }
  .motto { 
    font-size: 22rpx; color: rgba(255,255,255,0.7); margin: 8rpx 0 12rpx; 
  }
  .vip-tag { 
    background: linear-gradient(90deg, #FFECB3, #FFD54F); 
    padding: 6rpx 16rpx; border-radius: 8rpx; 
    display: inline-flex; align-items: center; gap: 6rpx; 
  }
  .vip-tag text { font-size: 20rpx; color: #5d4037; font-weight: bold; }

  /* ================================================================= */
  /* [CSS SECTION 4] 身份切换组件 (Identity Switcher)                   */
  /* ================================================================= */
  .identity-wrapper { position: relative; }
  
  .identity-btn {
    background: rgba(0,0,0,0.2); 
    padding: 10rpx 24rpx; 
    border-radius: 100rpx; 
    border: 1px solid rgba(255,255,255,0.3); 
    color: #fff; font-size: 22rpx; font-weight: 500;
    display: flex; align-items: center; 
    transition: all 0.2s;
  }
  .identity-btn:active { background: rgba(0,0,0,0.4); }

  /* 下拉气泡菜单 */
  .identity-dropdown {
    position: absolute; top: 70rpx; right: 0; 
    width: 240rpx;
    background: #fff; 
    border-radius: 16rpx;
    box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.15);
    padding: 10rpx 0;
    z-index: 999; /* 确保层级最高 */
    animation: fadeIn 0.2s ease-out;
  }
  @keyframes fadeIn { 
    from { opacity: 0; transform: translateY(-10rpx); } 
    to { opacity: 1; transform: translateY(0); } 
  }

  .dropdown-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20rpx 30rpx;
    font-size: 26rpx; color: #333;
  }
  .dropdown-item:active { background-color: #f5f5f5; }
  .active-role { color: #9e2a2b; font-weight: bold; }

  /* 底部统计行 */
  .stats-row { 
    position: relative; z-index: 1; 
    display: flex; justify-content: space-between; 
    padding-top: 30rpx; 
    border-top: 1px solid rgba(255,255,255,0.15); 
  }
  .stat-item { display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
  .stat-num { font-size: 34rpx; font-weight: bold; color: #fff; font-family: sans-serif; }
  .stat-label { font-size: 22rpx; color: rgba(255,255,255,0.7); }

  /* ================================================================= */
  /* [CSS SECTION 5] 内容列表区域 (Content List)                        */
  /* ================================================================= */
  .scroll-content { flex: 1; height: 0; }
  
  /* 通用入场动画 */
  .fade-in-up { 
    animation: fadeInUp 0.5s ease-out forwards; 
    opacity: 0; transform: translateY(20rpx); 
  }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

  /* 通用白盒子 */
  .section-box { 
    background: #fff; 
    margin: 30rpx; 
    border-radius: 24rpx; 
    padding: 30rpx; 
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02); 
  }

  /* 宫格容器 */
  .grid-container { display: flex; justify-content: space-between; }
  .grid-item { display: flex; flex-direction: column; align-items: center; gap: 16rpx; flex: 1; }
  
  /* 扁平化图标底座 */
  .grid-icon-box { 
    width: 96rpx; height: 96rpx; 
    border-radius: 32rpx; 
    display: flex; justify-content: center; align-items: center; 
    transition: transform 0.2s;
  }
  .grid-item:active .grid-icon-box { transform: scale(0.92); }
  .grid-text { font-size: 24rpx; color: #333; font-weight: 500; }
  
  /* 列表项样式 */
  .section-title-row { margin-bottom: 20rpx; }
  .section-title { font-size: 30rpx; font-weight: bold; color: #333; }
  
  .menu-item { 
    display: flex; justify-content: space-between; align-items: center; 
    padding: 28rpx 0; 
  }
  .menu-item:not(:last-child) { border-bottom: 1px solid #f9f9f9; }
  .menu-item:active { opacity: 0.6; }

  .menu-left { display: flex; align-items: center; gap: 24rpx; }
  .list-icon-box { 
    width: 60rpx; height: 60rpx; border-radius: 16rpx; 
    display: flex; justify-content: center; align-items: center; 
  }
  
  .menu-text { font-size: 28rpx; color: #333; font-weight: 500; }
  .menu-right { display: flex; align-items: center; gap: 10rpx; }
  .menu-extra { font-size: 22rpx; color: #999; }

  .footer-info { text-align: center; margin-top: 30rpx; color: #ccc; font-size: 22rpx; }
  .safe-area-spacer { height: 160rpx; }
</style>