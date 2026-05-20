const SectionHeader = {
  name: 'SectionHeader',
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    accentWidth: { type: String, default: 'w-16' }
  },
  template: `
    <div data-cid="section-header" class="mb-6">
      <h2 class="text-2xl font-bold" style="color:var(--color-primary)">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm mt-2" style="color:var(--color-text-muted)">{{ subtitle }}</p>
      <div class="mt-3 h-1 rounded-full" :class="accentWidth" style="background:var(--color-accent)"></div>
    </div>
  `
};
