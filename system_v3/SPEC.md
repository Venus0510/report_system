# UI Library + 报告生成工具 — 功能总指令（v3）

> **最后更新：2026-05-21** — 反映组件库 v3 当前实际落地状态。Phase 1-4 已完成（基础组件、图表、版式、风格、gallery 总览、完整案例），report-tool 待开发。

## 一、产品定位

v3 在 v2 的基础上做一次架构升级，核心理念是**组件库与工具分离**：

- **ui-lib/** — 独立的前端组件库，包含基础组件、图表、版式骨架、风格主题、Design Token 规范、完整案例模板。每个组件/图表/版式都是独立的 HTML 文件，可双击打开预览，也可通过相对路径被各工具引用。定位类似市面开源组件库（Ant Design、shadcn/ui）的团队内部版本。
- **report-tool/** — 报告生成工具（待开发），是一个纯静态 HTML 文件（双击即用），专注于多轮渐进式提示词编排。不内嵌组件代码，只维护轻量的组件注册表（元数据 + 路径引用）。
- **bid-tool/**、**bi-system/** — 后续工具（待开发），同样通过相对路径引用 ui-lib/，共享同一套组件和设计规范。

**核心原则：**
1. **零服务端、零安装** — 所有 HTML 文件双击即开，不需要 Python、Node.js、npm install
2. **组件库是基础设施** — 独立于任何工具，跨工具共享
3. **多轮渐进生成** — 提示词分步输出（骨架→逐页填充→精细修改），每次 ~500 字，避免 AI 卡壳
4. **CSS 变量做换肤** — 风格切换是运行时行为，不依赖构建工具，`data-theme` 属性秒切

---

## 二、技术约束

| 项目 | 要求 |
|------|------|
| 部署形态 | **纯静态 HTML 文件，双击即开，零服务端** |
| UI 框架 | Vue 3（CDN 引入，仅 gallery.html 和工具页面使用） |
| CSS 框架 | Tailwind CSS（CDN 引入，仅用于布局/间距/排版） |
| 颜色/风格 | **CSS 自定义属性（`var(--color-xxx)`）**，不用 Tailwind 颜色类名 |
| 图表渲染 | ECharts 5（CDN 引入） |
| 代码高亮 | Prism.js 或 highlight.js（CDN 引入，gallery.html 用） |
| 启动方式 | **双击 HTML 文件 → 浏览器打开** |
| 依赖管理 | **全部 CDN，零 npm install，零构建，零部署** |
| 浏览器兼容 | Chrome / Edge / Safari / Firefox 最新版 |
| file:// 兼容 | gallery.html 的 iframe 加载子组件使用相对路径；report-tool.html 组件预览采用硬编码 fallbackHTML + fetch 增强策略，兼容所有浏览器 |

### CDN 引入清单

```html
<!-- Vue 3 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>

<!-- Tailwind CSS（仅布局工具类，颜色用CSS变量） -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- ECharts 5（图表组件使用） -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>

<!-- Prism.js（gallery.html 代码高亮） -->
<link href="https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-tomorrow.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/prismjs@1/prism.min.js"></script>
```

---

## 三、项目文件结构

```
report_system/
├── ui-lib/                          # ★ 组件库（独立基础设施）
│   ├── gallery.html                 # 总览浏览页（Vue 3 驱动，全内联渲染，零 iframe）
│   ├── COMPONENT_SPEC.md            # 组件开发规范（命名、文件结构、必须元素）
│   │
│   ├── design-tokens/
│   │   ├── tokens.css               # CSS 自定义属性（3套风格主题定义）
│   │   └── preview.html             # Token 可视化预览页（色块、字体、间距展示）
│   │
│   ├── components/                  # 基础组件（11个）
│   │   ├── kpi-card/
│   │   │   ├── index.html           # ★ 独立可打开：实时预览 + 代码示例 + 参数说明
│   │   │   ├── template.html        # 纯 HTML 片段（AI 生成参考）
│   │   │   └── component.js         # Vue 3 组件定义（工具开发引用）
│   │   ├── info-card/
│   │   │   ├── index.html
│   │   │   ├── template.html
│   │   │   └── component.js
│   │   ├── data-table/
│   │   ├── compare-card/
│   │   ├── process-step/
│   │   ├── team-grid/
│   │   ├── highlight-quote/
│   │   ├── big-number-row/
│   │   ├── timeline/
│   │   ├── section-header/
│   │   └── divider/
│   │
│   ├── charts/                      # 图表组件（ECharts 封装，3个）
│   │   ├── bar-chart/
│   │   │   ├── index.html
│   │   │   ├── template.html
│   │   │   └── component.js
│   │   ├── line-chart/
│   │   │   ├── index.html
│   │   │   ├── template.html
│   │   │   └── component.js
│   │   └── pie-chart/
│   │       ├── index.html
│   │       ├── template.html
│   │       └── component.js
│   │
│   ├── layouts/                     # 版式骨架（3套，结构不同于组件，无 component.js）
│   │   ├── a4-landscape/
│   │   │   ├── index.html           # 独立预览：占位符内容渲染完整A4报告
│   │   │   ├── skeleton.html        # ★ 核心：页面骨架模板（AI 填空用）
│   │   │   └── layout.css           # 版式专属 CSS（@page、297mm×210mm、overflow:hidden）
│   │   ├── ppt-slide/
│   │   │   ├── index.html           # 独立预览：100vw×100vh 全屏翻页
│   │   │   ├── skeleton.html
│   │   │   └── layout.css           # 按钮翻页 + 键盘导航
│   │   └── web-scroll/
│   │       ├── index.html           # 独立预览：max-1180px 响应式滚动
│   │       ├── skeleton.html
│   │       └── layout.css
│   │
│   ├── styles/                      # 风格预览（3套，实际 Token 定义在 design-tokens/tokens.css）
│   │   ├── business-blue/
│   │   │   └── preview.html
│   │   ├── dark-tech/
│   │   │   └── preview.html
│   │   └── fresh-clean/
│   │       └── preview.html
│   │
│   └── template/                    # ★ 完整案例模板（v3 新增 — 用组件库生成的完整报告范例）
│       ├── A4.html                  # 货币基金收益归因分析 · 4页A4横版报告
│       ├── ppt.html                 # 估值政策培训 · 7页PPT翻页演示
│       └── web.html                 # 估值咨询服务 · 响应式滚动落地页
│
├── report-tool/                     # 工具1：报告生成（v3 重构版）
│   └── report-tool.html             # 双击运行，纯静态。提示词编排器
│
├── bid-tool/                        # 工具2：标书撰写（后续开发）
│   └── bid-tool.html
│
├── bi-system/                       # 工具3：轻量 BI 系统（后续开发）
│   └── bi-dashboard.html
│
├── system_v1/                       # 保留不动
└── system_v2/                       # 保留不动
```

### 组件库与工具的引用关系

```
ui-lib/  ←── report-tool.html    （相对路径引用：../ui-lib/components/xxx/）
    ↑
    ├── bid-tool.html            （相对路径引用：../ui-lib/components/xxx/）
    │
    └── bi-dashboard.html        （相对路径引用：../ui-lib/components/xxx/）
```

工具不需要动态 fetch 组件文件。组件库已内置**全量 FALLBACKS**（gallery.html 中约 20KB 的硬编码 HTML），确保在 file:// 协议下（fetch 受限时）仍可正常预览。提示词中引用路径，由 Claude Desktop 端自行读取组件模板文件。

---

## 四、Design Token 体系（design-tokens/）

### 4.1 tokens.css — CSS 自定义属性

所有颜色、间距、圆角、阴影、字体统一在此定义。组件和版式通过 `var(--xxx)` 引用，不写死色值。

```css
/* ===== 商务蓝白（默认主题） ===== */
:root, [data-theme="business-blue"] {
  --color-primary: #1e3a8a;
  --color-primary-light: #dbeafe;
  --color-bg: #f8fafc;
  --color-bg-card: #ffffff;
  --color-text: #1f2937;
  --color-text-muted: #64748b;
  --color-accent: #2563eb;
  --color-border: #e5e7eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;

  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 28px;
  --text-3xl: 40px;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 10px 25px rgba(0,0,0,0.08);
}

