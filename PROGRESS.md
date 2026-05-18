# 项目进度看板

> 状态：⬜ 未开始 | 🔄 进行中 | ✅ 已完成 | ⏸️ 暂缓

---

## Phase 1：基础设施 ✅

| 状态 | 文件 | 说明 |
|------|------|------|
| ✅ | `server.py` | Python 本地文件服务 |
| ✅ | `start.command` | 双击启动脚本 |
| ✅ | `index.html` | 入口文件，Vue 应用壳 + CDN + 全部页面模板 |
| ✅ | `css/app.css` | 工具 UI 定制样式 |
| ✅ | `js/utils.js` | 公共工具函数 |

## Phase 2：资源库数据 ✅

| 状态 | 文件 | 说明 |
|------|------|------|
| ✅ | `js/resources/layouts/a4-landscape.js` | A4 横版版式定义 |
| ✅ | `js/resources/layouts/ppt-slide.js` | PPT Slide 版式定义 |
| ✅ | `js/resources/layouts/web-scroll.js` | 自由滚动网页版式定义 |
| ✅ | `js/resources/layouts/index.js` | 版式注册表 |
| ✅ | `js/resources/styles/business-blue.js` | 商务蓝白风格定义 |
| ✅ | `js/resources/styles/dark-tech.js` | 暗黑科技风格定义 |
| ✅ | `js/resources/styles/fresh-clean.js` | 清新简约风格定义 |
| ✅ | `js/resources/styles/index.js` | 风格注册表 |
| ✅ | `js/resources/components/kpi-card/index.js` | KPI 数字卡片 |
| ✅ | `js/resources/components/info-card/index.js` | 信息卡片 |
| ✅ | `js/resources/components/process-step/index.js` | 流程步骤条 |
| ✅ | `js/resources/components/data-table/index.js` | 数据表格 |
| ✅ | `js/resources/components/compare-card/index.js` | 对比卡片 |
| ✅ | `js/resources/components/team-grid/index.js` | 团队介绍网格 |
| ✅ | `js/resources/components/highlight-quote/index.js` | 亮点引用 |
| ✅ | `js/resources/components/big-number-row/index.js` | 大数字行 |
| ✅ | `js/resources/components/index.js` | 组件注册表 |

## Phase 3：展示页面 ✅

| 状态 | 文件 | 说明 |
|------|------|------|
| ✅ | `js/pages/layouts-gallery.js` | 版式库展示页 |
| ✅ | `js/pages/styles-gallery.js` | 风格库展示页 |
| ✅ | `js/pages/components-gallery.js` | 组件库展示页 |

## Phase 4：功能页面 ✅

| 状态 | 文件 | 说明 |
|------|------|------|
| ✅ | `js/pages/prompt-page.js` | 提示词生成页（5步表单） |
| ✅ | `js/pages/preview-page.js` | 预览/版本/检查器/修改 |
| ✅ | `js/pages/export-page.js` | 导出下载 |

## Phase 5：主应用组装 ✅

| 状态 | 文件 | 说明 |
|------|------|------|
| ✅ | `js/app.js` | Vue 初始化 + 全局状态 + 路由 + 侧边栏导航 |

## Phase 6：测试验证 🔄

| 状态 | 事项 | 说明 |
|------|------|------|
| ⬜ | 启动测试 | 双击 start.command → 浏览器打开 |
| ⬜ | 资源库展示 | 三库页面显示正常，缩略图/色块/代码可见 |
| ⬜ | 提示词生成 | 选A4/PPT/Web三种版式，表单交互正确 |
| ⬜ | 预览检查器 | iframe渲染、hover高亮、click定位 |
| ⬜ | 版本管理 | 版本列表加载、切换、保存 |
| ⬜ | 导出 | HTML下载、PDF打印 |

---

## 完成记录

| 日期 | Phase | 文件 | 备注 |
|------|-------|------|------|
| 2026-05-16 | Phase 1 | server.py, start.command, utils.js, app.css, index.html | 基础设施搭建 |
| 2026-05-16 | Phase 2 | layouts(4), styles(4), components(9) | 全部资源库数据 |
| 2026-05-16 | Phase 3 | layouts-gallery, styles-gallery, components-gallery | 展示页面 |
| 2026-05-16 | Phase 4 | prompt-page, preview-page, export-page | 功能页面 |
| 2026-05-16 | Phase 5 | app.js, index.html(模板填充) | 主应用组装完成 |
| | | | |

---

## 已知待改进项（非阻塞）

1. **CodeMirror 编辑器** — 当前使用 textarea，后续可升级为 CodeMirror 6 获得语法高亮
2. **ECharts 图表预览** — 当前 iframe 预览可以渲染 ECharts（CDN引用），但工具本身未集成图表编辑
3. **配置快照自动保存** — `_config.json` 的自动保存逻辑待实现
4. **Windows 支持** — 需要添加 `start.bat` 启动脚本
