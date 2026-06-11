# UI-Lib 组件开发规范

## 一、组件目录结构

每个组件一个独立文件夹，位于 `components/<组件id>/`，包含以下三个文件：

```
components/kpi-card/
├── index.html          # ★ 核心：独立预览页（文档 + 实时渲染 + 代码展示）
├── template.html       # 纯 HTML 片段（AI few-shot 参考，无 JS）
└── component.js        # Vue 3 组件定义（Options API，给需要编程引用的工具）
```

每个文件都可以独立存在。index.html 双击即开预览，不依赖其他两个文件。template.html 和 component.js 供工具和 AI 引用。

## 二、index.html 规范

独立预览页是**完全自包含的 HTML 文件**，双击可在浏览器打开。必须包含以下区域：

### 2.1 页面结构

```
┌──────────────────────────────────────────────┐
│ ← 返回组件库总览                              │
│                                              │
│ 组件名称                          [风格切换器] │
│ ──────────────────────────────────────────── │
│                                              │
│ 实时预览（可切换风格查看效果）                  │
│ ┌──────────────────────────────────────┐     │
│ │  组件的真实渲染（template.html 内容）   │     │
│ └──────────────────────────────────────┘     │
│                                              │
│ 数据接口（Props）                             │
│ ┌──────────────────────────────────────┐     │
│ │ 属性 | 类型 | 默认值 | 说明             │     │
│ └──────────────────────────────────────┘     │
│                                              │
│ HTML 代码                                    │
│ ┌──────────────────────────────────────┐     │
│ │ <pre><code>...template.html内容...</code> │
│ └──────────────────────────────────────┘     │
│                                              │
│ [复制 HTML] [复制 Vue] [新标签页打开]          │
└──────────────────────────────────────────────┘
```

### 2.2 技术要求

1. **引入 tokens.css**：`<link rel="stylesheet" href="../../design-tokens/tokens.css">`
2. **引入 Tailwind CDN**：`<script src="https://cdn.tailwindcss.com"><\/script>`（如需布局类名）
3. **风格切换器**：三个按钮（商务蓝白/暗黑科技/清新简约），点击修改 `<html data-theme="xxx">`
4. **预览区**：加载 template.html 内容并内联渲染（用 v-html 或 innerHTML）
5. **代码展示**：`<pre><code>` 显示 HTML，深色背景代码区
6. **返回链接**：`<a href="../../gallery.html">` 指向组件库总览

## 三、template.html 规范

纯 HTML 片段，给 AI 作为 few-shot 参考。要求：

1. **根元素必须有 `data-cid="组件id"`** — 这是组件标识，AI 靠它理解组件类型
2. **所有颜色使用 `var(--color-xxx)` 引用**，禁止写死色值（如 `#1e3a8a`）
3. **Tailwind 类名仅用于布局/间距**，如 `flex`, `flex-col`, `gap-3`, `p-6` 等
4. **控制在 20 行以内**，简洁精炼
5. **包含示例数据**，不能是空壳
6. **不含 `<script>` 标签** — template.html 只做静态展示和 v-html 内联

```html
<!-- 正确示例 -->
<div data-cid="kpi-card" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-3 shadow-[var(--shadow-card)]">
  <span class="text-xs font-semibold px-3 py-1 rounded-full w-fit" style="color:var(--color-primary);background:var(--color-primary-light)">环比 +12.5%</span>
  <div class="text-5xl font-bold" style="color:var(--color-primary)">3.28<span class="text-lg font-normal" style="color:var(--color-text-muted)">%</span></div>
  <p class="text-sm" style="color:var(--color-text-muted)">七日年化收益率</p>
</div>
```

## 四、component.js 规范

Vue 3 组件定义，使用 Options API（兼容 CDN 全局引入方式）：

1. **组件名与 data-cid 一致**
2. **Props 命名清晰**，默认值合理
3. **template 中的结构与人 template.html 保持一致**
4. **用 `:style` 绑定 CSS 变量**，不用静态 style
5. **条件渲染使用 `v-if`**，列表使用 `v-for`

```javascript
const KpiCard = {
  name: 'KpiCard',
  props: {
    label: { type: String, default: '' },
    value: { type: Number, required: true },
    unit: { type: String, default: '%' },
    trend: { type: String, default: '' }
  },
  template: `...`
};
```

## 五、命名规范

| 项目 | 规范 | 示例 |
|------|------|------|
| 组件 ID | kebab-case | `kpi-card`, `data-table`, `section-header` |
| 组件文件夹 | 与 ID 一致 | `components/kpi-card/` |
| Vue 组件名 | PascalCase | `KpiCard`, `DataTable` |
| CSS 变量 | `--`前缀 + kebab-case | `--color-primary`, `--radius-lg` |
| data-cid | 与组件 ID 一致 | `data-cid="kpi-card"` |

## 六、颜色使用规则

```
✅ 正确：style="color: var(--color-primary); background: var(--color-bg-card)"
✅ 正确：class="bg-[var(--color-bg-card)]" （Tailwind 任意值语法）
❌ 错误：class="bg-blue-50 text-blue-900" （写死了色值）
❌ 错误：style="color: #1e3a8a" （无法换肤）
```

## 七、新增组件步骤

1. 在 `components/` 下新建文件夹 `new-component/`
2. 创建 `template.html` — 先写模板，确认视觉效果
3. 创建 `index.html` — 参照 kpi-card 的格式复制并修改
4. 创建 `component.js` — Vue 组件定义
5. 更新 `gallery.html` 中的组件注册表
6. 更新各工具的组件注册表（如 report-tool.html 中的 `COMPONENT_CATALOG`）

## 八、浏览器兼容

- 所有 HTML 文件使用 `<meta charset="UTF-8">`
- CSS 变量兼容 Chrome 49+ / Edge 15+ / Safari 9.1+ / Firefox 31+
- Tailwind CDN 通过 `<script>` 标签引入，兼容所有现代浏览器
- gallery.html 的 iframe 使用相对路径加载子组件
- 在 file:// 协议下，fetch 可能因跨域限制失败（Chrome/Edge 禁止，Safari 允许）。工具页面使用 fallbackHTML + fetch 增强策略兼容


把index.html文件中目前任务视图部分按照timesheet-tracker.html的交互逻辑功能全部重新实现，前后选择双周时间周期，日期表头的显示点击交互，拖拽实现任务起止时间，自动计算每日任务时间和任务总时间，设计文档说的请忽略，按我最新的要求改，改完了后更新interaction-design设计文档
