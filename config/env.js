/**
 * 环境配置文件
 * 根据不同环境加载不同的配置
 */

// 开发环境配置
const development = {
  API_BASE_URL: 'http://127.0.0.1:4523/m1/7779396-7525646-default',
  DEBUG: true,
  LOG_LEVEL: 'debug',
  MOCK_ENABLED: true
};

// 测试环境配置
const test = {
  API_BASE_URL: 'https://test-api.yourdomain.com',
  DEBUG: true,
  LOG_LEVEL: 'info',
  MOCK_ENABLED: false
};

// 生产环境配置
const production = {
  API_BASE_URL: 'https://api.yourdomain.com',
  DEBUG: false,
  LOG_LEVEL: 'error',
  MOCK_ENABLED: false
};

// 获取当前环境
const getCurrentEnv = () => {
  // #ifdef H5
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
  // #endif
  
  // #ifdef MP-WEIXIN
  return __wxConfig.envVersion === 'release' ? 'production' : 'development';
  // #endif
  
  // #ifdef APP-PLUS
  return plus.runtime.appid ? 'production' : 'development';
  // #endif
  
  // 默认开发环境
  return 'development';
};

// 根据环境获取配置
const getConfig = () => {
  const env = getCurrentEnv();
  const configs = {
    development,
    test,
    production
  };
  
  return configs[env] || development;
};

// 导出配置
const config = getConfig();

export default config;

// 便捷导出
export const {
  API_BASE_URL,
  DEBUG,
  LOG_LEVEL,
  MOCK_ENABLED
} = config;