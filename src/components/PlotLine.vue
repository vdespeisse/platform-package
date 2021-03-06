<template>
  <div class="plot-line">
     <button aria-label="refresh" @click="$root.$router.push({ query: null})" style="z-index: 1;position: absolute;top: -40px;right: 0;display: flex;padding: 9px;width: 30px;height: 30px;" v-if="$root.query.domain && !$root.screen.theme">
        <svg version="1.1" style="width: 14px; height: 15px;" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
           width="487.23px" height="487.23px" viewBox="0 0 487.23 487.23"
           xml:space="preserve">
           <g>
              <g>
                 <path d="M55.323,203.641c15.664,0,29.813-9.405,35.872-23.854c25.017-59.604,83.842-101.61,152.42-101.61
                    c37.797,0,72.449,12.955,100.23,34.442l-21.775,3.371c-7.438,1.153-13.224,7.054-14.232,14.512
                    c-1.01,7.454,3.008,14.686,9.867,17.768l119.746,53.872c5.249,2.357,11.33,1.904,16.168-1.205
                    c4.83-3.114,7.764-8.458,7.796-14.208l0.621-131.943c0.042-7.506-4.851-14.144-12.024-16.332
                    c-7.185-2.188-14.947,0.589-19.104,6.837l-16.505,24.805C370.398,26.778,310.1,0,243.615,0C142.806,0,56.133,61.562,19.167,149.06
                    c-5.134,12.128-3.84,26.015,3.429,36.987C29.865,197.023,42.152,203.641,55.323,203.641z"/>
                 <path d="M464.635,301.184c-7.27-10.977-19.558-17.594-32.728-17.594c-15.664,0-29.813,9.405-35.872,23.854
                    c-25.018,59.604-83.843,101.61-152.42,101.61c-37.798,0-72.45-12.955-100.232-34.442l21.776-3.369
                    c7.437-1.153,13.223-7.055,14.233-14.514c1.009-7.453-3.008-14.686-9.867-17.768L49.779,285.089
                    c-5.25-2.356-11.33-1.905-16.169,1.205c-4.829,3.114-7.764,8.458-7.795,14.207l-0.622,131.943
                    c-0.042,7.506,4.85,14.144,12.024,16.332c7.185,2.188,14.948-0.59,19.104-6.839l16.505-24.805
                    c44.004,43.32,104.303,70.098,170.788,70.098c100.811,0,187.481-61.561,224.446-149.059
                    C473.197,326.043,471.903,312.157,464.635,301.184z"/>
              </g>
           </g>
        </svg>
     </button>
  </div>
</template>