/* ===== 暗黑科技 ===== */
[data-theme="dark-tech"] {
  --color-primary: #6ea8ff;
  --color-primary-light: #1e3050;
  --color-bg: #0f172a;
  --color-bg-card: #1e293b;
  --color-text: #e2e8f0;
  --color-text-muted: #94a3b8;
  --color-accent: #38bdf8;
  --color-border: #334155;
}

/* ===== 清新简约 ===== */
[data-theme="fresh-clean"] {
  --color-primary: #30b08f;
  --color-primary-light: #d1fae5;
  --color-bg: #f0fdf4;
  --color-bg-card: #ffffff;
  --color-text: #1f2937;
  --color-text-muted: #6b7280;
  --color-accent: #34d399;
  --color-border: #d1d5db;
}
```

### 4.2 扩展新风格

只需在 `tokens.css` 中新增一个 `[data-theme="xxx"]` 块（约 10 行 CSS）。所有组件、图表、版式自动适配，无需修改任何组件代码。

### 4.3 风格切换原理

```html
<html data-theme="business-blue">
  <!-- 所有 var(--color-xxx) 自动取 business-blue 的值 -->
</html>
```

切换时只需 `document.documentElement.setAttribute('data-theme', 'new-theme')`，所有引用 CSS 变量的元素即时变色，不需要重新渲染。

### 4.4 Tailwind 的角色

Tailwind CSS 在本项目中**仅用于布局、间距、排版**，不用于颜色：

```html
<!-- ✅ Tailwind 用于布局 -->
<div class="flex flex-col gap-3 p-6 rounded-2xl shadow-lg">

<!-- ✅ 颜色使用 CSS 变量 -->
style="background: var(--color-bg-card); color: var(--color-text);"

<!-- ❌ 禁止：用 Tailwind 颜色类名写死色值 -->
<div class="bg-blue-50 text-blue-900">
```

### 4.5 preview.html — Token 可视化

独立页面，展示所有 Token 的实际效果：色块矩阵、字体阶梯、间距标尺、圆角卡片、阴影对比。每种风格一个 Tab 可切换查看。

---

## 五、组件规范（components/）

### 5.1 单个组件目录结构

```
components/kpi-card/
├── index.html          # ★ 核心文件：独立预览页（文档+实时渲染+代码）
├── template.html       # 纯 HTML 片段（AI few-shot 参考）
└── component.js        # Vue 3 组件（给需要编程引用的工具）
```

### 5.2 index.html — 独立预览页规范

每个组件的 `index.html` 是**完全自包含的 HTML 文件**，双击即可在浏览器打开。包含以下区域：

```
┌──────────────────────────────────────────────────┐
│  ← 返回组件库总览                                 │
│                                                  │
│  KPI 数字卡片                          [商务蓝白] │
│  ─────────────────────────────────────  [暗黑科技] │
│  ┌──────────────────────────────┐    [清新简约]   │
│  │  实时渲染示例（可切换风格）    │                │
│  │  ┌──────────────────────┐   │                │
│  │  │ 环比 +12.5%          │   │                │
│  │  │    3.28%             │   │                │
│  │  │ 七日年化收益率        │   │                │
│  │  └──────────────────────┘   │                │
│  └──────────────────────────────┘                │
│                                                  │
│  数据接口（Props）                                │
│  ┌──────────────────────────────────────────────┐│
│  │ label: string    — 标签文本                   ││
│  │ value: number    — 指标数值                   ││
│  │ unit: string     — 单位（默认 %）              ││
│  │ trend: string    — 趋势标签（可选）             ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  HTML 代码                                       │
│  ┌──────────────────────────────────────────────┐│
│  │ <div data-cid="kpi-card" class="bg-[var...]> ││
│  │   ...                                         ││
│  │ </div>                                        ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  [复制 HTML 片段]  [复制 Vue 代码]  [在新标签页打开]│
└──────────────────────────────────────────────────┘
```

**技术要求：**
- 内联 `<style>` 引入 `../design-tokens/tokens.css`
- CDN 引入 Tailwind（如需布局类名）
- 风格切换按钮通过修改 `data-theme` 属性实现
- 代码展示区使用 `<pre><code>` + 基础语法高亮
- 必须包含 "返回组件库总览" 的链接（指向 `../../gallery.html`）

### 5.3 template.html — AI 参考片段

纯 HTML 片段，给 AI 作为 few-shot 参考。要求：

- **根元素必须有 `data-cid="组件id"`**
- 使用 `var(--color-xxx)` 引用颜色，不写死色值
- Tailwind 类名仅用于布局/间距
- 控制 20 行以内，简洁精炼
- 包含示例数据（非空壳）

```html
<!-- components/kpi-card/template.html -->
<div data-cid="kpi-card" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6 flex flex-col gap-3">
  <span class="text-xs font-semibold px-3 py-1 rounded-full w-fit" style="color:var(--color-primary);background:var(--color-primary-light)">环比 +12.5%</span>
  <div class="text-5xl font-bold" style="color:var(--color-primary)">3.28<span class="text-lg font-normal" style="color:var(--color-text-muted)">%</span></div>
  <p class="text-sm" style="color:var(--color-text-muted)">七日年化收益率</p>
