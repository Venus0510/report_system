/**
 * A4 横版分页 版式定义
 */
const LAYOUT_A4_LANDSCAPE = {
  id: 'a4-landscape',
  name: 'A4 横版分页',
  category: 'print',
  icon: '📄',
  description: 'A4横向多页，打印友好。每页一张纸，像精装报告书，适合正式交付和归档。',
  // 所见即所得的版式预览（Tailwind 微缩模型）
  previewHTML: `<div class="bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden mx-auto" style="width:200px;aspect-ratio:1.414/1;pointer-events:none;">
    <div class="h-full flex flex-col p-2.5 gap-1.5" style="background:linear-gradient(135deg,#0f172a,#1e3a8a);color:white;">
      <div class="text-[8px] font-bold leading-tight">估值中台系统</div>
      <div class="text-[6px] opacity-80">服务方案</div>
      <div class="flex-1 grid grid-cols-3 gap-1 mt-1">
        <div class="bg-white/90 rounded p-1.5 flex flex-col gap-0.5">
          <div class="h-1 w-4 bg-blue-200 rounded"></div>
          <div class="h-2 bg-gray-200 rounded"></div>
          <div class="h-1.5 bg-gray-100 rounded w-3/4"></div>
        </div>
        <div class="bg-white/90 rounded p-1.5 flex flex-col gap-0.5">
          <div class="h-1 w-4 bg-blue-200 rounded"></div>
          <div class="h-2 bg-gray-200 rounded"></div>
          <div class="h-1.5 bg-gray-100 rounded w-3/4"></div>
        </div>
        <div class="bg-white/90 rounded p-1.5 flex flex-col gap-0.5">
          <div class="h-1 w-4 bg-blue-200 rounded"></div>
          <div class="h-2 bg-gray-200 rounded"></div>
          <div class="h-1.5 bg-gray-100 rounded w-3/4"></div>
        </div>
      </div>
      <div class="flex justify-between text-[5px] opacity-60 mt-auto">
        <span>服务背景与客户需求</span><span>02</span>
      </div>
    </div>
  </div>`,
  aiPrompt: `【版式约束 - A4横版分页】
- 每个页面使用 <section class="page">，固定宽度 297mm（约1122px），高度 210mm（约793px）
- CSS 中必须设置 @page { size: A4 landscape; margin: 0; }
- 每页设置 page-break-after: always，最后一页除外（page-break-after: auto）
- 内容安全区 padding: 18mm 22mm
- 每个页面底部有固定位置的页脚，显示页面标题（左）和页码（右），字体大小 12px，颜色 text-gray-400
- 屏幕浏览时页面居中显示，有浅灰背景和阴影；打印时精确按 A4 分页`,
  configLabels: {
    addButton: '+ 添加一页',
    nameLabel: '页名称',
    outlineLabel: '内容大纲（这一页大概要写什么）',
    itemLabel: '页',
    globalOutline: false
  }
};
