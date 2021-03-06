<style>
.bar-chart .row { align-items: center; }
.bar-chart .key { flex: 2;display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 1;overflow: hidden;text-align: right; }
.bar-chart .column { flex: 1;padding: 2px 5em 2px 1em; }
.bar-chart .rect { position: relative;width: var(--value);height: calc(var(--size) * 1em);line-height: calc(var(--size) * 1em);margin: 1px 0 1px var(--offset);background: var(--primary);border-radius: 2px; }
.bar-chart .value { position: absolute;right: -4px;transform: translate(100%); }
.bar-chart .column .value:nth-child(2) { right: 30px; }
</style>

<template lang="pug">
.bar-chart(:style="{ '--size': (data.v().length > 8 ? .5 : 1) * (data.v().find(v => typeof v !== 'number' && v.keys().length > 1) ? 0.5 : 1) * 2  }")
  .row.legend
    .div(:class="legend" v-for="legend in (data.v().filter(d => d.keys().length >=2).v().first() || {}).keys()" v-if="typeof data.v().first() !== 'number' && data.v().filter(d => d.keys().length >=2).v().length > 1")
      .color
      .label {{ t[legend] || legend }}
  .row(v-for="v, k in data.filter(d => ( (typeof d === 'number' && d) || (d.v().unique().filter(x => x !=0 ).length))).filter()")
    .key(:class="k") {{ t[k] || k }}
    .column(v-if="!options.direction || options.direction==='column'")
      .rect(:class="k" :style="{ '--value': Math.abs(60 * v / diff) + '%', '--offset': Math.abs(60 * (Math.min(0, v) - min) / diff) + '%' }" v-if="typeof v === 'number'")
        .value {{ format(format_)(v) }}
      .rect(:class="k" :style="{ '--value': Math.abs(60 * v / diff) + '%', '--offset': Math.abs(60 * (Math.min(0, v) - min) / diff) + '%' }" v-for="v, k in v" v-else)
        .value(v-if="v") {{ format(format_)(v) }}
    .column(v-else)
        .rect(:class="k" :style="{ '--value': Math.abs(60 * v / diff) + '%', '--offset': Math.abs(60 * (Math.min(0, v) - min) / diff) + '%' }" v-if="typeof v === 'number'")
          .value {{ format(format_)(v) }}
        .rect.row(:class="k" :style="{ '--value': Math.abs(60 * v.v()[0] / diff) + '%', '--offset': Math.abs(60 * (Math.min(0, v.v()[0]) - min) / diff) + '%' }" v-else)
        .value(v-for="v, k in v") {{ format(options && options.format && (options.format[k] || options.format) || '.2%')(v) }}
</template>

<script>
export const additions = {"props":["data","options"]}
export default {
  data() {
    return { min: null, max: null, diff: null }
  },
  computed: {
    format_(){
      if (this.options && this.options.format && typeof this.options.format !== 'object') return this.options.format // format: .2%
      if (this.options && this.options.format) return this.options.format.v().first() // format: {fund: .2% }
      return '.2%'
    },
  },
  created() {
    this.$watch('data', data => {
      const traverse = x => ({
        Object: x => x.v().map(traverse),
      }[Object.prototype.toString.call(x).slice(8, -1)] || (x => x))(x)
      const list = traverse(this.data.filter()).flat(Infinity).filter()
      this.min = Math.min(0, list.min())
      this.max = list.max()
      this.diff = this.max - this.min
    }, { immediate: true })
  }
}
</script>