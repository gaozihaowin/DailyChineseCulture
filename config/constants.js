/**
 * 项目常量配置
 * 统一管理项目中的各种常量
 */

// 应用配置
export const APP_CONFIG = {
  NAME: '致良知教育',
  VERSION: '1.0.0',
  DESCRIPTION: '让内心充满力量的生命哲学课'
};

// 页面路由配置
export const ROUTES = {
  LOGIN: '/pages/Login/index',
  MAIN: '/pages/Main/index',
  COURSE_DETAIL: '/pages/CourseDetail/index',
  COURSE_LIST: '/pages/Course/List',
  MINE: '/pages/Mine/index'
};

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  CURRENT_IDENTITY: 'currentIdentity',
  COURSE_CACHE_PREFIX: 'course_',
  SETTINGS: 'settings'
};

// 网络请求配置
export const HTTP_CONFIG = {
  TIMEOUT: 10000,
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000
};

// 用户身份类型
export const IDENTITY_TYPES = {
  STUDENT: '学员端',
  TEACHER: '讲师端',
  VISITOR: '访客端'
};

// 课程状态
export const COURSE_STATUS = {
  ING: 'ing',      // 进行中
  DONE: 'done',    // 已完成
  EXPIRED: 'expired' // 已过期
};

// 任务状态
export const TASK_STATUS = {
  DONE: 'done',    // 已完成
  ACTIVE: 'active', // 进行中
  LOCK: 'lock'     // 未解锁
};

// 颜色主题
export const THEME_COLORS = {
  PRIMARY: '#9e2a2b',
  SECONDARY: '#ff7e5f',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6'
};

// 尺寸常量
export const DIMENSIONS = {
  NAVBAR_HEIGHT: 44,
  TABBAR_HEIGHT: 50,
  CARD_RADIUS: 24,
  BUTTON_RADIUS: 20
};

// 动画时长
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// 业务常量
export const BUSINESS_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NICKNAME_LENGTH: 20,
  COURSE_CACHE_EXPIRE: 10 * 60 * 1000, // 10分钟
  REFRESH_INTERVAL: 5 * 60 * 1000 // 5分钟
};

// 错误码映射
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SERVER_ERROR: 'SERVER_ERROR'
};

// 事件名称
export const EVENT_NAMES = {
  SWITCH_TAB: 'switchTab',
  USER_LOGIN: 'userLogin',
  USER_LOGOUT: 'userLogout',
  COURSE_UPDATE: 'courseUpdate'
};

// 默认值
export const DEFAULTS = {
  AVATAR: 'https://img.icons8.com/color/96/person-male.png',
  COURSE_COVER: 'https://img.icons8.com/color/96/books.png',
  PAGE_SIZE: 20,
  PAGE_NUMBER: 1
};

export default {
  APP_CONFIG,
  ROUTES,
  STORAGE_KEYS,
  HTTP_CONFIG,
  IDENTITY_TYPES,
  COURSE_STATUS,
  TASK_STATUS,
  THEME_COLORS,
  DIMENSIONS,
  ANIMATION_DURATION,
  BUSINESS_CONSTANTS,
  ERROR_CODES,
  EVENT_NAMES,
  DEFAULTS
};