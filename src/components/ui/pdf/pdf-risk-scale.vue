<style>
.risk-scale .num { display: flex;place-items: center;place-content: center;width: 28px;height: 28px;background: #C0E3EE;font-size: 10px;font-weight: 600; }
.risk-scale .num.active { background: var(--primary);color: white; }
.risk-scale svg { width: 100%; }
.risk-scale .performance div:first-child { flex: 1; }
.risk-scale .performance div:nth-child(2) { flex: 1;text-align: right; }
.risk-scale .row { flex-wrap: nowrap; }
</style>

<template lang="pug">
.risk-scale
  .row.between
    .num(:class="{ active: i === ($root.share.risk_scale || $root.userflow.risk_scale) }" v-for="i in 7") {{ i }}
  .row.between
    div {{ $root.t['risk_lower'] }}
    div {{ $root.t['risk_higher'] }}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 403 12" fill="#2A4371"><path d="M0 6L10 11.7735V0.226497L0 6ZM403 6L393 0.226497V11.7735L403 6ZM9 7H394V5H9V7Z"/></svg>
  .row.between.performance
    div {{ $root.t['performance_lower'] }}
    div {{ $root.t['performance_higher'] }}
</template>

<script>
export const additions = {}
export default {}
</script>