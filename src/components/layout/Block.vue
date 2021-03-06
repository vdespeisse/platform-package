<template>
<div class="block" :class="['block-' + (type || 'custom'), 'block-' + (title || 'no-title'), title || 'no-title', fullscreen && 'fullscreen']">
  <h2 v-if="title && (!/^block_/.test(title) || t[title])">
    <div v-html="title.split(',').length > 1 ? title.split(',').map(d => t[d] || d).join(' ').capitalize(true) : t[title] || title"></div>
    <slot name="title"></slot>
    <button class="ghost" aria-label="fullscreen" @click="fullscreen = !fullscreen"><svg-icon class="nx-fullscreen" name="nx-fullscreen"></svg-icon></button>
  </h2>
  <div style="display: none;" class="hack-title" v-else>{{ (title || type || 'block').replace('pdf', '').replace($root.params.screen, '').titleize() }}</div>
  <div class="subtitle" v-html="t[subtitle] || subtitle" v-if="subtitle"></div>
  <slot name="legend" :tooltip="tooltip" :data="data" :metadata="metadata">
    <div class="legend" v-if="(type!== 'plot-base' && /plot-/.test(type) || 'bar' === type) && data && data.v() && data.v()[0] && data.v()[0].keys().length">
      <div :class="k" v-for="k in legend">
        <div class="color"></div>
        <div class="label">{{ t[k] || k }}</div>
      </div>
    </div>
    <div class="legend" v-if="(type === 'plot-base') && legend_plotbase">
      <div v-for="k in legend_plotbase">
        <div :style="'background:' + k.color + ';'" class="color"></div>
        <div class="label">{{ t[k.name] || k.name }}</div>
      </div>
    </div>
  </slot>
  <slot name="tooltip" :tooltip="tooltip">
    <div class="tooltip-line" v-if="tooltip && tooltip.x">
      <div>{{ t[tooltip.label] || tooltip.label || t[tooltip.x] || tooltip.x }}</div>
      <div v-html="unit(format((metadata && metadata.format) || '.2%')(tooltip.y))"></div>
    </div>
    <div class="tooltip-line" v-if="tooltip && tooltip.date && tooltip.y">
      <div>{{ new Date(tooltip.date).format('day, mon, year', $root.lang).titleize() }}</div>
      <div v-html="unit(format((metadata && metadata.format) || '.2f')(tooltip.y))"></div>
    </div>
    <div class="tooltip-table" v-if="tooltip && tooltip.date && !tooltip.y">
      <div>{{ '' + new Date(tooltip.date) === 'Invalid Date' || (metadata && metadata.xAxisNumeric) ? tooltip.date : new Date(tooltip.date).format('day, mon, year', $root.lang).titleize() }}</div>
      <div>
        <div v-for="v, k in tooltip" v-if="k !== 'date'">
          <div>{{ t[k] || k }}</div>
          <div v-html="unit(format((metadata && metadata.format) || '.2f')(v))"></div>
        </div>
      </div>
    </div>
  </slot>
  <div class="content" :style="{ height }" v-if="type && $root.slide === 0">
    <component :is="type" :data="data" :metadata="metadata || {}" :options="metadata || {}" ref="component"></component>
    <slot name="fullscreen" v-if="/plot-bar/.test(type) && fullscreen">
      <board 
        class="data" 
        :data="data.map((v, k) => typeof v === 'object' ? Object.assign({ 'sum': v.v().sum() }, v) : v).map((v, k) => Object.assign({ [title.includes(',') ? title.split(',').last() : 'title']: t[k] || k }, typeof v === 'object' ? v : { [title.split(',').first()]: v })).v().sort(d => new Date(this.data.keys().first()).toDateString() !== 'Invalid date' ? d :d[fullscreen_columns.first()])" 
        :metadata="{ columns: typeof data.v().first() === 'object' ? fullscreen_columns.concat(['sum']) : fullscreen_columns, sort: '-' + fullscreen_columns.last() }"
      ></board>
    </slot>
  </div>
  <slot></slot>
  <div class="disclaimer" v-html="t[disclaimer] || disclaimer" v-if="disclaimer"></div>
</div>
</template>

<script>
export default {
  props: ['type', 'title', 'subtitle', 'disclaimer', 'data', 'metadata'],
  data() {
    return {
      tooltip: null,
      height: null,
      fullscreen: false,
    }
  },
  computed: {
    fullscreen_columns() {
      return this.data.map((v, k) => Object.assign({ [this.title.includes(',') ? this.title.split(',').last() : 'title']: this.t[k] || k }, typeof v === 'object' ? v : { [this.title.split(',').first()]: v })).v().first().keys()
    },
    legend_plotbase() {
      // TODO Replace by toggle-legend from natixis project
      if (this.$root.app === 'natixis-ldi') return
      if(this.metadata.plots.v().first().plot_type === 'StackedArea') return this.data.v().map(d => d.map(v => ({name: v.first().name, color: v.first().color})))[0]
      return []
    },
    legend() {
      return this.data.map(v => v.keys()).v().flat().unique()
    }
  },
  mounted() {
    this.$on('tooltip', tooltip => this.tooltip = tooltip)
    if (/plot/.test(this.type) && this.$el.getBoundingClientRect().height > 400) this.height = this.$el.getBoundingClientRect().height - 76 + 'px'
    this.$watch('fullscreen', () => window.dispatchEvent(new Event('resize')))
  },
}
</script>
