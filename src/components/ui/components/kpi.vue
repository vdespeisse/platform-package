<style>
.kpi { position: relative;display: flex;align-items: center;justify-content: space-between;min-width: 240px;min-height: fit-content;padding: 12px;background: white;border: 4px solid transparent;border-radius: var(--border-radius);box-shadow: var(--box-shadow);transition: var(--transition); }
.kpi * { line-height: 1.25!important; }
.kpi .column:first-child { flex: 1;margin-right: 8px; }
.kpi .column > .value:first-child { color: var(--primary);min-height: 25px; }
.kpi .column > :first-child,
.kpi .column > :first-child .number { font-size: 20px; }
.kpi .column > :nth-child(n + 2),
.kpi .value:nth-child(n + 2) .number { color: var(--inactive);font: var(--p1); }
.kpi .title { overflow: hidden;min-width: 100%;max-width: 140px;text-overflow: ellipsis;white-space: pre; }
.kpi .value { text-align: right; }
.kpi.border { border-top: 16px solid var(--primary); }
.kpi.expandable:hover { cursor: pointer;border-color: var(--highlight); }
.kpi.expand { z-index: 1; }
.kpi.expand .plus svg { transform: rotate(-90deg); }
.kpi .plus { position: absolute;top: calc(100% - 12px);left: 0;cursor: pointer;display: flex;flex-direction: column;min-height: 16px;width: 100%; }
.kpi .plus svg { align-self: center;width: 12px;height: 12px;transition: var(--transition);fill: var(--inactive);transform: rotate(90deg); }
.kpi .plus .kpi { overflow: auto;align-items: flex-start;min-height: unset;max-height: 200px;margin-bottom: -14px;padding-top: 0;border: 0; }
.kpi .plus .kpi * { color: var(--inactive)!important;font: var(--p1)!important;line-height: 1.25!important; }
.kpi .plus .kpi .column:first-child { margin: 0 0 0 -12px; }
.kpi .plus .kpi .column:last-child { margin: 0 -12px 0 0; }
.kpi .plus .kpi .column > * { padding: 4px 12px; }
.kpi .plus .kpi .column > *:nth-child(odd) { background: rgb(0, 0, 0, 0.04); }
.block .kpi { margin: 0 -16px -16px;box-shadow: none; }
.desktop4K .kpi { padding: 16px 32px; }
</style>

<template lang="pug">
.kpi(:class="{ expandable: data.length > 3, expand: expand }" @click="expand = data.length > 3 && !expand")
  .column
    .title(:class="kpi.title" v-for="kpi in data.slice(0, 3)") {{ t[kpi.title] || kpi.title }}
  .column
    .value(:class="kpi.title" v-for="kpi in data.slice(0, 3)" v-html="unit(format(kpi.title)(kpi.value))")
  .plus(v-if="data.length > 3")
    .kpi(v-if="expand")
      .column
        .title(:class="kpi.title" v-for="kpi in data.slice(3)") {{ t[kpi.title] || kpi.title }}
      .column
        .value(:class="kpi.title" v-for="kpi in data.slice(3)" v-html="unit(format(kpi.title)(kpi.value))")
    svg-icon(name="nx-chevron")
</template>

<script>
export const additions = {"props":["data"]}
export default {
  data() {
    return {
      expand: false,
    }
  },
}
</script>