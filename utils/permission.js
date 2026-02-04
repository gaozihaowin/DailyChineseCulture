/**
 * 权限管理工具类
 * 统一处理用户权限验证
 */

import { IDENTITY_TYPES, STORAGE_KEYS } from '@/config/constants';
import logger from '@/utils/logger';

class PermissionManager {
  // 检查用户是否已登录
  static isLoggedIn() {
    const token = uni.getStorageSync(STORAGE_KEYS.TOKEN);
    const userInfo = uni.getStorageSync(STORAGE_KEYS.USER_INFO);
    return !!(token && userInfo);
  }

  // 获取当前用户身份
  static getCurrentIdentity() {
    return uni.getStorageSync(STORAGE_KEYS.CURRENT_IDENTITY) || IDENTITY_TYPES.STUDENT;
  }

  // 验证页面访问权限
  static checkPagePermission(requiredIdentity) {
    if (!this.isLoggedIn()) {
      return {
        allowed: false,
        reason: 'NOT_LOGGED_IN',
        redirect: '/pages/Login/index'
      };
    }

    if (requiredIdentity) {
      const currentIdentity = this.getCurrentIdentity();
      if (currentIdentity !== requiredIdentity) {
        return {
          allowed: false,
          reason: 'INSUFFICIENT_PERMISSION',
          message: `需要${requiredIdentity}身份才能访问`
        };
      }
    }

    return { allowed: true };
  }

  // 验证功能操作权限
  static checkActionPermission(action, requiredIdentity) {
    const permission = this.checkPagePermission(requiredIdentity);
    if (!permission.allowed) {
      logger.warn(`权限不足: ${action}`, permission);
      return false;
    }
    return true;
  }

  // 跳转到登录页
  static redirectToLogin() {
    uni.redirectTo({
      url: '/pages/Login/index'
    });
  }

  // 跳转到首页
  static redirectToHome() {
    uni.switchTab({
      url: '/pages/Main/index'
    });
  }

  // 处理权限拒绝
  static handlePermissionDenied(permissionResult) {
    if (permissionResult.reason === 'NOT_LOGGED_IN') {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      
      setTimeout(() => {
        this.redirectToLogin();
      }, 1500);
    } else {
      uni.showToast({
        title: permissionResult.message || '权限不足',
        icon: 'none'
      });
    }
  }

  // 课程访问权限检查
  static checkCourseAccess(courseStatus) {
    const identity = this.getCurrentIdentity();
    
    // 访客只能查看免费内容
    if (identity === IDENTITY_TYPES.VISITOR) {
      return courseStatus === 'free';
    }
    
    // 学员可以查看已购买的课程
    if (identity === IDENTITY_TYPES.STUDENT) {
      return ['purchased', 'free'].includes(courseStatus);
    }
    
    // 讲师可以查看所有课程
    return true;
  }

  // 功能模块权限检查
  static checkModulePermission(moduleName) {
    const identity = this.getCurrentIdentity();
    const modulePermissions = {
      'course-management': [IDENTITY_TYPES.TEACHER],
      'user-management': [IDENTITY_TYPES.TEACHER],
      'certificate-download': [IDENTITY_TYPES.STUDENT, IDENTITY_TYPES.TEACHER],
      'live-streaming': [IDENTITY_TYPES.STUDENT, IDENTITY_TYPES.TEACHER]
    };

    const allowedIdentities = modulePermissions[moduleName] || [];
    return allowedIdentities.includes(identity);
  }
}

export default PermissionManager;

// 便捷导出
export const {
  isLoggedIn,
  getCurrentIdentity,
  checkPagePermission,
  checkActionPermission,
  redirectToLogin,
  redirectToHome,
  handlePermissionDenied,
  checkCourseAccess,
  checkModulePermission
} = PermissionManager;