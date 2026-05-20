# UI Library + 报告生成工具 — 功能总指令（v3）

## 一、产品定位

v3 在 v2 的基础上做一次架构升级，核心理念是**组件库与工具分离**：

- **ui-lib/** — 独立的前端组件库，包含基础组件、图表、版式骨架、风格主题、Design Token 规范。每个组件/图表/版式都是独立的 HTML 文件，可双击打开预览，也可通过相对路径被各工具引用。定位类似市面开源组件库（Ant Design、shadcn/ui）的团队内部版本。
- **report-tool/** — 报告生成工具，是一个纯静态 HTML 文件（双击即用），专注于多轮渐进式提示词编排。不内嵌组件代码，只维护轻量的组件注册表（元数据 + 路径引用）。
- **bid-tool/**、**bi-system/** — 后续工具，同样通过相对路径引用 ui-lib/，共享同一套组件和设计规范。

**核心原则：**
1. **零服务端、零安装** — 所有 HTML 文件双击即开，不需要 Python、Node.js、npm install
2. **组件库是基础设施** — 独立于任何工具，跨工具共享
3. **多轮渐进生成** — 提示词分步输出（骨架→逐页填充→精细修改），每次 ~500 字，避免 AI 卡壳
4. **CSS 变量做换肤** — 风格切换是运行时行为，不依赖构建工具

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
│   ├── gallery.html                 # 总览浏览页（左右两栏布局）
│   ├── COMPONENT_SPEC.md            # 组件开发规范（命名、文件结构、必须元素）
│   │
│   ├── design-tokens/
│   │   ├── tokens.css               # CSS 自定义属性（3套风格主题定义）
│   │   └── preview.html             # Token 可视化预览页（色块、字体、间距展示）
│   │
│   ├── components/                  # 基础组件
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
│   │   ├── timeline/                # v3 新增
│   │   ├── section-header/          # v3 新增：页面章节标题
│   │   └── divider/                 # v3 新增：分割线
│   │
│   ├── charts/                      # 图表组件（ECharts 封装）
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
│   ├── layouts/                     # 版式骨架（结构不同于组件，无 component.js）
│   │   ├── a4-landscape/
│   │   │   ├── index.html           # 独立预览：用示例内容渲染完整A4报告
│   │   │   ├── skeleton.html        # ★ 核心：页面骨架模板（AI 填空用）
│   │   │   └── layout.css           # 版式专属 CSS（@page、尺寸、分页）
│   │   ├── ppt-slide/
│   │   │   ├── index.html
│   │   │   ├── skeleton.html
│   │   │   └── layout.css
│   │   └── web-scroll/
│   │       ├── index.html
│   │       ├── skeleton.html
│   │       └── layout.css
│   │
│   └── styles/                      # 风格预览（实际 Token 定义在 design-tokens/tokens.css）
│       ├── business-blue/
│       │   └── preview.html         # 该风格的独立预览页
│       ├── dark-tech/
│       │   └── preview.html
│       └── fresh-clean/
│           └── preview.html
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

工具不需要动态 fetch 组件文件。工具内置一份轻量的**组件注册表**（约 2KB），包含每个组件的：
- id、名称、分类、描述
- AI 参考路径（如 `../ui-lib/components/kpi-card/template.html`）
- 数据绑定提示

提示词中引用路径，由 Claude Desktop 端自行读取组件模板文件。

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

### 5.5 第一批组件清单（12个）

| 分类 | 组件ID | 名称 | 说明 |
|------|--------|------|------|
| 数据展示 | `kpi-card` | KPI 数字卡片 | 大数字 + 趋势标签 + 说明文字 |
| 数据展示 | `big-number-row` | 大数字行 | 一行多个并列指标 |
| 数据展示 | `data-table` | 数据表格 | 蓝色表头 + 斑马纹行 |
| 内容展示 | `info-card` | 信息卡片 | 标题 + 正文描述 |
| 内容展示 | `highlight-quote` | 亮点引用 | 引用金句/关键结论 |
| 内容展示 | `team-grid` | 团队介绍网格 | 头像 + 角色卡片 |
| 流程展示 | `process-step` | 流程步骤条 | 带编号的步骤列表 |
| 流程展示 | `timeline` | 时间轴 | 纵向时间线（v3新增） |
| 对比分析 | `compare-card` | 对比卡片 | 左右双栏对比 |
| 装饰布局 | `section-header` | 章节标题 | 页面分节标题（v3新增） |
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

| 图表 | 适用场景 |
|------|---------|
| `bar-chart` | 分类对比、排名 |
| `line-chart` | 趋势变化、时间序列 |
| `pie-chart` | 占比分布、构成分析 |

---

## 七、版式规范（layouts/）

### 7.1 版式与组件的结构差异

版式是**容器骨架**，不是内容积木。因此结构不同于组件：

```
layouts/a4-landscape/
├── index.html          # 独立预览：用示例内容渲染完整报告
├── skeleton.html       # ★ 核心：页面骨架模板（AI 在此结构内填充内容）
└── layout.css          # 版式专属样式（@page、容器尺寸、分页逻辑）
```

**没有 `component.js`** — 版式不是交互组件，是静态 HTML 结构 + CSS 规则。

### 7.2 skeleton.html 规范

这是版式库的灵魂——给 AI 看的空壳模板。AI 在此结构内填入具体内容。

**A4 横版分页 skeleton.html：**

```html
<!-- @page { size: A4 landscape; margin: 0; } -->
<section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg relative page-break-after-always">
  <div class="content-area px-[22mm] py-[18mm]">
    <!-- ===== 第 {{page_num}} 页内容区 ===== -->
    <!-- AI 在此填充组件 -->
  </div>
  <footer class="absolute bottom-[8mm] right-[22mm] text-sm" style="color:var(--color-text-muted)">
    第 {{page_num}} 页
  </footer>
</section>
```

### 7.3 三种版式对比

| 版式 | ID | 容器行为 | 翻页方式 | AI 内容组织 |
|------|-----|---------|---------|------------|
| A4 横版分页 | `a4-landscape` | 297mm×210mm 固定 | CSS page-break-after | 逐页定义，每页一张纸 |
| PPT Slide 翻页 | `ppt-slide` | 100vw×100vh 固定 | JS 显隐切换，键盘/点击翻页 | 逐节定义，AI 决定拆几页 |
| 自由滚动网页 | `web-scroll` | max-w-[1180px] 响应式 | 自然滚动 | 逐区块定义（Hero/特色/案例/CTA） |

### 7.4 layout.css 内容

每个版式的 `layout.css` 包含：
- 打印样式（`@page` 规则，仅 A4 版式）
- 容器尺寸和定位
- 分页/翻页逻辑所需的基础样式

---

## 八、风格预览规范（styles/）

每种风格一个独立预览页，展示该风格在实际组件上的渲染效果：

```
styles/business-blue/
└── preview.html        # 用 kpi-card + info-card + data-table 展示风格效果
```

---

## 九、总览画廊页（gallery.html）

### 9.1 页面布局

```
┌──────────────────┬──────────────────────────────────────────────┐
│  左侧菜单栏       │           右侧内容区                          │
│  (w-64, 固定)    │                                              │
│                  │   ┌──────────────────────────────────────┐  │
│  UI Library      │   │  KPI 数字卡片              [商务蓝白 ▾]│  │
│  ────────────    │   │  ──────────────────────────────────  │  │
│                  │   │                                       │  │
│  📐 设计规范      │   │  ┌─────────────────────────────────┐ │  │
│    · 色彩系统     │   │  │  实时预览区                      │ │  │
│    · 字体排版     │   │  │  ┌───────────────────────────┐  │ │  │
│    · 间距圆角     │   │  │  │ 环比 +12.5%               │  │ │  │
│                  │   │  │  │    3.28%                  │  │ │  │
│  🧩 基础组件      │   │  │  │ 七日年化收益率              │  │ │  │
│    · KPI卡片 ◀   │   │  │  └───────────────────────────┘  │ │  │
│    · 信息卡片     │   │  │  切换风格后立即变色              │ │  │
│    · 数据表格     │   │  └─────────────────────────────────┘ │  │
│    · 流程步骤     │   │                                       │  │
│    · 对比卡片     │   │  ┌─ HTML 代码 ─────────────────────┐ │  │
│    · 团队网格     │   │  │ <div data-cid="kpi-card" ...>   │ │  │
│    · 亮点引用     │   │  │   ...                            │ │  │
│    · 大数字行     │   │  └──────────────────────────────────┘ │  │
│    · 时间轴       │   │                                       │  │
│    · 章节标题     │   │  [复制 HTML] [复制 Vue] [全屏预览]    │  │
│    · 分割线       │   └──────────────────────────────────────┘  │
│                  │                                              │
│  📊 图表          │                                              │
│    · 柱状图       │                                              │
│    · 折线图       │                                              │
│    · 饼图         │                                              │
│                  │                                              │
│  📄 版式          │                                              │
│    · A4横版       │                                              │
│    · PPT翻页      │                                              │
│    · 自由滚动      │                                              │
│                  │                                              │
│  🎨 风格          │                                              │
│    · 商务蓝白     │                                              │
│    · 暗黑科技     │                                              │
│    · 清新简约     │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### 9.2 交互设计

- **左侧菜单**：一级分类（设计规范/基础组件/图表/版式/风格）可折叠展开。点击二级项 → 右侧内容区切换到对应项目
- **右上角风格切换**：下拉选择器，切换 `<html data-theme="xxx">`，所有预览区即时变色
- **右侧预览区**：内联渲染组件的 template.html 内容。显示的 = 实际效果
- **代码展示**：`<pre><code>` + Prism.js 语法高亮
- **全屏预览**：新标签页打开组件的独立 `index.html`
- **默认状态**：打开 gallery.html 时，默认选中第一个基础组件（kpi-card），风格默认为商务蓝白

### 9.3 实现方式

gallery.html 使用 Vue 3（CDN）管理左侧菜单和右侧内容切换。每个组件的预览通过 `v-html` 渲染其 template.html 片段。风格切换通过修改 `<html>` 的 `data-theme` 属性实现，CSS 变量自动响应。

---

## 十、报告生成工具（report-tool.html）

### 10.1 工具定位

report-tool.html 是一个**提示词编排器**，不是代码生成器。它帮助用户：
1. 明确本次报告的需求（主题、版式、风格、内容结构）
2. 编排多轮渐进式提示词（骨架→逐页填充→精细修改）
3. 每次生成的提示词控制在 ~500 字，避免 AI 输出卡壳

### 10.2 组件预览机制

工具在选择区展示组件时，需要让用户看到组件的**真实渲染效果**（不是灰色骨架），且切换风格后预览即时变色。

#### 基础组件预览：v-html 内联 template.html

基础组件（kpi-card、info-card、data-table 等）的 `template.html` 只包含 HTML + CSS 变量引用，无 JS 脚本。使用 `v-html` 内联到工具页面中：

```html
<!-- report-tool.html -->
<link rel="stylesheet" href="../ui-lib/design-tokens/tokens.css">

<div class="component-card" v-for="comp in filteredComponents" 
     @click="toggleComponent(comp.id)"
     :class="{ selected: isSelected(comp.id) }">
  
  <!-- v-html 渲染组件的 template.html，与父页面共享 data-theme -->
  <div class="preview-area" v-html="comp.templateContent"></div>
  
  <div class="card-footer">
    <input type="checkbox" :checked="isSelected(comp.id)">
    <span>{{ comp.name }}</span>
    <span class="count-badge" v-if="getCount(comp.id) > 1">×{{ getCount(comp.id) }}</span>
  </div>
</div>
```

**用 v-html 而不是 iframe 的原因**：v-html 渲染的内容与父页面共享同一个 `<html>` 的 `data-theme` 属性，用户切换风格时，选择区的所有组件预览**瞬间全部变色**，零延迟。如果用 iframe，需要 postMessage 传主题参数，有闪烁延迟。

#### 图表组件预览：静态截图 + 全屏预览入口

图表组件（bar-chart、line-chart 等）的 template.html 包含 ECharts 初始化脚本，v-html 不会执行 `<script>`。处理方式：

- 组件选择卡片显示一张**静态缩略截图**（预先截好的图表效果图）
- 卡片上有「查看完整效果」链接 → 在新标签页打开图表的 `index.html`（完整交互 Demo）

#### 版式预览：iframe 嵌入 skeleton.html

版式骨架需要展示页面轮廓（A4纸比例、翻页按钮等），适合 iframe 嵌入：

```html
<iframe src="../ui-lib/layouts/a4-landscape/index.html" 
        class="layout-preview-frame"
        style="width:100%; height:200px; pointer-events:none;">
</iframe>
```

`pointer-events:none` 禁用 iframe 内的点击交互，防止用户点到翻页按钮导致混乱。

### 10.3 file:// 下组件内容的加载策略

Chrome/Edge 在 `file://` 协议下禁止 `fetch` 跨目录读取文件。Safari 允许。

采用 **硬编码 fallback + fetch 增强** 策略：

```javascript
const COMPONENT_CATALOG = [
  {
    id: 'kpi-card',
    name: 'KPI 数字卡片',
    category: '数据展示',
    description: '展示核心指标数值，带趋势标签',
    refPath: '../ui-lib/components/kpi-card/template.html',
    dataHint: '需要：数值、单位、变化百分比',
    // 硬编码的 template 内容，fetch 失败时使用
    fallbackHTML: `<div data-cid="kpi-card" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6 flex flex-col gap-3">
  <span class="text-xs font-semibold px-3 py-1 rounded-full w-fit" style="color:var(--color-primary);background:var(--color-primary-light)">环比 +12.5%</span>
  <div class="text-5xl font-bold" style="color:var(--color-primary)">3.28<span class="text-lg font-normal" style="color:var(--color-text-muted)">%</span></div>
  <p class="text-sm" style="color:var(--color-text-muted)">七日年化收益率</p>
</div>`
  },
  // ... 其他组件（12个组件 × 平均15行HTML ≈ 总计~10KB，完全可接受）
];

// 初始化：优先 fetch，失败用 fallback
async function initCatalog() {
  for (const comp of COMPONENT_CATALOG) {
    try {
      const resp = await fetch(comp.refPath);
      if (resp.ok) {
        comp.templateContent = await resp.text();
        continue;
      }
    } catch (e) { /* 静默降级 */ }
    comp.templateContent = comp.fallbackHTML;
  }
}
```

**影响范围**：fallback 只影响工具页的组件预览。提示词里引用路径让 Claude Desktop 读取 `template.html` 的功能**不受任何影响**——那是 AI 端自己读文件，不经过浏览器的 fetch。

### 10.4 用户完整操作流程

以制作一份 "货币基金月度估值分析" PPT报告为例。

#### 前置：浏览组件库（3分钟）

用户双击 `gallery.html` → 左侧菜单浏览组件 → 看到 kpi-card 长什么样、data-table 长什么样 → 心里有数了 → 打开 `report-tool.html`。

#### 第一轮：生成报告骨架

**Step 1 — 报告基本信息：**

| 字段 | 示例值 |
|------|--------|
| 报告文件名 | 货币基金月度估值分析 |
| 报告主题 | 面向管理人的货币基金月度收益归因分析 |
| 受众 | ● 客户展示 |
| 用途 | ● 交付文档 |

**Step 2 — 选择版式（3张卡片，每张 iframe 嵌入版式 skeleton 缩略效果）：**

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ [A4横版预览]  │ │ [PPT翻页预览] │ │ [网页滚动预览] │
│   iframe     │ │   iframe     │ │   iframe     │
│              │ │              │ │              │
│ ○ A4横版分页 │ │ ● PPT Slide  │ │ ○ 自由滚动网页 │  ← 点击选中，蓝色边框高亮
└──────────────┘ └──────────────┘ └──────────────┘
        [去版式库看完整效果 →]
```

