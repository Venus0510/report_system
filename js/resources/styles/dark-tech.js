/**
 * 暗黑科技 风格定义
 */
const STYLE_DARK_TECH = {
  id: 'dark-tech',
  name: '暗黑科技',
  description: '科技感强，适合技术方案和数据密集型报告。深色背景+霓虹强调色。',
  colorChips: ['#0f172a', '#1e293b', '#f5f7fb', '#6ea8ff'],
  colors: {
    primary: '#0f172a', primaryLight: '#1e293b',
    bg: '#0b1020', bgCard: 'rgba(255,255,255,0.08)',
    text: '#f5f7fb', textMuted: '#aeb7cc',
    accent: '#6ea8ff', border: 'rgba(255,255,255,0.14)'
  },
  previewHTML: `<div class="rounded-xl overflow-hidden shadow-xl mx-auto" style="max-width:260px;pointer-events:none;background:linear-gradient(180deg,#08101f 0%,#0b1020 46%,#0f172a 100%);border:1px solid rgba(255,255,255,0.1);">
    <div class="p-4 border-b border-white/5" style="backdrop-filter:blur(18px);">
      <div class="text-sm font-bold" style="color:#f5f7fb;">估值咨询服务</div>
      <div class="text-xs mt-1" style="color:#aeb7cc;">Landing Page</div>
    </div>
    <div class="p-3 space-y-2">
      <div class="rounded-lg p-3" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);">
        <div class="text-xs font-semibold" style="color:#6ea8ff;">核心亮点</div>
        <div class="text-xs mt-1" style="color:#aeb7cc;">头部股份行本地部署验证，日均估值XX万笔</div>
      </div>
      <div class="flex gap-2">
        <div class="flex-1 rounded-lg p-2 text-center" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);">
          <div class="text-base font-bold" style="color:#6ea8ff;">800亿+</div>
          <div class="text-[10px]" style="color:#aeb7cc;">资产规模</div>
        </div>
        <div class="flex-1 rounded-lg p-2 text-center" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);">
          <div class="text-base font-bold" style="color:#9ee8c8;">4小时</div>
          <div class="text-[10px]" style="color:#aeb7cc;">估值耗时</div>
        </div>
      </div>
    </div>
  </div>`,
  aiPrompt: `【风格约束 - 暗黑科技】
- 深色背景渐变：radial-gradient 点光源效果 + linear-gradient 深色调（从 #08101f → #0b1020 → #0f172a）
- 卡片：半透明毛玻璃效果（bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl），有轻微发光阴影
- 主色科技蓝 #6ea8ff：用于标题、关键数字高亮、图表主色、强调元素
- 强调亮绿 #9ee8c8：用于正向数据标识、增长标签、CTA 按钮
- 文字：主标题 text-white | 正文 text-slate-100 | 辅助 text-slate-400`
};
