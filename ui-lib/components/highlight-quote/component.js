const HighlightQuote = {
  name: 'HighlightQuote',
  props: {
    quote: { type: String, default: '' },
    author: { type: String, default: '' }
  },
  template: `
    <div data-cid="highlight-quote" class="bg-[var(--color-primary-light)] border-l-4 rounded-r-[var(--radius-md)] p-6" style="border-color:var(--color-primary)">
      <blockquote class="text-lg leading-relaxed italic mb-3" style="color:var(--color-primary)">{{ quote }}</blockquote>
      <cite v-if="author" class="text-sm font-medium not-italic" style="color:var(--color-text-muted)">{{ author }}</cite>
    </div>
  `
};
