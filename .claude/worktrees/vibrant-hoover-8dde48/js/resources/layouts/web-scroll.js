/**
 * 自由滚动网页 版式定义
 */
const LAYOUT_WEB_SCROLL = {
  id: 'web-scroll',
  name: '自由滚动网页',
  category: 'web',
  icon: '🌐',
  description: '响应式长页面，桌面多列/手机单列自适应。适合Landing Page和在线展示。',
  previewHTML: `<div class="border-2 border-gray-300 rounded-lg shadow-md overflow-hidden mx-auto" style="width:200px;height:130px;pointer-events:none;">
    <div class="h-full flex flex-col" style="background:linear-gradient(180deg,#08101f 0%,#0b1020 46%,#0f172a 100%);color:#f5f7fb;">
      <div class="flex justify-between items-center px-2 py-1.5 border-b border-white/10" style="backdrop-filter:blur(18px);">
        <div class="h-1.5 w-8 bg-white/30 rounded"></div>
        <div class="flex gap-1.5">
          <div class="h-1 w-4 bg-white/20 rounded"></div>
          <div class="h-1 w-4 bg-white/20 rounded"></div>
        </div>
      </div>
      <div class="flex-1 p-2 space-y-1.5">
        <div class="h-2 bg-white/20 rounded w-2/3"></div>
        <div class="h-1.5 bg-white/10 rounded w-full"></div>
        <div class="flex gap-1 mt-1">
          <div class="flex-1 bg-white/10 rounded p-1">
            <div class="h-1 bg-blue-400/40 rounded w-1/2 mb-0.5"></div>
            <div class="h-0.5 bg-white/10 rounded w-full"></div>
          </div>
          <div class="flex-1 bg-white/10 rounded p-1">
            <div class="h-1 bg-green-400/40 rounded w-1/2 mb-0.5"></div>
            <div class="h-0.5 bg-white/10 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  aiPrompt: `【版式约束 - 自由滚动网页】
- 单页长滚动布局，无分页概念
- 顶部 sticky 导航栏（backdrop-filter: blur()，半透明背景）
- 内容最大宽度 max-w-7xl（~1280px），居中显示（mx-auto）
- 多个 section 纵向排列，section 之间留白充足（py-16 或 py-24）
- 每个 section 内可嵌套 grid 布局（桌面3-4列，平板2列，手机1列）
- 响应式：使用 Tailwind 响应式前缀（md: lg: xl:）处理断点`,
  configLabels: {
    addButton: '+ 添加区块',
    nameLabel: '区块名称',
    outlineLabel: '内容大纲（这个区块大概要展示什么）',
    itemLabel: '区块',
    globalOutline: false
  }
};
