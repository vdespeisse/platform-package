<template>
<div class="plot-bar"></div>
</template>

<script>
const plot_create = (trigger = console.log, {
                          variant = 'stacked-bar',
                          color = 'var(--primary)',
                          //xAxisSize = 25,
                          yAxisSize = 45,
                        }) => {
  const xScale = new Plottable.Scales.Category().innerPadding(.1).outerPadding(.1)
  const xAxis = new Plottable.Axes.Category(xScale, 'bottom').tickLabelPadding(2).margin(0).tickLabelMaxLines(1)
  const yScale = new Plottable.Scales.Linear().padProportion(.2)
  const yAxis = new Plottable.Axes.Numeric(yScale, 'left').tickLabelPadding(2).margin(0)
  //xAxis._computeHeight = () => xAxisSize
  yAxis._computeWidth = () => yAxisSize
  yScale.tickGenerator(Plottable.SCALE_5)

  const plot = new Plottable.Plots[variant.camelize()]()
    .x(d => d.x, xScale)
    .y(d => d.y, yScale)
    .attr('class', (d, i, ds) => {
      const filters = vm.$route.query[ds.metadata().dimension]
      const active = !filters || filters.length === 0 || filters.split('|').includes(ds.metadata().activedim ? d[ds.metadata().activedim] : d.label)
      return [
        d.class,
        ds.class,
        d.label.replace(/.*(fund|benchmark|diff).*/g,'$1'),
        d.x.replace(/.*(fund|benchmark|diff).*/g,'$1'),
        +d.y > 0 ? 'positive' : 'negative',
        active ? 'active' : 'inactive',
      ].join(' ')
    })
    .attr('fill', color)
    .labelsEnabled(false)
    .animated(false)

  const gridlines = new Plottable.Components.Gridlines(xScale, yScale)

  const waterlabel = new Plottable.Plots.StackedBar()
    .x(d => d.x, xScale)
    .y(d => d.y, yScale)
    .attr('class', 'waterlabel')
    .labelsEnabled(true)

  const watermark = new Plottable.Plots.Segment()
    .x(d => xScale.scale(d.x) - xScale.rangeBand() / 2)
    .x2(d => xScale.scale(d.x) + xScale.rangeBand() / 2)
    .y(d => d.y, yScale)
    .y2(d => d.y, yScale)
    .attr('class', d => 'watermark ' + d.x + ' ' + (+d.y > 0 ? 'positive' : 'negative'))
    .autorangeMode('none')

  const group = (variant === 'stacked-bar')
              ? new Plottable.Components.Group([gridlines, plot, waterlabel, watermark])
              : new Plottable.Components.Group([gridlines, plot])

  const table = new Plottable.Components.Table([
    [size() === 'mobile' ? null : yAxis, group],
    [null, xAxis],
  ])

  let tooltip = null
  const attach = (component) => {
    new Plottable.Interactions.Pointer()
      .attachTo(component)
      .onPointerMove((p) => {
        if (!plot.entityNearest(p)) return
        if (eq(tooltip, plot.entityNearest(p).datum)) return
        tooltip = plot.entityNearest(p).datum
        trigger('tooltip', tooltip)
        // const tick_number = Math.floor(p.x / xAxis._scale.stepWidth())
        // const tick_value = xAxis._scale.domain()[tick_number]
        // const tick_labels = xAxis._content.selectAll('.tick-label text')
        // const ds = plot.datasets()[0]
        // const filters = vm.$route.query[ds.metadata().dimension]
        // tick_labels.each(function (value, i, elements) {
        //   d3.select(this).classed('active', filters.split('|').includes(vm.t.find(elements[i].innerHTML)))
        //   d3.select(this).classed('hover', elements[i].innerHTML === vm.t[tick_value])
        // })
        plot.entities().map(entity => entity.selection.classed('hover', false))
        plot.entityNearest(p).selection.classed('hover', true)
      })
      .onPointerExit(() => {
        tooltip = null
        trigger('tooltip', null)
        plot.entities().map(entity => entity.selection.classed('hover', false))
        // xAxis._content.selectAll('.tick-label text').each(function (value) {
        //   d3.select(this).classed('hover', false)
        // })
      })

    new Plottable.Interactions.Click()
      .attachTo(component)
      .onClick((p) => {
        if (!plot.entityNearest(p)) return
        const d = plot.entityNearest(p).datum
        trigger('plotclick', d, component === plot ? plot.entitiesAt(p) : [])
      })
  }
  attach(plot)
  attach(xAxis)
  plot.datasets((0).upto(100).map(() => new Plottable.Dataset()))
  window.addEventListener('resize', () => table.redraw())

  return Object.freeze({ table, plot, waterlabel, watermark, xAxis, yAxis, xScale, yScale })
}

