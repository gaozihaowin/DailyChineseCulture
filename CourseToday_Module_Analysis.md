# “今日课程”模块 (CourseToday.vue) 实现梳理报告

本文档旨在梳理当前营期详情页中“今日课程”模块的实现现状，为后续的重构工作提供依据。

### 1. 组件与状态

- **文件路径**：`pages/CourseDetail/components/CourseToday.vue`
- **核心响应式变量**：
  组件内部通过 Vue 3 的 `<script setup>` 定义了以下核心变量来接收和管理数据：
  - `courseData` (`ref(null)`)：用于存储从后端获取到的今日课程/任务的完整数据对象。
  - `isLoading` (`ref(true)`)：用于控制页面数据加载时的骨架屏或 Loading 动画展示。

### 2. API 调用

- **后端接口路径**：
  获取今日数据的接口配置为 `API_CONFIG.paths.todayCourse`，其底层路径模板为 `/courses/{{campId}}/today`。
- **传入参数**：
  使用 `GET` 请求。`campId` 是由父组件传入的 props，在请求前通过字符串替换 `.replace('{{campId}}', props.campId.toString())` 的方式作为**路径参数**传入后端。
- **打卡接口说明**（扩展）：
  另外包含一个任务打卡的动作接口 `/courses/plan/{{planId}}/task/complete`，使用 `POST` 请求，传入的 Body 参数为 `{ taskType: task.taskId }`。

### 3. UI 结构骨架（重点）

目前 `<template>` 中负责渲染具体任务列表（即你提到的阅读、视频、作业等）的核心 HTML 骨架如下（它通过 `v-for="task in courseData.tasks"` 动态渲染，并未将阅读/视频/作业拆分为独立的硬编码区块，而是共用一套卡片结构）：

```html
<view class="tasks-list">
  <view
    v-for="task in courseData.tasks"
    :key="task.taskId"
    class="task-card"
    :class="{ 'task-done': task.isDone === 1 }"
    @click="handleCompleteTask(task)"
  >
    <!-- 左侧图标 -->
    <view class="task-icon" :class="getTaskTypeClass(task.taskType)">
      <uni-icons
        :type="task.isDone === 1 ? 'checkmarkempty' : getTaskIcon(task.taskType)"
        size="20"
        :color="task.isDone === 1 ? '#ffffff' : getTaskIconColor(task.taskType)"
      ></uni-icons>
    </view>

    <!-- 中间内容 -->
    <view class="task-content">
      <text class="task-title">{{ task.title }}</text>
      <text v-if="task.subtitle" class="task-subtitle">{{ task.subtitle }}</text>
    </view>

    <!-- 右侧状态 -->
    <view class="task-status">
      <view v-if="task.isDone === 1" class="status-done">
        <text class="status-text">已完成</text>
      </view>
      <view v-else class="status-pending">
        <text class="status-text">去完成</text>
        <uni-icons type="arrowright" size="14" color="#9ca3af"></uni-icons>
      </view>
    </view>
  </view>
</view>
```

- **绑定事件**：
  当前点击任务卡片（不管是去阅读还是去观看）时，并没有跳转到具体的阅读页或播放页，而是**直接绑定了 `handleCompleteTask(task)` 方法**。该方法会立即发起 API 请求将该任务标记为已完成（就地打卡更新进度）。