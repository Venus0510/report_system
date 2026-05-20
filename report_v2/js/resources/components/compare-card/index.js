/**
 * 组件：对比卡片
 */
const COMPONENT_COMPARE_CARD = {
  id: 'compare-card',
  name: '对比卡片',
  category: '对比分析',
  description: '左右双栏对比展示（改造前/后）',
  previewHTML: `<div style="pointer-events:none;max-width:300px;margin:0 auto;">
  <div class="grid grid-cols-2 gap-3">
    <div class="bg-white rounded-xl shadow p-3 border border-gray-100">
      <h4 class="text-xs font-semibold text-gray-400 uppercase mb-2">改造前</h4>
      <p class="text-xs text-gray-600 leading-relaxed">人工Excel多版本，5人/2周</p>
    </div>
    <div class="bg-blue-50 rounded-xl shadow p-3 border border-blue-100">
      <h4 class="text-xs font-semibold text-blue-600 uppercase mb-2">改造后</h4>
      <p class="text-xs text-gray-700 leading-relaxed">系统统一模型库，1人/4小时</p>
    </div>
  </div>
</div>`,
  htmlSnippet: `<div data-cid="compare-card" class="grid grid-cols-2 gap-4">
  <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">改造前</h4>
    <p class="text-sm text-gray-600 leading-relaxed">人工Excel多版本维护，5人/2周完成一轮估值，版本一致性难以保证。</p>
  </div>
  <div class="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-100">
    <h4 class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">改造后</h4>
    <p class="text-sm text-gray-700 leading-relaxed">系统统一模型库，1人/4小时完成全量估值，差异归因自动化。</p>
  </div>
</div>`,
  vueTemplate: `<template>
  <div data-cid="compare-card" class="grid grid-cols-2 gap-4">
    <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">{{ leftTitle }}</h4>
      <p class="text-sm text-gray-600 leading-relaxed">{{ leftContent }}</p>
    </div>
    <div class="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-100">
      <h4 class="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">{{ rightTitle }}</h4>
      <p class="text-sm text-gray-700 leading-relaxed">{{ rightContent }}</p>
    </div>
  </div>
</template>`
};