**Step 3 — 选择风格（切换时下方预览区组件即时变色）：**

```
● 商务蓝白  ○ 暗黑科技  ○ 清新简约

┌──────────────────────────────────────────────┐
│  该风格下组件的实际渲染效果（即时预览）          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ KPI卡片  │ │ 信息卡片 │ │ 数据表格 │  ...   │
│  │ (真实色) │ │ (真实色) │ │ (真实色)  │        │
│  └─────────┘ └─────────┘ └─────────┘        │
└──────────────────────────────────────────────┘
```

**Step 4 — 内容大纲：**

```
本次报告大致包含（口语化描述即可）：
┌──────────────────────────────────────────────┐
│ 第1节：封面（标题、团队、日期）                  │
│ 第2节：三大核心指标概览（收益率、规模、风险）      │
│ 第3节：收益率走势对比分析                        │
│ 第4节：持仓结构分析（按资产类别）                 │
│ 第5节：风险指标与总结                           │
└──────────────────────────────────────────────┘
[+ 添加一节]
```

点击「生成骨架提示词」→ 提示词 ~500字 → 复制 → Claude Desktop → AI 生成 `货币基金月度估值分析_v001.html`（空壳骨架，每页标记 [待填充]）。

用户双击 v001.html 查看：「骨架OK，翻页正常，颜色对。开始填内容。」

