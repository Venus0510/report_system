# 金融报告 HTML 生成工具 — 功能总指令（v3）

## 一、产品定位

一个模块化的前端工具，帮助金融估值团队业务同事（非程序员）快速生成专业的 HTML 报告。用户先浏览资源库了解可选组件/风格/版式 → 通过分步表单组装提示词 → 丢给 Claude 桌面端生成 HTML → Claude 直接保存到 `reports/` 目录 → 工具自动加载版本列表 → 预览迭代 → 导出最终 HTML。

**核心原则：只做提示词生成 + HTML预览微调 + 导出，AI 对话能力由 Claude 桌面端承担。**

---

## 二、技术约束（不可偏离）

| 项目 | 要求 |
|------|------|
| 部署形态 | **模块化多文件项目，双击 `start.command` 一键启动** |
| 最终产物 | 工具本身多文件（好维护），输出的报告为单 HTML 文件（好分发） |
| UI 框架 | Vue 3（CDN 引入，`vue.global.prod.js`） |
| CSS 框架 | Tailwind CSS（CDN 引入） |
| 代码编辑器 | CodeMirror 6（CDN 引入） |
| CSV 解析 | Papa Parse（CDN 引入） |
| 图表渲染 | ECharts 5（CDN 引入，仅在 iframe 预览中使用） |
| 后端服务 | Python 3 内置模块（`http.server`），macOS 自带，零安装 |
| 启动方式 | **双击 `start.command` → 自动打开浏览器** |
| 依赖管理 | **全部 CDN，零 npm install，零构建，零部署** |
| 浏览器兼容 | Chrome / Edge / Safari 最新版 |

### CDN 引入清单

```html
<!-- Vue 3 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>

<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- CodeMirror 6 (HTML source editing) -->
<!-- 从 esm.sh 或 jsdelivr CDN 引入 -->

<!-- Papa Parse (CSV parsing) -->
<script src="https://unpkg.com/papaparse@5/papaparse.min.js"></script>
```

---

## 三、项目文件结构

```
report-system/
├── index.html                  # 入口文件，Vue 应用壳
├── start.command               # 双击启动脚本（macOS）
├── server.py                   # Python 本地服务器（~50行，零依赖）
├── css/
│   └── app.css                 # 极少量业务定制样式（尽量用 Tailwind）
├── js/
│   ├── app.js                  # Vue 初始化 + 全局状态 + 页面路由
│   ├── utils.js                # 公共工具函数
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
│   │       ├── index.js        # 组件注册表 + 汇总导出
│   │       ├── kpi-card/
│   │       │   └── index.js    # htmlSnippet + thumbnailHTML + vueTemplate
│   │       ├── info-card/
│   │       │   └── index.js
│   │       ├── process-step/
│   │       │   └── index.js
│   │       ├── data-table/
│   │       │   └── index.js
│   │       ├── compare-card/
│   │       │   └── index.js
│   │       ├── team-grid/
│   │       │   └── index.js
│   │       ├── highlight-quote/
│   │       │   └── index.js
│   │       └── big-number-row/
│   │           └── index.js
│   └── pages/
│       ├── prompt-page.js      # 提示词生成页
│       ├── preview-page.js     # 预览/版本管理/检查器/修改
│       ├── export-page.js      # 导出下载
│       ├── layouts-gallery.js  # 版式库展示页
│       ├── styles-gallery.js   # 风格库展示页
│       └── components-gallery.js # 组件库展示页
├── data/                       # 已有目录，保留不动
├── reference-demo/             # 已有目录，保留不动（A4.html / ppt.html / web.html）
├── reports/                    # 用户生成的 HTML 存放目录
│   └── .gitkeep
├── Content.md                  # 已有文件，保留不动
├── conversation.md             # 已有文件，保留不动
├── description.xlsx            # 已有文件，保留不动
├── design-tokens/              # 已有目录，保留不动
├── layout/                     # 已有目录，保留不动
├── report/                     # 已有目录，保留不动
└── SPEC.md                     # 本文档
```

### 模块加载方式

`index.html` 通过普通 `<script>` 标签按依赖顺序加载。各 JS 文件通过全局作用域共享：

- `resources/layouts/index.js` 中 `import` 各个 layout 子模块，汇总为全局变量 `LAYOUTS`
- `resources/styles/index.js` 汇总为全局变量 `STYLES`
- `resources/components/index.js` 汇总为全局变量 `COMPONENTS`
- `utils.js` 声明全局工具对象 `Utils`
- `pages/*.js` 各自声明该页面的组合式函数/配置
- `app.js` 最后加载，调用 `Vue.createApp().mount('#app')`

