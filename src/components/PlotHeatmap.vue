<template>
<div class='plot-heatmap'></div>
</template>

<script>
var plot_create = (trigger = console.log) => {
  var xScale = new Plottable.Scales.Category()
  var yScale = new Plottable.Scales.Category()
  var xAxis = new Plottable.Axes.Category(xScale, 'bottom')
  var yAxis = new Plottable.Axes.Category(yScale, 'left')
  var colorScale = new Plottable.Scales.InterpolatedColor()
  colorScale.domain([-1, 1])
  colorScale.range(['#63c261', '#f0f0f0', '#fd373e'])

  window.xScale = xScale
  var dataset = new Plottable.Dataset()
  var plot = new Plottable.Plots.Scatter()
    .addDataset(dataset)
    .x(d => d.x, xScale)
    .y(d => d.y, yScale)
    .size(d => d.z || 50)
    .attr('fill', d => d.c, colorScale)
    .attr('stroke', '#fff')
    .attr('stroke-width', '1px')

  new Plottable.Interactions.Pointer()
    .attachTo(plot)
    .onPointerMove(p => {
      plot.entities().map(entity => entity.selection.classed('hover', false))
      plot.entityNearest(p).selection.classed('hover', true)
      trigger('tooltip', plot.entityNearest(p).datum)
    })
    .onPointerExit(() => {
      plot.entities().map(entity => entity.selection.classed('hover', false))
      trigger('tooltip', {})
    })

  new Plottable.Interactions.Click()
    .attachTo(plot)
    .onClick(p => {
      trigger('plotclick', plot.entityNearest(p).datum)
    })

  var table = new Plottable.Components.Table([
    [yAxis, plot],
    [null, xAxis]
  ])

  window.addEventListener('resize', () => table.redraw())

  return Object.freeze({ table, plot, dataset })
}

export default {
  props: ['data', 'options'],
  mounted() {
    this.components = plot_create(this.$emit.bind(this))
    this.components.table.renderTo(this.$el)
    this.$emit('mounted', this.components)
    this.rebind()
  },
  watch: {
    data: 'rebind',
  },
  methods: {
    rebind() {
      this.components.dataset.data(this.data)
    }
  }
}

</script>
