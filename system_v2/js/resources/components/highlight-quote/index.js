/**
 * 组件：亮点引用
 */
const COMPONENT_HIGHLIGHT_QUOTE = {
  id: 'highlight-quote',
  name: '亮点引用',
  category: '信息展示',
  description: '带左侧色条的引用文字块，适合强调金句和数据亮点',
  previewHTML: `<div style="pointer-events:none;max-width:300px;margin:0 auto;">
  <div class="border-l-4 border-blue-600 pl-4 py-1">
    <p class="text-sm text-gray-800 leading-relaxed font-medium">"同一中台，一套参数，一次配置，覆盖五大资产类别。"</p>
    <p class="text-xs text-gray-400 mt-1">—— 头部股份行全量生产验证结论</p>
  </div>
</div>`,
  htmlSnippet: `<div data-cid="highlight-quote" class="border-l-4 border-blue-600 pl-5 py-2 my-4">
  <p class="text-base text-gray-800 leading-relaxed font-medium">"同一中台，一套参数，一次配置，覆盖五大资产类别估值需求，将估值耗时从5人/2周压缩至1人/4小时。"</p>
  <p class="text-xs text-gray-400 mt-2">—— 某头部股份行全量生产验证结论</p>
</div>`,
  vueTemplate: `<template>
  <div data-cid="highlight-quote" class="border-l-4 border-blue-600 pl-5 py-2 my-4">
    <p class="text-base text-gray-800 leading-relaxed font-medium">"{{ quote }}"</p>
    <p v-if="source" class="text-xs text-gray-400 mt-2">—— {{ source }}</p>
  </div>
</template>`
};
