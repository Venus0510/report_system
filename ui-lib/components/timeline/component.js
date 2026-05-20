const Timeline = {
  name: 'Timeline',
  props: {
    items: { type: Array, required: true }
    // items: [{ date: String, title: String, description: String, dotColor: String, tagColor: String }]
  },
  template: `
    <div data-cid="timeline" class="flex flex-col gap-0 pl-4" style="border-left: 2px solid var(--color-primary-light)">
      <div v-for="(item, i) in items" :key="i"
           class="relative -left-[calc(1rem+5px)]" :class="{'pb-8': i < items.length - 1}">
        <div class="w-3 h-3 rounded-full absolute top-1.5" :style="{background: item.dotColor || 'var(--color-primary)'}"></div>
        <div class="ml-8">
          <span class="text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2"
                :style="{color: item.tagColor || 'var(--color-primary)', background: 'var(--color-primary-light)'}">{{ item.date }}</span>
          <h4 class="font-semibold text-sm" style="color:var(--color-text)">{{ item.title }}</h4>
          <p class="text-xs mt-1" style="color:var(--color-text-muted)">{{ item.description }}</p>
        </div>
      </div>
    </div>
  `
};
