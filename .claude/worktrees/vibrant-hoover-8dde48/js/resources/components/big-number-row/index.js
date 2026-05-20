/**
 * 组件：大数字行
 */
const COMPONENT_BIG_NUMBER_ROW = {
  id: 'big-number-row',
  name: '大数字行',
  category: '数据展示',
  description: '一行3-4个并列的大数字指标',
  previewHTML: `<div style="pointer-events:none;max-width:320px;margin:0 auto;">
  <div class="flex justify-around text-center py-4">
    <div class="flex flex-col items-center gap-1">
      <div class="text-3xl font-bold text-blue-900">800<span class="text-base text-gray-400 font-normal">亿+</span></div>
      <p class="text-xs text-gray-500">管理资产规模</p>
    </div>
    <div class="flex flex-col items-center gap-1">
      <div class="text-3xl font-bold text-blue-900">4<span class="text-base text-gray-400 font-normal">小时</span></div>
      <p class="text-xs text-gray-500">全量估值耗时</p>
    </div>
    <div class="flex flex-col items-center gap-1">
      <div class="text-3xl font-bold text-blue-900">120<span class="text-base text-gray-400 font-normal">+</span></div>
      <p class="text-xs text-gray-500">覆盖底层产品数</p>
    </div>
  </div>
</div>`,
  htmlSnippet: `<div data-cid="big-number-row" class="flex justify-around text-center py-8">
  <div class="flex flex-col items-center gap-2">
    <div class="text-5xl font-bold text-blue-900">800<span class="text-xl text-gray-400 font-normal">亿+</span></div>
    <p class="text-sm text-gray-500">管理资产规模</p>
  </div>
  <div class="flex flex-col items-center gap-2">
    <div class="text-5xl font-bold text-blue-900">4<span class="text-xl text-gray-400 font-normal">小时</span></div>
    <p class="text-sm text-gray-500">全量估值耗时</p>
  </div>
  <div class="flex flex-col items-center gap-2">
    <div class="text-5xl font-bold text-blue-900">120<span class="text-xl text-gray-400 font-normal">+</span></div>
    <p class="text-sm text-gray-500">覆盖底层产品数</p>
  </div>
</div>`,
  vueTemplate: `<template>
  <div data-cid="big-number-row" class="flex justify-around text-center py-8">
    <div v-for="item in items" :key="item.label" class="flex flex-col items-center gap-2">
      <div class="text-5xl font-bold text-blue-900">{{ item.value }}<span v-if="item.unit" class="text-xl text-gray-400 font-normal">{{ item.unit }}</span></div>
      <p class="text-sm text-gray-500">{{ item.label }}</p>
    </div>
  </div>
</template>`
};
