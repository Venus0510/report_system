/**
 * 风格库 注册表
 * 汇总所有风格定义，暴露全局变量 STYLES 和 STYLES_BY_ID
 */
const STYLES = [
  STYLE_BUSINESS_BLUE,
  STYLE_DARK_TECH,
  STYLE_FRESH_CLEAN
];

const STYLES_BY_ID = {};
STYLES.forEach(function (s) { STYLES_BY_ID[s.id] = s; });