</div>
```

### 5.4 component.js — Vue 组件

给需要编程引用的工具（如 BI 系统）使用。基于 Vue 3 Options API（兼容 CDN 用法）：

```javascript
// components/kpi-card/component.js
const KpiCard = {
  name: 'KpiCard',
  props: {
    label: { type: String, default: '' },
    value: { type: Number, required: true },
    unit: { type: String, default: '%' },
    trend: { type: String, default: '' }
  },
  template: `
    <div data-cid="kpi-card" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6 flex flex-col gap-3">
      <span v-if="trend" class="text-xs font-semibold px-3 py-1 rounded-full w-fit" :style="{color:'var(--color-primary)',background:'var(--color-primary-light)'}">{{ trend }}</span>
      <div class="text-5xl font-bold" :style="{color:'var(--color-primary)'}">{{ value }}<span class="text-lg font-normal" :style="{color:'var(--color-text-muted)'}">{{ unit }}</span></div>
      <p class="text-sm" :style="{color:'var(--color-text-muted)'}">{{ label }}</p>
    </div>
  `
};
```

### 5.5 基础组件清单（11个）

| 分类 | 组件ID | 名称 | 说明 |
|------|--------|------|------|
| 数据展示 | `kpi-card` | KPI 数字卡片 | 大数字 + 趋势标签 + 说明文字 |
| 数据展示 | `big-number-row` | 大数字行 | 一行多个并列指标横向排列 |
| 数据展示 | `data-table` | 数据表格 | 蓝色表头 + 斑马纹行 |
| 内容展示 | `info-card` | 信息卡片 | 标题 + 正文描述 |
| 内容展示 | `highlight-quote` | 亮点引用 | 引用金句/关键结论 |
| 内容展示 | `team-grid` | 团队介绍网格 | 头像 + 角色卡片网格 |
| 流程展示 | `process-step` | 流程步骤条 | 带编号的步骤列表 |
| 流程展示 | `timeline` | 时间轴 | 纵向时间线（v3新增） |
| 对比分析 | `compare-card` | 对比卡片 | 左右双栏数据对比 |
| 装饰布局 | `section-header` | 章节标题 | 页面分节标题 + 装饰线（v3新增） |
| 装饰布局 | `divider` | 分割线 | 内容分隔（v3新增） |

### 5.6 新增组件的步骤

1. 在 `components/` 下新建文件夹 `new-component/`
2. 创建 `index.html`（参照 kpi-card 的格式）
3. 创建 `template.html`（精炼的纯 HTML 片段）
4. 创建 `component.js`（Vue 组件定义）
5. 更新 `gallery.html` 中的组件注册表，加入新组件
6. 更新各工具的组件注册表（如 report-tool.html 中的 `COMPONENT_CATALOG`）

---

## 六、图表组件规范（charts/）

### 6.1 目录结构

```
charts/bar-chart/
├── index.html          # 独立预览：交互式 Demo（可编辑JSON数据实时预览）
├── template.html       # 纯 HTML 片段（给 AI 参考的 ECharts 初始化代码）
└── component.js        # Vue 3 组件（封装 ECharts，暴露统一数据接口）
```

### 6.2 图表组件统一接口

所有图表组件的 Vue 组件**暴露相同的 Props 结构**：

```javascript
props: {
  data: Array,           // [{ name, value }] 或 [{ xField, yField }]
  title: String,         // 图表标题
  xField: String,        // X轴字段名
  yField: String,        // Y轴字段名
  height: { type: Number, default: 400 }
}
```

这样工具侧和 AI 生成侧的数据绑定方式一致。

### 6.3 第一批图表（3个）

| 图表ID | 类型 | 适用场景 |
|------|------|---------|
| `bar-chart` | 柱状图 | 分类对比、排名 |
| `line-chart` | 折线图 | 趋势变化、时间序列。支持多系列对比 |
| `pie-chart` | 环形饼图 | 占比分布、构成分析 |

### 6.4 图表内联渲染

gallery.html 中图表通过 v-html 注入 HTML 容器 + `$nextTick` 中调用 `echarts.init()` 初始化，实现与父页面共享 `data-theme` 的即时主题切换。图表颜色在初始化时通过 `getComputedStyle()` 读取当前主题的 CSS 变量值动态设置。

---

## 七、版式规范（layouts/）

### 7.1 版式与组件的结构差异

版式是**容器骨架**，不是内容积木。因此结构不同于组件：

```
layouts/a4-landscape/
├── index.html          # 独立预览：占位符内容渲染完整报告（含主题切换）
├── skeleton.html       # ★ 核心：页面骨架模板（AI 在此结构内填充内容）
└── layout.css          # 版式专属样式（@page、容器尺寸、分页/翻页逻辑）
```

**没有 `component.js`** — 版式不是交互组件，是静态 HTML 结构 + CSS 规则。

### 7.2 三种版式详情

#### A4 横版分页（a4-landscape）

- **容器**：297mm × 210mm 固定，`overflow: hidden` 强制不可溢出、不可滚动
- **结构**：`.page-a4-landscape` + `.page-header-strip`（顶部色条）+ `.content-area`（内容区 padding 18mm×22mm）+ `.page-footer`
- **翻页**：CSS `page-break-after: always`，打印时自动分页
- **屏幕预览**：gallery 中缩放到 210mm×148mm（`.layout-preview-box` 缩放），使多页可并列查看
- **占位符数据**：index.html 和 FALLBACKS 均使用 `[报告标题]`、`[数值]`、`[单位]` 等占位符，框架完整、内容留空给用户填写

#### PPT Slide 翻页（ppt-slide）

- **容器**：100vw × 100vh 固定屏
- **翻页**：JS 显隐切换（`.ppt-slide.active` / `:not(.active)` opacity 过渡）
- **导航**：← 上一页 / 下一页 → 按钮（固定底部），第一页"上一页"disabled、最后一页"下一页"disabled。同时支持键盘 ArrowLeft/ArrowRight 翻页
- **gallery 预览**：多页堆叠展示，每页底部虚线分隔，底部显示按钮示意

#### 自由滚动网页（web-scroll）

- **容器**：max-width 1180px 居中，响应式
- **结构**：`.web-scroll-container` > `.web-scroll-section` 逐区块堆叠
- **翻页**：自然滚动，无分页逻辑
- **区块类型**：`.hero`（首屏大标题）、普通 section、`.cta`（行动号召）

### 7.3 版式对比总结

| 版式 | ID | 容器 | 翻页方式 | 适用场景 |
|------|-----|------|---------|---------|
| A4 横版分页 | `a4-landscape` | 297mm×210mm 固定 | CSS page-break-after | 正式报告、监管报送、印刷输出 |
| PPT Slide 翻页 | `ppt-slide` | 100vw×100vh 固定 | JS 显隐切换 + 按钮/键盘翻页 | 演示汇报 |
| 自由滚动网页 | `web-scroll` | max-w-[1180px] 响应式 | 自然滚动 | 网页展示、对外宣传 |

---

## 八、风格预览规范（styles/）

每种风格一个独立预览页，展示该风格在实际组件上的渲染效果：

```
styles/business-blue/
└── preview.html        # 用 kpi-card + info-card + data-table 展示风格效果
```

---

## 九、总览画廊页（gallery.html）— ✅ 已实现

### 9.1 页面架构

Vue 3（CDN）单页应用，左右两栏布局：

```
┌──────────────────┬──────────────────────────────────────────────┐
│  左侧菜单栏       │           右侧内容区                          │
│  (w-260px,固定)   │                                              │
│                  │   KPI 数字卡片              [商务蓝白 ▾]      │
│  UI Library      │   ──────────────────────────────────         │
│  ────────────    │                                              │
│                  │   ┌─ 实时预览 ────────────────────────────┐  │
│  📐 设计规范      │   │  v-html 内联渲染，共享 data-theme      │  │
│    Design Token  │   │  切换风格即时变色                       │  │
│                  │   └──────────────────────────────────────┘  │
│  🧩 基础组件(11)  │                                              │
│    KPI数字卡片 ◀  │   ┌─ 说明 + Props 表 ────────────────────┐  │
│    信息卡片       │   │  数据接口、meta信息、描述文本          │  │
│    数据表格       │   └──────────────────────────────────────┘  │
│    ...           │                                              │
│                  │   ┌─ 代码展示 ────────────────────────────┐  │
│  📊 图表(3)      │   │  Prism.js 语法高亮                     │  │
│    柱状图        │   │  [复制代码] [全屏预览]                  │  │
│    折线图        │   └──────────────────────────────────────┘  │
│    饼图          │                                              │
│                  │                                              │
│  📄 版式(3)      │                                              │
│    A4横版分页    │                                              │
│    PPT翻页       │                                              │
│    自由滚动网页   │                                              │
│                  │                                              │
│  🎨 风格(3)      │                                              │
│    商务蓝白      │                                              │
│    暗黑科技      │                                              │
│    清新简约      │                                              │
│                  │                                              │
│  📋 完整案例(3)   │                                              │
│    A4横版报告    │                                              │
│    PPT演示文稿   │                                              │
│    Web落地页     │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### 9.2 核心特性

