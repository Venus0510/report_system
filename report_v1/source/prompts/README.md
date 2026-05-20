# 提示词模板 — 使用说明

## 完整交互流程

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ① 业务同事                     ② AI（Claude / 通用）        │
│  ─────────────                  ──────────────────────       │
│                                                              │
│  浏览器打开                     ┌─ Claude Code模式 ─┐        │
│  request-form.html         →    │ 直接粘贴Prompt     │        │
│  点点选选填需求                  │ AI自动读取         │        │
│  点击「生成Prompt」              │ source/ 下所有文件  │        │
│  点击「复制Prompt」              │ 拼装生成HTML       │        │
│                          →      └───────────────────┘        │
│                          →      ┌─ 通用AI模式 ──────┐        │
│                                  │ 粘贴Prompt        │        │
│                                  │ + 附带的文件内容   │        │
│                                  │ (CSS/JS 关键文件) │        │
│                                  │ 拼装生成HTML      │        │
│                                  └───────────────────┘        │
│                                         │                    │
│                                         ▼                    │
│                              ③ 产出：完整 .html 文件          │
│                                 浏览器打开即可查看            │
│                                 Ctrl+P 打印为PDF              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 两种AI交互模式

### 模式一：Claude Code（推荐，最简单）

**前提**：AI可以读取当前项目的本地文件。

**操作步骤**：
1. 用浏览器打开 `source/prompts/request-form.html`
2. 填写需求 → 点击 **「生成Prompt」**
3. 复制生成的Prompt文本
4. 粘贴到 Claude Code 对话中
5. AI自动读取 `source/` 下的资源库文件，拼装生成HTML

**为什么简单**：因为AI能直接读取 `source/layouts/`、`source/tokens/`、`source/components/` 下的所有文件，Prompt里只需要告诉AI"用哪个文件"即可，不需要手动粘贴CSS/JS内容。

### 模式二：通用AI对话（ChatGPT、文心一言等）

**前提**：AI无法读取本地文件，需要手动附带内容。

**操作步骤**：
1. 用浏览器打开 `source/prompts/request-form.html`
2. 填写需求 → 点击 **「生成Prompt」**
3. 复制生成的Prompt文本
4. 打开Prompt中「📎 需要附带的文件」所列的文件，将内容复制到Prompt中对应位置
5. 将完整内容粘贴到AI对话中
6. AI根据内联的CSS/JS内容生成HTML

**注意**：通用模式下需要手动把几个关键CSS/JS文件内容贴进去。所需文件列表已在Prompt顶部自动生成。

## 数据文件放在哪里？

演示用的示例CSV文件在：
```
source/data/
├── fund_info.csv              # 基金基本信息（10条）
├── target_time_series.csv     # 目标基金日频数据（31天）
├── peers_time_series.csv      # 同业均值日频数据（31天）
├── df_assets.csv              # 资产配置数据
└── df_bond.csv                # 债券类型数据
```

这些文件对标 `mmf_BI/data/` 的真实结构，已精简为英文字段名方便使用。

**生成的HTML和CSV的相对关系**：
- 如果HTML放在项目根目录：数据路径 = `source/data/xxx.csv`
- 如果HTML放在 source/ 下：数据路径 = `data/xxx.csv`

## 演示路径（明天会议）

### 方案A：打开即用（30秒演示）

1. 打开 `source/prompts/request-form.html`
2. 表单已预填完整（5页 + 4个数据文件）
3. 点击 **「生成Prompt」**
4. 点击 **「复制Prompt」**
5. 粘贴到AI对话中
6. 解释：业务同事只需要做1-4步，AI自动完成剩下的

### 方案B：手工填写演示

1. 打开空白表单
2. 现场选择一个版式+一个风格
3. 添加一页（选一个图表）
4. 生成Prompt
5. 展示生成的Prompt内容
6. 解释Prompt里的「📎 需要附带的文件」部分

## 文件速查

| 要用什么 | 打开哪个 |
|---------|---------|
| 可视化填需求 | `prompts/request-form.html` |
| Markdown模板 | `prompts/request-card.md` |
| AI怎么拼装 | `prompts/ai-system-prompt.md` |
| 填写示例 | `prompts/example-request.md` |
| 完整资源展示 | `gallery/showcase.html` |
| 示例CSV数据 | `data/*.csv`（5个文件） |
