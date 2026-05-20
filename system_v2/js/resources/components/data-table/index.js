/**
 * 组件：数据表格
 */
const COMPONENT_DATA_TABLE = {
  id: 'data-table',
  name: '数据表格',
  category: '数据展示',
  description: '标准数据表格，蓝色表头，hover高亮行',
  previewHTML: `<div style="pointer-events:none;max-width:340px;margin:0 auto;font-size:10px;">
  <table class="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-lg">
    <thead>
      <tr>
        <th class="bg-blue-50 text-blue-900 font-bold px-3 py-2 text-left border-b border-gray-200">分析模块</th>
        <th class="bg-blue-50 text-blue-900 font-bold px-3 py-2 text-left border-b border-gray-200">主要内容</th>
        <th class="bg-blue-50 text-blue-900 font-bold px-3 py-2 text-left border-b border-gray-200">输出</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-gray-100"><td class="px-3 py-2 text-gray-700 font-medium">票息收益</td><td class="px-3 py-2 text-gray-600">资产加权收益率分析</td><td class="px-3 py-2 text-gray-900">基础来源判断</td></tr>
      <tr class="border-b border-gray-100 bg-gray-50"><td class="px-3 py-2 text-gray-700 font-medium">杠杆套息</td><td class="px-3 py-2 text-gray-600">回购成本与杠杆效果</td><td class="px-3 py-2 text-gray-900">效率评估</td></tr>
    </tbody>
  </table>
</div>`,
  htmlSnippet: `<table data-cid="data-table" class="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-lg text-sm">
  <thead>
    <tr>
      <th class="bg-blue-50 text-blue-900 font-bold px-4 py-3 text-left border-b border-gray-200">分析模块</th>
      <th class="bg-blue-50 text-blue-900 font-bold px-4 py-3 text-left border-b border-gray-200">主要内容</th>
      <th class="bg-blue-50 text-blue-900 font-bold px-4 py-3 text-left border-b border-gray-200">输出结果</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="px-4 py-3 text-gray-700 font-medium">票息收益</td>
      <td class="px-4 py-3 text-gray-600">分析同业存单、短债、存款等资产的加权收益率及收益贡献</td>
      <td class="px-4 py-3 text-gray-900">基础收益来源判断</td>
    </tr>
    <tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="px-4 py-3 text-gray-700 font-medium">杠杆套息</td>
      <td class="px-4 py-3 text-gray-600">比较资产收益率与回购融资成本，测算杠杆增强效果</td>
      <td class="px-4 py-3 text-gray-900">杠杆使用效率评估</td>
    </tr>
  </tbody>
</table>`,
  vueTemplate: `<template>
  <table data-cid="data-table" class="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-lg text-sm">
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key" class="bg-blue-50 text-blue-900 font-bold px-4 py-3 text-left border-b border-gray-200">{{ col.label }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id" class="border-b border-gray-100 hover:bg-gray-50">
        <td v-for="col in columns" :key="col.key" class="px-4 py-3" :class="col.key === columns[0].key ? 'text-gray-700 font-medium' : 'text-gray-600'">{{ row[col.key] }}</td>
      </tr>
    </tbody>
  </table>
</template>`
};