#### 全内联渲染，零 iframe

所有预览（组件、图表、版式、风格、Token、案例）均通过 `v-html` 内联到 gallery.html 中，与父页面共享同一个 `<html data-theme="xxx">`。切换风格时所有预览区**即时变色**，无需跨 frame 通信。

| 预览对象 | 渲染方式 |
|---------|---------|
| **基础组件** | `v-html` 直接注入 FALLBACKS HTML |
| **图表** | `v-html` 注入 HTML 容器 → `$nextTick` 中 `echarts.init()` + `getComputedStyle()` 读取当前主题色 |
| **版式** | `v-html` 注入 `.layout-preview-box`，CSS 将 A4 缩放到 ~70%、PPT 多页堆叠 |
| **风格** | `buildStylePreview()` 生成色块 + 4个代表性组件示例 |
| **Token** | `buildTokenPreview()` 生成色块矩阵、字体阶梯、间距标尺、圆角/阴影展示 |
| **案例** | `v-html` 注入完整模板 HTML，或 fetch 失败时 `buildCaseFallbackHTML()` 生成摘要卡 |

#### FALLBACKS 机制

gallery.html 内置约 20KB 的 `FALLBACKS` 对象，包含全部 17 个条目（11 组件 + 3 版式 + 3 图表）的完整 HTML。加载策略为 **fetch 优先，失败用 fallback**：

