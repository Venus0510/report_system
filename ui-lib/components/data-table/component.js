const DataTable = {
  name: 'DataTable',
  props: {
    headers: { type: Array, required: true },
    // headers: [{ key: String, label: String, align: String }]
    rows: { type: Array, required: true }
    // rows: [{ col_key: value, ... }]
  },
  template: `
    <div data-cid="data-table" class="overflow-x-auto rounded-[var(--radius-lg)] border shadow-[var(--shadow-card)]" style="border-color:var(--color-border)">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr style="background:var(--color-primary)">
            <th v-for="h in headers" :key="h.key"
                :class="[h.align === 'right' ? 'text-right' : 'text-left', 'p-4 font-semibold text-white']">
              {{ h.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in rows" :key="ri"
              :style="{background: ri % 2 === 0 ? 'var(--color-bg-card)' : 'var(--color-primary-light)', opacity: ri % 2 === 0 ? 1 : 0.5}">
            <td v-for="h in headers" :key="h.key"
                :class="[h.align === 'right' ? 'text-right font-mono' : 'font-medium', 'p-4']"
                :style="{color: h.key === headers[0].key ? 'var(--color-text)' : 'var(--color-text)'}">
              {{ row[h.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
};
