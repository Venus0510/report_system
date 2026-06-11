# 金融报告 HTML 生成工具 — 功能规格说明书（v4）

## 一、产品定位

一个纯前端模块化工具，帮助金融估值团队业务同事快速生成专业的 HTML 报告。用户在工具中浏览资源库了解可选组件/风格/版式 → 通过分步表单组装提示词 → 将提示词复制到 Claude 桌面端生成 HTML → Claude 直接保存到本地文件 → 用户用浏览器打开工具加载文件 → 预览迭代修改 → 最终产出单 HTML 报告文件。

**核心原则：工具负责提示词生成 + HTML 预览微调，AI 对话能力由 Claude 桌面端承担。**

---

## 二、技术约束

| 项目 | 要求 |
|------|------|
| 部署形态 | **纯静态文件，打开 `index.html` 即用** |
| 浏览器要求 | **Chrome / Edge**（需 File System Access API） |
| 最终产物 | 工具本身多文件（好维护），输出的报告为单 HTML 文件（好分发） |
| UI 框架 | Vue 3（CDN 引入，`vue.global.prod.js`） |
| CSS 框架 | Tailwind CSS（CDN 引入） |
| 代码编辑器 | CodeMirror 5（CDN 引入，monokai 主题） |
| CSV 解析 | Papa Parse（CDN 引入） |
| 文件读写 | **浏览器 File System Access API**（`showOpenFilePicker` / `showSaveFilePicker`），无后端 |
| 启动方式 | **双击 `index.html` 或在 Chrome/Edge 中打开即可，无需服务器** |
| 依赖管理 | **全部 CDN，零 npm install，零构建，零部署** |

### CDN 引入清单

```html
<!-- Vue 3 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>

<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Papa Parse (CSV 解析) -->
<script src="https://unpkg.com/papaparse@5/papaparse.min.js"></script>

<!-- CodeMirror 5 (HTML 编辑器) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/monokai.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/xml/xml.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/htmlmixed/htmlmixed.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/javascript/javascript.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/css/css.min.js"></script>
```

---

## 三、项目文件结构

```
system_v2/
├── index.html                  # 入口文件，Vue 应用壳 + 所有页面模板
├── css/
│   └── app.css                 # 工具 UI 定制样式（侧边栏、编辑器、滚动条等）
├── js/
│   ├── app.js                  # Vue 初始化 + 全局状态 + 页面路由
│   ├── utils.js                # 公共工具函数（剪贴板、下载、防抖、文件命名等）
│   ├── filesystem.js           # File System Access API 封装（ReportFS，备用）
│   ├── resources/
│   │   ├── layouts/
│   │   │   ├── index.js        # 版式注册表 + 汇总导出
│   │   │   ├── a4-landscape.js # A4 横版分页
│   │   │   ├── ppt-slide.js    # PPT Slide 翻页
│   │   │   └── web-scroll.js   # 自由滚动网页
│   │   ├── styles/
│   │   │   ├── index.js        # 风格注册表 + 汇总导出
│   │   │   ├── business-blue.js
│   │   │   ├── dark-tech.js
│   │   │   └── fresh-clean.js
│   │   └── components/
│   │       ├── index.js        # 组件注册表 + 汇总导出 + 分类归组
│   │       ├── kpi-card/index.js
│   │       ├── info-card/index.js
│   │       ├── process-step/index.js
│   │       ├── data-table/index.js
│   │       ├── compare-card/index.js
│   │       ├── team-grid/index.js
│   │       ├── highlight-quote/index.js
│   │       └── big-number-row/index.js
│   └── pages/
│       ├── prompt-page.js      # 提示词生成页（5步表单 + 骨架/完整双模式）
│       ├── preview-page.js     # 预览/版本管理/检查器/修改/逐模块填充
│       ├── layouts-gallery.js  # 版式库展示页
│       ├── styles-gallery.js   # 风格库展示页
│       └── components-gallery.js # 组件库展示页
├── reference-demo/             # 视觉参照标准（A4.html / ppt.html / web.html）
├── reports/                    # 用户生成的 HTML 示例存放目录
│   └── .gitkeep
├── Content.md                  # 已有文件，保留不动
├── conversation.md             # 已有文件，保留不动
└── SPEC.md                     # 本文档
```

### 模块加载方式

`index.html` 通过普通 `<script>` 标签按依赖顺序加载。各 JS 文件通过全局作用域共享：