export default {
  props: {
    data: Object,
    metadata: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      trigger: null,
      components: null,
      variant: 'stacked-bar',
    }
  },
  mounted() {
    const ctx = this.$parent.$parent.$options._componentTag === 'brick' ? this.$parent.$parent : this.$parent.$options._componentTag === 'block' ? this.$parent : this
    this.trigger = ctx.$emit.bind(ctx)
    this.variant = this.metadata && this.metadata.variant
    this.components = plot_create(this.trigger, this.metadata)
    this.components.table.renderTo(this.$el)
    ctx.$emit('mounted', this.components)

    if (!ctx.$listeners.plotclick) ctx.$on('plotclick', ((datum, entities) => {
      if (!this.metadata || !this.metadata.dimension) return
      const dimension = this.metadata.dimension
      if (!entities.length) {
        const filter = this.components.plot.datasets().map(d => d.data()).flatten().filter(d => d.x === datum.x).map('label').join('|')
        return update_filter(dimension, filter)
      }
      update_filter(dimension, datum.label || datum.x)
    }))

    this.rebind()
  },
  watch: {
    data: 'rebind',
    metadata(next) { if (next.keys().length) this.rebind() },
  },
  methods: {
    rebind() {
      if (!this.components || !this.data) return

      let { group, sort, max } = this.metadata
      if (max) {
        // Adjust max in case there are less categories than max.
        max = Math.min(max, this.data.keys().length)
      }
      const length = this.data.map((values, name) => type(values) === 'object' ? values.keys().length : 1)
      let xy = this.data.reduce((acc, values, name) => {
          if (type(values) === 'object') values.map((v, k) => acc.push({ x: name, y: v, label: k }))
          if (type(values) === 'number') acc.push({ x: name, y: values, label: name })
          return acc
        }, [])
        .group(group || 'x')
        .v()
        .sort(sort || (d => -Math.abs(d.sum('y'))))

      if (max) {
        const not_other = xy.slice(0, max - 1).flatten().map('x')
        group = d => not_other.includes(d.x) ? d.x : 'other'
      }
      xy = xy.flatten()
        .group(group || 'x')
        .reduce((acc, grp, name) => {
          if (this.variant !== 'clustered-bar') grp = grp.sort(d => -d.y)
          if (name === 'other' && type(this.data.v().first()) === 'object') {
            // if input type is object of objects; agregate 'other'
            grp = grp.group(d => d.label.split(',')[0]).map((v,k) => ({x: v[0].label.split(',')[0], y: v.sum('y')})).v()
          }
          grp.map((d, i) => {
            acc[i] = acc[i] || []
            if (d.x === d.label) d.x = name
            else if (name === 'other') {
              d.label = d.x
              d.x = name
            }
            acc[i].push(d)
          })
          return acc
        }, [])

      if (max) xy[0] = xy[0].sort((d => d.x === 'other' ? Infinity : this.data[d.x] && -this.data[d.x].v().sum() || -d.y))

      const waterlabel = xy.flatten().group('x').map((grp, k) => ({ x: k, y: grp.sum('y') })).v().filter(d => d.y != 0)
      this.components.xAxis.formatter(x => this.t[x] || x)
      this.components.plot.labelFormatter((n, d) => d && (d.x !== d.label || (length[d.x] || 1) !== 1) && d.label.s() || '')
      if (this.variant !== 'clustered-bar') this.components.plot.extremaFormatter(x => '')
      this.components.waterlabel.labelFormatter(x => '')

      // HACK: DIRTY quick hack for default formatting '+'
      let defaultf = xy.flatten().filter(d => d.y).map(d => Math.abs(d.y)).median() < .005 ? 'bp' : '.2%'
      if ($root.query.metric === 'diff' || ($root.query.evolution && $root.config.datasets[$root.screen.datasets[0]].period === 'daily')) defaultf = '+' + defaultf

      const f = this.metadata.format || defaultf
      const f2 = f.replace ? format(f.replace(/\.\d/, '.1')) : f
      this.components.waterlabel.extremaFormatter(format(f))
      this.components.yAxis.formatter(x => x === 0 ? x : f2(x).replace(/[.,]0/, ''))
      this.components.plot.datasets().map((ds, i) => {
        ds._data = xy[i] || []
        ds._metadata = this.metadata
      })
      if (this.variant === 'clustered-bar') this.components.plot.datasets(this.components.plot.datasets().filter(ds => ds.data().length))
      this.components.waterlabel.datasets([new Plottable.Dataset(waterlabel)])
      this.components.watermark.datasets([new Plottable.Dataset(waterlabel)])
      this.trigger('rebind', this.components)
    },
  },
}
</script>
