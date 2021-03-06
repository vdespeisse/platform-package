<template>
  <block
    class="brick"
    :class="typeof data === 'string' && data.split('.').last()"
    :type="type_"
    :title="{ header_2: t.monthly_report + ': ' + $root.period[1].replace(/,/g, '') + ' - ' + (t[$root.userflow.title] || ($root.userflow.title && $root.userflow.title.titleize())) }[title] || title"
    :subtitle="subtitle"
    :disclaimer="disclaimer"
    :data="data_"
    :metadata="options"
    v-if="!error"
  >
    <template slot="title">
      <slot name="title"></slot>
    </template>
    <slot></slot>
  </block>
  <div
    class="brick block no-data"
    :class="['block-' + (title || 'no-title')]"
    v-else
  >
    <h2 v-html="title.split(',').length > 1 ? title.split(',').map(d => t[d] || d).join(' ').capitalize(true) : t[title] || title"></h2>
    <div style="font-size: 16px;">No visualisation for this data</div>
  </div>
</template>

<script>
export default {
  props: [
    'type',
    'title',
    'subtitle',
    'disclaimer',
    'data',
    'options'
  ],
  data() {
    return {
      isTable: false,
      error: false,
      initial_column: []
    }
  },
  computed: {
    type_() {
      const map = {
        vbar: 'plot-bar',
        hbar: 'bar-chart',
        pie: 'pie-chart',
        line: 'plot-line',
        text: 'pdf-text',
        'bar-percentile': 'bar-percentile', // HACK: MOA
        'plot-base': 'plot-base',
        'plot-bar': 'plot-bar',
      }
      this.isTable = false
      if (map[this.type]) return map[this.type]
      if ((this.$root.userflow.table && this.$root.userflow.table[this.data_])
      || (this.$root.db.table && this.$root.db.table[this.data_])
      || (this.$root.config.table && this.$root.config.table[this.data_])
      || (this.data_ && typeof this.data_ !== 'string')
      || (this.data_ && this.data_.includes(','))){
        this.isTable = true
        return 'pdf-table'
      }
      if ((this.$root.userflow && this.$root.userflow[this.data_])
      || (this.$root.db.text && this.$root.db.text[this.data_])
      || (this.$root.config.translation && this.$root.config.translation[this.$root.lang] && this.$root.config.translation[this.$root.lang][this.data_])
      || ['orientation', 'comment'].includes(this.data_)
      || (this.data_ && this.data.includes('computed') && this.data.includes('text'))) return 'pdf-text'
      if (/^block\./.test(this.data)) return this.data.replace('block.', 'pdf-')
      if (/^theme\./.test(this.data)) return 'pdf-image'
      // fall back sur pdf-text ?
      if(this.data_ && typeof this.data_ === 'string') return 'pdf-text'
      return this.type
    },
    data__() {
      let data = this.data
      // Interpret datareports
     // expecting data to contain an object path like `datareports.kiid.somepath`
      if (typeof data === 'string' && data.startsWith('datareports')) {
        data = data.split('.').reduce((acc, nextKey) => {
          if (!acc) return; // path not found
          return acc[nextKey]
        }, this.$root);
      }

      // TODO Document these interpretations
      if (typeof data === 'string' && data.startsWith('theme.')) return this.$root.cssvar[data.replace('theme.', '')].slice(4, -1)
      if (typeof data === 'string' && data.startsWith('nxpack.dataset.')) data = this.$root.db.dataset[data.replace('nxpack.dataset.', '')]
      if (typeof data === 'string' && data.startsWith('nxpack.table.')) {
        data = (data.replace('nxpack.table.', '') === 'characteristics') ? this.$root.db.table[data.replace('nxpack.table.', '')] : data.replace('nxpack.table.', '')
        this.initial_column = (typeof data[0] === 'string') ? data : data[0]
      }
      if (typeof data === 'string' && data.startsWith('nxpack.')) data = data.replace('nxpack.', '')
      if (typeof data === 'string' && data.startsWith('computed.')) data = this.$parent[data.replace('computed.', '')]
      if (typeof data === 'string' && data.startsWith('allocation_dimension_pdf.')) data = this.$parent['allocation_dimension_pdf'][data.split('.')[1]]
      if (typeof data === 'string' && data.startsWith('allocation.')) data = this.$parent.allocation[data.replace('allocation.', '')]
      if (typeof data === 'string' && data.startsWith('contribution.')) data = this.$parent.contribution[data.replace('contribution.', '')]

      // TODO possible double with previous datareports interpretation (@gauthier ?)
      if (typeof data === 'string' && data.startsWith('data_report.')) data = $root.db.data_report[data.replace('data_report.', '')]

      if (data && data[0] && Array.isArray(data[0])){
        this.initial_column = data[0]
        data = data.slice(1).map(v => v.reduce((acc, v, i) => (acc[data[0][i]] = v, acc), {}))
      } else if (data && data[0] && typeof data[0] === 'object') {
        this.initial_column = Object.keys(data[0])
      }
      return data
    },
    data_() {
      let data = this.data__
      let options = this.options || {}
      if (this.type === 'line') {
        if (!data.keys()[0].match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)) return Error("require timeserie")
        if (options.limit) data = data.filter((v, k) => k >= ('' + (new Date().getFullYear() - options.limit + 1)))
        return data
      }
      // Particular case of plot-bar with temporal data:
      if (this.type === 'vbar' && data.v().first() && data.v().first().fund) {
        return data.map((v, k) => ({ key: k, fund: v.fund, benchmark: v.benchmark }))
        .v()
        .sort('key')
        .slice(-options.limit)
        .reduce((acc, v, k) => {
          acc[v.key] = v.benchmark ? { fund: v.fund, benchmark: v.benchmark } : { fund: v.fund }
          return acc
        }, {})
      }
      // Generic API for hbar / vbar / pdf-table
      const object_table = this.isTable === true && typeof data !== 'string' && !(data instanceof Array)
      if (object_table) {
        if (typeof data.v()[0] === 'object') {
          this.initial_column = [''].concat(data.v()[0].keys())
          data = data.reduce((acc, v, k) => (acc.push({ '': k, ...v }), acc), [])
        } else {
          this.initial_column = ['key', 'value']
          data = data.reduce((acc, v, k) => (acc.push({ key: k, value: v }), acc), [])
        }
      }
      if (['vbar', 'hbar', 'pie'].includes(this.type)) {
        const sorted_elements = data
          .filter(x => x)
          .map((v, k) => ({
            key: k,
            name: this.t[k] || k,
            value: v
          })).v()
          .sort(options.sort || '-value')
        const others = sorted_elements.length > options.limit ? sorted_elements.slice(options.limit - 1) : {}
        const other_sum = others.length && options.others ? others.map('value').sum() || others.reduce((acc,v) => {v.value.keys().map(d => {acc[d]+=v.value[d];});return acc;}, others.v().first().value.keys().reduce((acc,v) => {acc[v]=0;return acc;}, {})) : 0
        const elements = sorted_elements
          .slice(0, (options.limit || Infinity) - (others.length && options.others ? 1 : 0))
          .concat(others.length && options.others ? [{ key: 'others', name: `${this.t['other']}`, value: other_sum }] : [])
          .filter(d => d.value)
        if (object_table && elements.length) return elements.reduce((acc,v) => {acc.push([v.name,typeof v.value === 'object' ? v.value.v() : v.value].flatten());return acc;}, elements[0].value.keys().length >= 1 ? [[' ', elements[0].value.keys()].flatten()] : [])
        return elements.reduce((acc,v) => {acc[v.key]=v.value;return acc;},{})
      }
      if (data instanceof Array) {
        if (options.group){
          data = data
            .group(l => options.group.map(k => l[k]))
            .map(
              options.map !== ({}).map ? // This is to check if the map key has overloaded the already overloaded rawjs map function
              options.map : // in that case use that function (hoping this is a function, but this could as well be a string ?)
              Array.first // if no map defined take any element from the group (using overloaded Array.first method)
            )
            .map((v, k) => ({[options.group]: k, ...v}))
            .v() // transform back to array
        }
        if (options.sort) data = Array.sort(data, options.sort)
        if (options.rows) data = data.filter(options.rows)
        if (typeof options.format === 'function') data = data.map(options.format)
        if (typeof options.format === 'object') data = data.map(l => l.map((v, c) => format(options.format[c])(v)))
        if (typeof options.format === 'string') data = data.map(l => l.map((v, c) => format(options.format)(v)))
        const final_cols = options.columns || this.initial_column
        data = data.reduce((acc, v, i) => {
          acc.push(final_cols.map((key) => v[key]))
          return acc
        }, [final_cols])
        if (options.limit) data = data.slice(0, +options.limit + (options.hide ? 1 : 0))
        if (options.transpose) data = Array.transpose(data)
        data = data.filter(l => !l.every(c => !c))
        // TO HAVE THE SAME FINAL RESULT IF WE PUT nx-pack.table.characteristics or nx-pack.characteristics
        if ((data.length === 1) && (data[0] instanceof Array)) return data[0]
        return data
      }
      return data
    },
  },
  errorCaptured(err, vm, info) {
    this.error = err
  },
}
</script>
