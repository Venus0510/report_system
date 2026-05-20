/* ============================================================
 * 时间序列图（Line Chart）封装
 * 来源：mmf_BI renderExecutiveView()
 * 依赖：Chart.js + chart-wrapper.js
 * ============================================================
 *
 * 使用示例：
 *   renderTimeSeries('mainChart', {
 *     dates: ['2024-01-01', '2024-01-02', ...],
 *     mainSeries: [{ label: '七日年化', data: [2.1, 2.2, ...], color: '#0f766e', yAxisID: 'y' }],
 *     secondarySeries: [{ label: '偏离度', data: [0.01, 0.02, ...], color: '#b91c1c', yAxisID: 'y1' }],
 *     peerSeries: [{ label: '同业均值', data: [...], color: '#94a3b8', dashed: true }]
 *   });
 */

/**
 * 渲染时间序列图
 * @param {string} canvasId - canvas元素id
 * @param {object} config
 * @param {Array}  config.dates          - 日期标签数组
 * @param {Array}  config.mainSeries     - 主轴系列 [{ label, data, color, yAxisID }]
 * @param {Array}  config.secondarySeries- 副轴系列 [{ label, data, color, yAxisID }]
 * @param {Array}  config.peerSeries     - 对比系列（虚线）[{ label, data, color }]
 * @param {string} config.mainYLabel     - 主轴标签
 * @param {string} config.secondaryYLabel- 副轴标签
 * @param {Array}  config.baselines      - 基准线 [{ value, color, dashed }]
 */
function renderTimeSeries(canvasId, config) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var datasets = [];

  // 对比系列（虚线）
  if (config.peerSeries) {
    config.peerSeries.forEach(function(s) {
      datasets.push({
        label: s.label,
        data: s.data,
        borderColor: s.color || FINANCE_COLORS.gray,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [5, 3],
        pointRadius: 0,
        tension: 0.3,
        yAxisID: s.yAxisID || 'y',
        order: 10
      });
    });
  }

  // 主轴系列
  if (config.mainSeries) {
    config.mainSeries.forEach(function(s) {
      datasets.push({
        label: s.label,
        data: s.data,
        borderColor: s.color || FINANCE_COLORS.brand,
        backgroundColor: 'transparent',
        borderWidth: 2.2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: s.color || FINANCE_COLORS.brand,
        tension: 0.25,
        yAxisID: s.yAxisID || 'y',
        order: 1
      });
    });
  }

  // 副轴系列
  if (config.secondarySeries) {
    config.secondarySeries.forEach(function(s) {
      datasets.push({
        label: s.label,
        data: s.data,
        borderColor: s.color || FINANCE_COLORS.red,
        backgroundColor: 'transparent',
        borderWidth: 1.8,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.25,
        yAxisID: s.yAxisID || 'y1',
        order: 2
      });
    });
  }

  var scales = {
    x: {
      type: 'time',
      time: {
        unit: 'day',
        displayFormats: { day: 'MM-dd' },
        tooltipFormat: 'yyyy-MM-dd'
      },
      grid: { display: false },
      ticks: { maxTicksLimit: 12, color: FINANCE_COLORS.gray, font: { size: 10 } }
    },
    y: {
      type: 'linear',
      position: 'left',
      title: {
        display: !!config.mainYLabel,
        text: config.mainYLabel || '',
        color: FINANCE_COLORS.gray
      },
      grid: { color: 'rgba(226,232,240,0.6)' },
      ticks: { color: FINANCE_COLORS.ink, font: { size: 10 }, callback: formatPercent }
    }
  };

  // 副轴
  if (config.secondarySeries && config.secondarySeries.length > 0) {
    scales.y1 = {
      type: 'linear',
      position: 'right',
      title: {
        display: !!config.secondaryYLabel,
        text: config.secondaryYLabel || '',
        color: FINANCE_COLORS.gray
      },
      grid: { drawOnChartArea: false },
      ticks: { color: FINANCE_COLORS.red, font: { size: 10 }, callback: formatBps }
    };
  }

  // 基准线
  var annotations = {};
  if (config.baselines && config.baselines.length > 0) {
    annotations = {};
    config.baselines.forEach(function(line, i) {
      annotations['baseline' + i] = {
        type: 'line',
        yMin: line.value,
        yMax: line.value,
        borderColor: line.color || '#94a3b8',
        borderWidth: line.dashed ? 1.5 : 1,
        borderDash: line.dashed ? [4, 4] : undefined,
        yScaleID: line.yScaleID || 'y1'
      };
    });
  }

  var chartConfig = {
    type: 'line',
    data: {
      labels: config.dates,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { size: 11 }
          }
        },
        tooltip: {
          mode: 'index'
        }
      },
      scales: scales
    }
  };

  // 如果有基准线注释，需引入 chartjs-plugin-annotation
  // 简化版：通过插件配置
  if (Object.keys(annotations).length > 0) {
    chartConfig.plugins.annotation = { annotations: annotations };
  }

  createChart(canvasId, ctx, chartConfig);
}

// 格式化工具
function formatPercent(value) {
  if (value == null) return '';
  return value.toFixed(2) + '%';
}

function formatBps(value) {
  if (value == null) return '';
  return (value * 100).toFixed(1) + 'bp';
}