```html
<!-- index.html 底部 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<!-- 其他 CDN -->
<script src="js/resources/layouts/a4-landscape.js"></script>
<script src="js/resources/layouts/ppt-slide.js"></script>
<script src="js/resources/layouts/web-scroll.js"></script>
<script src="js/resources/layouts/index.js"></script>

<script src="js/resources/styles/business-blue.js"></script>
<script src="js/resources/styles/dark-tech.js"></script>
<script src="js/resources/styles/fresh-clean.js"></script>
<script src="js/resources/styles/index.js"></script>

<script src="js/resources/components/kpi-card/index.js"></script>
<script src="js/resources/components/info-card/index.js"></script>
<!-- ... 其他组件 ... -->
<script src="js/resources/components/index.js"></script>

<script src="js/utils.js"></script>
<script src="js/pages/prompt-page.js"></script>
<script src="js/pages/preview-page.js"></script>
<script src="js/pages/export-page.js"></script>
<script src="js/pages/layouts-gallery.js"></script>
<script src="js/pages/styles-gallery.js"></script>
<script src="js/pages/components-gallery.js"></script>
<script src="js/app.js"></script>
```

### 扩展资源库的方式

**添加一个新组件**（如要新增一个 `chart-card`）：
1. 新建 `js/resources/components/chart-card/index.js`
2. 在其中定义该组件对象：`const COMPONENT_CHART_CARD = { id: 'chart-card', name: '图表卡片', ... }`
3. 在 `js/resources/components/index.js` 中注册：`COMPONENT_REGISTRY.push(COMPONENT_CHART_CARD)`
4. 在 `index.html` 中加载：`<script src="js/resources/components/chart-card/index.js"></script>`

**添加一个新风格或版式**：同理，新建文件 → 注册 → 加 script 标签。结构清晰，不影响已有代码。

---

## 四、启动方式

### 4.1 start.command（双击启动）

```bash
#!/bin/bash
cd "$(dirname "$0")"
echo "正在启动金融报告 HTML 生成工具..."
python3 server.py &
SERVER_PID=$!
sleep 1
open http://localhost:8080
echo "工具已启动，按 Ctrl+C 关闭服务"
wait $SERVER_PID
```

用户操作：**双击 `start.command`** → 终端窗口闪一下 → 自动打开浏览器 → 工具已在运行。

> macOS 自带 Python 3，无需额外安装。Windows 用户给一个 `start.bat` 同等效果。

### 4.2 server.py — 本地文件服务

#### 职责

1. 提供静态文件服务（HTML / CSS / JS）
2. 提供 `reports/` 目录的文件 API：列表、读取、保存、删除
3. 零依赖，仅用 Python 3 内置库

#### API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/` | 返回 `index.html` |
| `GET` | `/api/reports` | 返回 `reports/` 下所有 HTML 文件列表（按修改时间倒序） |
| `GET` | `/api/reports/{filename}` | 读取指定报告文件内容 |
| `POST` | `/api/reports/{filename}` | 保存报告文件（body 为 HTML 内容） |
| `DELETE` | `/api/reports/{filename}` | 删除指定报告文件 |
| `GET` | `/static/*` | 静态文件服务（CSS / JS） |

#### 文件列表 API 返回格式

```json
{
  "files": [
    {
      "name": "货币基金报告_v003_20250114_1530.html",
      "baseName": "货币基金报告",
      "version": 3,
      "size": 28471,
      "modified": "2025-01-14T15:30:22"
    }
  ]
}
```

---

## 五、页面结构

### 5.1 全局导航

左侧固定侧边栏 + 右侧内容区，共 6 个页面：

```
┌──────────┬──────────────────────────────────────────────┐
│ 工作台   │                                              │
│ ──────── │             右侧内容区                        │
│ 生成提示词│             (对应页面渲染)                     │
│ 预览修改  │                                              │
│ 导出下载  │                                              │
│ ──────── │                                              │
│ 资源库   │                                              │
│ ──────── │                                              │
│ 版式库   │                                              │
│ 风格库   │                                              │
│ 组件库   │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 5.2 页面切换与数据缓存

**所有页面使用 `v-show` 切换，不使用 `v-if`。** 全局状态存储在 `app.js` 的 Vue `reactive()` 对象中。

```javascript
// app.js
const state = reactive({
  currentView: 'prompt',  // 当前显示页面
  // 所有表单数据、预览状态都在这里，切换页面不丢失
});