- `resources/layouts/*.js` 每个版式定义各自的 `LAYOUT_*` 常量，`index.js` 汇总为全局变量 `LAYOUTS` / `LAYOUTS_BY_ID`
- `resources/styles/*.js` 每个风格定义各自的 `STYLE_*` 常量，`index.js` 汇总为全局变量 `STYLES` / `STYLES_BY_ID`
- `resources/components/*/index.js` 每个组件定义各自的 `COMPONENT_*` 常量，`index.js` 汇总为全局变量 `COMPONENTS` / `COMPONENTS_BY_ID` / `COMPONENTS_BY_CATEGORY`
- `utils.js` 声明全局工具对象 `Utils`
- `filesystem.js` 声明全局对象 `ReportFS`
- `pages/*.js` 各自声明该页面的模块对象（`PromptPage` / `PreviewPage` / `LayoutsGallery` / `StylesGallery` / `ComponentsGallery`），通过 `.init(state)` 返回方法集
- `app.js` 最后加载，调用 `Vue.createApp().mount('#app')`，将所有页面模块的方法合并到 Vue setup 中

### 扩展资源库的方式

**添加一个新组件**：
1. 新建 `js/resources/components/{component-id}/index.js`
2. 定义组件对象：`const COMPONENT_XXX = { id, name, category, description, previewHTML, htmlSnippet, vueTemplate }`
3. 在 `js/resources/components/index.js` 中注册：`COMPONENTS` 数组添加该项
4. 在 `index.html` 中添加 `<script src="js/resources/components/{component-id}/index.js"></script>`

**添加一个新风格或版式**：同理，新建文件 → 注册 → 加 script 标签。

---

## 四、启动方式

**无需服务器，直接用浏览器打开。**

1. 在 Chrome 或 Edge 中打开 `index.html`
2. 工具直接在浏览器中运行
3. 预览页用「📂 打开文件」按钮选择本地 HTML 报告文件

> 仅支持 Chrome / Edge，因为它们提供了 File System Access API（`showOpenFilePicker` / `showSaveFilePicker`）。Safari / Firefox 打开时会显示浏览器不支持的警告。

---

## 五、页面结构

### 5.1 全局导航

左侧暗色固定侧边栏 + 右侧内容区，共 **5 个页面**：

