<style>
.investment-period .num { display: flex;place-items: center;place-content: center;flex: 1;background: #C0E3EE;font-size: 10px;font-weight: 600;line-height: 2;border: 1px solid rgb(0, 0, 0, .1);margin: -1px; }
.investment-period .num.active { background: var(--primary);border-color: var(--primary);color: white; }
.investment-period .num.active:before { content: ">"; }
.investment-period.row > :first-child { font-weight: 600; }
.investment-period.row > :nth-child(2) { padding: 0 0 0 4px; }
</style>

<template lang="pug">
.investment-period.row(v-if="$root.userflow.horizon.match('[0-9]{2}/[0-9]{2}/[0-9]{4}')")
  div {{ $root.t['at_maturity'] || 'at_maturity' + ':' }}
  div {{ $root.userflow.horizon }}
.investment-period.row(v-else)
  .num(:class="{ active: i === $root.userflow.horizon || $root.userflow.horizon.includes(i) }" v-for="i in scale") {{  i + ' ' + unit(i) }}
</template>

<script>
export const additions = {}
export default {
  methods:{
    unit(index){
      const units = $root.userflow.horizon.includes('mois') ? [$root.t['m'], $root.t['m']] : [$root.t['y'], $root.t['ys']]
      if (index === 1) return units[0]
      return units[1]
    }
  },
  computed: {
    scale(){
      // Specific lfra ?
      if(['> 1 an', '> 2 ans', '> 3 ans', '> 4 ans', '> 5 ans'].includes($root.userflow.horizon)) return [1, 2, 3, 4, 5]
      if(['> 1 mois', '> 2 mois', '> 3 mois', '> 4 mois', '> 5 mois'].includes($root.userflow.horizon)) return [1, 2, 3, 4, 5]
      if(['> 6 ans', '> 7 ans', '> 8 ans', '> 9 ans', '> 10 ans'].includes($root.userflow.horizon)) return [1, 3, 5, 8, 10]
      if(['> 1 mois', '> 3 mois', '> 6 mois', '> 9 mois', '> 10 mois', '> 10 mois'].includes($root.userflow.horizon)) return [1 , 3 , 6 , 9 , 12 ]
      return [1, 2, 3, 4, 5]
    },
  }
}
</script>