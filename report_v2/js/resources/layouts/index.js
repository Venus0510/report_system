/**
 * 版式库 注册表
 * 汇总所有版式定义，暴露全局变量 LAYOUTS 和 LAYOUTS_BY_ID
 */
const LAYOUTS = [
  LAYOUT_A4_LANDSCAPE,
  LAYOUT_PPT_SLIDE,
  LAYOUT_WEB_SCROLL
];

const LAYOUTS_BY_ID = {};
LAYOUTS.forEach(function (l) { LAYOUTS_BY_ID[l.id] = l; });
