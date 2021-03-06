<style>
.pie { display: flex;flex-wrap: wrap;align-items: center;justify-content: space-evenly; }
.pie path { cursor: pointer;fill: var(--primary); }
.pie .pie-inner { position: relative;width: 320px; }
.pie .pie-inner svg { width: unset;height: unset; }
.pie circle { pointer-events: none;fill: none;stroke: white;stroke-width: 2px; }
.pie .center { position: absolute;top: 0;right: 0;bottom: 0;left: 0;pointer-events: none;display: flex;flex-direction: column;align-items: center;justify-content: center;width: 100%;height: 100%; }
.pie .center .value .number { font-size: 32px;line-height: 1; }
.pie .center .value .unit { font-size: 24px;line-height: 1; }
.pie .center .label { text-transform: uppercase;line-height: 1; }
.pie .legend { display: flex;flex-direction: column;min-width: 280px;padding-left: 20px; }
.pie .legend .color { width: 20px;height: 20px;margin-right: 8px;background: var(--primary);border-radius: var(--border-radius); }
.pie .legend .value { margin-left: auto;padding-left: 16px; }
.pie .legend .row { cursor: pointer;padding: 4px 8px;border-radius: var(--border-radius); }
.pie .legend .row.hover { background: rgb(255, 221, 68, 0.5); }
.pie .legend .row:not(.active) { color: var(--inactive); }
.pie :matches(path:nth-child(2n), :nth-child(2n) > .color) { opacity: 0.8; }
.pie :matches(path:nth-child(3n), :nth-child(3n) > .color) { opacity: 0.6; }
.pie :matches(path:nth-child(4n), :nth-child(4n) > .color) { opacity: 0.4; }
.pie :matches(path:nth-child(5n), :nth-child(5n) > .color) { opacity: 0.2; }
.cat :matches(path:nth-child(n), :nth-child(n) > .color) { background: var(--cat1);fill: var(--cat1); }
.cat :matches(path:nth-child(2n), :nth-child(2n) > .color) { background: var(--cat2);fill: var(--cat2); }
.cat :matches(path:nth-child(3n), :nth-child(3n) > .color) { background: var(--cat3);fill: var(--cat3); }
.cat :matches(path:nth-child(4n), :nth-child(4n) > .color) { background: var(--cat4);fill: var(--cat4); }
.cat :matches(path:nth-child(5n), :nth-child(5n) > .color) { background: var(--cat5);fill: var(--cat5); }
.cat :matches(path:nth-child(6n), :nth-child(6n) > .color) { background: var(--cat6);fill: var(--cat6); }
.cat :matches(path:nth-child(7n), :nth-child(7n) > .color) { background: var(--cat7);fill: var(--cat7); }
.cat :matches(path:nth-child(8n), :nth-child(8n) > .color) { background: var(--cat8);fill: var(--cat8); }
.cat :matches(path:nth-child(9n), :nth-child(9n) > .color) { background: var(--cat9);fill: var(--cat9); }
.cat :matches(path:nth-child(10n), :nth-child(10n) > .color) { background: var(--cat10);fill: var(--cat10); }
.pdf .pie { flex-direction: column; }
.pdf .pie .center { display: none; }
.pdf .pie .pie-inner { width: 100px;margin: 10px; }
.pdf .pie .legend { min-width: unset;padding: 0;margin: 0; }
.pdf .pie .legend .row { padding: 0; }
.pdf .pie .legend .row .color { width: 1em;height: 1em;border-radius: 2px; }
.pdf .row > .block.block-pie { min-width: 150px;max-width: fit-content;margin: 8px auto!important; }
</style>

<template lang="pug">
.pie
  .pie-inner
    svg(viewBox="-100 -100 200 200")
      path(:d="arc.arc" :class="k" @click="update_filter(dimension_, k)" @mouseenter="hover = k" @mouseleave="hover = null" v-for="arc, k in arcs")
      circle(r="65")
  .legend
    .row(:class="[k, { hover: hover === k, active: !$root.filters[dimension_] || $root.filters[dimension_].includes(k), null: v === 0 }]" @click="update_filter(dimension_, k)" @mouseenter="hover = k" @mouseleave="hover = null" v-for="v in sorted")
      .color
      .label {{ t[v.key] || v.key }}
      .value {{ format(format_)(v.value) }}
</template>

<script>
export const additions = {}
export default {
  props: ['data', 'metadata'],
  data() {
    const m = this.metadata || {}
    const options = {
      dimension_: '',
      hover: null,
    }
    return options.map((v, k) => m[k.slice(0, -1)] || v)
  },
  computed: {
    data_(){
      return this.data.map(d => typeof d === 'object' ? (d.fund || d.v()[0]) : d)
    },
    format_() {
      if (this.metadata && this.metadata.format && this.metadata.format.fund) return this.metadata.format.fund
      return this.metadata && this.metadata.format || '.0%'
    },
    total() {
      return this.data_.v().sum()
    },
    sorted() {
      return this.data_.reduce((acc, v, k) => {acc.push({key:k, value:v});return acc},[])
        .filter(d => d.value > 0.0001 || d.value < -0.0001)
        .sort(this.metadata.sort || (d => -d.value))
    },
    arcs() {
      return this.sorted.map((v, i, ds) => {
        const active = !$root.filters[this.dimension_] || $root.filters[this.dimension_].includes(k)
        const prev = ds
          .slice(0, i)
          .sum('value')
        const next = prev + v.value
        v['arc'] = d3.arc()({
          innerRadius: active ? 60 : 70,
          outerRadius: 90,
          startAngle: (2 * Math.PI * prev) / this.total,
          endAngle: (2 * Math.PI * next) / this.total,
        })
        return v
      })
    },
  },
}
</script>