<script>
const plot_create = (trigger = console.log, variant = 'line', mini = false, curve = 'linear', xAxisNumeric = false) => {
  const xScale = xAxisNumeric ? new Plottable.Scales.Linear().padProportion(0) : new Plottable.Scales.Time().padProportion(0)
  const xAxis = xAxisNumeric ? new Plottable.Axes.Numeric(xScale, 'bottom') : new Plottable.Axes.Time(xScale, 'bottom')

  const yScale = new Plottable.Scales.Linear()
  const yAxis = new Plottable.Axes.Numeric(yScale, 'left').tickLabelPadding(2).margin(0)
  if(!xAxisNumeric){
    xAxis.__computeHeight = xAxis._computeHeight
    xAxis._computeHeight = (...args) => xAxis.__computeHeight(...args) && 10
  }
  yAxis._computeWidth = () => 45
  yScale.tickGenerator(Plottable.SCALE_5)

  const plot = new Plottable.Plots[variant.capitalize()]()
    .x(d => d.x, xScale)
    .y(d => d.y, yScale)
    .attr('class', (d, i, ds) => d.class + ' ' + ds.metadata().class)
    .attr('stroke', 'var(--primary)')
    .autorangeMode('y')
    .animated(false)
    .curve(curve)

  const segment = new Plottable.Plots.Segment()
    .x(d => d.x || xScale.domain()[0], xScale)
    .x2(d => d.x2 || d.x || xScale.domain()[1], xScale)
    .y(d => d.y || yScale.domain()[0], yScale)
    .y2(d => d.y2 || d.y || yScale.domain()[1], yScale)
    .attr('class', (d, i, ds) => d.class + ' ' + ds.metadata().class)
    .autorangeMode('none')

  const gridlines = new Plottable.Components.Gridlines(xScale, yScale)

  const xGuideline = new Plottable.Components.GuideLineLayer('vertical').scale(xScale)
  const xDragbox = new Plottable.Components.XDragBoxLayer()
    .xScale(xScale)
    .onDragEnd(box => trigger('brush', xDragbox.xExtent()))
    .movable(true)
    .resizable(true)

  let tooltip = null
  new Plottable.Interactions.Pointer()
    .attachTo(plot)
    .onPointerMove((p) => {
      if (!plot.entityNearestByXThenY(p)) return
      if (eq(tooltip, plot.entityNearestByXThenY(p).datum)) return
      tooltip = plot.entityNearestByXThenY(p).datum
      trigger('guideline', xAxisNumeric ? tooltip.x : tooltip.x.format(tooltip.date_time_format))
    })
    .onPointerExit(() => {
      tooltip = null
      trigger('guideline', null)
      xGuideline._value = null
      xGuideline._pixelPosition = null
      xGuideline.render()
    })

  new Plottable.Interactions.Click()
    .attachTo(xAxis)
    .onClick((p) => {
      const d = plot.entityNearest(p).datum
      if (xAxis._mostPreciseConfigIndex === 0 && p.y < 16) return update_query({ domain: d.x.plus('10 days').format('YYYY-MM') })
      return update_query({ domain: d.x.format('YYYY') })
    })

  new Plottable.Interactions.Click()
    .attachTo(plot)
    .onClick(p => {
      trigger('plotclick', plot.entityNearest(p).datum)
    })

  const group = new Plottable.Components.Group([gridlines, plot, segment, xGuideline, xDragbox])
  const table = new Plottable.Components.Table([
    [(size() === 'mobile' || mini) ? null : yAxis, group],
    [null, xAxis],
  ])

  const components = Object.freeze({ table, plot, segment, xGuideline, xDragbox, xAxis, yAxis })
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
    this.components = plot_create(this.trigger, this.metadata && this.metadata.variant, this.metadata && this.metadata.mini, this.metadata && this.metadata.curve, this.metadata && this.metadata.xAxisNumeric)
    this.components.table.renderTo(this.$el)
    ctx.$emit('mounted', this.components)
    ctx.$on('guideline', t => this.trigger('tooltip', this.find(t)))
    if (!ctx.$listeners.brush) ctx.$on('brush', domain => {
      domain = domain.map(d => d.format())
      if (domain[0] === domain[1]) return update_query({ domain: domain[0].slice(0, 7) })
      return update_domain(domain)
    })

    this.rebind()

    if (!$root.screen.theme) {
      this.$watch('data', this.rebind)
      this.$watch('metadata', next => { if (next.keys().length) this.rebind() })
      this.$watch('$route.query.domain', this.rebrush)
    }
  },
  destroyed() {
    this.components.table.destroy()
  },
  methods: {
    rebind() {
      if (!this.components || !this.data) return
      // TODO: handle multiple lines in a better
      const time = '' + new Date(this.data.keys()[0]) === 'Invalid Date'
      const date_time_format = time ? 'hh:mm:ss' : 'YYYY-MM-DD'
      const today = new Date().format()
      const xy = this.data.reduce((acc, values, x) => {
          if (type(values) === 'object') values.map((v, k) => acc.push({ x: /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(x) ? new Date(time ? today + ' ' + x : x) : +x, y: v, label: k, date_time_format }))
          if (type(values) === 'number') acc.push({ x: type(x) === 'number' ? x: new Date(time ? today + ' ' + x : x), y: values, label: x, date_time_format })
          if (!values) acc.push({ x: x, y: null, label: x, date_time_format })
          return acc
        }, [])
        .sort((a, b) => a.x - b.x)
        .group('x')
        .reduce((acc, grp, name) => {
            grp
            .map((d, i) => {
              acc[i] = acc[i] || []
              if (d.x === d.label) d.x = name
              acc[i].push(d)
            })
            return acc
          }, [])

      const datasets = xy.map((d, i) => new Plottable.Dataset(d, { class: d.first().label }))
      const config = xy[0].last().x - xy[0].first().x < 20 * 86400000
        ? Plottable.Axes.Time._DEFAULT_TIME_AXIS_CONFIGURATIONS.at([15])
        : Plottable.Axes.Time._DEFAULT_TIME_AXIS_CONFIGURATIONS.at([16]).concat([
          [{ interval: "year", step: 1, formatter: d => d.format('YYYY') }],
          [{ interval: "year", step: 2, formatter: d => d.format('YYYY') }],
          [{ interval: "year", step: 3, formatter: d => d.format('YYYY') }],
        ])

      this.components.plot.datasets(datasets)
      this.rebrush()
      if (!time && !this.metadata.xAxisNumeric) this.components.xAxis.axisConfigurations(config)
      if (this.metadata && this.metadata.format) this.components.yAxis.formatter(format(this.metadata.format))
      this.trigger('rebind', this.components)
    },
    rebrush() {
      this.components.xDragbox.boxVisible(false)
      // if (!$root.domain.length) return this.components.xDragbox.boxVisible(false)
      // const domain = $root.domain.map(d => new Date(d))
      // this.components.xDragbox.xExtent(domain)
      // return this.components.xDragbox.boxVisible(true)
    },
    find(t) {
      if (t === null || !this.data) return null
      if (type(this.data[t]) === 'object') return Object.assign({ date: t }, this.data[t])
      return ({ date: t, y: this.data[t] })
    },
  },
}

</script>
