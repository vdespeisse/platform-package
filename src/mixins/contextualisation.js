export default {
  computed: {
    context() {
      if (!this.$route.matched.first()) return []
      return [
        'path' + this.$route.matched.last().path.replace(/\//g, '-').replace(/:/g, ''),
        this.$route.query.reduce((acc, v, k) => acc.push([k,v].join('-')) && acc, []),
        this.$route.params.reduce((acc, v, k) => acc.push([k,v].join('-')) && acc, []),
        this.domain ? this.domain.unique().length === 1 ? 'single-date' : 'multi-date' : 'no-date',
        this.screen.path === 'slash' && 'screen-slash',
        this.screen.theme && 'screen-pdf',
        this.userflow && this.userflow.name && 'userflow-' + this.userflow.name,
        this.userflow && this.userflow.category && 'category-' + this.userflow.category,
        $root.benchmark && 'benchmark-' + $root.benchmark,
        this.app,
        localStorage.PROJECT,
        window !== window.top && 'iframe',
      ].flatten().filter().map(d => d.replace(/[ %€]/g, x => x.charCodeAt(0))).join(' ')
    },
    css() {
      // HACK: Install config components - Available everywhere
      // TODO move component instantiation to a dedicated place
      const components = this.config && this.config.components && JSON.parse(JSON.stringify(this.config.components)) || {}
      // TODO avoid programming by hidden side effects. why use map instead of forEach.
      Object.keys(components).map(name => Vue.component_eval(name, components[name]))
      if (this.config.css) document.querySelector('.splashscreen').className = 'splashscreen transparent'
      return this.config.css
    },
    cssvar() {
      const cssvar = {}
      cssvar.icon = cssvar.logo = cssvar.nav = 'url(icon.png)'
      $root.css.replace(/;base64/g, ':base64').replace(/(--[\w-]+): ([^;]*);/g, (m, p, s) => cssvar[p.slice(2)] = s.replace(/:base64/g, ';base64'))
      if ($root.screen.style) $root.screen.style.replace(/;base64/g, ':base64').replace(/(--[\w-]+): ([^;]*);/g, (m, p, s) => cssvar[p.slice(2)] = s.replace(/:base64/g, ';base64'))
      return cssvar
    },
    cssvar_colors() {
      const mix = function(c1, c2, p = 0.5) {
        const [r1, g1, b1] = d3.color(c1).toString().slice(4, -1).split(', ').map(Number)
        const [r2, g2, b2] = d3.color(c2).toString().slice(4, -1).split(', ').map(Number)
        return d3.color(`rgb(${[
          Math.round((1 - p) * r1 + p * r2),
          Math.round((1 - p) * g1 + p * g2),
          Math.round((1 - p) * b1 + p * b2),
        ].join(', ')})`).toString().hex()
      }
      const cssvar = {}
      this.config.css.replace(/;base64/g, ':base64').replace(/(--[\w-]+): ([^;]*);/g, (m, p, s) => cssvar[p.slice(2)] = s.replace(/:base64/g, ';base64'))
      if ($root.screen.style) $root.screen.style.replace(/;base64/g, ':base64').replace(/(--[\w-]+): ([^;]*);/g, (m, p, s) => cssvar[p.slice(2)] = s.replace(/:base64/g, ';base64'))
      const base = cssvar.primary || '#0ed8b8'
      const primary_light = mix(base, 'white', .9)
      const primary_dark = mix(base, 'black', .15)
      return `:root { --primary-dark: ${primary_dark};--primary-light: ${primary_light};--primary-rgb: ${d3.color(base).toString().slice(4, -1)}; }`
    },
  },
}
