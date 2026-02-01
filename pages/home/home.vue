<template>
    <view class="page-container">
        
        <view class="header">
            <view class="logo-text">
                <text class="logo-seal">良知</text>
                <text>致良知教育</text>
            </view>
            <view class="header-actions">
                <uni-icons type="search" size="24" color="#2d2424" style="margin-right: 30rpx;"></uni-icons>
                <uni-icons type="notification" size="24" color="#2d2424"></uni-icons>
            </view>
        </view>

        <scroll-view scroll-y class="scroll-content">
            
            <view class="hero-banner">
                <view class="hero-title">致良知教育研究院</view>
                <view class="hero-subtitle">让身边多一位致良知的中国人</view>
                <view class="quote-box">
                    <text class="quote-mark">“</text> 成为带给人们温暖与光明的家园
                </view>
            </view>

            <view class="grid-nav">
                <view class="nav-item" v-for="(item, index) in navList" :key="index">
                    <view class="icon-box">
                        <uni-icons :type="item.icon" size="28" color="#9e2a2b"></uni-icons>
                    </view>
                    <text class="nav-label">{{ item.name }}</text>
                </view>
            </view>

            <view class="section-header">
                <text class="section-title">热门课程</text>
                <view class="section-more">
                    全部 <uni-icons type="right" size="12" color="#8c8686"></uni-icons>
                </view>
            </view>

            <view class="course-list">
                <view class="course-card" v-for="(course, index) in courseList" :key="index">
                    <view class="card-thumb" :style="{ background: course.bgGradient }">
                        <view class="thumb-tag">{{ course.tag }}</view>
                        <view class="thumb-title">{{ course.type }}</view>
                        <view class="thumb-sub">{{ course.term }}</view>
                    </view>
                    <view class="card-info">
                        <view class="info-title">{{ course.title }}</view>
                        <view class="info-meta">
                            <text class="meta-count">{{ course.count }} 人已加入</text>
                            <view class="meta-btn">去学习</view>
                        </view>
                    </view>
                </view>
            </view>
            
            <view class="safe-area-spacer"></view>

        </scroll-view>

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
                    
                    <text 
                        class="nav-text" 
                        :class="{ 'active-text': currentTab === index }"
                    >{{ item.text }}</text>
                    
                    <view class="active-dot" v-if="currentTab === index"></view>
                </view>
            </view>
            <view class="safe-area-bg"></view>
        </view>

    </view>
</template>

<script>
    export default {
        data() {
            return {
                currentTab: 0, 
                tabBar: [
                    { text: '主页', icon: 'home', activeIcon: 'home-filled' },
                    { text: '课程', icon: 'shop', activeIcon: 'shop-filled' },
                    { text: '我的', icon: 'person', activeIcon: 'person-filled' },
                    { text: '文创', icon: 'gift', activeIcon: 'gift-filled' }
                ],
                navList: [
                    { name: '明理班', icon: 'book' },
                    { name: '笃行班', icon: 'flag' },
                    { name: '印证班', icon: 'checkmarkempty' },
                    { name: '良知班', icon: 'heart' }
                ],
                courseList: [
                    {
                        tag: '热招',
                        type: '诚意班',
                        term: '第69期',
                        title: '【致良知线上课堂】诚意班全年订阅计划',
                        count: '575,563',
                        bgGradient: 'linear-gradient(135deg, #8a2021, #b53b3c)'
                    },
                    {
                        tag: '大学生',
                        type: '诚意班',
                        term: '第13期',
                        title: '【致良知大学生】青年领袖成长计划',
                        count: '10,987',
                        bgGradient: 'linear-gradient(135deg, #a65d5e, #c77d7e)'
                    },
                    {
                        tag: '青少年',
                        type: '诚意班',
                        term: '第13期',
                        title: '【致良知好少年】中华文化启蒙班',
                        count: '12,103',
                        bgGradient: 'linear-gradient(135deg, #c58e65, #e0b48d)'
                    }
                ]
            }
        },
        methods: {
            switchTab(index) {
                // 如果点击当前项，触发一个轻微震动反馈（仅APP端有效）
                if (this.currentTab === index) return;
                this.currentTab = index;
            }
        }
    }
</script>

