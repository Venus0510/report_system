const CompareCard = {
  name: 'CompareCard',
  props: {
    left: { type: Object, required: true },
    // left: { title: String, color: String, items: [{ label: String, value: String, highlight: Boolean }] }
    right: { type: Object, required: true },
    // right: 同上
    leftColor: { type: String, default: 'var(--color-primary)' },
    rightColor: { type: String, default: 'var(--color-accent)' }
  },
  template: `
    <div data-cid="compare-card" class="grid grid-cols-2 gap-0 rounded-[var(--radius-lg)] overflow-hidden border shadow-[var(--shadow-card)]" style="border-color:var(--color-border)">
      <div class="p-6" style="background:var(--color-bg-card)">
        <h4 class="font-bold text-sm mb-4 pb-2 border-b-2" :style="{color: leftColor, borderColor: leftColor}">{{ left.title }}</h4>
        <div v-for="(item, i) in left.items" :key="i"
             class="flex justify-between py-2 text-sm" :class="{'border-b': i < left.items.length - 1}" style="border-color:var(--color-border)">
          <span style="color:var(--color-text-muted)">{{ item.label }}</span>
          <span class="font-mono font-semibold" :style="{color: item.highlight ? leftColor : 'var(--color-text)'}">{{ item.value }}</span>
        </div>
      </div>
      <div class="p-6" style="background:var(--color-primary-light);opacity:0.6">
        <h4 class="font-bold text-sm mb-4 pb-2 border-b-2" :style="{color: rightColor, borderColor: rightColor}">{{ right.title }}</h4>
        <div v-for="(item, i) in right.items" :key="i"
             class="flex justify-between py-2 text-sm" :class="{'border-b': i < right.items.length - 1}" style="border-color:var(--color-border)">
          <span style="color:var(--color-text-muted)">{{ item.label }}</span>
          <span class="font-mono font-semibold" :style="{color: item.highlight ? rightColor : 'var(--color-text)'}">{{ item.value }}</span>
        </div>
      </div>
    </div>
  `
};