```javascript
// 选择组件/版式时
fetch('components/kpi-card/template.html')
  .then(r => r.text())
  .then(html => this.currentCode = html)
  .catch(() => this.currentCode = FALLBACKS['kpi-card']);
```

这确保了在 `file://` 协议下（Chrome/Edge 禁止跨目录 fetch）仍可正常使用。FALLBACKS 中的版式内容使用占位符数据（`[报告标题]`、`[数值]` 等），框架完整。

### 9.3 右侧菜单分类（6大类）

按侧边栏从上到下顺序：

| 分类 | id | 条目数 | 类型 | 说明 |
|------|-----|-------|------|------|
| 设计规范 | `tokens` | 1 | `token` | CSS 变量可视化 |
| 基础组件 | `components` | 11 | `component` | 含 Props 表 + 代码展示 |
| 图表 | `charts` | 3 | `chart` | ECharts 内联渲染 |
| 版式 | `layouts` | 3 | `layout` | 含 meta 信息（容器/翻页/场景） |
| 风格 | `styles` | 3 | `style` | 切换后即时更新所有预览 |
| 完整案例 | `cases` | 3 | `case` | 完整报告模板（详见第十二节） |

### 9.4 顶部栏按钮

| 按钮 | 条件 | 行为 |
|------|------|------|
| **复制组件信息** | 有选中项 | 复制结构化元数据（ID、路径、Props、描述），不是 HTML 代码 |
| **全屏预览** | 有 previewPath | 新标签页打开独立 index.html |

"复制组件信息"的输出格式（以 kpi-card 为例）：

```
📦 组件: KPI 数字卡片
🆔 ID: kpi-card
📂 路径: ui-lib/components/kpi-card/
📄 文件: template.html, component.js, component.css
🔧 Props:
  - label (String, 默认 "") — 标签文本
  - value (Number) — 指标数值
  - unit (String, 默认 "%") — 数值单位
  - trend (String, 默认 "") — 趋势标签
📝 描述: 大数字 + 趋势标签 + 说明文字
🔗 预览: components/kpi-card/index.html
```

不同 item.type 自动适配输出格式（component/chart/layout/style/token/case）。案例类型额外输出主题、版式、全部组件清单。

### 9.5 代码展示区

仅 component 和 layout 类型显示代码区（`template.html` 或 `skeleton.html`），使用 Prism.js 语法高亮。底部保留"复制代码"按钮用于复制原始 HTML。

### 9.6 切换风格

右上角 `<select>` 切换 `data-theme` 属性。`onThemeChange()` 方法：
- 风格/Token 预览 → `$nextTick` 中重建预览 HTML
- 图表 → dispose 旧实例 + `$nextTick` 中重新 `echarts.init()` 读取新主题色
- 其余类型 → CSS 变量自动响应，无需额外处理

---

## 十、报告生成工具（report-tool.html）— 待开发

### 10.1 工具定位

report-tool.html 是一个**提示词编排器**，不是代码生成器。它帮助用户：
1. 明确本次报告的需求（主题、版式、风格、内容结构）
2. 编排多轮渐进式提示词（骨架→逐页填充→精细修改）
3. 每次生成的提示词控制在 ~500 字，避免 AI 输出卡壳

### 10.2 组件选择与预览

用户在工具中选择组件时，需看到真实渲染效果。参考 gallery.html 已实现的方案：

- **基础组件/版式/案例**：v-html 内联（共享 data-theme，切换即时变色）
- **图表**：v-html 容器 + ECharts init（gallery.html 已验证可行）
- **file:// 兼容**：内置 FALLBACKS（gallery.html 已有完整实现可复用）

### 10.3 file:// 下组件内容的加载策略

采用 **硬编码 fallback + fetch 增强** 策略，与 gallery.html 一致。gallery.html 中已有的 `FALLBACKS` 对象和 `componentProps` 注册表（约 25KB）可直接复用到 report-tool。

### 10.4 用户操作流程

以制作一份 "货币基金月度估值分析" PPT报告为例。

#### 前置：浏览组件库

用户双击 `gallery.html` → 左侧菜单浏览组件/图表/版式 → 点击"复制组件信息"获取组件元数据 → 心里有数了 → 打开 `report-tool.html`。

#### 第一轮：生成报告骨架

**Step 1 — 报告基本信息**：主题、受众、用途、文件名

**Step 2 — 选择版式**：3张版式卡片（A4横版 / PPT翻页 / 自由滚动），点击选中

**Step 3 — 选择风格**：商务蓝白 / 暗黑科技 / 清新简约，切换时预览区组件即时变色

**Step 4 — 内容大纲**：口语化描述每节内容，可添加/删除节

点击「生成骨架提示词」→ 提示词 ~500字 → 复制 → 粘贴到 Claude → AI 生成骨架。

#### 第二轮起：逐节填充内容 + 精细修改

与原有设计一致（见下方提示词模板）。

### 10.5 提示词模板

**骨架提示词模板（~500字）：**

```
你是一个金融报告HTML生成专家。请基于以下要求生成报告骨架。

【版式约束】
请参照 {skeletonPath} 的页面结构，严格使用其容器尺寸、分页逻辑和打印样式。

【风格约束】
请使用 {tokensPath} 中 {styleName} 的 CSS 变量值。所有颜色使用 var(--color-xxx) 引用。

【报告信息】
- 主题：{topic}
- 受众：{audience}
- 用途：{purpose}
- 内容结构：{outline}

【生成要求】
1. 用占位数据生成报告骨架，每页/每区块标记 [待填充]
2. 保持所有 CSS 变量引用（var(--color-xxx)），不要替换为具体色值
3. 给每个页面容器添加 data-page="{n}" 属性
4. 将HTML保存到 reports/{fileName}_v001.html
5. 只输出HTML代码，不要解释
```

**内容填充提示词模板（~400字）：**