function navigate(view) {
  state.currentView = view;
}
```

```html
<div v-show="state.currentView === 'prompt'">...</div>
<div v-show="state.currentView === 'preview'">...</div>
<div v-show="state.currentView === 'export'">...</div>
<div v-show="state.currentView === 'layouts-gallery'">...</div>
<div v-show="state.currentView === 'styles-gallery'">...</div>
<div v-show="state.currentView === 'components-gallery'">...</div>
```

**保证**：在生成提示词页面填好的表单数据，切换到组件库浏览一圈，再切回来，数据完好无损。

**唯一例外**：用户手动刷新浏览器（F5 或 Cmd+R）会导致所有状态重置。在提示词生成完成后显示醒目提醒：

> 「提示词已生成，在切换到其他页面或刷新前，请确保已将提示词复制到剪贴板」

---

## 六、资源库展示页（三个独立页面）

用户在选版式/风格/组件之前，可以先到资源库浏览实物效果。

### 6.1 版式库展示页（layouts-gallery）

- 三张卡片并排：A4 横版分页 / PPT Slide 翻页 / 自由滚动网页
- 每张卡片包含：
  - 版式名称 + 适用场景 icon
  - **CSS 简笔缩略图**（纯 div + Tailwind，展示版式的页面骨架轮廓）
  - 适用场景说明文字
  - 「使用此版式」按钮 → 点击后跳转回提示词页面，自动选中该版式（`state.selectedLayout = id`，`state.currentView = 'prompt'`）

### 6.2 风格库展示页（styles-gallery）

- 三张卡片并排：商务蓝白 / 暗黑科技 / 清新简约
- 每张卡片包含：
  - 风格名称
  - **色块预览**（四个圆形色块：primary / bg / text / accent）
  - 应用场景标签（"正式汇报" "技术方案" "培训材料"）
  - 风格描述文字
  - 「使用此风格」按钮 → 同上，自动选中该风格并跳转回提示词页

### 6.3 组件库展示页（components-gallery）

- 按分类分组展示所有组件（数据展示 / 内容展示 / 流程展示 / 对比分析 / 信息展示）
- 每个组件卡片包含：
  - 组件名称 + 分类标签
  - **空状态缩略图**（Tailwind 骨架，展示结构轮廓）
  - 下方展示 **完整 htmlSnippet 代码块**（带语法高亮的 `<pre><code>`）
  - 点击可展开/折叠代码
- 目的：让用户和 AI 都知道这个组件长什么样、代码怎么写。AI 参照这些 snippet 生成不会跑偏。

---

## 七、提示词生成页（prompt-page）

### 7.1 分步表单

用户按步骤选择/输入，每一步在同一个卡片区域内渐进展开（折叠展开，不是跳页面）。

**Step 1 — 报告基本信息**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 报告文件名 | text input | 是 | 英文或中文，如 `货币基金月度报告`。后续生成的 HTML 版本文件将以此命名。 |
| 报告主题 | textarea | 是 | 一句话描述，如"面向公募基金管理人的货币基金产品月度收益归因分析" |
| 受众 | select | 是 | 高管汇报 / 客户展示 / 内部培训 / 项目交付 |
| 用途 | select | 是 | 汇报展示 / 培训材料 / 交付文档 / 方案建议书 |

**报告文件名说明**：用户填了 "货币基金月度报告" 后，Claude 生成的 HTML 会保存为：
- `reports/货币基金月度报告_v001.html`
- `reports/货币基金月度报告_v002.html`

同时自动保存一份配置快照 `reports/货币基金月度报告_config.json`，包含本次表单的所有选择。

**Step 2 — 选择版式**

| 选项 | 标识 | 说明 |
|------|------|------|
| A4 横版分页 | `a4-landscape` | 打印友好，仿 PPT 的 A4 横版多页，每页尺寸 297mm×210mm |
| PPT Slide 翻页 | `ppt-slide` | 全屏 Slide（100vw×100vh），键盘/点击翻页 |
| 自由滚动网页 | `web-scroll` | 响应式长页面，适合 Landing Page，content max-w-[1180px] |

每个选项用**卡片形式**展示：CSS 简笔缩略图 + 名称 + 适用场景描述。选中后高亮边框。旁边有链接文字「去版式库看看效果 →」跳转到版式库展示页。

**Step 3 — 选择风格**

| 选项 | 标识 | 主色调 | 适用场景 |
|------|------|--------|---------|
| 商务蓝白 | `business-blue` | 深蓝 #1e3a8a + 纯白底 | 正式汇报、高管演示 |
| 暗黑科技 | `dark-tech` | 深黑 #0f172a + 科技蓝 #6ea8ff | 技术方案、数据密集 |
| 清新简约 | `fresh-clean` | 翠绿 #30b08f + 浅绿底 | 培训材料、轻量报告 |

每个风格用**色块卡片**展示：四个圆形色块（primary / bg / text / accent），选中后高亮。旁边有链接「去风格库看看效果 →」。

**Step 4 — 内容结构配置（根据版式动态切换）**

这是核心交互区。**根据 Step 2 选择的版式，展示不同的配置界面。**

---

#### 版式 A：A4 横版分页 → 「逐页添加」

用户逐页定义报告内容：

```
┌─────────────────────────────────────────────────┐
│ 页面结构（A4横版分页）                             │
│ ┌─────────────────────────────────────────────┐ │
│ │ 第1页：封面                                  │ │
│ │ 内容大纲：[本页是报告封面，包含报告标题、副标  │ │
│ │            题、团队信息和日期]               │ │
│ │ 使用组件：☑ info-card  ☑ kpi-card           │ │
│ │ 本页数据：[默认] [另选CSV] [手写JSON]        │ │
│ │                              [编辑] [删除]   │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 第2页：核心指标概览                          │ │
│ │ 内容大纲：[展示三大核心指标]                 │ │
│ │ 使用组件：☑ kpi-card ×3  ☑ highlight-quote  │ │
│ │ 本页数据：[上传CSV: returns.csv]             │ │
│ │                              [编辑] [删除]   │ │
│ └─────────────────────────────────────────────┘ │
│                                                │
│           [+ 添加一页]                          │
└─────────────────────────────────────────────────┘
```

#### 版式 B：PPT Slide → 「逐节添加」

PPT 没有固定"页数"概念——用户给的是演讲主题，AI 决定最终拆成多少页 slide。

```
┌─────────────────────────────────────────────────┐
│ 内容结构（PPT Slide 翻页）                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ 整体演讲大纲：                               │ │
│ │ [textarea] 本次培训约20分钟，分为三大部分：    │ │
│ │  一、估值政策背景与监管要求（5分钟）           │ │
│ │  二、五大资产类别估值方法论（10分钟）            │ │
│ │  三、系统操作演示与Q&A（5分钟）               │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 第1节：估值政策背景                           │ │
│ │ 内容要点：[财政部/中基协最新估值指引解读]     │ │
│ │ 建议slide数：[2-3页]                         │ │
│ │ 使用组件：☑ info-card  ☑ highlight-quote     │ │
│ │                              [编辑] [删除]   │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 第2节：五大资产估值方法                       │ │
│ │ 内容要点：[逐类介绍估值模型和系统支持特性]     │ │
│ │ 建议slide数：[5-8页]                         │ │
│ │ 使用组件：☑ data-table  ☑ compare-card       │ │
│ │                              [编辑] [删除]   │ │
│ └─────────────────────────────────────────────┘ │
│                                                │
│           [+ 添加一节]                          │
└─────────────────────────────────────────────────┘
```

**区别**：
- A4 是「页」= 一张纸，用户精确知道有几页
- PPT 是「节」= 一个演讲主题，AI 根据内容量决定该节拆成多少 slide。用户只需说"这节大概讲什么、给个 slide 数量建议"

#### 版式 C：自由滚动网页 → 「添加区块」

自由滚动网页是单页，按区块组织：

```
┌─────────────────────────────────────────────────┐
│ 页面区块（自由滚动网页）                           │
│ ┌─────────────────────────────────────────────┐ │
│ │ 区块1：Hero 首屏                             │ │
│ │ 内容大纲：[报告标题、一句话价值主张、CTA按钮]   │ │
│ │ 使用组件：☑ kpi-card ×3                      │ │
│ │                              [编辑] [删除]   │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 区块2：核心服务                              │ │
│ │ 内容大纲：[三大服务模块介绍]                  │ │
│ │ 使用组件：☑ info-card ×3                     │ │
│ │                              [编辑] [删除]   │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 区块3：案例成果                              │ │
│ │ 内容大纲：[头部股份行落地案例数据展示]         │ │
│ │ 使用组件：☑ big-number-row  ☑ highlight-quote │ │
│ │                              [编辑] [删除]   │ │
│ └─────────────────────────────────────────────┘ │
│                                                │
│           [+ 添加区块]                          │
└─────────────────────────────────────────────────┘
```

**三种版式的数据结构统一**，底层都是同一个 `pages` 数组：

```javascript
pages: [
  {
    id: 1,
    type: 'page',      // 'page' | 'section' | 'block' — 由版式决定
    name: '封面',
    outline: '本页是报告封面...',
    componentIds: ['info-card', 'kpi-card'],
    slideCountHint: null,  // 仅PPT版式用
    dataSource: null
  }
]
```

A4 的 `type='page'` 就是精确一页，PPT 的 `type='section'` AI 会拆成多 slide，Web 的 `type='block'` 是一个页面区块。拼装 prompt 时根据 `selectedLayout` 换不同的描述措辞。

**点击「+ 添加」→ 弹出配置面板：**

| 字段 | 说明 |
|------|------|
| 名称 | A4叫"页名称"，PPT叫"节名称"，Web叫"区块名称" |
| 内容大纲/要点 | textarea，200字以内。用户写的可能是口语化、含糊的想法（见7.3节） |
| 使用组件 | 多选，每个组件显示空状态缩略图。可选同一组件多次 |
| 建议 slide 数 | 仅 PPT 版式显示，可选值：1-2页 / 2-3页 / 3-5页 / 5-8页 / AI自行判断 |
| 数据来源 | 可选：跟随全局 / 独立 CSV / 独立 JSON / 无数据用占位 |

**Step 5 — 数据来源（全局默认）**

| 选项 | 说明 |
|------|------|
| 本地 CSV 上传 | 拖拽或选择 `.csv` 文件，Papa Parse 解析后预览前 5 行 |
| 手写 JSON | textarea 粘贴 JSON 数据 |
| 占位数据 | 不填，AI 用示例数据生成 |

Step 4 中每个页面/节/区块可覆盖全局数据源。

### 7.2 组件空状态缩略图

每个组件在定义中有一个 `thumbnailHTML` 字段，用纯 CSS/Tailwind 画出骨架轮廓（类似 skeleton loading）。在 Step 4 选择组件时展示缩略图，让用户直观看到组件结构。

### 7.3 用户输入含糊 → AI 主动扩展

业务用户写的内容大纲往往是口语化、简略的初步想法（如"基金表现还不错""这里放一些核心数据"）。提示词的 system prompt 部分需引导 AI 主动扩展：

```
【内容扩展要求】
用户提供的内容大纲可能是简略、口语化的初步想法。你需要：
1. 基于金融报告的专业语境，将粗略想法扩展为正式、结构化的报告文案
2. "表现不错"应扩展为具体的数据描述维度和分析视角
3. "放一些核心数据"应推断合理的指标类型和展示方式
4. 对含糊描述，结合报告主题、受众和用途，推断并补全合理专业内容
5. 不确定的具体数字用占位符如 [XX%] 或 [待填数据] 标记，不得编造
6. 整体语气和措辞符合受众期待（高管汇报：精炼结论先行；培训：循序渐进；客户展示：亮点突出）
```

### 7.4 提示词生成逻辑

用户完成 Step 1-5 后，点击「生成提示词」，系统拼装结构化提示词。

**提示词组装结构**：

```
你是金融报告HTML生成专家。基于Tailwind CSS CDN生成专业HTML报告。

