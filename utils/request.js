import { API_CONFIG } from '@/api/config.js';

/**
 * 统一请求封装
 * 自动注入 Token 到请求头
 */
export const request = (options) => {
  // 1. 获取 token
  const token = uni.getStorageSync('token');

  // 2. 初始化 header
  options.header = options.header || {};

  // 3. 注入 token (根据后端要求格式)
  if (token) {
    options.header['Authorization'] = token;
  }

  // 4. 拼接完整 URL
  const fullUrl = options.url.startsWith('http') 
    ? options.url 
    : API_CONFIG.baseUrl + options.url;

  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url: fullUrl,
      success: (res) => {
        // 处理 401 未授权
        if (res.statusCode === 401) {
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          // 清除 token 并跳转到登录页
          uni.removeStorageSync('token');
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/Login/login'
            });
          }, 1500);
          reject(new Error('Unauthorized'));
          return;
        }

        // 处理其他 HTTP 错误
        if (res.statusCode >= 400) {
          uni.showToast({
            title: `请求失败: ${res.statusCode}`,
            icon: 'none'
          });
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        resolve(res);
      },
      fail: (err) => {
        uni.showToast({
          title: '网络连接异常',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

/**
 * GET 请求快捷方法
 */
export const get = (url, params = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  });
};

/**
 * POST 请求快捷方法
 */
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    header: {
      'content-type': 'application/json',
      ...options.header
    },
    data,
    ...options
  });
};

export default request;
