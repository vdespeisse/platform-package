<template>
<div class="plot-scatter"></div>
</template>

<script>
const plot_create = (trigger = console.log) => {
  const xScale = new Plottable.Scales.Linear()
  const xAxis = new Plottable.Axes.Numeric(xScale, 'bottom').tickLabelPadding(2).margin(0).endTickLength(0)
  const yScale = new Plottable.Scales.Linear()
  const yAxis = new Plottable.Axes.Numeric(yScale, 'left').tickLabelPadding(2).margin(0).endTickLength(0)
  xAxis._computeHeight = () => 25
  yAxis._computeWidth = () => 40
  yScale.tickGenerator(Plottable.SCALE_5)
  // const zScale = new Plottable.Scales.Linear()

  const plot = new Plottable.Plots.Scatter()
    .x(d => d.x, xScale)
    .y(d => d.y, yScale)
    .size(d => d.z)
    .attr('class', (d, i, ds) => [
      d.class,
      ds.class,
      +d.y > 0 ? 'positive' : 'negative',
      !vm.$route.query[ds.metadata().dimension]
      || vm.$route.query[ds.metadata().dimension].length === 0
      || vm.$route.query[ds.metadata().dimension].split('|').includes(d.x) ? 'active' : 'inactive',
    ].join(' '))
    // .labelsEnabled(true)
  var xLabel = new Plottable.Components.AxisLabel("", "0")
  var yLabel = new Plottable.Components.AxisLabel("", "0")

  const table = new Plottable.Components.Table([
    [yLabel, size() === 'mobile' ? null : yAxis, plot],
    [null, null, xAxis],
    [null, null, xLabel],
  ])

  let tooltip = null
  new Plottable.Interactions.Pointer()
    .attachTo(plot)
    .onPointerMove((p) => {
      const point = (plot.entitiesAt(p)[0] || {}).datum
      if (eq(point, tooltip)) return
      tooltip = point
      trigger('tooltip', tooltip)
    })
    .onPointerExit(() => trigger('tooltip', tooltip = null))

  window.addEventListener('resize', () => table.redraw())

  return Object.freeze({ table, plot, xAxis, yAxis })
}

export default {
  props: ['data', 'metadata'],
  data() {
    return {
      components: null,
      trigger: null,
    }
  },
  mounted() {
    const ctx = this.$parent.type === 'plot-scatter' ? this.$parent : this
    this.trigger = ctx.$emit.bind(ctx)
    this.components = plot_create(this.trigger)
    this.components.table.renderTo(this.$el)
    this.$emit('mounted', this.components)
    this.rebind()
    window.dispatchEvent(new Event('resize'))
  },
  watch: {
    data: 'rebind',
  },
  methods: {
    rebind() {
      if (!this.components || !this.data || !this.data.length) return
      // let f = this.metadata || (this.data.filter(d => d.y).length > 1 && this.data.filter(d => d.y).every(d => Math.abs(d.y) < .01)) ? 'bp' : '.2%'
      // this.components.xAxis.formatter(format(f))
      // this.components.yAxis.formatter(format(f))
      this.components.yAxis.formatter(format('.2s€'))
      this.components.xAxis._scale.autoDomain()
      this.components.plot.datasets([new Plottable.Dataset(this.data)])
      this.trigger('rebind', this.components)
    },
  },
}

</script>
