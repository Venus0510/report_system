/**
 * 组件：信息卡片
 */
const COMPONENT_INFO_CARD = {
  id: 'info-card',
  name: '信息卡片',
  category: '内容展示',
  description: '标题+正文的标准信息展示卡片',
  previewHTML: `<div class="bg-white rounded-2xl shadow-lg p-5 max-w-[220px] mx-auto" style="pointer-events:none;">
  <h3 class="text-base font-bold text-gray-900 mb-2">收益来源拆解</h3>
  <p class="text-xs text-gray-600 leading-relaxed">识别票息、杠杆、久期、交易等因素对产品收益的贡献比例，锁定核心收益驱动因子。</p>
</div>`,
  htmlSnippet: `<div data-cid="info-card" class="bg-white rounded-2xl shadow-lg p-6">
  <h3 class="text-lg font-bold text-gray-900 mb-3">收益来源拆解</h3>
  <p class="text-sm text-gray-600 leading-relaxed">识别票息、杠杆、久期、交易/骑乘、费用调整等因素对产品收益的贡献比例，锁定核心收益驱动因子。</p>
</div>`,
  vueTemplate: `<template>
  <div data-cid="info-card" class="bg-white rounded-2xl shadow-lg p-6">
    <h3 class="text-lg font-bold text-gray-900 mb-3">{{ title }}</h3>
    <p class="text-sm text-gray-600 leading-relaxed">{{ content }}</p>
  </div>
</template>`
};
