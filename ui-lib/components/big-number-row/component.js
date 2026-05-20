const BigNumberRow = {
  name: 'BigNumberRow',
  props: {
    items: { type: Array, required: true }
    // items: [{ value: Number, unit: String, label: String, color: String }]
    // color 可选，默认使用 --color-primary
  },
  template: `
    <div data-cid="big-number-row" class="flex gap-6 flex-wrap">
      <div v-for="(item, i) in items" :key="i"
           class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)] flex flex-col items-center min-w-[140px] flex-1">
        <div class="text-4xl font-bold" :style="{color: item.color || 'var(--color-primary)'}">
          {{ item.value }}<span class="text-base font-normal ml-1" style="color:var(--color-text-muted)">{{ item.unit }}</span>
        </div>
        <p class="text-xs mt-2 font-medium" style="color:var(--color-text-muted)">{{ item.label }}</p>
      </div>
    </div>
  `
};