```
┌──────────┬──────────────────────────────────────────────┐
│ 工作台   │                                              │
│ ──────── │             右侧内容区                        │
│ 生成提示词│             (对应页面渲染)                     │
│ 预览修改  │                                              │
│ ──────── │                                              │
│ 资源库   │                                              │
│ ──────── │                                              │
│ 版式库   │                                              │
│ 风格库   │                                              │
│ 组件库   │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 5.2 页面切换与数据缓存

**所有页面使用 `v-show` 切换，不使用 `v-if`。** 全局状态存储在 `app.js` 的 Vue `reactive()` 对象中，切换页面数据不丢失。

**默认首页**：组件库展示页（`components-gallery`），让用户先浏览可用组件。

**唯一例外**：用户手动刷新浏览器（F5 或 Cmd+R）会导致所有状态重置。提示词生成后显示醒目提醒。

---

## 六、资源库展示页（三个独立页面）

### 6.1 版式库展示页（layouts-gallery）

- 三张卡片并排：A4 横版分页 / PPT Slide 翻页 / 自由滚动网页
- 每张卡片包含：
  - **真实渲染的版式微缩预览**（`previewHTML`，非骨架，是带模拟数据渲染的微缩版）
  - 版式名称 + 图标 + 分类标签（打印版 / 演示版 / 网页版）
  - 版式描述文字
  - 「使用此版式」按钮 → 跳转回提示词页，自动选中该版式

### 6.2 风格库展示页（styles-gallery）

- 三张卡片并排：商务蓝白 / 暗黑科技 / 清新简约
- 每张卡片包含：
  - 四个圆形色块（主色 / 背景 / 文字 / 强调）
  - **真实渲染的风格预览卡片**（`previewHTML`，用该风格的配色渲染带模拟内容的卡片）
  - 风格名称 + 描述
  - 「使用此风格」按钮 → 同上

### 6.3 组件库展示页（components-gallery）

- **默认首页**，按分类分组展示所有组件（数据展示 / 内容展示 / 流程展示 / 对比分析 / 信息展示）
- 每个组件卡片包含：
  - 组件名称 + 描述 + 标识符（id）
  - **真实渲染的组件预览**（`previewHTML`，带示例数据，在渐变色背景上渲染）
  - 点击「查看代码示例」展开/折叠 `htmlSnippet` 代码块（暗色背景 + 等宽字体显示）
- 目的：让用户和 AI 都知道这个组件长什么样、代码怎么写

---

## 七、提示词生成页（prompt-page）

### 7.1 分步表单

用户按步骤选择/输入，每一步在同一个卡片区域内折叠展开（accordion 式，不是跳页面）。默认第一步展开。

**Step 1 — 报告基本信息**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 报告文件名 | text input | 是 | 如 `货币基金月度报告`，用于命名生成的 HTML 文件 |
| 报告主题 | textarea | 是 | 一句话描述 |
| 受众 | select | 是 | 高管汇报 / 客户展示 / 内部培训 / 项目交付 |
| 用途 | select | 是 | 汇报展示 / 培训材料 / 交付文档 / 方案建议书 |

**Step 2 — 选择版式**

三个卡片选项：A4 横版分页 / PPT Slide 翻页 / 自由滚动网页。每个卡片展示真实渲染的版式微缩预览。选中后蓝色高亮边框。附链接「→ 去版式库查看详细效果」。

**Step 3 — 选择风格**

三个卡片选项：商务蓝白 / 暗黑科技 / 清新简约。每个卡片展示四个色块。选中后蓝色高亮边框。附链接「→ 去风格库查看详细效果」。

**Step 4 — 内容结构（版式自适应，双模式）**

这是核心交互区。顶部有生成模式切换：

- **🏗️ 骨架模式（默认）**：只需描述大致结构大纲，AI 搭好页面框架和占位符，不编造内容。适合大型报告先搭框架再逐模块填充。
- **📝 完整模式**：逐页/逐节/逐区块详细配置 + 组件选择，一次性输出全部内容。

---

#### 骨架模式

一个大的 textarea 输入框，用户用口语描述报告大致包含哪些部分：

```
例如：
1. 封面页
2. 核心指标总览——放几个KPI卡片，规模、收益率、波动率
3. 产品业绩分析——表格+趋势图
4. 风险指标
5. 总结与展望
```

下方可选：快速选择组件（点击组件缩略图选中，选中组件的代码会注入提示词作为风格参考）。

提示文案：「越详细越好，AI 能更准确拆页。不确定的内容不写即可，AI 会标记为 [待补充]。」

---

#### 完整模式（根据版式动态切换）

**版式 A：A4 横版分页 → 「逐页添加」**

用户逐页定义报告内容。每页配置：页名称 + 内容大纲 + 使用组件（多选缩略图）+ 上移/下移/编辑/删除。

**版式 B：PPT Slide → 「逐节添加」**

额外有一个"整体演讲大纲"textarea（给 AI 全局脉络）。每节配置：节名称 + 内容要点 + 建议 slide 数（下拉选择：AI自行判断 / 1-2页 / 2-3页 / 3-5页 / 5-8页）+ 使用组件。

**版式 C：自由滚动网页 → 「添加区块」**

每区块配置：区块名称 + 内容大纲 + 使用组件。

A4 的 `type='page'` 是精确一页，PPT 的 `type='section'` AI 拆成多 slide，Web 的 `type='block'` 是一个页面区块。

**组件选择**：点击缩略图选中/取消，已选中的显示蓝色高亮边框和"✓ 已选"标记。在多选网格中展示组件真实渲染的微缩预览。

**Step 5 — 数据来源（全局默认）**

| 选项 | 说明 |
|------|------|
| 上传 CSV 文件 | Papa Parse 解析后显示列名和前5行预览 |
| 手写 JSON 数据 | textarea，可点按钮校验格式 |
| 占位数据 | 默认选项，AI 用示例数据生成 |

### 7.2 用户输入含糊 → AI 主动扩展

提示词中注入内容扩展要求：口语化想法扩展为正式报告文案，"表现不错"扩展为具体数据维度，"放一些核心数据"推断合理指标类型，不确定数字用 [XX%] 或 [待填数据] 标记，语气符合受众。

### 7.3 提示词生成逻辑

点击「生成提示词」按钮后，根据当前模式（骨架/完整）拼装不同结构的提示词。

**骨架模式提示词结构**：
- 报告基本信息
- 版式要求 + 风格要求
- 组件参考代码片段（所有选中组件）
- 大致结构大纲
- 数据源说明
- 输出要求：搭框架 + 占位符 + `data-section` 属性 + 保存路径

**完整模式提示词结构**：
- 内容扩展要求
- 版式约束 + 风格约束
- 组件参考代码片段
- 用户需求（基本信息和逐页/逐节/逐区块的内容结构）
- 数据源
- 输出要求：完整内容 + `data-cid` 属性 + 保存路径

提示词中包含文件保存路径指令 `reports/{文件名}_v{版本}_{时间戳}.html`，Claude 桌面端直接写入该路径。

生成后显示在暗色代码框中，下方有 **[📋 一键复制]** 按钮。附带醒目警告：「在切换页面或刷新浏览器前，请确保已将提示词复制到剪贴板。」

---

## 八、预览 & 修改页（preview-page）

### 8.1 布局

```
┌─────────────────────────────────────────────────────────┐
│ 顶部操作栏：文件选择 + 版本历史标签 + [📂 打开文件] [💾 另存为]  │
├──────────────────────────────┬──────────────────────────┤
│ 实时预览 (iframe)             │ HTML 源码编辑器            │
│ ┌──────────────────────────┐ │ (CodeMirror 5, monokai)  │
│ │                          │ │                          │
│ │  hover 高亮蓝色边框       │ │  420px 宽                │
│ │  click 定位到源码对应行   │ │                          │
│ │                          │ │  Ctrl+S 保存             │
│ └──────────────────────────┘ │                          │
├──────────────────────────────┴──────────────────────────┤
│ [桌面/iPad/手机]  [元素检查器开关]                         │
├──────────────────────────────────────────────────────────┤
│ ✍️ 自由修改：textarea + [生成指令] [复制到剪贴板]           │
├──────────────────────────────────────────────────────────┤
│ 📝 逐模块填充（当HTML有data-section时显示）                 │
│    选择区块 → 填写填充内容 → [生成填充指令] [复制到剪贴板]    │
└──────────────────────────────────────────────────────────┘
```

### 8.2 文件管理（File System Access API）

**打开文件**：
- 点击「📂 打开文件」→ 浏览器原生文件选择器 → 选择 `.html` 文件
- 文件内容载入 CodeMirror → 自动更新 iframe 预览
- 文件名加入版本历史标签栏（去重插入到最前面，最多保留 20 个）

**另存为**：
- 点击「💾 另存为」→ 浏览器原生保存对话框 → 默认文件名 `{报告名}_v{版本}_{时间戳}.html`
- 保存后自动加入版本历史

**版本历史标签**：
- 显示已打开过的文件历史（仅内存，刷新丢失）
- 点击标签切换到该版本
- 尝试复用已存储的文件句柄，权限失效时降级到文件选择器

**浏览器不支持时的降级提示**：
- 检测 `showOpenFilePicker` 是否存在
- 不支持时显示提示：「请使用 Chrome 或 Edge 浏览器打开此工具」

### 8.3 元素检查器

iframe 内注入 inspector 脚本：
- **hover** → 蓝色半透明边框 + 浅蓝背景高亮当前元素
- **click** → 通过 `postMessage` 将元素特征（data-cid、文本片段、outerHTML前300字符）传给主应用
- **主应用** → 按 data-cid → 文本片段 → HTML 特征的优先级搜索 CodeMirror → 滚动到对应行 → 蓝色闪烁 2 秒
- 检查器可通过开关动态启用/禁用（不重建 srcdoc，保留 iframe 内翻页/滚动状态）

### 8.4 源码编辑器

- CodeMirror 5，`htmlmixed` 模式，monokai 暗色主题
- `Ctrl+S` 触发另存为
- 手动点击「▶ 更新预览」按钮刷新 iframe

### 8.5 设备预览切换

- 桌面：100% / iPad：768px / 手机：375px
- 改变 iframe 外层容器 `max-width`

### 8.6 自由修改

用户输入修改意见 → 点击「生成指令」→ 生成续写提示词（优先引用文件路径，避免嵌入完整 HTML） → 复制到剪贴板 → 粘贴到 Claude 继续对话。

### 8.7 逐模块填充（骨架工作流核心）

当 HTML 中包含 `data-section="区块名"` 属性时自动激活：

1. 工具自动提取所有 `data-section` 值，显示为可点击的标签按钮
2. 用户选择一个目标区块 → 在 textarea 中描述该区块应展示的内容
3. 点击「生成填充指令」→ 生成针对该区块的精确定位 prompt（"只修改包含 data-section='区块名' 的容器内部内容，其他区块一个字都不要改"）
4. 复制到 Claude → Claude 只填充该区块
5. 逐个区块迭代填充，逐步完成报告

---

## 九、三大资源库（详细数据结构）

### 9.1 版式库 — `js/resources/layouts/`

每个版式一个文件，结构：

```javascript
const LAYOUT_A4_LANDSCAPE = {
  id: 'a4-landscape',
  name: 'A4 横版分页',
  category: 'print',           // 'print' | 'slide' | 'web'
  icon: '📄',
  description: 'A4横向多页，打印友好...',
  previewHTML: `<div>...</div>`,   // 真实渲染的微缩预览（Tailwind + 模拟数据）
  aiPrompt: `【版式约束 - A4横版分页】...`,  // AI 约束文本
  configLabels: {
    addButton: '+ 添加一页',
    nameLabel: '页名称',
    outlineLabel: '内容大纲（这一页大概要写什么）',
    itemLabel: '页',
    globalOutline: false        // 是否显示整体大纲输入框（PPT 版式为 true）
  }
};
```

### 9.2 风格库 — `js/resources/styles/`

```javascript
const STYLE_BUSINESS_BLUE = {
  id: 'business-blue',
  name: '商务蓝白',
  description: '正式稳重，适合高管汇报和客户交付...',
  colorChips: ['#1e3a8a', '#f8fafc', '#1f2937', '#2563eb'],
  colors: { primary, primaryLight, bg, bgCard, text, textMuted, accent, border },
  previewHTML: `<div>...</div>`,   // 真实渲染的风格预览卡片
  aiPrompt: `【风格约束 - 商务蓝白】...`
};
```

### 9.3 组件库 — `js/resources/components/`

每个组件一个文件夹，各含 `index.js`：

```javascript
const COMPONENT_KPI_CARD = {
  id: 'kpi-card',
  name: 'KPI 数字卡片',
  category: '数据展示',           // 数据展示 | 内容展示 | 流程展示 | 对比分析 | 信息展示
  description: '展示单个关键指标数值，含标签和变化趋势',
  previewHTML: `<div>...</div>`,   // 真实渲染的组件预览（带示例数据，非骨架）
  htmlSnippet: `<div data-cid="kpi-card" ...>...</div>`,  // AI 参考代码片段
  vueTemplate: `...`              // Vue 版本，预留
};
```

**组件清单**（8个）：

| 标识 | 名称 | 分类 |
|------|------|------|
| `kpi-card` | KPI 数字卡片 | 数据展示 |
| `info-card` | 信息卡片 | 内容展示 |
| `process-step` | 流程步骤 | 流程展示 |
| `data-table` | 数据表格 | 数据展示 |
| `compare-card` | 对比卡片 | 对比分析 |
| `team-grid` | 团队网格 | 信息展示 |
| `highlight-quote` | 高亮引言 | 内容展示 |
| `big-number-row` | 大数字行 | 数据展示 |

**组件约束**：
- `previewHTML` 是真实渲染的独立 DOM 片段（带模拟数据），全部 Tailwind 类名，`pointer-events:none`
- `htmlSnippet` 是 AI 参考代码片段，根元素带 `data-cid="{组件id}"`
- 片段控制在 20 行以内

---

## 十、数据流总览

```
用户操作                          工具行为                        Claude桌面端
───────                          ───────                        ────────────
浏览版式库/风格库/组件库
  │
  ▼
