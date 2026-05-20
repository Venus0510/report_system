/**
 * 组件：团队介绍网格
 */
const COMPONENT_TEAM_GRID = {
  id: 'team-grid',
  name: '团队介绍网格',
  category: '信息展示',
  description: '2-4列头像卡片网格，展示团队成员',
  previewHTML: `<div style="pointer-events:none;max-width:320px;margin:0 auto;">
  <div class="grid grid-cols-3 gap-3">
    <div class="bg-white rounded-xl shadow p-3 text-center">
      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mx-auto mb-1">张</div>
      <h4 class="font-bold text-gray-900 text-xs">项目负责人</h4>
      <p class="text-[10px] text-gray-400 mt-0.5">质量把控</p>
    </div>
    <div class="bg-white rounded-xl shadow p-3 text-center">
      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mx-auto mb-1">李</div>
      <h4 class="font-bold text-gray-900 text-xs">金融工程</h4>
      <p class="text-[10px] text-gray-400 mt-0.5">模型测算</p>
    </div>
    <div class="bg-white rounded-xl shadow p-3 text-center">
      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mx-auto mb-1">王</div>
      <h4 class="font-bold text-gray-900 text-xs">行业高管</h4>
      <p class="text-[10px] text-gray-400 mt-0.5">策略解读</p>
    </div>
  </div>
</div>`,
  htmlSnippet: `<div data-cid="team-grid" class="grid grid-cols-4 gap-6">
  <div class="bg-white rounded-2xl shadow-lg p-6 text-center">
    <div class="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold mx-auto mb-3">张</div>
    <h4 class="font-bold text-gray-900 text-sm">项目负责人</h4>
    <p class="text-xs text-gray-500 mt-1">负责整体服务质量、客户沟通及关键结论审核</p>
  </div>
  <div class="bg-white rounded-2xl shadow-lg p-6 text-center">
    <div class="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold mx-auto mb-3">李</div>
    <h4 class="font-bold text-gray-900 text-sm">金融工程团队</h4>
    <p class="text-xs text-gray-500 mt-1">负责收益归因模型、杠杆测算及数据处理逻辑</p>
  </div>
</div>`,
  vueTemplate: `<template>
  <div data-cid="team-grid" class="grid grid-cols-4 gap-6">
    <div v-for="member in members" :key="member.name" class="bg-white rounded-2xl shadow-lg p-6 text-center">
      <div class="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold mx-auto mb-3">{{ member.avatar }}</div>
      <h4 class="font-bold text-gray-900 text-sm">{{ member.name }}</h4>
      <p class="text-xs text-gray-500 mt-1">{{ member.role }}</p>
    </div>
  </div>
</template>`
};
