<style>
.pdf .hide { display: none!important; }
.pdf-table { display: table;width: 100%; }
.pdf-table .line { display: table-row; }
.pdf-table .cell { display: table-cell; }
.pdf-table .line.header { font-weight: 600; }
.pdf-table .cell { padding: 4px;max-width: 140px; }
.pdf-table .cell > div { display: flex;overflow: hidden;font-size: 10px;text-overflow: ellipsis;white-space: nowrap; }
.pdf-table .cell:empty { background: none!important; }
.pdf-table.number .cell { justify-content: flex-end; }
.pdf-table .cell:first-child > div { font-weight: 600;justify-content: flex-start; }
.block.condensed .pdf-table { display: block;columns: 2;column-gap: 24px; }
.block.condensed .pdf-table .line { display: flex; }
.block.condensed .pdf-table .cell { display: flex;flex: 1;padding: 0;max-width: unset; }
.block.condensed .pdf-table .cell:last-child { justify-content: flex-end; }
.block.lines .pdf-table .cell { font-weight: normal; }
.block.lines .pdf-table .cell:nth-child(even) { font-weight: 600; }
</style>

<template lang="pug">
.pdf-table
  .line(:class="[line[class_index], { header: lnum === 0, hide: lnum === 0 && metadata && metadata.hide }]" v-for="(line, lnum) in data_")
    .cell(:class="[data_[0][cnum], 'r' + (lnum + 1), 'c' + (cnum + 1)]" contenteditable="" @blur="focus = []" @focus="focus = [lnum, cnum]" @input="input(lnum, cnum, $event.target.innerText)" v-for="(cell, cnum) in line")
      wrapper(:value="display(cell, line, focus[0] === lnum && focus[1] === cnum, cnum, data_[0])" v-if="/=>/.test(cell)")
      div(v-else-if="!t[cell] && /^(performance|performance_annualized|volatility|tracking_error|information_ratio|sharpe_ratio|max_drawdown_value|beta|alpha|var_X|var_X_Y_days)\./.test(cell) && cell.includes('.')") {{ format(cell.split('.')[0])(analytics(cell)) }}
      div(v-else v-html="t[cell] || (format(metadata.format || ($root.config.formats && $root.config.formats[data_[lnum][0]]) || ($root.config.formats && $root.config.formats[data_[0][cnum]])))(cell)")
</template>

<script>
export const additions = {"props":["data","metadata"]}
export default {
  data() {
    const m = this.metadata || {}
    return {
      focus: [],
    }
  },
  computed: {
    class_index() {
      return this.data_[0].findIndex('class')
    },
    data_() {
      const data = ($root.userflow.table && $root.userflow.table[this.data]) ||
             ($root.db.table && $root.db.table[this.data]) ||
             ($root.config.table && $root.config.table[this.data]) ||
             this.data || []
      if (data && data.includes(',')) return data.split(',').map(d => [d, $root.userflow[d] || $root.share[d] || d])
      if (typeof data === 'object' && typeof data[0] === 'string' && typeof(data[0]) === 'string') return data.map(d => [d, $root.userflow[d] || $root.share[d] || null]).filter(d => d[1])
      if (typeof data === 'object' && typeof data[0] === 'object' && data[0].length === 2) return data.map(d => [d.first(), d.last() || $root.userflow[d.first()] || $root.share[d.first()] || null]).filter(d => d[1])
      return data
    },
  },
  methods: {
    input(lnum, cnum, value) {
      if (!window.set_debounced) window.set_debounced = set.debounce(2000)
      const key = $root.userflow.table.find(this.data)
      set_debounced(['userflows', $root.userflow.name, 'table', key, lnum, cnum].join('.'), value)
    },
    display(cell, line, focus, cnum, header) {
      try {
        const $page = $root.$refs.router.$children[1] || $root.$refs.router.$children[0]
        const value = function() { return eval(cell)() }.call($page.$children[0])
        return format(this.metadata.format || header[cnum])(this.t[value] || value) || (this.t[value] || value)
      } catch (e) { return '' }
    },
  },
}
</script>