Step 1: 填基本信息
Step 2: 选版式 → 自动切换Step 4交互
Step 3: 选风格
Step 4: 配置内容结构（骨架/完整双模式）
Step 5: 配置数据源
  │
  ▼
点击「生成提示词」        ──→   拼装prompt（版式约束+风格tokens+
                               组件snippets+内容扩展要求+
                               页面结构+数据源+保存路径指令）
  ▼
点击「一键复制」          ──→   复制到剪贴板
  │                                                        ← 粘贴到Claude
  │                                                        ← Claude生成HTML
  │                                                        ← Claude保存到
  │                                                          reports/xxx_v001_xxx.html
  ▼
切换到预览页
点击「📂 打开文件」       ──→   浏览器原生文件选择器
  ▼
选择报告 HTML 文件        ──→   载入CodeMirror → 更新iframe预览
  ▼
hover/click预览          ──→   元素高亮/代码定位
  ▼
写修改意见 / 选区块填充  ──→   生成续写指令并复制
  │                                                        ← Claude修改并保存新版本
  ▼
打开新版本文件 → 预览 → 满意

（无需导出页，直接下载/打印由用户自行操作）
```

---

## 十一、全局状态设计（app.js）

```javascript
const state = reactive({
  // 页面导航
  currentView: 'components-gallery',  // 默认首页：组件库

  // 提示词表单
  reportFileName: '',
  reportTopic: '',
  audience: '',
  purpose: '',
  selectedLayoutId: null,
  selectedStyleId: null,
  pages: [],                        // 统一数据结构
  pptOutline: '',                   // PPT 版式整体演讲大纲
  globalDataSource: null,           // { type, filename?, headers?, rows?, content? }

  // 预览（htmlSource 在 PreviewPage 模块内部管理）

  // Toast
  toast: { show: false, type: 'success', message: '' }
});
```

---

## 十二、重点实现细节

### 12.1 元素检查器注入

iframe 通过 `srcdoc` 加载 HTML 时，注入检查器 `<script>`。通过 `postMessage` 动态开关检查器（`inspector-toggle`），不重建 srcdoc，保留 iframe 内部翻页/滚动状态。

### 12.2 CodeMirror 搜索定位

搜索策略：data-cid → 文本片段（30字符）→ HTML特征（80字符），找到后 `scrollIntoView` + 高亮2秒。

### 12.3 提示词中嵌入文件保存路径

```
将生成的完整HTML保存到文件：reports/{reportFileName}_v{version}_{timestamp}.html
```

Claude 桌面端直接写文件到指定路径。

### 12.4 File System Access API 权限

- 使用 `showOpenFilePicker` 打开文件，文件句柄可存储（当前为内存存储）
- 使用 `showSaveFilePicker` 创建新文件，默认建议文件名
- 版本历史切换时，先尝试 `queryPermission`，失效则请求 `requestPermission`
- `filesystem.js`（`ReportFS`）封装了基于 `showDirectoryPicker` 的目录级别操作和 IndexedDB 句柄持久化，当前预览页主要使用文件级别 API

---

## 十三、与 reference-demo 的关系

`reference-demo/` 下的三个文件是本工具的 **视觉参照标准**：
- `A4.html` → `a4-landscape` 参考模板
- `ppt.html` → `ppt-slide` 参考模板
- `web.html` → `web-scroll` 参考模板

抽取其 CSS 变量和组件模式为版式约束文本和组件 HTML Snippet，不把完整代码放入工具。

---

## 十四、交付物

| 文件/目录 | 说明 |
|-----------|------|
| `index.html` | 入口文件，Vue 应用壳 + 全部页面模板 |
| `css/app.css` | 工具 UI 定制样式 |
| `js/app.js` | Vue 初始化 + 全局状态 + 5页面路由 |
| `js/utils.js` | 公共工具函数 |
| `js/filesystem.js` | File System Access API 封装（备用） |
| `js/resources/layouts/` | 版式库（3个版式 × 独立文件 + index.js） |
| `js/resources/styles/` | 风格库（3个风格 × 独立文件 + index.js） |
| `js/resources/components/` | 组件库（8个组件 × 独立文件夹 + index.js） |
| `js/pages/prompt-page.js` | 提示词生成页（骨架+完整双模式） |
| `js/pages/preview-page.js` | 预览/版本/检查器/修改/逐模块填充 |
| `js/pages/layouts-gallery.js` | 版式库展示页 |
| `js/pages/styles-gallery.js` | 风格库展示页 |
| `js/pages/components-gallery.js` | 组件库展示页（默认首页） |
| `reports/` | 用户生成的 HTML 示例 |
| `reference-demo/` | 视觉参照标准 |

---

## 十五、后续扩展预留

1. **AI 直接对话集成** — 目前粘贴复制，后续在 preview-page 加 AI 对话面板，后端代理 Claude API
2. **Vue 组件映射** — `vueTemplate` 字段已预留
3. **报告模板预设** — `pages` 数据结构支持保存/加载配置快照
4. **多人协作** — `reports/` + 配置快照天然支持 Git 版本管理
5. **更多组件/风格/版式** — 按第三节「扩展资源库的方式」，新建文件+注册即可
6. **目录级文件管理** — `ReportFS`（filesystem.js）已预留 `selectDirectory` 模式，可升级为类似 IDE 的目录树浏览
