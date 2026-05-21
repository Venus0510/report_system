---
title: 任务: 等组件库搭建完成后，用户在ppt生成工具是一个的实现方法
date: 2026/05/20 14:57:32
sessionId: 1d51a887-0a58-4f45-8af0-4ab5937d9558
model: unknown
tags:
  - claude-code
  - conversation
---

# 任务: 等组件库搭建完成后，用户在ppt生成工具是一个的实现方法

**日期**: 2026/05/20 14:57:32
**会话 ID**: `1d51a887-0a58-4f45-8af0-4ab5937d9558`
**模型**: unknown

---


## 👤 用户问题

**时间**: 2026/05/20 14:57:32

等组件库搭建完成后，用户在ppt生成工具是一个怎么具体的操作流程，是用自然语言描述我要用什么风格组件板式，还是有个页面让用户输入和勾选，勾选时有预览看得到实际这个组件长什么样吗


---


## 🤖 Claude 回答

**时间**: 2026/05/20 14:59:40

你好！有什么我可以帮你的吗？

让我先仔细阅读 v2 版本的 SPEC.md 和相关文件，了解项目的全貌。

让我再看看 v1 版本和已有的 v3 目录，以及 v2 的对话记录了解已知问题。

让我再看看 v2 的对话记录，了解已知问题和用户反馈。

让我再快速了解 v2 对话记录的后续部分，确认已知问题。

我已经完整阅读了 SPEC.md、PROGRESS.md、DEMO_GUIDE.md 以及 conversation.md 全部内容，对项目全貌有了清晰理解。下面给出专业建议和方案。

---

## system_v3 组件库 — 架构方案与建议

### 一、核心判断

v2 的问题根因不是功能缺失，而是**架构边界不清**。组件库（资源库）、报告生成工具、预览编辑器全部耦合在一个 index.html 里，导致：
- 组件只是 JS 对象里的 `htmlSnippet` 字符串，无法独立预览
- 其他工具（标书、BI）完全无法复用
- 改一个组件可能影响整个工具

v3 要做的本质是：**把组件库从工具里剥离出来，升级为独立的基础设施层**。

---

### 二、目录结构设计

```
report_system/
├── ui-lib/                          # ← 组件库（本次第一步要建的）
│   ├── gallery.html                 # 总览浏览页（汇总入口）
│   ├── design-tokens/
│   │   ├── tokens.css               # CSS 自定义属性（所有组件引用这个）
│   │   ├── tailwind.config.js       # Tailwind theme 配置（给用 Tailwind 的项目）
│   │   └── preview.html             # Design Token 可视化预览页
│   ├── components/                  # 基础组件
│   │   ├── kpi-card/
│   │   │   ├── index.html           # ★ 独立可打开：渲染示例 + 代码展示
│   │   │   ├── template.html        # 纯 HTML 片段（AI prompt 参考用）
│   │   │   └── component.js         # Vue 3 组件定义（工具引用用）
│   │   ├── info-card/
│   │   ├── data-table/
│   │   ├── compare-card/
│   │   ├── timeline/                # 新增
│   │   └── ...
│   ├── charts/                      # 图表组件（ECharts 封装）
│   │   ├── bar-chart/
│   │   ├── line-chart/
│   │   ├── pie-chart/
│   │   └── ...
│   ├── layouts/                     # 版式模板
│   │   ├── a4-landscape/
│   │   ├── ppt-slide/
│   │   ├── web-scroll/
│   │   └── bi-dashboard/            # 新：BI 仪表盘版式
│   └── styles/                      # 风格/主题
│       ├── business-blue/
│       ├── dark-tech/
│       ├── fresh-clean/
│       └── ...
│
├── report-tool/                     # 报告生成工具（v3 重构版）
│   ├── index.html
│   ├── start.command
│   ├── server.py
│   ├── js/
│   └── ...                          # 引用 ../ui-lib/ 的组件
│
├── bid-tool/                        # 标书工具（后续）
│   └── ...                          # 同样引用 ../ui-lib/
│
├── bi-system/                       # 轻量 BI 系统（后续）
│   └── ...                          # 同样引用 ../ui-lib/
│
├── system_v1/                       # 保留，不动
└── system_v2/                       # 保留，不动
```

**关键设计决策**：`ui-lib/` 与各工具是**平级目录**，工具通过相对路径 `../ui-lib/components/xxx/` 引用组件。各工具独立启动、独立开发、互不干扰。

---

### 三、技术栈选型

| 层面 | 选型 | 理由 |
|------|------|------|
| **组件定义** | Vue 3 SFC（单文件组件） | v2已验证的方向，团队熟悉；CDN和构建两种用法都支持 |
| **构建工具** | Vite | 组件库需要模块化开发，Vite HMR体验极佳；但输出的 `template.html` 仍是纯HTML，工具侧可继续用CDN |
| **CSS框架** | Tailwind CSS v4 + CSS自定义属性 | Tailwind给AI生成HTML用（AI对Tailwind类名极熟）；CSS变量给Design Token用（框架无关，任何工具都能消费） |
| **图表** | ECharts 5 | 金融场景标配，封装为Vue组件后暴露出简单接口 |
| **组件库文档** | 原生HTML + 少量Vue（gallery.html） | 零依赖可打开，不需要额外文档站 |
| **类型系统** | JSDoc（暂不上TypeScript） | 业务同事也参与维护，降低门槛；后续可逐步加TS |

**重要：保留CDN可用性。** 组件库用Vite开发，但每个组件的 `template.html` 依然是纯Tailwind HTML片段——这意味着：
- AI 提示词里引用的组件代码仍然是纯HTML+Tailwind，AI直接能写
- 不需要构建工具的工具（如report-tool想做CDN-only）完全不受影响
- 需要构建能力的工具（如BI系统）可以 import Vue组件获得交互能力

---

### 四、单个组件的文件规范

以 `kpi-card` 为例，每个组件目录下 **3个文件**：

```
ui-lib/components/kpi-card/
├── index.html          # ★ 核心文件：独立打开 = 组件文档 + 实时预览
├── template.html       # 纯 HTML 片段，给 AI prompt 参考
└── component.js        # Vue 3 组件（给需要编程引用的工具）
```

#### 4.1 `index.html` — 独立预览页（重点设计）

这是你们 "像开源组件库一样" 想法的核心载体。打开后包含：

```
┌──────────────────────────────────────────────────┐
│  ← 返回组件库总览                                 │
│                                                  │
│  KPI 数字卡片                          [商务蓝白] │
│  ─────────────────────────────────────  [暗黑科技] │
│  ┌──────────────────────────────┐    [清新简约]   │
│  │  ↑ 实时渲染示例（可切换风格）  │                │
│  │  ┌──────────────────────┐   │                │
│  │  │ 环比 +12.5%          │   │                │
│  │  │    3.28%             │   │                │
│  │  │ 七日年化收益率        │   │                │
│  │  └──────────────────────┘   │                │
│  └──────────────────────────────┘                │
│                                                  │
│  Props / 数据接口                                │
│  ┌──────────────────────────────────────────────┐│
│  │ label: string    — 标签文本                   ││
│  │ value: number    — 指标数值                   ││
│  │ unit: string     — 单位                       ││
│  │ trend: string    — 趋势标签 (可选)             ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  代码示例                                        │
│  ┌──────────────────────────────────────────────┐│
│  │ <!-- HTML 用法（AI生成/纯静态场景）-->         ││
│  │ <div data-cid="kpi-card" class="bg-white..."> ││
│  │   ...                                         ││
│  │ </div>                                        ││
│  │                                               ││
│  │ <!-- Vue 组件用法（开发工具时）-->              ││
│  │ <KpiCard label="七日年化" :value="3.28" />     ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  [复制 HTML 片段]  [复制 Vue 代码]                │
└──────────────────────────────────────────────────┘
```

设计要点：
- **内联CSS变量切换风格**：页面顶部有风格切换按钮（business-blue / dark-tech / fresh-clean），点击后改变 `<html>` 上的 `data-theme` 属性，所有示例实时变色。不需要重新加载页面。
- **代码展示用 `<pre><code>` + 语法高亮**：简单用 Prism.js CDN 或自己写基础高亮
- **每个 `index.html` 完全自包含**：内联 `<style>` + 必要的 CDN `<script>`（Tailwind CDN、Vue CDN、ECharts CDN），双击即开

#### 4.2 `template.html` — AI 参考片段

```html
<!-- 就是最精简的纯HTML片段，给AI当 few-shot 参考 -->
<div data-cid="kpi-card" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
  <span class="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-3 py-1 rounded-full w-fit">环比 +12.5%</span>
  <div class="text-5xl font-bold" style="color:var(--color-primary)">3.28<span class="text-lg font-normal" style="color:var(--color-text-muted)">%</span></div>
  <p class="text-sm" style="color:var(--color-text-muted)">七日年化收益率</p>
</div>
```

#### 4.3 `component.js` — Vue 组件

```javascript
// 给开发工具时 import 使用
export default {
  name: 'KpiCard',
  props: {
    label: String,
    value: Number,
    unit: { type: String, default: '%' },
    trend: { type: String, default: '' }
  },
  template: `...`  // 或从 template.html 加载
};
```

---

### 五、Design Token 体系

这是整个组件库的**灵魂**。没有统一的Token，跨工具复用就是空谈。

```css
/* ui-lib/design-tokens/tokens.css */

:root {
  /* === 商务蓝白（默认）=== */
  --color-primary: #1e3a8a;
  --color-primary-light: #dbeafe;
  --color-bg: #f8fafc;
  --color-bg-card: #ffffff;
  --color-text: #1f2937;
  --color-text-muted: #64748b;
  --color-accent: #2563eb;
  --color-border: #e5e7eb;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* 阴影 */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 10px 25px rgba(0,0,0,0.08);

  /* 字体 */
  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 28px;
  --text-3xl: 40px;
}

/* 暗黑科技主题 */
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

/* 清新简约主题 */
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

**为什么用CSS自定义属性而不是纯Tailwind类名？**

1. **框架无关**：Vue项目、React项目、纯HTML项目，全都直接 `var(--color-primary)` 就能用
2. **运行时切换**：改一个 `data-theme` 属性，所有组件实时换肤
3. **AI友好**：AI生成的HTML里写 `style="color:var(--color-primary)"` 同样生效
4. **与Tailwind互补**：Tailwind做布局和工具类，Token做品牌色和风格变量

Tailwind v4 的 `@theme` 可以直接映射这些CSS变量，两者不冲突。

---

### 六、总览画廊页（gallery.html）

这是所有组件的**汇总浏览入口**，类似 Ant Design 的组件总览页。

```
┌─────────────────────────────────────────────────────┐
│  UI Library — 估值团队前端组件库                      │
│  ─────────────────────────────────────────────────── │
│  [设计规范] [基础组件] [图表] [版式] [风格]           │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ KPI 卡片  │ │ 信息卡片  │ │ 数据表格  │   ...      │
│  │ [缩略图]  │ │ [缩略图]  │ │ [缩略图]  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 柱状图    │ │ 折线图    │ │ 饼图      │   ...      │
│  │ [缩略图]  │ │ [缩略图]  │ │ [缩略图]  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  技术栈：Vue 3 + Tailwind CSS + ECharts 5            │
│  Design Tokens 规范 → [查看]                         │
└─────────────────────────────────────────────────────┘
```

- 每个组件卡片用 **iframe 嵌入** 对应组件的 `index.html` 缩略区域，所见即所得
- 点击卡片 → 跳转到组件独立的 `index.html`
- 顶部导航分类：基础组件 / 图表 / 版式 / 风格 / 设计规范
- gallery.html 本身可以双击打开，不依赖任何服务

---

### 七、工具如何调用组件库

三种消费方式，按复杂度递增：

#### 方式A：AI提示词引用（最简单，v2模式）

报告工具往AI提示词里注入 `template.html` 片段。通过路径读取：
```javascript
// 工具侧代码
const template = await fetch('../ui-lib/components/kpi-card/template.html')
  .then(r => r.text());
// 拼入prompt
```

#### 方式B：iframe嵌入预览

工具侧用 iframe 嵌入组件的 `index.html`：
```html
<iframe src="../ui-lib/components/kpi-card/index.html"></iframe>
```
这样工具里就能直接展示组件的交互预览，不需要复制代码。

#### 方式C：ES Module导入（BI系统用）

BI系统用Vite构建时，直接 import Vue组件：
```javascript
import KpiCard from '../ui-lib/components/kpi-card/component.js';
```
获得完整的Vue组件能力（响应式数据绑定、事件处理等）。

**三种方式并存，同一个组件目录满足三种场景。**

---

### 八、第一步实施计划（组件库搭建）

按优先级分4个阶段：

#### Phase 1 — 骨架与规范（1-2天）

| 产出 | 说明 |
|------|------|
| `ui-lib/design-tokens/tokens.css` | 3套风格的CSS变量定义 |
| `ui-lib/design-tokens/preview.html` | Token可视化预览（色块、字体阶梯、间距演示） |
| `ui-lib/components/kpi-card/` | 第一个完整组件（3个文件），作为模板范例 |
| `ui-lib/components/info-card/` | 第二个组件，验证模板可复用性 |
| `COMPONENT_SPEC.md` | 组件开发规范文档（文件结构、命名约定、必须包含的元素） |

**先做2个组件打通流程**，确认结构合理再铺量。

#### Phase 2 — 基础组件铺量（2-3天）

迁移v2的8个组件 + 新增实用组件：

| 类别 | 组件 |
|------|------|
| 数据展示 | kpi-card, big-number-row, data-table |
| 内容展示 | info-card, highlight-quote, team-grid |
| 流程展示 | process-step, timeline（新增） |
| 对比分析 | compare-card |
| 装饰/布局 | divider, section-header（新增） |

#### Phase 3 — 图表封装（2-3天）

基于ECharts封装：
- bar-chart, line-chart, pie-chart
- 每个chart暴露统一接口：`{ data, xField, yField, title }`
- `index.html` 里做交互式Demo：可编辑JSON数据实时预览图表变化

#### Phase 4 — 版式 + 总览页（2天）

- 3套版式的独立HTML（a4 / ppt / web）
- 5套风格预览（在现有3套基础上扩充）
- `gallery.html` 总览汇总页
- 各工具对接验证

---

### 九、几个重要的架构建议

**1. 不要急于用Vite把组件库做成npm包。** 第一阶段保持纯HTML+CDN打开方式，降低环境依赖。团队三个工具进度不一，组件库应该是"即开即用"的资源，不是"先build再跑"的依赖。Vite/Vue SFC等构建能力放在component.js里，给有构建环境的工具用，不影响CDN路径。

**2. template.html 是核心资产。** v2的经验证明：AI生成的HTML质量直接取决于你给它的few-shot示例质量。每个组件的template.html必须经过人工审核——确保Tailwind类名规范、data-cid完整、缩进清晰、无障碍性问题。这比Vue组件写得漂不漂亮重要十倍。

**3. Design Token先稳后扩。** 先用3套主题跑通，不要一上来定义20个Token。实践中发现缺什么加什么。Token的命名要偏向语义化（`--color-primary`）而非具体色值（`--color-blue-800`），这样换主题时不用改组件代码。

**4. 分离"组件"和"业务模板"。** ui-lib只放通用组件（按钮、卡片、图表、表格），不要放"货币基金报告模板"之类的业务组合。业务模板放在各自的工具目录里。这条边界不守住，组件库很快变成大杂烩。

**5. gallery.html用iframe嵌入组件预览。** 不要把所有组件代码都加载到gallery页面里（v2的components-gallery问题之一就是几百行代码全摊在一个页面）。iframe隔离加载，每个组件独立渲染，gallery只做导航汇总。

---

### 十、与v2的关键区别

| 维度 | v2 | v3（建议） |
|------|-----|-----------|
| 组件形态 | JS字符串 `htmlSnippet` | 独立HTML文件，可双击打开 |
| 组件预览 | 画廊页里的CSS骨架 | iframe嵌入真实渲染 |
| 跨工具复用 | 不可能（耦合在工具内） | 相对路径引用 `../ui-lib/` |
| 设计规范 | 散落在各组件JS里 | 集中在 `design-tokens/tokens.css` |
| 主题切换 | 不支持运行时切换 | `data-theme` 属性秒切 |
| 图表 | 无（靠AI临时写） | 预封装的ECharts图表 |
| 工具数量 | 1个 | 3个（报告+标书+BI） |

---

总结一句话：**v3的核心不是多做几个组件，而是把组件从工具里解放出来，变成团队共享的基础设施。** 第一步把 ui-lib 目录骨架、2个范例组件、Design Token和 gallery.html 跑通，后面铺组件就是体力活了。

需要我开始搭建 Phase 1 的骨架吗？还是对以上方案有需要调整的地方？

好，逐一回答四个确认点，有些地方我的建议会和你的预想有偏差，我会说清楚原因。

---

## 1. Design Token 的扩展机制与 Tailwind 封装

### Token 怎么扩

建议采用 **CSS 自定义属性 + 语义化命名** 的方案，而不是把 Token 写成 Tailwind 类名。原因很直接：

```
/* 新增一个风格只需要加这一段，其他什么都不用改 */
[data-theme="gov-red-gold"] {
  --color-primary: #8b1a1a;
  --color-primary-light: #fef2f2;
  --color-bg: #fafaf9;
  --color-bg-card: #ffffff;
  --color-text: #292524;
  --color-text-muted: #78716c;
  --color-accent: #ca8a04;
  --color-border: #e7e5e4;
}
```

新增一个 "政务红金" 风格：打开 `tokens.css`，加 10 行 CSS，完事。所有组件、所有图表、所有版式**自动适配新风格**，因为它们的颜色引用的是 `var(--color-primary)` 而不是 `#1e3a8a`。

v2 的问题恰恰就是颜色写死在组件的 Tailwind 类名里（`text-blue-900`、`bg-blue-50`），导致换风格时缩略图还是蓝色。

### Tailwind 类名能否封装复用？

可以，但和你设想的方式可能不同。不是"把风格定义成 Tailwind 类"，而是反过来：

**定义 "样式配方"（Style Recipe）作为可复用常量：**

```javascript
// ui-lib/design-tokens/recipes.js
const RECIPES = {
  'card-base': 'rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--space-lg)]',
  'card-elevated': 'rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] p-[var(--space-xl)]',
  'heading-lg': 'text-[var(--text-xl)] font-bold font-[var(--font-heading)]',
  'body-text': 'text-[var(--text-base)] font-[var(--font-body)]',
  'badge-primary': 'text-xs font-semibold px-3 py-1 rounded-full w-fit'
};
```

这些配方字符串**本身是 Tailwind 类名组合**，但里面的颜色/间距值引用了 CSS 变量。使用时直接拼：

```html
<div class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
```

AI 生成 HTML 时，prompt 里注入这些配方作为约束："所有卡片使用以下类名组合：`rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6`"。AI 会照做，且因为值是 CSS 变量，换主题自动变色。

**总结：Token 层用 CSS 变量做 "值" 的定义，Tailwind 做 "布局和排版" 的工具层，配方做 "组合复用" 的中间层。** 三层各司其职。

---

## 2. 版式库的内部结构

版式和组件**不应**使用完全一致的文件结构，因为它们本质不同。组件是内容积木，版式是容器骨架。

建议版式结构如下：

```
ui-lib/layouts/a4-landscape/
├── index.html              # 独立预览：用示例内容渲染一个完整A4报告
├── skeleton.html           # ★ 核心：页面骨架（不含内容，只有容器+分页逻辑+打印样式）
├── layout.css              # 版式专属样式（@page、page-break、容器尺寸）
└── README.md               # （可选）版式适用场景说明，不需要Vue组件
```

**skeleton.html 长什么样？**

```html
<!-- 这就是给AI看的"壳子"，AI往里填组件 -->
<div class="a4-page-container">
  <!-- @page { size: A4 landscape; margin: 0; } -->
  <section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg page-break-after-always">
    <div class="content-area px-[22mm] py-[18mm]">
      <!-- {{ page_content }} AI在这里填充组件 -->
    </div>
    <footer class="absolute bottom-[8mm] right-[22mm] text-sm text-[var(--color-text-muted)]">
      第 {{ page_num }} 页
    </footer>
  </section>
</div>
```

**与组件的关键区别：**

| 维度 | 组件 | 版式 |
|------|------|------|
| 职责 | 内容展示单元 | 页面容器+翻页逻辑+打印 |
| 可嵌套 | 组件放入版式 | 版式包裹组件 |
| Vue 组件 | 需要（交互绑定数据） | 不需要（纯结构+CSS） |
| AI 如何使用 | 参照 htmlSnippet 复制写法 | 作为外层模板，在里面填充组件 |
| 文件数 | 3个（index.html, template.html, component.js） | 3个（index.html, skeleton.html, layout.css） |

版式不需要 `component.js`，因为版式不是交互组件——它是静态的 HTML 骨架 + CSS 规则。A4 版式的翻页是 CSS `page-break-after` 控制的，PPT 版式的翻页是简单的 JS 显隐逻辑，这些都放在 `skeleton.html` 的 `<script>` 标签里即可。

---

## 3. report-tool.html 独立运行 —— 怎么调用组件库，怎么和 AI 交互

这是四个问题里最重要的一个，也是我的建议和你预想偏差最大的地方。

### 3.1 技术约束：file:// 协议的现实限制

report-tool.html 双击打开 → 浏览器地址栏是 `file:///Users/xxx/report_system/report-tool/report-tool.html`。这时：

- `fetch('../ui-lib/components/kpi-card/template.html')` → **Safari 可以，Chrome 默认不行**（Chrome 禁止 file:// 下访问父级目录）
- `<iframe src="../ui-lib/components/kpi-card/index.html">` → **所有浏览器都支持**（iframe 加载 file:// 子资源不受限）
- `<img src="../ui-lib/design-tokens/preview.html">` → 同上，支持

**结论：如果 report-tool 要通过 fetch 动态读取组件模板拼进提示词，在 Chrome 上行不通。** 团队用 Safari 的话可以，但不能假设所有人都用 Safari。

### 3.2 我的建议：换个思路，不需要动态读取

v2 的核心痛点是 **"一个巨大的提示词丢给 AI，AI 卡壳"**。你在 conversation.md 里已经发现了：

> "我的内容非常多，给到ai后输出文件太大了，卡壳了，所以我们要分步输出"

那 v3 的方向就不该是 "工具读组件模板 → 拼成更大的提示词 → AI 更卡"。而应该是 **"多轮对话，渐进生成"**。

#### 推荐的工作流（v3）

```
第一轮：搭骨架
  用户在工具里选：版式=A4横版、风格=商务蓝白、主题=货币基金月度报告
  → 生成"骨架提示词"（~800字）
  → AI生成只有容器的空壳HTML，每页标记 [待填充内容]
  → 保存为 货币基金报告_v001.html

第二轮：填内容（逐页/逐区块）
  用户选：第1页用 kpi-card + data-table，内容概要：展示三大收益率指标
  → 生成"内容提示词"（~500字，含当前页组件的template片段）
  → AI基于v001.html修改，填充第1页
  → 保存为 v002

第三轮：填第2页
  → 同样流程，AI基于v002继续

第四轮：精细修改
  → 自然语言描述微调
  → AI生成v004
```

**这个模型下，report-tool.html 不需要 fetch 任何组件文件。** 它只需要：

1. **内置组件注册表**（轻量，纯元数据，~2KB）：

```javascript
const COMPONENT_REGISTRY = [
  { id: 'kpi-card', name: 'KPI数字卡片', category: '数据展示',
    description: '大数字+趋势标签+说明文字',
    templatePath: '../ui-lib/components/kpi-card/template.html' },
  { id: 'data-table', name: '数据表格', category: '数据展示',
    description: '蓝色表头+斑马纹行',
    templatePath: '../ui-lib/components/data-table/template.html' },
  // ... 20个组件也就2KB
];
```

2. **提示词模板引擎**：根据用户选择，拼装结构化的分步提示词。**提示词里引用组件路径，但不嵌入组件代码**——AI 自己去读（Claude 桌面端有文件系统权限）。

提示词关键段落：

```
【组件参考】
请使用以下路径的组件模板作为 HTML 代码参考：
- KPI卡片：ui-lib/components/kpi-card/template.html
- 数据表格：ui-lib/components/data-table/template.html
每个组件的 data-cid 属性、Tailwind 类名风格、HTML 结构请严格参照模板文件。
```

如果担心 AI 不主动读文件，用户可以在 Claude Desktop 里把 `template.html` 文件拖进去作为附件——这和 v2 "粘贴代码块"效果一样，但更灵活。

### 3.3 如果我这个建议你不同意

如果你坚持要工具在生成提示词时自动嵌入组件模板，那就不能完全去掉服务。最小代价方案是在 `start.command` 里加一行：

```bash
# start.command（仍然双击启动，但不是Python）
open -a "Google Chrome" --args --allow-file-access-from-files "$(dirname "$0")/report-tool.html"
```

或者保留一个极简 Python 服务（就是 SPEC.md 里那50行），用户的感知只是双击 start.command 而已，服务在后台透明运行。

**坦率地说：我建议保留极简 server。** 用户双击 start.command 的体验完全不变，但消除了所有 file:// 的坑。而且 gallery.html 里用 iframe 加载组件独立预览时，HTTP 服务下 iframe 通信（postMessage）也更可靠。

---

## 4. 总览画廊页布局

你的设想完全可行，这是最没有争议的一点。具体设计：

```
┌──────────────────┬──────────────────────────────────────────────┐
│  左侧菜单栏       │           右侧内容区                          │
│  (w-64, 固定)    │                                              │
│                  │   ┌──────────────────────────────────────┐  │
│  UI Library      │   │  设计规范 / 基础组件 / 图表           │  │
│  ────────────    │   │                        [商务蓝白 ▾]  │  │
│                  │   │  一键切换风格按钮 →                    │  │
│  📐 设计规范      │   └──────────────────────────────────────┘  │
│    · 色彩系统     │                                              │
│    · 字体排版     │   ┌─────────────────────────────────────┐   │
│    · 间距圆角     │   │                                     │   │
│                  │   │   当前选中组件的实时预览              │   │
│  🧩 基础组件      │   │   （默认显示第一个组件，              │   │
│    · KPI卡片     │   │    风格切换后立即变色）               │   │
│    · 信息卡片     │   │                                     │   │
│    · 数据表格     │   │   ┌───────────────────────────┐    │   │
│    · 流程步骤     │   │   │ 环比 +12.5%               │    │   │
│    · 对比卡片     │   │   │    3.28%                  │    │   │
│    · 团队网格     │   │   │ 七日年化收益率              │    │   │
│    · 亮点引用     │   │   └───────────────────────────┘    │   │
│    · 大数字行     │   │                                     │   │
│    · 时间轴       │   │   ── 代码示例 ──                    │   │
│                  │   │   <div data-cid="kpi-card" ...>     │   │
│  📊 图表          │   │   ...                               │   │
│    · 柱状图       │   │                                     │   │
│    · 折线图       │   │   [复制HTML] [复制Vue] [全屏预览]   │   │
│    · 饼图         │   └─────────────────────────────────────┘   │
│                  │                                              │
│  📄 版式          │                                              │
│    · A4横版       │                                              │
│    · PPT翻页      │                                              │
│    · 自由滚动     │                                              │
│                  │                                              │
│  🎨 风格          │                                              │
│    · 商务蓝白     │                                              │
│    · 暗黑科技     │                                              │
│    · 清新简约     │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### 交互逻辑

- **左侧菜单**：一级分类可折叠。点击二级菜单项 → 右侧切换到对应组件/版式/风格的预览
- **风格切换按钮**：右上角下拉选择器，切换 `data-theme` 属性 → 右侧预览区所有元素即时变色。这个按钮**全局有效**，不管你在看哪个组件，切换风格都立即反映
- **右侧内容区**：渲染的不是缩略图，而是**组件 template.html 的真实渲染效果**（内联在 gallery 页面里），配合下方带语法高亮的代码块。用户看到的效果 = AI 将生成的 HTML 效果
- **"全屏预览"按钮**：打开组件独立的 `index.html`（新标签页），获取完整的组件文档体验

### 实现要点

```javascript
// gallery.html 核心状态
const state = reactive({
  activeCategory: 'components',   // 左侧当前选中的一级分类
  activeItem: 'kpi-card',         // 当前选中的二级项目
  currentTheme: 'business-blue'   // 当前风格
});

// 切换风格 → 改根元素 data-theme，所有内联预览自动变色
function switchTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.currentTheme = theme;
  // CSS 变量即时生效，不需要重新渲染任何东西
}
```

每个组件的预览渲染使用 `v-html` 直接注入 `template.html` 的内容，因为它们共享同一个 `<html>` 的 `data-theme`，CSS 变量全部自动响应——这是用 CSS 自定义属性方案的核心优势。

---

## 总结与偏差说明

| 你的预想 | 我的建议 | 偏差原因 |
|----------|----------|----------|
| Token全用Tailwind封装 | CSS变量为主，Tailwind配方为辅 | 换肤需要运行时动态性，Tailwind静态类名做不到 |
| 版式结构=组件结构 | 版式去掉component.js，加skeleton.html | 版式是容器不是组件，不需要Vue封装 |
| report-tool完全独立，零服务 | 建议保留极简server或用Safari；提示词改多轮模式 | file://协议有跨浏览器兼容问题；多轮提示词解决AI卡壳 |
| gallery卡片式网格布局 | 左侧菜单+右侧预览 | 完全同意，这是更好的方案 |

最大的偏差在第三点——**我建议把 "一次性大提示词" 改为 "多轮渐进提示词"**。这不仅是技术问题，更是从 v2 的实际使用教训出发：大提示词让 AI 卡壳，分步才是正解。report-tool 的定位应该是 **"提示词编排器"** 而非 **"组件代码注入器"**。

需要就哪个点展开聊细节？

好，直接回答。

---

## 第三点深度拆解

### 一、保留 server 到底解决了什么？

v2 的 server.py 做了两件事：

| 功能 | 用途 | v3 还需要吗？ |
|------|------|--------------|
| 静态文件服务 | 让 index.html 通过 `http://localhost:8080` 访问 | gallery.html 和 report-tool.html 用 iframe 加载同级/子级文件时，file:// 完全够用，**不需要** |
| reports/ 文件 API | 列出/读取/保存/删除报告文件 | Claude Desktop 直接写文件到 reports/，用户电脑上已经有文件了，**不需要** |

v2 需要 server 的根因是：它是一个**单页应用**，Vue 接管了所有路由，用 v-show 切页面。这要求 HTTP 服务来保证 JS 模块加载和路由正常。

v3 如果是 **gallery.html 和 report-tool.html 各自独立的普通 HTML 文件**，不涉及 SPA 路由，不涉及 fetch 跨文件读取——server 就没有存在的必要。

**结论：server 主要解决的是 SPA 的运行环境和跨目录 fetch。去掉 SPA 架构、去掉动态读取组件文件的需求，server 就可以去掉。**

---

### 二、如果保留 server，用户要装什么？

这才是从 v2 继承过来的真问题，你在 SPEC.md 里写了 "macOS 自带 Python 3，零安装"，但这是**只对了一半**：

| 平台 | 情况 | 命令 |
|------|------|------|
| macOS (Ventura+) | 系统自带 Python 3 | `python3` |
| macOS (Monterey及更早) | 自带 Python 2.7，**没有 Python 3** | 需安装 |
| Windows 10/11 | **不内置 Python** | 需去 python.org 下载安装 |
| Windows 企业管控电脑 | 可能**不允许安装**外来软件 | 无法使用 |

"双击 start.command" 的体验只在**最新版 macOS**上成立。团队里如果有人用 Windows 或者旧 Mac，第一步就卡住了。这也是为什么 v2 的 PROGRESS.md 里 "Windows 支持 — 需要添加 start.bat" 一直是待办项。

**创建时间**: 2026年5月20日 11:19  
**使用模型**: opus  

---
name: report-system v3 架构决策 - 无服务端纯静态方案
description: v3 组件库和工具采用纯静态 HTML 文件，不依赖 Python 或任何后端服务，跨平台零安装
type: project
---

v3 系统不需要 server 服务。

- 原因：v3 采用多轮渐进提示词模式，report-tool.html 只是提示词编排表单，不需要动态 fetch 组件模板，不需要 SPA 路由，不需要 reports/ 文件管理 API。gallery.html 用 iframe 加载组件预览，file:// 协议下完全可用。
- 跨平台：macOS 和 Windows 均为零安装（不需要 Python），双击 HTML 文件即可在浏览器中打开。
- 架构：gallery.html（组件库总览）、report-tool.html（报告生成工具）、bid-tool.html（标书工具）均为独立静态 HTML，各自双击运行，通过相对路径访问 ui-lib/ 中的组件资源。
- 提示词策略：提示词不嵌入组件代码，只引用组件路径（如 ui-lib/components/kpi-card/template.html），由 Claude Desktop 端自行读取，提示词体积控制在 ~800 字以内。

**How to apply:** 组件库和工具开发时继续使用纯 HTML + CDN 方案，不引入 Python server 或 Node.js 构建步骤。新增工具时按照 gallery.html 模式：独立 HTML 文件 + CDN 引入 Vue/Tailwind + 相对路径引用 ui-lib/ 组件。

---

### 回答你的问题
好的，我来逐一清晰回答这四个确认点的问题，基于专业的判断给出建议，即使是和你的预想有偏差也会明确说明。

让我先重新审视一下 v2 的 SPEC 和对话记录，确保理解准确。
现在我已经全面理解了项目。让我针对你的四个确认点给出专业的回答和建议。

---

## 1. Design Token 的扩展机制与 Tailwind 封装

### Token 的扩展方案

**核心原则：CSS自定义属性（CSS Variables）为主，Tailwind 类名封装为辅。**

推荐的三层结构：

```
design-tokens/
├── tokens.css              # 核心：所有风格的 CSS 变量定义
├── tailwind-mappings.js     # 可选：CSS变量 → Tailwind 类名映射
└── preview.html             # Token 可视化预览页
```

**tokens.css 的设计：**

```css
/* ===== 基础商务蓝白（默认） ===== */
:root {
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
  --color-danger: #ef4444;
  
  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  
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

**扩展新风格只需要加一个 `[data-theme="xxx"]` 块，不需要改任何组件代码。**

### ❌ 不同风格不可以用 Tailwind 类名封装复用

**这是我与你的预想有偏差的地方**。Tailwind 的类名是静态编译的（`text-blue-900`、`bg-blue-50`），而风格切换需要运行时的动态性。如果把颜色写死在 Tailwind 类名里：

- 切换风格时需要修改所有 DOM 元素的类名，性能差且容易漏
- 新增一种风格需要修改每个组件的 HTML 代码

**用 CSS 变量的优势：**
- `background: var(--color-bg-card)` → 换风格只需要改 CSS 变量值
- 组件代码不需要知道当前是哪种风格
- 运行时切换 `<html data-theme="dark-tech">` 生效

**Tailwind 的定位应该是什么？**

Tailwind 用来处理**布局、间距、排版**这些与颜色无关的样式：

```html
<!-- ✅ 布局用 Tailwind 类名 -->
<div class="flex flex-col gap-3 p-6 rounded-2xl shadow-lg">

<!-- ✅ 颜色用 CSS 变量 -->
style="background: var(--color-bg-card); color: var(--color-text);"
```

**可以做一个 Tailwind 配方体系（推荐）：**

```javascript
// tailwind-mappings.js — 给常用组合起名字
const STYLE_RECIPES = {
  'card-base': 'rounded-lg shadow-[var(--shadow-card)] p-6',
  'card-elevated': 'rounded-xl shadow-[var(--shadow-elevated)] p-8',
  'heading-xl': 'text-3xl font-bold',
  'body-text': 'text-base leading-relaxed',
  'badge': 'text-xs font-semibold px-3 py-1 rounded-full',
};
```

这样 AI 生成 HTML 时可以用这些配方名，而不是每次都重新写一遍。

---

## 2. 版式库的内部结构

### 版式 ≠ 组件，结构应该不同

**组件**是内容积木（KPI卡片、表格），**版式**是容器骨架（A4页面、PPT slide、网页），本质不同。

推荐版式库结构：

```
layouts/a4-landscape/
├── index.html              # 独立可打开的预览页
├── skeleton.html           # ★ 核心：页面骨架模板（AI 填空用）
└── layout.css              # 版式专属CSS（打印样式、页面尺寸、分页逻辑）
```

**版式不需要 Vue 组件（component.js）**。为什么？

| 对比维度 | 组件（components） | 版式（layouts） |
|----------|-------------------|----------------|
| 职责 | 内容展示单元 | 页面容器 + 翻页逻辑 |
| 数据绑定 | 需要 Vue（props/events） | 不需要（纯 HTML 结构） |
| 可交互 | 是 | 否（只是结构骨架） |
| AI 怎么用 | 参照代码结构写类似的 HTML | 在这个骨架里填入具体内容 |
| 文件数 | 3（index + template + component.js） | 3（index + skeleton + layout.css） |

### skeleton.html 的核心作用

这是版式库的灵魂——**给 AI 看的空壳模板**：

```html
<!-- layouts/a4-landscape/skeleton.html -->
<!-- 这是 AI 生成报告的骨架模板，请在此结构内填充内容 -->

<!-- @page { size: A4 landscape; margin: 0; } -->
<section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg relative page-break-after-always">
  <div class="content-area px-[22mm] py-[18mm]">
    <!-- ===== 第 {{N}} 页内容区 ===== -->
    <!-- AI 会在这里填充组件（kpi-card、data-table等） -->
  </div>
  <footer class="absolute bottom-[8mm] right-[22mm] text-sm text-gray-400">
    第 {{page_num}} 页
  </footer>
</section>
```

**三种版式的 skeleton 要点：**

| 版式 | skeleton 关键特征 | 翻页方式 |
|------|------------------|----------|
| A4 横版 | 固定宽高 297mm×210mm，@page A4 landscape | page-break-after（CSS 打印分页） |
| PPT Slide | 100vw×100vh，overflow hidden | JS 控制 slide 显隐，键盘/点击切换 |
| 自由网页 | max-w-[1180px] mx-auto，响应式 | 自然滚动，分 section |

---

## 3. 无服务端时，report-tool.html 怎么调用组件库和 AI 交互

这是我与你预想偏差最大的部分，也是最重要的架构决策。让我展开说清楚。

### 3.1 file:// 协议的现实限制

report-tool.html 双击打开，浏览器地址栏是 `file:///.../report-tool.html`。

当你在这个页面里执行 `fetch('../ui-lib/components/kpi-card/template.html')` 时：

| 浏览器 | file:// 下 fetch 跨目录文件 | 结果 |
|--------|---------------------------|------|
| Safari | 🟢 允许 | 正常工作 |
| Chrome | 🔴 禁止（安全策略） | 报错 CORS |
| Edge | 🔴 禁止 | 报错 CORS |
| Firefox | 🔴 限制更严 | 无法跨目录读取 |

**结论：依赖 fetch 动态读取组件模板，大概率在 Chrome 上行不通，而 Chrome 是企业用户最常用的浏览器。**

### 3.2 多轮对话模式下，不需要动态读取

这是我建议的核心改变。回顾 v2 的痛点（你实际测试发现的）：

> "内容非常多，把提示词给到 AI 后输出文件太大了，卡壳了"

所以 v3 的正确方向不是**更大的提示词**，而是**分步多轮**：

```
第一轮：搭骨架 — 仅版式 + 风格 + 主题
用户输入：
  报告主题：货币基金月度估值分析
  版式：A4 横版分页  
  风格：商务蓝白
  大致内容：封面 + 三大指标总览 + 收益率对比 + 风险提示 + 结论

工具生成的提示词（~500字，不会卡壳）：
  【版式约束】请参照 layouts/a4-landscape/skeleton.html 的页面结构
  【风格约束】请使用 styles/business-blue/tokens.css 的颜色方案
  【生成要求】用占位数据生成 5 页 A4 横版报告骨架，每页标记 [待填充]

⬇ Claude 生成 v001.html（空壳报告）
⬇ 用户：好的，骨架效果可以。现在开始填第1页，放 KPI 卡片和指标表


第二轮：填第1页
工具生成的提示词（~300字）：
  基于 reports/货币基金月度_v001.html 的第1页，
  参考 components/kpi-card/template.html 的代码风格，
  填入以下真实数据：...

⬇ Claude 基于 v001 修改 → 保存 v002
⬇ 用户通过预览页查看，发现第2页需要调整


第三轮：填第2页  
  同样模式，每次提示词控制在 ~300-500 字
```

### 3.3 report-tool.html 需要什么？

**不需要动态读取组件文件**。它只需要内置一个轻量的组件注册表：

```javascript
// report-tool.html 内置（硬编码，约 1-2KB）
const COMPONENT_CATALOG = [
  {
    id: 'kpi-card',
    name: 'KPI 数字卡片',
    category: '数据展示',
    icon: '📊',
    description: '展示核心指标数值（收益率、规模等），带趋势标签',
    // AI 参考路径（给到提示词里，不是自己读）
    refPath: '../ui-lib/components/kpi-card/template.html',
    // 适用的数据场景
    dataHint: '需要：数值、单位、变化百分比'
  },
  {
    id: 'data-table',
    name: '数据表格',
    category: '数据展示',
    icon: '📋',
    description: '简洁标准表格，蓝白风格，适合 CSV 数据直接呈现',
    refPath: '../ui-lib/components/data-table/template.html',
    dataHint: '需要：CSV数据或表格行列数据'
  },
  // ... 其他 20 个组件
];
```

### 3.4 提示词怎么引用组件？

**不嵌入代码，只引用路径。** 提示词里写：

```
【组件使用说明】
本次报告需要使用以下组件：
- KPI 数字卡片：请参照 ui-lib/components/kpi-card/template.html 的 HTML 结构和 Tailwind 类名
- 数据表格：请参照 ui-lib/components/data-table/template.html 的 HTML 结构
每个组件的 data-cid 属性必须保留，CSS 变量名（如 var(--color-primary)）不要改动
```

**为什么 AI 能看到这些文件？**
- Claude Desktop 有工作目录的概念，可以直接读取本地文件
- 用户也可以在 Claude Desktop 里把 template.html 拖进去作为附件

### 3.5 仍然需要一个超轻量服务吗？

**不需要。** gallery.html 和 report-tool.html 都作为纯静态 HTML 运行：

| 页面 | 怎么运行 | 需要服务吗 |
|------|---------|-----------|
| gallery.html（组件总览） | 双击打开，iframe 加载子组件预览 | ✅ 不需要。iframe 加载相对路径 file:// 无限制 |
| report-tool.html（生成提示词） | 双击打开，纯表单 + 文本拼接 | ✅ 不需要。没有 fetch 调用 |
| 组件独立 index.html（如 kpi-card） | 双击打开，自包含 HTML | ✅ 不需要 |

---

## 4. 总览画廊页布局

### 推荐：左右两栏布局

这与你的预想一致，具体设计：

```
┌──────────────────┬──────────────────────────────────────────────────┐
│  左侧菜单栏       │                 右侧内容预览区                     │
│  (w-64 固定240px) │                                                  │
│                  │  ┌─────────────────────────────────────────────┐ │
│  📐 设计规范      │  │  KPI 数字卡片                  [商务蓝白 ▾] │ │
│    · 色彩系统     │  │  ─────────────────────────────────────────  │ │
│    · 字体排版     │  │                                             │ │
│    · 间距圆角     │  │  ┌───────────────────────────────────────┐ │ │
│                  │  │  │                                       │ │ │
│  🧩 基础组件      │  │  │    实时预览区（看到的 = 实际效果）       │ │ │
│    · KPI卡片 ◀   │  │  │    ┌───────────────────────────┐      │ │ │
│    · 信息卡片     │  │  │    │ 环比 +12.5%               │      │ │ │
│    · 数据表格     │  │  │    │    3.28%                  │      │ │ │
│    · 流程步骤     │  │  │    │ 七日年化收益率              │      │ │ │
│    · 对比卡片     │  │  │    └───────────────────────────┘      │ │ │
│    · 团队网格     │  │  │                                       │ │ │
│    · 亮点引用     │  │  │  风格切换后自动变色                     │ │ │
│    · 大数字行     │  │  └───────────────────────────────────────┘ │ │
│    · 时间轴       │  │                                             │ │
│                  │  │  ┌─ 代码示例 ──────────────────────────────┐ │ │
│  📊 图表组件      │  │  │ <div data-cid="kpi-card"               │ │ │
│    · 柱状图       │  │  │   class="bg-[var(--color-bg-card)]     │ │ │
│    · 折线图       │  │  │   rounded-[var(--radius-lg)] ..."      │ │ │
│    · 饼图         │  │  │   ...                                  │ │ │
│    · 仪表盘       │  │  └────────────────────────────────────────┘ │ │
│                  │  │                                             │ │
│  📄 版式模板      │  │  [复制 HTML] [复制 Vue 组件] [全屏预览]     │ │
│    · A4横版       │  └─────────────────────────────────────────────┘ │
│    · PPT翻页      │                                                  │
│    · 自由滚动     │                                                  │
│                  │                                                  │
│  🎨 主题风格      │                                                  │
│    · 商务蓝白     │                                                  │
│    · 暗黑科技     │                                                  │
│    · 清新简约     │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘
```

### 交互设计要点

**1. 左侧菜单交互：**
- 一级菜单（设计规范/基础组件/图表/版式/风格）可折叠，默认全部展开
- 点击二级项（如 KPI卡片）→ 右侧内容区切换到对应组件的实时预览
- 当前选中的二级项高亮显示（深蓝背景）

**2. 右侧内容——风格切换按钮：**
- 位置：右上角固定
- 默认显示：商务蓝白风格
- 点击下拉菜单选择风格 → 立即切换，预览区组件实时变色
- **所有组件共享同一个风格选择器**，不需要一个一个组件单独切换

**3. 风格切换原理（CSS 变量优势）：**

```html
<!-- gallery.html -->
<html data-theme="business-blue">
  ...
  <div style="background: var(--color-bg-card); color: var(--color-text)">
    预览内容
  </div>
</html>
```

```javascript
// 切换风格函数
function switchTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
  // 所有使用了 var(--color-xxx) 的元素自动变色
  // 不需要重新渲染任何组件！
}
```

**4. 右侧内容区——三种展示模式（建议按 Tab 切换）：**

- Tab 1：**实时预览** — 默认激活，真实渲染组件（带示例数据）
- Tab 2：**HTML 代码** — 完整的 HTML 源代码，带语法高亮
- Tab 3：**Vue 用法** — Vue 组件的 props 说明 + 代码示例

---

## 整体架构总览

```
report_system/
├── ui-lib/                             # 组件库（独立，各工具共享）
│   ├── gallery.html                    # 总览页（左右两栏布局）
│   ├── design-tokens/
│   │   ├── tokens.css                  # CSS 变量定义 + 3套风格主题
│   │   └── preview.html               # Token 可视化展示
│   │
│   ├── components/                     # 基础组件
│   │   ├── kpi-card/
│   │   │   ├── index.html             # 独立可打开：预览 + 代码 + 参数说明
│   │   │   ├── template.html          # 纯 HTML 片段（AI 参考）
│   │   │   └── component.js           # Vue 3 组件定义
│   │   ├── info-card/
│   │   ├── data-table/
│   │   ├── timeline/
│   │   └── ...（第一批 12-15 个组件）
│   │
│   ├── charts/                         # 图表组件
│   │   ├── bar-chart/
│   │   ├── line-chart/
│   │   └── pie-chart/
│   │
│   ├── layouts/                        # 版式模板
│   │   ├── a4-landscape/
│   │   │   ├── index.html             # 独立可打开预览
│   │   │   ├── skeleton.html          # ★ 骨架模板
│   │   │   └── layout.css             # 打印样式 + 页面尺寸
│   │   ├── ppt-slide/
│   │   └── web-scroll/
│   │
│   └── styles/                         # 主题风格
│       ├── business-blue/
│       ├── dark-tech/
│       └── fresh-clean/
│
├── report-tool/                        # 工具1：报告生成
│   └── report-tool.html               # 双击运行，纯静态
│
├── bid-tool/                           # 工具2：标书撰写（后续）
│   └── bid-tool.html
│
├── bi-system/                          # 工具3：轻量BI（后续）
│   └── bi-dashboard.html
│
├── system_v1/                          # 保留
└── system_v2/                          # 保留
```

---

## 总结：4个确认点的关键决策

| 确认点 | 决策 | 与你的预想是否一致 |
|--------|------|-------------------|
| 1. Token 扩展 | CSS 变量为主，Tailwind 用于布局，**不**用 Tailwind 封装风格 | ❌ 有偏差 — Tailwind 不适合做动态换肤 |
| 2. 版式库结构 | 和组件库相似但有区别：3个文件，不需要 Vue 组件，重点是 skeleton | ⚠️ 部分一致 — 结构相似但内容不同 |
| 3. 无服务调用 | **零服务端**，多轮渐进提示词，组件注册表内置在工具中，提示词引用路径不嵌入代码 | ❌ 有偏差 — 建议完全去掉服务 |
| 4. 画廊布局 | 左右两栏，左菜单右预览，右上角风格切换按钮 | ✅ 完全一致 |

需要继续深入讨论第三点（多轮对话的具体提示词格式），还是可以开始搭建 Phase 1 的代码了？

SPEC.md 已生成到 `system_v3/SPEC.md`。下面是文档结构概览，方便你快速定位：

| 章节 | 内容 |
|------|------|
| 一、产品定位 | ui-lib 与工具分离，组件库是共享基础设施 |
| 二、技术约束 | 纯静态、零服务端、全部CDN、CSS变量做颜色、Tailwind做布局 |
| 三、项目文件结构 | 完整目录树，ui-lib / report-tool / bid-tool / bi-system 并列 |
| 四、Design Token 体系 | tokens.css 完整定义、扩展方式、风格切换原理、Tailwind角色边界 |
| 五、组件规范 | 3文件结构（index.html / template.html / component.js）、每个文件的规范、12个组件清单 |
| 六、图表组件规范 | ECharts封装规范、统一数据接口、首批3个图表 |
| 七、版式规范 | 与组件的结构差异、skeleton.html 规范、三种版式对比 |
| 八、风格预览 | 每种风格独立预览页 |
| 九、总览画廊页 | 左右两栏布局详图、交互设计、Vue实现方式 |
| 十、报告生成工具 | 多轮渐进工作流、提示词模板、组件注册表、页面结构 |
| 十一、Token预览页 | 色彩/字体/间距/圆角可视化展示 |
| 十二、工具调用方式 | 三种方式：AI引用路径 / iframe嵌入 / Vue组件引用 |
| 十三、实施计划 | 4个Phase，Phase 1先做2个组件打通流程 |
| 十四、与v2区别 | 10个维度的对比表 |
| 十五、后续扩展 | 组件/风格/版式/工具扩展预留 |

你看看有没有需要调整的地方，确认后我们按 Phase 1 开始写代码。

---

## 📋 会话总结

**结束时间**: 2026/05/20 14:59:40
**总问题数**: 6
**总回答数**: 1

---


## 🤖 Claude 回答

**时间**: 2026/05/20 15:27:47

让我先仔细阅读 v2 版本的 SPEC.md 和相关文件，了解项目的全貌。

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:27:47

让我再看看 v1 版本和已有的 v3 目录，以及 v2 的对话记录了解已知问题。

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:27:47

让我再看看 v2 的对话记录，了解已知问题和用户反馈。

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:27:47

让我再快速了解 v2 对话记录的后续部分，确认已知问题。

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:27:47

我已经完整阅读了 SPEC.md、PROGRESS.md、DEMO_GUIDE.md 以及 conversation.md 全部内容，对项目全貌有了清晰理解。下面给出专业建议和方案。

---

## system_v3 组件库 — 架构方案与建议

### 一、核心判断

v2 的问题根因不是功能缺失，而是**架构边界不清**。组件库（资源库）、报告生成工具、预览编辑器全部耦合在一个 index.html 里，导致：
- 组件只是 JS 对象里的 `htmlSnippet` 字符串，无法独立预览
- 其他工具（标书、BI）完全无法复用
- 改一个组件可能影响整个工具

v3 要做的本质是：**把组件库从工具里剥离出来，升级为独立的基础设施层**。

---

### 二、目录结构设计

```
report_system/
├── ui-lib/                          # ← 组件库（本次第一步要建的）
│   ├── gallery.html                 # 总览浏览页（汇总入口）
│   ├── design-tokens/
│   │   ├── tokens.css               # CSS 自定义属性（所有组件引用这个）
│   │   ├── tailwind.config.js       # Tailwind theme 配置（给用 Tailwind 的项目）
│   │   └── preview.html             # Design Token 可视化预览页
│   ├── components/                  # 基础组件
│   │   ├── kpi-card/
│   │   │   ├── index.html           # ★ 独立可打开：渲染示例 + 代码展示
│   │   │   ├── template.html        # 纯 HTML 片段（AI prompt 参考用）
│   │   │   └── component.js         # Vue 3 组件定义（工具引用用）
│   │   ├── info-card/
│   │   ├── data-table/
│   │   ├── compare-card/
│   │   ├── timeline/                # 新增
│   │   └── ...
│   ├── charts/                      # 图表组件（ECharts 封装）
│   │   ├── bar-chart/
│   │   ├── line-chart/
│   │   ├── pie-chart/
│   │   └── ...
│   ├── layouts/                     # 版式模板
│   │   ├── a4-landscape/
│   │   ├── ppt-slide/
│   │   ├── web-scroll/
│   │   └── bi-dashboard/            # 新：BI 仪表盘版式
│   └── styles/                      # 风格/主题
│       ├── business-blue/
│       ├── dark-tech/
│       ├── fresh-clean/
│       └── ...
│
├── report-tool/                     # 报告生成工具（v3 重构版）
│   ├── index.html
│   ├── start.command
│   ├── server.py
│   ├── js/
│   └── ...                          # 引用 ../ui-lib/ 的组件
│
├── bid-tool/                        # 标书工具（后续）
│   └── ...                          # 同样引用 ../ui-lib/
│
├── bi-system/                       # 轻量 BI 系统（后续）
│   └── ...                          # 同样引用 ../ui-lib/
│
├── system_v1/                       # 保留，不动
└── system_v2/                       # 保留，不动
```

**关键设计决策**：`ui-lib/` 与各工具是**平级目录**，工具通过相对路径 `../ui-lib/components/xxx/` 引用组件。各工具独立启动、独立开发、互不干扰。

---

### 三、技术栈选型

| 层面 | 选型 | 理由 |
|------|------|------|
| **组件定义** | Vue 3 SFC（单文件组件） | v2已验证的方向，团队熟悉；CDN和构建两种用法都支持 |
| **构建工具** | Vite | 组件库需要模块化开发，Vite HMR体验极佳；但输出的 `template.html` 仍是纯HTML，工具侧可继续用CDN |
| **CSS框架** | Tailwind CSS v4 + CSS自定义属性 | Tailwind给AI生成HTML用（AI对Tailwind类名极熟）；CSS变量给Design Token用（框架无关，任何工具都能消费） |
| **图表** | ECharts 5 | 金融场景标配，封装为Vue组件后暴露出简单接口 |
| **组件库文档** | 原生HTML + 少量Vue（gallery.html） | 零依赖可打开，不需要额外文档站 |
| **类型系统** | JSDoc（暂不上TypeScript） | 业务同事也参与维护，降低门槛；后续可逐步加TS |

**重要：保留CDN可用性。** 组件库用Vite开发，但每个组件的 `template.html` 依然是纯Tailwind HTML片段——这意味着：
- AI 提示词里引用的组件代码仍然是纯HTML+Tailwind，AI直接能写
- 不需要构建工具的工具（如report-tool想做CDN-only）完全不受影响
- 需要构建能力的工具（如BI系统）可以 import Vue组件获得交互能力

---

### 四、单个组件的文件规范

以 `kpi-card` 为例，每个组件目录下 **3个文件**：

```
ui-lib/components/kpi-card/
├── index.html          # ★ 核心文件：独立打开 = 组件文档 + 实时预览
├── template.html       # 纯 HTML 片段，给 AI prompt 参考
└── component.js        # Vue 3 组件（给需要编程引用的工具）
```

#### 4.1 `index.html` — 独立预览页（重点设计）

这是你们 "像开源组件库一样" 想法的核心载体。打开后包含：

```
┌──────────────────────────────────────────────────┐
│  ← 返回组件库总览                                 │
│                                                  │
│  KPI 数字卡片                          [商务蓝白] │
│  ─────────────────────────────────────  [暗黑科技] │
│  ┌──────────────────────────────┐    [清新简约]   │
│  │  ↑ 实时渲染示例（可切换风格）  │                │
│  │  ┌──────────────────────┐   │                │
│  │  │ 环比 +12.5%          │   │                │
│  │  │    3.28%             │   │                │
│  │  │ 七日年化收益率        │   │                │
│  │  └──────────────────────┘   │                │
│  └──────────────────────────────┘                │
│                                                  │
│  Props / 数据接口                                │
│  ┌──────────────────────────────────────────────┐│
│  │ label: string    — 标签文本                   ││
│  │ value: number    — 指标数值                   ││
│  │ unit: string     — 单位                       ││
│  │ trend: string    — 趋势标签 (可选)             ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  代码示例                                        │
│  ┌──────────────────────────────────────────────┐│
│  │ <!-- HTML 用法（AI生成/纯静态场景）-->         ││
│  │ <div data-cid="kpi-card" class="bg-white..."> ││
│  │   ...                                         ││
│  │ </div>                                        ││
│  │                                               ││
│  │ <!-- Vue 组件用法（开发工具时）-->              ││
│  │ <KpiCard label="七日年化" :value="3.28" />     ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  [复制 HTML 片段]  [复制 Vue 代码]                │
└──────────────────────────────────────────────────┘
```

设计要点：
- **内联CSS变量切换风格**：页面顶部有风格切换按钮（business-blue / dark-tech / fresh-clean），点击后改变 `<html>` 上的 `data-theme` 属性，所有示例实时变色。不需要重新加载页面。
- **代码展示用 `<pre><code>` + 语法高亮**：简单用 Prism.js CDN 或自己写基础高亮
- **每个 `index.html` 完全自包含**：内联 `<style>` + 必要的 CDN `<script>`（Tailwind CDN、Vue CDN、ECharts CDN），双击即开

#### 4.2 `template.html` — AI 参考片段

```html
<!-- 就是最精简的纯HTML片段，给AI当 few-shot 参考 -->
<div data-cid="kpi-card" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
  <span class="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-3 py-1 rounded-full w-fit">环比 +12.5%</span>
  <div class="text-5xl font-bold" style="color:var(--color-primary)">3.28<span class="text-lg font-normal" style="color:var(--color-text-muted)">%</span></div>
  <p class="text-sm" style="color:var(--color-text-muted)">七日年化收益率</p>
</div>
```

#### 4.3 `component.js` — Vue 组件

```javascript
// 给开发工具时 import 使用
export default {
  name: 'KpiCard',
  props: {
    label: String,
    value: Number,
    unit: { type: String, default: '%' },
    trend: { type: String, default: '' }
  },
  template: `...`  // 或从 template.html 加载
};
```

---

### 五、Design Token 体系

这是整个组件库的**灵魂**。没有统一的Token，跨工具复用就是空谈。

```css
/* ui-lib/design-tokens/tokens.css */

:root {
  /* === 商务蓝白（默认）=== */
  --color-primary: #1e3a8a;
  --color-primary-light: #dbeafe;
  --color-bg: #f8fafc;
  --color-bg-card: #ffffff;
  --color-text: #1f2937;
  --color-text-muted: #64748b;
  --color-accent: #2563eb;
  --color-border: #e5e7eb;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* 阴影 */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 10px 25px rgba(0,0,0,0.08);

  /* 字体 */
  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 28px;
  --text-3xl: 40px;
}

/* 暗黑科技主题 */
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

/* 清新简约主题 */
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

**为什么用CSS自定义属性而不是纯Tailwind类名？**

1. **框架无关**：Vue项目、React项目、纯HTML项目，全都直接 `var(--color-primary)` 就能用
2. **运行时切换**：改一个 `data-theme` 属性，所有组件实时换肤
3. **AI友好**：AI生成的HTML里写 `style="color:var(--color-primary)"` 同样生效
4. **与Tailwind互补**：Tailwind做布局和工具类，Token做品牌色和风格变量

Tailwind v4 的 `@theme` 可以直接映射这些CSS变量，两者不冲突。

---

### 六、总览画廊页（gallery.html）

这是所有组件的**汇总浏览入口**，类似 Ant Design 的组件总览页。

```
┌─────────────────────────────────────────────────────┐
│  UI Library — 估值团队前端组件库                      │
│  ─────────────────────────────────────────────────── │
│  [设计规范] [基础组件] [图表] [版式] [风格]           │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ KPI 卡片  │ │ 信息卡片  │ │ 数据表格  │   ...      │
│  │ [缩略图]  │ │ [缩略图]  │ │ [缩略图]  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 柱状图    │ │ 折线图    │ │ 饼图      │   ...      │
│  │ [缩略图]  │ │ [缩略图]  │ │ [缩略图]  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  技术栈：Vue 3 + Tailwind CSS + ECharts 5            │
│  Design Tokens 规范 → [查看]                         │
└─────────────────────────────────────────────────────┘
```

- 每个组件卡片用 **iframe 嵌入** 对应组件的 `index.html` 缩略区域，所见即所得
- 点击卡片 → 跳转到组件独立的 `index.html`
- 顶部导航分类：基础组件 / 图表 / 版式 / 风格 / 设计规范
- gallery.html 本身可以双击打开，不依赖任何服务

---

### 七、工具如何调用组件库

三种消费方式，按复杂度递增：

#### 方式A：AI提示词引用（最简单，v2模式）

报告工具往AI提示词里注入 `template.html` 片段。通过路径读取：
```javascript
// 工具侧代码
const template = await fetch('../ui-lib/components/kpi-card/template.html')
  .then(r => r.text());
// 拼入prompt
```

#### 方式B：iframe嵌入预览

工具侧用 iframe 嵌入组件的 `index.html`：
```html
<iframe src="../ui-lib/components/kpi-card/index.html"></iframe>
```
这样工具里就能直接展示组件的交互预览，不需要复制代码。

#### 方式C：ES Module导入（BI系统用）

BI系统用Vite构建时，直接 import Vue组件：
```javascript
import KpiCard from '../ui-lib/components/kpi-card/component.js';
```
获得完整的Vue组件能力（响应式数据绑定、事件处理等）。

**三种方式并存，同一个组件目录满足三种场景。**

---

### 八、第一步实施计划（组件库搭建）

按优先级分4个阶段：

#### Phase 1 — 骨架与规范（1-2天）

| 产出 | 说明 |
|------|------|
| `ui-lib/design-tokens/tokens.css` | 3套风格的CSS变量定义 |
| `ui-lib/design-tokens/preview.html` | Token可视化预览（色块、字体阶梯、间距演示） |
| `ui-lib/components/kpi-card/` | 第一个完整组件（3个文件），作为模板范例 |
| `ui-lib/components/info-card/` | 第二个组件，验证模板可复用性 |
| `COMPONENT_SPEC.md` | 组件开发规范文档（文件结构、命名约定、必须包含的元素） |

**先做2个组件打通流程**，确认结构合理再铺量。

#### Phase 2 — 基础组件铺量（2-3天）

迁移v2的8个组件 + 新增实用组件：

| 类别 | 组件 |
|------|------|
| 数据展示 | kpi-card, big-number-row, data-table |
| 内容展示 | info-card, highlight-quote, team-grid |
| 流程展示 | process-step, timeline（新增） |
| 对比分析 | compare-card |
| 装饰/布局 | divider, section-header（新增） |

#### Phase 3 — 图表封装（2-3天）

基于ECharts封装：
- bar-chart, line-chart, pie-chart
- 每个chart暴露统一接口：`{ data, xField, yField, title }`
- `index.html` 里做交互式Demo：可编辑JSON数据实时预览图表变化

#### Phase 4 — 版式 + 总览页（2天）

- 3套版式的独立HTML（a4 / ppt / web）
- 5套风格预览（在现有3套基础上扩充）
- `gallery.html` 总览汇总页
- 各工具对接验证

---

### 九、几个重要的架构建议

**1. 不要急于用Vite把组件库做成npm包。** 第一阶段保持纯HTML+CDN打开方式，降低环境依赖。团队三个工具进度不一，组件库应该是"即开即用"的资源，不是"先build再跑"的依赖。Vite/Vue SFC等构建能力放在component.js里，给有构建环境的工具用，不影响CDN路径。

**2. template.html 是核心资产。** v2的经验证明：AI生成的HTML质量直接取决于你给它的few-shot示例质量。每个组件的template.html必须经过人工审核——确保Tailwind类名规范、data-cid完整、缩进清晰、无障碍性问题。这比Vue组件写得漂不漂亮重要十倍。

**3. Design Token先稳后扩。** 先用3套主题跑通，不要一上来定义20个Token。实践中发现缺什么加什么。Token的命名要偏向语义化（`--color-primary`）而非具体色值（`--color-blue-800`），这样换主题时不用改组件代码。

**4. 分离"组件"和"业务模板"。** ui-lib只放通用组件（按钮、卡片、图表、表格），不要放"货币基金报告模板"之类的业务组合。业务模板放在各自的工具目录里。这条边界不守住，组件库很快变成大杂烩。

**5. gallery.html用iframe嵌入组件预览。** 不要把所有组件代码都加载到gallery页面里（v2的components-gallery问题之一就是几百行代码全摊在一个页面）。iframe隔离加载，每个组件独立渲染，gallery只做导航汇总。

---

### 十、与v2的关键区别

| 维度 | v2 | v3（建议） |
|------|-----|-----------|
| 组件形态 | JS字符串 `htmlSnippet` | 独立HTML文件，可双击打开 |
| 组件预览 | 画廊页里的CSS骨架 | iframe嵌入真实渲染 |
| 跨工具复用 | 不可能（耦合在工具内） | 相对路径引用 `../ui-lib/` |
| 设计规范 | 散落在各组件JS里 | 集中在 `design-tokens/tokens.css` |
| 主题切换 | 不支持运行时切换 | `data-theme` 属性秒切 |
| 图表 | 无（靠AI临时写） | 预封装的ECharts图表 |
| 工具数量 | 1个 | 3个（报告+标书+BI） |

---

总结一句话：**v3的核心不是多做几个组件，而是把组件从工具里解放出来，变成团队共享的基础设施。** 第一步把 ui-lib 目录骨架、2个范例组件、Design Token和 gallery.html 跑通，后面铺组件就是体力活了。

需要我开始搭建 Phase 1 的骨架吗？还是对以上方案有需要调整的地方？

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:27:47

好，逐一回答四个确认点，有些地方我的建议会和你的预想有偏差，我会说清楚原因。

---

## 1. Design Token 的扩展机制与 Tailwind 封装

### Token 怎么扩

建议采用 **CSS 自定义属性 + 语义化命名** 的方案，而不是把 Token 写成 Tailwind 类名。原因很直接：

```
/* 新增一个风格只需要加这一段，其他什么都不用改 */
[data-theme="gov-red-gold"] {
  --color-primary: #8b1a1a;
  --color-primary-light: #fef2f2;
  --color-bg: #fafaf9;
  --color-bg-card: #ffffff;
  --color-text: #292524;
  --color-text-muted: #78716c;
  --color-accent: #ca8a04;
  --color-border: #e7e5e4;
}
```

新增一个 "政务红金" 风格：打开 `tokens.css`，加 10 行 CSS，完事。所有组件、所有图表、所有版式**自动适配新风格**，因为它们的颜色引用的是 `var(--color-primary)` 而不是 `#1e3a8a`。

v2 的问题恰恰就是颜色写死在组件的 Tailwind 类名里（`text-blue-900`、`bg-blue-50`），导致换风格时缩略图还是蓝色。

### Tailwind 类名能否封装复用？

可以，但和你设想的方式可能不同。不是"把风格定义成 Tailwind 类"，而是反过来：

**定义 "样式配方"（Style Recipe）作为可复用常量：**

```javascript
// ui-lib/design-tokens/recipes.js
const RECIPES = {
  'card-base': 'rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--space-lg)]',
  'card-elevated': 'rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] p-[var(--space-xl)]',
  'heading-lg': 'text-[var(--text-xl)] font-bold font-[var(--font-heading)]',
  'body-text': 'text-[var(--text-base)] font-[var(--font-body)]',
  'badge-primary': 'text-xs font-semibold px-3 py-1 rounded-full w-fit'
};
```

这些配方字符串**本身是 Tailwind 类名组合**，但里面的颜色/间距值引用了 CSS 变量。使用时直接拼：

```html
<div class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
```

AI 生成 HTML 时，prompt 里注入这些配方作为约束："所有卡片使用以下类名组合：`rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6`"。AI 会照做，且因为值是 CSS 变量，换主题自动变色。

**总结：Token 层用 CSS 变量做 "值" 的定义，Tailwind 做 "布局和排版" 的工具层，配方做 "组合复用" 的中间层。** 三层各司其职。

---

## 2. 版式库的内部结构

版式和组件**不应**使用完全一致的文件结构，因为它们本质不同。组件是内容积木，版式是容器骨架。

建议版式结构如下：

```
ui-lib/layouts/a4-landscape/
├── index.html              # 独立预览：用示例内容渲染一个完整A4报告
├── skeleton.html           # ★ 核心：页面骨架（不含内容，只有容器+分页逻辑+打印样式）
├── layout.css              # 版式专属样式（@page、page-break、容器尺寸）
└── README.md               # （可选）版式适用场景说明，不需要Vue组件
```

**skeleton.html 长什么样？**

```html
<!-- 这就是给AI看的"壳子"，AI往里填组件 -->
<div class="a4-page-container">
  <!-- @page { size: A4 landscape; margin: 0; } -->
  <section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg page-break-after-always">
    <div class="content-area px-[22mm] py-[18mm]">
      <!-- {{ page_content }} AI在这里填充组件 -->
    </div>
    <footer class="absolute bottom-[8mm] right-[22mm] text-sm text-[var(--color-text-muted)]">
      第 {{ page_num }} 页
    </footer>
  </section>
</div>
```

**与组件的关键区别：**

| 维度 | 组件 | 版式 |
|------|------|------|
| 职责 | 内容展示单元 | 页面容器+翻页逻辑+打印 |
| 可嵌套 | 组件放入版式 | 版式包裹组件 |
| Vue 组件 | 需要（交互绑定数据） | 不需要（纯结构+CSS） |
| AI 如何使用 | 参照 htmlSnippet 复制写法 | 作为外层模板，在里面填充组件 |
| 文件数 | 3个（index.html, template.html, component.js） | 3个（index.html, skeleton.html, layout.css） |

版式不需要 `component.js`，因为版式不是交互组件——它是静态的 HTML 骨架 + CSS 规则。A4 版式的翻页是 CSS `page-break-after` 控制的，PPT 版式的翻页是简单的 JS 显隐逻辑，这些都放在 `skeleton.html` 的 `<script>` 标签里即可。

---

## 3. report-tool.html 独立运行 —— 怎么调用组件库，怎么和 AI 交互

这是四个问题里最重要的一个，也是我的建议和你预想偏差最大的地方。

### 3.1 技术约束：file:// 协议的现实限制

report-tool.html 双击打开 → 浏览器地址栏是 `file:///Users/xxx/report_system/report-tool/report-tool.html`。这时：

- `fetch('../ui-lib/components/kpi-card/template.html')` → **Safari 可以，Chrome 默认不行**（Chrome 禁止 file:// 下访问父级目录）
- `<iframe src="../ui-lib/components/kpi-card/index.html">` → **所有浏览器都支持**（iframe 加载 file:// 子资源不受限）
- `<img src="../ui-lib/design-tokens/preview.html">` → 同上，支持

**结论：如果 report-tool 要通过 fetch 动态读取组件模板拼进提示词，在 Chrome 上行不通。** 团队用 Safari 的话可以，但不能假设所有人都用 Safari。

### 3.2 我的建议：换个思路，不需要动态读取

v2 的核心痛点是 **"一个巨大的提示词丢给 AI，AI 卡壳"**。你在 conversation.md 里已经发现了：

> "我的内容非常多，给到ai后输出文件太大了，卡壳了，所以我们要分步输出"

那 v3 的方向就不该是 "工具读组件模板 → 拼成更大的提示词 → AI 更卡"。而应该是 **"多轮对话，渐进生成"**。

#### 推荐的工作流（v3）

```
第一轮：搭骨架
  用户在工具里选：版式=A4横版、风格=商务蓝白、主题=货币基金月度报告
  → 生成"骨架提示词"（~800字）
  → AI生成只有容器的空壳HTML，每页标记 [待填充内容]
  → 保存为 货币基金报告_v001.html

第二轮：填内容（逐页/逐区块）
  用户选：第1页用 kpi-card + data-table，内容概要：展示三大收益率指标
  → 生成"内容提示词"（~500字，含当前页组件的template片段）
  → AI基于v001.html修改，填充第1页
  → 保存为 v002

第三轮：填第2页
  → 同样流程，AI基于v002继续

第四轮：精细修改
  → 自然语言描述微调
  → AI生成v004
```

**这个模型下，report-tool.html 不需要 fetch 任何组件文件。** 它只需要：

1. **内置组件注册表**（轻量，纯元数据，~2KB）：

```javascript
const COMPONENT_REGISTRY = [
  { id: 'kpi-card', name: 'KPI数字卡片', category: '数据展示',
    description: '大数字+趋势标签+说明文字',
    templatePath: '../ui-lib/components/kpi-card/template.html' },
  { id: 'data-table', name: '数据表格', category: '数据展示',
    description: '蓝色表头+斑马纹行',
    templatePath: '../ui-lib/components/data-table/template.html' },
  // ... 20个组件也就2KB
];
```

2. **提示词模板引擎**：根据用户选择，拼装结构化的分步提示词。**提示词里引用组件路径，但不嵌入组件代码**——AI 自己去读（Claude 桌面端有文件系统权限）。

提示词关键段落：

```
【组件参考】
请使用以下路径的组件模板作为 HTML 代码参考：
- KPI卡片：ui-lib/components/kpi-card/template.html
- 数据表格：ui-lib/components/data-table/template.html
每个组件的 data-cid 属性、Tailwind 类名风格、HTML 结构请严格参照模板文件。
```

如果担心 AI 不主动读文件，用户可以在 Claude Desktop 里把 `template.html` 文件拖进去作为附件——这和 v2 "粘贴代码块"效果一样，但更灵活。

### 3.3 如果我这个建议你不同意

如果你坚持要工具在生成提示词时自动嵌入组件模板，那就不能完全去掉服务。最小代价方案是在 `start.command` 里加一行：

```bash
# start.command（仍然双击启动，但不是Python）
open -a "Google Chrome" --args --allow-file-access-from-files "$(dirname "$0")/report-tool.html"
```

或者保留一个极简 Python 服务（就是 SPEC.md 里那50行），用户的感知只是双击 start.command 而已，服务在后台透明运行。

**坦率地说：我建议保留极简 server。** 用户双击 start.command 的体验完全不变，但消除了所有 file:// 的坑。而且 gallery.html 里用 iframe 加载组件独立预览时，HTTP 服务下 iframe 通信（postMessage）也更可靠。

---

## 4. 总览画廊页布局

你的设想完全可行，这是最没有争议的一点。具体设计：

```
┌──────────────────┬──────────────────────────────────────────────┐
│  左侧菜单栏       │           右侧内容区                          │
│  (w-64, 固定)    │                                              │
│                  │   ┌──────────────────────────────────────┐  │
│  UI Library      │   │  设计规范 / 基础组件 / 图表           │  │
│  ────────────    │   │                        [商务蓝白 ▾]  │  │
│                  │   │  一键切换风格按钮 →                    │  │
│  📐 设计规范      │   └──────────────────────────────────────┘  │
│    · 色彩系统     │                                              │
│    · 字体排版     │   ┌─────────────────────────────────────┐   │
│    · 间距圆角     │   │                                     │   │
│                  │   │   当前选中组件的实时预览              │   │
│  🧩 基础组件      │   │   （默认显示第一个组件，              │   │
│    · KPI卡片     │   │    风格切换后立即变色）               │   │
│    · 信息卡片     │   │                                     │   │
│    · 数据表格     │   │   ┌───────────────────────────┐    │   │
│    · 流程步骤     │   │   │ 环比 +12.5%               │    │   │
│    · 对比卡片     │   │   │    3.28%                  │    │   │
│    · 团队网格     │   │   │ 七日年化收益率              │    │   │
│    · 亮点引用     │   │   └───────────────────────────┘    │   │
│    · 大数字行     │   │                                     │   │
│    · 时间轴       │   │   ── 代码示例 ──                    │   │
│                  │   │   <div data-cid="kpi-card" ...>     │   │
│  📊 图表          │   │   ...                               │   │
│    · 柱状图       │   │                                     │   │
│    · 折线图       │   │   [复制HTML] [复制Vue] [全屏预览]   │   │
│    · 饼图         │   └─────────────────────────────────────┘   │
│                  │                                              │
│  📄 版式          │                                              │
│    · A4横版       │                                              │
│    · PPT翻页      │                                              │
│    · 自由滚动     │                                              │
│                  │                                              │
│  🎨 风格          │                                              │
│    · 商务蓝白     │                                              │
│    · 暗黑科技     │                                              │
│    · 清新简约     │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### 交互逻辑

- **左侧菜单**：一级分类可折叠。点击二级菜单项 → 右侧切换到对应组件/版式/风格的预览
- **风格切换按钮**：右上角下拉选择器，切换 `data-theme` 属性 → 右侧预览区所有元素即时变色。这个按钮**全局有效**，不管你在看哪个组件，切换风格都立即反映
- **右侧内容区**：渲染的不是缩略图，而是**组件 template.html 的真实渲染效果**（内联在 gallery 页面里），配合下方带语法高亮的代码块。用户看到的效果 = AI 将生成的 HTML 效果
- **"全屏预览"按钮**：打开组件独立的 `index.html`（新标签页），获取完整的组件文档体验

### 实现要点

```javascript
// gallery.html 核心状态
const state = reactive({
  activeCategory: 'components',   // 左侧当前选中的一级分类
  activeItem: 'kpi-card',         // 当前选中的二级项目
  currentTheme: 'business-blue'   // 当前风格
});

// 切换风格 → 改根元素 data-theme，所有内联预览自动变色
function switchTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.currentTheme = theme;
  // CSS 变量即时生效，不需要重新渲染任何东西
}
```

每个组件的预览渲染使用 `v-html` 直接注入 `template.html` 的内容，因为它们共享同一个 `<html>` 的 `data-theme`，CSS 变量全部自动响应——这是用 CSS 自定义属性方案的核心优势。

---

## 总结与偏差说明

| 你的预想 | 我的建议 | 偏差原因 |
|----------|----------|----------|
| Token全用Tailwind封装 | CSS变量为主，Tailwind配方为辅 | 换肤需要运行时动态性，Tailwind静态类名做不到 |
| 版式结构=组件结构 | 版式去掉component.js，加skeleton.html | 版式是容器不是组件，不需要Vue封装 |
| report-tool完全独立，零服务 | 建议保留极简server或用Safari；提示词改多轮模式 | file://协议有跨浏览器兼容问题；多轮提示词解决AI卡壳 |
| gallery卡片式网格布局 | 左侧菜单+右侧预览 | 完全同意，这是更好的方案 |

最大的偏差在第三点——**我建议把 "一次性大提示词" 改为 "多轮渐进提示词"**。这不仅是技术问题，更是从 v2 的实际使用教训出发：大提示词让 AI 卡壳，分步才是正解。report-tool 的定位应该是 **"提示词编排器"** 而非 **"组件代码注入器"**。

需要就哪个点展开聊细节？

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:27:47

好，直接回答。

---

## 第三点深度拆解

### 一、保留 server 到底解决了什么？

v2 的 server.py 做了两件事：

| 功能 | 用途 | v3 还需要吗？ |
|------|------|--------------|
| 静态文件服务 | 让 index.html 通过 `http://localhost:8080` 访问 | gallery.html 和 report-tool.html 用 iframe 加载同级/子级文件时，file:// 完全够用，**不需要** |
| reports/ 文件 API | 列出/读取/保存/删除报告文件 | Claude Desktop 直接写文件到 reports/，用户电脑上已经有文件了，**不需要** |

v2 需要 server 的根因是：它是一个**单页应用**，Vue 接管了所有路由，用 v-show 切页面。这要求 HTTP 服务来保证 JS 模块加载和路由正常。

v3 如果是 **gallery.html 和 report-tool.html 各自独立的普通 HTML 文件**，不涉及 SPA 路由，不涉及 fetch 跨文件读取——server 就没有存在的必要。

**结论：server 主要解决的是 SPA 的运行环境和跨目录 fetch。去掉 SPA 架构、去掉动态读取组件文件的需求，server 就可以去掉。**

---

### 二、如果保留 server，用户要装什么？

这才是从 v2 继承过来的真问题，你在 SPEC.md 里写了 "macOS 自带 Python 3，零安装"，但这是**只对了一半**：

| 平台 | 情况 | 命令 |
|------|------|------|
| macOS (Ventura+) | 系统自带 Python 3 | `python3` |
| macOS (Monterey及更早) | 自带 Python 2.7，**没有 Python 3** | 需安装 |
| Windows 10/11 | **不内置 Python** | 需去 python.org 下载安装 |
| Windows 企业管控电脑 | 可能**不允许安装**外来软件 | 无法使用 |

"双击 start.command" 的体验只在**最新版 macOS**上成立。团队里如果有人用 Windows 或者旧 Mac，第一步就卡住了。这也是为什么 v2 的 PROGRESS.md 里 "Windows 支持 — 需要添加 start.bat" 一直是待办项。

**创建时间**: 2026年5月20日 11:19  
**使用模型**: opus  

---
name: report-system v3 架构决策 - 无服务端纯静态方案
description: v3 组件库和工具采用纯静态 HTML 文件，不依赖 Python 或任何后端服务，跨平台零安装
type: project
---

v3 系统不需要 server 服务。

- 原因：v3 采用多轮渐进提示词模式，report-tool.html 只是提示词编排表单，不需要动态 fetch 组件模板，不需要 SPA 路由，不需要 reports/ 文件管理 API。gallery.html 用 iframe 加载组件预览，file:// 协议下完全可用。
- 跨平台：macOS 和 Windows 均为零安装（不需要 Python），双击 HTML 文件即可在浏览器中打开。
- 架构：gallery.html（组件库总览）、report-tool.html（报告生成工具）、bid-tool.html（标书工具）均为独立静态 HTML，各自双击运行，通过相对路径访问 ui-lib/ 中的组件资源。
- 提示词策略：提示词不嵌入组件代码，只引用组件路径（如 ui-lib/components/kpi-card/template.html），由 Claude Desktop 端自行读取，提示词体积控制在 ~800 字以内。

**How to apply:** 组件库和工具开发时继续使用纯 HTML + CDN 方案，不引入 Python server 或 Node.js 构建步骤。新增工具时按照 gallery.html 模式：独立 HTML 文件 + CDN 引入 Vue/Tailwind + 相对路径引用 ui-lib/ 组件。

---

### 回答你的问题
好的，我来逐一清晰回答这四个确认点的问题，基于专业的判断给出建议，即使是和你的预想有偏差也会明确说明。

让我先重新审视一下 v2 的 SPEC 和对话记录，确保理解准确。
现在我已经全面理解了项目。让我针对你的四个确认点给出专业的回答和建议。

---

## 1. Design Token 的扩展机制与 Tailwind 封装

### Token 的扩展方案

**核心原则：CSS自定义属性（CSS Variables）为主，Tailwind 类名封装为辅。**

推荐的三层结构：

```
design-tokens/
├── tokens.css              # 核心：所有风格的 CSS 变量定义
├── tailwind-mappings.js     # 可选：CSS变量 → Tailwind 类名映射
└── preview.html             # Token 可视化预览页
```

**tokens.css 的设计：**

```css
/* ===== 基础商务蓝白（默认） ===== */
:root {
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
  --color-danger: #ef4444;
  
  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  
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

**扩展新风格只需要加一个 `[data-theme="xxx"]` 块，不需要改任何组件代码。**

### ❌ 不同风格不可以用 Tailwind 类名封装复用

**这是我与你的预想有偏差的地方**。Tailwind 的类名是静态编译的（`text-blue-900`、`bg-blue-50`），而风格切换需要运行时的动态性。如果把颜色写死在 Tailwind 类名里：

- 切换风格时需要修改所有 DOM 元素的类名，性能差且容易漏
- 新增一种风格需要修改每个组件的 HTML 代码

**用 CSS 变量的优势：**
- `background: var(--color-bg-card)` → 换风格只需要改 CSS 变量值
- 组件代码不需要知道当前是哪种风格
- 运行时切换 `<html data-theme="dark-tech">` 生效

**Tailwind 的定位应该是什么？**

Tailwind 用来处理**布局、间距、排版**这些与颜色无关的样式：

```html
<!-- ✅ 布局用 Tailwind 类名 -->
<div class="flex flex-col gap-3 p-6 rounded-2xl shadow-lg">

<!-- ✅ 颜色用 CSS 变量 -->
style="background: var(--color-bg-card); color: var(--color-text);"
```

**可以做一个 Tailwind 配方体系（推荐）：**

```javascript
// tailwind-mappings.js — 给常用组合起名字
const STYLE_RECIPES = {
  'card-base': 'rounded-lg shadow-[var(--shadow-card)] p-6',
  'card-elevated': 'rounded-xl shadow-[var(--shadow-elevated)] p-8',
  'heading-xl': 'text-3xl font-bold',
  'body-text': 'text-base leading-relaxed',
  'badge': 'text-xs font-semibold px-3 py-1 rounded-full',
};
```

这样 AI 生成 HTML 时可以用这些配方名，而不是每次都重新写一遍。

---

## 2. 版式库的内部结构

### 版式 ≠ 组件，结构应该不同

**组件**是内容积木（KPI卡片、表格），**版式**是容器骨架（A4页面、PPT slide、网页），本质不同。

推荐版式库结构：

```
layouts/a4-landscape/
├── index.html              # 独立可打开的预览页
├── skeleton.html           # ★ 核心：页面骨架模板（AI 填空用）
└── layout.css              # 版式专属CSS（打印样式、页面尺寸、分页逻辑）
```

**版式不需要 Vue 组件（component.js）**。为什么？

| 对比维度 | 组件（components） | 版式（layouts） |
|----------|-------------------|----------------|
| 职责 | 内容展示单元 | 页面容器 + 翻页逻辑 |
| 数据绑定 | 需要 Vue（props/events） | 不需要（纯 HTML 结构） |
| 可交互 | 是 | 否（只是结构骨架） |
| AI 怎么用 | 参照代码结构写类似的 HTML | 在这个骨架里填入具体内容 |
| 文件数 | 3（index + template + component.js） | 3（index + skeleton + layout.css） |

### skeleton.html 的核心作用

这是版式库的灵魂——**给 AI 看的空壳模板**：

```html
<!-- layouts/a4-landscape/skeleton.html -->
<!-- 这是 AI 生成报告的骨架模板，请在此结构内填充内容 -->

<!-- @page { size: A4 landscape; margin: 0; } -->
<section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg relative page-break-after-always">
  <div class="content-area px-[22mm] py-[18mm]">
    <!-- ===== 第 {{N}} 页内容区 ===== -->
    <!-- AI 会在这里填充组件（kpi-card、data-table等） -->
  </div>
  <footer class="absolute bottom-[8mm] right-[22mm] text-sm text-gray-400">
    第 {{page_num}} 页
  </footer>
</section>
```

**三种版式的 skeleton 要点：**

| 版式 | skeleton 关键特征 | 翻页方式 |
|------|------------------|----------|
| A4 横版 | 固定宽高 297mm×210mm，@page A4 landscape | page-break-after（CSS 打印分页） |
| PPT Slide | 100vw×100vh，overflow hidden | JS 控制 slide 显隐，键盘/点击切换 |
| 自由网页 | max-w-[1180px] mx-auto，响应式 | 自然滚动，分 section |

---

## 3. 无服务端时，report-tool.html 怎么调用组件库和 AI 交互

这是我与你预想偏差最大的部分，也是最重要的架构决策。让我展开说清楚。

### 3.1 file:// 协议的现实限制

report-tool.html 双击打开，浏览器地址栏是 `file:///.../report-tool.html`。

当你在这个页面里执行 `fetch('../ui-lib/components/kpi-card/template.html')` 时：

| 浏览器 | file:// 下 fetch 跨目录文件 | 结果 |
|--------|---------------------------|------|
| Safari | 🟢 允许 | 正常工作 |
| Chrome | 🔴 禁止（安全策略） | 报错 CORS |
| Edge | 🔴 禁止 | 报错 CORS |
| Firefox | 🔴 限制更严 | 无法跨目录读取 |

**结论：依赖 fetch 动态读取组件模板，大概率在 Chrome 上行不通，而 Chrome 是企业用户最常用的浏览器。**

### 3.2 多轮对话模式下，不需要动态读取

这是我建议的核心改变。回顾 v2 的痛点（你实际测试发现的）：

> "内容非常多，把提示词给到 AI 后输出文件太大了，卡壳了"

所以 v3 的正确方向不是**更大的提示词**，而是**分步多轮**：

```
第一轮：搭骨架 — 仅版式 + 风格 + 主题
用户输入：
  报告主题：货币基金月度估值分析
  版式：A4 横版分页  
  风格：商务蓝白
  大致内容：封面 + 三大指标总览 + 收益率对比 + 风险提示 + 结论

工具生成的提示词（~500字，不会卡壳）：
  【版式约束】请参照 layouts/a4-landscape/skeleton.html 的页面结构
  【风格约束】请使用 styles/business-blue/tokens.css 的颜色方案
  【生成要求】用占位数据生成 5 页 A4 横版报告骨架，每页标记 [待填充]

⬇ Claude 生成 v001.html（空壳报告）
⬇ 用户：好的，骨架效果可以。现在开始填第1页，放 KPI 卡片和指标表


第二轮：填第1页
工具生成的提示词（~300字）：
  基于 reports/货币基金月度_v001.html 的第1页，
  参考 components/kpi-card/template.html 的代码风格，
  填入以下真实数据：...

⬇ Claude 基于 v001 修改 → 保存 v002
⬇ 用户通过预览页查看，发现第2页需要调整


第三轮：填第2页  
  同样模式，每次提示词控制在 ~300-500 字
```

### 3.3 report-tool.html 需要什么？

**不需要动态读取组件文件**。它只需要内置一个轻量的组件注册表：

```javascript
// report-tool.html 内置（硬编码，约 1-2KB）
const COMPONENT_CATALOG = [
  {
    id: 'kpi-card',
    name: 'KPI 数字卡片',
    category: '数据展示',
    icon: '📊',
    description: '展示核心指标数值（收益率、规模等），带趋势标签',
    // AI 参考路径（给到提示词里，不是自己读）
    refPath: '../ui-lib/components/kpi-card/template.html',
    // 适用的数据场景
    dataHint: '需要：数值、单位、变化百分比'
  },
  {
    id: 'data-table',
    name: '数据表格',
    category: '数据展示',
    icon: '📋',
    description: '简洁标准表格，蓝白风格，适合 CSV 数据直接呈现',
    refPath: '../ui-lib/components/data-table/template.html',
    dataHint: '需要：CSV数据或表格行列数据'
  },
  // ... 其他 20 个组件
];
```

### 3.4 提示词怎么引用组件？

**不嵌入代码，只引用路径。** 提示词里写：

```
【组件使用说明】
本次报告需要使用以下组件：
- KPI 数字卡片：请参照 ui-lib/components/kpi-card/template.html 的 HTML 结构和 Tailwind 类名
- 数据表格：请参照 ui-lib/components/data-table/template.html 的 HTML 结构
每个组件的 data-cid 属性必须保留，CSS 变量名（如 var(--color-primary)）不要改动
```

**为什么 AI 能看到这些文件？**
- Claude Desktop 有工作目录的概念，可以直接读取本地文件
- 用户也可以在 Claude Desktop 里把 template.html 拖进去作为附件

### 3.5 仍然需要一个超轻量服务吗？

**不需要。** gallery.html 和 report-tool.html 都作为纯静态 HTML 运行：

| 页面 | 怎么运行 | 需要服务吗 |
|------|---------|-----------|
| gallery.html（组件总览） | 双击打开，iframe 加载子组件预览 | ✅ 不需要。iframe 加载相对路径 file:// 无限制 |
| report-tool.html（生成提示词） | 双击打开，纯表单 + 文本拼接 | ✅ 不需要。没有 fetch 调用 |
| 组件独立 index.html（如 kpi-card） | 双击打开，自包含 HTML | ✅ 不需要 |

---

## 4. 总览画廊页布局

### 推荐：左右两栏布局

这与你的预想一致，具体设计：

```
┌──────────────────┬──────────────────────────────────────────────────┐
│  左侧菜单栏       │                 右侧内容预览区                     │
│  (w-64 固定240px) │                                                  │
│                  │  ┌─────────────────────────────────────────────┐ │
│  📐 设计规范      │  │  KPI 数字卡片                  [商务蓝白 ▾] │ │
│    · 色彩系统     │  │  ─────────────────────────────────────────  │ │
│    · 字体排版     │  │                                             │ │
│    · 间距圆角     │  │  ┌───────────────────────────────────────┐ │ │
│                  │  │  │                                       │ │ │
│  🧩 基础组件      │  │  │    实时预览区（看到的 = 实际效果）       │ │ │
│    · KPI卡片 ◀   │  │  │    ┌───────────────────────────┐      │ │ │
│    · 信息卡片     │  │  │    │ 环比 +12.5%               │      │ │ │
│    · 数据表格     │  │  │    │    3.28%                  │      │ │ │
│    · 流程步骤     │  │  │    │ 七日年化收益率              │      │ │ │
│    · 对比卡片     │  │  │    └───────────────────────────┘      │ │ │
│    · 团队网格     │  │  │                                       │ │ │
│    · 亮点引用     │  │  │  风格切换后自动变色                     │ │ │
│    · 大数字行     │  │  └───────────────────────────────────────┘ │ │
│    · 时间轴       │  │                                             │ │
│                  │  │  ┌─ 代码示例 ──────────────────────────────┐ │ │
│  📊 图表组件      │  │  │ <div data-cid="kpi-card"               │ │ │
│    · 柱状图       │  │  │   class="bg-[var(--color-bg-card)]     │ │ │
│    · 折线图       │  │  │   rounded-[var(--radius-lg)] ..."      │ │ │
│    · 饼图         │  │  │   ...                                  │ │ │
│    · 仪表盘       │  │  └────────────────────────────────────────┘ │ │
│                  │  │                                             │ │
│  📄 版式模板      │  │  [复制 HTML] [复制 Vue 组件] [全屏预览]     │ │
│    · A4横版       │  └─────────────────────────────────────────────┘ │
│    · PPT翻页      │                                                  │
│    · 自由滚动     │                                                  │
│                  │                                                  │
│  🎨 主题风格      │                                                  │
│    · 商务蓝白     │                                                  │
│    · 暗黑科技     │                                                  │
│    · 清新简约     │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘
```

### 交互设计要点

**1. 左侧菜单交互：**
- 一级菜单（设计规范/基础组件/图表/版式/风格）可折叠，默认全部展开
- 点击二级项（如 KPI卡片）→ 右侧内容区切换到对应组件的实时预览
- 当前选中的二级项高亮显示（深蓝背景）

**2. 右侧内容——风格切换按钮：**
- 位置：右上角固定
- 默认显示：商务蓝白风格
- 点击下拉菜单选择风格 → 立即切换，预览区组件实时变色
- **所有组件共享同一个风格选择器**，不需要一个一个组件单独切换

**3. 风格切换原理（CSS 变量优势）：**

```html
<!-- gallery.html -->
<html data-theme="business-blue">
  ...
  <div style="background: var(--color-bg-card); color: var(--color-text)">
    预览内容
  </div>
</html>
```

```javascript
// 切换风格函数
function switchTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
  // 所有使用了 var(--color-xxx) 的元素自动变色
  // 不需要重新渲染任何组件！
}
```

**4. 右侧内容区——三种展示模式（建议按 Tab 切换）：**

- Tab 1：**实时预览** — 默认激活，真实渲染组件（带示例数据）
- Tab 2：**HTML 代码** — 完整的 HTML 源代码，带语法高亮
- Tab 3：**Vue 用法** — Vue 组件的 props 说明 + 代码示例

---

## 整体架构总览

```
report_system/
├── ui-lib/                             # 组件库（独立，各工具共享）
│   ├── gallery.html                    # 总览页（左右两栏布局）
│   ├── design-tokens/
│   │   ├── tokens.css                  # CSS 变量定义 + 3套风格主题
│   │   └── preview.html               # Token 可视化展示
│   │
│   ├── components/                     # 基础组件
│   │   ├── kpi-card/
│   │   │   ├── index.html             # 独立可打开：预览 + 代码 + 参数说明
│   │   │   ├── template.html          # 纯 HTML 片段（AI 参考）
│   │   │   └── component.js           # Vue 3 组件定义
│   │   ├── info-card/
│   │   ├── data-table/
│   │   ├── timeline/
│   │   └── ...（第一批 12-15 个组件）
│   │
│   ├── charts/                         # 图表组件
│   │   ├── bar-chart/
│   │   ├── line-chart/
│   │   └── pie-chart/
│   │
│   ├── layouts/                        # 版式模板
│   │   ├── a4-landscape/
│   │   │   ├── index.html             # 独立可打开预览
│   │   │   ├── skeleton.html          # ★ 骨架模板
│   │   │   └── layout.css             # 打印样式 + 页面尺寸
│   │   ├── ppt-slide/
│   │   └── web-scroll/
│   │
│   └── styles/                         # 主题风格
│       ├── business-blue/
│       ├── dark-tech/
│       └── fresh-clean/
│
├── report-tool/                        # 工具1：报告生成
│   └── report-tool.html               # 双击运行，纯静态
│
├── bid-tool/                           # 工具2：标书撰写（后续）
│   └── bid-tool.html
│
├── bi-system/                          # 工具3：轻量BI（后续）
│   └── bi-dashboard.html
│
├── system_v1/                          # 保留
└── system_v2/                          # 保留
```

---

## 总结：4个确认点的关键决策

| 确认点 | 决策 | 与你的预想是否一致 |
|--------|------|-------------------|
| 1. Token 扩展 | CSS 变量为主，Tailwind 用于布局，**不**用 Tailwind 封装风格 | ❌ 有偏差 — Tailwind 不适合做动态换肤 |
| 2. 版式库结构 | 和组件库相似但有区别：3个文件，不需要 Vue 组件，重点是 skeleton | ⚠️ 部分一致 — 结构相似但内容不同 |
| 3. 无服务调用 | **零服务端**，多轮渐进提示词，组件注册表内置在工具中，提示词引用路径不嵌入代码 | ❌ 有偏差 — 建议完全去掉服务 |
| 4. 画廊布局 | 左右两栏，左菜单右预览，右上角风格切换按钮 | ✅ 完全一致 |

需要继续深入讨论第三点（多轮对话的具体提示词格式），还是可以开始搭建 Phase 1 的代码了？

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:27:47

SPEC.md 已生成到 `system_v3/SPEC.md`。下面是文档结构概览，方便你快速定位：

| 章节 | 内容 |
|------|------|
| 一、产品定位 | ui-lib 与工具分离，组件库是共享基础设施 |
| 二、技术约束 | 纯静态、零服务端、全部CDN、CSS变量做颜色、Tailwind做布局 |
| 三、项目文件结构 | 完整目录树，ui-lib / report-tool / bid-tool / bi-system 并列 |
| 四、Design Token 体系 | tokens.css 完整定义、扩展方式、风格切换原理、Tailwind角色边界 |
| 五、组件规范 | 3文件结构（index.html / template.html / component.js）、每个文件的规范、12个组件清单 |
| 六、图表组件规范 | ECharts封装规范、统一数据接口、首批3个图表 |
| 七、版式规范 | 与组件的结构差异、skeleton.html 规范、三种版式对比 |
| 八、风格预览 | 每种风格独立预览页 |
| 九、总览画廊页 | 左右两栏布局详图、交互设计、Vue实现方式 |
| 十、报告生成工具 | 多轮渐进工作流、提示词模板、组件注册表、页面结构 |
| 十一、Token预览页 | 色彩/字体/间距/圆角可视化展示 |
| 十二、工具调用方式 | 三种方式：AI引用路径 / iframe嵌入 / Vue组件引用 |
| 十三、实施计划 | 4个Phase，Phase 1先做2个组件打通流程 |
| 十四、与v2区别 | 10个维度的对比表 |
| 十五、后续扩展 | 组件/风格/版式/工具扩展预留 |

你看看有没有需要调整的地方，确认后我们按 Phase 1 开始写代码。

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:27:47

这是个关键的产品设计问题。我先说结论，再展开具体流程。

---

## 核心判断：表单勾选 + 实时预览，不是纯自然语言

原因很简单：业务同事不知道组件叫 "kpi-card" 还是 "big-number-row"，也不知道 "A4横版分页" 和 "PPT Slide翻页" 实际长什么样。纯自然语言描述的前提是用户已经熟悉组件库，而你们的用户**第一次打开工具时对组件库一无所知**。

但和 v2 不同——v3 的组件库每个组件都有独立的 `index.html`，可以 iframe 嵌入真实渲染，用户勾选前看到的不再是 CSS 骨架，而是**实际效果**。

---

## 用户完整操作流程（以生成一份货币基金月度报告为例）

### 前置步骤：花 3 分钟逛组件库

用户打开 `gallery.html` → 左侧菜单浏览 → 看到 kpi-card 长什么样、data-table 长什么样、A4 版式骨架长什么样 → 心里有数了 → 打开 `report-tool.html` 开始干活。

> gallery.html 的定位类似 Ant Design 官网——写代码之前先去逛逛看有哪些现成的东西。

---

### 第一轮：生成报告骨架

```
┌─────────────────────────────────────────────────────┐
│  Step 1 — 报告基本信息                               │
│                                                     │
│  报告文件名：[货币基金月度估值分析___________]          │
│  报告主题：  [面向管理人的货币基金月度收益归因___]       │
│  受众：      ○ 高管汇报  ● 客户展示  ○ 内部培训       │
│  用途：      ○ 汇报展示  ● 交付文档  ○ 培训材料       │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 2 — 版式                                      │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ [A4横版预览]  │ │ [PPT翻页预览] │ │ [自由滚动预览] │ │
│  │   iframe嵌入  │ │   iframe嵌入 │ │   iframe嵌入  │ │
│  │   skeleton    │ │   skeleton   │ │   skeleton    │ │
│  │   的缩略效果   │ │   的缩略效果  │ │   的缩略效果   │ │
│  │              │ │              │ │              │ │
│  │ ○ A4 横版分页 │ │ ● PPT Slide  │ │ ○ 自由滚动网页 │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
│  点击卡片选中（蓝色边框高亮）      [去版式库看完整效果→] │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 3 — 风格                                      │
│                                                     │
│  ● 商务蓝白  ○ 暗黑科技  ○ 清新简约                   │
│  ┌──────────────────────────────────────────────┐   │
│  │  该风格下组件实际渲染效果（实时预览）            │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │ KPI卡片  │ │ 信息卡片 │ │ 数据表格 │   ...   │   │
│  │  │ (真实色)  │ │ (真实色) │ │ (真实色)  │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘        │   │
│  └──────────────────────────────────────────────┘   │
│  风格切换时下方预览区即时变色                           │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 4 — 内容大纲                                   │
│                                                     │
│  本次报告大致包含以下内容（口语化描述即可）：            │
│  ┌─────────────────────────────────────────────┐    │
│  │ 第1页：封面（标题、团队、日期）                 │    │
│  │ 第2页：三大核心指标概览（收益率、规模、风险）     │    │
│  │ 第3页：收益率走势对比分析                       │    │
│  │ 第4页：持仓结构分析（按资产类别）                │    │
│  │ 第5页：风险指标与总结                          │    │
│  └─────────────────────────────────────────────┘    │
│  [+ 添加一页]                                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成骨架提示词并复制                       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

用户点击「生成骨架提示词」→ 提示词 ~500字，内容大致：

```
你是金融报告HTML生成专家。

【版式约束】请参照 ../ui-lib/layouts/ppt-slide/skeleton.html 的页面结构，
使用 100vw×100vh 容器、JS翻页逻辑。

【风格约束】请使用 ../ui-lib/design-tokens/tokens.css 中 business-blue 的CSS变量。
所有颜色使用 var(--color-xxx)，不要替换为具体色值。

【内容结构】
- 第1页：封面
- 第2页：三大核心指标概览
- 第3页：收益率走势对比分析
- 第4页：持仓结构分析
- 第5页：风险指标与总结

【要求】
1. 用占位数据生成5页PPT骨架，每页标记 [待填充-第X页]
2. 给每页容器添加 data-page="X" 属性
3. 保存到 reports/货币基金月度估值分析_v001.html
4. 只输出完整HTML，不要解释
```

用户复制 → 粘贴到 Claude Desktop → AI 生成 v001.html（一个只有骨架的 PPT，每页有标题和占位标记，但没有真实数据和组件）。

用户双击 v001.html 看一眼：「骨架没问题，PPT 翻页正常，颜色对。开始填内容。」

---

### 第二轮起：逐页填充内容

用户回到 report-tool.html，进入「内容填充」Tab：

```
┌─────────────────────────────────────────────────────┐
│  内容填充 — 第 2 轮                                  │
│  当前报告：货币基金月度估值分析（v001 → v002）          │
│                                                     │
│  选择要填充的页面：[第2页 ▾]  ← 下拉选择               │
│                                                     │
│  ───────────────────────────────────────────────     │
│  本页内容概要（自然语言描述）：                         │
│  ┌─────────────────────────────────────────────┐    │
│  │ 展示三只货币基金的七日年化收益率、万份收益、      │    │
│  │ 近一月回报率三个核心指标，每只基金一个卡片，     │    │
│  │ 顶部再加一个汇总对比表                        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ───────────────────────────────────────────────     │
│  选择本页使用的组件（多选，可重复选同一组件多次）：       │
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │            │ │            │ │            │      │
│  │   iframe   │ │   iframe   │ │   iframe   │      │
│  │   kpi-card │ │  data-table│ │ compare-card│      │
│  │   真实渲染  │ │   真实渲染  │ │   真实渲染   │      │
│  │            │ │            │ │            │      │
│  │ ☑ KPI卡片  │ │ ☑ 数据表格  │ │ ☐ 对比卡片  │      │
│  │   选3个    │ │   选1个    │ │            │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│  ┌────────────┐ ┌────────────┐                     │
│  │ info-card  │ │ big-number │  ...                │
│  │ ☐ 信息卡片  │ │ ☐ 大数字行  │                     │
│  └────────────┘ └────────────┘                     │
│  每个组件通过 iframe 嵌入其 index.html，              │
│  看到的是真实渲染效果（不是骨架），风格已匹配            │
│                                                     │
│  ───────────────────────────────────────────────     │
│  本页数据来源：                                       │
│  ○ 跟随全局数据  ● 本页独立指定                       │
│  [上传CSV: returns_may.csv]  已解析：3行×5列           │
│  ┌─────────────────────────────────────────┐        │
│  │ 基金名称 │ 七日年化 │ 万份收益 │ 近一月回报 │       │
│  │ 天弘     │ 2.15%   │ 0.5892  │ 0.18%    │       │
│  │ 南方     │ 2.08%   │ 0.5701  │ 0.16%    │       │
│  │ 华夏     │ 2.21%   │ 0.6013  │ 0.19%    │       │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成第2页填充提示词并复制                   │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

生成的提示词 ~400字：

```
请基于 reports/货币基金月度估值分析_v001.html 继续修改。

【当前任务】填充第2页（data-page="2"）。

【组件参考】
- KPI数字卡片：请参照 ../ui-lib/components/kpi-card/template.html
- 数据表格：请参照 ../ui-lib/components/data-table/template.html
严格参照其 data-cid、CSS变量风格、Tailwind布局类名。

【内容要求】
展示三只货币基金的七日年化收益率、万份收益、近一月回报率三个核心指标。
每只基金一个KPI卡片，顶部加一个汇总对比表。

【数据】
CSV: returns_may.csv（3只基金×4项指标）

【要求】
1. 保持第1页及其他页面内容不变，只修改 data-page="2" 的内容
2. 从CSV读取真实数据填入组件
3. 保存为 reports/货币基金月度估值分析_v002.html
4. 只输出完整HTML，不要解释
```

用户复制 → Claude 生成 v002 → 用户双击预览 → 第2页填好了 → 继续第3页。

---

### 逐页填充直到完成

第3页（收益率走势对比）→ 选 line-chart + info-card → 生成提示词 → v003
第4页（持仓结构分析）→ 选 pie-chart + data-table → 生成提示词 → v004
第5页（风险指标与总结）→ 选 big-number-row + highlight-quote → 生成提示词 → v005

每轮提示词都只有 300-500 字，AI 不会卡壳。

---

### 精细修改阶段

用户发现第3页饼图的颜色和整体风格不太搭，或者文字措辞不够正式。回到工具的「精细修改」Tab：

```
┌─────────────────────────────────────────────────────┐
│  精细修改                                            │
│  当前版本：货币基金月度估值分析_v005.html              │
│                                                     │
│  修改意见（自然语言）：                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ 1. 第3页饼图的配色改成商务蓝白风格一致的蓝色系    │    │
│  │ 2. 第5页"风险可控"改成"风险指标处于合理区间"    │    │
│  │ 3. 封面加一句slogan："专业估值，守护资产价值"   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成修改提示词并复制                       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

AI 基于 v005 做定点修改 → v006 → 完成。

---

## 关键设计要点总结

| 用户动作 | 界面形式 | 预览方式 |
|----------|---------|---------|
| 选版式 | 3张卡片单选，每张卡片嵌入版式 skeleton.html 的缩略 iframe | 看到真实骨架效果 |
| 选风格 | 3个选项 + 下方组件实时变色预览区 | 切换风格后预览区即时变色 |
| 写内容大纲 | textarea，自然语言，口语化即可 | 无预览（此阶段还没内容） |
| 选组件 | 多选卡片，每张卡片 iframe 嵌入组件的 index.html | **看到真实渲染效果**，且已匹配当前风格 |
| 上传数据 | CSV 拖拽/选择，自动解析预览前5行 | 表格预览 |
| 修改意见 | textarea，自然语言描述 | 无预览 |

**和 v2 的核心区别**：v2 的组件选择是 CSS 骨架缩略图（灰白 placeholder），v3 是 iframe 嵌入的**真实渲染**。用户选 kpi-card 时看到的就是将来报告里 KPI 卡片的样子，且切换风格后预览区自动变色——没有 "选了暗黑科技但缩略图还是蓝色" 的割裂感。

---

## 一个坦诚的提醒

这套流程里有一个**不可省略的用户行为**：在 Claude Desktop 和 report-tool.html 之间来回切换。v2 是这个模式，v3 也是。

完全消除这个切换的唯一方案是**把 AI 调用嵌入工具本身**（调 Claude API，流式返回），但这意味着：
- 需要后端服务（API Key 不能暴露在前端）
- 需要网络
- 需要付费（API 按 token 计费）

SPARC 方案里写的 "后续扩展预留：AI 直接对话集成" 就是这个方向。当前阶段保留复制粘贴模式是务实的——先用最小成本跑通流程，验证多轮渐进方案确实比一次性大提示词好，再决定是否做内嵌 AI。

---

需要我把这个操作流程也补充到 SPEC.md 里吗？还是现有 SPEC 已经够清晰，可以直接开始 Phase 1 的代码了？

---

## 👤 用户问题

**时间**: 2026/05/20 15:27:47

这个report.html的预览组件和页面是重新写的还是哪来的，怎么引用的组件库预览和勾选的，用户选好了的配置是有保存下来吗，可以保留成一个个人配置吗，配置是个json格式还是什么，下次可能我还是用这一套配置来写ppt


---


## 🤖 Claude 回答

**时间**: 2026/05/20 15:30:34

你好！有什么我可以帮你的吗？

让我先仔细阅读 v2 版本的 SPEC.md 和相关文件，了解项目的全貌。

让我再看看 v1 版本和已有的 v3 目录，以及 v2 的对话记录了解已知问题。

让我再看看 v2 的对话记录，了解已知问题和用户反馈。

让我再快速了解 v2 对话记录的后续部分，确认已知问题。

我已经完整阅读了 SPEC.md、PROGRESS.md、DEMO_GUIDE.md 以及 conversation.md 全部内容，对项目全貌有了清晰理解。下面给出专业建议和方案。

---

## system_v3 组件库 — 架构方案与建议

### 一、核心判断

v2 的问题根因不是功能缺失，而是**架构边界不清**。组件库（资源库）、报告生成工具、预览编辑器全部耦合在一个 index.html 里，导致：
- 组件只是 JS 对象里的 `htmlSnippet` 字符串，无法独立预览
- 其他工具（标书、BI）完全无法复用
- 改一个组件可能影响整个工具

v3 要做的本质是：**把组件库从工具里剥离出来，升级为独立的基础设施层**。

---

### 二、目录结构设计

```
report_system/
├── ui-lib/                          # ← 组件库（本次第一步要建的）
│   ├── gallery.html                 # 总览浏览页（汇总入口）
│   ├── design-tokens/
│   │   ├── tokens.css               # CSS 自定义属性（所有组件引用这个）
│   │   ├── tailwind.config.js       # Tailwind theme 配置（给用 Tailwind 的项目）
│   │   └── preview.html             # Design Token 可视化预览页
│   ├── components/                  # 基础组件
│   │   ├── kpi-card/
│   │   │   ├── index.html           # ★ 独立可打开：渲染示例 + 代码展示
│   │   │   ├── template.html        # 纯 HTML 片段（AI prompt 参考用）
│   │   │   └── component.js         # Vue 3 组件定义（工具引用用）
│   │   ├── info-card/
│   │   ├── data-table/
│   │   ├── compare-card/
│   │   ├── timeline/                # 新增
│   │   └── ...
│   ├── charts/                      # 图表组件（ECharts 封装）
│   │   ├── bar-chart/
│   │   ├── line-chart/
│   │   ├── pie-chart/
│   │   └── ...
│   ├── layouts/                     # 版式模板
│   │   ├── a4-landscape/
│   │   ├── ppt-slide/
│   │   ├── web-scroll/
│   │   └── bi-dashboard/            # 新：BI 仪表盘版式
│   └── styles/                      # 风格/主题
│       ├── business-blue/
│       ├── dark-tech/
│       ├── fresh-clean/
│       └── ...
│
├── report-tool/                     # 报告生成工具（v3 重构版）
│   ├── index.html
│   ├── start.command
│   ├── server.py
│   ├── js/
│   └── ...                          # 引用 ../ui-lib/ 的组件
│
├── bid-tool/                        # 标书工具（后续）
│   └── ...                          # 同样引用 ../ui-lib/
│
├── bi-system/                       # 轻量 BI 系统（后续）
│   └── ...                          # 同样引用 ../ui-lib/
│
├── system_v1/                       # 保留，不动
└── system_v2/                       # 保留，不动
```

**关键设计决策**：`ui-lib/` 与各工具是**平级目录**，工具通过相对路径 `../ui-lib/components/xxx/` 引用组件。各工具独立启动、独立开发、互不干扰。

---

### 三、技术栈选型

| 层面 | 选型 | 理由 |
|------|------|------|
| **组件定义** | Vue 3 SFC（单文件组件） | v2已验证的方向，团队熟悉；CDN和构建两种用法都支持 |
| **构建工具** | Vite | 组件库需要模块化开发，Vite HMR体验极佳；但输出的 `template.html` 仍是纯HTML，工具侧可继续用CDN |
| **CSS框架** | Tailwind CSS v4 + CSS自定义属性 | Tailwind给AI生成HTML用（AI对Tailwind类名极熟）；CSS变量给Design Token用（框架无关，任何工具都能消费） |
| **图表** | ECharts 5 | 金融场景标配，封装为Vue组件后暴露出简单接口 |
| **组件库文档** | 原生HTML + 少量Vue（gallery.html） | 零依赖可打开，不需要额外文档站 |
| **类型系统** | JSDoc（暂不上TypeScript） | 业务同事也参与维护，降低门槛；后续可逐步加TS |

**重要：保留CDN可用性。** 组件库用Vite开发，但每个组件的 `template.html` 依然是纯Tailwind HTML片段——这意味着：
- AI 提示词里引用的组件代码仍然是纯HTML+Tailwind，AI直接能写
- 不需要构建工具的工具（如report-tool想做CDN-only）完全不受影响
- 需要构建能力的工具（如BI系统）可以 import Vue组件获得交互能力

---

### 四、单个组件的文件规范

以 `kpi-card` 为例，每个组件目录下 **3个文件**：

```
ui-lib/components/kpi-card/
├── index.html          # ★ 核心文件：独立打开 = 组件文档 + 实时预览
├── template.html       # 纯 HTML 片段，给 AI prompt 参考
└── component.js        # Vue 3 组件（给需要编程引用的工具）
```

#### 4.1 `index.html` — 独立预览页（重点设计）

这是你们 "像开源组件库一样" 想法的核心载体。打开后包含：

```
┌──────────────────────────────────────────────────┐
│  ← 返回组件库总览                                 │
│                                                  │
│  KPI 数字卡片                          [商务蓝白] │
│  ─────────────────────────────────────  [暗黑科技] │
│  ┌──────────────────────────────┐    [清新简约]   │
│  │  ↑ 实时渲染示例（可切换风格）  │                │
│  │  ┌──────────────────────┐   │                │
│  │  │ 环比 +12.5%          │   │                │
│  │  │    3.28%             │   │                │
│  │  │ 七日年化收益率        │   │                │
│  │  └──────────────────────┘   │                │
│  └──────────────────────────────┘                │
│                                                  │
│  Props / 数据接口                                │
│  ┌──────────────────────────────────────────────┐│
│  │ label: string    — 标签文本                   ││
│  │ value: number    — 指标数值                   ││
│  │ unit: string     — 单位                       ││
│  │ trend: string    — 趋势标签 (可选)             ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  代码示例                                        │
│  ┌──────────────────────────────────────────────┐│
│  │ <!-- HTML 用法（AI生成/纯静态场景）-->         ││
│  │ <div data-cid="kpi-card" class="bg-white..."> ││
│  │   ...                                         ││
│  │ </div>                                        ││
│  │                                               ││
│  │ <!-- Vue 组件用法（开发工具时）-->              ││
│  │ <KpiCard label="七日年化" :value="3.28" />     ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  [复制 HTML 片段]  [复制 Vue 代码]                │
└──────────────────────────────────────────────────┘
```

设计要点：
- **内联CSS变量切换风格**：页面顶部有风格切换按钮（business-blue / dark-tech / fresh-clean），点击后改变 `<html>` 上的 `data-theme` 属性，所有示例实时变色。不需要重新加载页面。
- **代码展示用 `<pre><code>` + 语法高亮**：简单用 Prism.js CDN 或自己写基础高亮
- **每个 `index.html` 完全自包含**：内联 `<style>` + 必要的 CDN `<script>`（Tailwind CDN、Vue CDN、ECharts CDN），双击即开

#### 4.2 `template.html` — AI 参考片段

```html
<!-- 就是最精简的纯HTML片段，给AI当 few-shot 参考 -->
<div data-cid="kpi-card" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
  <span class="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-3 py-1 rounded-full w-fit">环比 +12.5%</span>
  <div class="text-5xl font-bold" style="color:var(--color-primary)">3.28<span class="text-lg font-normal" style="color:var(--color-text-muted)">%</span></div>
  <p class="text-sm" style="color:var(--color-text-muted)">七日年化收益率</p>
</div>
```

#### 4.3 `component.js` — Vue 组件

```javascript
// 给开发工具时 import 使用
export default {
  name: 'KpiCard',
  props: {
    label: String,
    value: Number,
    unit: { type: String, default: '%' },
    trend: { type: String, default: '' }
  },
  template: `...`  // 或从 template.html 加载
};
```

---

### 五、Design Token 体系

这是整个组件库的**灵魂**。没有统一的Token，跨工具复用就是空谈。

```css
/* ui-lib/design-tokens/tokens.css */

:root {
  /* === 商务蓝白（默认）=== */
  --color-primary: #1e3a8a;
  --color-primary-light: #dbeafe;
  --color-bg: #f8fafc;
  --color-bg-card: #ffffff;
  --color-text: #1f2937;
  --color-text-muted: #64748b;
  --color-accent: #2563eb;
  --color-border: #e5e7eb;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* 阴影 */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 10px 25px rgba(0,0,0,0.08);

  /* 字体 */
  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 28px;
  --text-3xl: 40px;
}

/* 暗黑科技主题 */
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

/* 清新简约主题 */
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

**为什么用CSS自定义属性而不是纯Tailwind类名？**

1. **框架无关**：Vue项目、React项目、纯HTML项目，全都直接 `var(--color-primary)` 就能用
2. **运行时切换**：改一个 `data-theme` 属性，所有组件实时换肤
3. **AI友好**：AI生成的HTML里写 `style="color:var(--color-primary)"` 同样生效
4. **与Tailwind互补**：Tailwind做布局和工具类，Token做品牌色和风格变量

Tailwind v4 的 `@theme` 可以直接映射这些CSS变量，两者不冲突。

---

### 六、总览画廊页（gallery.html）

这是所有组件的**汇总浏览入口**，类似 Ant Design 的组件总览页。

```
┌─────────────────────────────────────────────────────┐
│  UI Library — 估值团队前端组件库                      │
│  ─────────────────────────────────────────────────── │
│  [设计规范] [基础组件] [图表] [版式] [风格]           │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ KPI 卡片  │ │ 信息卡片  │ │ 数据表格  │   ...      │
│  │ [缩略图]  │ │ [缩略图]  │ │ [缩略图]  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 柱状图    │ │ 折线图    │ │ 饼图      │   ...      │
│  │ [缩略图]  │ │ [缩略图]  │ │ [缩略图]  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  技术栈：Vue 3 + Tailwind CSS + ECharts 5            │
│  Design Tokens 规范 → [查看]                         │
└─────────────────────────────────────────────────────┘
```

- 每个组件卡片用 **iframe 嵌入** 对应组件的 `index.html` 缩略区域，所见即所得
- 点击卡片 → 跳转到组件独立的 `index.html`
- 顶部导航分类：基础组件 / 图表 / 版式 / 风格 / 设计规范
- gallery.html 本身可以双击打开，不依赖任何服务

---

### 七、工具如何调用组件库

三种消费方式，按复杂度递增：

#### 方式A：AI提示词引用（最简单，v2模式）

报告工具往AI提示词里注入 `template.html` 片段。通过路径读取：
```javascript
// 工具侧代码
const template = await fetch('../ui-lib/components/kpi-card/template.html')
  .then(r => r.text());
// 拼入prompt
```

#### 方式B：iframe嵌入预览

工具侧用 iframe 嵌入组件的 `index.html`：
```html
<iframe src="../ui-lib/components/kpi-card/index.html"></iframe>
```
这样工具里就能直接展示组件的交互预览，不需要复制代码。

#### 方式C：ES Module导入（BI系统用）

BI系统用Vite构建时，直接 import Vue组件：
```javascript
import KpiCard from '../ui-lib/components/kpi-card/component.js';
```
获得完整的Vue组件能力（响应式数据绑定、事件处理等）。

**三种方式并存，同一个组件目录满足三种场景。**

---

### 八、第一步实施计划（组件库搭建）

按优先级分4个阶段：

#### Phase 1 — 骨架与规范（1-2天）

| 产出 | 说明 |
|------|------|
| `ui-lib/design-tokens/tokens.css` | 3套风格的CSS变量定义 |
| `ui-lib/design-tokens/preview.html` | Token可视化预览（色块、字体阶梯、间距演示） |
| `ui-lib/components/kpi-card/` | 第一个完整组件（3个文件），作为模板范例 |
| `ui-lib/components/info-card/` | 第二个组件，验证模板可复用性 |
| `COMPONENT_SPEC.md` | 组件开发规范文档（文件结构、命名约定、必须包含的元素） |

**先做2个组件打通流程**，确认结构合理再铺量。

#### Phase 2 — 基础组件铺量（2-3天）

迁移v2的8个组件 + 新增实用组件：

| 类别 | 组件 |
|------|------|
| 数据展示 | kpi-card, big-number-row, data-table |
| 内容展示 | info-card, highlight-quote, team-grid |
| 流程展示 | process-step, timeline（新增） |
| 对比分析 | compare-card |
| 装饰/布局 | divider, section-header（新增） |

#### Phase 3 — 图表封装（2-3天）

基于ECharts封装：
- bar-chart, line-chart, pie-chart
- 每个chart暴露统一接口：`{ data, xField, yField, title }`
- `index.html` 里做交互式Demo：可编辑JSON数据实时预览图表变化

#### Phase 4 — 版式 + 总览页（2天）

- 3套版式的独立HTML（a4 / ppt / web）
- 5套风格预览（在现有3套基础上扩充）
- `gallery.html` 总览汇总页
- 各工具对接验证

---

### 九、几个重要的架构建议

**1. 不要急于用Vite把组件库做成npm包。** 第一阶段保持纯HTML+CDN打开方式，降低环境依赖。团队三个工具进度不一，组件库应该是"即开即用"的资源，不是"先build再跑"的依赖。Vite/Vue SFC等构建能力放在component.js里，给有构建环境的工具用，不影响CDN路径。

**2. template.html 是核心资产。** v2的经验证明：AI生成的HTML质量直接取决于你给它的few-shot示例质量。每个组件的template.html必须经过人工审核——确保Tailwind类名规范、data-cid完整、缩进清晰、无障碍性问题。这比Vue组件写得漂不漂亮重要十倍。

**3. Design Token先稳后扩。** 先用3套主题跑通，不要一上来定义20个Token。实践中发现缺什么加什么。Token的命名要偏向语义化（`--color-primary`）而非具体色值（`--color-blue-800`），这样换主题时不用改组件代码。

**4. 分离"组件"和"业务模板"。** ui-lib只放通用组件（按钮、卡片、图表、表格），不要放"货币基金报告模板"之类的业务组合。业务模板放在各自的工具目录里。这条边界不守住，组件库很快变成大杂烩。

**5. gallery.html用iframe嵌入组件预览。** 不要把所有组件代码都加载到gallery页面里（v2的components-gallery问题之一就是几百行代码全摊在一个页面）。iframe隔离加载，每个组件独立渲染，gallery只做导航汇总。

---

### 十、与v2的关键区别

| 维度 | v2 | v3（建议） |
|------|-----|-----------|
| 组件形态 | JS字符串 `htmlSnippet` | 独立HTML文件，可双击打开 |
| 组件预览 | 画廊页里的CSS骨架 | iframe嵌入真实渲染 |
| 跨工具复用 | 不可能（耦合在工具内） | 相对路径引用 `../ui-lib/` |
| 设计规范 | 散落在各组件JS里 | 集中在 `design-tokens/tokens.css` |
| 主题切换 | 不支持运行时切换 | `data-theme` 属性秒切 |
| 图表 | 无（靠AI临时写） | 预封装的ECharts图表 |
| 工具数量 | 1个 | 3个（报告+标书+BI） |

---

总结一句话：**v3的核心不是多做几个组件，而是把组件从工具里解放出来，变成团队共享的基础设施。** 第一步把 ui-lib 目录骨架、2个范例组件、Design Token和 gallery.html 跑通，后面铺组件就是体力活了。

需要我开始搭建 Phase 1 的骨架吗？还是对以上方案有需要调整的地方？

好，逐一回答四个确认点，有些地方我的建议会和你的预想有偏差，我会说清楚原因。

---

## 1. Design Token 的扩展机制与 Tailwind 封装

### Token 怎么扩

建议采用 **CSS 自定义属性 + 语义化命名** 的方案，而不是把 Token 写成 Tailwind 类名。原因很直接：

```
/* 新增一个风格只需要加这一段，其他什么都不用改 */
[data-theme="gov-red-gold"] {
  --color-primary: #8b1a1a;
  --color-primary-light: #fef2f2;
  --color-bg: #fafaf9;
  --color-bg-card: #ffffff;
  --color-text: #292524;
  --color-text-muted: #78716c;
  --color-accent: #ca8a04;
  --color-border: #e7e5e4;
}
```

新增一个 "政务红金" 风格：打开 `tokens.css`，加 10 行 CSS，完事。所有组件、所有图表、所有版式**自动适配新风格**，因为它们的颜色引用的是 `var(--color-primary)` 而不是 `#1e3a8a`。

v2 的问题恰恰就是颜色写死在组件的 Tailwind 类名里（`text-blue-900`、`bg-blue-50`），导致换风格时缩略图还是蓝色。

### Tailwind 类名能否封装复用？

可以，但和你设想的方式可能不同。不是"把风格定义成 Tailwind 类"，而是反过来：

**定义 "样式配方"（Style Recipe）作为可复用常量：**

```javascript
// ui-lib/design-tokens/recipes.js
const RECIPES = {
  'card-base': 'rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--space-lg)]',
  'card-elevated': 'rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] p-[var(--space-xl)]',
  'heading-lg': 'text-[var(--text-xl)] font-bold font-[var(--font-heading)]',
  'body-text': 'text-[var(--text-base)] font-[var(--font-body)]',
  'badge-primary': 'text-xs font-semibold px-3 py-1 rounded-full w-fit'
};
```

这些配方字符串**本身是 Tailwind 类名组合**，但里面的颜色/间距值引用了 CSS 变量。使用时直接拼：

```html
<div class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
```

AI 生成 HTML 时，prompt 里注入这些配方作为约束："所有卡片使用以下类名组合：`rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6`"。AI 会照做，且因为值是 CSS 变量，换主题自动变色。

**总结：Token 层用 CSS 变量做 "值" 的定义，Tailwind 做 "布局和排版" 的工具层，配方做 "组合复用" 的中间层。** 三层各司其职。

---

## 2. 版式库的内部结构

版式和组件**不应**使用完全一致的文件结构，因为它们本质不同。组件是内容积木，版式是容器骨架。

建议版式结构如下：

```
ui-lib/layouts/a4-landscape/
├── index.html              # 独立预览：用示例内容渲染一个完整A4报告
├── skeleton.html           # ★ 核心：页面骨架（不含内容，只有容器+分页逻辑+打印样式）
├── layout.css              # 版式专属样式（@page、page-break、容器尺寸）
└── README.md               # （可选）版式适用场景说明，不需要Vue组件
```

**skeleton.html 长什么样？**

```html
<!-- 这就是给AI看的"壳子"，AI往里填组件 -->
<div class="a4-page-container">
  <!-- @page { size: A4 landscape; margin: 0; } -->
  <section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg page-break-after-always">
    <div class="content-area px-[22mm] py-[18mm]">
      <!-- {{ page_content }} AI在这里填充组件 -->
    </div>
    <footer class="absolute bottom-[8mm] right-[22mm] text-sm text-[var(--color-text-muted)]">
      第 {{ page_num }} 页
    </footer>
  </section>
</div>
```

**与组件的关键区别：**

| 维度 | 组件 | 版式 |
|------|------|------|
| 职责 | 内容展示单元 | 页面容器+翻页逻辑+打印 |
| 可嵌套 | 组件放入版式 | 版式包裹组件 |
| Vue 组件 | 需要（交互绑定数据） | 不需要（纯结构+CSS） |
| AI 如何使用 | 参照 htmlSnippet 复制写法 | 作为外层模板，在里面填充组件 |
| 文件数 | 3个（index.html, template.html, component.js） | 3个（index.html, skeleton.html, layout.css） |

版式不需要 `component.js`，因为版式不是交互组件——它是静态的 HTML 骨架 + CSS 规则。A4 版式的翻页是 CSS `page-break-after` 控制的，PPT 版式的翻页是简单的 JS 显隐逻辑，这些都放在 `skeleton.html` 的 `<script>` 标签里即可。

---

## 3. report-tool.html 独立运行 —— 怎么调用组件库，怎么和 AI 交互

这是四个问题里最重要的一个，也是我的建议和你预想偏差最大的地方。

### 3.1 技术约束：file:// 协议的现实限制

report-tool.html 双击打开 → 浏览器地址栏是 `file:///Users/xxx/report_system/report-tool/report-tool.html`。这时：

- `fetch('../ui-lib/components/kpi-card/template.html')` → **Safari 可以，Chrome 默认不行**（Chrome 禁止 file:// 下访问父级目录）
- `<iframe src="../ui-lib/components/kpi-card/index.html">` → **所有浏览器都支持**（iframe 加载 file:// 子资源不受限）
- `<img src="../ui-lib/design-tokens/preview.html">` → 同上，支持

**结论：如果 report-tool 要通过 fetch 动态读取组件模板拼进提示词，在 Chrome 上行不通。** 团队用 Safari 的话可以，但不能假设所有人都用 Safari。

### 3.2 我的建议：换个思路，不需要动态读取

v2 的核心痛点是 **"一个巨大的提示词丢给 AI，AI 卡壳"**。你在 conversation.md 里已经发现了：

> "我的内容非常多，给到ai后输出文件太大了，卡壳了，所以我们要分步输出"

那 v3 的方向就不该是 "工具读组件模板 → 拼成更大的提示词 → AI 更卡"。而应该是 **"多轮对话，渐进生成"**。

#### 推荐的工作流（v3）

```
第一轮：搭骨架
  用户在工具里选：版式=A4横版、风格=商务蓝白、主题=货币基金月度报告
  → 生成"骨架提示词"（~800字）
  → AI生成只有容器的空壳HTML，每页标记 [待填充内容]
  → 保存为 货币基金报告_v001.html

第二轮：填内容（逐页/逐区块）
  用户选：第1页用 kpi-card + data-table，内容概要：展示三大收益率指标
  → 生成"内容提示词"（~500字，含当前页组件的template片段）
  → AI基于v001.html修改，填充第1页
  → 保存为 v002

第三轮：填第2页
  → 同样流程，AI基于v002继续

第四轮：精细修改
  → 自然语言描述微调
  → AI生成v004
```

**这个模型下，report-tool.html 不需要 fetch 任何组件文件。** 它只需要：

1. **内置组件注册表**（轻量，纯元数据，~2KB）：

```javascript
const COMPONENT_REGISTRY = [
  { id: 'kpi-card', name: 'KPI数字卡片', category: '数据展示',
    description: '大数字+趋势标签+说明文字',
    templatePath: '../ui-lib/components/kpi-card/template.html' },
  { id: 'data-table', name: '数据表格', category: '数据展示',
    description: '蓝色表头+斑马纹行',
    templatePath: '../ui-lib/components/data-table/template.html' },
  // ... 20个组件也就2KB
];
```

2. **提示词模板引擎**：根据用户选择，拼装结构化的分步提示词。**提示词里引用组件路径，但不嵌入组件代码**——AI 自己去读（Claude 桌面端有文件系统权限）。

提示词关键段落：

```
【组件参考】
请使用以下路径的组件模板作为 HTML 代码参考：
- KPI卡片：ui-lib/components/kpi-card/template.html
- 数据表格：ui-lib/components/data-table/template.html
每个组件的 data-cid 属性、Tailwind 类名风格、HTML 结构请严格参照模板文件。
```

如果担心 AI 不主动读文件，用户可以在 Claude Desktop 里把 `template.html` 文件拖进去作为附件——这和 v2 "粘贴代码块"效果一样，但更灵活。

### 3.3 如果我这个建议你不同意

如果你坚持要工具在生成提示词时自动嵌入组件模板，那就不能完全去掉服务。最小代价方案是在 `start.command` 里加一行：

```bash
# start.command（仍然双击启动，但不是Python）
open -a "Google Chrome" --args --allow-file-access-from-files "$(dirname "$0")/report-tool.html"
```

或者保留一个极简 Python 服务（就是 SPEC.md 里那50行），用户的感知只是双击 start.command 而已，服务在后台透明运行。

**坦率地说：我建议保留极简 server。** 用户双击 start.command 的体验完全不变，但消除了所有 file:// 的坑。而且 gallery.html 里用 iframe 加载组件独立预览时，HTTP 服务下 iframe 通信（postMessage）也更可靠。

---

## 4. 总览画廊页布局

你的设想完全可行，这是最没有争议的一点。具体设计：

```
┌──────────────────┬──────────────────────────────────────────────┐
│  左侧菜单栏       │           右侧内容区                          │
│  (w-64, 固定)    │                                              │
│                  │   ┌──────────────────────────────────────┐  │
│  UI Library      │   │  设计规范 / 基础组件 / 图表           │  │
│  ────────────    │   │                        [商务蓝白 ▾]  │  │
│                  │   │  一键切换风格按钮 →                    │  │
│  📐 设计规范      │   └──────────────────────────────────────┘  │
│    · 色彩系统     │                                              │
│    · 字体排版     │   ┌─────────────────────────────────────┐   │
│    · 间距圆角     │   │                                     │   │
│                  │   │   当前选中组件的实时预览              │   │
│  🧩 基础组件      │   │   （默认显示第一个组件，              │   │
│    · KPI卡片     │   │    风格切换后立即变色）               │   │
│    · 信息卡片     │   │                                     │   │
│    · 数据表格     │   │   ┌───────────────────────────┐    │   │
│    · 流程步骤     │   │   │ 环比 +12.5%               │    │   │
│    · 对比卡片     │   │   │    3.28%                  │    │   │
│    · 团队网格     │   │   │ 七日年化收益率              │    │   │
│    · 亮点引用     │   │   └───────────────────────────┘    │   │
│    · 大数字行     │   │                                     │   │
│    · 时间轴       │   │   ── 代码示例 ──                    │   │
│                  │   │   <div data-cid="kpi-card" ...>     │   │
│  📊 图表          │   │   ...                               │   │
│    · 柱状图       │   │                                     │   │
│    · 折线图       │   │   [复制HTML] [复制Vue] [全屏预览]   │   │
│    · 饼图         │   └─────────────────────────────────────┘   │
│                  │                                              │
│  📄 版式          │                                              │
│    · A4横版       │                                              │
│    · PPT翻页      │                                              │
│    · 自由滚动     │                                              │
│                  │                                              │
│  🎨 风格          │                                              │
│    · 商务蓝白     │                                              │
│    · 暗黑科技     │                                              │
│    · 清新简约     │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### 交互逻辑

- **左侧菜单**：一级分类可折叠。点击二级菜单项 → 右侧切换到对应组件/版式/风格的预览
- **风格切换按钮**：右上角下拉选择器，切换 `data-theme` 属性 → 右侧预览区所有元素即时变色。这个按钮**全局有效**，不管你在看哪个组件，切换风格都立即反映
- **右侧内容区**：渲染的不是缩略图，而是**组件 template.html 的真实渲染效果**（内联在 gallery 页面里），配合下方带语法高亮的代码块。用户看到的效果 = AI 将生成的 HTML 效果
- **"全屏预览"按钮**：打开组件独立的 `index.html`（新标签页），获取完整的组件文档体验

### 实现要点

```javascript
// gallery.html 核心状态
const state = reactive({
  activeCategory: 'components',   // 左侧当前选中的一级分类
  activeItem: 'kpi-card',         // 当前选中的二级项目
  currentTheme: 'business-blue'   // 当前风格
});

// 切换风格 → 改根元素 data-theme，所有内联预览自动变色
function switchTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.currentTheme = theme;
  // CSS 变量即时生效，不需要重新渲染任何东西
}
```

每个组件的预览渲染使用 `v-html` 直接注入 `template.html` 的内容，因为它们共享同一个 `<html>` 的 `data-theme`，CSS 变量全部自动响应——这是用 CSS 自定义属性方案的核心优势。

---

## 总结与偏差说明

| 你的预想 | 我的建议 | 偏差原因 |
|----------|----------|----------|
| Token全用Tailwind封装 | CSS变量为主，Tailwind配方为辅 | 换肤需要运行时动态性，Tailwind静态类名做不到 |
| 版式结构=组件结构 | 版式去掉component.js，加skeleton.html | 版式是容器不是组件，不需要Vue封装 |
| report-tool完全独立，零服务 | 建议保留极简server或用Safari；提示词改多轮模式 | file://协议有跨浏览器兼容问题；多轮提示词解决AI卡壳 |
| gallery卡片式网格布局 | 左侧菜单+右侧预览 | 完全同意，这是更好的方案 |

最大的偏差在第三点——**我建议把 "一次性大提示词" 改为 "多轮渐进提示词"**。这不仅是技术问题，更是从 v2 的实际使用教训出发：大提示词让 AI 卡壳，分步才是正解。report-tool 的定位应该是 **"提示词编排器"** 而非 **"组件代码注入器"**。

需要就哪个点展开聊细节？

好，直接回答。

---

## 第三点深度拆解

### 一、保留 server 到底解决了什么？

v2 的 server.py 做了两件事：

| 功能 | 用途 | v3 还需要吗？ |
|------|------|--------------|
| 静态文件服务 | 让 index.html 通过 `http://localhost:8080` 访问 | gallery.html 和 report-tool.html 用 iframe 加载同级/子级文件时，file:// 完全够用，**不需要** |
| reports/ 文件 API | 列出/读取/保存/删除报告文件 | Claude Desktop 直接写文件到 reports/，用户电脑上已经有文件了，**不需要** |

v2 需要 server 的根因是：它是一个**单页应用**，Vue 接管了所有路由，用 v-show 切页面。这要求 HTTP 服务来保证 JS 模块加载和路由正常。

v3 如果是 **gallery.html 和 report-tool.html 各自独立的普通 HTML 文件**，不涉及 SPA 路由，不涉及 fetch 跨文件读取——server 就没有存在的必要。

**结论：server 主要解决的是 SPA 的运行环境和跨目录 fetch。去掉 SPA 架构、去掉动态读取组件文件的需求，server 就可以去掉。**

---

### 二、如果保留 server，用户要装什么？

这才是从 v2 继承过来的真问题，你在 SPEC.md 里写了 "macOS 自带 Python 3，零安装"，但这是**只对了一半**：

| 平台 | 情况 | 命令 |
|------|------|------|
| macOS (Ventura+) | 系统自带 Python 3 | `python3` |
| macOS (Monterey及更早) | 自带 Python 2.7，**没有 Python 3** | 需安装 |
| Windows 10/11 | **不内置 Python** | 需去 python.org 下载安装 |
| Windows 企业管控电脑 | 可能**不允许安装**外来软件 | 无法使用 |

"双击 start.command" 的体验只在**最新版 macOS**上成立。团队里如果有人用 Windows 或者旧 Mac，第一步就卡住了。这也是为什么 v2 的 PROGRESS.md 里 "Windows 支持 — 需要添加 start.bat" 一直是待办项。

**创建时间**: 2026年5月20日 11:19  
**使用模型**: opus  

---
name: report-system v3 架构决策 - 无服务端纯静态方案
description: v3 组件库和工具采用纯静态 HTML 文件，不依赖 Python 或任何后端服务，跨平台零安装
type: project
---

v3 系统不需要 server 服务。

- 原因：v3 采用多轮渐进提示词模式，report-tool.html 只是提示词编排表单，不需要动态 fetch 组件模板，不需要 SPA 路由，不需要 reports/ 文件管理 API。gallery.html 用 iframe 加载组件预览，file:// 协议下完全可用。
- 跨平台：macOS 和 Windows 均为零安装（不需要 Python），双击 HTML 文件即可在浏览器中打开。
- 架构：gallery.html（组件库总览）、report-tool.html（报告生成工具）、bid-tool.html（标书工具）均为独立静态 HTML，各自双击运行，通过相对路径访问 ui-lib/ 中的组件资源。
- 提示词策略：提示词不嵌入组件代码，只引用组件路径（如 ui-lib/components/kpi-card/template.html），由 Claude Desktop 端自行读取，提示词体积控制在 ~800 字以内。

**How to apply:** 组件库和工具开发时继续使用纯 HTML + CDN 方案，不引入 Python server 或 Node.js 构建步骤。新增工具时按照 gallery.html 模式：独立 HTML 文件 + CDN 引入 Vue/Tailwind + 相对路径引用 ui-lib/ 组件。

---

### 回答你的问题
好的，我来逐一清晰回答这四个确认点的问题，基于专业的判断给出建议，即使是和你的预想有偏差也会明确说明。

让我先重新审视一下 v2 的 SPEC 和对话记录，确保理解准确。
现在我已经全面理解了项目。让我针对你的四个确认点给出专业的回答和建议。

---

## 1. Design Token 的扩展机制与 Tailwind 封装

### Token 的扩展方案

**核心原则：CSS自定义属性（CSS Variables）为主，Tailwind 类名封装为辅。**

推荐的三层结构：

```
design-tokens/
├── tokens.css              # 核心：所有风格的 CSS 变量定义
├── tailwind-mappings.js     # 可选：CSS变量 → Tailwind 类名映射
└── preview.html             # Token 可视化预览页
```

**tokens.css 的设计：**

```css
/* ===== 基础商务蓝白（默认） ===== */
:root {
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
  --color-danger: #ef4444;
  
  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  
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

**扩展新风格只需要加一个 `[data-theme="xxx"]` 块，不需要改任何组件代码。**

### ❌ 不同风格不可以用 Tailwind 类名封装复用

**这是我与你的预想有偏差的地方**。Tailwind 的类名是静态编译的（`text-blue-900`、`bg-blue-50`），而风格切换需要运行时的动态性。如果把颜色写死在 Tailwind 类名里：

- 切换风格时需要修改所有 DOM 元素的类名，性能差且容易漏
- 新增一种风格需要修改每个组件的 HTML 代码

**用 CSS 变量的优势：**
- `background: var(--color-bg-card)` → 换风格只需要改 CSS 变量值
- 组件代码不需要知道当前是哪种风格
- 运行时切换 `<html data-theme="dark-tech">` 生效

**Tailwind 的定位应该是什么？**

Tailwind 用来处理**布局、间距、排版**这些与颜色无关的样式：

```html
<!-- ✅ 布局用 Tailwind 类名 -->
<div class="flex flex-col gap-3 p-6 rounded-2xl shadow-lg">

<!-- ✅ 颜色用 CSS 变量 -->
style="background: var(--color-bg-card); color: var(--color-text);"
```

**可以做一个 Tailwind 配方体系（推荐）：**

```javascript
// tailwind-mappings.js — 给常用组合起名字
const STYLE_RECIPES = {
  'card-base': 'rounded-lg shadow-[var(--shadow-card)] p-6',
  'card-elevated': 'rounded-xl shadow-[var(--shadow-elevated)] p-8',
  'heading-xl': 'text-3xl font-bold',
  'body-text': 'text-base leading-relaxed',
  'badge': 'text-xs font-semibold px-3 py-1 rounded-full',
};
```

这样 AI 生成 HTML 时可以用这些配方名，而不是每次都重新写一遍。

---

## 2. 版式库的内部结构

### 版式 ≠ 组件，结构应该不同

**组件**是内容积木（KPI卡片、表格），**版式**是容器骨架（A4页面、PPT slide、网页），本质不同。

推荐版式库结构：

```
layouts/a4-landscape/
├── index.html              # 独立可打开的预览页
├── skeleton.html           # ★ 核心：页面骨架模板（AI 填空用）
└── layout.css              # 版式专属CSS（打印样式、页面尺寸、分页逻辑）
```

**版式不需要 Vue 组件（component.js）**。为什么？

| 对比维度 | 组件（components） | 版式（layouts） |
|----------|-------------------|----------------|
| 职责 | 内容展示单元 | 页面容器 + 翻页逻辑 |
| 数据绑定 | 需要 Vue（props/events） | 不需要（纯 HTML 结构） |
| 可交互 | 是 | 否（只是结构骨架） |
| AI 怎么用 | 参照代码结构写类似的 HTML | 在这个骨架里填入具体内容 |
| 文件数 | 3（index + template + component.js） | 3（index + skeleton + layout.css） |

### skeleton.html 的核心作用

这是版式库的灵魂——**给 AI 看的空壳模板**：

```html
<!-- layouts/a4-landscape/skeleton.html -->
<!-- 这是 AI 生成报告的骨架模板，请在此结构内填充内容 -->

<!-- @page { size: A4 landscape; margin: 0; } -->
<section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg relative page-break-after-always">
  <div class="content-area px-[22mm] py-[18mm]">
    <!-- ===== 第 {{N}} 页内容区 ===== -->
    <!-- AI 会在这里填充组件（kpi-card、data-table等） -->
  </div>
  <footer class="absolute bottom-[8mm] right-[22mm] text-sm text-gray-400">
    第 {{page_num}} 页
  </footer>
</section>
```

**三种版式的 skeleton 要点：**

| 版式 | skeleton 关键特征 | 翻页方式 |
|------|------------------|----------|
| A4 横版 | 固定宽高 297mm×210mm，@page A4 landscape | page-break-after（CSS 打印分页） |
| PPT Slide | 100vw×100vh，overflow hidden | JS 控制 slide 显隐，键盘/点击切换 |
| 自由网页 | max-w-[1180px] mx-auto，响应式 | 自然滚动，分 section |

---

## 3. 无服务端时，report-tool.html 怎么调用组件库和 AI 交互

这是我与你预想偏差最大的部分，也是最重要的架构决策。让我展开说清楚。

### 3.1 file:// 协议的现实限制

report-tool.html 双击打开，浏览器地址栏是 `file:///.../report-tool.html`。

当你在这个页面里执行 `fetch('../ui-lib/components/kpi-card/template.html')` 时：

| 浏览器 | file:// 下 fetch 跨目录文件 | 结果 |
|--------|---------------------------|------|
| Safari | 🟢 允许 | 正常工作 |
| Chrome | 🔴 禁止（安全策略） | 报错 CORS |
| Edge | 🔴 禁止 | 报错 CORS |
| Firefox | 🔴 限制更严 | 无法跨目录读取 |

**结论：依赖 fetch 动态读取组件模板，大概率在 Chrome 上行不通，而 Chrome 是企业用户最常用的浏览器。**

### 3.2 多轮对话模式下，不需要动态读取

这是我建议的核心改变。回顾 v2 的痛点（你实际测试发现的）：

> "内容非常多，把提示词给到 AI 后输出文件太大了，卡壳了"

所以 v3 的正确方向不是**更大的提示词**，而是**分步多轮**：

```
第一轮：搭骨架 — 仅版式 + 风格 + 主题
用户输入：
  报告主题：货币基金月度估值分析
  版式：A4 横版分页  
  风格：商务蓝白
  大致内容：封面 + 三大指标总览 + 收益率对比 + 风险提示 + 结论

工具生成的提示词（~500字，不会卡壳）：
  【版式约束】请参照 layouts/a4-landscape/skeleton.html 的页面结构
  【风格约束】请使用 styles/business-blue/tokens.css 的颜色方案
  【生成要求】用占位数据生成 5 页 A4 横版报告骨架，每页标记 [待填充]

⬇ Claude 生成 v001.html（空壳报告）
⬇ 用户：好的，骨架效果可以。现在开始填第1页，放 KPI 卡片和指标表


第二轮：填第1页
工具生成的提示词（~300字）：
  基于 reports/货币基金月度_v001.html 的第1页，
  参考 components/kpi-card/template.html 的代码风格，
  填入以下真实数据：...

⬇ Claude 基于 v001 修改 → 保存 v002
⬇ 用户通过预览页查看，发现第2页需要调整


第三轮：填第2页  
  同样模式，每次提示词控制在 ~300-500 字
```

### 3.3 report-tool.html 需要什么？

**不需要动态读取组件文件**。它只需要内置一个轻量的组件注册表：

```javascript
// report-tool.html 内置（硬编码，约 1-2KB）
const COMPONENT_CATALOG = [
  {
    id: 'kpi-card',
    name: 'KPI 数字卡片',
    category: '数据展示',
    icon: '📊',
    description: '展示核心指标数值（收益率、规模等），带趋势标签',
    // AI 参考路径（给到提示词里，不是自己读）
    refPath: '../ui-lib/components/kpi-card/template.html',
    // 适用的数据场景
    dataHint: '需要：数值、单位、变化百分比'
  },
  {
    id: 'data-table',
    name: '数据表格',
    category: '数据展示',
    icon: '📋',
    description: '简洁标准表格，蓝白风格，适合 CSV 数据直接呈现',
    refPath: '../ui-lib/components/data-table/template.html',
    dataHint: '需要：CSV数据或表格行列数据'
  },
  // ... 其他 20 个组件
];
```

### 3.4 提示词怎么引用组件？

**不嵌入代码，只引用路径。** 提示词里写：

```
【组件使用说明】
本次报告需要使用以下组件：
- KPI 数字卡片：请参照 ui-lib/components/kpi-card/template.html 的 HTML 结构和 Tailwind 类名
- 数据表格：请参照 ui-lib/components/data-table/template.html 的 HTML 结构
每个组件的 data-cid 属性必须保留，CSS 变量名（如 var(--color-primary)）不要改动
```

**为什么 AI 能看到这些文件？**
- Claude Desktop 有工作目录的概念，可以直接读取本地文件
- 用户也可以在 Claude Desktop 里把 template.html 拖进去作为附件

### 3.5 仍然需要一个超轻量服务吗？

**不需要。** gallery.html 和 report-tool.html 都作为纯静态 HTML 运行：

| 页面 | 怎么运行 | 需要服务吗 |
|------|---------|-----------|
| gallery.html（组件总览） | 双击打开，iframe 加载子组件预览 | ✅ 不需要。iframe 加载相对路径 file:// 无限制 |
| report-tool.html（生成提示词） | 双击打开，纯表单 + 文本拼接 | ✅ 不需要。没有 fetch 调用 |
| 组件独立 index.html（如 kpi-card） | 双击打开，自包含 HTML | ✅ 不需要 |

---

## 4. 总览画廊页布局

### 推荐：左右两栏布局

这与你的预想一致，具体设计：

```
┌──────────────────┬──────────────────────────────────────────────────┐
│  左侧菜单栏       │                 右侧内容预览区                     │
│  (w-64 固定240px) │                                                  │
│                  │  ┌─────────────────────────────────────────────┐ │
│  📐 设计规范      │  │  KPI 数字卡片                  [商务蓝白 ▾] │ │
│    · 色彩系统     │  │  ─────────────────────────────────────────  │ │
│    · 字体排版     │  │                                             │ │
│    · 间距圆角     │  │  ┌───────────────────────────────────────┐ │ │
│                  │  │  │                                       │ │ │
│  🧩 基础组件      │  │  │    实时预览区（看到的 = 实际效果）       │ │ │
│    · KPI卡片 ◀   │  │  │    ┌───────────────────────────┐      │ │ │
│    · 信息卡片     │  │  │    │ 环比 +12.5%               │      │ │ │
│    · 数据表格     │  │  │    │    3.28%                  │      │ │ │
│    · 流程步骤     │  │  │    │ 七日年化收益率              │      │ │ │
│    · 对比卡片     │  │  │    └───────────────────────────┘      │ │ │
│    · 团队网格     │  │  │                                       │ │ │
│    · 亮点引用     │  │  │  风格切换后自动变色                     │ │ │
│    · 大数字行     │  │  └───────────────────────────────────────┘ │ │
│    · 时间轴       │  │                                             │ │
│                  │  │  ┌─ 代码示例 ──────────────────────────────┐ │ │
│  📊 图表组件      │  │  │ <div data-cid="kpi-card"               │ │ │
│    · 柱状图       │  │  │   class="bg-[var(--color-bg-card)]     │ │ │
│    · 折线图       │  │  │   rounded-[var(--radius-lg)] ..."      │ │ │
│    · 饼图         │  │  │   ...                                  │ │ │
│    · 仪表盘       │  │  └────────────────────────────────────────┘ │ │
│                  │  │                                             │ │
│  📄 版式模板      │  │  [复制 HTML] [复制 Vue 组件] [全屏预览]     │ │
│    · A4横版       │  └─────────────────────────────────────────────┘ │
│    · PPT翻页      │                                                  │
│    · 自由滚动     │                                                  │
│                  │                                                  │
│  🎨 主题风格      │                                                  │
│    · 商务蓝白     │                                                  │
│    · 暗黑科技     │                                                  │
│    · 清新简约     │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘
```

### 交互设计要点

**1. 左侧菜单交互：**
- 一级菜单（设计规范/基础组件/图表/版式/风格）可折叠，默认全部展开
- 点击二级项（如 KPI卡片）→ 右侧内容区切换到对应组件的实时预览
- 当前选中的二级项高亮显示（深蓝背景）

**2. 右侧内容——风格切换按钮：**
- 位置：右上角固定
- 默认显示：商务蓝白风格
- 点击下拉菜单选择风格 → 立即切换，预览区组件实时变色
- **所有组件共享同一个风格选择器**，不需要一个一个组件单独切换

**3. 风格切换原理（CSS 变量优势）：**

```html
<!-- gallery.html -->
<html data-theme="business-blue">
  ...
  <div style="background: var(--color-bg-card); color: var(--color-text)">
    预览内容
  </div>
</html>
```

```javascript
// 切换风格函数
function switchTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
  // 所有使用了 var(--color-xxx) 的元素自动变色
  // 不需要重新渲染任何组件！
}
```

**4. 右侧内容区——三种展示模式（建议按 Tab 切换）：**

- Tab 1：**实时预览** — 默认激活，真实渲染组件（带示例数据）
- Tab 2：**HTML 代码** — 完整的 HTML 源代码，带语法高亮
- Tab 3：**Vue 用法** — Vue 组件的 props 说明 + 代码示例

---

## 整体架构总览

```
report_system/
├── ui-lib/                             # 组件库（独立，各工具共享）
│   ├── gallery.html                    # 总览页（左右两栏布局）
│   ├── design-tokens/
│   │   ├── tokens.css                  # CSS 变量定义 + 3套风格主题
│   │   └── preview.html               # Token 可视化展示
│   │
│   ├── components/                     # 基础组件
│   │   ├── kpi-card/
│   │   │   ├── index.html             # 独立可打开：预览 + 代码 + 参数说明
│   │   │   ├── template.html          # 纯 HTML 片段（AI 参考）
│   │   │   └── component.js           # Vue 3 组件定义
│   │   ├── info-card/
│   │   ├── data-table/
│   │   ├── timeline/
│   │   └── ...（第一批 12-15 个组件）
│   │
│   ├── charts/                         # 图表组件
│   │   ├── bar-chart/
│   │   ├── line-chart/
│   │   └── pie-chart/
│   │
│   ├── layouts/                        # 版式模板
│   │   ├── a4-landscape/
│   │   │   ├── index.html             # 独立可打开预览
│   │   │   ├── skeleton.html          # ★ 骨架模板
│   │   │   └── layout.css             # 打印样式 + 页面尺寸
│   │   ├── ppt-slide/
│   │   └── web-scroll/
│   │
│   └── styles/                         # 主题风格
│       ├── business-blue/
│       ├── dark-tech/
│       └── fresh-clean/
│
├── report-tool/                        # 工具1：报告生成
│   └── report-tool.html               # 双击运行，纯静态
│
├── bid-tool/                           # 工具2：标书撰写（后续）
│   └── bid-tool.html
│
├── bi-system/                          # 工具3：轻量BI（后续）
│   └── bi-dashboard.html
│
├── system_v1/                          # 保留
└── system_v2/                          # 保留
```

---

## 总结：4个确认点的关键决策

| 确认点 | 决策 | 与你的预想是否一致 |
|--------|------|-------------------|
| 1. Token 扩展 | CSS 变量为主，Tailwind 用于布局，**不**用 Tailwind 封装风格 | ❌ 有偏差 — Tailwind 不适合做动态换肤 |
| 2. 版式库结构 | 和组件库相似但有区别：3个文件，不需要 Vue 组件，重点是 skeleton | ⚠️ 部分一致 — 结构相似但内容不同 |
| 3. 无服务调用 | **零服务端**，多轮渐进提示词，组件注册表内置在工具中，提示词引用路径不嵌入代码 | ❌ 有偏差 — 建议完全去掉服务 |
| 4. 画廊布局 | 左右两栏，左菜单右预览，右上角风格切换按钮 | ✅ 完全一致 |

需要继续深入讨论第三点（多轮对话的具体提示词格式），还是可以开始搭建 Phase 1 的代码了？

SPEC.md 已生成到 `system_v3/SPEC.md`。下面是文档结构概览，方便你快速定位：

| 章节 | 内容 |
|------|------|
| 一、产品定位 | ui-lib 与工具分离，组件库是共享基础设施 |
| 二、技术约束 | 纯静态、零服务端、全部CDN、CSS变量做颜色、Tailwind做布局 |
| 三、项目文件结构 | 完整目录树，ui-lib / report-tool / bid-tool / bi-system 并列 |
| 四、Design Token 体系 | tokens.css 完整定义、扩展方式、风格切换原理、Tailwind角色边界 |
| 五、组件规范 | 3文件结构（index.html / template.html / component.js）、每个文件的规范、12个组件清单 |
| 六、图表组件规范 | ECharts封装规范、统一数据接口、首批3个图表 |
| 七、版式规范 | 与组件的结构差异、skeleton.html 规范、三种版式对比 |
| 八、风格预览 | 每种风格独立预览页 |
| 九、总览画廊页 | 左右两栏布局详图、交互设计、Vue实现方式 |
| 十、报告生成工具 | 多轮渐进工作流、提示词模板、组件注册表、页面结构 |
| 十一、Token预览页 | 色彩/字体/间距/圆角可视化展示 |
| 十二、工具调用方式 | 三种方式：AI引用路径 / iframe嵌入 / Vue组件引用 |
| 十三、实施计划 | 4个Phase，Phase 1先做2个组件打通流程 |
| 十四、与v2区别 | 10个维度的对比表 |
| 十五、后续扩展 | 组件/风格/版式/工具扩展预留 |

你看看有没有需要调整的地方，确认后我们按 Phase 1 开始写代码。

这是个关键的产品设计问题。我先说结论，再展开具体流程。

---

## 核心判断：表单勾选 + 实时预览，不是纯自然语言

原因很简单：业务同事不知道组件叫 "kpi-card" 还是 "big-number-row"，也不知道 "A4横版分页" 和 "PPT Slide翻页" 实际长什么样。纯自然语言描述的前提是用户已经熟悉组件库，而你们的用户**第一次打开工具时对组件库一无所知**。

但和 v2 不同——v3 的组件库每个组件都有独立的 `index.html`，可以 iframe 嵌入真实渲染，用户勾选前看到的不再是 CSS 骨架，而是**实际效果**。

---

## 用户完整操作流程（以生成一份货币基金月度报告为例）

### 前置步骤：花 3 分钟逛组件库

用户打开 `gallery.html` → 左侧菜单浏览 → 看到 kpi-card 长什么样、data-table 长什么样、A4 版式骨架长什么样 → 心里有数了 → 打开 `report-tool.html` 开始干活。

> gallery.html 的定位类似 Ant Design 官网——写代码之前先去逛逛看有哪些现成的东西。

---

### 第一轮：生成报告骨架

```
┌─────────────────────────────────────────────────────┐
│  Step 1 — 报告基本信息                               │
│                                                     │
│  报告文件名：[货币基金月度估值分析___________]          │
│  报告主题：  [面向管理人的货币基金月度收益归因___]       │
│  受众：      ○ 高管汇报  ● 客户展示  ○ 内部培训       │
│  用途：      ○ 汇报展示  ● 交付文档  ○ 培训材料       │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 2 — 版式                                      │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ [A4横版预览]  │ │ [PPT翻页预览] │ │ [自由滚动预览] │ │
│  │   iframe嵌入  │ │   iframe嵌入 │ │   iframe嵌入  │ │
│  │   skeleton    │ │   skeleton   │ │   skeleton    │ │
│  │   的缩略效果   │ │   的缩略效果  │ │   的缩略效果   │ │
│  │              │ │              │ │              │ │
│  │ ○ A4 横版分页 │ │ ● PPT Slide  │ │ ○ 自由滚动网页 │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
│  点击卡片选中（蓝色边框高亮）      [去版式库看完整效果→] │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 3 — 风格                                      │
│                                                     │
│  ● 商务蓝白  ○ 暗黑科技  ○ 清新简约                   │
│  ┌──────────────────────────────────────────────┐   │
│  │  该风格下组件实际渲染效果（实时预览）            │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │ KPI卡片  │ │ 信息卡片 │ │ 数据表格 │   ...   │   │
│  │  │ (真实色)  │ │ (真实色) │ │ (真实色)  │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘        │   │
│  └──────────────────────────────────────────────┘   │
│  风格切换时下方预览区即时变色                           │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 4 — 内容大纲                                   │
│                                                     │
│  本次报告大致包含以下内容（口语化描述即可）：            │
│  ┌─────────────────────────────────────────────┐    │
│  │ 第1页：封面（标题、团队、日期）                 │    │
│  │ 第2页：三大核心指标概览（收益率、规模、风险）     │    │
│  │ 第3页：收益率走势对比分析                       │    │
│  │ 第4页：持仓结构分析（按资产类别）                │    │
│  │ 第5页：风险指标与总结                          │    │
│  └─────────────────────────────────────────────┘    │
│  [+ 添加一页]                                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成骨架提示词并复制                       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

用户点击「生成骨架提示词」→ 提示词 ~500字，内容大致：

```
你是金融报告HTML生成专家。

【版式约束】请参照 ../ui-lib/layouts/ppt-slide/skeleton.html 的页面结构，
使用 100vw×100vh 容器、JS翻页逻辑。

【风格约束】请使用 ../ui-lib/design-tokens/tokens.css 中 business-blue 的CSS变量。
所有颜色使用 var(--color-xxx)，不要替换为具体色值。

【内容结构】
- 第1页：封面
- 第2页：三大核心指标概览
- 第3页：收益率走势对比分析
- 第4页：持仓结构分析
- 第5页：风险指标与总结

【要求】
1. 用占位数据生成5页PPT骨架，每页标记 [待填充-第X页]
2. 给每页容器添加 data-page="X" 属性
3. 保存到 reports/货币基金月度估值分析_v001.html
4. 只输出完整HTML，不要解释
```

用户复制 → 粘贴到 Claude Desktop → AI 生成 v001.html（一个只有骨架的 PPT，每页有标题和占位标记，但没有真实数据和组件）。

用户双击 v001.html 看一眼：「骨架没问题，PPT 翻页正常，颜色对。开始填内容。」

---

### 第二轮起：逐页填充内容

用户回到 report-tool.html，进入「内容填充」Tab：

```
┌─────────────────────────────────────────────────────┐
│  内容填充 — 第 2 轮                                  │
│  当前报告：货币基金月度估值分析（v001 → v002）          │
│                                                     │
│  选择要填充的页面：[第2页 ▾]  ← 下拉选择               │
│                                                     │
│  ───────────────────────────────────────────────     │
│  本页内容概要（自然语言描述）：                         │
│  ┌─────────────────────────────────────────────┐    │
│  │ 展示三只货币基金的七日年化收益率、万份收益、      │    │
│  │ 近一月回报率三个核心指标，每只基金一个卡片，     │    │
│  │ 顶部再加一个汇总对比表                        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ───────────────────────────────────────────────     │
│  选择本页使用的组件（多选，可重复选同一组件多次）：       │
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │            │ │            │ │            │      │
│  │   iframe   │ │   iframe   │ │   iframe   │      │
│  │   kpi-card │ │  data-table│ │ compare-card│      │
│  │   真实渲染  │ │   真实渲染  │ │   真实渲染   │      │
│  │            │ │            │ │            │      │
│  │ ☑ KPI卡片  │ │ ☑ 数据表格  │ │ ☐ 对比卡片  │      │
│  │   选3个    │ │   选1个    │ │            │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│  ┌────────────┐ ┌────────────┐                     │
│  │ info-card  │ │ big-number │  ...                │
│  │ ☐ 信息卡片  │ │ ☐ 大数字行  │                     │
│  └────────────┘ └────────────┘                     │
│  每个组件通过 iframe 嵌入其 index.html，              │
│  看到的是真实渲染效果（不是骨架），风格已匹配            │
│                                                     │
│  ───────────────────────────────────────────────     │
│  本页数据来源：                                       │
│  ○ 跟随全局数据  ● 本页独立指定                       │
│  [上传CSV: returns_may.csv]  已解析：3行×5列           │
│  ┌─────────────────────────────────────────┐        │
│  │ 基金名称 │ 七日年化 │ 万份收益 │ 近一月回报 │       │
│  │ 天弘     │ 2.15%   │ 0.5892  │ 0.18%    │       │
│  │ 南方     │ 2.08%   │ 0.5701  │ 0.16%    │       │
│  │ 华夏     │ 2.21%   │ 0.6013  │ 0.19%    │       │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成第2页填充提示词并复制                   │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

生成的提示词 ~400字：

```
请基于 reports/货币基金月度估值分析_v001.html 继续修改。

【当前任务】填充第2页（data-page="2"）。

【组件参考】
- KPI数字卡片：请参照 ../ui-lib/components/kpi-card/template.html
- 数据表格：请参照 ../ui-lib/components/data-table/template.html
严格参照其 data-cid、CSS变量风格、Tailwind布局类名。

【内容要求】
展示三只货币基金的七日年化收益率、万份收益、近一月回报率三个核心指标。
每只基金一个KPI卡片，顶部加一个汇总对比表。

【数据】
CSV: returns_may.csv（3只基金×4项指标）

【要求】
1. 保持第1页及其他页面内容不变，只修改 data-page="2" 的内容
2. 从CSV读取真实数据填入组件
3. 保存为 reports/货币基金月度估值分析_v002.html
4. 只输出完整HTML，不要解释
```

用户复制 → Claude 生成 v002 → 用户双击预览 → 第2页填好了 → 继续第3页。

---

### 逐页填充直到完成

第3页（收益率走势对比）→ 选 line-chart + info-card → 生成提示词 → v003
第4页（持仓结构分析）→ 选 pie-chart + data-table → 生成提示词 → v004
第5页（风险指标与总结）→ 选 big-number-row + highlight-quote → 生成提示词 → v005

每轮提示词都只有 300-500 字，AI 不会卡壳。

---

### 精细修改阶段

用户发现第3页饼图的颜色和整体风格不太搭，或者文字措辞不够正式。回到工具的「精细修改」Tab：

```
┌─────────────────────────────────────────────────────┐
│  精细修改                                            │
│  当前版本：货币基金月度估值分析_v005.html              │
│                                                     │
│  修改意见（自然语言）：                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ 1. 第3页饼图的配色改成商务蓝白风格一致的蓝色系    │    │
│  │ 2. 第5页"风险可控"改成"风险指标处于合理区间"    │    │
│  │ 3. 封面加一句slogan："专业估值，守护资产价值"   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成修改提示词并复制                       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

AI 基于 v005 做定点修改 → v006 → 完成。

---

## 关键设计要点总结

| 用户动作 | 界面形式 | 预览方式 |
|----------|---------|---------|
| 选版式 | 3张卡片单选，每张卡片嵌入版式 skeleton.html 的缩略 iframe | 看到真实骨架效果 |
| 选风格 | 3个选项 + 下方组件实时变色预览区 | 切换风格后预览区即时变色 |
| 写内容大纲 | textarea，自然语言，口语化即可 | 无预览（此阶段还没内容） |
| 选组件 | 多选卡片，每张卡片 iframe 嵌入组件的 index.html | **看到真实渲染效果**，且已匹配当前风格 |
| 上传数据 | CSV 拖拽/选择，自动解析预览前5行 | 表格预览 |
| 修改意见 | textarea，自然语言描述 | 无预览 |

**和 v2 的核心区别**：v2 的组件选择是 CSS 骨架缩略图（灰白 placeholder），v3 是 iframe 嵌入的**真实渲染**。用户选 kpi-card 时看到的就是将来报告里 KPI 卡片的样子，且切换风格后预览区自动变色——没有 "选了暗黑科技但缩略图还是蓝色" 的割裂感。

---

## 一个坦诚的提醒

这套流程里有一个**不可省略的用户行为**：在 Claude Desktop 和 report-tool.html 之间来回切换。v2 是这个模式，v3 也是。

完全消除这个切换的唯一方案是**把 AI 调用嵌入工具本身**（调 Claude API，流式返回），但这意味着：
- 需要后端服务（API Key 不能暴露在前端）
- 需要网络
- 需要付费（API 按 token 计费）

SPARC 方案里写的 "后续扩展预留：AI 直接对话集成" 就是这个方向。当前阶段保留复制粘贴模式是务实的——先用最小成本跑通流程，验证多轮渐进方案确实比一次性大提示词好，再决定是否做内嵌 AI。

---

需要我把这个操作流程也补充到 SPEC.md 里吗？还是现有 SPEC 已经够清晰，可以直接开始 Phase 1 的代码了？

---

## 📋 会话总结

**结束时间**: 2026/05/20 15:30:34
**总问题数**: 7
**总回答数**: 11

---


## 👤 用户问题

**时间**: 2026/05/20 15:37:55

好的，把这些补充下


---


## 🤖 Claude 回答

**时间**: 2026/05/20 15:44:06

你好！有什么我可以帮你的吗？

让我先仔细阅读 v2 版本的 SPEC.md 和相关文件，了解项目的全貌。

让我再看看 v1 版本和已有的 v3 目录，以及 v2 的对话记录了解已知问题。

让我再看看 v2 的对话记录，了解已知问题和用户反馈。

让我再快速了解 v2 对话记录的后续部分，确认已知问题。

我已经完整阅读了 SPEC.md、PROGRESS.md、DEMO_GUIDE.md 以及 conversation.md 全部内容，对项目全貌有了清晰理解。下面给出专业建议和方案。

---

## system_v3 组件库 — 架构方案与建议

### 一、核心判断

v2 的问题根因不是功能缺失，而是**架构边界不清**。组件库（资源库）、报告生成工具、预览编辑器全部耦合在一个 index.html 里，导致：
- 组件只是 JS 对象里的 `htmlSnippet` 字符串，无法独立预览
- 其他工具（标书、BI）完全无法复用
- 改一个组件可能影响整个工具

v3 要做的本质是：**把组件库从工具里剥离出来，升级为独立的基础设施层**。

---

### 二、目录结构设计

```
report_system/
├── ui-lib/                          # ← 组件库（本次第一步要建的）
│   ├── gallery.html                 # 总览浏览页（汇总入口）
│   ├── design-tokens/
│   │   ├── tokens.css               # CSS 自定义属性（所有组件引用这个）
│   │   ├── tailwind.config.js       # Tailwind theme 配置（给用 Tailwind 的项目）
│   │   └── preview.html             # Design Token 可视化预览页
│   ├── components/                  # 基础组件
│   │   ├── kpi-card/
│   │   │   ├── index.html           # ★ 独立可打开：渲染示例 + 代码展示
│   │   │   ├── template.html        # 纯 HTML 片段（AI prompt 参考用）
│   │   │   └── component.js         # Vue 3 组件定义（工具引用用）
│   │   ├── info-card/
│   │   ├── data-table/
│   │   ├── compare-card/
│   │   ├── timeline/                # 新增
│   │   └── ...
│   ├── charts/                      # 图表组件（ECharts 封装）
│   │   ├── bar-chart/
│   │   ├── line-chart/
│   │   ├── pie-chart/
│   │   └── ...
│   ├── layouts/                     # 版式模板
│   │   ├── a4-landscape/
│   │   ├── ppt-slide/
│   │   ├── web-scroll/
│   │   └── bi-dashboard/            # 新：BI 仪表盘版式
│   └── styles/                      # 风格/主题
│       ├── business-blue/
│       ├── dark-tech/
│       ├── fresh-clean/
│       └── ...
│
├── report-tool/                     # 报告生成工具（v3 重构版）
│   ├── index.html
│   ├── start.command
│   ├── server.py
│   ├── js/
│   └── ...                          # 引用 ../ui-lib/ 的组件
│
├── bid-tool/                        # 标书工具（后续）
│   └── ...                          # 同样引用 ../ui-lib/
│
├── bi-system/                       # 轻量 BI 系统（后续）
│   └── ...                          # 同样引用 ../ui-lib/
│
├── system_v1/                       # 保留，不动
└── system_v2/                       # 保留，不动
```

**关键设计决策**：`ui-lib/` 与各工具是**平级目录**，工具通过相对路径 `../ui-lib/components/xxx/` 引用组件。各工具独立启动、独立开发、互不干扰。

---

### 三、技术栈选型

| 层面 | 选型 | 理由 |
|------|------|------|
| **组件定义** | Vue 3 SFC（单文件组件） | v2已验证的方向，团队熟悉；CDN和构建两种用法都支持 |
| **构建工具** | Vite | 组件库需要模块化开发，Vite HMR体验极佳；但输出的 `template.html` 仍是纯HTML，工具侧可继续用CDN |
| **CSS框架** | Tailwind CSS v4 + CSS自定义属性 | Tailwind给AI生成HTML用（AI对Tailwind类名极熟）；CSS变量给Design Token用（框架无关，任何工具都能消费） |
| **图表** | ECharts 5 | 金融场景标配，封装为Vue组件后暴露出简单接口 |
| **组件库文档** | 原生HTML + 少量Vue（gallery.html） | 零依赖可打开，不需要额外文档站 |
| **类型系统** | JSDoc（暂不上TypeScript） | 业务同事也参与维护，降低门槛；后续可逐步加TS |

**重要：保留CDN可用性。** 组件库用Vite开发，但每个组件的 `template.html` 依然是纯Tailwind HTML片段——这意味着：
- AI 提示词里引用的组件代码仍然是纯HTML+Tailwind，AI直接能写
- 不需要构建工具的工具（如report-tool想做CDN-only）完全不受影响
- 需要构建能力的工具（如BI系统）可以 import Vue组件获得交互能力

---

### 四、单个组件的文件规范

以 `kpi-card` 为例，每个组件目录下 **3个文件**：

```
ui-lib/components/kpi-card/
├── index.html          # ★ 核心文件：独立打开 = 组件文档 + 实时预览
├── template.html       # 纯 HTML 片段，给 AI prompt 参考
└── component.js        # Vue 3 组件（给需要编程引用的工具）
```

#### 4.1 `index.html` — 独立预览页（重点设计）

这是你们 "像开源组件库一样" 想法的核心载体。打开后包含：

```
┌──────────────────────────────────────────────────┐
│  ← 返回组件库总览                                 │
│                                                  │
│  KPI 数字卡片                          [商务蓝白] │
│  ─────────────────────────────────────  [暗黑科技] │
│  ┌──────────────────────────────┐    [清新简约]   │
│  │  ↑ 实时渲染示例（可切换风格）  │                │
│  │  ┌──────────────────────┐   │                │
│  │  │ 环比 +12.5%          │   │                │
│  │  │    3.28%             │   │                │
│  │  │ 七日年化收益率        │   │                │
│  │  └──────────────────────┘   │                │
│  └──────────────────────────────┘                │
│                                                  │
│  Props / 数据接口                                │
│  ┌──────────────────────────────────────────────┐│
│  │ label: string    — 标签文本                   ││
│  │ value: number    — 指标数值                   ││
│  │ unit: string     — 单位                       ││
│  │ trend: string    — 趋势标签 (可选)             ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  代码示例                                        │
│  ┌──────────────────────────────────────────────┐│
│  │ <!-- HTML 用法（AI生成/纯静态场景）-->         ││
│  │ <div data-cid="kpi-card" class="bg-white..."> ││
│  │   ...                                         ││
│  │ </div>                                        ││
│  │                                               ││
│  │ <!-- Vue 组件用法（开发工具时）-->              ││
│  │ <KpiCard label="七日年化" :value="3.28" />     ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  [复制 HTML 片段]  [复制 Vue 代码]                │
└──────────────────────────────────────────────────┘
```

设计要点：
- **内联CSS变量切换风格**：页面顶部有风格切换按钮（business-blue / dark-tech / fresh-clean），点击后改变 `<html>` 上的 `data-theme` 属性，所有示例实时变色。不需要重新加载页面。
- **代码展示用 `<pre><code>` + 语法高亮**：简单用 Prism.js CDN 或自己写基础高亮
- **每个 `index.html` 完全自包含**：内联 `<style>` + 必要的 CDN `<script>`（Tailwind CDN、Vue CDN、ECharts CDN），双击即开

#### 4.2 `template.html` — AI 参考片段

```html
<!-- 就是最精简的纯HTML片段，给AI当 few-shot 参考 -->
<div data-cid="kpi-card" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
  <span class="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-3 py-1 rounded-full w-fit">环比 +12.5%</span>
  <div class="text-5xl font-bold" style="color:var(--color-primary)">3.28<span class="text-lg font-normal" style="color:var(--color-text-muted)">%</span></div>
  <p class="text-sm" style="color:var(--color-text-muted)">七日年化收益率</p>
</div>
```

#### 4.3 `component.js` — Vue 组件

```javascript
// 给开发工具时 import 使用
export default {
  name: 'KpiCard',
  props: {
    label: String,
    value: Number,
    unit: { type: String, default: '%' },
    trend: { type: String, default: '' }
  },
  template: `...`  // 或从 template.html 加载
};
```

---

### 五、Design Token 体系

这是整个组件库的**灵魂**。没有统一的Token，跨工具复用就是空谈。

```css
/* ui-lib/design-tokens/tokens.css */

:root {
  /* === 商务蓝白（默认）=== */
  --color-primary: #1e3a8a;
  --color-primary-light: #dbeafe;
  --color-bg: #f8fafc;
  --color-bg-card: #ffffff;
  --color-text: #1f2937;
  --color-text-muted: #64748b;
  --color-accent: #2563eb;
  --color-border: #e5e7eb;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* 阴影 */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 10px 25px rgba(0,0,0,0.08);

  /* 字体 */
  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 28px;
  --text-3xl: 40px;
}

/* 暗黑科技主题 */
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

/* 清新简约主题 */
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

**为什么用CSS自定义属性而不是纯Tailwind类名？**

1. **框架无关**：Vue项目、React项目、纯HTML项目，全都直接 `var(--color-primary)` 就能用
2. **运行时切换**：改一个 `data-theme` 属性，所有组件实时换肤
3. **AI友好**：AI生成的HTML里写 `style="color:var(--color-primary)"` 同样生效
4. **与Tailwind互补**：Tailwind做布局和工具类，Token做品牌色和风格变量

Tailwind v4 的 `@theme` 可以直接映射这些CSS变量，两者不冲突。

---

### 六、总览画廊页（gallery.html）

这是所有组件的**汇总浏览入口**，类似 Ant Design 的组件总览页。

```
┌─────────────────────────────────────────────────────┐
│  UI Library — 估值团队前端组件库                      │
│  ─────────────────────────────────────────────────── │
│  [设计规范] [基础组件] [图表] [版式] [风格]           │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ KPI 卡片  │ │ 信息卡片  │ │ 数据表格  │   ...      │
│  │ [缩略图]  │ │ [缩略图]  │ │ [缩略图]  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 柱状图    │ │ 折线图    │ │ 饼图      │   ...      │
│  │ [缩略图]  │ │ [缩略图]  │ │ [缩略图]  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  技术栈：Vue 3 + Tailwind CSS + ECharts 5            │
│  Design Tokens 规范 → [查看]                         │
└─────────────────────────────────────────────────────┘
```

- 每个组件卡片用 **iframe 嵌入** 对应组件的 `index.html` 缩略区域，所见即所得
- 点击卡片 → 跳转到组件独立的 `index.html`
- 顶部导航分类：基础组件 / 图表 / 版式 / 风格 / 设计规范
- gallery.html 本身可以双击打开，不依赖任何服务

---

### 七、工具如何调用组件库

三种消费方式，按复杂度递增：

#### 方式A：AI提示词引用（最简单，v2模式）

报告工具往AI提示词里注入 `template.html` 片段。通过路径读取：
```javascript
// 工具侧代码
const template = await fetch('../ui-lib/components/kpi-card/template.html')
  .then(r => r.text());
// 拼入prompt
```

#### 方式B：iframe嵌入预览

工具侧用 iframe 嵌入组件的 `index.html`：
```html
<iframe src="../ui-lib/components/kpi-card/index.html"></iframe>
```
这样工具里就能直接展示组件的交互预览，不需要复制代码。

#### 方式C：ES Module导入（BI系统用）

BI系统用Vite构建时，直接 import Vue组件：
```javascript
import KpiCard from '../ui-lib/components/kpi-card/component.js';
```
获得完整的Vue组件能力（响应式数据绑定、事件处理等）。

**三种方式并存，同一个组件目录满足三种场景。**

---

### 八、第一步实施计划（组件库搭建）

按优先级分4个阶段：

#### Phase 1 — 骨架与规范（1-2天）

| 产出 | 说明 |
|------|------|
| `ui-lib/design-tokens/tokens.css` | 3套风格的CSS变量定义 |
| `ui-lib/design-tokens/preview.html` | Token可视化预览（色块、字体阶梯、间距演示） |
| `ui-lib/components/kpi-card/` | 第一个完整组件（3个文件），作为模板范例 |
| `ui-lib/components/info-card/` | 第二个组件，验证模板可复用性 |
| `COMPONENT_SPEC.md` | 组件开发规范文档（文件结构、命名约定、必须包含的元素） |

**先做2个组件打通流程**，确认结构合理再铺量。

#### Phase 2 — 基础组件铺量（2-3天）

迁移v2的8个组件 + 新增实用组件：

| 类别 | 组件 |
|------|------|
| 数据展示 | kpi-card, big-number-row, data-table |
| 内容展示 | info-card, highlight-quote, team-grid |
| 流程展示 | process-step, timeline（新增） |
| 对比分析 | compare-card |
| 装饰/布局 | divider, section-header（新增） |

#### Phase 3 — 图表封装（2-3天）

基于ECharts封装：
- bar-chart, line-chart, pie-chart
- 每个chart暴露统一接口：`{ data, xField, yField, title }`
- `index.html` 里做交互式Demo：可编辑JSON数据实时预览图表变化

#### Phase 4 — 版式 + 总览页（2天）

- 3套版式的独立HTML（a4 / ppt / web）
- 5套风格预览（在现有3套基础上扩充）
- `gallery.html` 总览汇总页
- 各工具对接验证

---

### 九、几个重要的架构建议

**1. 不要急于用Vite把组件库做成npm包。** 第一阶段保持纯HTML+CDN打开方式，降低环境依赖。团队三个工具进度不一，组件库应该是"即开即用"的资源，不是"先build再跑"的依赖。Vite/Vue SFC等构建能力放在component.js里，给有构建环境的工具用，不影响CDN路径。

**2. template.html 是核心资产。** v2的经验证明：AI生成的HTML质量直接取决于你给它的few-shot示例质量。每个组件的template.html必须经过人工审核——确保Tailwind类名规范、data-cid完整、缩进清晰、无障碍性问题。这比Vue组件写得漂不漂亮重要十倍。

**3. Design Token先稳后扩。** 先用3套主题跑通，不要一上来定义20个Token。实践中发现缺什么加什么。Token的命名要偏向语义化（`--color-primary`）而非具体色值（`--color-blue-800`），这样换主题时不用改组件代码。

**4. 分离"组件"和"业务模板"。** ui-lib只放通用组件（按钮、卡片、图表、表格），不要放"货币基金报告模板"之类的业务组合。业务模板放在各自的工具目录里。这条边界不守住，组件库很快变成大杂烩。

**5. gallery.html用iframe嵌入组件预览。** 不要把所有组件代码都加载到gallery页面里（v2的components-gallery问题之一就是几百行代码全摊在一个页面）。iframe隔离加载，每个组件独立渲染，gallery只做导航汇总。

---

### 十、与v2的关键区别

| 维度 | v2 | v3（建议） |
|------|-----|-----------|
| 组件形态 | JS字符串 `htmlSnippet` | 独立HTML文件，可双击打开 |
| 组件预览 | 画廊页里的CSS骨架 | iframe嵌入真实渲染 |
| 跨工具复用 | 不可能（耦合在工具内） | 相对路径引用 `../ui-lib/` |
| 设计规范 | 散落在各组件JS里 | 集中在 `design-tokens/tokens.css` |
| 主题切换 | 不支持运行时切换 | `data-theme` 属性秒切 |
| 图表 | 无（靠AI临时写） | 预封装的ECharts图表 |
| 工具数量 | 1个 | 3个（报告+标书+BI） |

---

总结一句话：**v3的核心不是多做几个组件，而是把组件从工具里解放出来，变成团队共享的基础设施。** 第一步把 ui-lib 目录骨架、2个范例组件、Design Token和 gallery.html 跑通，后面铺组件就是体力活了。

需要我开始搭建 Phase 1 的骨架吗？还是对以上方案有需要调整的地方？

好，逐一回答四个确认点，有些地方我的建议会和你的预想有偏差，我会说清楚原因。

---

## 1. Design Token 的扩展机制与 Tailwind 封装

### Token 怎么扩

建议采用 **CSS 自定义属性 + 语义化命名** 的方案，而不是把 Token 写成 Tailwind 类名。原因很直接：

```
/* 新增一个风格只需要加这一段，其他什么都不用改 */
[data-theme="gov-red-gold"] {
  --color-primary: #8b1a1a;
  --color-primary-light: #fef2f2;
  --color-bg: #fafaf9;
  --color-bg-card: #ffffff;
  --color-text: #292524;
  --color-text-muted: #78716c;
  --color-accent: #ca8a04;
  --color-border: #e7e5e4;
}
```

新增一个 "政务红金" 风格：打开 `tokens.css`，加 10 行 CSS，完事。所有组件、所有图表、所有版式**自动适配新风格**，因为它们的颜色引用的是 `var(--color-primary)` 而不是 `#1e3a8a`。

v2 的问题恰恰就是颜色写死在组件的 Tailwind 类名里（`text-blue-900`、`bg-blue-50`），导致换风格时缩略图还是蓝色。

### Tailwind 类名能否封装复用？

可以，但和你设想的方式可能不同。不是"把风格定义成 Tailwind 类"，而是反过来：

**定义 "样式配方"（Style Recipe）作为可复用常量：**

```javascript
// ui-lib/design-tokens/recipes.js
const RECIPES = {
  'card-base': 'rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--space-lg)]',
  'card-elevated': 'rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] p-[var(--space-xl)]',
  'heading-lg': 'text-[var(--text-xl)] font-bold font-[var(--font-heading)]',
  'body-text': 'text-[var(--text-base)] font-[var(--font-body)]',
  'badge-primary': 'text-xs font-semibold px-3 py-1 rounded-full w-fit'
};
```

这些配方字符串**本身是 Tailwind 类名组合**，但里面的颜色/间距值引用了 CSS 变量。使用时直接拼：

```html
<div class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
```

AI 生成 HTML 时，prompt 里注入这些配方作为约束："所有卡片使用以下类名组合：`rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6`"。AI 会照做，且因为值是 CSS 变量，换主题自动变色。

**总结：Token 层用 CSS 变量做 "值" 的定义，Tailwind 做 "布局和排版" 的工具层，配方做 "组合复用" 的中间层。** 三层各司其职。

---

## 2. 版式库的内部结构

版式和组件**不应**使用完全一致的文件结构，因为它们本质不同。组件是内容积木，版式是容器骨架。

建议版式结构如下：

```
ui-lib/layouts/a4-landscape/
├── index.html              # 独立预览：用示例内容渲染一个完整A4报告
├── skeleton.html           # ★ 核心：页面骨架（不含内容，只有容器+分页逻辑+打印样式）
├── layout.css              # 版式专属样式（@page、page-break、容器尺寸）
└── README.md               # （可选）版式适用场景说明，不需要Vue组件
```

**skeleton.html 长什么样？**

```html
<!-- 这就是给AI看的"壳子"，AI往里填组件 -->
<div class="a4-page-container">
  <!-- @page { size: A4 landscape; margin: 0; } -->
  <section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg page-break-after-always">
    <div class="content-area px-[22mm] py-[18mm]">
      <!-- {{ page_content }} AI在这里填充组件 -->
    </div>
    <footer class="absolute bottom-[8mm] right-[22mm] text-sm text-[var(--color-text-muted)]">
      第 {{ page_num }} 页
    </footer>
  </section>
</div>
```

**与组件的关键区别：**

| 维度 | 组件 | 版式 |
|------|------|------|
| 职责 | 内容展示单元 | 页面容器+翻页逻辑+打印 |
| 可嵌套 | 组件放入版式 | 版式包裹组件 |
| Vue 组件 | 需要（交互绑定数据） | 不需要（纯结构+CSS） |
| AI 如何使用 | 参照 htmlSnippet 复制写法 | 作为外层模板，在里面填充组件 |
| 文件数 | 3个（index.html, template.html, component.js） | 3个（index.html, skeleton.html, layout.css） |

版式不需要 `component.js`，因为版式不是交互组件——它是静态的 HTML 骨架 + CSS 规则。A4 版式的翻页是 CSS `page-break-after` 控制的，PPT 版式的翻页是简单的 JS 显隐逻辑，这些都放在 `skeleton.html` 的 `<script>` 标签里即可。

---

## 3. report-tool.html 独立运行 —— 怎么调用组件库，怎么和 AI 交互

这是四个问题里最重要的一个，也是我的建议和你预想偏差最大的地方。

### 3.1 技术约束：file:// 协议的现实限制

report-tool.html 双击打开 → 浏览器地址栏是 `file:///Users/xxx/report_system/report-tool/report-tool.html`。这时：

- `fetch('../ui-lib/components/kpi-card/template.html')` → **Safari 可以，Chrome 默认不行**（Chrome 禁止 file:// 下访问父级目录）
- `<iframe src="../ui-lib/components/kpi-card/index.html">` → **所有浏览器都支持**（iframe 加载 file:// 子资源不受限）
- `<img src="../ui-lib/design-tokens/preview.html">` → 同上，支持

**结论：如果 report-tool 要通过 fetch 动态读取组件模板拼进提示词，在 Chrome 上行不通。** 团队用 Safari 的话可以，但不能假设所有人都用 Safari。

### 3.2 我的建议：换个思路，不需要动态读取

v2 的核心痛点是 **"一个巨大的提示词丢给 AI，AI 卡壳"**。你在 conversation.md 里已经发现了：

> "我的内容非常多，给到ai后输出文件太大了，卡壳了，所以我们要分步输出"

那 v3 的方向就不该是 "工具读组件模板 → 拼成更大的提示词 → AI 更卡"。而应该是 **"多轮对话，渐进生成"**。

#### 推荐的工作流（v3）

```
第一轮：搭骨架
  用户在工具里选：版式=A4横版、风格=商务蓝白、主题=货币基金月度报告
  → 生成"骨架提示词"（~800字）
  → AI生成只有容器的空壳HTML，每页标记 [待填充内容]
  → 保存为 货币基金报告_v001.html

第二轮：填内容（逐页/逐区块）
  用户选：第1页用 kpi-card + data-table，内容概要：展示三大收益率指标
  → 生成"内容提示词"（~500字，含当前页组件的template片段）
  → AI基于v001.html修改，填充第1页
  → 保存为 v002

第三轮：填第2页
  → 同样流程，AI基于v002继续

第四轮：精细修改
  → 自然语言描述微调
  → AI生成v004
```

**这个模型下，report-tool.html 不需要 fetch 任何组件文件。** 它只需要：

1. **内置组件注册表**（轻量，纯元数据，~2KB）：

```javascript
const COMPONENT_REGISTRY = [
  { id: 'kpi-card', name: 'KPI数字卡片', category: '数据展示',
    description: '大数字+趋势标签+说明文字',
    templatePath: '../ui-lib/components/kpi-card/template.html' },
  { id: 'data-table', name: '数据表格', category: '数据展示',
    description: '蓝色表头+斑马纹行',
    templatePath: '../ui-lib/components/data-table/template.html' },
  // ... 20个组件也就2KB
];
```

2. **提示词模板引擎**：根据用户选择，拼装结构化的分步提示词。**提示词里引用组件路径，但不嵌入组件代码**——AI 自己去读（Claude 桌面端有文件系统权限）。

提示词关键段落：

```
【组件参考】
请使用以下路径的组件模板作为 HTML 代码参考：
- KPI卡片：ui-lib/components/kpi-card/template.html
- 数据表格：ui-lib/components/data-table/template.html
每个组件的 data-cid 属性、Tailwind 类名风格、HTML 结构请严格参照模板文件。
```

如果担心 AI 不主动读文件，用户可以在 Claude Desktop 里把 `template.html` 文件拖进去作为附件——这和 v2 "粘贴代码块"效果一样，但更灵活。

### 3.3 如果我这个建议你不同意

如果你坚持要工具在生成提示词时自动嵌入组件模板，那就不能完全去掉服务。最小代价方案是在 `start.command` 里加一行：

```bash
# start.command（仍然双击启动，但不是Python）
open -a "Google Chrome" --args --allow-file-access-from-files "$(dirname "$0")/report-tool.html"
```

或者保留一个极简 Python 服务（就是 SPEC.md 里那50行），用户的感知只是双击 start.command 而已，服务在后台透明运行。

**坦率地说：我建议保留极简 server。** 用户双击 start.command 的体验完全不变，但消除了所有 file:// 的坑。而且 gallery.html 里用 iframe 加载组件独立预览时，HTTP 服务下 iframe 通信（postMessage）也更可靠。

---

## 4. 总览画廊页布局

你的设想完全可行，这是最没有争议的一点。具体设计：

```
┌──────────────────┬──────────────────────────────────────────────┐
│  左侧菜单栏       │           右侧内容区                          │
│  (w-64, 固定)    │                                              │
│                  │   ┌──────────────────────────────────────┐  │
│  UI Library      │   │  设计规范 / 基础组件 / 图表           │  │
│  ────────────    │   │                        [商务蓝白 ▾]  │  │
│                  │   │  一键切换风格按钮 →                    │  │
│  📐 设计规范      │   └──────────────────────────────────────┘  │
│    · 色彩系统     │                                              │
│    · 字体排版     │   ┌─────────────────────────────────────┐   │
│    · 间距圆角     │   │                                     │   │
│                  │   │   当前选中组件的实时预览              │   │
│  🧩 基础组件      │   │   （默认显示第一个组件，              │   │
│    · KPI卡片     │   │    风格切换后立即变色）               │   │
│    · 信息卡片     │   │                                     │   │
│    · 数据表格     │   │   ┌───────────────────────────┐    │   │
│    · 流程步骤     │   │   │ 环比 +12.5%               │    │   │
│    · 对比卡片     │   │   │    3.28%                  │    │   │
│    · 团队网格     │   │   │ 七日年化收益率              │    │   │
│    · 亮点引用     │   │   └───────────────────────────┘    │   │
│    · 大数字行     │   │                                     │   │
│    · 时间轴       │   │   ── 代码示例 ──                    │   │
│                  │   │   <div data-cid="kpi-card" ...>     │   │
│  📊 图表          │   │   ...                               │   │
│    · 柱状图       │   │                                     │   │
│    · 折线图       │   │   [复制HTML] [复制Vue] [全屏预览]   │   │
│    · 饼图         │   └─────────────────────────────────────┘   │
│                  │                                              │
│  📄 版式          │                                              │
│    · A4横版       │                                              │
│    · PPT翻页      │                                              │
│    · 自由滚动     │                                              │
│                  │                                              │
│  🎨 风格          │                                              │
│    · 商务蓝白     │                                              │
│    · 暗黑科技     │                                              │
│    · 清新简约     │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### 交互逻辑

- **左侧菜单**：一级分类可折叠。点击二级菜单项 → 右侧切换到对应组件/版式/风格的预览
- **风格切换按钮**：右上角下拉选择器，切换 `data-theme` 属性 → 右侧预览区所有元素即时变色。这个按钮**全局有效**，不管你在看哪个组件，切换风格都立即反映
- **右侧内容区**：渲染的不是缩略图，而是**组件 template.html 的真实渲染效果**（内联在 gallery 页面里），配合下方带语法高亮的代码块。用户看到的效果 = AI 将生成的 HTML 效果
- **"全屏预览"按钮**：打开组件独立的 `index.html`（新标签页），获取完整的组件文档体验

### 实现要点

```javascript
// gallery.html 核心状态
const state = reactive({
  activeCategory: 'components',   // 左侧当前选中的一级分类
  activeItem: 'kpi-card',         // 当前选中的二级项目
  currentTheme: 'business-blue'   // 当前风格
});

// 切换风格 → 改根元素 data-theme，所有内联预览自动变色
function switchTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.currentTheme = theme;
  // CSS 变量即时生效，不需要重新渲染任何东西
}
```

每个组件的预览渲染使用 `v-html` 直接注入 `template.html` 的内容，因为它们共享同一个 `<html>` 的 `data-theme`，CSS 变量全部自动响应——这是用 CSS 自定义属性方案的核心优势。

---

## 总结与偏差说明

| 你的预想 | 我的建议 | 偏差原因 |
|----------|----------|----------|
| Token全用Tailwind封装 | CSS变量为主，Tailwind配方为辅 | 换肤需要运行时动态性，Tailwind静态类名做不到 |
| 版式结构=组件结构 | 版式去掉component.js，加skeleton.html | 版式是容器不是组件，不需要Vue封装 |
| report-tool完全独立，零服务 | 建议保留极简server或用Safari；提示词改多轮模式 | file://协议有跨浏览器兼容问题；多轮提示词解决AI卡壳 |
| gallery卡片式网格布局 | 左侧菜单+右侧预览 | 完全同意，这是更好的方案 |

最大的偏差在第三点——**我建议把 "一次性大提示词" 改为 "多轮渐进提示词"**。这不仅是技术问题，更是从 v2 的实际使用教训出发：大提示词让 AI 卡壳，分步才是正解。report-tool 的定位应该是 **"提示词编排器"** 而非 **"组件代码注入器"**。

需要就哪个点展开聊细节？

好，直接回答。

---

## 第三点深度拆解

### 一、保留 server 到底解决了什么？

v2 的 server.py 做了两件事：

| 功能 | 用途 | v3 还需要吗？ |
|------|------|--------------|
| 静态文件服务 | 让 index.html 通过 `http://localhost:8080` 访问 | gallery.html 和 report-tool.html 用 iframe 加载同级/子级文件时，file:// 完全够用，**不需要** |
| reports/ 文件 API | 列出/读取/保存/删除报告文件 | Claude Desktop 直接写文件到 reports/，用户电脑上已经有文件了，**不需要** |

v2 需要 server 的根因是：它是一个**单页应用**，Vue 接管了所有路由，用 v-show 切页面。这要求 HTTP 服务来保证 JS 模块加载和路由正常。

v3 如果是 **gallery.html 和 report-tool.html 各自独立的普通 HTML 文件**，不涉及 SPA 路由，不涉及 fetch 跨文件读取——server 就没有存在的必要。

**结论：server 主要解决的是 SPA 的运行环境和跨目录 fetch。去掉 SPA 架构、去掉动态读取组件文件的需求，server 就可以去掉。**

---

### 二、如果保留 server，用户要装什么？

这才是从 v2 继承过来的真问题，你在 SPEC.md 里写了 "macOS 自带 Python 3，零安装"，但这是**只对了一半**：

| 平台 | 情况 | 命令 |
|------|------|------|
| macOS (Ventura+) | 系统自带 Python 3 | `python3` |
| macOS (Monterey及更早) | 自带 Python 2.7，**没有 Python 3** | 需安装 |
| Windows 10/11 | **不内置 Python** | 需去 python.org 下载安装 |
| Windows 企业管控电脑 | 可能**不允许安装**外来软件 | 无法使用 |

"双击 start.command" 的体验只在**最新版 macOS**上成立。团队里如果有人用 Windows 或者旧 Mac，第一步就卡住了。这也是为什么 v2 的 PROGRESS.md 里 "Windows 支持 — 需要添加 start.bat" 一直是待办项。

**创建时间**: 2026年5月20日 11:19  
**使用模型**: opus  

---
name: report-system v3 架构决策 - 无服务端纯静态方案
description: v3 组件库和工具采用纯静态 HTML 文件，不依赖 Python 或任何后端服务，跨平台零安装
type: project
---

v3 系统不需要 server 服务。

- 原因：v3 采用多轮渐进提示词模式，report-tool.html 只是提示词编排表单，不需要动态 fetch 组件模板，不需要 SPA 路由，不需要 reports/ 文件管理 API。gallery.html 用 iframe 加载组件预览，file:// 协议下完全可用。
- 跨平台：macOS 和 Windows 均为零安装（不需要 Python），双击 HTML 文件即可在浏览器中打开。
- 架构：gallery.html（组件库总览）、report-tool.html（报告生成工具）、bid-tool.html（标书工具）均为独立静态 HTML，各自双击运行，通过相对路径访问 ui-lib/ 中的组件资源。
- 提示词策略：提示词不嵌入组件代码，只引用组件路径（如 ui-lib/components/kpi-card/template.html），由 Claude Desktop 端自行读取，提示词体积控制在 ~800 字以内。

**How to apply:** 组件库和工具开发时继续使用纯 HTML + CDN 方案，不引入 Python server 或 Node.js 构建步骤。新增工具时按照 gallery.html 模式：独立 HTML 文件 + CDN 引入 Vue/Tailwind + 相对路径引用 ui-lib/ 组件。

---

### 回答你的问题
好的，我来逐一清晰回答这四个确认点的问题，基于专业的判断给出建议，即使是和你的预想有偏差也会明确说明。

让我先重新审视一下 v2 的 SPEC 和对话记录，确保理解准确。
现在我已经全面理解了项目。让我针对你的四个确认点给出专业的回答和建议。

---

## 1. Design Token 的扩展机制与 Tailwind 封装

### Token 的扩展方案

**核心原则：CSS自定义属性（CSS Variables）为主，Tailwind 类名封装为辅。**

推荐的三层结构：

```
design-tokens/
├── tokens.css              # 核心：所有风格的 CSS 变量定义
├── tailwind-mappings.js     # 可选：CSS变量 → Tailwind 类名映射
└── preview.html             # Token 可视化预览页
```

**tokens.css 的设计：**

```css
/* ===== 基础商务蓝白（默认） ===== */
:root {
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
  --color-danger: #ef4444;
  
  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  
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

**扩展新风格只需要加一个 `[data-theme="xxx"]` 块，不需要改任何组件代码。**

### ❌ 不同风格不可以用 Tailwind 类名封装复用

**这是我与你的预想有偏差的地方**。Tailwind 的类名是静态编译的（`text-blue-900`、`bg-blue-50`），而风格切换需要运行时的动态性。如果把颜色写死在 Tailwind 类名里：

- 切换风格时需要修改所有 DOM 元素的类名，性能差且容易漏
- 新增一种风格需要修改每个组件的 HTML 代码

**用 CSS 变量的优势：**
- `background: var(--color-bg-card)` → 换风格只需要改 CSS 变量值
- 组件代码不需要知道当前是哪种风格
- 运行时切换 `<html data-theme="dark-tech">` 生效

**Tailwind 的定位应该是什么？**

Tailwind 用来处理**布局、间距、排版**这些与颜色无关的样式：

```html
<!-- ✅ 布局用 Tailwind 类名 -->
<div class="flex flex-col gap-3 p-6 rounded-2xl shadow-lg">

<!-- ✅ 颜色用 CSS 变量 -->
style="background: var(--color-bg-card); color: var(--color-text);"
```

**可以做一个 Tailwind 配方体系（推荐）：**

```javascript
// tailwind-mappings.js — 给常用组合起名字
const STYLE_RECIPES = {
  'card-base': 'rounded-lg shadow-[var(--shadow-card)] p-6',
  'card-elevated': 'rounded-xl shadow-[var(--shadow-elevated)] p-8',
  'heading-xl': 'text-3xl font-bold',
  'body-text': 'text-base leading-relaxed',
  'badge': 'text-xs font-semibold px-3 py-1 rounded-full',
};
```

这样 AI 生成 HTML 时可以用这些配方名，而不是每次都重新写一遍。

---

## 2. 版式库的内部结构

### 版式 ≠ 组件，结构应该不同

**组件**是内容积木（KPI卡片、表格），**版式**是容器骨架（A4页面、PPT slide、网页），本质不同。

推荐版式库结构：

```
layouts/a4-landscape/
├── index.html              # 独立可打开的预览页
├── skeleton.html           # ★ 核心：页面骨架模板（AI 填空用）
└── layout.css              # 版式专属CSS（打印样式、页面尺寸、分页逻辑）
```

**版式不需要 Vue 组件（component.js）**。为什么？

| 对比维度 | 组件（components） | 版式（layouts） |
|----------|-------------------|----------------|
| 职责 | 内容展示单元 | 页面容器 + 翻页逻辑 |
| 数据绑定 | 需要 Vue（props/events） | 不需要（纯 HTML 结构） |
| 可交互 | 是 | 否（只是结构骨架） |
| AI 怎么用 | 参照代码结构写类似的 HTML | 在这个骨架里填入具体内容 |
| 文件数 | 3（index + template + component.js） | 3（index + skeleton + layout.css） |

### skeleton.html 的核心作用

这是版式库的灵魂——**给 AI 看的空壳模板**：

```html
<!-- layouts/a4-landscape/skeleton.html -->
<!-- 这是 AI 生成报告的骨架模板，请在此结构内填充内容 -->

<!-- @page { size: A4 landscape; margin: 0; } -->
<section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg relative page-break-after-always">
  <div class="content-area px-[22mm] py-[18mm]">
    <!-- ===== 第 {{N}} 页内容区 ===== -->
    <!-- AI 会在这里填充组件（kpi-card、data-table等） -->
  </div>
  <footer class="absolute bottom-[8mm] right-[22mm] text-sm text-gray-400">
    第 {{page_num}} 页
  </footer>
</section>
```

**三种版式的 skeleton 要点：**

| 版式 | skeleton 关键特征 | 翻页方式 |
|------|------------------|----------|
| A4 横版 | 固定宽高 297mm×210mm，@page A4 landscape | page-break-after（CSS 打印分页） |
| PPT Slide | 100vw×100vh，overflow hidden | JS 控制 slide 显隐，键盘/点击切换 |
| 自由网页 | max-w-[1180px] mx-auto，响应式 | 自然滚动，分 section |

---

## 3. 无服务端时，report-tool.html 怎么调用组件库和 AI 交互

这是我与你预想偏差最大的部分，也是最重要的架构决策。让我展开说清楚。

### 3.1 file:// 协议的现实限制

report-tool.html 双击打开，浏览器地址栏是 `file:///.../report-tool.html`。

当你在这个页面里执行 `fetch('../ui-lib/components/kpi-card/template.html')` 时：

| 浏览器 | file:// 下 fetch 跨目录文件 | 结果 |
|--------|---------------------------|------|
| Safari | 🟢 允许 | 正常工作 |
| Chrome | 🔴 禁止（安全策略） | 报错 CORS |
| Edge | 🔴 禁止 | 报错 CORS |
| Firefox | 🔴 限制更严 | 无法跨目录读取 |

**结论：依赖 fetch 动态读取组件模板，大概率在 Chrome 上行不通，而 Chrome 是企业用户最常用的浏览器。**

### 3.2 多轮对话模式下，不需要动态读取

这是我建议的核心改变。回顾 v2 的痛点（你实际测试发现的）：

> "内容非常多，把提示词给到 AI 后输出文件太大了，卡壳了"

所以 v3 的正确方向不是**更大的提示词**，而是**分步多轮**：

```
第一轮：搭骨架 — 仅版式 + 风格 + 主题
用户输入：
  报告主题：货币基金月度估值分析
  版式：A4 横版分页  
  风格：商务蓝白
  大致内容：封面 + 三大指标总览 + 收益率对比 + 风险提示 + 结论

工具生成的提示词（~500字，不会卡壳）：
  【版式约束】请参照 layouts/a4-landscape/skeleton.html 的页面结构
  【风格约束】请使用 styles/business-blue/tokens.css 的颜色方案
  【生成要求】用占位数据生成 5 页 A4 横版报告骨架，每页标记 [待填充]

⬇ Claude 生成 v001.html（空壳报告）
⬇ 用户：好的，骨架效果可以。现在开始填第1页，放 KPI 卡片和指标表


第二轮：填第1页
工具生成的提示词（~300字）：
  基于 reports/货币基金月度_v001.html 的第1页，
  参考 components/kpi-card/template.html 的代码风格，
  填入以下真实数据：...

⬇ Claude 基于 v001 修改 → 保存 v002
⬇ 用户通过预览页查看，发现第2页需要调整


第三轮：填第2页  
  同样模式，每次提示词控制在 ~300-500 字
```

### 3.3 report-tool.html 需要什么？

**不需要动态读取组件文件**。它只需要内置一个轻量的组件注册表：

```javascript
// report-tool.html 内置（硬编码，约 1-2KB）
const COMPONENT_CATALOG = [
  {
    id: 'kpi-card',
    name: 'KPI 数字卡片',
    category: '数据展示',
    icon: '📊',
    description: '展示核心指标数值（收益率、规模等），带趋势标签',
    // AI 参考路径（给到提示词里，不是自己读）
    refPath: '../ui-lib/components/kpi-card/template.html',
    // 适用的数据场景
    dataHint: '需要：数值、单位、变化百分比'
  },
  {
    id: 'data-table',
    name: '数据表格',
    category: '数据展示',
    icon: '📋',
    description: '简洁标准表格，蓝白风格，适合 CSV 数据直接呈现',
    refPath: '../ui-lib/components/data-table/template.html',
    dataHint: '需要：CSV数据或表格行列数据'
  },
  // ... 其他 20 个组件
];
```

### 3.4 提示词怎么引用组件？

**不嵌入代码，只引用路径。** 提示词里写：

```
【组件使用说明】
本次报告需要使用以下组件：
- KPI 数字卡片：请参照 ui-lib/components/kpi-card/template.html 的 HTML 结构和 Tailwind 类名
- 数据表格：请参照 ui-lib/components/data-table/template.html 的 HTML 结构
每个组件的 data-cid 属性必须保留，CSS 变量名（如 var(--color-primary)）不要改动
```

**为什么 AI 能看到这些文件？**
- Claude Desktop 有工作目录的概念，可以直接读取本地文件
- 用户也可以在 Claude Desktop 里把 template.html 拖进去作为附件

### 3.5 仍然需要一个超轻量服务吗？

**不需要。** gallery.html 和 report-tool.html 都作为纯静态 HTML 运行：

| 页面 | 怎么运行 | 需要服务吗 |
|------|---------|-----------|
| gallery.html（组件总览） | 双击打开，iframe 加载子组件预览 | ✅ 不需要。iframe 加载相对路径 file:// 无限制 |
| report-tool.html（生成提示词） | 双击打开，纯表单 + 文本拼接 | ✅ 不需要。没有 fetch 调用 |
| 组件独立 index.html（如 kpi-card） | 双击打开，自包含 HTML | ✅ 不需要 |

---

## 4. 总览画廊页布局

### 推荐：左右两栏布局

这与你的预想一致，具体设计：

```
┌──────────────────┬──────────────────────────────────────────────────┐
│  左侧菜单栏       │                 右侧内容预览区                     │
│  (w-64 固定240px) │                                                  │
│                  │  ┌─────────────────────────────────────────────┐ │
│  📐 设计规范      │  │  KPI 数字卡片                  [商务蓝白 ▾] │ │
│    · 色彩系统     │  │  ─────────────────────────────────────────  │ │
│    · 字体排版     │  │                                             │ │
│    · 间距圆角     │  │  ┌───────────────────────────────────────┐ │ │
│                  │  │  │                                       │ │ │
│  🧩 基础组件      │  │  │    实时预览区（看到的 = 实际效果）       │ │ │
│    · KPI卡片 ◀   │  │  │    ┌───────────────────────────┐      │ │ │
│    · 信息卡片     │  │  │    │ 环比 +12.5%               │      │ │ │
│    · 数据表格     │  │  │    │    3.28%                  │      │ │ │
│    · 流程步骤     │  │  │    │ 七日年化收益率              │      │ │ │
│    · 对比卡片     │  │  │    └───────────────────────────┘      │ │ │
│    · 团队网格     │  │  │                                       │ │ │
│    · 亮点引用     │  │  │  风格切换后自动变色                     │ │ │
│    · 大数字行     │  │  └───────────────────────────────────────┘ │ │
│    · 时间轴       │  │                                             │ │
│                  │  │  ┌─ 代码示例 ──────────────────────────────┐ │ │
│  📊 图表组件      │  │  │ <div data-cid="kpi-card"               │ │ │
│    · 柱状图       │  │  │   class="bg-[var(--color-bg-card)]     │ │ │
│    · 折线图       │  │  │   rounded-[var(--radius-lg)] ..."      │ │ │
│    · 饼图         │  │  │   ...                                  │ │ │
│    · 仪表盘       │  │  └────────────────────────────────────────┘ │ │
│                  │  │                                             │ │
│  📄 版式模板      │  │  [复制 HTML] [复制 Vue 组件] [全屏预览]     │ │
│    · A4横版       │  └─────────────────────────────────────────────┘ │
│    · PPT翻页      │                                                  │
│    · 自由滚动     │                                                  │
│                  │                                                  │
│  🎨 主题风格      │                                                  │
│    · 商务蓝白     │                                                  │
│    · 暗黑科技     │                                                  │
│    · 清新简约     │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘
```

### 交互设计要点

**1. 左侧菜单交互：**
- 一级菜单（设计规范/基础组件/图表/版式/风格）可折叠，默认全部展开
- 点击二级项（如 KPI卡片）→ 右侧内容区切换到对应组件的实时预览
- 当前选中的二级项高亮显示（深蓝背景）

**2. 右侧内容——风格切换按钮：**
- 位置：右上角固定
- 默认显示：商务蓝白风格
- 点击下拉菜单选择风格 → 立即切换，预览区组件实时变色
- **所有组件共享同一个风格选择器**，不需要一个一个组件单独切换

**3. 风格切换原理（CSS 变量优势）：**

```html
<!-- gallery.html -->
<html data-theme="business-blue">
  ...
  <div style="background: var(--color-bg-card); color: var(--color-text)">
    预览内容
  </div>
</html>
```

```javascript
// 切换风格函数
function switchTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
  // 所有使用了 var(--color-xxx) 的元素自动变色
  // 不需要重新渲染任何组件！
}
```

**4. 右侧内容区——三种展示模式（建议按 Tab 切换）：**

- Tab 1：**实时预览** — 默认激活，真实渲染组件（带示例数据）
- Tab 2：**HTML 代码** — 完整的 HTML 源代码，带语法高亮
- Tab 3：**Vue 用法** — Vue 组件的 props 说明 + 代码示例

---

## 整体架构总览

```
report_system/
├── ui-lib/                             # 组件库（独立，各工具共享）
│   ├── gallery.html                    # 总览页（左右两栏布局）
│   ├── design-tokens/
│   │   ├── tokens.css                  # CSS 变量定义 + 3套风格主题
│   │   └── preview.html               # Token 可视化展示
│   │
│   ├── components/                     # 基础组件
│   │   ├── kpi-card/
│   │   │   ├── index.html             # 独立可打开：预览 + 代码 + 参数说明
│   │   │   ├── template.html          # 纯 HTML 片段（AI 参考）
│   │   │   └── component.js           # Vue 3 组件定义
│   │   ├── info-card/
│   │   ├── data-table/
│   │   ├── timeline/
│   │   └── ...（第一批 12-15 个组件）
│   │
│   ├── charts/                         # 图表组件
│   │   ├── bar-chart/
│   │   ├── line-chart/
│   │   └── pie-chart/
│   │
│   ├── layouts/                        # 版式模板
│   │   ├── a4-landscape/
│   │   │   ├── index.html             # 独立可打开预览
│   │   │   ├── skeleton.html          # ★ 骨架模板
│   │   │   └── layout.css             # 打印样式 + 页面尺寸
│   │   ├── ppt-slide/
│   │   └── web-scroll/
│   │
│   └── styles/                         # 主题风格
│       ├── business-blue/
│       ├── dark-tech/
│       └── fresh-clean/
│
├── report-tool/                        # 工具1：报告生成
│   └── report-tool.html               # 双击运行，纯静态
│
├── bid-tool/                           # 工具2：标书撰写（后续）
│   └── bid-tool.html
│
├── bi-system/                          # 工具3：轻量BI（后续）
│   └── bi-dashboard.html
│
├── system_v1/                          # 保留
└── system_v2/                          # 保留
```

---

## 总结：4个确认点的关键决策

| 确认点 | 决策 | 与你的预想是否一致 |
|--------|------|-------------------|
| 1. Token 扩展 | CSS 变量为主，Tailwind 用于布局，**不**用 Tailwind 封装风格 | ❌ 有偏差 — Tailwind 不适合做动态换肤 |
| 2. 版式库结构 | 和组件库相似但有区别：3个文件，不需要 Vue 组件，重点是 skeleton | ⚠️ 部分一致 — 结构相似但内容不同 |
| 3. 无服务调用 | **零服务端**，多轮渐进提示词，组件注册表内置在工具中，提示词引用路径不嵌入代码 | ❌ 有偏差 — 建议完全去掉服务 |
| 4. 画廊布局 | 左右两栏，左菜单右预览，右上角风格切换按钮 | ✅ 完全一致 |

需要继续深入讨论第三点（多轮对话的具体提示词格式），还是可以开始搭建 Phase 1 的代码了？

SPEC.md 已生成到 `system_v3/SPEC.md`。下面是文档结构概览，方便你快速定位：

| 章节 | 内容 |
|------|------|
| 一、产品定位 | ui-lib 与工具分离，组件库是共享基础设施 |
| 二、技术约束 | 纯静态、零服务端、全部CDN、CSS变量做颜色、Tailwind做布局 |
| 三、项目文件结构 | 完整目录树，ui-lib / report-tool / bid-tool / bi-system 并列 |
| 四、Design Token 体系 | tokens.css 完整定义、扩展方式、风格切换原理、Tailwind角色边界 |
| 五、组件规范 | 3文件结构（index.html / template.html / component.js）、每个文件的规范、12个组件清单 |
| 六、图表组件规范 | ECharts封装规范、统一数据接口、首批3个图表 |
| 七、版式规范 | 与组件的结构差异、skeleton.html 规范、三种版式对比 |
| 八、风格预览 | 每种风格独立预览页 |
| 九、总览画廊页 | 左右两栏布局详图、交互设计、Vue实现方式 |
| 十、报告生成工具 | 多轮渐进工作流、提示词模板、组件注册表、页面结构 |
| 十一、Token预览页 | 色彩/字体/间距/圆角可视化展示 |
| 十二、工具调用方式 | 三种方式：AI引用路径 / iframe嵌入 / Vue组件引用 |
| 十三、实施计划 | 4个Phase，Phase 1先做2个组件打通流程 |
| 十四、与v2区别 | 10个维度的对比表 |
| 十五、后续扩展 | 组件/风格/版式/工具扩展预留 |

你看看有没有需要调整的地方，确认后我们按 Phase 1 开始写代码。

这是个关键的产品设计问题。我先说结论，再展开具体流程。

---

## 核心判断：表单勾选 + 实时预览，不是纯自然语言

原因很简单：业务同事不知道组件叫 "kpi-card" 还是 "big-number-row"，也不知道 "A4横版分页" 和 "PPT Slide翻页" 实际长什么样。纯自然语言描述的前提是用户已经熟悉组件库，而你们的用户**第一次打开工具时对组件库一无所知**。

但和 v2 不同——v3 的组件库每个组件都有独立的 `index.html`，可以 iframe 嵌入真实渲染，用户勾选前看到的不再是 CSS 骨架，而是**实际效果**。

---

## 用户完整操作流程（以生成一份货币基金月度报告为例）

### 前置步骤：花 3 分钟逛组件库

用户打开 `gallery.html` → 左侧菜单浏览 → 看到 kpi-card 长什么样、data-table 长什么样、A4 版式骨架长什么样 → 心里有数了 → 打开 `report-tool.html` 开始干活。

> gallery.html 的定位类似 Ant Design 官网——写代码之前先去逛逛看有哪些现成的东西。

---

### 第一轮：生成报告骨架

```
┌─────────────────────────────────────────────────────┐
│  Step 1 — 报告基本信息                               │
│                                                     │
│  报告文件名：[货币基金月度估值分析___________]          │
│  报告主题：  [面向管理人的货币基金月度收益归因___]       │
│  受众：      ○ 高管汇报  ● 客户展示  ○ 内部培训       │
│  用途：      ○ 汇报展示  ● 交付文档  ○ 培训材料       │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 2 — 版式                                      │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ [A4横版预览]  │ │ [PPT翻页预览] │ │ [自由滚动预览] │ │
│  │   iframe嵌入  │ │   iframe嵌入 │ │   iframe嵌入  │ │
│  │   skeleton    │ │   skeleton   │ │   skeleton    │ │
│  │   的缩略效果   │ │   的缩略效果  │ │   的缩略效果   │ │
│  │              │ │              │ │              │ │
│  │ ○ A4 横版分页 │ │ ● PPT Slide  │ │ ○ 自由滚动网页 │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
│  点击卡片选中（蓝色边框高亮）      [去版式库看完整效果→] │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 3 — 风格                                      │
│                                                     │
│  ● 商务蓝白  ○ 暗黑科技  ○ 清新简约                   │
│  ┌──────────────────────────────────────────────┐   │
│  │  该风格下组件实际渲染效果（实时预览）            │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │ KPI卡片  │ │ 信息卡片 │ │ 数据表格 │   ...   │   │
│  │  │ (真实色)  │ │ (真实色) │ │ (真实色)  │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘        │   │
│  └──────────────────────────────────────────────┘   │
│  风格切换时下方预览区即时变色                           │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 4 — 内容大纲                                   │
│                                                     │
│  本次报告大致包含以下内容（口语化描述即可）：            │
│  ┌─────────────────────────────────────────────┐    │
│  │ 第1页：封面（标题、团队、日期）                 │    │
│  │ 第2页：三大核心指标概览（收益率、规模、风险）     │    │
│  │ 第3页：收益率走势对比分析                       │    │
│  │ 第4页：持仓结构分析（按资产类别）                │    │
│  │ 第5页：风险指标与总结                          │    │
│  └─────────────────────────────────────────────┘    │
│  [+ 添加一页]                                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成骨架提示词并复制                       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

用户点击「生成骨架提示词」→ 提示词 ~500字，内容大致：

```
你是金融报告HTML生成专家。

【版式约束】请参照 ../ui-lib/layouts/ppt-slide/skeleton.html 的页面结构，
使用 100vw×100vh 容器、JS翻页逻辑。

【风格约束】请使用 ../ui-lib/design-tokens/tokens.css 中 business-blue 的CSS变量。
所有颜色使用 var(--color-xxx)，不要替换为具体色值。

【内容结构】
- 第1页：封面
- 第2页：三大核心指标概览
- 第3页：收益率走势对比分析
- 第4页：持仓结构分析
- 第5页：风险指标与总结

【要求】
1. 用占位数据生成5页PPT骨架，每页标记 [待填充-第X页]
2. 给每页容器添加 data-page="X" 属性
3. 保存到 reports/货币基金月度估值分析_v001.html
4. 只输出完整HTML，不要解释
```

用户复制 → 粘贴到 Claude Desktop → AI 生成 v001.html（一个只有骨架的 PPT，每页有标题和占位标记，但没有真实数据和组件）。

用户双击 v001.html 看一眼：「骨架没问题，PPT 翻页正常，颜色对。开始填内容。」

---

### 第二轮起：逐页填充内容

用户回到 report-tool.html，进入「内容填充」Tab：

```
┌─────────────────────────────────────────────────────┐
│  内容填充 — 第 2 轮                                  │
│  当前报告：货币基金月度估值分析（v001 → v002）          │
│                                                     │
│  选择要填充的页面：[第2页 ▾]  ← 下拉选择               │
│                                                     │
│  ───────────────────────────────────────────────     │
│  本页内容概要（自然语言描述）：                         │
│  ┌─────────────────────────────────────────────┐    │
│  │ 展示三只货币基金的七日年化收益率、万份收益、      │    │
│  │ 近一月回报率三个核心指标，每只基金一个卡片，     │    │
│  │ 顶部再加一个汇总对比表                        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ───────────────────────────────────────────────     │
│  选择本页使用的组件（多选，可重复选同一组件多次）：       │
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │            │ │            │ │            │      │
│  │   iframe   │ │   iframe   │ │   iframe   │      │
│  │   kpi-card │ │  data-table│ │ compare-card│      │
│  │   真实渲染  │ │   真实渲染  │ │   真实渲染   │      │
│  │            │ │            │ │            │      │
│  │ ☑ KPI卡片  │ │ ☑ 数据表格  │ │ ☐ 对比卡片  │      │
│  │   选3个    │ │   选1个    │ │            │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│  ┌────────────┐ ┌────────────┐                     │
│  │ info-card  │ │ big-number │  ...                │
│  │ ☐ 信息卡片  │ │ ☐ 大数字行  │                     │
│  └────────────┘ └────────────┘                     │
│  每个组件通过 iframe 嵌入其 index.html，              │
│  看到的是真实渲染效果（不是骨架），风格已匹配            │
│                                                     │
│  ───────────────────────────────────────────────     │
│  本页数据来源：                                       │
│  ○ 跟随全局数据  ● 本页独立指定                       │
│  [上传CSV: returns_may.csv]  已解析：3行×5列           │
│  ┌─────────────────────────────────────────┐        │
│  │ 基金名称 │ 七日年化 │ 万份收益 │ 近一月回报 │       │
│  │ 天弘     │ 2.15%   │ 0.5892  │ 0.18%    │       │
│  │ 南方     │ 2.08%   │ 0.5701  │ 0.16%    │       │
│  │ 华夏     │ 2.21%   │ 0.6013  │ 0.19%    │       │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成第2页填充提示词并复制                   │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

生成的提示词 ~400字：

```
请基于 reports/货币基金月度估值分析_v001.html 继续修改。

【当前任务】填充第2页（data-page="2"）。

【组件参考】
- KPI数字卡片：请参照 ../ui-lib/components/kpi-card/template.html
- 数据表格：请参照 ../ui-lib/components/data-table/template.html
严格参照其 data-cid、CSS变量风格、Tailwind布局类名。

【内容要求】
展示三只货币基金的七日年化收益率、万份收益、近一月回报率三个核心指标。
每只基金一个KPI卡片，顶部加一个汇总对比表。

【数据】
CSV: returns_may.csv（3只基金×4项指标）

【要求】
1. 保持第1页及其他页面内容不变，只修改 data-page="2" 的内容
2. 从CSV读取真实数据填入组件
3. 保存为 reports/货币基金月度估值分析_v002.html
4. 只输出完整HTML，不要解释
```

用户复制 → Claude 生成 v002 → 用户双击预览 → 第2页填好了 → 继续第3页。

---

### 逐页填充直到完成

第3页（收益率走势对比）→ 选 line-chart + info-card → 生成提示词 → v003
第4页（持仓结构分析）→ 选 pie-chart + data-table → 生成提示词 → v004
第5页（风险指标与总结）→ 选 big-number-row + highlight-quote → 生成提示词 → v005

每轮提示词都只有 300-500 字，AI 不会卡壳。

---

### 精细修改阶段

用户发现第3页饼图的颜色和整体风格不太搭，或者文字措辞不够正式。回到工具的「精细修改」Tab：

```
┌─────────────────────────────────────────────────────┐
│  精细修改                                            │
│  当前版本：货币基金月度估值分析_v005.html              │
│                                                     │
│  修改意见（自然语言）：                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ 1. 第3页饼图的配色改成商务蓝白风格一致的蓝色系    │    │
│  │ 2. 第5页"风险可控"改成"风险指标处于合理区间"    │    │
│  │ 3. 封面加一句slogan："专业估值，守护资产价值"   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成修改提示词并复制                       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

AI 基于 v005 做定点修改 → v006 → 完成。

---

## 关键设计要点总结

| 用户动作 | 界面形式 | 预览方式 |
|----------|---------|---------|
| 选版式 | 3张卡片单选，每张卡片嵌入版式 skeleton.html 的缩略 iframe | 看到真实骨架效果 |
| 选风格 | 3个选项 + 下方组件实时变色预览区 | 切换风格后预览区即时变色 |
| 写内容大纲 | textarea，自然语言，口语化即可 | 无预览（此阶段还没内容） |
| 选组件 | 多选卡片，每张卡片 iframe 嵌入组件的 index.html | **看到真实渲染效果**，且已匹配当前风格 |
| 上传数据 | CSV 拖拽/选择，自动解析预览前5行 | 表格预览 |
| 修改意见 | textarea，自然语言描述 | 无预览 |

**和 v2 的核心区别**：v2 的组件选择是 CSS 骨架缩略图（灰白 placeholder），v3 是 iframe 嵌入的**真实渲染**。用户选 kpi-card 时看到的就是将来报告里 KPI 卡片的样子，且切换风格后预览区自动变色——没有 "选了暗黑科技但缩略图还是蓝色" 的割裂感。

---

## 一个坦诚的提醒

这套流程里有一个**不可省略的用户行为**：在 Claude Desktop 和 report-tool.html 之间来回切换。v2 是这个模式，v3 也是。

完全消除这个切换的唯一方案是**把 AI 调用嵌入工具本身**（调 Claude API，流式返回），但这意味着：
- 需要后端服务（API Key 不能暴露在前端）
- 需要网络
- 需要付费（API 按 token 计费）

SPARC 方案里写的 "后续扩展预留：AI 直接对话集成" 就是这个方向。当前阶段保留复制粘贴模式是务实的——先用最小成本跑通流程，验证多轮渐进方案确实比一次性大提示词好，再决定是否做内嵌 AI。

---

需要我把这个操作流程也补充到 SPEC.md 里吗？还是现有 SPEC 已经够清晰，可以直接开始 Phase 1 的代码了？

问得很细，逐个说清楚。

---

## 一、report-tool.html 里的组件预览是哪来的？

**不是重新写的。** 就是直接复用了 ui-lib 里组件的 `index.html` 和 `template.html`。

工具和组件库的物理关系：

```
report_system/
├── ui-lib/
│   └── components/kpi-card/
│       ├── index.html          ← 组件的完整预览页
│       └── template.html       ← 组件的纯 HTML 片段
│
└── report-tool/
    └── report-tool.html        ← 工具页面
```

report-tool.html 引用组件有两种方式，按场景分：

### 场景A：组件选择卡片里的缩略预览（用 v-html 内联 template.html）

```html
<!-- report-tool.html 内部 -->
<link rel="stylesheet" href="../ui-lib/design-tokens/tokens.css">

<div id="app">
  <!-- 组件选择卡片：内联渲染 template.html 片段 -->
  <div class="component-card" 
       v-for="comp in components" 
       @click="toggleComponent(comp.id)"
       :class="{ selected: isSelected(comp.id) }">
    
    <!-- ★ 关键：v-html 直接渲染组件的 template.html -->
    <div class="preview-area" v-html="comp.templateContent"></div>
    
    <div class="card-footer">
      <input type="checkbox" :checked="isSelected(comp.id)">
      <span>{{ comp.name }}</span>
      <span class="count" v-if="getCount(comp.id) > 1">×{{ getCount(comp.id) }}</span>
    </div>
  </div>
</div>
```

```javascript
// report-tool.html 内置的组件注册表
const COMPONENT_CATALOG = [
  {
    id: 'kpi-card',
    name: 'KPI 数字卡片',
    category: '数据展示',
    description: '展示核心指标数值，带趋势标签',
    refPath: '../ui-lib/components/kpi-card/template.html',
    // ★ 工具首次加载时通过 fetch 读一次 template.html，缓存内容
    // 注意：这里用 fetch 是因为 report-tool.html 和 ui-lib 在同一目录树下
    // 如果 file:// 下有兼容问题，可以直接把 template 内容硬编码为字符串常量
    templateContent: ''
  },
  // ...
];

// 初始化：预加载所有组件的 template 内容
async function loadTemplates() {
  for (const comp of COMPONENT_CATALOG) {
    try {
      const resp = await fetch(comp.refPath);
      comp.templateContent = await resp.text();
    } catch (e) {
      // file:// 下 fetch 失败，回退到硬编码的 fallback
      comp.templateContent = comp.fallbackHTML;
    }
  }
}
```

**为什么用 v-html 内联而不是 iframe？**

| 方式 | 风格切换响应 | 性能 | 脚本执行 | 适用 |
|------|------------|------|---------|------|
| v-html 内联 | ✅ 即时变色（同一个 document，共享 `data-theme`） | 快 | ❌ 不执行 `<script>` | 基础组件（无 JS） |
| iframe 嵌入 | ❌ 需要传参或 postMessage 才能同步主题 | 中等 | ✅ 可执行脚本 | 图表组件（有 ECharts JS） |

基础组件（kpi-card、info-card、data-table 等）的 template.html 只有 HTML + CSS 变量引用，没有任何 JS。所以用 v-html 内联是最佳方案——用户切换风格时，预览区的组件**瞬间全部变色**，零延迟。

图表组件（bar-chart 等）的 template.html 包含 ECharts 初始化脚本，v-html 不执行脚本。处理方式：

```
┌──────────────┐
│              │
│  [静态缩略图] │  ← 图表组件的预览卡片用一张静态截图代替
│              │     不是实时渲染，但能看到样子
│  柱状图       │
│              │
│  [查看完整效果] │  ← 点击跳转 → 在新标签页打开图表的 index.html
└──────────────┘
```

### 场景B：版式选择卡片里的预览（用 iframe 嵌入 skeleton.html）

版式 skeleton 需要展示页面骨架（A4纸的轮廓、翻页按钮等），适合用 iframe：

```html
<iframe src="../ui-lib/layouts/a4-landscape/index.html" 
        class="border rounded overflow-hidden"
        style="width:100%;height:200px;pointer-events:none;">
</iframe>
```

`pointer-events:none` 让 iframe 纯粹展示，不响应点击——防止用户点到 iframe 里的翻页按钮导致混乱。

---

## 二、file:// 下 fetch 的兼容处理

前一版讨论过：Chrome 禁 file:// 下的跨目录 fetch。所以组件模板内容的获取有两种策略：

**策略A（推荐）：硬编码 fallback + fetch 增强**

```javascript
const COMPONENT_CATALOG = [
  {
    id: 'kpi-card',
    name: 'KPI 数字卡片',
    // 每个组件的 template.html 内容直接作为字符串常量嵌入
    // 12 个组件 × 平均 15 行 HTML ≈ 总共 ~10KB，完全可接受
    fallbackHTML: `
      <div data-cid="kpi-card" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6 flex flex-col gap-3">
        <span class="text-xs font-semibold px-3 py-1 rounded-full w-fit" style="color:var(--color-primary);background:var(--color-primary-light)">环比 +12.5%</span>
        <div class="text-5xl font-bold" style="color:var(--color-primary)">3.28<span class="text-lg font-normal" style="color:var(--color-text-muted)">%</span></div>
        <p class="text-sm" style="color:var(--color-text-muted)">七日年化收益率</p>
      </div>`,
    refPath: '../ui-lib/components/kpi-card/template.html',
  },
  // ... 其他组件
];

// 优先用 fetch（Safari可用），失败则用 fallback（Chrome）
async function initCatalog() {
  for (const comp of COMPONENT_CATALOG) {
    try {
      const resp = await fetch(comp.refPath);
      if (resp.ok) {
        comp.templateContent = await resp.text();
        continue;
      }
    } catch (e) { /* fallback */ }
    comp.templateContent = comp.fallbackHTML;
  }
}
```

这意味着：每个组件的 template.html **有两份**——一份在 `ui-lib/components/xxx/template.html`（给 AI 读），一份在 `report-tool.html` 的 `fallbackHTML` 字段（给工具预览用）。开发时保持两者同步。

**为什么不直接硬编码不要 fetch？** 因为 fallback 只能保证工具的预览工作。提示词里引用路径让 AI 读 template.html 的功能不受影响——那个不经过 fetch，是 Claude Desktop 自己读文件。

**策略B：保留 fetch，仅支持 Safari 和 HTTP 服务**

如果团队统一用 Safari，或者后期加回极简 server，fetch 就能正常工作。代码更干净，不需要维护两份 HTML。

**建议：先用策略A（硬编码fallback），让 Chrome 用户也能用。组件数量稳定后（12个左右），维护两份内容的成本很低。如果后期团队统一用 Safari 或加了 HTTP 服务，去掉 fallback 即可。**

---

## 三、用户配置能保存吗？可以保留成个人配置吗？

**可以，而且是 v3 的一个重要功能。** v2 的 PROGRESS.md 里把 "配置快照自动保存" 列为待改进项，v3 直接把它做进设计。

### 保存方案

因为 report-tool.html 是纯静态文件（无服务端），保存配置 = **浏览器触发 JSON 文件下载**。

```
用户在工具里：
  选版式：PPT Slide
  选风格：商务蓝白
  内容结构：
    第1节：封面（kpi-card ×1, info-card ×1）
    第2节：核心指标（kpi-card ×3, data-table ×1）
    第3节：收益分析（line-chart ×1, compare-card ×1）
    第4节：总结（highlight-quote ×1, big-number-row ×1）
  数据源：returns_may.csv

→ 点击「💾 保存当前配置」
→ 浏览器弹出下载 → 用户保存到电脑任意位置
→ 文件名：货币基金报告模板_2026-05-20.json
```

### 配置的 JSON 格式

```json
{
  "name": "货币基金月度报告模板",
  "version": "1.0",
  "createdAt": "2026-05-20T14:30:00+08:00",
  "updatedAt": "2026-05-20T14:30:00+08:00",
  
  "report": {
    "fileName": "货币基金月度估值分析",
    "topic": "面向管理人的货币基金月度收益归因分析",
    "audience": "client",
    "purpose": "deliverable"
  },
  
  "layout": {
    "id": "ppt-slide",
    "name": "PPT Slide 翻页"
  },
  
  "style": {
    "id": "business-blue",
    "name": "商务蓝白"
  },
  
  "pages": [
    {
      "index": 1,
      "type": "section",
      "name": "封面",
      "outline": "报告标题、团队信息和日期",
      "components": [
        { "id": "info-card", "count": 1 }
      ]
    },
    {
      "index": 2,
      "type": "section",
      "name": "核心指标概览",
      "outline": "展示三只基金的七日年化、万份收益、近一月回报",
      "slideHint": "2-3页",
      "components": [
        { "id": "kpi-card", "count": 3 },
        { "id": "data-table", "count": 1 }
      ]
    },
    {
      "index": 3,
      "type": "section",
      "name": "收益走势分析",
      "outline": "近三年收益率走势对比及归因分析",
      "slideHint": "3-5页",
      "components": [
        { "id": "line-chart", "count": 1 },
        { "id": "compare-card", "count": 1 }
      ]
    },
    {
      "index": 4,
      "type": "section",
      "name": "总结与展望",
      "outline": "核心结论和风险提示",
      "slideHint": "1-2页",
      "components": [
        { "id": "highlight-quote", "count": 1 },
        { "id": "big-number-row", "count": 1 }
      ]
    }
  ],
  
  "dataSources": {
    "global": {
      "type": "csv",
      "fileName": "returns_may.csv"
    }
  }
}
```

### 加载已保存的配置

```
用户下次打开 report-tool.html：
  → 点击「📂 加载已有配置」
  → 浏览器弹出文件选择器
  → 用户选择之前保存的 "货币基金报告模板_2026-05-20.json"
  → 表单瞬间恢复：
      ✓ 版式自动选中 PPT Slide
      ✓ 风格自动选中 商务蓝白
      ✓ 4节内容结构全部恢复
      ✓ 组件勾选全部恢复
  → 用户只需微调内容大纲 → 生成提示词 → 开干
```

```javascript
// 加载配置的核心逻辑（极简）
function loadConfig(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const config = JSON.parse(e.target.result);
    
    // 恢复表单状态
    state.reportFileName = config.report.fileName;
    state.reportTopic = config.report.topic;
    state.audience = config.report.audience;
    state.selectedLayoutId = config.layout.id;
    state.selectedStyleId = config.style.id;
    state.pages = config.pages;
    state.dataSources = config.dataSources;
    
    // 版式选中 → 高亮对应卡片
    // 风格选中 → 预览区变色
    // 组件勾选 → checkbox 全部勾上
    // 一切恢复如初
  };
  reader.readAsText(file);
}

// 触发文件选择
document.getElementById('loadConfigBtn').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => loadConfig(e.target.files[0]);
  input.click();
});
```

### 配置的实际价值

| 场景 | 用法 |
|------|------|
| 重复报告 | 每月做一次货币基金报告，加载上个月的配置，改数据 → 直接生成 |
| 团队共享 | 小王做了一套 "估值方法论培训" 的配置，导出 JSON 发给小李，小李加载即用 |
| 模板沉淀 | 团队常用的 5-6 种报告类型，各自形成配置模板，新同事上手第一天就能用 |
| 版本对比 | 配置存 JSON，可放 Git 里追踪变化。团队讨论："这版封面用 info-card，上版用 kpi-card，哪个好？" |

---

## 四、完整数据流串联

```
第一次使用：
  用户逛 gallery.html → 了解有哪些组件/版式/风格
    ↓
  打开 report-tool.html
    ↓
  填写表单（版式/风格/组件/内容大纲）
    ├─ 组件预览卡片：v-html 内联 template.html，共享 data-theme，即时变色
    ├─ 版式预览卡片：iframe 嵌入 skeleton.html
    └─ 风格切换：修改 <html data-theme="xxx">，所有预览即时响应
    ↓
  [💾 保存配置] → 下载 JSON → 存电脑上
    ↓
  生成提示词 → 复制 → Claude Desktop → 生成报告
    ↓
  逐页填充 → 重复生成 → 完成

第二次使用（做同类报告）：
  打开 report-tool.html
    ↓
  [📂 加载配置] → 选择上次的 JSON
    ↓
  微调内容大纲和数据
    ↓
  直接生成提示词 → 跳过选版式/风格/组件的全部步骤
    ↓
  5 分钟搞定，而不是从头开始花 20 分钟
```

---

## 五、实现层面的关键决策总结

| 问题 | 方案 |
|------|------|
| 组件预览从哪来 | ui-lib 的 template.html，内联到工具里（v-html），不是重新写 |
| 预览为何不用 iframe | v-html 与父页面共享 CSS 变量，风格切换即时生效；iframe 需要额外传参同步 |
| 图表组件预览怎么办 | 卡片用静态截图；点"全屏预览"打开图表的 index.html（新标签页） |
| file:// 下 fetch 失败怎么办 | 每个组件的 template 有硬编码 fallbackHTML，fetch 失败自动降级 |
| 配置怎么保存 | JSON 格式，浏览器触发下载 |
| 配置怎么加载 | `<input type="file">` 选择 JSON，解析后恢复全部表单状态 |
| 配置能复用吗 | 能。加载→微调→生成，大幅减少重复操作 |
| 配置能让同事用吗 | 能。JSON 文件发过去，对方加载即用 |

需要我把配置保存/加载的逻辑补充到 SPEC.md 里吗？

现在更新 SPEC.md，补充完整的用户操作流程、组件预览机制、file:// 兼容策略和配置保存/加载功能。

现在更新 section 十二 补充 v-html vs iframe 的决策说明，以及修正 section 二的 file:// 描述。

现在修正后续章节编号（因为新增了 section 十一）。

需要修正重复的章节编号。

---

## 📋 会话总结

**结束时间**: 2026/05/20 15:44:06
**总问题数**: 8
**总回答数**: 12

---


## 🤖 Claude 回答

**时间**: 2026/05/20 15:48:13

现在更新 section 十二 补充 v-html vs iframe 的决策说明，以及修正 section 二的 file:// 描述。

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:48:13

现在修正后续章节编号（因为新增了 section 十一）。

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:48:13

需要修正重复的章节编号。

---

## 🤖 Claude 回答

**时间**: 2026/05/20 15:48:13

SPEC.md 已更新完毕。新增和调整的内容总结：

### 新增内容

| 位置 | 内容 |
|------|------|
| **10.2 组件预览机制** | v-html 内联基础组件、静态截图+全屏入口预览图表、iframe 预览版式，三种方式的选型原因 |
| **10.3 file:// 兼容策略** | 硬编码 fallbackHTML + fetch 增强方案，12个组件约10KB，兼容所有浏览器；不影响 AI 端读取文件 |
| **10.4 用户完整操作流程** | 从前置浏览组件库 → 第一轮骨架 → 第二轮逐节填充 → 精细修改，每个步骤的 UI 截图式描述 |
| **10.5 提示词模板** | 骨架/内容填充/精细修改 三种场景的完整模板 |
| **10.6 页面结构总览** | 7个功能区清单 |
| **十一、配置保存与加载** | 完整的保存/加载逻辑、JSON 格式示例、4个使用场景（重复报告/团队共享/模板沉淀/快速切换） |

### 调整的章节编号

| 旧编号 | 新编号 | 标题 |
|--------|--------|------|
| 十一 | 十二 | Design Token 预览页 |
| 十二 | 十三 | 工具如何调用组件库 |
| 十三 | 十四 | 实施计划 |
| 十四 | 十五 | 与 v2 的关键区别 |
| 十五 | 十六 | 后续扩展预留 |

可以开始 Phase 1 写代码了，还是还有其他需要讨论的？

---

## 👤 用户问题

**时间**: 2026/05/20 15:48:13

我们现在这个对话已经快满了吧，我后面把这个对话关了，下次我再开一个新的Claude对话框，还可以继续完整正确的实施我们的计划吗


---


## 🤖 Claude 回答

**时间**: 2026/05/20 15:49:02

你好！有什么我可以帮你的吗？

让我先仔细阅读 v2 版本的 SPEC.md 和相关文件，了解项目的全貌。

让我再看看 v1 版本和已有的 v3 目录，以及 v2 的对话记录了解已知问题。

让我再看看 v2 的对话记录，了解已知问题和用户反馈。

让我再快速了解 v2 对话记录的后续部分，确认已知问题。

我已经完整阅读了 SPEC.md、PROGRESS.md、DEMO_GUIDE.md 以及 conversation.md 全部内容，对项目全貌有了清晰理解。下面给出专业建议和方案。

---

## system_v3 组件库 — 架构方案与建议

### 一、核心判断

v2 的问题根因不是功能缺失，而是**架构边界不清**。组件库（资源库）、报告生成工具、预览编辑器全部耦合在一个 index.html 里，导致：
- 组件只是 JS 对象里的 `htmlSnippet` 字符串，无法独立预览
- 其他工具（标书、BI）完全无法复用
- 改一个组件可能影响整个工具

v3 要做的本质是：**把组件库从工具里剥离出来，升级为独立的基础设施层**。

---

### 二、目录结构设计

```
report_system/
├── ui-lib/                          # ← 组件库（本次第一步要建的）
│   ├── gallery.html                 # 总览浏览页（汇总入口）
│   ├── design-tokens/
│   │   ├── tokens.css               # CSS 自定义属性（所有组件引用这个）
│   │   ├── tailwind.config.js       # Tailwind theme 配置（给用 Tailwind 的项目）
│   │   └── preview.html             # Design Token 可视化预览页
│   ├── components/                  # 基础组件
│   │   ├── kpi-card/
│   │   │   ├── index.html           # ★ 独立可打开：渲染示例 + 代码展示
│   │   │   ├── template.html        # 纯 HTML 片段（AI prompt 参考用）
│   │   │   └── component.js         # Vue 3 组件定义（工具引用用）
│   │   ├── info-card/
│   │   ├── data-table/
│   │   ├── compare-card/
│   │   ├── timeline/                # 新增
│   │   └── ...
│   ├── charts/                      # 图表组件（ECharts 封装）
│   │   ├── bar-chart/
│   │   ├── line-chart/
│   │   ├── pie-chart/
│   │   └── ...
│   ├── layouts/                     # 版式模板
│   │   ├── a4-landscape/
│   │   ├── ppt-slide/
│   │   ├── web-scroll/
│   │   └── bi-dashboard/            # 新：BI 仪表盘版式
│   └── styles/                      # 风格/主题
│       ├── business-blue/
│       ├── dark-tech/
│       ├── fresh-clean/
│       └── ...
│
├── report-tool/                     # 报告生成工具（v3 重构版）
│   ├── index.html
│   ├── start.command
│   ├── server.py
│   ├── js/
│   └── ...                          # 引用 ../ui-lib/ 的组件
│
├── bid-tool/                        # 标书工具（后续）
│   └── ...                          # 同样引用 ../ui-lib/
│
├── bi-system/                       # 轻量 BI 系统（后续）
│   └── ...                          # 同样引用 ../ui-lib/
│
├── system_v1/                       # 保留，不动
└── system_v2/                       # 保留，不动
```

**关键设计决策**：`ui-lib/` 与各工具是**平级目录**，工具通过相对路径 `../ui-lib/components/xxx/` 引用组件。各工具独立启动、独立开发、互不干扰。

---

### 三、技术栈选型

| 层面 | 选型 | 理由 |
|------|------|------|
| **组件定义** | Vue 3 SFC（单文件组件） | v2已验证的方向，团队熟悉；CDN和构建两种用法都支持 |
| **构建工具** | Vite | 组件库需要模块化开发，Vite HMR体验极佳；但输出的 `template.html` 仍是纯HTML，工具侧可继续用CDN |
| **CSS框架** | Tailwind CSS v4 + CSS自定义属性 | Tailwind给AI生成HTML用（AI对Tailwind类名极熟）；CSS变量给Design Token用（框架无关，任何工具都能消费） |
| **图表** | ECharts 5 | 金融场景标配，封装为Vue组件后暴露出简单接口 |
| **组件库文档** | 原生HTML + 少量Vue（gallery.html） | 零依赖可打开，不需要额外文档站 |
| **类型系统** | JSDoc（暂不上TypeScript） | 业务同事也参与维护，降低门槛；后续可逐步加TS |

**重要：保留CDN可用性。** 组件库用Vite开发，但每个组件的 `template.html` 依然是纯Tailwind HTML片段——这意味着：
- AI 提示词里引用的组件代码仍然是纯HTML+Tailwind，AI直接能写
- 不需要构建工具的工具（如report-tool想做CDN-only）完全不受影响
- 需要构建能力的工具（如BI系统）可以 import Vue组件获得交互能力

---

### 四、单个组件的文件规范

以 `kpi-card` 为例，每个组件目录下 **3个文件**：

```
ui-lib/components/kpi-card/
├── index.html          # ★ 核心文件：独立打开 = 组件文档 + 实时预览
├── template.html       # 纯 HTML 片段，给 AI prompt 参考
└── component.js        # Vue 3 组件（给需要编程引用的工具）
```

#### 4.1 `index.html` — 独立预览页（重点设计）

这是你们 "像开源组件库一样" 想法的核心载体。打开后包含：

```
┌──────────────────────────────────────────────────┐
│  ← 返回组件库总览                                 │
│                                                  │
│  KPI 数字卡片                          [商务蓝白] │
│  ─────────────────────────────────────  [暗黑科技] │
│  ┌──────────────────────────────┐    [清新简约]   │
│  │  ↑ 实时渲染示例（可切换风格）  │                │
│  │  ┌──────────────────────┐   │                │
│  │  │ 环比 +12.5%          │   │                │
│  │  │    3.28%             │   │                │
│  │  │ 七日年化收益率        │   │                │
│  │  └──────────────────────┘   │                │
│  └──────────────────────────────┘                │
│                                                  │
│  Props / 数据接口                                │
│  ┌──────────────────────────────────────────────┐│
│  │ label: string    — 标签文本                   ││
│  │ value: number    — 指标数值                   ││
│  │ unit: string     — 单位                       ││
│  │ trend: string    — 趋势标签 (可选)             ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  代码示例                                        │
│  ┌──────────────────────────────────────────────┐│
│  │ <!-- HTML 用法（AI生成/纯静态场景）-->         ││
│  │ <div data-cid="kpi-card" class="bg-white..."> ││
│  │   ...                                         ││
│  │ </div>                                        ││
│  │                                               ││
│  │ <!-- Vue 组件用法（开发工具时）-->              ││
│  │ <KpiCard label="七日年化" :value="3.28" />     ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  [复制 HTML 片段]  [复制 Vue 代码]                │
└──────────────────────────────────────────────────┘
```

设计要点：
- **内联CSS变量切换风格**：页面顶部有风格切换按钮（business-blue / dark-tech / fresh-clean），点击后改变 `<html>` 上的 `data-theme` 属性，所有示例实时变色。不需要重新加载页面。
- **代码展示用 `<pre><code>` + 语法高亮**：简单用 Prism.js CDN 或自己写基础高亮
- **每个 `index.html` 完全自包含**：内联 `<style>` + 必要的 CDN `<script>`（Tailwind CDN、Vue CDN、ECharts CDN），双击即开

#### 4.2 `template.html` — AI 参考片段

```html
<!-- 就是最精简的纯HTML片段，给AI当 few-shot 参考 -->
<div data-cid="kpi-card" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
  <span class="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-3 py-1 rounded-full w-fit">环比 +12.5%</span>
  <div class="text-5xl font-bold" style="color:var(--color-primary)">3.28<span class="text-lg font-normal" style="color:var(--color-text-muted)">%</span></div>
  <p class="text-sm" style="color:var(--color-text-muted)">七日年化收益率</p>
</div>
```

#### 4.3 `component.js` — Vue 组件

```javascript
// 给开发工具时 import 使用
export default {
  name: 'KpiCard',
  props: {
    label: String,
    value: Number,
    unit: { type: String, default: '%' },
    trend: { type: String, default: '' }
  },
  template: `...`  // 或从 template.html 加载
};
```

---

### 五、Design Token 体系

这是整个组件库的**灵魂**。没有统一的Token，跨工具复用就是空谈。

```css
/* ui-lib/design-tokens/tokens.css */

:root {
  /* === 商务蓝白（默认）=== */
  --color-primary: #1e3a8a;
  --color-primary-light: #dbeafe;
  --color-bg: #f8fafc;
  --color-bg-card: #ffffff;
  --color-text: #1f2937;
  --color-text-muted: #64748b;
  --color-accent: #2563eb;
  --color-border: #e5e7eb;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* 阴影 */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 10px 25px rgba(0,0,0,0.08);

  /* 字体 */
  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 28px;
  --text-3xl: 40px;
}

/* 暗黑科技主题 */
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

/* 清新简约主题 */
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

**为什么用CSS自定义属性而不是纯Tailwind类名？**

1. **框架无关**：Vue项目、React项目、纯HTML项目，全都直接 `var(--color-primary)` 就能用
2. **运行时切换**：改一个 `data-theme` 属性，所有组件实时换肤
3. **AI友好**：AI生成的HTML里写 `style="color:var(--color-primary)"` 同样生效
4. **与Tailwind互补**：Tailwind做布局和工具类，Token做品牌色和风格变量

Tailwind v4 的 `@theme` 可以直接映射这些CSS变量，两者不冲突。

---

### 六、总览画廊页（gallery.html）

这是所有组件的**汇总浏览入口**，类似 Ant Design 的组件总览页。

```
┌─────────────────────────────────────────────────────┐
│  UI Library — 估值团队前端组件库                      │
│  ─────────────────────────────────────────────────── │
│  [设计规范] [基础组件] [图表] [版式] [风格]           │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ KPI 卡片  │ │ 信息卡片  │ │ 数据表格  │   ...      │
│  │ [缩略图]  │ │ [缩略图]  │ │ [缩略图]  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 柱状图    │ │ 折线图    │ │ 饼图      │   ...      │
│  │ [缩略图]  │ │ [缩略图]  │ │ [缩略图]  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  技术栈：Vue 3 + Tailwind CSS + ECharts 5            │
│  Design Tokens 规范 → [查看]                         │
└─────────────────────────────────────────────────────┘
```

- 每个组件卡片用 **iframe 嵌入** 对应组件的 `index.html` 缩略区域，所见即所得
- 点击卡片 → 跳转到组件独立的 `index.html`
- 顶部导航分类：基础组件 / 图表 / 版式 / 风格 / 设计规范
- gallery.html 本身可以双击打开，不依赖任何服务

---

### 七、工具如何调用组件库

三种消费方式，按复杂度递增：

#### 方式A：AI提示词引用（最简单，v2模式）

报告工具往AI提示词里注入 `template.html` 片段。通过路径读取：
```javascript
// 工具侧代码
const template = await fetch('../ui-lib/components/kpi-card/template.html')
  .then(r => r.text());
// 拼入prompt
```

#### 方式B：iframe嵌入预览

工具侧用 iframe 嵌入组件的 `index.html`：
```html
<iframe src="../ui-lib/components/kpi-card/index.html"></iframe>
```
这样工具里就能直接展示组件的交互预览，不需要复制代码。

#### 方式C：ES Module导入（BI系统用）

BI系统用Vite构建时，直接 import Vue组件：
```javascript
import KpiCard from '../ui-lib/components/kpi-card/component.js';
```
获得完整的Vue组件能力（响应式数据绑定、事件处理等）。

**三种方式并存，同一个组件目录满足三种场景。**

---

### 八、第一步实施计划（组件库搭建）

按优先级分4个阶段：

#### Phase 1 — 骨架与规范（1-2天）

| 产出 | 说明 |
|------|------|
| `ui-lib/design-tokens/tokens.css` | 3套风格的CSS变量定义 |
| `ui-lib/design-tokens/preview.html` | Token可视化预览（色块、字体阶梯、间距演示） |
| `ui-lib/components/kpi-card/` | 第一个完整组件（3个文件），作为模板范例 |
| `ui-lib/components/info-card/` | 第二个组件，验证模板可复用性 |
| `COMPONENT_SPEC.md` | 组件开发规范文档（文件结构、命名约定、必须包含的元素） |

**先做2个组件打通流程**，确认结构合理再铺量。

#### Phase 2 — 基础组件铺量（2-3天）

迁移v2的8个组件 + 新增实用组件：

| 类别 | 组件 |
|------|------|
| 数据展示 | kpi-card, big-number-row, data-table |
| 内容展示 | info-card, highlight-quote, team-grid |
| 流程展示 | process-step, timeline（新增） |
| 对比分析 | compare-card |
| 装饰/布局 | divider, section-header（新增） |

#### Phase 3 — 图表封装（2-3天）

基于ECharts封装：
- bar-chart, line-chart, pie-chart
- 每个chart暴露统一接口：`{ data, xField, yField, title }`
- `index.html` 里做交互式Demo：可编辑JSON数据实时预览图表变化

#### Phase 4 — 版式 + 总览页（2天）

- 3套版式的独立HTML（a4 / ppt / web）
- 5套风格预览（在现有3套基础上扩充）
- `gallery.html` 总览汇总页
- 各工具对接验证

---

### 九、几个重要的架构建议

**1. 不要急于用Vite把组件库做成npm包。** 第一阶段保持纯HTML+CDN打开方式，降低环境依赖。团队三个工具进度不一，组件库应该是"即开即用"的资源，不是"先build再跑"的依赖。Vite/Vue SFC等构建能力放在component.js里，给有构建环境的工具用，不影响CDN路径。

**2. template.html 是核心资产。** v2的经验证明：AI生成的HTML质量直接取决于你给它的few-shot示例质量。每个组件的template.html必须经过人工审核——确保Tailwind类名规范、data-cid完整、缩进清晰、无障碍性问题。这比Vue组件写得漂不漂亮重要十倍。

**3. Design Token先稳后扩。** 先用3套主题跑通，不要一上来定义20个Token。实践中发现缺什么加什么。Token的命名要偏向语义化（`--color-primary`）而非具体色值（`--color-blue-800`），这样换主题时不用改组件代码。

**4. 分离"组件"和"业务模板"。** ui-lib只放通用组件（按钮、卡片、图表、表格），不要放"货币基金报告模板"之类的业务组合。业务模板放在各自的工具目录里。这条边界不守住，组件库很快变成大杂烩。

**5. gallery.html用iframe嵌入组件预览。** 不要把所有组件代码都加载到gallery页面里（v2的components-gallery问题之一就是几百行代码全摊在一个页面）。iframe隔离加载，每个组件独立渲染，gallery只做导航汇总。

---

### 十、与v2的关键区别

| 维度 | v2 | v3（建议） |
|------|-----|-----------|
| 组件形态 | JS字符串 `htmlSnippet` | 独立HTML文件，可双击打开 |
| 组件预览 | 画廊页里的CSS骨架 | iframe嵌入真实渲染 |
| 跨工具复用 | 不可能（耦合在工具内） | 相对路径引用 `../ui-lib/` |
| 设计规范 | 散落在各组件JS里 | 集中在 `design-tokens/tokens.css` |
| 主题切换 | 不支持运行时切换 | `data-theme` 属性秒切 |
| 图表 | 无（靠AI临时写） | 预封装的ECharts图表 |
| 工具数量 | 1个 | 3个（报告+标书+BI） |

---

总结一句话：**v3的核心不是多做几个组件，而是把组件从工具里解放出来，变成团队共享的基础设施。** 第一步把 ui-lib 目录骨架、2个范例组件、Design Token和 gallery.html 跑通，后面铺组件就是体力活了。

需要我开始搭建 Phase 1 的骨架吗？还是对以上方案有需要调整的地方？

好，逐一回答四个确认点，有些地方我的建议会和你的预想有偏差，我会说清楚原因。

---

## 1. Design Token 的扩展机制与 Tailwind 封装

### Token 怎么扩

建议采用 **CSS 自定义属性 + 语义化命名** 的方案，而不是把 Token 写成 Tailwind 类名。原因很直接：

```
/* 新增一个风格只需要加这一段，其他什么都不用改 */
[data-theme="gov-red-gold"] {
  --color-primary: #8b1a1a;
  --color-primary-light: #fef2f2;
  --color-bg: #fafaf9;
  --color-bg-card: #ffffff;
  --color-text: #292524;
  --color-text-muted: #78716c;
  --color-accent: #ca8a04;
  --color-border: #e7e5e4;
}
```

新增一个 "政务红金" 风格：打开 `tokens.css`，加 10 行 CSS，完事。所有组件、所有图表、所有版式**自动适配新风格**，因为它们的颜色引用的是 `var(--color-primary)` 而不是 `#1e3a8a`。

v2 的问题恰恰就是颜色写死在组件的 Tailwind 类名里（`text-blue-900`、`bg-blue-50`），导致换风格时缩略图还是蓝色。

### Tailwind 类名能否封装复用？

可以，但和你设想的方式可能不同。不是"把风格定义成 Tailwind 类"，而是反过来：

**定义 "样式配方"（Style Recipe）作为可复用常量：**

```javascript
// ui-lib/design-tokens/recipes.js
const RECIPES = {
  'card-base': 'rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-[var(--space-lg)]',
  'card-elevated': 'rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] p-[var(--space-xl)]',
  'heading-lg': 'text-[var(--text-xl)] font-bold font-[var(--font-heading)]',
  'body-text': 'text-[var(--text-base)] font-[var(--font-body)]',
  'badge-primary': 'text-xs font-semibold px-3 py-1 rounded-full w-fit'
};
```

这些配方字符串**本身是 Tailwind 类名组合**，但里面的颜色/间距值引用了 CSS 变量。使用时直接拼：

```html
<div class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
```

AI 生成 HTML 时，prompt 里注入这些配方作为约束："所有卡片使用以下类名组合：`rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6`"。AI 会照做，且因为值是 CSS 变量，换主题自动变色。

**总结：Token 层用 CSS 变量做 "值" 的定义，Tailwind 做 "布局和排版" 的工具层，配方做 "组合复用" 的中间层。** 三层各司其职。

---

## 2. 版式库的内部结构

版式和组件**不应**使用完全一致的文件结构，因为它们本质不同。组件是内容积木，版式是容器骨架。

建议版式结构如下：

```
ui-lib/layouts/a4-landscape/
├── index.html              # 独立预览：用示例内容渲染一个完整A4报告
├── skeleton.html           # ★ 核心：页面骨架（不含内容，只有容器+分页逻辑+打印样式）
├── layout.css              # 版式专属样式（@page、page-break、容器尺寸）
└── README.md               # （可选）版式适用场景说明，不需要Vue组件
```

**skeleton.html 长什么样？**

```html
<!-- 这就是给AI看的"壳子"，AI往里填组件 -->
<div class="a4-page-container">
  <!-- @page { size: A4 landscape; margin: 0; } -->
  <section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg page-break-after-always">
    <div class="content-area px-[22mm] py-[18mm]">
      <!-- {{ page_content }} AI在这里填充组件 -->
    </div>
    <footer class="absolute bottom-[8mm] right-[22mm] text-sm text-[var(--color-text-muted)]">
      第 {{ page_num }} 页
    </footer>
  </section>
</div>
```

**与组件的关键区别：**

| 维度 | 组件 | 版式 |
|------|------|------|
| 职责 | 内容展示单元 | 页面容器+翻页逻辑+打印 |
| 可嵌套 | 组件放入版式 | 版式包裹组件 |
| Vue 组件 | 需要（交互绑定数据） | 不需要（纯结构+CSS） |
| AI 如何使用 | 参照 htmlSnippet 复制写法 | 作为外层模板，在里面填充组件 |
| 文件数 | 3个（index.html, template.html, component.js） | 3个（index.html, skeleton.html, layout.css） |

版式不需要 `component.js`，因为版式不是交互组件——它是静态的 HTML 骨架 + CSS 规则。A4 版式的翻页是 CSS `page-break-after` 控制的，PPT 版式的翻页是简单的 JS 显隐逻辑，这些都放在 `skeleton.html` 的 `<script>` 标签里即可。

---

## 3. report-tool.html 独立运行 —— 怎么调用组件库，怎么和 AI 交互

这是四个问题里最重要的一个，也是我的建议和你预想偏差最大的地方。

### 3.1 技术约束：file:// 协议的现实限制

report-tool.html 双击打开 → 浏览器地址栏是 `file:///Users/xxx/report_system/report-tool/report-tool.html`。这时：

- `fetch('../ui-lib/components/kpi-card/template.html')` → **Safari 可以，Chrome 默认不行**（Chrome 禁止 file:// 下访问父级目录）
- `<iframe src="../ui-lib/components/kpi-card/index.html">` → **所有浏览器都支持**（iframe 加载 file:// 子资源不受限）
- `<img src="../ui-lib/design-tokens/preview.html">` → 同上，支持

**结论：如果 report-tool 要通过 fetch 动态读取组件模板拼进提示词，在 Chrome 上行不通。** 团队用 Safari 的话可以，但不能假设所有人都用 Safari。

### 3.2 我的建议：换个思路，不需要动态读取

v2 的核心痛点是 **"一个巨大的提示词丢给 AI，AI 卡壳"**。你在 conversation.md 里已经发现了：

> "我的内容非常多，给到ai后输出文件太大了，卡壳了，所以我们要分步输出"

那 v3 的方向就不该是 "工具读组件模板 → 拼成更大的提示词 → AI 更卡"。而应该是 **"多轮对话，渐进生成"**。

#### 推荐的工作流（v3）

```
第一轮：搭骨架
  用户在工具里选：版式=A4横版、风格=商务蓝白、主题=货币基金月度报告
  → 生成"骨架提示词"（~800字）
  → AI生成只有容器的空壳HTML，每页标记 [待填充内容]
  → 保存为 货币基金报告_v001.html

第二轮：填内容（逐页/逐区块）
  用户选：第1页用 kpi-card + data-table，内容概要：展示三大收益率指标
  → 生成"内容提示词"（~500字，含当前页组件的template片段）
  → AI基于v001.html修改，填充第1页
  → 保存为 v002

第三轮：填第2页
  → 同样流程，AI基于v002继续

第四轮：精细修改
  → 自然语言描述微调
  → AI生成v004
```

**这个模型下，report-tool.html 不需要 fetch 任何组件文件。** 它只需要：

1. **内置组件注册表**（轻量，纯元数据，~2KB）：

```javascript
const COMPONENT_REGISTRY = [
  { id: 'kpi-card', name: 'KPI数字卡片', category: '数据展示',
    description: '大数字+趋势标签+说明文字',
    templatePath: '../ui-lib/components/kpi-card/template.html' },
  { id: 'data-table', name: '数据表格', category: '数据展示',
    description: '蓝色表头+斑马纹行',
    templatePath: '../ui-lib/components/data-table/template.html' },
  // ... 20个组件也就2KB
];
```

2. **提示词模板引擎**：根据用户选择，拼装结构化的分步提示词。**提示词里引用组件路径，但不嵌入组件代码**——AI 自己去读（Claude 桌面端有文件系统权限）。

提示词关键段落：

```
【组件参考】
请使用以下路径的组件模板作为 HTML 代码参考：
- KPI卡片：ui-lib/components/kpi-card/template.html
- 数据表格：ui-lib/components/data-table/template.html
每个组件的 data-cid 属性、Tailwind 类名风格、HTML 结构请严格参照模板文件。
```

如果担心 AI 不主动读文件，用户可以在 Claude Desktop 里把 `template.html` 文件拖进去作为附件——这和 v2 "粘贴代码块"效果一样，但更灵活。

### 3.3 如果我这个建议你不同意

如果你坚持要工具在生成提示词时自动嵌入组件模板，那就不能完全去掉服务。最小代价方案是在 `start.command` 里加一行：

```bash
# start.command（仍然双击启动，但不是Python）
open -a "Google Chrome" --args --allow-file-access-from-files "$(dirname "$0")/report-tool.html"
```

或者保留一个极简 Python 服务（就是 SPEC.md 里那50行），用户的感知只是双击 start.command 而已，服务在后台透明运行。

**坦率地说：我建议保留极简 server。** 用户双击 start.command 的体验完全不变，但消除了所有 file:// 的坑。而且 gallery.html 里用 iframe 加载组件独立预览时，HTTP 服务下 iframe 通信（postMessage）也更可靠。

---

## 4. 总览画廊页布局

你的设想完全可行，这是最没有争议的一点。具体设计：

```
┌──────────────────┬──────────────────────────────────────────────┐
│  左侧菜单栏       │           右侧内容区                          │
│  (w-64, 固定)    │                                              │
│                  │   ┌──────────────────────────────────────┐  │
│  UI Library      │   │  设计规范 / 基础组件 / 图表           │  │
│  ────────────    │   │                        [商务蓝白 ▾]  │  │
│                  │   │  一键切换风格按钮 →                    │  │
│  📐 设计规范      │   └──────────────────────────────────────┘  │
│    · 色彩系统     │                                              │
│    · 字体排版     │   ┌─────────────────────────────────────┐   │
│    · 间距圆角     │   │                                     │   │
│                  │   │   当前选中组件的实时预览              │   │
│  🧩 基础组件      │   │   （默认显示第一个组件，              │   │
│    · KPI卡片     │   │    风格切换后立即变色）               │   │
│    · 信息卡片     │   │                                     │   │
│    · 数据表格     │   │   ┌───────────────────────────┐    │   │
│    · 流程步骤     │   │   │ 环比 +12.5%               │    │   │
│    · 对比卡片     │   │   │    3.28%                  │    │   │
│    · 团队网格     │   │   │ 七日年化收益率              │    │   │
│    · 亮点引用     │   │   └───────────────────────────┘    │   │
│    · 大数字行     │   │                                     │   │
│    · 时间轴       │   │   ── 代码示例 ──                    │   │
│                  │   │   <div data-cid="kpi-card" ...>     │   │
│  📊 图表          │   │   ...                               │   │
│    · 柱状图       │   │                                     │   │
│    · 折线图       │   │   [复制HTML] [复制Vue] [全屏预览]   │   │
│    · 饼图         │   └─────────────────────────────────────┘   │
│                  │                                              │
│  📄 版式          │                                              │
│    · A4横版       │                                              │
│    · PPT翻页      │                                              │
│    · 自由滚动     │                                              │
│                  │                                              │
│  🎨 风格          │                                              │
│    · 商务蓝白     │                                              │
│    · 暗黑科技     │                                              │
│    · 清新简约     │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### 交互逻辑

- **左侧菜单**：一级分类可折叠。点击二级菜单项 → 右侧切换到对应组件/版式/风格的预览
- **风格切换按钮**：右上角下拉选择器，切换 `data-theme` 属性 → 右侧预览区所有元素即时变色。这个按钮**全局有效**，不管你在看哪个组件，切换风格都立即反映
- **右侧内容区**：渲染的不是缩略图，而是**组件 template.html 的真实渲染效果**（内联在 gallery 页面里），配合下方带语法高亮的代码块。用户看到的效果 = AI 将生成的 HTML 效果
- **"全屏预览"按钮**：打开组件独立的 `index.html`（新标签页），获取完整的组件文档体验

### 实现要点

```javascript
// gallery.html 核心状态
const state = reactive({
  activeCategory: 'components',   // 左侧当前选中的一级分类
  activeItem: 'kpi-card',         // 当前选中的二级项目
  currentTheme: 'business-blue'   // 当前风格
});

// 切换风格 → 改根元素 data-theme，所有内联预览自动变色
function switchTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.currentTheme = theme;
  // CSS 变量即时生效，不需要重新渲染任何东西
}
```

每个组件的预览渲染使用 `v-html` 直接注入 `template.html` 的内容，因为它们共享同一个 `<html>` 的 `data-theme`，CSS 变量全部自动响应——这是用 CSS 自定义属性方案的核心优势。

---

## 总结与偏差说明

| 你的预想 | 我的建议 | 偏差原因 |
|----------|----------|----------|
| Token全用Tailwind封装 | CSS变量为主，Tailwind配方为辅 | 换肤需要运行时动态性，Tailwind静态类名做不到 |
| 版式结构=组件结构 | 版式去掉component.js，加skeleton.html | 版式是容器不是组件，不需要Vue封装 |
| report-tool完全独立，零服务 | 建议保留极简server或用Safari；提示词改多轮模式 | file://协议有跨浏览器兼容问题；多轮提示词解决AI卡壳 |
| gallery卡片式网格布局 | 左侧菜单+右侧预览 | 完全同意，这是更好的方案 |

最大的偏差在第三点——**我建议把 "一次性大提示词" 改为 "多轮渐进提示词"**。这不仅是技术问题，更是从 v2 的实际使用教训出发：大提示词让 AI 卡壳，分步才是正解。report-tool 的定位应该是 **"提示词编排器"** 而非 **"组件代码注入器"**。

需要就哪个点展开聊细节？

好，直接回答。

---

## 第三点深度拆解

### 一、保留 server 到底解决了什么？

v2 的 server.py 做了两件事：

| 功能 | 用途 | v3 还需要吗？ |
|------|------|--------------|
| 静态文件服务 | 让 index.html 通过 `http://localhost:8080` 访问 | gallery.html 和 report-tool.html 用 iframe 加载同级/子级文件时，file:// 完全够用，**不需要** |
| reports/ 文件 API | 列出/读取/保存/删除报告文件 | Claude Desktop 直接写文件到 reports/，用户电脑上已经有文件了，**不需要** |

v2 需要 server 的根因是：它是一个**单页应用**，Vue 接管了所有路由，用 v-show 切页面。这要求 HTTP 服务来保证 JS 模块加载和路由正常。

v3 如果是 **gallery.html 和 report-tool.html 各自独立的普通 HTML 文件**，不涉及 SPA 路由，不涉及 fetch 跨文件读取——server 就没有存在的必要。

**结论：server 主要解决的是 SPA 的运行环境和跨目录 fetch。去掉 SPA 架构、去掉动态读取组件文件的需求，server 就可以去掉。**

---

### 二、如果保留 server，用户要装什么？

这才是从 v2 继承过来的真问题，你在 SPEC.md 里写了 "macOS 自带 Python 3，零安装"，但这是**只对了一半**：

| 平台 | 情况 | 命令 |
|------|------|------|
| macOS (Ventura+) | 系统自带 Python 3 | `python3` |
| macOS (Monterey及更早) | 自带 Python 2.7，**没有 Python 3** | 需安装 |
| Windows 10/11 | **不内置 Python** | 需去 python.org 下载安装 |
| Windows 企业管控电脑 | 可能**不允许安装**外来软件 | 无法使用 |

"双击 start.command" 的体验只在**最新版 macOS**上成立。团队里如果有人用 Windows 或者旧 Mac，第一步就卡住了。这也是为什么 v2 的 PROGRESS.md 里 "Windows 支持 — 需要添加 start.bat" 一直是待办项。

**创建时间**: 2026年5月20日 11:19  
**使用模型**: opus  

---
name: report-system v3 架构决策 - 无服务端纯静态方案
description: v3 组件库和工具采用纯静态 HTML 文件，不依赖 Python 或任何后端服务，跨平台零安装
type: project
---

v3 系统不需要 server 服务。

- 原因：v3 采用多轮渐进提示词模式，report-tool.html 只是提示词编排表单，不需要动态 fetch 组件模板，不需要 SPA 路由，不需要 reports/ 文件管理 API。gallery.html 用 iframe 加载组件预览，file:// 协议下完全可用。
- 跨平台：macOS 和 Windows 均为零安装（不需要 Python），双击 HTML 文件即可在浏览器中打开。
- 架构：gallery.html（组件库总览）、report-tool.html（报告生成工具）、bid-tool.html（标书工具）均为独立静态 HTML，各自双击运行，通过相对路径访问 ui-lib/ 中的组件资源。
- 提示词策略：提示词不嵌入组件代码，只引用组件路径（如 ui-lib/components/kpi-card/template.html），由 Claude Desktop 端自行读取，提示词体积控制在 ~800 字以内。

**How to apply:** 组件库和工具开发时继续使用纯 HTML + CDN 方案，不引入 Python server 或 Node.js 构建步骤。新增工具时按照 gallery.html 模式：独立 HTML 文件 + CDN 引入 Vue/Tailwind + 相对路径引用 ui-lib/ 组件。

---

### 回答你的问题
好的，我来逐一清晰回答这四个确认点的问题，基于专业的判断给出建议，即使是和你的预想有偏差也会明确说明。

让我先重新审视一下 v2 的 SPEC 和对话记录，确保理解准确。
现在我已经全面理解了项目。让我针对你的四个确认点给出专业的回答和建议。

---

## 1. Design Token 的扩展机制与 Tailwind 封装

### Token 的扩展方案

**核心原则：CSS自定义属性（CSS Variables）为主，Tailwind 类名封装为辅。**

推荐的三层结构：

```
design-tokens/
├── tokens.css              # 核心：所有风格的 CSS 变量定义
├── tailwind-mappings.js     # 可选：CSS变量 → Tailwind 类名映射
└── preview.html             # Token 可视化预览页
```

**tokens.css 的设计：**

```css
/* ===== 基础商务蓝白（默认） ===== */
:root {
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
  --color-danger: #ef4444;
  
  --font-heading: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  
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

**扩展新风格只需要加一个 `[data-theme="xxx"]` 块，不需要改任何组件代码。**

### ❌ 不同风格不可以用 Tailwind 类名封装复用

**这是我与你的预想有偏差的地方**。Tailwind 的类名是静态编译的（`text-blue-900`、`bg-blue-50`），而风格切换需要运行时的动态性。如果把颜色写死在 Tailwind 类名里：

- 切换风格时需要修改所有 DOM 元素的类名，性能差且容易漏
- 新增一种风格需要修改每个组件的 HTML 代码

**用 CSS 变量的优势：**
- `background: var(--color-bg-card)` → 换风格只需要改 CSS 变量值
- 组件代码不需要知道当前是哪种风格
- 运行时切换 `<html data-theme="dark-tech">` 生效

**Tailwind 的定位应该是什么？**

Tailwind 用来处理**布局、间距、排版**这些与颜色无关的样式：

```html
<!-- ✅ 布局用 Tailwind 类名 -->
<div class="flex flex-col gap-3 p-6 rounded-2xl shadow-lg">

<!-- ✅ 颜色用 CSS 变量 -->
style="background: var(--color-bg-card); color: var(--color-text);"
```

**可以做一个 Tailwind 配方体系（推荐）：**

```javascript
// tailwind-mappings.js — 给常用组合起名字
const STYLE_RECIPES = {
  'card-base': 'rounded-lg shadow-[var(--shadow-card)] p-6',
  'card-elevated': 'rounded-xl shadow-[var(--shadow-elevated)] p-8',
  'heading-xl': 'text-3xl font-bold',
  'body-text': 'text-base leading-relaxed',
  'badge': 'text-xs font-semibold px-3 py-1 rounded-full',
};
```

这样 AI 生成 HTML 时可以用这些配方名，而不是每次都重新写一遍。

---

## 2. 版式库的内部结构

### 版式 ≠ 组件，结构应该不同

**组件**是内容积木（KPI卡片、表格），**版式**是容器骨架（A4页面、PPT slide、网页），本质不同。

推荐版式库结构：

```
layouts/a4-landscape/
├── index.html              # 独立可打开的预览页
├── skeleton.html           # ★ 核心：页面骨架模板（AI 填空用）
└── layout.css              # 版式专属CSS（打印样式、页面尺寸、分页逻辑）
```

**版式不需要 Vue 组件（component.js）**。为什么？

| 对比维度 | 组件（components） | 版式（layouts） |
|----------|-------------------|----------------|
| 职责 | 内容展示单元 | 页面容器 + 翻页逻辑 |
| 数据绑定 | 需要 Vue（props/events） | 不需要（纯 HTML 结构） |
| 可交互 | 是 | 否（只是结构骨架） |
| AI 怎么用 | 参照代码结构写类似的 HTML | 在这个骨架里填入具体内容 |
| 文件数 | 3（index + template + component.js） | 3（index + skeleton + layout.css） |

### skeleton.html 的核心作用

这是版式库的灵魂——**给 AI 看的空壳模板**：

```html
<!-- layouts/a4-landscape/skeleton.html -->
<!-- 这是 AI 生成报告的骨架模板，请在此结构内填充内容 -->

<!-- @page { size: A4 landscape; margin: 0; } -->
<section class="page w-[297mm] h-[210mm] mx-auto bg-white shadow-lg relative page-break-after-always">
  <div class="content-area px-[22mm] py-[18mm]">
    <!-- ===== 第 {{N}} 页内容区 ===== -->
    <!-- AI 会在这里填充组件（kpi-card、data-table等） -->
  </div>
  <footer class="absolute bottom-[8mm] right-[22mm] text-sm text-gray-400">
    第 {{page_num}} 页
  </footer>
</section>
```

**三种版式的 skeleton 要点：**

| 版式 | skeleton 关键特征 | 翻页方式 |
|------|------------------|----------|
| A4 横版 | 固定宽高 297mm×210mm，@page A4 landscape | page-break-after（CSS 打印分页） |
| PPT Slide | 100vw×100vh，overflow hidden | JS 控制 slide 显隐，键盘/点击切换 |
| 自由网页 | max-w-[1180px] mx-auto，响应式 | 自然滚动，分 section |

---

## 3. 无服务端时，report-tool.html 怎么调用组件库和 AI 交互

这是我与你预想偏差最大的部分，也是最重要的架构决策。让我展开说清楚。

### 3.1 file:// 协议的现实限制

report-tool.html 双击打开，浏览器地址栏是 `file:///.../report-tool.html`。

当你在这个页面里执行 `fetch('../ui-lib/components/kpi-card/template.html')` 时：

| 浏览器 | file:// 下 fetch 跨目录文件 | 结果 |
|--------|---------------------------|------|
| Safari | 🟢 允许 | 正常工作 |
| Chrome | 🔴 禁止（安全策略） | 报错 CORS |
| Edge | 🔴 禁止 | 报错 CORS |
| Firefox | 🔴 限制更严 | 无法跨目录读取 |

**结论：依赖 fetch 动态读取组件模板，大概率在 Chrome 上行不通，而 Chrome 是企业用户最常用的浏览器。**

### 3.2 多轮对话模式下，不需要动态读取

这是我建议的核心改变。回顾 v2 的痛点（你实际测试发现的）：

> "内容非常多，把提示词给到 AI 后输出文件太大了，卡壳了"

所以 v3 的正确方向不是**更大的提示词**，而是**分步多轮**：

```
第一轮：搭骨架 — 仅版式 + 风格 + 主题
用户输入：
  报告主题：货币基金月度估值分析
  版式：A4 横版分页  
  风格：商务蓝白
  大致内容：封面 + 三大指标总览 + 收益率对比 + 风险提示 + 结论

工具生成的提示词（~500字，不会卡壳）：
  【版式约束】请参照 layouts/a4-landscape/skeleton.html 的页面结构
  【风格约束】请使用 styles/business-blue/tokens.css 的颜色方案
  【生成要求】用占位数据生成 5 页 A4 横版报告骨架，每页标记 [待填充]

⬇ Claude 生成 v001.html（空壳报告）
⬇ 用户：好的，骨架效果可以。现在开始填第1页，放 KPI 卡片和指标表


第二轮：填第1页
工具生成的提示词（~300字）：
  基于 reports/货币基金月度_v001.html 的第1页，
  参考 components/kpi-card/template.html 的代码风格，
  填入以下真实数据：...

⬇ Claude 基于 v001 修改 → 保存 v002
⬇ 用户通过预览页查看，发现第2页需要调整


第三轮：填第2页  
  同样模式，每次提示词控制在 ~300-500 字
```

### 3.3 report-tool.html 需要什么？

**不需要动态读取组件文件**。它只需要内置一个轻量的组件注册表：

```javascript
// report-tool.html 内置（硬编码，约 1-2KB）
const COMPONENT_CATALOG = [
  {
    id: 'kpi-card',
    name: 'KPI 数字卡片',
    category: '数据展示',
    icon: '📊',
    description: '展示核心指标数值（收益率、规模等），带趋势标签',
    // AI 参考路径（给到提示词里，不是自己读）
    refPath: '../ui-lib/components/kpi-card/template.html',
    // 适用的数据场景
    dataHint: '需要：数值、单位、变化百分比'
  },
  {
    id: 'data-table',
    name: '数据表格',
    category: '数据展示',
    icon: '📋',
    description: '简洁标准表格，蓝白风格，适合 CSV 数据直接呈现',
    refPath: '../ui-lib/components/data-table/template.html',
    dataHint: '需要：CSV数据或表格行列数据'
  },
  // ... 其他 20 个组件
];
```

### 3.4 提示词怎么引用组件？

**不嵌入代码，只引用路径。** 提示词里写：

```
【组件使用说明】
本次报告需要使用以下组件：
- KPI 数字卡片：请参照 ui-lib/components/kpi-card/template.html 的 HTML 结构和 Tailwind 类名
- 数据表格：请参照 ui-lib/components/data-table/template.html 的 HTML 结构
每个组件的 data-cid 属性必须保留，CSS 变量名（如 var(--color-primary)）不要改动
```

**为什么 AI 能看到这些文件？**
- Claude Desktop 有工作目录的概念，可以直接读取本地文件
- 用户也可以在 Claude Desktop 里把 template.html 拖进去作为附件

### 3.5 仍然需要一个超轻量服务吗？

**不需要。** gallery.html 和 report-tool.html 都作为纯静态 HTML 运行：

| 页面 | 怎么运行 | 需要服务吗 |
|------|---------|-----------|
| gallery.html（组件总览） | 双击打开，iframe 加载子组件预览 | ✅ 不需要。iframe 加载相对路径 file:// 无限制 |
| report-tool.html（生成提示词） | 双击打开，纯表单 + 文本拼接 | ✅ 不需要。没有 fetch 调用 |
| 组件独立 index.html（如 kpi-card） | 双击打开，自包含 HTML | ✅ 不需要 |

---

## 4. 总览画廊页布局

### 推荐：左右两栏布局

这与你的预想一致，具体设计：

```
┌──────────────────┬──────────────────────────────────────────────────┐
│  左侧菜单栏       │                 右侧内容预览区                     │
│  (w-64 固定240px) │                                                  │
│                  │  ┌─────────────────────────────────────────────┐ │
│  📐 设计规范      │  │  KPI 数字卡片                  [商务蓝白 ▾] │ │
│    · 色彩系统     │  │  ─────────────────────────────────────────  │ │
│    · 字体排版     │  │                                             │ │
│    · 间距圆角     │  │  ┌───────────────────────────────────────┐ │ │
│                  │  │  │                                       │ │ │
│  🧩 基础组件      │  │  │    实时预览区（看到的 = 实际效果）       │ │ │
│    · KPI卡片 ◀   │  │  │    ┌───────────────────────────┐      │ │ │
│    · 信息卡片     │  │  │    │ 环比 +12.5%               │      │ │ │
│    · 数据表格     │  │  │    │    3.28%                  │      │ │ │
│    · 流程步骤     │  │  │    │ 七日年化收益率              │      │ │ │
│    · 对比卡片     │  │  │    └───────────────────────────┘      │ │ │
│    · 团队网格     │  │  │                                       │ │ │
│    · 亮点引用     │  │  │  风格切换后自动变色                     │ │ │
│    · 大数字行     │  │  └───────────────────────────────────────┘ │ │
│    · 时间轴       │  │                                             │ │
│                  │  │  ┌─ 代码示例 ──────────────────────────────┐ │ │
│  📊 图表组件      │  │  │ <div data-cid="kpi-card"               │ │ │
│    · 柱状图       │  │  │   class="bg-[var(--color-bg-card)]     │ │ │
│    · 折线图       │  │  │   rounded-[var(--radius-lg)] ..."      │ │ │
│    · 饼图         │  │  │   ...                                  │ │ │
│    · 仪表盘       │  │  └────────────────────────────────────────┘ │ │
│                  │  │                                             │ │
│  📄 版式模板      │  │  [复制 HTML] [复制 Vue 组件] [全屏预览]     │ │
│    · A4横版       │  └─────────────────────────────────────────────┘ │
│    · PPT翻页      │                                                  │
│    · 自由滚动     │                                                  │
│                  │                                                  │
│  🎨 主题风格      │                                                  │
│    · 商务蓝白     │                                                  │
│    · 暗黑科技     │                                                  │
│    · 清新简约     │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘
```

### 交互设计要点

**1. 左侧菜单交互：**
- 一级菜单（设计规范/基础组件/图表/版式/风格）可折叠，默认全部展开
- 点击二级项（如 KPI卡片）→ 右侧内容区切换到对应组件的实时预览
- 当前选中的二级项高亮显示（深蓝背景）

**2. 右侧内容——风格切换按钮：**
- 位置：右上角固定
- 默认显示：商务蓝白风格
- 点击下拉菜单选择风格 → 立即切换，预览区组件实时变色
- **所有组件共享同一个风格选择器**，不需要一个一个组件单独切换

**3. 风格切换原理（CSS 变量优势）：**

```html
<!-- gallery.html -->
<html data-theme="business-blue">
  ...
  <div style="background: var(--color-bg-card); color: var(--color-text)">
    预览内容
  </div>
</html>
```

```javascript
// 切换风格函数
function switchTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
  // 所有使用了 var(--color-xxx) 的元素自动变色
  // 不需要重新渲染任何组件！
}
```

**4. 右侧内容区——三种展示模式（建议按 Tab 切换）：**

- Tab 1：**实时预览** — 默认激活，真实渲染组件（带示例数据）
- Tab 2：**HTML 代码** — 完整的 HTML 源代码，带语法高亮
- Tab 3：**Vue 用法** — Vue 组件的 props 说明 + 代码示例

---

## 整体架构总览

```
report_system/
├── ui-lib/                             # 组件库（独立，各工具共享）
│   ├── gallery.html                    # 总览页（左右两栏布局）
│   ├── design-tokens/
│   │   ├── tokens.css                  # CSS 变量定义 + 3套风格主题
│   │   └── preview.html               # Token 可视化展示
│   │
│   ├── components/                     # 基础组件
│   │   ├── kpi-card/
│   │   │   ├── index.html             # 独立可打开：预览 + 代码 + 参数说明
│   │   │   ├── template.html          # 纯 HTML 片段（AI 参考）
│   │   │   └── component.js           # Vue 3 组件定义
│   │   ├── info-card/
│   │   ├── data-table/
│   │   ├── timeline/
│   │   └── ...（第一批 12-15 个组件）
│   │
│   ├── charts/                         # 图表组件
│   │   ├── bar-chart/
│   │   ├── line-chart/
│   │   └── pie-chart/
│   │
│   ├── layouts/                        # 版式模板
│   │   ├── a4-landscape/
│   │   │   ├── index.html             # 独立可打开预览
│   │   │   ├── skeleton.html          # ★ 骨架模板
│   │   │   └── layout.css             # 打印样式 + 页面尺寸
│   │   ├── ppt-slide/
│   │   └── web-scroll/
│   │
│   └── styles/                         # 主题风格
│       ├── business-blue/
│       ├── dark-tech/
│       └── fresh-clean/
│
├── report-tool/                        # 工具1：报告生成
│   └── report-tool.html               # 双击运行，纯静态
│
├── bid-tool/                           # 工具2：标书撰写（后续）
│   └── bid-tool.html
│
├── bi-system/                          # 工具3：轻量BI（后续）
│   └── bi-dashboard.html
│
├── system_v1/                          # 保留
└── system_v2/                          # 保留
```

---

## 总结：4个确认点的关键决策

| 确认点 | 决策 | 与你的预想是否一致 |
|--------|------|-------------------|
| 1. Token 扩展 | CSS 变量为主，Tailwind 用于布局，**不**用 Tailwind 封装风格 | ❌ 有偏差 — Tailwind 不适合做动态换肤 |
| 2. 版式库结构 | 和组件库相似但有区别：3个文件，不需要 Vue 组件，重点是 skeleton | ⚠️ 部分一致 — 结构相似但内容不同 |
| 3. 无服务调用 | **零服务端**，多轮渐进提示词，组件注册表内置在工具中，提示词引用路径不嵌入代码 | ❌ 有偏差 — 建议完全去掉服务 |
| 4. 画廊布局 | 左右两栏，左菜单右预览，右上角风格切换按钮 | ✅ 完全一致 |

需要继续深入讨论第三点（多轮对话的具体提示词格式），还是可以开始搭建 Phase 1 的代码了？

SPEC.md 已生成到 `system_v3/SPEC.md`。下面是文档结构概览，方便你快速定位：

| 章节 | 内容 |
|------|------|
| 一、产品定位 | ui-lib 与工具分离，组件库是共享基础设施 |
| 二、技术约束 | 纯静态、零服务端、全部CDN、CSS变量做颜色、Tailwind做布局 |
| 三、项目文件结构 | 完整目录树，ui-lib / report-tool / bid-tool / bi-system 并列 |
| 四、Design Token 体系 | tokens.css 完整定义、扩展方式、风格切换原理、Tailwind角色边界 |
| 五、组件规范 | 3文件结构（index.html / template.html / component.js）、每个文件的规范、12个组件清单 |
| 六、图表组件规范 | ECharts封装规范、统一数据接口、首批3个图表 |
| 七、版式规范 | 与组件的结构差异、skeleton.html 规范、三种版式对比 |
| 八、风格预览 | 每种风格独立预览页 |
| 九、总览画廊页 | 左右两栏布局详图、交互设计、Vue实现方式 |
| 十、报告生成工具 | 多轮渐进工作流、提示词模板、组件注册表、页面结构 |
| 十一、Token预览页 | 色彩/字体/间距/圆角可视化展示 |
| 十二、工具调用方式 | 三种方式：AI引用路径 / iframe嵌入 / Vue组件引用 |
| 十三、实施计划 | 4个Phase，Phase 1先做2个组件打通流程 |
| 十四、与v2区别 | 10个维度的对比表 |
| 十五、后续扩展 | 组件/风格/版式/工具扩展预留 |

你看看有没有需要调整的地方，确认后我们按 Phase 1 开始写代码。

这是个关键的产品设计问题。我先说结论，再展开具体流程。

---

## 核心判断：表单勾选 + 实时预览，不是纯自然语言

原因很简单：业务同事不知道组件叫 "kpi-card" 还是 "big-number-row"，也不知道 "A4横版分页" 和 "PPT Slide翻页" 实际长什么样。纯自然语言描述的前提是用户已经熟悉组件库，而你们的用户**第一次打开工具时对组件库一无所知**。

但和 v2 不同——v3 的组件库每个组件都有独立的 `index.html`，可以 iframe 嵌入真实渲染，用户勾选前看到的不再是 CSS 骨架，而是**实际效果**。

---

## 用户完整操作流程（以生成一份货币基金月度报告为例）

### 前置步骤：花 3 分钟逛组件库

用户打开 `gallery.html` → 左侧菜单浏览 → 看到 kpi-card 长什么样、data-table 长什么样、A4 版式骨架长什么样 → 心里有数了 → 打开 `report-tool.html` 开始干活。

> gallery.html 的定位类似 Ant Design 官网——写代码之前先去逛逛看有哪些现成的东西。

---

### 第一轮：生成报告骨架

```
┌─────────────────────────────────────────────────────┐
│  Step 1 — 报告基本信息                               │
│                                                     │
│  报告文件名：[货币基金月度估值分析___________]          │
│  报告主题：  [面向管理人的货币基金月度收益归因___]       │
│  受众：      ○ 高管汇报  ● 客户展示  ○ 内部培训       │
│  用途：      ○ 汇报展示  ● 交付文档  ○ 培训材料       │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 2 — 版式                                      │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ [A4横版预览]  │ │ [PPT翻页预览] │ │ [自由滚动预览] │ │
│  │   iframe嵌入  │ │   iframe嵌入 │ │   iframe嵌入  │ │
│  │   skeleton    │ │   skeleton   │ │   skeleton    │ │
│  │   的缩略效果   │ │   的缩略效果  │ │   的缩略效果   │ │
│  │              │ │              │ │              │ │
│  │ ○ A4 横版分页 │ │ ● PPT Slide  │ │ ○ 自由滚动网页 │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
│  点击卡片选中（蓝色边框高亮）      [去版式库看完整效果→] │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 3 — 风格                                      │
│                                                     │
│  ● 商务蓝白  ○ 暗黑科技  ○ 清新简约                   │
│  ┌──────────────────────────────────────────────┐   │
│  │  该风格下组件实际渲染效果（实时预览）            │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │ KPI卡片  │ │ 信息卡片 │ │ 数据表格 │   ...   │   │
│  │  │ (真实色)  │ │ (真实色) │ │ (真实色)  │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘        │   │
│  └──────────────────────────────────────────────┘   │
│  风格切换时下方预览区即时变色                           │
│                                                     │
│  ───────────────────────────────────────────────     │
│  Step 4 — 内容大纲                                   │
│                                                     │
│  本次报告大致包含以下内容（口语化描述即可）：            │
│  ┌─────────────────────────────────────────────┐    │
│  │ 第1页：封面（标题、团队、日期）                 │    │
│  │ 第2页：三大核心指标概览（收益率、规模、风险）     │    │
│  │ 第3页：收益率走势对比分析                       │    │
│  │ 第4页：持仓结构分析（按资产类别）                │    │
│  │ 第5页：风险指标与总结                          │    │
│  └─────────────────────────────────────────────┘    │
│  [+ 添加一页]                                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成骨架提示词并复制                       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

用户点击「生成骨架提示词」→ 提示词 ~500字，内容大致：

```
你是金融报告HTML生成专家。

【版式约束】请参照 ../ui-lib/layouts/ppt-slide/skeleton.html 的页面结构，
使用 100vw×100vh 容器、JS翻页逻辑。

【风格约束】请使用 ../ui-lib/design-tokens/tokens.css 中 business-blue 的CSS变量。
所有颜色使用 var(--color-xxx)，不要替换为具体色值。

【内容结构】
- 第1页：封面
- 第2页：三大核心指标概览
- 第3页：收益率走势对比分析
- 第4页：持仓结构分析
- 第5页：风险指标与总结

【要求】
1. 用占位数据生成5页PPT骨架，每页标记 [待填充-第X页]
2. 给每页容器添加 data-page="X" 属性
3. 保存到 reports/货币基金月度估值分析_v001.html
4. 只输出完整HTML，不要解释
```

用户复制 → 粘贴到 Claude Desktop → AI 生成 v001.html（一个只有骨架的 PPT，每页有标题和占位标记，但没有真实数据和组件）。

用户双击 v001.html 看一眼：「骨架没问题，PPT 翻页正常，颜色对。开始填内容。」

---

### 第二轮起：逐页填充内容

用户回到 report-tool.html，进入「内容填充」Tab：

```
┌─────────────────────────────────────────────────────┐
│  内容填充 — 第 2 轮                                  │
│  当前报告：货币基金月度估值分析（v001 → v002）          │
│                                                     │
│  选择要填充的页面：[第2页 ▾]  ← 下拉选择               │
│                                                     │
│  ───────────────────────────────────────────────     │
│  本页内容概要（自然语言描述）：                         │
│  ┌─────────────────────────────────────────────┐    │
│  │ 展示三只货币基金的七日年化收益率、万份收益、      │    │
│  │ 近一月回报率三个核心指标，每只基金一个卡片，     │    │
│  │ 顶部再加一个汇总对比表                        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ───────────────────────────────────────────────     │
│  选择本页使用的组件（多选，可重复选同一组件多次）：       │
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │            │ │            │ │            │      │
│  │   iframe   │ │   iframe   │ │   iframe   │      │
│  │   kpi-card │ │  data-table│ │ compare-card│      │
│  │   真实渲染  │ │   真实渲染  │ │   真实渲染   │      │
│  │            │ │            │ │            │      │
│  │ ☑ KPI卡片  │ │ ☑ 数据表格  │ │ ☐ 对比卡片  │      │
│  │   选3个    │ │   选1个    │ │            │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│  ┌────────────┐ ┌────────────┐                     │
│  │ info-card  │ │ big-number │  ...                │
│  │ ☐ 信息卡片  │ │ ☐ 大数字行  │                     │
│  └────────────┘ └────────────┘                     │
│  每个组件通过 iframe 嵌入其 index.html，              │
│  看到的是真实渲染效果（不是骨架），风格已匹配            │
│                                                     │
│  ───────────────────────────────────────────────     │
│  本页数据来源：                                       │
│  ○ 跟随全局数据  ● 本页独立指定                       │
│  [上传CSV: returns_may.csv]  已解析：3行×5列           │
│  ┌─────────────────────────────────────────┐        │
│  │ 基金名称 │ 七日年化 │ 万份收益 │ 近一月回报 │       │
│  │ 天弘     │ 2.15%   │ 0.5892  │ 0.18%    │       │
│  │ 南方     │ 2.08%   │ 0.5701  │ 0.16%    │       │
│  │ 华夏     │ 2.21%   │ 0.6013  │ 0.19%    │       │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成第2页填充提示词并复制                   │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

生成的提示词 ~400字：

```
请基于 reports/货币基金月度估值分析_v001.html 继续修改。

【当前任务】填充第2页（data-page="2"）。

【组件参考】
- KPI数字卡片：请参照 ../ui-lib/components/kpi-card/template.html
- 数据表格：请参照 ../ui-lib/components/data-table/template.html
严格参照其 data-cid、CSS变量风格、Tailwind布局类名。

【内容要求】
展示三只货币基金的七日年化收益率、万份收益、近一月回报率三个核心指标。
每只基金一个KPI卡片，顶部加一个汇总对比表。

【数据】
CSV: returns_may.csv（3只基金×4项指标）

【要求】
1. 保持第1页及其他页面内容不变，只修改 data-page="2" 的内容
2. 从CSV读取真实数据填入组件
3. 保存为 reports/货币基金月度估值分析_v002.html
4. 只输出完整HTML，不要解释
```

用户复制 → Claude 生成 v002 → 用户双击预览 → 第2页填好了 → 继续第3页。

---

### 逐页填充直到完成

第3页（收益率走势对比）→ 选 line-chart + info-card → 生成提示词 → v003
第4页（持仓结构分析）→ 选 pie-chart + data-table → 生成提示词 → v004
第5页（风险指标与总结）→ 选 big-number-row + highlight-quote → 生成提示词 → v005

每轮提示词都只有 300-500 字，AI 不会卡壳。

---

### 精细修改阶段

用户发现第3页饼图的颜色和整体风格不太搭，或者文字措辞不够正式。回到工具的「精细修改」Tab：

```
┌─────────────────────────────────────────────────────┐
│  精细修改                                            │
│  当前版本：货币基金月度估值分析_v005.html              │
│                                                     │
│  修改意见（自然语言）：                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ 1. 第3页饼图的配色改成商务蓝白风格一致的蓝色系    │    │
│  │ 2. 第5页"风险可控"改成"风险指标处于合理区间"    │    │
│  │ 3. 封面加一句slogan："专业估值，守护资产价值"   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  🚀 生成修改提示词并复制                       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

AI 基于 v005 做定点修改 → v006 → 完成。

---

## 关键设计要点总结

| 用户动作 | 界面形式 | 预览方式 |
|----------|---------|---------|
| 选版式 | 3张卡片单选，每张卡片嵌入版式 skeleton.html 的缩略 iframe | 看到真实骨架效果 |
| 选风格 | 3个选项 + 下方组件实时变色预览区 | 切换风格后预览区即时变色 |
| 写内容大纲 | textarea，自然语言，口语化即可 | 无预览（此阶段还没内容） |
| 选组件 | 多选卡片，每张卡片 iframe 嵌入组件的 index.html | **看到真实渲染效果**，且已匹配当前风格 |
| 上传数据 | CSV 拖拽/选择，自动解析预览前5行 | 表格预览 |
| 修改意见 | textarea，自然语言描述 | 无预览 |

**和 v2 的核心区别**：v2 的组件选择是 CSS 骨架缩略图（灰白 placeholder），v3 是 iframe 嵌入的**真实渲染**。用户选 kpi-card 时看到的就是将来报告里 KPI 卡片的样子，且切换风格后预览区自动变色——没有 "选了暗黑科技但缩略图还是蓝色" 的割裂感。

---

## 一个坦诚的提醒

这套流程里有一个**不可省略的用户行为**：在 Claude Desktop 和 report-tool.html 之间来回切换。v2 是这个模式，v3 也是。

完全消除这个切换的唯一方案是**把 AI 调用嵌入工具本身**（调 Claude API，流式返回），但这意味着：
- 需要后端服务（API Key 不能暴露在前端）
- 需要网络
- 需要付费（API 按 token 计费）

SPARC 方案里写的 "后续扩展预留：AI 直接对话集成" 就是这个方向。当前阶段保留复制粘贴模式是务实的——先用最小成本跑通流程，验证多轮渐进方案确实比一次性大提示词好，再决定是否做内嵌 AI。

---

需要我把这个操作流程也补充到 SPEC.md 里吗？还是现有 SPEC 已经够清晰，可以直接开始 Phase 1 的代码了？

问得很细，逐个说清楚。

---

## 一、report-tool.html 里的组件预览是哪来的？

**不是重新写的。** 就是直接复用了 ui-lib 里组件的 `index.html` 和 `template.html`。

工具和组件库的物理关系：

```
report_system/
├── ui-lib/
│   └── components/kpi-card/
│       ├── index.html          ← 组件的完整预览页
│       └── template.html       ← 组件的纯 HTML 片段
│
└── report-tool/
    └── report-tool.html        ← 工具页面
```

report-tool.html 引用组件有两种方式，按场景分：

### 场景A：组件选择卡片里的缩略预览（用 v-html 内联 template.html）

```html
<!-- report-tool.html 内部 -->
<link rel="stylesheet" href="../ui-lib/design-tokens/tokens.css">

<div id="app">
  <!-- 组件选择卡片：内联渲染 template.html 片段 -->
  <div class="component-card" 
       v-for="comp in components" 
       @click="toggleComponent(comp.id)"
       :class="{ selected: isSelected(comp.id) }">
    
    <!-- ★ 关键：v-html 直接渲染组件的 template.html -->
    <div class="preview-area" v-html="comp.templateContent"></div>
    
    <div class="card-footer">
      <input type="checkbox" :checked="isSelected(comp.id)">
      <span>{{ comp.name }}</span>
      <span class="count" v-if="getCount(comp.id) > 1">×{{ getCount(comp.id) }}</span>
    </div>
  </div>
</div>
```

```javascript
// report-tool.html 内置的组件注册表
const COMPONENT_CATALOG = [
  {
    id: 'kpi-card',
    name: 'KPI 数字卡片',
    category: '数据展示',
    description: '展示核心指标数值，带趋势标签',
    refPath: '../ui-lib/components/kpi-card/template.html',
    // ★ 工具首次加载时通过 fetch 读一次 template.html，缓存内容
    // 注意：这里用 fetch 是因为 report-tool.html 和 ui-lib 在同一目录树下
    // 如果 file:// 下有兼容问题，可以直接把 template 内容硬编码为字符串常量
    templateContent: ''
  },
  // ...
];

// 初始化：预加载所有组件的 template 内容
async function loadTemplates() {
  for (const comp of COMPONENT_CATALOG) {
    try {
      const resp = await fetch(comp.refPath);
      comp.templateContent = await resp.text();
    } catch (e) {
      // file:// 下 fetch 失败，回退到硬编码的 fallback
      comp.templateContent = comp.fallbackHTML;
    }
  }
}
```

**为什么用 v-html 内联而不是 iframe？**

| 方式 | 风格切换响应 | 性能 | 脚本执行 | 适用 |
|------|------------|------|---------|------|
| v-html 内联 | ✅ 即时变色（同一个 document，共享 `data-theme`） | 快 | ❌ 不执行 `<script>` | 基础组件（无 JS） |
| iframe 嵌入 | ❌ 需要传参或 postMessage 才能同步主题 | 中等 | ✅ 可执行脚本 | 图表组件（有 ECharts JS） |

基础组件（kpi-card、info-card、data-table 等）的 template.html 只有 HTML + CSS 变量引用，没有任何 JS。所以用 v-html 内联是最佳方案——用户切换风格时，预览区的组件**瞬间全部变色**，零延迟。

图表组件（bar-chart 等）的 template.html 包含 ECharts 初始化脚本，v-html 不执行脚本。处理方式：

```
┌──────────────┐
│              │
│  [静态缩略图] │  ← 图表组件的预览卡片用一张静态截图代替
│              │     不是实时渲染，但能看到样子
│  柱状图       │
│              │
│  [查看完整效果] │  ← 点击跳转 → 在新标签页打开图表的 index.html
└──────────────┘
```

### 场景B：版式选择卡片里的预览（用 iframe 嵌入 skeleton.html）

版式 skeleton 需要展示页面骨架（A4纸的轮廓、翻页按钮等），适合用 iframe：

```html
<iframe src="../ui-lib/layouts/a4-landscape/index.html" 
        class="border rounded overflow-hidden"
        style="width:100%;height:200px;pointer-events:none;">
</iframe>
```

`pointer-events:none` 让 iframe 纯粹展示，不响应点击——防止用户点到 iframe 里的翻页按钮导致混乱。

---

## 二、file:// 下 fetch 的兼容处理

前一版讨论过：Chrome 禁 file:// 下的跨目录 fetch。所以组件模板内容的获取有两种策略：

**策略A（推荐）：硬编码 fallback + fetch 增强**

```javascript
const COMPONENT_CATALOG = [
  {
    id: 'kpi-card',
    name: 'KPI 数字卡片',
    // 每个组件的 template.html 内容直接作为字符串常量嵌入
    // 12 个组件 × 平均 15 行 HTML ≈ 总共 ~10KB，完全可接受
    fallbackHTML: `
      <div data-cid="kpi-card" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6 flex flex-col gap-3">
        <span class="text-xs font-semibold px-3 py-1 rounded-full w-fit" style="color:var(--color-primary);background:var(--color-primary-light)">环比 +12.5%</span>
        <div class="text-5xl font-bold" style="color:var(--color-primary)">3.28<span class="text-lg font-normal" style="color:var(--color-text-muted)">%</span></div>
        <p class="text-sm" style="color:var(--color-text-muted)">七日年化收益率</p>
      </div>`,
    refPath: '../ui-lib/components/kpi-card/template.html',
  },
  // ... 其他组件
];

// 优先用 fetch（Safari可用），失败则用 fallback（Chrome）
async function initCatalog() {
  for (const comp of COMPONENT_CATALOG) {
    try {
      const resp = await fetch(comp.refPath);
      if (resp.ok) {
        comp.templateContent = await resp.text();
        continue;
      }
    } catch (e) { /* fallback */ }
    comp.templateContent = comp.fallbackHTML;
  }
}
```

这意味着：每个组件的 template.html **有两份**——一份在 `ui-lib/components/xxx/template.html`（给 AI 读），一份在 `report-tool.html` 的 `fallbackHTML` 字段（给工具预览用）。开发时保持两者同步。

**为什么不直接硬编码不要 fetch？** 因为 fallback 只能保证工具的预览工作。提示词里引用路径让 AI 读 template.html 的功能不受影响——那个不经过 fetch，是 Claude Desktop 自己读文件。

**策略B：保留 fetch，仅支持 Safari 和 HTTP 服务**

如果团队统一用 Safari，或者后期加回极简 server，fetch 就能正常工作。代码更干净，不需要维护两份 HTML。

**建议：先用策略A（硬编码fallback），让 Chrome 用户也能用。组件数量稳定后（12个左右），维护两份内容的成本很低。如果后期团队统一用 Safari 或加了 HTTP 服务，去掉 fallback 即可。**

---

## 三、用户配置能保存吗？可以保留成个人配置吗？

**可以，而且是 v3 的一个重要功能。** v2 的 PROGRESS.md 里把 "配置快照自动保存" 列为待改进项，v3 直接把它做进设计。

### 保存方案

因为 report-tool.html 是纯静态文件（无服务端），保存配置 = **浏览器触发 JSON 文件下载**。

```
用户在工具里：
  选版式：PPT Slide
  选风格：商务蓝白
  内容结构：
    第1节：封面（kpi-card ×1, info-card ×1）
    第2节：核心指标（kpi-card ×3, data-table ×1）
    第3节：收益分析（line-chart ×1, compare-card ×1）
    第4节：总结（highlight-quote ×1, big-number-row ×1）
  数据源：returns_may.csv

→ 点击「💾 保存当前配置」
→ 浏览器弹出下载 → 用户保存到电脑任意位置
→ 文件名：货币基金报告模板_2026-05-20.json
```

### 配置的 JSON 格式

```json
{
  "name": "货币基金月度报告模板",
  "version": "1.0",
  "createdAt": "2026-05-20T14:30:00+08:00",
  "updatedAt": "2026-05-20T14:30:00+08:00",
  
  "report": {
    "fileName": "货币基金月度估值分析",
    "topic": "面向管理人的货币基金月度收益归因分析",
    "audience": "client",
    "purpose": "deliverable"
  },
  
  "layout": {
    "id": "ppt-slide",
    "name": "PPT Slide 翻页"
  },
  
  "style": {
    "id": "business-blue",
    "name": "商务蓝白"
  },
  
  "pages": [
    {
      "index": 1,
      "type": "section",
      "name": "封面",
      "outline": "报告标题、团队信息和日期",
      "components": [
        { "id": "info-card", "count": 1 }
      ]
    },
    {
      "index": 2,
      "type": "section",
      "name": "核心指标概览",
      "outline": "展示三只基金的七日年化、万份收益、近一月回报",
      "slideHint": "2-3页",
      "components": [
        { "id": "kpi-card", "count": 3 },
        { "id": "data-table", "count": 1 }
      ]
    },
    {
      "index": 3,
      "type": "section",
      "name": "收益走势分析",
      "outline": "近三年收益率走势对比及归因分析",
      "slideHint": "3-5页",
      "components": [
        { "id": "line-chart", "count": 1 },
        { "id": "compare-card", "count": 1 }
      ]
    },
    {
      "index": 4,
      "type": "section",
      "name": "总结与展望",
      "outline": "核心结论和风险提示",
      "slideHint": "1-2页",
      "components": [
        { "id": "highlight-quote", "count": 1 },
        { "id": "big-number-row", "count": 1 }
      ]
    }
  ],
  
  "dataSources": {
    "global": {
      "type": "csv",
      "fileName": "returns_may.csv"
    }
  }
}
```

### 加载已保存的配置

```
用户下次打开 report-tool.html：
  → 点击「📂 加载已有配置」
  → 浏览器弹出文件选择器
  → 用户选择之前保存的 "货币基金报告模板_2026-05-20.json"
  → 表单瞬间恢复：
      ✓ 版式自动选中 PPT Slide
      ✓ 风格自动选中 商务蓝白
      ✓ 4节内容结构全部恢复
      ✓ 组件勾选全部恢复
  → 用户只需微调内容大纲 → 生成提示词 → 开干
```

```javascript
// 加载配置的核心逻辑（极简）
function loadConfig(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const config = JSON.parse(e.target.result);
    
    // 恢复表单状态
    state.reportFileName = config.report.fileName;
    state.reportTopic = config.report.topic;
    state.audience = config.report.audience;
    state.selectedLayoutId = config.layout.id;
    state.selectedStyleId = config.style.id;
    state.pages = config.pages;
    state.dataSources = config.dataSources;
    
    // 版式选中 → 高亮对应卡片
    // 风格选中 → 预览区变色
    // 组件勾选 → checkbox 全部勾上
    // 一切恢复如初
  };
  reader.readAsText(file);
}

// 触发文件选择
document.getElementById('loadConfigBtn').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => loadConfig(e.target.files[0]);
  input.click();
});
```

### 配置的实际价值

| 场景 | 用法 |
|------|------|
| 重复报告 | 每月做一次货币基金报告，加载上个月的配置，改数据 → 直接生成 |
| 团队共享 | 小王做了一套 "估值方法论培训" 的配置，导出 JSON 发给小李，小李加载即用 |
| 模板沉淀 | 团队常用的 5-6 种报告类型，各自形成配置模板，新同事上手第一天就能用 |
| 版本对比 | 配置存 JSON，可放 Git 里追踪变化。团队讨论："这版封面用 info-card，上版用 kpi-card，哪个好？" |

---

## 四、完整数据流串联

```
第一次使用：
  用户逛 gallery.html → 了解有哪些组件/版式/风格
    ↓
  打开 report-tool.html
    ↓
  填写表单（版式/风格/组件/内容大纲）
    ├─ 组件预览卡片：v-html 内联 template.html，共享 data-theme，即时变色
    ├─ 版式预览卡片：iframe 嵌入 skeleton.html
    └─ 风格切换：修改 <html data-theme="xxx">，所有预览即时响应
    ↓
  [💾 保存配置] → 下载 JSON → 存电脑上
    ↓
  生成提示词 → 复制 → Claude Desktop → 生成报告
    ↓
  逐页填充 → 重复生成 → 完成

第二次使用（做同类报告）：
  打开 report-tool.html
    ↓
  [📂 加载配置] → 选择上次的 JSON
    ↓
  微调内容大纲和数据
    ↓
  直接生成提示词 → 跳过选版式/风格/组件的全部步骤
    ↓
  5 分钟搞定，而不是从头开始花 20 分钟
```

---

## 五、实现层面的关键决策总结

| 问题 | 方案 |
|------|------|
| 组件预览从哪来 | ui-lib 的 template.html，内联到工具里（v-html），不是重新写 |
| 预览为何不用 iframe | v-html 与父页面共享 CSS 变量，风格切换即时生效；iframe 需要额外传参同步 |
| 图表组件预览怎么办 | 卡片用静态截图；点"全屏预览"打开图表的 index.html（新标签页） |
| file:// 下 fetch 失败怎么办 | 每个组件的 template 有硬编码 fallbackHTML，fetch 失败自动降级 |
| 配置怎么保存 | JSON 格式，浏览器触发下载 |
| 配置怎么加载 | `<input type="file">` 选择 JSON，解析后恢复全部表单状态 |
| 配置能复用吗 | 能。加载→微调→生成，大幅减少重复操作 |
| 配置能让同事用吗 | 能。JSON 文件发过去，对方加载即用 |

需要我把配置保存/加载的逻辑补充到 SPEC.md 里吗？

现在更新 SPEC.md，补充完整的用户操作流程、组件预览机制、file:// 兼容策略和配置保存/加载功能。

现在更新 section 十二 补充 v-html vs iframe 的决策说明，以及修正 section 二的 file:// 描述。

现在修正后续章节编号（因为新增了 section 十一）。

需要修正重复的章节编号。

SPEC.md 已更新完毕。新增和调整的内容总结：

### 新增内容

| 位置 | 内容 |
|------|------|
| **10.2 组件预览机制** | v-html 内联基础组件、静态截图+全屏入口预览图表、iframe 预览版式，三种方式的选型原因 |
| **10.3 file:// 兼容策略** | 硬编码 fallbackHTML + fetch 增强方案，12个组件约10KB，兼容所有浏览器；不影响 AI 端读取文件 |
| **10.4 用户完整操作流程** | 从前置浏览组件库 → 第一轮骨架 → 第二轮逐节填充 → 精细修改，每个步骤的 UI 截图式描述 |
| **10.5 提示词模板** | 骨架/内容填充/精细修改 三种场景的完整模板 |
| **10.6 页面结构总览** | 7个功能区清单 |
| **十一、配置保存与加载** | 完整的保存/加载逻辑、JSON 格式示例、4个使用场景（重复报告/团队共享/模板沉淀/快速切换） |

### 调整的章节编号

| 旧编号 | 新编号 | 标题 |
|--------|--------|------|
| 十一 | 十二 | Design Token 预览页 |
| 十二 | 十三 | 工具如何调用组件库 |
| 十三 | 十四 | 实施计划 |
| 十四 | 十五 | 与 v2 的关键区别 |
| 十五 | 十六 | 后续扩展预留 |

可以开始 Phase 1 写代码了，还是还有其他需要讨论的？

可以的。我们这次讨论的所有方案和决策都已经落地到了 `system_v3/SPEC.md` 里。下次新对话时，你只需要做一件事：**把 SPEC.md 的内容给 Claude 看**，它就能完整理解整个方案。

让我再存一份项目记忆，方便下次快速上手。

---

## 📋 会话总结

**结束时间**: 2026/05/20 15:49:02
**总问题数**: 9
**总回答数**: 17

---
下次新对话时，很简单：

给 Claude 说一句话即可：

▎ 我们在做 system_v3 的组件库，完整方案在 system_v3/SPEC.md 里，你先读一下这个文件，然后我们从 Phase 1 开始写代码。

SPEC.md 是这次讨论的全部结晶——1600行，从技术约束、目录结构、Token体系、组件规范、用户流程、配置保存到实施计划全在里面。Claude 读完就能接手，不需要你重复解释任何背景。

Phase 1 的初始任务是这5个文件：

┌──────────────────────────────────────────┬────────────────┐
│                   文件                   │      说明      │
├──────────────────────────────────────────┼────────────────┤
│ ui-lib/design-tokens/tokens.css          │ 3套风格CSS变量 │
├──────────────────────────────────────────┼────────────────┤
│ ui-lib/design-tokens/preview.html        │ Token可视化    │
├──────────────────────────────────────────┼────────────────┤
│ ui-lib/components/kpi-card/index.html    │ 第一个范例组件 │
├──────────────────────────────────────────┼────────────────┤
│ ui-lib/components/kpi-card/template.html │ AI参考片段     │
├──────────────────────────────────────────┼────────────────┤
│ ui-lib/components/kpi-card/component.js  │ Vue组件        │
├──────────────────────────────────────────┼────────────────┤
│ ui-lib/COMPONENT_SPEC.md                 │ 组件规范文档   │
└──────────────────────────────────────────┴────────────────┘

先用 kpi-card 把流程走通，再复制模板做 info-card 验证可复用性，然后铺量。

❯ 用了下组件库，应该是为了满足既能单独打开又可以集成到总览页，1，除了基础组件图表、板式、风格其他页面会有重复，且这些页面切换风格的功能智能在独立页面能用，在集成页面点了没反应，能解决下吗，如果麻烦的话，应该是不需要考虑每个组件、图表能单独页面显示了，2，每个组件、板式页面底部有个复制代码功能，再加上一个复制该组件信息的按钮，里面有组件路径，配置等信息，用于用户在其他微调修改时能直接让ai找到组件并做修改，复制代码可能会让提示词过多

修改点：
1，版式部分：1，内容不要写具体的数字和标题，都用假数据或占位符数据写，主要是把框架搭好，容器尺寸的样式固定好，内容给用户自由发挥，明确A4横版板式，内容不可溢出和滚动；2，ppt slide的不要用点击底部圆点跳转，去掉，改为显示的翻页，上一页、下一页，保留键盘翻页
