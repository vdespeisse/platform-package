<style>
.pdf-bar { max-width: 230px;display: flex;flex-direction: column; }
.pdf-bar > div { display: flex; }
.pdf-bar .name { overflow: hidden;flex: 1;text-align: left;text-overflow: ellipsis;white-space: nowrap; }
.pdf-bar .value { width: 32px;margin-right: 2px;text-align: right; }
.pdf-bar .hbar { margin: 4px;background: var(--primary); }
.pdf-bar .value { order: 1; }
.pdf-bar .trend { order: 1;width: 32px;margin-right: 2px;text-align: right;opacity: .6; }
.pdf-bar .other { order: 1; }
</style>

<template lang="pug">
.pdf-bar
  div(:class="{ other: $root.t.other === bar.name }" v-for="bar in bars")
    .name {{ t[bar.name] || bar.name }}
    .value {{ format('.1%')(bar.value) }}
    .trend(v-if="bars.map('trend').unique().length > 1") {{ format('.1%')(bar.trend || 0) }}
    .hbar(:style="{ width: bar.width }")
</template>

<script>
export const additions = {"props":["data"]}
export default {
  computed: {
    bars() {
      const min = this.data.v().map(d => d.value.weight).min()
      const max = this.data.v().map(d => d.value.weight).max()
      const diff = Math.sign(min) === -1 ? max - min : max
      return this.data
                .map((v, k) => ({
                  name: v.name,
                  value: v.value.weight,
                  trend: v.value.trend || 0,
                  width: Math.round(Math.abs((35 * v.value.weight) / diff)) + 'px',
                  offset: Math.round(Math.abs((35 * (Math.min(0, v.value.weight) - min)) / diff)) + 'px',
                }))
    },
  },
}
</script>