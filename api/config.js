// API配置文件
// 存储API基础地址和其他API相关配置

// 导出API配置
export const API_CONFIG = {
  // 本地开发环境地址
  baseUrl: 'http://127.0.0.1:3000',
  
  // Apifox 提供的云端 Mock 地址（备用）
  // baseUrl: 'http://127.0.0.1:4523/m1/7779396-7525646-default',
  
  // API路径配置
  paths: {
    login: '/api/login',
    hotCourses: '/api/courses/hot',
    coursesIng: '/api/courses/ing',
    coursesHistory: '/api/courses/history',
    coursesDone: '/api/courses/done',
    userInfo: '/api/user/info',
    switchIdentity: '/api/user/switch-identity',
	wechatLogin:'/api//wxLogin',
    // 可以在此添加其他API路径
  }
};

// 导出默认配置
export default API_CONFIG;