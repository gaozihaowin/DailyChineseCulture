// API配置文件
// 存储API基础地址和其他API相关配置

// 导出API配置
export const API_CONFIG = {
  // 本地开发环境地址（确保和你的后端服务端口一致）
  baseUrl: 'http://127.0.0.1:8080',
  
  // Apifox 提供的云端 Mock 地址（备用）
  // baseUrl: 'http://127.0.0.1:4523/m1/7779396-7525646-default',
  
  // API路径配置
  paths: {
    // 原有接口
    login: '/login',
    wechatLogin: '/wxLogin',
    userInfo: '/user/info',
    switchIdentity: '/user/switch-identity',
    updateUserInfo: '/updateUserInfo',
    hotCourses: '/courses/hot',
    coursesIng: '/courses/ing',
    coursesHistory: '/courses/history',
    coursesDone: '/courses/done',
    dutyTable: '/user/duty-table',
    
    // 新增作业统计相关接口
    getVolunteerScope: '/volunteer/scope', // 获取志愿者管理范围
    getHomeworkStats: '/homework/stats',   // 获取作业统计数据
    getHomeworkList: '/homework/list',     // 获取作业名单
    markExcellentHomework: '/camp/homework/mark', // 标记优秀作业
    getExcellentHomeworkList: '/homework/excellent/list', // 优秀作业列表
    getHomeworkDetail: '/homework/detail', // 作业详情
    getClassList: '/class/list',           // 获取所有班级列表
    getBigGroupList: '/bigGroup/list',     // 获取所有大组列表
    getSmallGroupList: '/smallGroup/list', // 获取所有小组列表
  }
};

// 导出默认配置
export default API_CONFIG;