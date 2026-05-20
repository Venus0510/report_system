/**
 * 清新简约 风格定义
 */
const STYLE_FRESH_CLEAN = {
  id: 'fresh-clean',
  name: '清新简约',
  description: '轻量舒适，适合培训材料和内部报告。绿色调，视觉放松。',
  colorChips: ['#30b08f', '#f0fdf4', '#1f2937', '#10b981'],
  colors: {
    primary: '#30b08f', primaryLight: '#d1fae5',
    bg: '#f0fdf4', bgCard: '#ffffff',
    text: '#1f2937', textMuted: '#6b7280',
    accent: '#10b981', border: '#d1fae5'
  },
  previewHTML: `<div class="rounded-xl overflow-hidden shadow-sm mx-auto" style="max-width:260px;pointer-events:none;background:#f0fdf4;border:1px solid #d1fae5;">
    <div class="p-4 border-b border-green-100" style="background:white;">
      <div class="text-sm font-bold" style="color:#1f2937;">估值方法论培训</div>
      <div class="text-xs mt-1" style="color:#6b7280;">五大资产类别 · 基础篇</div>
    </div>
    <div class="p-3 space-y-2">
      <div class="bg-white rounded-lg shadow-sm p-3 border border-green-50">
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style="background:#30b08f;">1</span>
          <span class="text-xs font-semibold" style="color:#1f2937;">非上市股权估值</span>
        </div>
        <div class="text-xs mt-1 ml-6" style="color:#6b7280;">市场法、收益法、净资产法</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-3 border border-green-50">
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style="background:#30b08f;">2</span>
          <span class="text-xs font-semibold" style="color:#1f2937;">上市项目估值</span>
        </div>
        <div class="text-xs mt-1 ml-6" style="color:#6b7280;">市价法、限售股折扣模型</div>
      </div>
    </div>
  </div>`,
  aiPrompt: `【风格约束 - 清新简约】
- 整体背景：浅绿白调（bg-green-50/30），视觉柔和放松
- 卡片：白色圆角卡片（bg-white rounded-xl shadow-sm p-5），阴影很轻（shadow-sm），border border-green-100
- 主色翠绿 #30b08f：用于标题、分隔线、步骤编号
- 强调亮绿 #10b981：用于标签、链接、图表 accent 色
- 文字：深灰 #1f2937（标题、正文），辅助 #6b7280
- 风格关键词：清新、现代、简洁、培训、轻量`
};
