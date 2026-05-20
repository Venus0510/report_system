const LineChart = {
  name: 'LineChart',
  props: {
    data: { type: Array, required: true },
    // data: [{ name: String, values: [{ x, y }] }]  多系列
    // 或直接 [{ x, y }] 单系列
    title: { type: String, default: '' },
    xField: { type: String, default: 'x' },
    yField: { type: String, default: 'y' },
    height: { type: Number, default: 400 },
    colors: { type: Array, default: () => ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)'] }
  },
  template: `
    <div data-cid="line-chart" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]">
      <h3 v-if="title" class="text-base font-semibold mb-4" style="color:var(--color-text)">{{ title }}</h3>
      <div :ref="el => chartRef = el" :style="{width:'100%',height:height+'px'}"></div>
    </div>
  `,
  data() {
    return { chartRef: null, chart: null };
  },
  mounted() {
    this.initChart();
  },
  beforeUnmount() {
    if (this.chart) this.chart.dispose();
  },
  methods: {
    initChart() {
      if (!this.chartRef || !this.data.length) return;
      this.chart = echarts.init(this.chartRef);
      const isMultiSeries = this.data[0] && Array.isArray(this.data[0].values);
      const series = isMultiSeries
        ? this.data.map((s, i) => ({
            name: s.name,
            type: 'line',
            data: s.values.map(v => v[this.yField]),
            smooth: true,
            lineStyle: { color: this.colors[i] || this.colors[0] },
            itemStyle: { color: this.colors[i] || this.colors[0] }
          }))
        : [{
            type: 'line',
            data: this.data.map(d => d[this.yField]),
            smooth: true,
            lineStyle: { color: this.colors[0] },
            itemStyle: { color: this.colors[0] }
          }];
      const xData = isMultiSeries
        ? this.data[0].values.map(v => v[this.xField])
        : this.data.map(d => d[this.xField]);
      this.chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: isMultiSeries ? { data: this.data.map(s => s.name), textStyle: { color: 'var(--color-text-muted)' }, top: 0 } : undefined,
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: xData, axisLabel: { color: 'var(--color-text-muted)' } },
        yAxis: { type: 'value', axisLabel: { color: 'var(--color-text-muted)' } },
        series
      });
    }
  }
};