【内容扩展要求】
{7.3 的内容扩展要求文本}

【版式要求】
{选自 layouts 的 aiPrompt}

【风格要求】
{选自 styles 的 aiPrompt}

【组件参考 - 请严格参照以下组件的HTML结构和Tailwind类名风格】
{循环 selectedComponents，每个输出：}
组件名：{name}
```html
{htmlSnippet}
```

【用户需求】
- 报告文件名：{reportFileName}
- 报告主题：{topic}
- 受众：{audience}  用途：{purpose}

内容结构（版式：{layoutName}）：
{根据版式不同，循环输出 pages：
  - A4：第{n}页：{name} / 内容概要：{outline} / 使用组件：{components}
  - PPT：第{n}节：{name} / 内容要点：{outline} / 建议拆为 {slideCountHint} 页slide / 使用组件：{components}
  - Web：区块{n}（{name}）：{outline} / 使用组件：{components}
}

数据源：{CSV前5行 / JSON / 占位说明}

【输出要求】
1. 将生成的完整HTML保存到文件：reports/{reportFileName}_v001.html
2. 输出完整HTML文件，基于Tailwind CSS CDN
3. 兼容桌面端、iPad、手机端响应式
4. 严格参照提供的组件代码风格，保持视觉一致性
5. 给每个关键组件容器添加 data-cid="{组件id}" 属性
6. PPT版式：根据每节内容量，合理拆分slide页数，确保每页信息密度适中
7. 不要输出解释，直接输出HTML代码
```

生成后显示在代码框中，下方有 **[一键复制]** 按钮。提示词中已包含文件保存路径指令，Claude 桌面端直接将 HTML 写入 `reports/`。

---

## 八、预览 & 修改页（preview-page）

### 8.1 布局

```
┌───────────────────┬──────────────────────┐
│ 版本历史           │  实时预览 (iframe)    │
│ ┌───────────────┐ │                      │
│ │ v003  14:30  │ │  ┌────────────────┐  │
│ │ v002  14:15  │ │  │ 生成的报告预览   │  │
│ │ v001  13:50  │ │  │                │  │
│ └───────────────┘ │  │  hover高亮元素  │  │
│ [刷新版本列表]     │  │  click定位代码  │  │
│                   │  └────────────────┘  │
├───────────────────┴──────────────────────┤
│ HTML 源码编辑器 (CodeMirror)             │
│ ← 选中版本自动加载 / 手动粘贴也支持       │
├──────────────────────────────────────────┤
│ 修改意见：                    [桌面/iPad/手机] │
│ [textarea]                          │
│ [生成改修指令并复制]                  │
└──────────────────────────────────────┘
```

### 8.2 版本管理

- 进入预览页时，调用 `/api/reports` 获取文件列表
- 按 `baseName` 匹配当前报告文件名，按时间倒序排列
- 点击某版本 → 读取内容 → 载入 CodeMirror → 更新 iframe 预览
- `Ctrl+S` 保存到当前版本文件

**工作流**：
1. 用户在 Claude 发提示词 → Claude 生成 HTML → 写入 `reports/xxx_v001.html`
2. 回工具点「刷新版本列表」→ 看到 v001 → 点击加载 → 预览
3. 想修改 → 在修改意见区输入 → 生成续写指令 → 复制 → Claude 继续对话
4. Claude 生成新版本 → 写入 `reports/xxx_v002.html`
5. 刷新列表 → 加载 v002 → 预览 → 满意

### 8.3 元素检查器（DevTools 式）

iframe 内注入 inspector 脚本：
- **hover** → 蓝色半透明边框高亮当前鼠标下元素
- **click** → 通过 `postMessage` 将元素特征（data-cid、文本片段、outerHTML前300字符）传给主应用
- **主应用** → 在 CodeMirror 中按 data-cid → 文本片段 → HTML 特征的优先级搜索 → 滚动到对应行 → 高亮闪烁 2 秒

详细实现见第十三节。

### 8.4 源码编辑器

- CodeMirror 6，语言模式 `html`，暗色主题
- 编辑即预览：代码变更 500ms 防抖自动更新 iframe

### 8.5 设备预览切换

- 桌面：100% / iPad：768px / 手机：375px
- 改变 iframe 外层容器 `max-width`

### 8.6 修改意见

用户输入 → 点击「生成修改指令」→ 系统生成续写提示词：

```
请基于以下现有HTML代码进行修改。

