const InfoCard = {
  name: 'InfoCard',
  props: {
    title: { type: String, default: '' },
    content: { type: String, default: '' }
  },
  template: `
    <div data-cid="info-card" class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]">
      <h3 class="text-lg font-bold mb-3" style="color:var(--color-primary)">{{ title }}</h3>
      <p class="text-sm leading-relaxed" style="color:var(--color-text-muted)">{{ content }}</p>
    </div>
  `
};
