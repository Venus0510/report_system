const PieChart = {
  name: 'PieChart',
  props: {
    data: { type: Array, required: true },
    // data: [{ name: String, value: Number }]
    title: { type: String, default: '' },
    nameField: { type: String, default: 'name' },
    valueField: { type: String, default: 'value' },
    height: { type: Number, default: 400 }
  },
  template: `
    <div data-cid="pie-chart" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]">
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
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: 'var(--color-text-muted)' } },
        series: [{
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['40%', '50%'],
          label: { color: 'var(--color-text-muted)' },
          data: this.data.map(d => ({ name: d[this.nameField], value: d[this.valueField] }))
        }]
      });
    }
  }
};
