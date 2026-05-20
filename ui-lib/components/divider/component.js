const Divider = {
  name: 'Divider',
  props: {
    text: { type: String, default: '● ● ●' }
  },
  template: `
    <div data-cid="divider" class="flex items-center gap-4 my-6">
      <div class="flex-1 h-px" style="background:var(--color-border)"></div>
      <span v-if="text" class="text-xs font-medium shrink-0" style="color:var(--color-text-muted)">{{ text }}</span>
      <div class="flex-1 h-px" style="background:var(--color-border)"></div>
    </div>
  `
};
