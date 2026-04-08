// API配置文件
// 存储API基础地址和其他API相关配置

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

// 导出API配置
export const API_CONFIG = {
  // 本地开发环境地址（确保和你的后端服务端口一致）
  //baseUrl: 'http://10.35.241.144:8080',
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
    // 新增接口
    upload: '/common/upload',
    updateUser: '/user/update',
    hotCourses: '/courses/hot',
    courses: '/courses',
    courseList: '/courses/list', // 获取课程列表
    courseDetail: '/courses/detail', // 获取课程详情
    checkEnroll: '/enrollment/check', // 核实报名身份
    enrollCamp: '/camp/enroll', // 报名接口
	logout:'/user/logout',  //退出登陆
	getVolunteerHistory:'/user/volunteer-history', //担当历史
	quitVolunteer:'/user/volunteer-quit',//  退出担当
    getVolunteerStats:'/user/volunteer-stats',  //获取营期/班级/大组/小组
    getVolunteerScope: '/volunteer/scopes',  //获得志愿者管理的范围
    getVolunteerMembers: '/volunteer/manage/members', // 获取管理成员列表
    getDutyAssignment: '/volunteer/manage/duty-assignment', // 某个志愿者可以分配哪些岗位
    searchUser: '/user/search', // 搜索用户
    assignDuty: '/volunteer/manage/assign-duty', // 分配岗位
    removeDuty: '/volunteer/manage/remove-duty', // 移除岗位
	getClassList: '/class/list',           // 获取所有班级列表
    getBigGroupList: '/bigGroup/list',     // 获取所有大组列表
    getSmallGroupList: '/smallGroup/list', // 获取所有小组列表
	getHomeworkList: '/homework/list',     // 获取作业名单
    markExcellentHomework: '/camp/homework/mark', // 标记优秀作业
    getExcellentHomeworkList: '/homework/excellent/list', // 优秀作业列表
    getHomeworkDetail: '/homework/detail', // 作业详情
	
    getHomeworkStats: '/homework/stats',   // 获取作业统计数据
	getHomeworkStatus:'/homework/status/list',//统计未交/已交/迟交名单
    schedule: '/courses/{{campId}}/schedule', // 获取课程安排
    todayCourse: '/courses/{{campId}}/today', // 获取今日课程
    completeTask: '/courses/plan/{{planId}}/task/complete', // 任务打卡
    courseData: '/courses/{{campId}}/data', // 获取课程数据看板
  }
};

// 导出默认配置
export default API_CONFIG;