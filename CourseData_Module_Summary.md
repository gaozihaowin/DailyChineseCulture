# 课程数据模块 (course-data.vue) 实现总结报告

本文档旨在梳理 `pages/CourseDetail/components/course-data.vue` 组件的内部实现逻辑，方便团队内其他前端工程师阅读和维护。

### 1. 数据状态与生命周期

- **核心响应式变量**：
  组件内部通过 Vue 3 的 Composition API (`ref`) 定义了两个核心状态：
  - `dataObj` (`ref(null)`)：用于存储从后端获取到的课程数据对象。
  - `isLoading` (`ref(true)`)：用于控制页面加载中骨架屏或 Loading 动画的展示状态。
  
- **数据请求触发时机**：
  数据请求（`fetchCourseData` 方法）会在以下两个生命周期/时机被触发：
  1. **组件挂载时 (`onMounted`)**：只要传入的 `props.campId` 存在，即刻发起请求。
  2. **参数变化时 (`watch`)**：通过监听 `props.campId` 的变化，当父组件传入的营期 ID 发生切换时，自动重新发起请求更新数据。

### 2. API 调用逻辑

- **后端接口路径**：
  使用的是 `API_CONFIG.paths.courseData` 中配置的路径（对应为 `/courses/{{campId}}/data`）。
  
- **传入参数**：
  使用 `GET` 请求。`campId` 并非作为 Query 或 Body 参数，而是**作为 URL 的路径参数 (Path Parameter)**。
  代码中通过字符串替换 `url.replace('{{campId}}', props.campId.toString())` 的方式，将具体的营期 ID 注入到请求 URL 中。

### 3. UI 数据绑定映射

在“数据概览卡片”区域，页面字段与后端返回的 JSON 字段严格对应：
- **总完成率**：绑定于 `dataObj.overallRate`（UI 拼接了 `%` 符号）。
- **总天数**：绑定于 `dataObj.totalDays`。
- **已完成**：绑定于 `dataObj.completedDays`。

**数据兜底处理机制**：
- **全局兜底**：如果在接口层返回数据异常或 `apiData.data` 为空，前端将其赋值为 `null`，触发外层的 `v-else` 逻辑，展示统一的**“数据加载失败，点击重试”**错误状态，避免页面白屏。
- **趋势图兜底**：在学习趋势的柱状图中，如果某天的完成率为 `0` 或缺失，前端做了专门的兜底，通过 `v-if="item.rate > 0"` 判断，大于 0 正常显示数值，否则显示 `-` (横杠)。

### 4. 学习趋势图表实现

- **图表技术栈**：
  **没有使用任何第三方图表库**（如 ECharts、uCharts 等），而是完全采用 **纯 CSS** 和 Vue 数据绑定绘制的简易柱状图。
  
- **数据与视图的转化逻辑**：
  1. 遍历后端返回的 `dataObj.trends` 数组，生成对应的 `.bar-wrapper` 柱子容器。
  2. **高度计算**：通过内联样式 `:style="{ height: Math.max(item.rate, 2) + '%' }"` 将 `rate` 值直接转化为 CSS 的 `height` 百分比。其中 `Math.max(..., 2)` 是一个巧妙的 UI 兜底，保证即使数据为 0，也会保留 `2%` 的极低高度作为视觉基底，不至于让柱子完全消失。
  3. **X 轴文字**：柱子底部的日期标签直接绑定并展示 `item.dayStr`。
  4. **进阶动效**：通过 `:style="{ animationDelay: index * 0.1 + 's' }"` 为每根柱子分配递增的动画延迟时间，实现了丝滑的“从左到右依次浮出”的入场视觉动效。