<style scoped>
    /* --- 基础样式保持不变 --- */
    .page-container {
        height: 100vh;
        background-color: #f9f7f2;
        display: flex; flex-direction: column; overflow: hidden;
    }
    .header {
        padding: 80rpx 40rpx 30rpx;
        display: flex; justify-content: space-between; align-items: center;
        background: rgba(249, 247, 242, 0.98); z-index: 10;
    }
    .logo-text { font-size: 38rpx; font-weight: 800; color: #9e2a2b; display: flex; align-items: center; gap: 16rpx; }
    .logo-seal { background-color: #9e2a2b; color: #fff; font-size: 24rpx; padding: 4rpx 10rpx; border-radius: 8rpx; font-family: serif; }
    
    .scroll-content { flex: 1; height: 0; width: 100%; }
    .safe-area-spacer { height: 180rpx; } /* 留白 */

    .hero-banner { padding: 40rpx 40rpx 60rpx; background: radial-gradient(circle at top right, rgba(252, 239, 233, 0.8), transparent 70%); text-align: center; }
    .hero-title { font-size: 56rpx; color: #9e2a2b; margin-bottom: 16rpx; letter-spacing: 4rpx; font-weight: 900; text-shadow: 0 4rpx 10rpx rgba(158, 42, 43, 0.1); }
    .hero-subtitle { font-size: 28rpx; color: #5d5555; letter-spacing: 2rpx; margin-bottom: 40rpx; position: relative; display: inline-block; }
    .hero-subtitle::before, .hero-subtitle::after { content: ''; position: absolute; top: 50%; width: 60rpx; height: 1px; background: #ddd; }
    .hero-subtitle::before { left: -80rpx; } .hero-subtitle::after { right: -80rpx; }
    .quote-box { font-size: 26rpx; color: #9e2a2b; font-weight: bold; margin-top: 20rpx; background: rgba(158, 42, 43, 0.05); display: inline-block; padding: 10rpx 30rpx; border-radius: 40rpx; }
    .quote-mark { font-family: serif; font-size: 40rpx; margin-right: 8rpx; vertical-align: -6rpx; }

    .grid-nav { display: flex; justify-content: space-between; padding: 0 50rpx; margin-bottom: 60rpx; }
    .nav-item { display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
    .icon-box { width: 100rpx; height: 100rpx; border-radius: 36rpx; background: #fff; display: flex; justify-content: center; align-items: center; box-shadow: 0 10rpx 30rpx rgba(158, 42, 43, 0.08); border: 1px solid rgba(158, 42, 43, 0.05); transition: transform 0.2s; }
    .nav-item:active .icon-box { transform: scale(0.95); }
    .nav-label { font-size: 26rpx; color: #2d2424; font-weight: 500; }

    .section-header { padding: 0 40rpx; margin-bottom: 30rpx; display: flex; justify-content: space-between; align-items: flex-end; }
    .section-title { font-size: 38rpx; font-weight: 800; color: #2d2424; }
    .section-more { font-size: 26rpx; color: #8c8686; display: flex; align-items: center; }
    .course-list { padding: 0 40rpx; }
    .course-card { background: #fff; border-radius: 36rpx; padding: 24rpx; margin-bottom: 32rpx; display: flex; gap: 24rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04); transition: transform 0.2s; }
    .course-card:active { transform: scale(0.98); }
    .card-thumb { width: 200rpx; height: 150rpx; border-radius: 20rpx; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; text-align: center; position: relative; flex-shrink: 0; }
    .thumb-title { font-size: 38rpx; font-weight: 900; }
    .thumb-sub { font-size: 20rpx; opacity: 0.9; margin-top: 4rpx; }
    .thumb-tag { position: absolute; top: 0; left: 0; background: #c5a065; color: #fff; font-size: 18rpx; padding: 4rpx 12rpx; border-top-left-radius: 20rpx; border-bottom-right-radius: 16rpx; font-weight: bold; }
    .card-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 6rpx 0; }
    .info-title { font-size: 30rpx; font-weight: bold; color: #2d2424; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .info-meta { display: flex; justify-content: space-between; align-items: center; }
    .meta-count { font-size: 22rpx; color: #999; }
    .meta-btn { background: rgba(158, 42, 43, 0.08); color: #9e2a2b; font-size: 24rpx; padding: 10rpx 24rpx; border-radius: 30rpx; font-weight: 700; }

    /* ========================================= */
    /* --- 终极优化：简约高对比度底栏 --- */
    /* ========================================= */

    .bottom-nav-wrapper {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        z-index: 999;
        box-shadow: 0 -4rpx 30rpx rgba(0,0,0,0.03); /* 极淡的阴影，干净 */
    }

    .bottom-nav {
        height: 120rpx; /* 高度适中，不臃肿 */
        background: rgba(255, 255, 255, 0.98);
        display: flex;
        justify-content: space-around;
        align-items: center;
        border-top: 1px solid rgba(0,0,0,0.02); /* 极细的分割线 */
    }

    .nav-item-btn {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    /* 图标容器 */
    .nav-icon-box {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6rpx;
    }

    /* 选中时的果冻弹跳动画 */
    .anim-bounce {
        animation: jelly 0.5s ease-in-out;
    }

    @keyframes jelly {
        0% { transform: scale(1); }
        30% { transform: scale(0.75); }
        40% { transform: scale(1.25); }
        50% { transform: scale(0.9); }
        60% { transform: scale(1.1); }
        70% { transform: scale(1); }
    }

    /* 文字样式 */
    .nav-text {
        font-size: 22rpx;
        color: #bfbfbf; /* 未选中：浅灰 */
        font-weight: 500;
        transition: all 0.3s;
        letter-spacing: 1rpx;
    }

    /* 选中文字：变大、变色、加粗 */
    .active-text {
        color: #9e2a2b;
        font-weight: 700; /* 加粗 */
        font-size: 24rpx; /* 稍微变大 */
        transform: translateY(-2rpx); /* 轻微上移 */
    }

    /* 选中指示点：极简主义的小圆点 */
    .active-dot {
        position: absolute;
        bottom: 10rpx;
        width: 8rpx;
        height: 8rpx;
        background-color: #9e2a2b;
        border-radius: 50%;
        box-shadow: 0 2rpx 6rpx rgba(158, 42, 43, 0.4);
    }

    /* 底部安全区背景 */
    .safe-area-bg {
        width: 100%;
        height: env(safe-area-inset-bottom);
        background-color: #fff;
    }
</style>