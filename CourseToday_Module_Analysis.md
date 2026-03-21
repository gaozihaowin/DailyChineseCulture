# CourseToday.vue 升维改造分析报告

> 本文档旨在梳理 `CourseToday.vue` 组件的现状，并评估将其改造为【通用单日任务看板】的可行性与方案。

---

## 1. 前端现状分析 (CourseToday.vue)

### 1.1 Props 定义

**当前组件只接收一个 Prop：**

```javascript
const props = defineProps({
  campId: {
    type: [Number, String],
    required: true
  }
});
```

| Prop 名 | 类型 | 必填 | 说明 |
|---------|------|------|------|
| `campId` | Number/String | ✅ | 营期 ID，用于拼接今日课程接口 URL |

### 1.2 API 调用

**当前 `fetchTodayData` 方法的接口定义：**

```javascript
const fetchTodayData = async () => {
  const url = API_CONFIG.paths.todayCourse.replace('{{campId}}', props.campId.toString());
  const response = await request({ url: url, method: 'GET' });
  // ...
};
```

**API_CONFIG.paths 中对应的完整路径定义：**

| 配置键 | 完整路径模板 | HTTP Method | 说明 |
|--------|-------------|-------------|------|
| `todayCourse` | `/courses/{{campId}}/today` | GET | 获取**今日**课程数据 |
| `completeTask` | `/courses/plan/{{planId}}/task/complete` | POST | 任务打卡 |
| `submitHomework` | `/courses/homework/submit`（兜底值） | POST | 作业提交（当 taskType === 'HOMEWORK' 时使用） |

**关键发现：**
- `todayCourse` 接口是**以 `campId` 为维度**的"今日"专用接口
- 接口返回的 `courseData.planId` 是从响应数据中获取的，用于后续打卡操作
- 组件逻辑强依赖"今天是星期几"的后端判断

### 1.3 核心数据结构

**`courseData` 响应式变量期望的数据结构：**

```typescript
interface CourseData {
  currentDate: string;        // 当前日期文本，如 "1月20日 周一"
  completionRate: number;      // 完成率百分比，如 75
  planId: number;            // 排课计划 ID（打卡时使用）
  hasCourse: boolean;         // 今日是否有课
  tasks: Task[];             // 任务数组
}

interface Task {
  taskId: number;            // 任务唯一标识
  taskName: string;          // 任务名称
  taskType: 'READ' | 'VIDEO' | 'HOMEWORK' | 'EXTRA';  // 任务类型
  taskDesc?: string;         // 任务描述（可选）
  taskUrl?: string;          // 任务资源 URL（阅读链接/视频链接）
  isDone: number;            // 完成状态，1=已完成，0=未完成
  isRequired: number;        // 是否必修，1=必修，0=选修
}
```

**模板中使用的数据字段：**

| 模板位置 | 字段 | 用途 |
|---------|------|------|
| `courseData.currentDate` | 日期文本 | 显示"今日日期" |
| `courseData.completionRate` | 完成率 | 显示进度百分比 |
| `courseData.hasCourse` | 布尔值 | 控制显示"今日无课"还是任务列表 |
| `courseData.tasks` | 数组 | v-for 渲染任务卡片 |
| `task.taskName` | 文本 | 任务标题 |
| `task.taskType` | 枚举 | 决定弹出层渲染什么内容 |
| `task.isDone` | 数字(0/1) | 控制已完成状态样式 |
| `courseData.planId` | 数字 | 打卡接口的路径参数 |

---

## 2. 升维改造方案评估

### 2.1 Props 扩充

**需要新增的 Prop：**

```javascript
const props = defineProps({
  // 现有 prop
  campId: {
    type: [Number, String],
    required: true
  },
  // ========== 新增 prop ==========
  targetPlanId: {
    type: [Number, String],
    default: null    // 可选，如果不传则走"今日"逻辑
  }
});
```

| 新 Prop 名 | 类型 | 默认值 | 说明 |
|------------|------|--------|------|
| `targetPlanId` | Number/String | `null` | 指定查看某一天的排课 ID，为空时走原"今日"逻辑 |

**兼容性策略：**
- `targetPlanId` 为 `null` → 保持原有"今日"行为
- `targetPlanId` 有值 → 切换为"指定日期"行为

### 2.2 API 动态路由策略

**现状问题：**
- 现有 `todayCourse: '/courses/{{campId}}/today'` 是**以 campId 为维度**的接口
- 无法指定某一"天"（某个 planId）

**建议方案：**

在 `api/config.js` 中新增配置：

```javascript
paths: {
  // 现有接口（保留）
  todayCourse: '/courses/{{campId}}/today',

  // ========== 新增接口 ==========
  // 方案 A：通用的"某营期某天课程"接口（推荐）
  planDayCourse: '/courses/{{campId}}/plan/{{planId}}/day',

  // 方案 B：如果后端已有独立的"排课详情"接口
  planDetail: '/courses/plan/{{planId}}/detail',
}
```

**组件内的动态逻辑：**

```javascript
const fetchTodayData = async () => {
  try {
    isLoading.value = true;

    let url = '';

    // ========== 动态路由选择 ==========
    if (props.targetPlanId) {
      // 模式 A：指定了 planId，使用通用单日接口
      url = API_CONFIG.paths.planDayCourse
        .replace('{{campId}}', props.campId.toString())
        .replace('{{planId}}', props.targetPlanId.toString());
    } else {
      // 模式 B：未指定 planId，走原"今日"逻辑
      url = API_CONFIG.paths.todayCourse.replace('{{campId}}', props.campId.toString());
    }

    const response = await request({ url: url, method: 'GET' });
    // ...
  }
};
```

