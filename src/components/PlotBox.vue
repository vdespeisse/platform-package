<template>
<div>
  <div v-if="!data || !data.length" class="column center" style="z-index: 1;position: absolute; width: 102%; height: 102%; background: white; top: -8px; left: -8px;">
    <div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  </div>
  <div class="plot-box"></div>
</div>
</template>

<script>
const { add_plot_factory, get_axis_format, hide_guideline, get_axis_config, get_tooltip_fn } = require('./plot_utils')

const plot_create = (trigger = console.log,
                      rebind = console.log,
                {
                    mini = false,
                    axis_format,
                    guideline,
                    dragbox,
                    xAxis_config,
                    tooltip_fn,
                    min_fn = (d => d.min),
                    max_fn = (d => d.max),
                    color = 'black',
                    labels = {},
                }) => {
  const { x_format, y_format } = get_axis_format(axis_format)

  const xScale = new Plottable.Scales.Category().innerPadding(.1).outerPadding(.1)
  const xAxis = new Plottable.Axes.Category(xScale, 'bottom')
  if (x_format) xAxis.formatter(d => format(x_format)(d))
  const yScale = new Plottable.Scales.Linear()
  const yAxis = new Plottable.Axes.Numeric(yScale, 'left').tickLabelPadding(2).margin(0)
  if (y_format) yAxis.formatter(d => format(y_format)(d))

  if (xAxis_config) xAxis.axisConfigurations(get_axis_config(xAxis_config))

  const gridlines = new Plottable.Components.Gridlines(null, yScale)

  yAxis._computeWidth = () => 45
  yScale.tickGenerator(Plottable.SCALE_5)


  const segment_size = 20
  const segment_plot_factory = (fn) => {
    return new Plottable.Plots.Segment()
        .x(d => xScale.scale(d.metric) - segment_size)
        .x2(d => xScale.scale(d.metric) + segment_size)
        .y(fn, yScale)
        .y2(fn, yScale)
        .attr('stroke-width', 1.5)
        .attr('stroke', color)

  }
  const min_plot = segment_plot_factory(min_fn)
  const max_plot = segment_plot_factory(max_fn)
  const median_plot = segment_plot_factory(d => d.median)

  const quartile_plot = new Plottable.Plots.Rectangle()
      .x(d => xScale.scale(d.metric) - segment_size)
      .x2(d => xScale.scale(d.metric) + segment_size)
      .y(d => d.first_quartile, yScale)
      .y2(d => d.third_quartile, yScale)
      .attr('fill', 'white')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)


  const min_to_quartile_plot = new Plottable.Plots.Segment()
                .x(d => xScale.scale(d.metric))
                .x2(d => xScale.scale(d.metric))
                .y(min_fn, yScale)
                .y2(d => d.first_quartile, yScale)
                .attr('stroke', color)
                .attr('stroke-width', 1.5)

  const max_to_quartile_plot = new Plottable.Plots.Segment()
                .x(d => xScale.scale(d.metric))
                .x2(d => xScale.scale(d.metric))
                .y(d => d.third_quartile, yScale)
                .y2(max_fn, yScale)
                .attr('stroke', color)
                .attr('stroke-width', 1.5)

  const xLabel = labels.x && new Plottable.Components.AxisLabel(labels.x, "0");
  const yLabel = labels.y && new Plottable.Components.AxisLabel(labels.y, "270");

  const plot_group = new Plottable.Components.Group([min_plot, min_to_quartile_plot, quartile_plot, median_plot, max_to_quartile_plot, max_plot])
  const plots = {}
  const group = new Plottable.Components.Group([gridlines, plot_group])
  const table = new Plottable.Components.Table([
    [yLabel, yAxis, group],
    [null, null, xAxis],
    [null, null, xLabel],
  ])

  const components = Object.freeze({ table, xAxis, yAxis, xScale, plot_group, xLabel, yLabel })
  window.addEventListener('resize', () => {
    table.redraw()
    trigger('rebind', components)
  })
  return components
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
    // HACK: use $root.$on('page:after-enter') instead and another way to do the transition
    const ctx = this.$parent.$parent.$options._componentTag === 'brick' ? this.$parent.$parent : this.$parent.$options._componentTag === 'block' ? this.$parent : this
    this.trigger = ctx.$emit.bind(ctx)
    this.components = plot_create(this.trigger, this.rebind, this.metadata || {})

    this.components.table.renderTo(this.$el)
    ctx.$emit('mounted', this.components)

    this.rebind()
    this.$watch('data', this.rebind)

    // if (!$root.screen.theme) {
    //   this.$watch('metadata', next => { if (next.keys().length) this.rebind() })
    //   this.$watch('$route.query.domain', this.rebrush)
    // }
  },
  destroyed() {
    this.components.table.destroy()
  },
  methods: {
    rebind() {
      if (!this.components || !this.data) return
      // TODO: handle multiple lines in a better
      // const time = '' + new Date(this.data.keys()[0]) === 'Invalid Date'
      const { plot_group, xScale } = this.components
      plot_group.components().map(plot => plot.datasets([new Plottable.Dataset(this.data)]))
      xScale.domain(this.data.map('metric').unique())
      this.trigger('rebind', this.components)
    },
  },
  watch: {
    'metadata.axis_format': function(newVal,oldVal) {
      if (newVal === oldVal) return
      if (!this.components) return
      const { x_format, y_format } = get_axis_format(newVal)
      const { xAxis, yAxis } = this.components
      if (x_format) xAxis.formatter(d => format(x_format)(d))
      if (y_format) yAxis.formatter(d => format(y_format)(d))
    },
    'metadata.labels': function(newVal,oldVal) {
      if (newVal === oldVal) return
      if (!this.components) return
      const { xLabel, yLabel } = this.components
      xLabel && xLabel.text(newVal.x)
      yLabel && yLabel.text(newVal.y)
    },
  }
}

</script>