#### 第二轮起：逐节填充内容

进入「内容填充」Tab：

```
┌─────────────────────────────────────────────────────┐
│  内容填充 — 第 2 轮                                  │
│  当前报告：货币基金月度估值分析（v001 → v002）          │
│                                                     │
│  选择要填充的节：[第2节：核心指标概览 ▾]                 │
│                                                     │
│  本页内容概要（自然语言）：                             │
│  ┌─────────────────────────────────────────────┐    │
│  │ 展示三只货币基金的七日年化、万份收益、           │    │
│  │ 近一月回报率三个核心指标，每只基金一个卡片       │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  选择本页使用的组件（多选，v-html 真实渲染预览）：       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │  KPI卡片    │ │  数据表格   │ │  对比卡片    │      │
│  │ [真实渲染]  │ │ [真实渲染]  │ │ [真实渲染]  │      │
│  │            │ │            │ │            │      │
│  │ ☑ 选3个   │ │ ☑ 选1个    │ │ ☐          │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│                                                     │
│  本页数据来源：                                       │
│  ● 本页独立指定                                      │
│  [上传CSV: returns_may.csv]  预览：3行×4列              │
│  ┌─────────────────────────────────────────┐        │
│  │ 基金 │ 七日年化 │ 万份收益 │ 近一月回报   │        │
│  │ 天弘 │ 2.15%   │ 0.5892  │ 0.18%      │        │
│  │ 南方 │ 2.08%   │ 0.5701  │ 0.16%      │        │
│  │ 华夏 │ 2.21%   │ 0.6013  │ 0.19%      │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  🚀 生成第2节填充提示词并复制                          │
└─────────────────────────────────────────────────────┘
```