【修改要求】
{用户输入}

【现有HTML代码】
{当前编辑器完整HTML}

【输出要求】
1. 将修改后的HTML保存到：reports/{reportFileName}_v{nextVersion}.html
2. 直接输出完整HTML代码，不要解释
3. 保持原有的 data-cid 属性不变
```

---

## 九、导出页（export-page）

### 导出选项

| 选项 | 说明 | 适用场景 |
|------|------|---------|
| 下载 HTML 文件 | 浏览器触发下载独立 `.html` 文件 | 所有版式 |
| 复制 HTML 源码 | 一键复制到剪贴板 | 粘贴到别处 |
| 打印为 PDF | 调起 iframe `window.print()`，在打印对话框中选择"另存为 PDF" | A4 版式最佳 |

### 打印为 PDF 说明

- A4 版式 HTML 包含 `@page { size: A4 landscape; }` 规则，打印 = 矢量 PDF
- 其他版式也能打印，分页不如 A4 精准

### 导出前检查清单

UI 提示：已检查所有设备预览 / 数据已确认 / 标题日期落款已更新

---

## 十、三大资源库（详细数据结构）

### 10.1 版式库 — `js/resources/layouts/`

每个版式一个文件，结构：

```javascript
// js/resources/layouts/a4-landscape.js
const LAYOUT_A4_LANDSCAPE = {
  id: 'a4-landscape',
  name: 'A4 横版分页',
  category: 'print',           // 'print' | 'slide' | 'web'
  icon: '📄',
  description: 'A4横向多页，打印友好，每页独立分页，适合正式交付报告',
  // CSS 简笔缩略图
  thumbnailHTML: `<div class="w-full aspect-[1.414/1] bg-white border-2 border-gray-300 rounded shadow-sm flex flex-col p-1 gap-0.5">
    <div class="h-1.5 bg-gray-200 rounded w-2/3"></div>
    <div class="flex-1 grid grid-cols-3 gap-0.5">
      <div class="bg-gray-100 rounded"></div><div class="bg-gray-100 rounded"></div><div class="bg-gray-100 rounded"></div>
    </div>
  </div>`,
  // 给AI的版式约束（prompt片段）
  aiPrompt: `
【版式约束 - A4横版分页】
- 每个页面 <section class="page">，宽度 297mm，高度 210mm
- CSS设置 @page { size: A4 landscape; margin: 0; }
- 每页 page-break-after: always，最后一页除外
- 内容安全区 padding: 18mm 22mm，底部固定页码
- 响应式：屏幕浏览居中显示A4卡片，打印精确A4分页
  `,
  // Step 4 中该版式的配置项标签
  configLabels: {
    addButton: '+ 添加一页',
    nameLabel: '页名称',
    outlineLabel: '内容大纲',
    itemLabel: '页'
  }
};
```

```javascript
// js/resources/layouts/index.js
const LAYOUTS = [LAYOUT_A4_LANDSCAPE, LAYOUT_PPT_SLIDE, LAYOUT_WEB_SCROLL];
const LAYOUTS_BY_ID = Object.fromEntries(LAYOUTS.map(l => [l.id, l]));
```

### 10.2 风格库 — `js/resources/styles/`

```javascript
// js/resources/styles/business-blue.js
const STYLE_BUSINESS_BLUE = {
  id: 'business-blue',
  name: '商务蓝白',
  description: '正式稳重，适合高管汇报和正式交付',
  // 色块预览
  colorChips: ['#1e3a8a', '#f8fafc', '#1f2937', '#2563eb'],
  colors: {
    primary: '#1e3a8a', primaryLight: '#dbeafe',
    bg: '#f8fafc', bgCard: '#ffffff',
    text: '#1f2937', textMuted: '#64748b',
    accent: '#2563eb', border: '#e5e7eb'
  },
  // 给AI的风格约束
  aiPrompt: `
【风格约束 - 商务蓝白】
- 背景白底浅蓝灰调（bg-gray-50），卡片白色圆角（bg-white rounded-2xl shadow-lg p-6）
- 主色深蓝 #1e3a8a（标题、关键数字），强调亮蓝 #2563eb（标签、图表）
- 文字层级：标题 text-gray-900，正文 text-gray-700，辅助 text-gray-500
- 风格关键词：专业、正式、金融、机构
  `
};
```

```javascript
// js/resources/styles/index.js
const STYLES = [STYLE_BUSINESS_BLUE, STYLE_DARK_TECH, STYLE_FRESH_CLEAN];
const STYLES_BY_ID = Object.fromEntries(STYLES.map(s => [s.id, s]));
```

### 10.3 组件库 — `js/resources/components/`

每个组件一个文件夹，各含 `index.js`：

```javascript
// js/resources/components/kpi-card/index.js
const COMPONENT_KPI_CARD = {
  id: 'kpi-card',
  name: 'KPI 数字卡片',
  category: '数据展示',
  // 空状态骨架缩略图
  thumbnailHTML: `<div class="bg-white rounded-2xl shadow p-4 flex flex-col gap-2 w-36">
    <div class="h-2.5 bg-gray-200 rounded-full w-12"></div>
    <div class="h-6 bg-gray-200 rounded w-20"></div>
    <div class="h-2 bg-gray-100 rounded w-16"></div>
  </div>`,
  // AI参考用的完整代码片段（带示例数据）
  htmlSnippet: `<div data-cid="kpi-card" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
  <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">环比 +12.5%</span>
  <div class="text-5xl font-bold text-blue-900">3.28<span class="text-lg text-gray-400 font-normal">%</span></div>
  <p class="text-sm text-gray-500">七日年化收益率</p>
</div>`,
  // Vue版本供后期系统开发
  vueTemplate: `...`
};
```

```javascript
// js/resources/components/index.js
const COMPONENTS = [
  COMPONENT_KPI_CARD, COMPONENT_INFO_CARD, COMPONENT_PROCESS_STEP,
  COMPONENT_DATA_TABLE, COMPONENT_COMPARE_CARD, COMPONENT_TEAM_GRID,
  COMPONENT_HIGHLIGHT_QUOTE, COMPONENT_BIG_NUMBER_ROW
];
const COMPONENTS_BY_ID = Object.fromEntries(COMPONENTS.map(c => [c.id, c]));
```

**第一批组件清单**（8个）：kpi-card / info-card / process-step / data-table / compare-card / team-grid / highlight-quote / big-number-row

**组件约束**：
- `htmlSnippet` 必须是可直接渲染的独立 DOM 片段，全部 Tailwind 类名
- 根元素带 `data-cid="{组件id}"`
- 片段控制在 20 行以内

---

## 十一、数据流总览

```
用户操作                          工具行为                        Claude桌面端
───────                          ───────                        ────────────
浏览版式库/风格库/组件库
  │
  ▼
