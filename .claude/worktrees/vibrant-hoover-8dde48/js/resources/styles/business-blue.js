/**
 * 商务蓝白 风格定义
 */
const STYLE_BUSINESS_BLUE = {
  id: 'business-blue',
  name: '商务蓝白',
  description: '正式稳重，适合高管汇报和客户交付。金融行业经典配色。',
  colorChips: ['#1e3a8a', '#f8fafc', '#1f2937', '#2563eb'],
  colors: {
    primary: '#1e3a8a', primaryLight: '#dbeafe',
    bg: '#f8fafc', bgCard: '#ffffff',
    text: '#1f2937', textMuted: '#64748b',
    accent: '#2563eb', border: '#e5e7eb'
  },
  // 所见即所得风格预览卡片（用真实内容 + 风格配色渲染）
  previewHTML: `<div class="rounded-xl overflow-hidden shadow-lg mx-auto" style="max-width:260px;pointer-events:none;background:#f8fafc;border:1px solid #e5e7eb;">
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a8a);padding:16px 18px;color:white;">
      <div class="text-sm font-bold" style="color:white;">货币基金月度收益归因</div>
      <div class="text-xs mt-1" style="color:#93c5fd;">服务方案</div>
    </div>
    <div class="p-3 space-y-2">
      <div class="bg-white rounded-lg shadow p-3">
        <div class="text-xs font-semibold" style="color:#1e3a8a;">收益来源拆解</div>
        <div class="text-xs mt-1" style="color:#64748b;">识别票息、杠杆、久期等因素</div>
      </div>
      <div class="bg-white rounded-lg shadow p-3">
        <div class="text-xs font-semibold" style="color:#1e3a8a;">同类表现定位</div>
        <div class="text-xs mt-1" style="color:#64748b;">结合竞品基金，判断收益相对位置</div>
      </div>
    </div>
  </div>`,
  aiPrompt: `【风格约束 - 商务蓝白】
- 整体背景：白底浅蓝灰调（bg-gray-50），干净通透
- 卡片：白色圆角卡片（bg-white rounded-2xl shadow-lg p-6），有轻微投影
- 主色深蓝 #1e3a8a：用于页面标题、章节标题、关键数字、左侧强调色条
- 强调亮蓝 #2563eb：用于标签（tag）、图表主色、hover 状态
- 文字层级：主标题 text-gray-900 font-bold | 正文 text-gray-700 | 辅助 text-gray-500 | 页脚 text-gray-400
- 数据展示：大数字用 text-blue-900 font-bold，正增长用 text-green-600，负增长用 text-red-500
- 表格：表头 bg-blue-50 text-blue-900 font-bold，行间 bg-white 隔行加 bg-gray-50/50`
};