生成的提示词 ~400字，AI 基于 v001 修改 → v002。用户重复此流程逐节填充（v003、v004、v005）。

#### 精细修改阶段

进入「精细修改」Tab：用户自然语言描述修改意见（"第3节饼图配色改成蓝色系"、"封面加slogan"）→ 生成修改提示词 → AI 定点修改 → v006 → 完成。

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

## 十二、Design Token 预览页（design-tokens/preview.html）

独立页面，展示所有 Design Token 的可视化效果：

- **色彩系统**：所有颜色变量的色块矩阵（primary, bg, text, accent, border 等），按主题分列
- **字体排版**：从 `--text-xs` 到 `--text-3xl` 的字体阶梯，中文段落排版示例
- **间距系统**：`--space-xs` 到 `--space-xl` 的标尺可视化
- **圆角 & 阴影**：卡片圆角对比、阴影层级展示

顶部有主题切换 Tab（商务蓝白 / 暗黑科技 / 清新简约），切换后所有色块和示例即时更新。

---

## 十三、工具如何调用组件库

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

| 预览对象 | 方式 | 原因 |
|---------|------|------|
| 基础组件（kpi-card, info-card等） | v-html 内联 template.html | 与父页面共享 data-theme，风格切换即时变色 |
| 图表组件（bar-chart, line-chart等） | 静态截图 + 全屏预览入口 | template.html 含 ECharts 脚本，v-html 不执行 `<script>` |
| 版式骨架（a4, ppt, web） | iframe 嵌入 skeleton.html | 需要展示页面比例和布局轮廓，pointer-events:none 防止误触 |

