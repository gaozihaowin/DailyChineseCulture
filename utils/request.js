/**
 * 统一API请求封装
 * 提供拦截器、错误处理、loading状态管理等功能
 */

class ApiClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 10000;
    this.interceptors = {
      request: [],
      response: []
    };
  }

  // 添加请求拦截器
  useRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  // 添加响应拦截器
  useResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  // 获取请求头
  getHeaders() {
    const token = uni.getStorageSync('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json'
    };
  }

  // 处理请求拦截
  async processRequestInterceptors(options) {
    let processedOptions = { ...options };
    
    for (const interceptor of this.interceptors.request) {
      processedOptions = await interceptor(processedOptions);
    }
    
    return processedOptions;
  }

  // 处理响应拦截
  async processResponseInterceptors(response) {
    let processedResponse = response;
    
    for (const interceptor of this.interceptors.response) {
      processedResponse = await interceptor(processedResponse);
    }
    
    return processedResponse;
  }

  // 核心请求方法
  async request(options) {
    const {
      url,
      method = 'GET',
      data = {},
      params = {},
      headers = {},
      loading = true,
      showError = true,
      timeout = this.timeout
    } = options;

    // 显示loading
    if (loading) {
      uni.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      });
    }

    try {
      // 处理请求拦截器
      const processedOptions = await this.processRequestInterceptors({
        url: this.baseURL + url,
        method,
        data,
        params,
        headers: { ...this.getHeaders(), ...headers }
      });

      // 发起请求
      const response = await new Promise((resolve, reject) => {
        const requestTask = uni.request({
          url: processedOptions.url,
          method: processedOptions.method,
          data: processedOptions.data,
          header: processedOptions.headers,
          timeout,
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });

        // 超时处理
        setTimeout(() => {
          requestTask.abort();
          reject(new Error('请求超时'));
        }, timeout);
      });

      // 处理响应拦截器
      const finalResponse = await this.processResponseInterceptors(response);

      // 统一处理响应数据
      if (finalResponse.statusCode === 200) {
        const result = finalResponse.data;
        
        if (result.code === 200) {
          return result.data;
        } else {
          throw new Error(result.msg || '请求失败');
        }
      } else {
        throw new Error(`HTTP ${finalResponse.statusCode}`);
      }

    } catch (error) {
      // 统一错误处理
      this.handleError(error, showError);
      throw error;
    } finally {
      // 隐藏loading
      if (loading) {
        uni.hideLoading();
      }
    }
  }

  // GET请求
  get(url, options = {}) {
    return this.request({ ...options, url, method: 'GET' });
  }

  // POST请求
  post(url, data = {}, options = {}) {
    return this.request({ ...options, url, method: 'POST', data });
  }

  // PUT请求
  put(url, data = {}, options = {}) {
    return this.request({ ...options, url, method: 'PUT', data });
  }

  // DELETE请求
  delete(url, options = {}) {
    return this.request({ ...options, url, method: 'DELETE' });
  }

  // 统一错误处理
  handleError(error, showError = true) {
    console.error('API请求错误:', error);
    
    // 记录错误日志（可以接入错误监控系统）
    this.logError(error);

    if (showError) {
      let message = '网络连接异常';
      
      if (error.message) {
        if (error.message.includes('超时')) {
          message = '请求超时，请稍后重试';
        } else if (error.message.includes('HTTP')) {
          message = '服务器异常，请稍后重试';
        } else {
          message = error.message;
        }
      }

      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
    }

    // 特殊错误处理（如token过期）
    if (error.message === 'Token已过期' || error.code === 401) {
      this.handleTokenExpired();
    }
  }

  // 处理token过期
  handleTokenExpired() {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    
    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none'
    });

    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/Login/index'
      });
    }, 1500);
  }

  // 错误日志记录
  logError(error) {
    // 可以接入 Sentry、阿里云ARMS 等错误监控平台
    // console.log('上报错误到监控系统:', error);
  }
}

// 创建实例
const apiClient = new ApiClient({
  baseURL: 'http://127.0.0.1:4523/m1/7779396-7525646-default',
  timeout: 10000
});

// 添加请求拦截器 - 统一添加时间戳
apiClient.useRequestInterceptor(async (config) => {
  // 为GET请求添加时间戳防止缓存
  if (config.method === 'GET') {
    const timestamp = new Date().getTime();
    config.url += (config.url.includes('?') ? '&' : '?') + `_t=${timestamp}`;
  }
  return config;
});

// 添加响应拦截器 - 统一处理数据结构
apiClient.useResponseInterceptor(async (response) => {
  // 可以在这里统一处理响应数据格式
  return response;
});

export default apiClient;