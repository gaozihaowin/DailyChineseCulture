# course-data.vue 课程数据图表组件分析报告

## 1. API 调用详情

### 请求代码

```javascript
const url = API_CONFIG.paths.courseData.replace('{{campId}}', props.campId.toString());

const response = await request({
  url: url,
  method: 'GET'
});
```

| 属性 | 值 |
|------|-----|
| **URL 模板** | `API_CONFIG.paths.courseData` |
| **动态替换** | `{{campId}}` → `props.campId` |
| **最终 URL** | `/api/camp/{{campId}}/course-data` |
| **HTTP Method** | `GET` |
| **组件挂载时机** | `onMounted` + `watch(campId)` 变化时 |

---

## 2. 期望的数据结构

### 完整响应结构

```json
{
  "code": 200,
  "data": {
    "overallRate": 75,
    "totalDays": 14,
    "completedDays": 10,
    "trends": [...],
    "achievements": [...]
  }
}
```

### `trends` 数组中每个对象的字段

| 字段名 | 类型 | 说明 | 模板中使用位置 |
|--------|------|------|----------------|
| `dayIndex` | Number | 日期索引（第几天） | `:id="'day-' + item.dayIndex"` |
| `dayStr` | String | 日期显示文本（如"Day 1"或"1/2"） | `{{ item.dayStr }}` |
| `status` | String | 状态标识（大写英文） | `:class="item.status ? item.status.toLowerCase() : 'locked'"` |
| `rate` | Number | 完成率数值（0-100） | `{{ item.rate }}` |

### `achievements` 数组中每个对象的字段

| 字段名 | 说明 |
|--------|------|
| `icon` | 成就图标 URL |
| `title` | 成就标题 |
| `desc` | 成就描述 |

---

## 3. UI 状态映射规则

### 模板中的动态 Class 绑定

```html
<view
  class="bar-wrapper"
  :class="item.status ? item.status.toLowerCase() : 'locked'"
>
```

### 状态值到 Class 名的映射

| 后端返回 status 值 | 转换后的 class 名 | 模板判断 |
|-------------------|------------------|---------|
| `'COMPLETED'` | `completed` | `item.status === 'COMPLETED'` |
| `'MISSED'` | `missed` | `item.status === 'MISSED'` |
| `'LOCKED'` | `locked` | `item.status === 'LOCKED'` 或 `''`（空字符串） |
| `''` / `null` / `undefined` | `locked` | fallback 默认值 |

### 柱子高度计算逻辑

```javascript
const getBarHeight = (item) => {
  if (item.status === 'LOCKED' || item.status === 'MISSED') {
    return '4%';  // 漏打卡和未解锁显示最小高度
  }
  if (item.status === 'COMPLETED') {
    return Math.max(item.rate || 0, 4) + '%';  // 至少 4%
  }
  return '4%';
};
```

### 各状态的视觉样式

| 状态 | Class | 柱子颜色 | 数字显示 | Label 颜色 |
|------|-------|----------|----------|------------|
| **COMPLETED** | `.completed` | 渐变橙色 `#ffd4c7 → #ffb199 → #fa7d65` | 显示 `rate` 值（如"75"） | `#4b5563` 深灰色 |
| **MISSED** | `.missed` | 浅红色 `#ffcccc` | 显示 `"0"` | `#ff8c8c` 红色 |
| **LOCKED** | `.locked` | 灰白色 `#f0ece6` | 显示 `"-"` | `#d1d5db` 浅灰色 |

### 模板中的数值显示逻辑

```html
<view class="bar-value-box">
  <text v-if="item.status === 'COMPLETED' && item.rate > 0" class="bar-value">
    {{ item.rate }}
  </text>
  <text v-else-if="item.status === 'MISSED'" class="bar-value missed-value">
    0
  </text>
  <text v-else class="bar-value locked-value">
    -
  </text>
</view>
```

---

## ⚠️ 重要发现

### 没有 `MAKEUP`（补卡）状态的样式处理

当前 CSS 中只定义了三种状态样式：

```css
/* 状态样式核心：完成 */
.completed .bar-body { ... }

/* 状态样式核心：漏打卡 */
.missed .bar-body { ... }

/* 状态样式核心：未解锁 */
.locked .bar-body { ... }
```

**如果后端新增 `MAKEUP` 补卡状态，前端目前没有对应的样式！**

需要在重构时新增：

```css
/* 状态样式核心：补卡 */
.makeup .bar-body {
  background: linear-gradient(to top, #e0e7ff 0%, #a5b4fc 50%, #818cf8 100%);
}
.makeup .bar-label { color: #6366f1; }
```

---

## 总结

| 维度 | 现状 |
|------|------|
| API 调用 | `GET /api/camp/{{campId}}/course-data` |
| trends 字段 | `dayIndex`, `dayStr`, `status`, `rate` |
| 状态类型 | `COMPLETED` / `MISSED` / `LOCKED` |
| 样式映射 | 转小写后匹配 CSS class |
| 补卡状态 | **暂不支持** |
