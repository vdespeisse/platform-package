<style>

</style>

<template lang="pug">
.nav-top-tabs.tabs
  .tab(:class='{ active: (index === 0 && !$root.query.metric) || $root.query.metric === tab, [tab]: true }', @click='update_query({ metric: index !== 0 && tab })', v-for="tab, index in ['fund', 'benchmark', 'diff']", v-if='!$root.config.tabs && $root.userflow && $root.userflow.name')
    div
      | {{ t[tab !== 'fund' ? (tab !== 'benchmark' ? 'compare' : $root.benchmark) : $root.userflow.name] || ((tab !== 'fund' ? tab !== 'benchmark' ? 'compare' : String($root.benchmark) : $root.userflow.name) || '').titleize() }}
    div {{ t[tab] || tab.titleize() }}
  .tab(:class='{ active: (index === 0 && !$root.query.tab) || $root.query.tab === tab }', @click='update_query({ tab: index === 0 ? null : tab })', v-for='tab, index in $root.config.tabs', v-if='$root.config.tabs') {{ t[tab] || tab.titleize() }}
</template>

<script>
export const additions = {}
export default {}
</script>