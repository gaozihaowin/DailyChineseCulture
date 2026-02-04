/**
 * 通用工具函数库
 * 提供常用的工具方法，提高开发效率
 */

export const utils = {
  /**
   * 格式化日期
   * @param {Date|string|number} date - 日期对象或时间戳
   * @param {string} format - 格式字符串 YYYY-MM-DD HH:mm:ss
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间(ms)
   * @param {boolean} immediate - 是否立即执行
   * @returns {Function} 防抖后的函数
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(this, args);
    };
  },

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 时间间隔(ms)
   * @returns {Function} 节流后的函数
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 深拷贝
   * @param {*} obj - 要拷贝的对象
   * @returns {*} 拷贝后的对象
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },

  /**
   * 对象合并（深合并）
   * @param {...Object} objects - 要合并的对象
   * @returns {Object} 合并后的对象
   */
  deepMerge(...objects) {
    const isObject = (obj) => obj && typeof obj === 'object';
    
    return objects.reduce((prev, obj) => {
      Object.keys(obj).forEach(key => {
        const pVal = prev[key];
        const oVal = obj[key];
        
        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = [...pVal, ...oVal];
        } else if (isObject(pVal) && isObject(oVal)) {
          prev[key] = this.deepMerge(pVal, oVal);
        } else {
          prev[key] = oVal;
        }
      });
      return prev;
    }, {});
  },

  /**
   * 数组去重
   * @param {Array} array - 要去重的数组
   * @param {string} key - 对象数组去重的键名
   * @returns {Array} 去重后的数组
   */
  unique(array, key) {
    if (!key) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  /**
   * 获取URL参数
   * @param {string} name - 参数名
   * @param {string} url - URL字符串
   * @returns {string|null} 参数值
   */
  getUrlParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  },

  /**
   * 格式化金额
   * @param {number} amount - 金额
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的金额
   */
  formatMoney(amount, decimals = 2) {
    if (isNaN(amount)) return '0.00';
    return parseFloat(amount).toFixed(decimals);
  },

  /**
   * 手机号验证
   * @param {string} phone - 手机号
   * @returns {boolean} 是否有效
   */
  isValidPhone(phone) {
    const reg = /^1[3-9]\d{9}$/;
    return reg.test(phone);
  },

  /**
   * 邮箱验证
   * @param {string} email - 邮箱
   * @returns {boolean} 是否有效
   */
  isValidEmail(email) {
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return reg.test(email);
  },

  /**
   * 生成随机ID
   * @param {number} len - 长度
   * @returns {string} 随机ID
   */
  generateId(len = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * 等待指定时间
   * @param {number} ms - 毫秒数
   * @returns {Promise} Promise对象
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 限制数值范围
   * @param {number} value - 数值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 限制后的数值
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * 数组分组
   * @param {Array} array - 数组
   * @param {number} size - 每组大小
   * @returns {Array} 分组后的数组
   */
  chunk(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  },

  /**
   * 对象转查询字符串
   * @param {Object} obj - 对象
   * @returns {string} 查询字符串
   */
  objectToQueryString(obj) {
    return Object.keys(obj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  },

  /**
   * 查询字符串转对象
   * @param {string} queryString - 查询字符串
   * @returns {Object} 对象
   */
  queryStringToObject(queryString) {
    const pairs = queryString.substring(1).split('&');
    const obj = {};
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      obj[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return obj;
  }
};

// 导出常用工具到全局
export const {
  formatDate,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  unique,
  getUrlParam,
  formatMoney,
  isValidPhone,
  isValidEmail,
  generateId,
  sleep,
  clamp,
  chunk,
  objectToQueryString,
  queryStringToObject
} = utils;

export default utils;