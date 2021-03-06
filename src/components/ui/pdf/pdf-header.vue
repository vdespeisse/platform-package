<style>
.pdf .block.block-pdf-header { margin: 0; }
.pdf header { display: flex;margin: -30px -30px 0;padding: 20px 30px;border-bottom: 1px solid var(--primary);font: 400 12px/1 MarkPro;text-transform: uppercase; }
.pdf header .logo { max-width: 250px;max-height: 80px;margin-right: 30px; }
.pdf header .company { font-size: 18px; }
.pdf header .fund { font-size: 44px;font-weight: 900;text-transform: none; }
.pdf header .category { margin-top: 10px; }
.pdf-page:nth-child(n + 2) header :matches(.logo, .category, .isin) { display: none; }
.pdf-page:nth-child(n + 2) header .column { flex-direction: row;align-items: center;justify-content: flex-start; }
.pdf-page:nth-child(n + 2) header .column :nth-child(n + 2):before { content: '-';margin: 0 4px;font-weight: 400; }
.pdf-page:nth-child(n + 2) header .fund { font-size: 18px; }
</style>

<template lang="pug">
header
  img.logo(:src="$root.cssvar.logo.slice(4, -1)")
  .column.center.left.expand
    .company {{ $root.project }}
    .fund(:style="(t[$root.userflow.name] || $root.userflow.name ).length >= 20 ? ((t[$root.userflow.name] || $root.userflow.name ).length >= 30 ? 'font-size: 22px;' : 'font-size: 32px;') : ''") {{ (t[$root.userflow.name] || $root.userflow.name.titleize())  + ' ' + $root.userflow.shares[this.$route.params.userflow.split('-')[1]].share }}
  .column.center.right
    .period(v-if="$root.period[0] !== 'custom'") {{ t[$root.period[0] + '_report'] || $root.period[0] }}
    .date {{ t[$root.period[1]] || $root.period[1] }}
    .category {{ t[$root.userflow.category] || $root.userflow.category }}
    .isin {{ $root.share.share_id }}
</template>

<script>
export const additions = {}
export default {}
</script>