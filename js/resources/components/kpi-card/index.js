/**
 * 组件：KPI 数字卡片
 */
const COMPONENT_KPI_CARD = {
  id: 'kpi-card',
  name: 'KPI 数字卡片',
  category: '数据展示',
  description: '展示单个关键指标数值，含标签和变化趋势',
  // 所见即所得的组件预览（真实渲染，非骨架）
  previewHTML: `<div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 max-w-[200px] mx-auto" style="pointer-events:none;">
  <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">环比 +12.5%</span>
  <div class="text-4xl font-bold text-blue-900">3.28<span class="text-lg text-gray-400 font-normal">%</span></div>
  <p class="text-sm text-gray-500">七日年化收益率</p>
</div>`,
  // AI 参考代码片段
  htmlSnippet: `<div data-cid="kpi-card" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
  <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">环比 +12.5%</span>
  <div class="text-5xl font-bold text-blue-900">3.28<span class="text-lg text-gray-400 font-normal ml-1">%</span></div>
  <p class="text-sm text-gray-500">七日年化收益率（当月均值）</p>
</div>`,
  vueTemplate: `<template>
  <div data-cid="kpi-card" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
    <span v-if="tag" class="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">{{ tag }}</span>
    <div class="text-5xl font-bold text-blue-900">
      {{ value }}<span v-if="unit" class="text-lg text-gray-400 font-normal ml-1">{{ unit }}</span>
    </div>
    <p v-if="label" class="text-sm text-gray-500">{{ label }}</p>
  </div>
</template>`
};