```
请基于 reports/{fileName}_v{version}.html 继续修改。

【当前任务】
填充第 {pageNum} 页（data-page="{pageNum}"），内容概要：{outline}

【组件参考】
请严格参照以下组件的 HTML 结构和 CSS 变量风格：
{逐个列出选中的组件名和 refPath}

【数据】
{数据来源说明}

【要求】
1. 保持原有其他页面内容不变，只修改/填充当前页
2. 严格参照组件模板的 data-cid、Tailwind 类名布局、CSS 变量风格
3. 不确定的数据用占位符 [XX] 标记
4. 保存为 reports/{fileName}_v{nextVersion}.html
5. 只输出完整HTML，不要解释
```

**精细修改提示词模板（~300字）：**

```
请基于 reports/{fileName}_v{version}.html 做以下修改：

【修改要求】
{用户的自然语言修改意见}

【要求】
1. 只修改指定内容，保持其他部分不变
2. 保持所有 CSS 变量引用和 data-cid 属性
3. 保存为 reports/{fileName}_v{nextVersion}.html
4. 只输出完整HTML，不要解释
```

### 10.6 页面结构总览

report-tool.html 包含以下功能区：

1. **报告基本信息区**：主题、受众、用途、文件名
2. **版式 & 风格选择区**：版式用 iframe 卡片三选一，风格用色块三选一 + 下方组件实时变色预览
3. **内容结构配置区**：根据版式动态切换（逐页/逐节/逐区块），每项填内容大纲 + 选组件 + 选数据
4. **提示词生成区**：可编辑的 textarea + 当前轮次指示 + 一键复制
5. **精细修改区**：独立 Tab，自然语言输入修改意见
6. **配置管理区**：保存当前配置 / 加载已有配置（详见第十一节）
7. **使用指引**：首次使用的新手引导（一句话即可）

---

## 十一、配置保存与加载

### 11.1 功能说明

用户在 report-tool.html 中完成的所有选择（版式、风格、内容结构、组件勾选、数据源配置）可保存为一个 JSON 配置文件。下次打开工具时加载配置文件，瞬间恢复全部表单状态。

### 11.2 保存配置

用户点击「💾 保存当前配置」→ 浏览器触发 JSON 文件下载：

