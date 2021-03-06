<template>
<div class="plot-time"></div>
</template>

<script>
const plot_create = (trigger = console.log) => {
  const xScale = new Plottable.Scales.Time()
  const xAxis = new Plottable.Axes.Time(xScale, 'bottom')
  xAxis.axisConfigurations(Plottable.Axes.Time._DEFAULT_TIME_AXIS_CONFIGURATIONS.at([17, 20, 21, 22]))
  const _computeHeight = xAxis._computeHeight.bind(xAxis)
  xAxis._computeHeight = (...args) => _computeHeight(...args) && 0
  const yScale = new Plottable.Scales.Linear().padProportion(0)

  const plot = new Plottable.Plots.Rectangle()
    .x(d => d.x, xScale)
    .x2(d => d.x2, xScale)
    .y(0, yScale)
    .y2(1, yScale)
    .attr('opacity', 0.5)

  var xDragbox = new Plottable.Components.XDragBoxLayer()
    .xScale(xScale)
    .onDragEnd((box) => {
      const domain = xDragbox.xExtent().map(d => d.format())
      if (domain[0] === domain[1]) return update_query({ domain: domain[0].slice(0, 7) })
      return update_domain(domain)
    })
    .movable(true)
    .resizable(true)
    .enabled(true)

  new Plottable.Interactions.Click()
    .attachTo(xAxis)
    .onClick((p) => {
      const d = plot.entityNearest(p).datum
      if (xAxis._mostPreciseConfigIndex === 0 && p.y < 16) return update_query({ domain: d.x.plus('10 days').format('YYYY-MM') })
      return update_query({ domain: d.x.format('YYYY') })
    })

  const group = new Plottable.Components.Group([plot, xDragbox])
  const table = new Plottable.Components.Table([
    [group],
    [xAxis],
  ])
  window.addEventListener('resize', () => table.redraw())

  return Object.freeze({ table, plot, xDragbox, xScale, xAxis })
}
export default {
  props: ['data'],
  data() {
    return {
      components: [],
    }
  },
  mounted() {
    this.components = plot_create(this.$emit.bind(this))
    this.components.table.renderTo(this.$el)
    this.$emit('mounted', this.components)
    this.rebind()
  },
  destroyed() {
    this.components.table.destroy()
  },
  watch: {
    data: 'rebind',
    '$root.domain': 'rebrush',
  },
  methods: {
    rebind() {
      if (!this.data || !this.data.length) return
      const domain = this.data
      const months = []
      let current = domain[0]
      while (domain[1] > current) {
        months.push({ x: current, x2: current.plus('1 month') })
        current = current.plus('1 month')
      }
      const dataset = new Plottable.Dataset(months)
      this.components.xScale.domain(domain)
      this.components.plot.datasets([dataset])
      this.rebrush()
    },
    rebrush() {
      if (!$root.domain || !$root.domain.length) return this.components.xDragbox.boxVisible(false)
      const domain = $root.domain.map(d => new Date(d))
      this.components.xDragbox.xExtent(domain)
      return this.components.xDragbox.boxVisible(true)
    },
  },
}

</script>
