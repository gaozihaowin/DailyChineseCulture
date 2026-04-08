<template>
  <view class="page-container">
    <NavBar title="关于我们" bgColor="#f4f1eb" titleColor="#2c2416" />

    <view class="page-content">
      <view class="brand-section">
        <view class="brand-card">
          <view class="brand-logo-wrapper">
            <image
              class="brand-logo"
              src="https://img.icons8.com/color/200/cultural-heritage.png"
              mode="aspectFit"
            ></image>
          </view>
          <text class="brand-name">每日中国文化</text>
          <text class="brand-slogan">致良知 · 知行合一</text>
        </view>
      </view>

      <view class="vision-section">
        <view class="vision-card">
          <view class="section-header">
            <view class="section-line"></view>
            <text class="section-title">平台愿景</text>
          </view>
          <view class="vision-content">
            <text class="vision-text">
              吾心自有光明月，千古团圆永无缺。<br /><br />
              每日中国文化致力于弘扬王阳明心学智慧，以数字化手段帮助每一位学习者"致良知"——发现本心之光明，在日常事上磨炼，实现知行合一。<br /><br />
              在这里，没有商业喧嚣，唯有师友相伴，修身正心，共赴光明。
            </text>
          </view>
        </view>
      </view>

      <view class="features-section">
        <view class="section-header">
          <view class="section-line"></view>
          <text class="section-title">核心特色</text>
        </view>
        <view class="features-grid">
          <view class="feature-card">
            <view class="feature-icon-wrapper" style="background-color: #fff5f5;">
              <image
                class="feature-icon"
                src="https://img.icons8.com/fluency/48/hand-heart.png"
                mode="aspectFit"
              ></image>
            </view>
            <text class="feature-title">公益属性</text>
            <text class="feature-desc">纯公益运营，无商业广告，不收取任何费用</text>
          </view>
          <view class="feature-card">
            <view class="feature-icon-wrapper" style="background-color: #f0fff4;">
              <image
                class="feature-icon"
                src="https://img.icons8.com/fluency/48/books.png"
                mode="aspectFit"
              ></image>
            </view>
            <text class="feature-title">系统课程</text>
            <text class="feature-desc">经典诵读、导师解惑、笃行作业，体系完整</text>
          </view>
          <view class="feature-card">
            <view class="feature-icon-wrapper" style="background-color: #faf5ff;">
              <image
                class="feature-icon"
                src="https://img.icons8.com/fluency/48/user-group.png"
                mode="aspectFit"
              ></image>
            </view>
            <text class="feature-title">志愿服务</text>
            <text class="feature-desc">志愿者担当，共学共进，教学相长</text>
          </view>
          <view class="feature-card">
            <view class="feature-icon-wrapper" style="background-color: #fff8f0;">
              <image
                class="feature-icon"
                src="https://img.icons8.com/fluency/48/collaboration.png"
                mode="aspectFit"
              ></image>
            </view>
            <text class="feature-title">社区印证</text>
            <text class="feature-desc">见贤思齐，学友共评，笃行不孤</text>
          </view>
        </view>
      </view>

      <view class="thanks-section">
        <view class="thanks-card">
          <view class="seal-wrapper">
            <view class="seal-circle">
              <text class="seal-text">致</text>
            </view>
          </view>
          <view class="thanks-content">
            <text class="thanks-title">致谢寄语</text>
            <text class="thanks-text">
              感谢每一位同修的信任与陪伴。<br />
              因缘殊胜，我们在此相遇；<br />
              笃行路上，愿与诸君同行，<br />
              共赴光明之境。<br /><br />
              <text class="thanks-author">—— 每日中国文化运营团队</text>
            </text>
          </view>
        </view>
      </view>

      <view class="version-section">
        <view class="version-info">
          <view class="version-badge">
            <text class="version-text">v0.0.1-SNAPSHOT</text>
          </view>
          <text class="copyright-text">© 2024 每日中国文化 · 感恩有您</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
definePageConfig({
  navigationStyle: 'custom'
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f4f1eb;
}

.page-content {
  padding: 24rpx 30rpx;
  padding-top: calc(44px + constant(safe-area-inset-top));
  padding-top: calc(44px + env(safe-area-inset-top));
}

.brand-section {
  margin-bottom: 40rpx;
}

.brand-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.brand-logo-wrapper {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fdfaf6 0%, #f4f1eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(168, 50, 53, 0.1);
}

.brand-logo {
  width: 100rpx;
  height: 100rpx;
}

.brand-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #2c2416;
  letter-spacing: 4rpx;
  margin-bottom: 12rpx;
}

.brand-slogan {
  font-size: 28rpx;
  color: #a83235;
  letter-spacing: 6rpx;
}

.vision-section {
  margin-bottom: 40rpx;
}

.vision-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.section-line {
  width: 6rpx;
  height: 32rpx;
  background: linear-gradient(180deg, #a83235 0%, #d4af37 100%);
  border-radius: 3rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2c2416;
  letter-spacing: 2rpx;
}

.vision-content {
  padding-left: 8rpx;
}

.vision-text {
  font-size: 28rpx;
  color: #3d2f1e;
  line-height: 1.8;
  text-align: justify;
}

.features-section {
  margin-bottom: 40rpx;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.feature-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.feature-icon-wrapper {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.feature-icon {
  width: 48rpx;
  height: 48rpx;
}

.feature-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c2416;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 22rpx;
  color: #8b7365;
  text-align: center;
  line-height: 1.5;
}

.thanks-section {
  margin-bottom: 40rpx;
}

.thanks-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.seal-wrapper {
  margin-bottom: 32rpx;
}

.seal-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #a83235 0%, #c73e3e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(168, 50, 53, 0.3);
}

.seal-text {
  font-size: 44rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2rpx;
}

.thanks-content {
  text-align: center;
}

.thanks-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2c2416;
  margin-bottom: 20rpx;
  letter-spacing: 2rpx;
}

.thanks-text {
  font-size: 26rpx;
  color: #3d2f1e;
  line-height: 1.8;
}

.thanks-author {
  font-size: 24rpx;
  color: #7a5c1e;
  font-style: italic;
}

.version-section {
  padding: 32rpx 0 48rpx;
}

.version-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.version-badge {
  background-color: #fdfaf6;
  border: 1px solid rgba(168, 50, 53, 0.2);
  border-radius: 20rpx;
  padding: 8rpx 24rpx;
}

.version-text {
  font-size: 22rpx;
  color: #7a5c1e;
  letter-spacing: 1rpx;
}

.copyright-text {
  font-size: 22rpx;
  color: #a09080;
  letter-spacing: 1rpx;
}
</style>
