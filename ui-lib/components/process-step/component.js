const ProcessStep = {
  name: 'ProcessStep',
  props: {
    steps: { type: Array, required: true }
    // steps: [{ title: String, description: String }]
  },
  template: `
    <div data-cid="process-step" class="flex flex-col gap-0">
      <div v-for="(step, i) in steps" :key="i"
           class="flex items-start gap-4 relative" :class="{'pb-6': i < steps.length - 1}">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 relative z-10" style="background:var(--color-primary)">{{ i + 1 }}</div>
        <div class="flex-1 pt-1">
          <h4 class="font-semibold text-sm" style="color:var(--color-text)">{{ step.title }}</h4>
          <p class="text-xs mt-1" style="color:var(--color-text-muted)">{{ step.description }}</p>
        </div>
      </div>
    </div>
  `
};