### 2.3 生命周期与响应式监听

**现有 watch 逻辑（问题）：**

```javascript
watch(() => props.campId, (newCampId) => {
  if (newCampId) {
    fetchTodayData();
  }
});
```

**缺陷：**
- 只监听了 `campId` 变化
- 当父组件"课程大纲"切换不同天时，`targetPlanId` 会变，但 `campId` 不变
- 导致 watch 不会触发，数据不会更新

**改造后的 watch 逻辑：**

```javascript
// ========== 监听多个 props 变化 ==========

// 方案 A：watch 两个 prop，任一变化都重新获取
watch(
  () => [props.campId, props.targetPlanId],
  ([newCampId, newPlanId], [oldCampId, oldPlanId]) => {
    // 任一值变化时，重新拉取数据
    if (newCampId || newPlanId) {
      fetchTodayData();
    }
  }
);

// 方案 B（推荐）：watch targetPlanId，因为它才是"切换天"的核心驱动
watch(
  () => props.targetPlanId,
  (newPlanId) => {
    // targetPlanId 变化（切换到不同天），重新拉取数据
    fetchTodayData();
  },
  { immediate: false }  // 不需要 immediate，因为 onMounted 时也会调用
);
```

**完整改造后的 onMounted + watch：**

```javascript
onMounted(() => {
  fetchTodayData();
});

watch(
  () => props.targetPlanId,
  () => {
    fetchTodayData();
  }
);

// 如果需要同时监听 campId 变化（营期切换）
watch(
  () => props.campId,
  () => {
    // campId 变化时，重置 targetPlanId 并重新获取
    fetchTodayData();
  }
);
```

---

## 3. 改造总结

| 维度 | 现状 | 改造后 |
|------|------|--------|
| **Props** | `campId` 单一 | `campId` + `targetPlanId` |
| **数据来源** | 后端根据"今天"返回 | 可指定任意一天的 `planId` |
| **API 策略** | 单一接口 `/today` | 双接口动态切换 |
| **Watch 监听** | 只监听 `campId` | 监听 `targetPlanId`（核心）+ `campId`（辅助） |
| **UI 显示** | 固定"今日课程" | 根据数据动态显示日期标题 |

---

## 4. 潜在风险与建议

1. **后端接口支持**：需确认后端是否有 `/courses/{{campId}}/plan/{{planId}}/day` 或类似的"指定排课日"接口
2. **PlanId 来源**：`targetPlanId` 需要父组件（如"课程大纲"）在切换 Tab/天时传递
3. **兼容旧版**：如果父组件不传 `targetPlanId`，组件应自动保持"今日"行为
4. **日期显示**：模板中 `courseData.currentDate` 可能是后端返回的固定值，需确认后端会返回正确的日期文本

---

## 5. 实际改造记录

> 以下记录已在 **2026-03-21** 完成的功能升级。

### 5.1 改造概述

后端接口升级支持接收可选的 query 参数 `?planId=xxx`，前端同步升级 `CourseToday.vue`，将其从"今日课程专用组件"改造为**通用单日任务看板**。

### 5.2 改造内容

#### (1) Props 升级

```javascript
const props = defineProps({
  campId: {
    type: [Number, String],
    required: true
  },
  // 升维改造：新增 targetPlanId，支持查看任意一天的课程
  targetPlanId: {
    type: [Number, String],
    default: null
  }
});
```

#### (2) API 请求升级 (`fetchTodayData`)

```javascript
const fetchTodayData = async () => {
  try {
    isLoading.value = true;

    // 构建 URL，支持可选的 planId 查询参数
    let url = API_CONFIG.paths.todayCourse.replace('{{campId}}', props.campId.toString());
    if (props.targetPlanId) {
      url += `?planId=${props.targetPlanId}`;
    }

    const response = await request({ url: url, method: 'GET' });
    // ...
  }
};
```

#### (3) 双重 Watch 监听

```javascript
// 监听 campId 变化（营期切换）
watch(() => props.campId, (newCampId) => {
  if (newCampId) {
    fetchTodayData();
  }
});

// 升维改造核心：监听 targetPlanId 变化
watch(() => props.targetPlanId, (newVal) => {
  fetchTodayData();
});
```

### 5.3 兼容性说明

| 父组件传入 | 组件行为 |
|-----------|---------|
| 不传 `targetPlanId` | 保持原有"今日"逻辑 |
| 传 `targetPlanId=null` | 保持原有"今日"逻辑 |
| 传 `targetPlanId=xxx` | 请求后端返回对应那天的数据 |

### 5.4 保留原有功能

- ✅ 弹窗逻辑 (`openTaskPopup` / `closeTaskPopup`)
- ✅ 打卡逻辑 (`submitTask`)
- ✅ UI 绑定（一字未动）
- ✅ 进度更新事件 (`emit('updateProgress')`)

---

## 6. 历史文档索引

| 文件名 | 说明 |
|--------|------|
| `CourseToday打卡逻辑分析报告.md` | 早期代码审查报告（打卡逻辑分析） |
| `course-data组件分析报告.md` | `course-data.vue` 组件分析报告 |
| `CourseToday_Module_Analysis.md` | 本文件，功能升级分析报告 |
