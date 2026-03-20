# CourseToday.vue 打卡逻辑分析报告

## 1. API 调用详情

### handleCompleteTask 方法中发起网络请求的完整代码片段

```javascript
const handleCompleteTask = async (task) => {
  // 防抖防呆：如果任务已完成，直接返回
  if (task.isDone === 1) {
    uni.showToast({
      title: '任务已完成',
      icon: 'success'
    });
    return;
  }

  // 打开 Loading
  uni.showLoading({ title: '打卡记录中...' });

  try {
    // 从组件状态中获取真实的 planId
    const planId = courseData.value.planId;
    if (!planId) {
      throw new Error('未获取到有效的 planId');
    }

    // 替换 URL 中的 planId 占位符
    const url = API_CONFIG.paths.completeTask.replace('{{planId}}', planId.toString());

    const response = await request({
      url: url,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { taskId: task.taskId }
    });

    const apiData = response.data;

    if (apiData.code === 200) {
      // 极致的就地更新：直接修改当前任务状态和总进度
      task.isDone = 1;
      courseData.value.completionRate = apiData.data.completionRate;

      // 发出事件通知父组件进度更新
      emit('updateProgress', courseData.value.completionRate);

      // 关闭 Loading，显示成功提示
      uni.hideLoading();
      uni.showToast({
        title: '任务完成！',
        icon: 'success'
      });
    } else {
      uni.hideLoading();
      uni.showToast({
        title: apiData.msg || '打卡失败',
        icon: 'none'
      });
    }
  } catch (error) {
    uni.hideLoading();
    console.error('打卡请求失败:', error);
    // 错误已在 request 中统一处理
  }
};
```

### 请求 URL
- **来源**：`API_CONFIG.paths.completeTask`
- **动态替换**：将 `{{planId}}` 占位符替换为 `courseData.value.planId`
- **最终 URL 格式**：`/api/camp/plan/{{planId}}/complete`

### 传递给后端的参数（payload）

| 字段名 | 来源 | 说明 |
|--------|------|------|
| `taskId` | `task.taskId` | 当前点击任务的唯一标识，通过 `data: { taskId: task.taskId }` 传递 |
| `planId` | URL 路径参数 | 课程计划 ID，通过 URL 路径传递（非 body） |

### 请求方式
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

---

## 2. 状态更新逻辑

### API 请求成功后的处理

```javascript
if (apiData.code === 200) {
  // 极致的就地更新：直接修改当前任务状态和总进度
  task.isDone = 1;
  courseData.value.completionRate = apiData.data.completionRate;

  // 发出事件通知父组件进度更新
  emit('updateProgress', courseData.value.completionRate);

  // 关闭 Loading，显示成功提示
  uni.hideLoading();
  uni.showToast({
    title: '任务完成！',
    icon: 'success'
  });
}
```

### 状态更新策略总结

| 更新项 | 更新方式 | 说明 |
|--------|----------|------|
| `task.isDone` | **直接修改** `task.isDone = 1` | 未重新发起 GET 请求刷新列表 |
| `courseData.completionRate` | **使用后端返回数据** `apiData.data.completionRate` | 从响应中获取最新完成率 |
| 页面 UI | **响应式自动更新** | 由于使用 Vue 3 Composition API 的 `ref`，直接修改值会触发视图更新 |

### 结论
- ✅ **采用就地更新策略**，无需重新获取今日课程详情列表
- ✅ **UI 自动同步**，利用 Vue 响应式系统

---

## 3. 组件通信

### Emits 定义

```javascript
// 定义 Emits
const emit = defineEmits(['updateProgress']);
```

### 打卡成功后的派发

```javascript
// 发出事件通知父组件进度更新
emit('updateProgress', courseData.value.completionRate);
```

### 组件通信详情

| 属性 | 值 |
|------|-----|
| **事件名** | `updateProgress` |
| **传递参数** | `courseData.value.completionRate`（最新的完成率百分比，数值类型） |
| **触发时机** | 打卡 API 返回 `code === 200` 时 |
| **用途** | 通知父组件更新顶部的大圆环进度条 |

### 父组件使用方式（示例）

```vue
<!-- 父组件模板中 -->
<CourseToday
  :campId="campId"
  @updateProgress="handleProgressUpdate"
/>
```

```javascript
// 父组件逻辑中
const handleProgressUpdate = (newRate) => {
  console.log('收到进度更新:', newRate);
  // 可在此更新父组件的进度状态
};
```

---

## 总结

| 维度 | 现状 |
|------|------|
| API 调用 | `POST` 请求，URL 含 `planId` 路径参数，body 传 `taskId` |
| 状态更新 | 就地修改 `task.isDone` + 使用后端返回的 `completionRate`，无列表刷新 |
| 父组件通信 | 通过 `emit('updateProgress', rate)` 通知父组件 |
