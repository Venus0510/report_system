/**
 * 组件：流程步骤条
 */
const COMPONENT_PROCESS_STEP = {
  id: 'process-step',
  name: '流程步骤条',
  category: '流程展示',
  description: '带编号的流程步骤，蓝色左边框强调',
  previewHTML: `<div style="pointer-events:none;max-width:280px;margin:0 auto;">
  <div class="border-l-4 border-blue-600 bg-white rounded-r-2xl shadow-md p-4 mb-2">
    <h3 class="text-sm font-bold text-blue-900 mb-1">1. 数据收集与清洗</h3>
    <p class="text-xs text-gray-600 leading-relaxed">获取组合持仓及市场利率数据，完成自动化清洗与口径统一。</p>
  </div>
  <div class="border-l-4 border-blue-400 bg-white rounded-r-2xl shadow-sm p-4 mb-2 opacity-70">
    <h3 class="text-sm font-bold text-blue-900 mb-1">2. 归因测算与复核</h3>
    <p class="text-xs text-gray-500 leading-relaxed">完成五维度收益归因测算，对异常波动进行复核。</p>
  </div>
  <div class="border-l-4 border-blue-300 bg-white rounded-r-2xl shadow-sm p-4 opacity-50">
    <h3 class="text-sm font-bold text-blue-900 mb-1">3. 报告撰写与交付</h3>
    <p class="text-xs text-gray-500 leading-relaxed">形成月度归因报告初稿并提炼核心结论。</p>
  </div>
</div>`,
  htmlSnippet: `<div data-cid="process-step" class="border-l-4 border-blue-600 bg-white rounded-r-2xl shadow-md p-5 mb-3">
  <h3 class="text-base font-bold text-blue-900 mb-1">1. 数据收集与清洗</h3>
  <p class="text-sm text-gray-600 leading-relaxed">获取组合持仓、收益表现、规模变化及市场利率数据，完成自动化清洗与口径统一。</p>
</div>`,
  vueTemplate: `<template>
  <div data-cid="process-step" class="border-l-4 border-blue-600 bg-white rounded-r-2xl shadow-md p-5 mb-3">
    <h3 class="text-base font-bold text-blue-900 mb-1">{{ step }}. {{ title }}</h3>
    <p class="text-sm text-gray-600 leading-relaxed">{{ description }}</p>
  </div>
</template>`
};