三种方式互不冲突，同一组件目录满足三种场景。

---

## 十四、实施计划

### Phase 1：骨架与范例（第一步）

| 产出 | 说明 |
|------|------|
| `ui-lib/design-tokens/tokens.css` | 3 套风格的 CSS 变量完整定义 |
| `ui-lib/design-tokens/preview.html` | Token 可视化预览页 |
| `ui-lib/components/kpi-card/` | 第一个完整组件（3个文件），作为模板范例 |
| `ui-lib/components/info-card/` | 第二个组件，验证模板可复用性 |
| `ui-lib/COMPONENT_SPEC.md` | 组件开发规范文档 |

**先做 2 个组件打通流程，确认结构合理再铺量。**

### Phase 2：组件铺量

迁移 v2 的 8 个组件 + 新增 timeline / section-header / divider 共 11 个组件。每个组件按规范完成 index.html + template.html + component.js。

### Phase 3：图表 + 版式 + 风格

- 3 个图表组件（bar-chart / line-chart / pie-chart）
- 3 套版式骨架（a4-landscape / ppt-slide / web-scroll）
- 3 套风格预览页

### Phase 4：总览页 + 工具对接

- `gallery.html` 总览汇总页（左右两栏布局）
- `report-tool.html` 报告生成工具（多轮提示词编排）
- 各工具与 ui-lib 的引用路径验证

