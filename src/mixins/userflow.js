const cacheMixin = {
  beforeCreate() {
    const $data = this.$options.data || (() => ({}))
    const $cache = this.$options.cache || {}

    this.$options.data = () => {
      const data = $data.call(this)

      for (const key in $cache) {
        data[key] = $cache[key].call(this)
      }

      return data
    }
  },
  created() {
    const $cache = this.$options.cache || {}

    for (const key in $cache) {
      this.$watch($cache[key], (next, prev) => {
        if (JSON.stringify(next) !== JSON.stringify(prev)) this[key] = next
      }, { deep: true, immediate: true })
    }

  },
}

export default {
  data() {
    return {
      app: localStorage.app || '',
    }
  },
  watch: {
    app() {
      localStorage.app = this.app
    },
  },
  mixins: [cacheMixin],
  cache: {
    // TODO document url interpretation (expecting a function, what the signature is)
    // TODO prefer using actual code or actual config rather than `eval(string)`
    // TODO This is a watched property in `xfilter`. Fetching is handled by `xfilter`, consider decoupling data retrieval from data transformation.
    urls() { // []
      try {
        this.userflow
        this.screen
        this.query
        if (!this.screen.datasets) return [];

        // TODO this should filter on datasets actually used for the screen, something like
        // let urlValues = this.screen.datasets
        //   .map(dataset => this.config.datasets[dataset])
        //   .map(ds => {
        //     let urlResolveFunction = eval(ds.url_fn);
        //     let resolvedUrls = urlResolveFunction(this);
        //     return resolvedUrls[0];
        //   })
        //   .sort()
        //   .unique();
        let urlValues = this.config.datasets
          .map(ds => {
            let urlResolveFunction = eval(ds.url_fn);
            let resolvedUrls = urlResolveFunction(this);
            return resolvedUrls[0];
          })
          .v()
          .sort()
          .unique();
        // TODO consider returning an object { dataset1 : url1, ...} instead of an array of datasets that xfilter will have to match to actual dataset keys (by reevaluating the previous url resolving logic again).
        return urlValues;
      } catch(e) { return [] }
    },
    datareportUrls() { // []
      try {
        if (!this.screen || !this.screen.datareports) return [];

        let urlValues = this.screen.datareports
          .unique()
          .sort()
          .map(datareport => ({datareport, config: this.config.datareports[datareport]}))
          .map(({datareport, config}) => {
            if (!config.url_fn) return null;
            let urlResolveFunction = eval(config.url_fn);
            let url = urlResolveFunction(this.params);
            return {datareport, url};
          })
          .filter(urlConfig => urlConfig !== null);

        return urlValues;
      } catch(e) { return [] }
    },
    userflow() { // {}
      try {
        const u = this.$route.params.userflow.split('-')[0]
        const db = this.asofdb || this.db
        if (db[['userflows', $root.app].join('-')]) return this.db[['userflows', $root.app].join('-')][u]
        return db.userflows[u]
      } catch(e) {
        return {}
      }
    },
    share() { // {}
      try {
        const u = this.$route.params.userflow.split('-')[0]
        const share_isin = this.$route.params.userflow.split('-')[1]
        const db = this.asofdb || this.db
        return db.userflows[u].shares[share_isin]
      } catch(e) {
        return {}
      }
    },
    benchmark() {
      try{
        return this.share.benchmark || this.userflow.benchmark
      }
      catch(e){
        return ''
      }
    },
    screens() { // []
      try {
        const config = this.config
        return config.userflow.map(screen => config.screens[screen] || { path: screen })
      } catch(e) {
        return []
      }
    },
    screen() { // {}
      try {
        const s = this.$route.params.screen || this.$route.path.slice(1) || 'slash'
        return this.config.screens[s] || {}
      } catch(e) {
        return {}
      }
    },
    filters() { // {}
      try {
        const dimensions = (this.userflow.dimensions || []).concat(this.screen.dimensions || []).concat(this.share.dimensions_pdf || [])
        const filters = this.$route.query
          .filter((v, k) => !dimensions.length || dimensions.includes(k))
          .map(v => typeof v === 'string' ? v.split('|') : v)
        filters.domain = this.domain
        dimensions.map(dim => filters[dim] = filters[dim])
        return filters
      } catch(e) {
        return {}
      }
    },
    active_filters() { return this.filters && this.filters.filter((v, k) => v && k !== 'domain').v().sum('length') },
    period() {
      try {
        const days = (new Date(this.domain[1]) - new Date(this.domain[0])) / 86400000
        if (4 <= days && days <= 7) return ['weekly', new Date(this.domain[1]).format('%Y-W%W', this.lang.split('_')[0])]
        if ((28 <= days && days <= 31) || (/[0-9]{4}-[0-9]{2}/.test(this.$route.query.domain) && days < 35)) return ['monthly', new Date(this.domain[1]).format('day, month, year', this.lang.split('_')[0])]
        if ((89 <= days && days <= 92) || (/[0-9]{4}-[0-9]{2}/.test(this.$route.query.domain) && days < 95)) return ['quarterly', new Date(this.domain[1]).format('day, month, year', this.lang.split('_')[0])]
        if (181 <= days && days <= 185) return ['biannual', new Date(this.domain[1]).format('day, month, year', this.lang.split('_')[0])]
        if (363 <= days && days <= 366) return ['annual', new Date(this.domain[1]).format('day, month, year', this.lang.split('_')[0])]
        return ['custom', this.t.from + ' ' + new Date(this.domain[0]).format('day, mon, year', this.lang.split('_')[0]) + ' ' + this.t.to + ' ' + new Date(this.domain[1]).format('day, mon, year', this.lang.split('_')[0])]
      } catch(e) {
        return []
      }
    },
    domain() { // []
      try {
        //TODO Manage case with no datasets (kiid dci)
        const find_domain = (closing) => { return { 'Q1': 'XXXX-01|XXXX-03', 'Q2': 'XXXX-04|XXXX-06', 'Q3': 'XXXX-07|XXXX-09', 'Q4': 'XXXX-10|XXXX-12'}[closing.slice(5,7)].replace(/XXXX/g, closing.slice(0,4))}
        let d = (this.$route.query.domain && (this.$route.query.domain.includes('Q') ? find_domain(this.$route.query.domain).split('|') : this.$route.query.domain.split('|')) ) || [];
        const dates = this.x[this.screen.datasets[0]].dates.keys()
        const first_date = dates.first()
        const last_date = dates.last()
        if(d.length > 0 && !this.$route.query.domain.includes('Q')){
          const fmt = d[0].length <= 7 ? 'Y-MM' : 'Y-MM-D'
          const fd =  new Date(dates.first())
          const d1 = new Date(d[0]) < fd ? fd.format() : d[0]
          const d2 = new Date(d[1]) <= fd ? fd.plus('2 month').format(fmt) : d[1]
          update_query({ domain: ('' + d1) + (d[1] ? '|' + d2 : '') })
        }
        if (d.length === 0 && this.config.datasets[this.screen.datasets[0]].period === 'inception') return [first_date, last_date]
        if (d.length === 0) d = [last_date.slice(0, 4)]
        if (d.unique().length === 1 && d[0].length === 4) d = [new Date(d[0]).start('year').minus('1 day').format(), [new Date(d[0]).end('year').format(), last_date].min()]
        if (d.unique().length === 1 && d[0].length === 7) d = [new Date(d[0]).start('month').minus('1 day').format(), [new Date(d[0]).end('month').format(), last_date].min()]
        if (d[0].length === 7) d[0] = new Date(d[0]).start('month').minus('1 day').format()
        if (d.length === 1) d = [new Date(d[0]).start('month').minus('1 day').format(), d[0]]
        if (d[1].length === 7) d[1] = [new Date(d[1]).end('month').format(), last_date].min()
        if (d[0] < first_date) d[0] = first_date
        if (d[0] > last_date) d[0] = last_date
        if (d.unique().length === 2 && d[1] < first_date) d[1] = first_date
        if (d.unique().length === 2 && d[1] > last_date) d[1] = last_date


        if (!dates.includes(d[0])) {
          d[0] = dates.filter(p => p < d[0]).last() || d[1]
        }
        if (!dates.includes(d[1])) {
          d[1] = dates.filter(p => p < d[1]).last()
        }
        if (this.config.datasets[this.screen.datasets[0]].period === 'daily' && !this.$route.query.evolution) return [d[1], d[1]]
        return d
      } catch(e) {
        return [new Date().minus('1 month').format(), new Date().format()]
      }
    },
    dates() {
       try {
         return this.x[this.screen.datasets[0]].dates.keys()
       } catch(e) {
         return []
       }
     },
    domains() {
      if (!this.dates || !this.dates.length) return
      const first_date = new Date(this.dates.first())
      const last_date = new Date(this.dates.last())
      const domains = {}
      domains.ytd = [last_date.minus('1 year').end('year'), last_date]
      domains.mtd = [last_date.minus('1 month').end('month'), last_date]
      if (last_date.minus('1 month') > first_date) domains['1m'] = [last_date.minus('1 month'), last_date]
      if (last_date.minus('1 year') > first_date) domains['1y'] = [last_date.minus('1 year'), last_date]
      if (last_date.minus('3 years') > first_date) domains['3y'] = [last_date.minus('3 years'), last_date]
      if (last_date.minus('5 years') > first_date) domains['5y'] = [last_date.minus('5 years'), last_date]
      domains.inception = [first_date, last_date]
      return domains
    },
    compare() {
      try {
        return this.$route.query.compare && decodeURIComponent(this.$route.query.compare).split('&').reduce((acc, v) => {
          acc[v.split('=')[0]] = decodeURIComponent(v.split('=')[1]);
          return acc
        }, {}) || {}
      } catch(e) {
        return {}
      }
    },
    config() {
      try {
        return this.db[['config', (this.query.app || this.app).replace('default', '')].filter().join('-')] || {}
      } catch(e) {
        return {}
      }
    },
    query() {
      try {
        return this.$route.query.filter((v, k) => !['menu', 'filters', 'period'].includes(k))
      } catch(e) {
        return {}
      }
    },
    params() {
      try {
        return this.$route.params
      } catch(e) {
        return {}
      }
    },
  },
}
