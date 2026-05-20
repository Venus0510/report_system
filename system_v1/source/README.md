# HTML资源库 - 金融估值团队

## 概述

本资源库从现有的4个参考HTML文件中提取可复用组件，支撑业务同事通过AI生成HTML版PPT、BI看板和网页交付物。

## 目录结构（共42个文件）

```
source/
├── README.md                    # 本说明文件
│
├── tokens/                      # CSS设计Token（4套主题）
│   ├── theme-business.css       # 清爽商务风 ← A4.html
│   ├── theme-corporate.css      # 企业蓝白风 ← ppt.html
│   ├── theme-darktech.css       # 暗色科技风 ← web.html
│   └── theme-finance.css        # 金融专业风 ← mmf_BI
│
├── layouts/                     # 版式骨架（CSS + HTML + JS）
│   ├── a4-landscape.css + .html # A4横版打印
│   ├── slides-fullscreen.css + .html  # 全屏Slide演示
│   ├── web-scrolling.css + .html      # 长滚动网页
│   ├── bi-dashboard.css + .html       # BI仪表盘
│   └── base-slides.js                 # Slide翻页JS
│
├── components/                  # 通用CSS组件（9个，独立可引用）
│   ├── card.css / table.css / tag.css
│   ├── metric-chip.css / big-number.css
│   ├── process-steps.css / button.css
│   └── footer.css / nav.css
│
├── charts/                      # 图表（3个JS封装 + 6个demo）
│   ├── chart-wrapper.js         # Chart.js通用封装
│   ├── chart-doughnut.js / chart-time-series.js
│   ├── demo-line.html           # 折线趋势图
│   ├── demo-bar.html            # 柱状对比图
│   ├── demo-scatter.html        # 散点图
│   ├── demo-histogram.html      # 直方分布图
│   ├── demo-doughnut.html       # 环形占比图
│   └── demo-boxplot.html        # 箱体偏离图
│
├── tables/                      # 表格demo（4个）
│   ├── demo-data-table.html     # 标准数据表
│   ├── demo-kpi-table.html      # KPI汇总表
│   ├── demo-compare-table.html  # 同业对比表
│   └── demo-attribution-table.html  # 归因分析表
│
├── cards/                       # 卡片demo（4个）
│   ├── demo-kpi-card.html       # KPI指标卡
│   ├── demo-overview-card.html  # 概览卡
│   ├── demo-stat-card.html      # 统计卡
│   └── demo-process-card.html   # 流程步骤卡
│
├── data/                        # 数据规范
│   ├── data-loader.js           # CSV加载器（PapaParse封装）
│   ├── data-spec.md             # 数据文件规范
│   └── blueprint-example.json   # 蓝图结构示例
│
├── prompts/                     # 🆕 结构化Prompt模板
│   ├── request-card.md          # 业务需求输入卡（Markdown模板）
│   ├── request-form.html        # 可视化填写表单（浏览器填写）
│   ├── ai-system-prompt.md      # AI系统提示词（资源库索引+生成规则）
│   └── example-request.md       # 完整填写示例（货币基金月度报告）
│
└── gallery/
    └── showcase.html            # 全量资源可视化展示页
```

## 业务流程：从需求到HTML

```
业务同事                        AI                          产出
─────────                      ────                        ────
打开 request-form.html    →
填写需求输入卡             →
点击「生成Prompt」         →
复制结果                   →
                           读取 request-card.md →
                           读取 ai-system-prompt.md →
                           加载资源库组件 →
                           加载数据文件 →
                           拼装生成HTML →
                                                      完整的.html报告
```

## 使用方式

### 方式A：可视化表单（推荐业务同事使用）

1. 浏览器打开 `prompts/request-form.html`
2. 按步骤填写报告需求（版式/风格/页面/组件/数据）
3. 点击「生成Prompt」→「复制Prompt」
4. 提交给AI，AI自动拼装生成HTML

### 方式B：手动填写Markdown模板

1. 复制 `prompts/request-card.md` 内容
2. 按模板格式填写需求
3. 连同数据文件一起提交给AI

### AI收到后的工作流程

详见 `prompts/ai-system-prompt.md`，核心步骤：
1. 解析需求卡（版式/风格/页面/数据源）
2. 加载对应资源库文件
3. 按页面顺序组装组件
4. 绑定数据到图表/表格
5. 输出单文件自包含HTML

## 来源对照

| 源文件 | 提取内容 |
|--------|----------|
| `A4.html` | 主题theme-business、A4布局、card/table/tag/big-number/process-steps/footer组件 |
| `ppt.html` | 主题theme-corporate、全屏Slide布局、button/nav组件 |
| `web.html` | 主题theme-darktech、长滚动网页布局、hero-section/stats组件 |
| `mmf_BI/money_market_fund_bi_template.html` | 主题theme-finance、BI仪表盘布局、metric-chip/环形图/时间序列图组件、CSV加载器 |

## 维护原则

- 每个CSS/JS文件独立可引用，不相互依赖
- 组件通过CSS类名使用，不强制特定HTML结构
- 主题文件只包含CSS变量定义，不包含布局规则
- 图表demo自带示例数据，可独立浏览器打开
- 后续从HTML资源衍生Vue组件时，保持API一致性