```javascript
function saveConfig() {
  const config = {
    name: state.reportFileName || '未命名模板',
    version: '1.0',
    createdAt: new Date().toISOString(),
    
    report: {
      fileName: state.reportFileName,
      topic: state.reportTopic,
      audience: state.audience,
      purpose: state.purpose
    },
    
    layout: {
      id: state.selectedLayoutId,
      name: getLayoutName(state.selectedLayoutId)
    },
    
    style: {
      id: state.selectedStyleId,
      name: getStyleName(state.selectedStyleId)
    },
    
    pages: state.pages.map(p => ({
      index: p.index,
      type: p.type,
      name: p.name,
      outline: p.outline,
      slideHint: p.slideCountHint || null,
      components: p.componentIds.map(cid => ({
        id: cid,
        count: p.componentCounts[cid] || 1
      }))
    })),
    
    dataSources: {
      global: state.globalDataSource
        ? { type: state.globalDataSource.type, fileName: state.globalDataSource.fileName }
        : null
    }
  };
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.reportFileName}_配置_${formatDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

下载文件名示例：`货币基金月度报告_配置_2026-05-20.json`

### 11.3 加载配置

用户点击「📂 加载已有配置」→ 浏览器弹出文件选择器 → 选择 JSON → 表单恢复：

```javascript
function loadConfig(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result);
      
      // 验证配置结构完整性
      if (!validateConfig(config)) {
        alert('配置文件格式不正确或版本不兼容');
        return;
      }
      
      // 恢复表单状态
      state.reportFileName = config.report.fileName;
      state.reportTopic = config.report.topic;
      state.audience = config.report.audience;
      state.purpose = config.report.purpose;
      state.selectedLayoutId = config.layout.id;
      state.selectedStyleId = config.style.id;
      
      // 恢复内容结构
      state.pages = config.pages.map(p => ({
        ...p,
        componentIds: p.components.map(c => c.id),
        componentCounts: Object.fromEntries(p.components.map(c => [c.id, c.count]))
      }));
      
      // 切换风格 → 预览区即时变色
      document.documentElement.setAttribute('data-theme', config.style.id);
      
      showToast(`配置已加载：${config.name}`);
    } catch (err) {
      alert('配置文件解析失败: ' + err.message);
    }
  };
  reader.readAsText(file);
}
```

### 11.4 配置 JSON 格式示例

```json
{
  "name": "货币基金月度报告模板",
  "version": "1.0",
  "createdAt": "2026-05-20T14:30:00+08:00",
  
  "report": {
    "fileName": "货币基金月度估值分析",
    "topic": "面向管理人的货币基金月度收益归因分析",
    "audience": "client",
    "purpose": "deliverable"
  },
  
  "layout": { "id": "ppt-slide", "name": "PPT Slide 翻页" },
  "style": { "id": "business-blue", "name": "商务蓝白" },
  
  "pages": [
    {
      "index": 1, "type": "section", "name": "封面",
      "outline": "报告标题、团队信息和日期",
      "slideHint": null,
      "components": [{ "id": "info-card", "count": 1 }]
    },
    {
      "index": 2, "type": "section", "name": "核心指标概览",
      "outline": "展示三只基金的七日年化、万份收益、近一月回报",
      "slideHint": "2-3页",
      "components": [
        { "id": "kpi-card", "count": 3 },
        { "id": "data-table", "count": 1 }
      ]
    },
    {
      "index": 3, "type": "section", "name": "收益走势分析",
      "outline": "近三年收益率走势对比及归因分析",
      "slideHint": "3-5页",
      "components": [
        { "id": "line-chart", "count": 1 },
        { "id": "compare-card", "count": 1 }
      ]
    },
    {
      "index": 4, "type": "section", "name": "总结与展望",
      "outline": "核心结论和风险提示",
      "slideHint": "1-2页",
      "components": [
        { "id": "highlight-quote", "count": 1 },
        { "id": "big-number-row", "count": 1 }
      ]
    }
  ],
  
  "dataSources": {
    "global": { "type": "csv", "fileName": "returns_may.csv" }
  }
}
```

### 11.5 配置的使用场景

| 场景 | 用法 |
|------|------|
| 重复报告 | 每月做一次货币基金报告，加载上月配置，改数据 → 直接生成提示词 |
| 团队共享 | 小王做了一套 "估值方法论培训" 的配置，导出 JSON 发给小李，小李加载即用 |
| 模板沉淀 | 团队常用的 5-6 种报告类型，各自形成配置模板，新同事上手第一天就能用 |
| 快速切换 | 同一份报告想对比两种版式效果 → 加载配置 → 切换版式 → 重新生成骨架提示词 |

---

## 十二、完整案例模板（template/）— ✅ 已实现

### 12.1 概述

`ui-lib/template/` 目录包含 3 个完整的报告模板，**假设由组件库生成**，展示组件库的实际输出效果。三者共用同一套组件库（design tokens + layouts + components），分别适配三种版式。

所有模板均：
- 通过 `<link rel="stylesheet" href="../design-tokens/tokens.css">` 引用设计规范
- 使用对应版式的 `layout.css`（A4/PPT）
- 引入 Tailwind CDN 做布局
- 包含 3 主题切换器（商务蓝白 / 暗黑科技 / 清新简约），通过修改 `data-theme` 切换
- 使用 `var(--color-xxx)` 引用颜色，**零硬编码色值**
- 使用组件库的 HTML 模式（data-cid 标记、一致的 CSS 类名结构）
- 内容为专业金融场景 demo 数据（数值看起来真实但明确是示例数据）

### 12.2 三个案例

| 文件 | 行数 | 版式 | 主题(默认) | 内容结构 |
|------|------|------|-----------|---------|
| `A4.html` | 472 | a4-landscape | business-blue | 4页：封面(标题+KPI卡片) → 核心指标(data-table+big-number-row) → 分析流程(process-step+info-card+quote) → 总结(timeline+quote) |
| `ppt.html` | 527 | ppt-slide | business-blue | 7页：封面 → 议程(4宫格) → 核心概念(kpi-card) → 政策框架(process-step) → 数据对比(compare-card+info-card) → 团队(team-grid) → 总结 |
| `web.html` | 567 | web-scroll | business-blue | 滚动长页：Sticky导航 → Hero(标题+CTA+大数字行) → 核心指标(big-number-row) → 服务流程(process-step) → 数据对比(data-table) → 团队(team-grid) → 客户评价(highlight-quote×2) → CTA |

### 12.3 各模板使用的组件

| 组件 | A4.html | ppt.html | web.html |
|------|---------|----------|----------|
| `section-header` | ✓ | ✓ | ✓ |
| `kpi-card` | ✓ | ✓ | — |
| `big-number-row` | ✓ | — | ✓ |
| `data-table` | ✓ | ✓ | ✓ |
| `process-step` | ✓ | ✓ | ✓ |
| `info-card` | ✓ | ✓ | — |
| `highlight-quote` | ✓ | ✓ | ✓ |
| `compare-card` | — | ✓ | — |
| `team-grid` | — | ✓ | ✓ |
| `timeline` | ✓ | — | — |
| `divider` | ✓ | — | — |

### 12.4 gallery.html 中的案例入口

侧边栏「完整案例」分类（3 个条目）：

- **A4 横版报告**（case-a4）：内联预览完整 4 页模板，一键复制案例信息（主题 + 版式 + 全部组件清单），全屏预览跳转独立页面
- **PPT 演示文稿**（case-ppt）：同上
- **Web 落地页**（case-web）：同上

选中案例时自动切换至推荐主题（`selectItem` 中设置 `data-theme`），预览区展示完整模板内容。fetch 失败时 `buildCaseFallbackHTML()` 生成结构化摘要卡片（主题 + 版式 + 组件列表）。

### 12.5 案例信息复制格式

点击"复制组件信息"时，案例类型的输出格式：

```
📋 案例: A4 横版报告
🎨 推荐主题: business-blue (商务蓝白)
📐 使用版式: a4-landscape (A4 横版分页 · 297mm×210mm · CSS page-break-after)
📝 描述: 货币基金月度收益归因分析 · A4横版4页完整报告
🧩 使用组件:
  - section-header — 页面分节标题 + 装饰线
  - kpi-card — 大数字 + 趋势标签 + 说明文字
  - big-number-row — 一行多个并列指标横向排列
  - data-table — 蓝色表头 + 斑马纹行
  - process-step — 带编号的步骤列表
  - info-card — 标题 + 正文描述
  - highlight-quote — 引用金句/关键结论
  - divider — 内容分隔线