Step 1: 填基本信息
Step 2: 选版式 → 自动切换Step 4交互
Step 3: 选风格
Step 4: 按版式配置内容结构
Step 5: 配置数据源
  │
  ▼
点击「生成提示词」        ──→   拼装prompt（版式约束+风格tokens+
                               组件snippets+内容扩展要求+
                               页面结构+数据源+保存路径）
  ▼
点击「一键复制」          ──→   复制到剪贴板
  │                                                        ← 粘贴到Claude
  │                                                        ← Claude生成HTML
  │                                                        ← Claude写文件到
  │                                                          reports/xxx_v001.html
  ▼
切换到预览页
「刷新版本列表」          ──→   GET /api/reports
  ▼
点击版本 v001            ──→   载入CodeMirror → 更新iframe预览
  ▼
hover/click预览         ──→   元素高亮/代码定位
  ▼
写修改意见              ──→   生成续写指令并复制
  │                                                        ← Claude修改并保存v002
  ▼
刷新 → 加载v002 → 预览
  ▼
满意 → 切换到导出页     ──→   下载HTML / 打印PDF
```

---

## 十二、全局状态设计（app.js）

```javascript
const state = reactive({
  // 页面导航
  currentView: 'components-gallery',  // 默认先到组件库看看

  // 提示词表单
  reportFileName: '',               // 报告文件名
  reportTopic: '',
  audience: '',
  purpose: '',
  selectedLayoutId: null,
  selectedStyleId: null,
  pages: [],                        // 统一数据结构，type区分page/section/block
  globalDataSource: null,           // { type, content, filename }
  generatedPrompt: '',

  // 预览编辑
  versionList: [],
  currentVersion: null,
  htmlSource: '',
  modifyInstruction: '',
  regeneratedPrompt: '',
  devicePreview: 'desktop',
  inspectorEnabled: true,
  highlightedLine: null,

  // 导出
  exportFilename: '',
  exportFormat: 'html'
});
```

---

## 十三、重点难点提示

### 13.1 元素检查器注入

```javascript
function updatePreview(html) {
  const inspectorCode = `
<script>
(function() {
  let overlay = null;
  function createOverlay() {
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;border:2px solid #3b82f6;background:rgba(59,130,246,0.08);transition:all 0.12s ease;display:none;';
    document.body.appendChild(overlay);
  }
  document.addEventListener('mouseover', function(e) {
    if (!overlay) createOverlay();
    const t = e.target;
    if (t === document.body || t === document.documentElement) { overlay.style.display = 'none'; return; }
    const r = t.getBoundingClientRect();
    Object.assign(overlay.style, { left: r.left+'px', top: r.top+'px', width: r.width+'px', height: r.height+'px', display: 'block' });
  });
  document.addEventListener('click', function(e) {
    e.preventDefault(); e.stopPropagation();
    const t = e.target;
    const cid = t.getAttribute('data-cid') || t.closest('[data-cid]')?.getAttribute('data-cid') || '';
    const text = (t.textContent||'').trim().substring(0,80);
    const outer = t.outerHTML.substring(0,300);
    window.parent.postMessage({ type:'element-selected', data:{ cid, textSnippet:text, outerSnippet:outer } }, '*');
  }, true);
})();
<\/script>`;
  const finalHTML = html.replace('</body>', inspectorCode + '</body>');
  iframeRef.value.srcdoc = finalHTML;
}
```

### 13.2 CodeMirror 搜索定位

搜索策略：data-cid → 文本片段（30字符）→ HTML特征（80字符），找到后 `scrollIntoView` + 高亮2秒。

### 13.3 提示词中嵌入文件保存路径

```
将生成的完整HTML保存到文件：reports/{reportFileName}_v{version}.html
```

Claude 桌面端直接写文件到 `reports/` 目录。

---

## 十四、与 reference-demo 的关系

`reference-demo/` 下的三个文件是本工具的 **视觉参照标准**：
- `A4.html` → `a4-landscape` 参考模板
- `ppt.html` → `ppt-slide` 参考模板
- `web.html` → `web-scroll` 参考模板

抽取其 CSS 变量和组件模式为版式约束文本和组件 HTML Snippet，不把完整代码放入工具。

---

## 十五、交付物

| 文件/目录 | 说明 |
|-----------|------|
| `index.html` | 入口文件，Vue 应用壳 |
| `start.command` | 双击一键启动（`python3 server.py` + 打开浏览器） |
| `server.py` | Python 本地文件服务（零依赖） |
| `css/app.css` | 工具 UI 定制样式 |
| `js/app.js` | Vue 初始化 + 全局状态 + 6页面路由 |
| `js/utils.js` | 公共工具函数 |
| `js/resources/layouts/` | 版式库（3个版式 × 独立文件 + index.js注册表） |
| `js/resources/styles/` | 风格库（3个风格 × 独立文件 + index.js注册表） |
| `js/resources/components/` | 组件库（8个组件 × 独立文件夹 + index.js注册表） |
| `js/pages/prompt-page.js` | 提示词生成页 |
| `js/pages/preview-page.js` | 预览/版本/检查器页 |
| `js/pages/export-page.js` | 导出页 |
| `js/pages/layouts-gallery.js` | 版式库展示页 |
| `js/pages/styles-gallery.js` | 风格库展示页 |
| `js/pages/components-gallery.js` | 组件库展示页 |
| `reports/` | 用户生成的 HTML 存放目录 |

---

## 十六、后续扩展预留

1. **AI 直接对话集成** — 目前粘贴复制，后续在 preview-page 加 AI 对话面板，后端代理 Claude API
2. **Vue 组件映射** — `vueTemplate` 字段已预留，供开发团队从 AI HTML 重写为 Vue 组件
3. **后端接入** — server.py 可扩展为用户系统、数据库、API 代理
4. **报告模板预设** — `pages` 数据结构支持保存/加载配置快照，做「常用报告模板」
5. **多人协作** — `reports/` + 配置快照天然支持 Git 版本管理
6. **更多组件/风格/版式** — 按第三节「扩展资源库的方式」，新建文件+注册即可，互不干扰
