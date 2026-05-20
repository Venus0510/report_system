/**
 * PPT Slide 翻页 版式定义
 */
const LAYOUT_PPT_SLIDE = {
  id: 'ppt-slide',
  name: 'PPT Slide 翻页',
  category: 'slide',
  icon: '📽️',
  description: '全屏Slide式演示，键盘/点击翻页。适合培训和汇报展示，像真实PPT。',
  previewHTML: `<div class="bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden mx-auto" style="width:200px;aspect-ratio:16/9;pointer-events:none;">
    <div class="h-full flex flex-col p-3 relative" style="background:linear-gradient(180deg,#eef2f6,#ffffff);">
      <div class="text-[8px] font-bold text-gray-800">估值政策培训</div>
      <div class="flex-1 flex flex-col justify-center px-1">
        <div class="h-1 w-12 bg-gray-300 rounded mb-1.5"></div>
        <div class="h-1 w-full bg-gray-200 rounded mb-0.5"></div>
        <div class="h-1 w-5/6 bg-gray-200 rounded mb-2"></div>
        <div class="grid grid-cols-2 gap-1 mt-1">
          <div class="bg-white rounded p-1 shadow-sm border border-gray-100">
            <div class="h-1 bg-gray-200 rounded w-2/3 mb-0.5"></div>
            <div class="h-0.5 bg-gray-100 rounded w-full"></div>
          </div>
          <div class="bg-white rounded p-1 shadow-sm border border-gray-100">
            <div class="h-1 bg-gray-200 rounded w-2/3 mb-0.5"></div>
            <div class="h-0.5 bg-gray-100 rounded w-full"></div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-2 right-2 flex items-center gap-1">
        <span class="text-[6px] text-gray-400 bg-white/80 px-1 rounded-full">3/12</span>
        <span class="h-1.5 w-1.5 bg-blue-600 rounded-full"></span>
        <span class="h-1.5 w-1.5 bg-gray-300 rounded-full"></span>
      </div>
    </div>
  </div>`,
  aiPrompt: `【版式约束 - PPT Slide翻页】
- 最外层容器 .deck { position:relative; width:100vw; height:100vh; overflow:hidden; background:#fff; }
- 每页 .page { position:absolute; inset:0; visibility:hidden; opacity:0; transition:opacity 0.22s ease; }
- 当前页 .page.active { visibility:visible; opacity:1; }
- 右下角固定导航按钮（圆角药丸形状），点击切换上下页
- 左下角固定页码指示器（如 3/12）`,
  configLabels: {
    addButton: '+ 添加一节',
    nameLabel: '节名称',
    outlineLabel: '内容要点（这一节要讲什么）',
    itemLabel: '节',
    globalOutline: true
  }
};
