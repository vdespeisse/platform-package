const add_plot_factory = ({plots, plot_group, xScale, yScale, trigger, rebind, xGuideline}) => {
  return (plot_name, {
                        plot_type = 'line',
                        dx = (d => d.x),
                        dy = (d => d.y),
                        dy0 = null,
                        autorangeMode,
                        autorangeSmooth,
                        attr,
                        size,
                        curve,
                        symbol,
                      }) => {
    if (plots[plot_name]) return plots[plot_name]
    const new_plot = new Plottable.Plots[plot_type.camelize()]()
                  .x(dx, xScale)
                  .y(dy, yScale)
                  .attr('class', (d, i, ds) => `${d.class} ${ds.metadata().class} ${plot_name}`)
                  .animated(false)


    if (dy0) new_plot.y0(dy0, yScale)
    // .datasets(datasets)
    if (curve) new_plot.curve(curve)
    if (size) new_plot.size(size)
    if (symbol) new_plot.symbol(d => new Plottable.SymbolFactories[symbol]())
    if (autorangeSmooth) new_plot.autorangeSmooth(autorangeSmooth)
    if (autorangeMode) new_plot.autorangeMode(autorangeMode)
    if (attr) attr.reduce((acc, v, k) => acc.attr(k, v), new_plot)
    plots[plot_name] = new_plot
    // setup_interactions(new_plot, trigger, { onPointerMove, onPointerExit, xGuideline })
    plot_group.append(new_plot)
    plot_group.redraw()
    rebind()
    return new_plot
  }
}


const hide_guideline = (guideline) => {
  if (!guideline) return
  guideline.pixelPosition(-10)
}

const get_axis_format = (axis_format) => {
  if (!axis_format) return {}
  if (typeof(axis_format) === 'object') {
    return {
      x_format: axis_format.x,
      y_format: axis_format.y,
    }
  }
  if (typeof(axis_format) === 'string') return {
      x_format: axis_format,
      y_format: axis_format,
  }
  return {}
}

const AXIS_CONFIGS = {
  time_year: Plottable.Axes.Time._DEFAULT_TIME_AXIS_CONFIGURATIONS.at([15]).concat([
    [{ interval: "year", step: 1, formatter: d => d.format('YYYY') }],
    [{ interval: "year", step: 2, formatter: d => d.format('YYYY') }],
    [{ interval: "year", step: 3, formatter: d => d.format('YYYY') }],
  ]),

}
const get_axis_config = (axis_config) => {
  if (type(axis_config) === 'string') return AXIS_CONFIGS[axis_config]
  return axis_config
}

TOOLTIP_FNS = {
  time: (p, { plots, trigger, x_format, y_format, format_tooltip}) => {
    const fn = () => {
      const points = plots.map((plot, plot_name) => {
        const find_fn = (pointer) => (plot.entityNearestByXThenY ? plot.entityNearestByXThenY(pointer) : plot.entityNearest(pointer))
        const point = find_fn(p)
        if (!point) return {}
        const datum = point.datum
        return {
          date: datum.x.format(),
          [plot_name]: format(y_format)(datum.y)
        }
      }).v()
      const tooltip = Object.assign(...points)
      trigger('tooltip', tooltip)
    }
    return fn
  },
  time_stack: (p, { plots, trigger, x_format, y_format, format_tooltip }) => {
    const fn = () => {
      const plot = plots.v()[0]
      const point = plot.entityNearestByXThenY(p)
      if (!point) return
      const date = point.datum.x.iso()
      const tooltip = {
        date: point.datum.x.format()
      }
      plot.datasets().map(ds => {
        const datum = ds.data().find(d => d.x.iso() === date)
        if (!datum) return {}
        tooltip[datum.name] = (format_tooltip) ? format(y_format)(datum.y) : datum.y
        return
      })
      trigger('tooltip', tooltip)
    }
    return fn
  }
}
const get_tooltip_fn = (tooltip_fn) => {
  if (type(tooltip_fn) === 'string') return TOOLTIP_FNS[tooltip_fn]
  return tooltip_fn
}

module.exports = {
  add_plot_factory,
  hide_guideline,
  get_axis_format,
  get_axis_config,
  get_tooltip_fn,
}
