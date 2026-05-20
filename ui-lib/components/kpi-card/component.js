const KpiCard = {
  name: 'KpiCard',
  props: {
    label: { type: String, default: '' },
    value: { type: Number, required: true },
    unit: { type: String, default: '%' },
    trend: { type: String, default: '' }
  },
  template: `
    <div data-cid="kpi-card" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-3 shadow-[var(--shadow-card)]">
      <span v-if="trend" class="text-xs font-semibold px-3 py-1 rounded-full w-fit" :style="{color:'var(--color-primary)',background:'var(--color-primary-light)'}">{{ trend }}</span>
      <div class="text-5xl font-bold" :style="{color:'var(--color-primary)'}">{{ value }}<span class="text-lg font-normal" :style="{color:'var(--color-text-muted)'}">{{ unit }}</span></div>
      <p class="text-sm" :style="{color:'var(--color-text-muted)'}">{{ label }}</p>
    </div>
  `
};
