<template>
<div class="plot-waterfall"></div>
</template>

<script>
const plot_create = (trigger = console.log) => {
  const xScale = new Plottable.Scales.Category().innerPadding(.1).outerPadding(.1)
  const xAxis = new Plottable.Axes.Category(xScale, 'bottom').tickLabelPadding(2).margin(0).endTickLength(0)
  const yScale = new Plottable.Scales.Linear().padProportion(.4)
  const yAxis = new Plottable.Axes.Numeric(yScale, 'left').tickLabelPadding(2).margin(0).endTickLength(0)
  yAxis._computeWidth = () => 45
  yScale.tickGenerator(Plottable.SCALE_5)

  const plot = new Plottable.Plots.Waterfall()
    .x(d => d.x, xScale)
    .y(d => d.y, yScale)
    .total(d => d.total)
    .attr('class', (d, i, ds) => [
      d.type,
      d.class,
      ds.class,
      d.x,
      +d.y > 0 ? 'positive' : 'negative',
      !vm.$route.query[ds.metadata().dimension]
      || vm.$route.query[ds.metadata().dimension].length === 0
      || vm.$route.query[ds.metadata().dimension].split('|').includes(d.x) ? 'active' : 'inactive',
    ].join(' '))
    .labelsEnabled(false) // not implemented in plottable: https://github.com/palantir/plottable/issues/3042
    .addDataset(new Plottable.Dataset([]))

  const gridlines = new Plottable.Components.Gridlines(xScale, yScale)

  const waterlabel = new Plottable.Plots.StackedBar()
    .x(d => d.x, xScale)
    .y(d => d.y, yScale)
    .attr('class', d => 'waterlabel ' + (+d.y > 0 ? 'positive' : 'negative'))
    .labelsEnabled(true)

  const watermark = new Plottable.Plots.Segment()
    .x(d => xScale.scale(d.x) - xScale.rangeBand() / 2)
    .x2(d => xScale.scale(d.x) + xScale.rangeBand() / 2)
    .y(d => d.y, yScale)
    .y2(d => d.y, yScale)
    .attr('class', d => 'watermark ' + (+d.y > 0 ? 'positive' : 'negative'))
    .autorangeMode('none')

  const group = new Plottable.Components.Group([gridlines, plot, waterlabel, watermark])

  const table = new Plottable.Components.Table([
    [size() === 'mobile' ? null : yAxis, group],
    [null, xAxis],
  ])

  const attach = (component) => {
    new Plottable.Interactions.Pointer()
      .attachTo(component)
      .onPointerMove((p) => {
        trigger('tooltip', plot.entityNearest(p).datum)
        const tick_number = Math.floor(p.x / xAxis._scale.stepWidth())
        const tick_value = xAxis._scale.domain()[tick_number]
        const tick_labels = xAxis._content.selectAll('.tick-label text')
        tick_labels.each(function (value, i, elements) {
          d3.select(this).classed('hover', elements[i].innerHTML === tick_value)
        })
        plot.entities().map(entity => entity.selection.classed('hover', false))
        plot.entityNearest(p).selection.classed('hover', true)
      })
      .onPointerExit(() => {
        plot.entities().map(entity => entity.selection.classed('hover', false))
        xAxis._content.selectAll('.tick-label text').each(function (value) {
          d3.select(this).classed('hover', false)
        })
        trigger('tooltip', null)
      })

    new Plottable.Interactions.Click()
      .attachTo(component)
      .onClick((p) => {
        const d = plot.entityNearest(p).datum
        trigger('plotclick', d)
      })
  }
  attach(plot)
  attach(xAxis)

  window.addEventListener('resize', () => table.redraw())

  return Object.freeze({ table, plot, waterlabel, watermark, xAxis, yAxis })
}

export default {
  props: ['data', 'metadata'],
  data() {
    return {
      trigger: null,
      components: null,
    }
  },
  mounted() {
    const ctx = this.$parent.$parent.$options._componentTag === 'brick' ? this.$parent.$parent : this.$parent.$options._componentTag === 'block' ? this.$parent : this
    this.trigger = ctx.$emit.bind(ctx)
    this.components = plot_create(this.trigger)
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

    const rebind = () => {
      this.rebind()
      this.trigger('rebind', this.components)
    }
    this.$watch('data', rebind)
    this.$watch('metadata', rebind)
    rebind()
  },
  methods: {
    rebind() {
      if (!this.components || !this.data) return
      const metadata = this.metadata || {}
      const f = metadata.format || '.3s'
      const dimension = metadata.dimension
      const data = this.data.reduce((acc, v, k) => {
          if (v === null) acc.push({ x: k, y: acc.filter(d => d && !d.total).sum('y'), total: true })
          else acc.push({ x: k, y: v })
          return acc
        }, [])
        .sort(metadata.sortBy)

      this.components.plot.datasets()[0].data(data, { dimension })
      this.components.xAxis.formatter(x => this.t[x] || x)
      this.components.yAxis.formatter(x => x === 0 ? x : format(f.replace(/\.\d/, '.0'))(x))

      const waterlabel = data.map((d, i, ds) => {
        return { x: d.x, y: ds.first(i + 1).filter(d => d && !d.total).sum('y'), delta: d.y, total: i === 0 || d.total }
      })
      let c = data.findIndex(d => d.y) - 1
      this.components.waterlabel.labelFormatter(n => '')
      this.components.waterlabel.extremaFormatter(n => {
        c++
        const d = waterlabel[c]
        if (!d.total) n = d.delta
        return '' + format('+' + f)(n)
      })

      this.components.waterlabel.datasets([new Plottable.Dataset(waterlabel)])
      // this.components.watermark.datasets([new Plottable.Dataset(waterlabel)])
    },
  },
}

</script>
