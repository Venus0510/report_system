const TeamGrid = {
  name: 'TeamGrid',
  props: {
    members: { type: Array, required: true }
    // members: [{ name: String, role: String, avatar: String(姓氏), color: String }]
  },
  template: `
    <div data-cid="team-grid" class="grid grid-cols-3 gap-5">
      <div v-for="(m, i) in members" :key="i"
           class="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)] text-center">
        <div class="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold"
             :style="{background: m.color || 'var(--color-primary)'}">{{ m.avatar || m.name[0] }}</div>
        <h4 class="font-semibold text-sm" style="color:var(--color-text)">{{ m.name }}</h4>
        <p class="text-xs mt-1" style="color:var(--color-text-muted)">{{ m.role }}</p>
      </div>
    </div>
  `
};
