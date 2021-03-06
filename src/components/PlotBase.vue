<template>
<div>
  <div v-if="!data || !data.v().filter(d => d && d.length).length" class="column center" style="z-index: 1;position: absolute; width: 102%; height: 102%; background: white; top: -8px; left: -8px;">
    <div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  </div>
  <div class="plot-base"></div>
</div>
</template>
<script>
const { add_plot_factory, get_axis_format, hide_guideline, get_axis_config, get_tooltip_fn } = require('./plot_utils')

const plot_create = (trigger = console.log,
                      rebind = console.log,
                {
                    mini = false,
                    labels = {},
                    xAxis_type = 'Time',
                    null_tooltip_mouseleave = true,
                    format_tooltip = true,
                    axis_format,
                    guideline,
                    dragbox,
                    xAxis_config,
                    tooltip_fn,
                    padProportion,
                    yAxis_width,
                    tickGenerator,
                }) => {
  const { x_format, y_format } = get_axis_format(axis_format)

  xAxis_type = xAxis_type.capitalize() // 'Time', 'Numeric'
  const xScale_type = xAxis_type.replace('Numeric', 'Linear')
  const xScale = new Plottable.Scales[xScale_type]()
  if (xScale.padProportion) xScale.padProportion(padProportion || 0)
  const xAxis = new Plottable.Axes[xAxis_type](xScale, 'bottom')
  if (x_format) xAxis.formatter(d => format(x_format)(d))
  const yScale = new Plottable.Scales.Linear()
  const yAxis = new Plottable.Axes.Numeric(yScale, 'left').tickLabelPadding(2).margin(0)
  if (y_format) yAxis.formatter(d => format(y_format)(d))

  if(xAxis_type === 'Time'){
    xAxis.__computeHeight = xAxis._computeHeight
    xAxis._computeHeight = (...args) => xAxis.__computeHeight(...args) && 10
  }
  if (xAxis_config) xAxis.axisConfigurations(get_axis_config(xAxis_config))

  if (yAxis_width) yAxis._computeWidth = () => yAxis_width
  yScale.tickGenerator(tickGenerator || Plottable.SCALE_5)

  const xLabel = labels.x && new Plottable.Components.AxisLabel(labels.x, "0");
  const yLabel = labels.y && new Plottable.Components.AxisLabel(labels.y, "270");

  const gridlines = new Plottable.Components.Gridlines(xScale, yScale)

  const xGuideline = guideline && new Plottable.Components.GuideLineLayer('vertical').scale(xScale)
  const xDragbox = dragbox && new Plottable.Components.XDragBoxLayer()
    .xScale(xScale)
    .onDragEnd(box => trigger('brush', xDragbox.xExtent()))
    .movable(true)
    .resizable(true)


  const plot_group = new Plottable.Components.Group()
  const plots = {}
  const group = new Plottable.Components.Group([gridlines, plot_group, xGuideline, xDragbox])
  const table = new Plottable.Components.Table([
    [yLabel, yAxis, group],
    [null, null, xAxis],
    [null, null, xLabel],
  ])

  // debugger
  const add_plot = add_plot_factory({plots, plot_group, xScale, yScale, trigger, rebind, xGuideline})
  const remove_plot = (plot_name) => {
    const plot = plots[plot_name]
    if (!plot) return
    plot_group.remove(plot)
    plot_group.redraw()
    delete plots[plot_name]
  }
  const toggle_plot = (plot_name, plot_def) => {
    const plot = plots[plot_name]
    if (plot) return remove_plot(plot_name)
    add_plot(plot_name, plot_def)
  }

  const _tooltip_fn = get_tooltip_fn(tooltip_fn)

  new Plottable.Interactions.Pointer()
    .attachTo(plot_group)
    .onPointerMove(p => {
      const plot = plots.v()[0]
      const find_fn = (pointer) => (plot.entityNearestByXThenY ? plot.entityNearestByXThenY(pointer) : plot.entityNearest(pointer))
      const point = find_fn(p)
      xGuideline && xGuideline.value(point && point.datum.x)
      if (_tooltip_fn) window.requestAnimationFrame(_tooltip_fn(p, {plots, trigger, x_format, y_format, format_tooltip}))
    })
    .onPointerExit(() => {
      if (null_tooltip_mouseleave) {
        window.requestAnimationFrame(() => trigger('tooltip', null))
        hide_guideline(xGuideline)
      }
    })
  const components = Object.freeze({ table, xGuideline, xDragbox, xAxis, yAxis, add_plot, remove_plot, toggle_plot, plots, xLabel, yLabel, rebind })
  window.addEventListener('resize', () => {
    table.redraw()
    trigger('rebind', components)
  })
  return components
}

export default {
  props: {
    data: Object,
    metadata: {
      type: Object,
      default: () => ({}),
    },
  },
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
    this.components = plot_create(this.trigger, this.rebind, this.metadata)
    const { add_plot, table } = this.components
    this.metadata.plots.map((opts, plot_name) => add_plot(plot_name, opts))
    table.renderTo(this.$el)
    ctx.$emit('mounted', this.components)
    this.rebind()
    this.redraw_labels()
    // this.$watch('metadata.plots', this.rebind_plots)
    this.$watch('metadata.labels', this.redraw_labels)
  },
  destroyed() {
    this.components && this.components.table.destroy()
  },
  methods: {
    rebind() {
      if (!this.components || !this.data) return
      // TODO: handle multiple lines in a better
      // const time = '' + new Date(this.data.keys()[0]) === 'Invalid Date'
      const { plots } = this.components
      plots.map((plot, plot_name) => {
        const opts = this.metadata.plots[plot_name] || {}
        const dataset_name = opts.dataset || plot_name
        const dataset = this.data[dataset_name]
        if (!dataset) return
        if (type(dataset[0]) === 'object') return plot.datasets([new Plottable.Dataset(dataset)])
        return plot.datasets(dataset.map(ds => new Plottable.Dataset(ds)))
      })
      this.trigger('rebind', this.components)
    },
    rebind_plots() {
      if (!this.components) return
      const { plots, remove_plot, add_plot } = this.components
      plots.map((plot, plot_name) => remove_plot(plot_name))
      this.metadata.plots.map((opts, plot_name) => add_plot(plot_name, opts))
      this.rebind()
    },
    redraw_labels() {
      if (!this.components) return
      const { xLabel, yLabel } = this.components
      const { labels } = this.metadata
      xLabel && xLabel.text(labels.x)
      yLabel && yLabel.text(labels.y)
    },
    rebind_axis(axis_format) {
      const { x_format, y_format } = get_axis_format(axis_format)
      const { xAxis, yAxis } = this.components
      if (x_format) xAxis.formatter(d => format(x_format)(d))
      if (y_format) yAxis.formatter(d => format(y_format)(d))

    }
  },
  watch: {
    'metadata.plots'(newVal, oldVal) {
      if (!oldVal) return
      if (newVal.keys().equal(oldVal.keys())) return
      this.rebind_plots()
    },
    'metadata.axis_format'(newVal, oldVal) {
      if (!oldVal) return
      if (newVal.equal(oldVal))
      return this.rebind_axis(this.metadata.axis_format)
    },
    data(newVal, oldVal) {
      if (newVal.equal(oldVal)) return
      this.rebind()
    },

  }
}
</script>
