/**
 * 日志工具类
 * 统一日志输出和管理
 */

import config from '@/config/env';
import { ERROR_CODES } from '@/config/constants';

class Logger {
  constructor() {
    this.isEnabled = config.DEBUG;
    this.level = config.LOG_LEVEL || 'debug';
  }

  // 设置日志级别
  setLevel(level) {
    this.level = level;
  }

  // 设置是否启用
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // debug级别日志
  debug(...args) {
    if (this.isEnabled && ['debug'].includes(this.level)) {
      console.debug('[DEBUG]', ...args);
    }
  }

  // info级别日志
  info(...args) {
    if (this.isEnabled && ['debug', 'info'].includes(this.level)) {
      console.info('[INFO]', ...args);
    }
  }

  // warn级别日志
  warn(...args) {
    if (this.isEnabled && ['debug', 'info', 'warn'].includes(this.level)) {
      console.warn('[WARN]', ...args);
    }
  }

  // error级别日志
  error(...args) {
    if (this.isEnabled) {
      console.error('[ERROR]', ...args);
    }
  }

  // API请求日志
  apiRequest(method, url, data) {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  // API响应日志
  apiResponse(url, response) {
    this.debug(`API Response: ${url}`, response);
  }

  // API错误日志
  apiError(url, error) {
    this.error(`API Error: ${url}`, error);
    // 可以在这里集成错误监控系统
    this.reportError(error);
  }

  // 上报错误到监控系统
  reportError(error) {
    // 这里可以集成 Sentry、阿里云ARMS 等错误监控平台
    try {
      // 示例：上报到自定义监控接口
      // uni.request({
      //   url: `${config.API_BASE_URL}/monitor/error`,
      //   method: 'POST',
      //   data: {
      //     message: error.message,
      //     stack: error.stack,
      //     timestamp: Date.now(),
      //     userAgent: navigator.userAgent
      //   }
      // });
    } catch (reportError) {
      console.error('错误上报失败:', reportError);
    }
  }

  // 页面访问日志
  pageView(pageName, params = {}) {
    this.info(`Page View: ${pageName}`, params);
    // 可以在这里集成数据统计
  }

  // 用户行为日志
  userAction(action, data = {}) {
    this.info(`User Action: ${action}`, data);
    // 可以在这里集成用户行为分析
  }

  // 性能监控日志
  performance(metric, value, context = {}) {
    this.debug(`Performance: ${metric} = ${value}`, context);
    // 可以在这里集成性能监控
  }
}

// 创建单例实例
const logger = new Logger();

// 便捷方法
export const debug = (...args) => logger.debug(...args);
export const info = (...args) => logger.info(...args);
export const warn = (...args) => logger.warn(...args);
export const error = (...args) => logger.error(...args);

export default logger;