<template>
    <view class="app-container">
        
        <view class="content-area">
            <home-view v-show="currentTab === 0"></home-view>
            
            <course-view v-show="currentTab === 1"></course-view>
            
            <view v-show="currentTab === 2" class="placeholder-page">
                <uni-icons type="person-filled" size="80" color="#e0e0e0"></uni-icons>
                <text class="tip-text">个人中心 开发中...</text>
            </view>
            
            <view v-show="currentTab === 3" class="placeholder-page">
                <uni-icons type="gift-filled" size="80" color="#e0e0e0"></uni-icons>
                <text class="tip-text">文创商城 敬请期待</text>
            </view>
        </view>

        <view class="bottom-nav-wrapper">
            <view class="bottom-nav">
                <view 
                    class="nav-item-btn" 
                    v-for="(item, index) in tabBar" 
                    :key="index"
                    @tap="switchTab(index)"
                >
                    <view class="nav-icon-box" :class="{ 'anim-bounce': currentTab === index }">
                        <uni-icons 
                            :type="currentTab === index ? item.activeIcon : item.icon" 
                            :size="currentTab === index ? 32 : 26" 
                            :color="currentTab === index ? '#9e2a2b' : '#bfbfbf'"
                            style="transition: all 0.3s;"
                        ></uni-icons>
                    </view>
                    <text class="nav-text" :class="{ 'active-text': currentTab === index }">
                        {{ item.text }}
                    </text>
                    <view class="active-dot" v-if="currentTab === index"></view>
                </view>
            </view>
            <view class="safe-area-bg"></view>
        </view>

    </view>
</template>

<script>
    // 引入组件
    import HomeView from '@/components/home-view/home-view.vue';
    import CourseView from '@/components/course-view/course-view.vue';

    export default {
        components: {
            HomeView,
            CourseView
        },
        data() {
            return {
                currentTab: 0, // 默认显示首页
                tabBar: [
                    { text: '主页', icon: 'home', activeIcon: 'home-filled' },
                    { text: '课程', icon: 'shop', activeIcon: 'shop-filled' },
                    { text: '我的', icon: 'person', activeIcon: 'person-filled' },
                    { text: '文创', icon: 'gift', activeIcon: 'gift-filled' }
                ]
            }
        },
        // 【优化点2】监听全局事件，允许子组件控制 Tab 切换
        onLoad() {
            // 监听 'switchTab' 事件
            uni.$on('switchTab', (index) => {
                this.switchTab(index);
            });
        },
        onUnload() {
            // 页面销毁时移除监听，是个好习惯
            uni.$off('switchTab'); 
        },
        methods: {
            switchTab(index) {
                this.currentTab = index;
            }
        }
    }
</script>

<style scoped>
    .app-container {
        height: 100vh;
        background-color: #f9f7f2;
        display: flex;
        flex-direction: column;
        overflow: hidden; /* 禁止整页滚动，交给内部 scroll-view */
    }

    .content-area {
        flex: 1;
        height: 0; /* 关键：配合 flex:1 撑满剩余空间 */
        position: relative;
    }

    /* 占位页样式 */
    .placeholder-page {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #fff;
    }
    .tip-text {
        margin-top: 20rpx;
        color: #999;
        font-size: 28rpx;
        font-weight: 500;
    }

    /* --- 底部导航样式 --- */
    .bottom-nav-wrapper {
        position: relative; 
        z-index: 999;
        box-shadow: 0 -4rpx 30rpx rgba(0,0,0,0.03);
    }
    .bottom-nav {
        height: 120rpx; 
        background: rgba(255, 255, 255, 0.98);
        display: flex; justify-content: space-around; align-items: center;
        border-top: 1px solid rgba(0,0,0,0.02);
    }
    .nav-item-btn {
        flex: 1; height: 100%;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        position: relative;
    }
    .nav-icon-box {
        position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 6rpx;
    }
    .anim-bounce { animation: jelly 0.5s ease-in-out; }
    @keyframes jelly {
        0% { transform: scale(1); }
        30% { transform: scale(0.75); }
        40% { transform: scale(1.25); }
        50% { transform: scale(0.9); }
        60% { transform: scale(1.1); }
        70% { transform: scale(1); }
    }
    .nav-text {
        font-size: 22rpx; color: #bfbfbf; font-weight: 500; transition: all 0.3s; letter-spacing: 1rpx;
    }
    .active-text {
        color: #9e2a2b; font-weight: 700; font-size: 24rpx; transform: translateY(-2rpx);
    }
    .active-dot {
        position: absolute; bottom: 10rpx; width: 8rpx; height: 8rpx;
        background-color: #9e2a2b; border-radius: 50%;
        box-shadow: 0 2rpx 6rpx rgba(158, 42, 43, 0.4);
    }
    .safe-area-bg { width: 100%; height: env(safe-area-inset-bottom); background-color: #fff; }
</style>