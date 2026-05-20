/* ============================================================
 * 环形图（Doughnut）封装
 * 来源：mmf_BI renderDoughnutChart / renderRingLegend
 * 依赖：Chart.js + chart-wrapper.js
 * ============================================================
 *
 * 使用示例：
 *   renderDoughnutChart('myCanvas', [
 *     { label: '存款', value: 45.2, color: '#0f766e' },
 *     { label: '债券', value: 32.8, color: '#3b82f6' }
 *   ], '资产配置', 'legendContainer');
 */

/**
 * 渲染环形图
 * @param {string} canvasId       - canvas元素的id
 * @param {Array}  items          - [{ label, value, color }]
 * @param {string} titleText      - 图表标题
 * @param {string} legendId       - 图例容器id
 * @param {object} options        - 可选配置
 * @param {Array}  options.peerItems - 对比数据 [{ label, value, color }]
 */
function renderDoughnutChart(canvasId, items, titleText, legendId, options) {
  options = options || {};
  var peerItems = options.peerItems || [];

  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  // 按value降序排列
  var sorted = items.slice().sort(function(a, b) { return b.value - a.value; });
  var labels = sorted.map(function(d) { return d.label; });
  var values = sorted.map(function(d) { return d.value; });
  var colors = sorted.map(function(d) { return d.color; });

  var datasets = [{
    data: values,
    backgroundColor: colors,
    borderColor: '#ffffff',
    borderWidth: 2.5,
    borderRadius: 4,
    hoverBorderWidth: 3
  }];

  // 如果有peer对比数据，绘制为灰色内环
  if (peerItems.length > 0) {
    var peerColors = peerItems.map(function(_, i) {
      return 'rgba(148,163,184,' + (0.28 + i * 0.04) + ')';
    });
    datasets.unshift({
      data: peerItems.map(function(d) { return d.value; }),
      backgroundColor: peerColors,
      borderColor: 'rgba(255,255,255,0.6)',
      borderWidth: 2,
      borderRadius: 3,
      weight: 0.6
    });
  }

  var config = {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              var total = ctx.dataset.data.reduce(function(a, b) { return a + b; }, 0);
              var pct = total > 0 ? (ctx.raw / total * 100).toFixed(1) : 0;
              return ctx.label + ': ' + ctx.raw.toFixed(1) + '% (' + pct + '%)';
            }
          }
        }
      }
    }
  };

  createChart(canvasId, ctx, config);

  // 渲染图例
  if (legendId) {
    var targetValues = items.map(function(d) { return d.value; });
    var targetColors = items.map(function(d) { return d.color; });
    var peerValues = peerItems.map(function(d) { return d.value; });
    var peerColors = peerItems.map(function(d) { return d.color; });
    renderRingLegend(legendId, labels, targetValues, peerValues, targetColors, peerColors, peerItems.length > 0);
  }
}

/**
 * 渲染环形图图例
 */
function renderRingLegend(legendId, labels, targetValues, peerValues, targetColors, peerColors, hasPeer, emptyMsg) {
  var container = document.getElementById(legendId);
  if (!container) return;
  container.innerHTML = '';

  if (!labels || labels.length === 0) {
    container.innerHTML = '<div style="color:var(--color-muted,#64748b);font-size:11px;padding:8px;">' + (emptyMsg || '暂无数据') + '</div>';
    return;
  }

  labels.forEach(function(label, i) {
    var row = document.createElement('div');
    row.className = 'ring-legend-row';
    row.innerHTML =
      '<span class="ring-legend-label">' +
      '<span class="ring-swatch" style="background:' + (targetColors[i] || FINANCE_PALETTE[i % FINANCE_PALETTE.length]) + ';"></span> ' +
      label +
      '</span>' +
      '<span class="ring-legend-value">' + (targetValues[i] != null ? targetValues[i].toFixed(1) + '%' : '-') + '</span>' +
      (hasPeer
        ? '<span class="ring-legend-value" style="color:var(--color-muted);font-size:10px;">' + (peerValues[i] != null ? peerValues[i].toFixed(1) + '%' : '-') + '</span>'
        : '<span></span>');
    container.appendChild(row);
  });
}
