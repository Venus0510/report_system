const BarChart = {
  name: 'BarChart',
  props: {
    data: { type: Array, required: true },
    // data: [{ name: String, value: Number }]
    title: { type: String, default: '' },
    xField: { type: String, default: 'name' },
    yField: { type: String, default: 'value' },
    height: { type: Number, default: 400 }
  },
  template: `
    <div data-cid="bar-chart" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]">
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
      if (!this.chartRef) return;
      this.chart = echarts.init(this.chartRef);
      this.chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: this.data.map(d => d[this.xField]),
          axisLabel: { color: 'var(--color-text-muted)' }
        },
        yAxis: { type: 'value', axisLabel: { color: 'var(--color-text-muted)' } },
        series: [{
          type: 'bar',
          data: this.data.map(d => d[this.yField]),
          itemStyle: { color: 'var(--color-primary)', borderRadius: [6, 6, 0, 0] },
          barWidth: '50%'
        }]
      });
    }
  }
};
