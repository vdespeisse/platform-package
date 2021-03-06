<style>
.pdf-text { display: table;width: 100%;text-align: justify;white-space: pre-wrap;}
.pdf-text > * { display: table-row; }
.pdf-text > * > * { display: table-cell;max-width: 0px; }
</style>

<template lang="pug">
.pdf-text
  div
    div(v-html="get(path) || path")
</template>

<script>
export const additions = {"props":["data"]}
export default {
  methods: {
    managementComment(path) {
      const otherData = {
         'fund_referential': {...$root.userflow, ...$root.share}
       }
      const pattern = this.t[get(path)] || get(path) || path
      return this.evaluatePattern(pattern, this.helperAnalyticsAndData(analytics, format, otherData), $root.lang)
    },
  },
  computed: {
    path() {
      if ($root.lang.includes('_') && !get(this.p) && get(this.p.replace($root.lang, $root.lang.split('_')[0]))) return this.p.replace($root.lang, $root.lang.split('_')[0])
      return this.t[get(this.p)] || get(this.p) || this.p
    },
    p() {
      // TO DO: PDF-TEXT MUST BE ABLE TO MANAGE ALL TEXTS WITH HOLES AND NOT ONLY FOR COMMENTS
      if (this.data.startsWith('comment')) return this.managementComment(['userflows', $root.userflow.name, this.data, $root.domain[1].slice(0, 7), $root.lang].join('.'))
      if (this.data === 'orientation' && $root.share.orientation) return ['config', 'translation', $root.lang, $root.share.orientation].join('.')
      if (this.data === 'orientation') return ['userflows', $root.userflow.name, 'orientation'].join('.')
      if (this.data === 'invest_policy') return ['userflows', $root.userflow.name, 'invest_policy'].join('.')
      if ($root.userflow.text && $root.userflow.text[this.data]) return ['userflows', $root.userflow.name, 'text', this.data, $root.lang].join('.')
      if ($root.userflow[this.data]) return ['userflows', $root.userflow.name, this.data, $root.lang].join('.')
      if ($root.share[this.data]) return ['userflows', $root.userflow.name, 'shares', $root.share.share_id, this.data].join('.')
      if ($root.db[this.data]) return [this.data, $root.lang].join('.')
      if ($root.db.text && $root.db.text[this.data]) return ['text', this.data, $root.lang].join('.')
      if ($root.config.translation[$root.lang][this.data]) return ['config', 'translation', $root.lang, this.data].join('.')
      return this.data
    },

  },
}
</script>