📂 完整文件: ui-lib/template/A4.html
🔗 在线预览: template/A4.html
```

用户复制此信息给 Claude，附上"请参考以上组件库信息，按 A4 横版报告风格生成一份 XX 报告" 的提示词，即可让 AI 基于组件库规范生成报告。

---

## 十三、Design Token 预览页（design-tokens/preview.html）— ✅ 已实现

独立页面，展示所有 Design Token 的可视化效果：

- **色彩系统**：所有颜色变量的色块矩阵（primary, bg, text, accent, border 等），按主题分列
- **字体排版**：从 `--text-xs` 到 `--text-3xl` 的字体阶梯，中文段落排版示例
- **间距系统**：`--space-xs` 到 `--space-xl` 的标尺可视化
- **圆角 & 阴影**：卡片圆角对比、阴影层级展示

顶部有主题切换 Tab（商务蓝白 / 暗黑科技 / 清新简约），切换后所有色块和示例即时更新。

---

## 十四、工具如何调用组件库

三种消费方式，按场景选择。工具中组件预览的具体实现见 10.2 节。

### 方式A：AI 提示词引用（报告工具主要方式）

提示词中写组件路径，由 Claude Desktop 端读取：
```
请参照 ui-lib/components/kpi-card/template.html 的 HTML 结构和代码风格
```

### 方式B：iframe 嵌入（版式预览 & 全屏预览）

```html
<iframe src="../ui-lib/components/kpi-card/index.html"></iframe>
```

适用场景：版式骨架预览（需要展示页面轮廓）、组件的全屏独立预览（新标签页打开 `index.html`）。

### 方式C：Vue 组件引用（BI系统等需要编程能力的工具）

```javascript
// 在需要构建环境的工具中
import KpiCard from '../ui-lib/components/kpi-card/component.js';
```

### 预览方式选型总结

gallery.html 已全面采用**零 iframe 方案**，所有预览均通过 v-html 内联：

| 预览对象 | 方式 | 原因 |
|---------|------|------|
| 基础组件 | v-html 内联 FALLBACKS HTML | 与父页面共享 data-theme，风格切换即时变色 |
| 图表组件 | v-html 容器 + `$nextTick` 中 `echarts.init()` | 容器通过 v-html 注入，脚本在 Vue 生命周期中执行，读取当前主题 CSS 变量 |
| 版式骨架 | v-html 注入 `.layout-preview-box`（CSS 缩放到 ~70%） | A4 版式缩小显示、PPT 多页堆叠展示 |
| 风格预览 | JS 动态生成色块 + 组件示例 HTML | `buildStylePreview()` 读取 `getComputedStyle()` 提取当前主题色值 |
| Token 预览 | JS 动态生成色块矩阵/字体阶梯/间距标尺 | `buildTokenPreview()` 读取所有 CSS 变量值并可视化 |
| 完整案例 | v-html 注入完整模板 HTML | fetch 优先，失败时 `buildCaseFallbackHTML()` 生成摘要卡 |

---

## 十五、实施计划

### ✅ Phase 1：骨架与范例（已完成）

| 产出 | 状态 |
|------|------|
| `ui-lib/design-tokens/tokens.css` | ✅ 3 套风格完整定义 |
| `ui-lib/design-tokens/preview.html` | ✅ Token 可视化预览页 |
| `ui-lib/components/kpi-card/` | ✅ 完整组件（3个文件） |
| `ui-lib/components/info-card/` | ✅ 完整组件，验证模板可复用性 |
| `ui-lib/COMPONENT_SPEC.md` | ✅ 组件开发规范文档 |

### ✅ Phase 2：组件铺量（已完成）

迁移 v2 的 8 个组件 + 新增 timeline / section-header / divider 共 **11 个组件**。每个组件按规范完成 index.html + template.html + component.js。

### ✅ Phase 3：图表 + 版式 + 风格（已完成）

- ✅ 3 个图表组件（bar-chart / line-chart / pie-chart）
- ✅ 3 套版式骨架（a4-landscape / ppt-slide / web-scroll）
- ✅ 3 套风格预览页

### ✅ Phase 4：总览页 + 完整案例（已完成）

- ✅ `gallery.html` — Vue 3 驱动，全内联渲染（零 iframe），6 大类目，17 条目
- ✅ `template/A4.html`、`template/ppt.html`、`template/web.html` — 3 个完整案例模板
- ✅ 侧边栏「完整案例」分类
- ✅ 「复制组件信息」功能（所有类型自适应）

### ⏳ Phase 5：报告生成工具（待开发）

- `report-tool.html` 报告生成工具（多轮提示词编排）
- 复用 gallery.html 的 FALLBACKS 和组件注册表

---

## 十六、与 v2 的关键区别

| 维度 | v2 | v3 |
|------|-----|-----|
| 组件形态 | JS 字符串 `htmlSnippet` | 独立 HTML 文件，可双击预览 |
| 组件数量 | 8 个 | 11 组件 + 3 图表 + 3 版式 + 3 风格 + 3 案例 = 23 项 |
| 组件预览 | 画廊页 CSS 骨架 | **全内联 v-html 渲染**，零 iframe，切换风格即时变色 |
| 图表 | 无，靠 AI 临时写 | ECharts 内联渲染，读取 CSS 变量做主题色 |
| 版式 | 无 | 3 套骨架（A4/PPT/Web），含占位符 index.html + skeleton.html + layout.css |
| 完整案例 | 无 | 3 个完整模板（A4/PPT/Web），展示组件库生成的最终效果 |
| 组件信息复制 | 无 | **一键复制结构化元数据**（ID、路径、Props），减少提示词量 |
| 跨工具复用 | 不可能（耦合在工具内） | 相对路径引用 `../ui-lib/` |
| 设计规范 | 散落在各组件 JS 里 | 集中在 `design-tokens/tokens.css` |
| 主题切换 | 不支持运行时切换 | `data-theme` 属性秒切，3 套风格 |
| 服务端 | Python server.py | **零服务端，纯静态 HTML** |
| 提示词 | 一次性大提示词（易卡壳） | 多轮渐进提示词（每次 ~500字） |
| AI 参考 | 组件代码嵌入提示词 | 复制组件信息 → 粘贴给 AI → AI 自行读取组件文件 |
| 工具数量 | 1 个 | 3 个（报告 + 标书 + BI），共享组件库 |
| file:// 兼容 | 需要 Python server | **FALLBACKS 硬编码 + fetch 增强**，Chrome/Edge/Safari 均可双击打开 |

---

## 十七、后续扩展预留

1. **更多组件** — 按 5.6 节步骤三步新增，互不干扰
2. **更多风格** — 在 tokens.css 加一个 `[data-theme="xxx"]` 块即完成
3. **更多版式** — 新建 layouts/xxx/ 目录，提供 skeleton.html
4. **标书工具** — bid-tool.html 引用同一套 ui-lib，增加标书特有组件
5. **BI 仪表盘** — bi-dashboard.html 用 Vue 组件引用方式（方式C）深度使用 ECharts 图表
6. **Vue 组件映射** — component.js 已预留，支持从 AI HTML 重写为正式 Vue 项目
7. **构建工具迁移** — 如需 TypeScript/Vite，只需在 component.js 层面升级，template.html 和 index.html 保持不变