---

## 十五、与 v2 的关键区别

| 维度 | v2 | v3 |
|------|-----|-----|
| 组件形态 | JS 字符串 `htmlSnippet` | 独立 HTML 文件，可双击打开 |
| 组件预览 | 画廊页里的 CSS 骨架 | 真实渲染 + 代码展示 + 风格切换 |
| 跨工具复用 | 不可能（耦合在工具内） | 相对路径引用 `../ui-lib/` |
| 设计规范 | 散落在各组件 JS 里 | 集中在 `design-tokens/tokens.css` |
| 主题切换 | 不支持运行时切换 | `data-theme` 属性秒切 |
| 图表 | 无，靠 AI 临时写 | 预封装的 ECharts 图表组件 |
| 服务端 | Python server.py | **零服务端，纯静态 HTML** |
| 提示词 | 一次性大提示词（易卡壳） | 多轮渐进提示词（每次 ~500字） |
| AI 参考 | 组件代码嵌入提示词 | 提示词引用路径，AI 自行读取 |
| 工具数量 | 1 个 | 3 个（报告 + 标书 + BI），共享组件库 |

---

## 十六、后续扩展预留

1. **更多组件** — 按 5.6 节步骤三步新增，互不干扰
2. **更多风格** — 在 tokens.css 加一个 `[data-theme="xxx"]` 块即完成
3. **更多版式** — 新建 layouts/xxx/ 目录，提供 skeleton.html
4. **标书工具** — bid-tool.html 引用同一套 ui-lib，增加标书特有组件
5. **BI 仪表盘** — bi-dashboard.html 用 Vue 组件引用方式（方式C）深度使用 ECharts 图表
6. **Vue 组件映射** — component.js 已预留，支持从 AI HTML 重写为正式 Vue 项目
7. **构建工具迁移** — 如需 TypeScript/Vite，只需在 component.js 层面升级，template.html 和 index.html 保持不变
