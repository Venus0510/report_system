/* ============================================================
 * Chart.js 通用封装
 * 来源：mmf_BI/money_market_fund_bi_template.html
 * 依赖：Chart.js (CDN: https://cdn.jsdelivr.net/npm/chart.js)
 * ============================================================
 *
 * 使用方式：
 *   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
 *   <script src="charts/chart-wrapper.js"></script>
 */

// ===== 全局Chart实例管理 =====
window.__chartInstances = window.__chartInstances || {};

/**
 * 安全销毁chart实例
 * @param {string} id - canvas的id
 */
function destroyChart(id) {
  const inst = window.__chartInstances[id];
  if (inst) {
    inst.destroy();
    delete window.__chartInstances[id];
  }
}

/**
 * 创建Chart实例并记录
 * @param {string} id - canvas的id
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} config - Chart.js配置
 * @returns {Chart}
 */
function createChart(id, ctx, config) {
  destroyChart(id);
  const chart = new Chart(ctx, config);
  window.__chartInstances[id] = chart;
  return chart;
}

/**
 * 销毁所有chart实例
 */
function destroyAllCharts() {
  Object.keys(window.__chartInstances).forEach(function(id) {
    destroyChart(id);
  });
}

// ===== 通用Chart.js配置预设 =====

/**
 * 金融图表默认字体配置
 */
const FINANCE_FONT = {
  family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif",
  size: 11
};

/**
 * 金融主题颜色调色板
 */
const FINANCE_COLORS = {
  brand:     '#0f766e',
  brandSoft: '#ccfbf1',
  blue:      '#3b82f6',
  blueSoft:  '#dbeafe',
  green:     '#16a34a',
  greenSoft: '#dcfce7',
  amber:     '#d97706',
  amberSoft: '#fef3c7',
  red:       '#b91c1c',
  redSoft:   '#fee2e2',
  purple:    '#7c3aed',
  gray:      '#94a3b8',
  graySoft:  '#f1f5f9',
  ink:       '#18202a'
};

/**
 * 扩展颜色调色板（图表多系列时使用）
 */
const FINANCE_PALETTE = [
  '#0f766e', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#10b981', '#0ea5e9', '#f97316', '#a855f7',
  '#14b8a6', '#6366f1', '#eab308', '#ec4899'
];

/**
 * Chart.js全局默认配置（金融风格）
 */
function applyFinanceDefaults() {
  if (Chart.defaults) {
    Chart.defaults.font.family = FINANCE_FONT.family;
    Chart.defaults.font.size = FINANCE_FONT.size;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15,23,42,0.92)';
    Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold' };
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 10;
  }
}

/**
 * 获取canvas 2d上下文
 * @param {string} canvasId
 * @returns {CanvasRenderingContext2D}
 */
function getChartContext(canvasId) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error('Canvas not found: ' + canvasId);
    return null;
  }
  return canvas.getContext('2d');
}
