import {fetchAndTransform} from './cachedFetch.js';

export default {
  data() {
    return {
      x: null,
    }
  },
  computed: {
    xf() {
      return this.config.datasets
        .filter((ds, name) => this.screen.datasets.includes(name))
        .map((ds, name) => this.xfilter(this.x[name], {
          inc: ds.inc_fn && eval(ds.inc_fn)(this) || (v => v),
          post: ds.post_fn && eval(ds.post_fn)(this),
          filters: this.filters,
          dimensions: (ds.dimensions || this.filters.keys().filter(k => k !== 'domain')).concat(ds.period === 'daily' ? ['date'] : []),
        }))
    },
  },
  created() {
    // TODO comment on why this $watch syntax instead of classic watch key
    this.$watch(() => this.urls, next => {
      if (!next || !next.length || !this.config.datasets) return
      // TODO avoid programming by side effects
      window.mapping = window.mapping || {}

      const csvTransform = (ds, dimensions, params) => data => {
          const dates = {}
          const columns = data.match(/.+/)[0].split(',')
          const structure_fns = (params.structure || {})
             //TO DO: LGA Extraire l'enrichissement du fichier brut avec le mapping, en cas de changement de dimensions
             // on continue à travailler avec celle en cache
            .filter((type, field) => !dimensions || !/^\w+$/.test(type) || columns.concat(dimensions).includes(field))
            .map((type, field) => {
              if (type === "number" || type === "float" || type === "int") return d => +d[field] || 0
              if (type === "string" || type === "date") return d => d[field]
              return eval(type)
            })
          const csv = d3.csvParse(data, (l, li) => {
            if (l.date && dates[l.date] === undefined) dates[l.date] = li
            if (ds !== 'mapping' && (l.id || l.isin)) dimensions.filter(dim => !structure_fns[dim]).map(dim => l[dim] = mapping[(l.id || l.isin)] && mapping[(l.id || l.isin)][dim] || 'NA')
            structure_fns.map((fn, k) => l[k] = fn(l, k))
            return l
          })
          csv.dates = dates
          return csv;
      };

      // TODO Data retrieval should be performed by `userflow`
      const download = url => {
        // TODO isn't this already evaluated in `userflow.urls`. Avoid double evaluation
        const ds = this.config.datasets.find(ds => eval(ds.url_fn)(this)[0] === url)
        const dimensions = (this.userflow.dimensions || (mapping && mapping.v() && mapping.v()[0] && mapping.v()[0].keys()) || []).concat(vm.screen.dimensions).concat(this.share.dimensions_pdf).filter().unique()

        // ASOF url transformation
        if(url.includes('?path=mapping.csv') && $root.query.asof) {
          url = url.replace('?path=mapping.csv', `?path=asof/mapping-${format_asof($root.query.asof)}.csv`);
        }
        const params = this.config.datasets[ds]

        return fetchAndTransform(url, csvTransform(ds, dimensions, params), {cache : !$root.query.asof})
          .then(data => {
            // TODO why is this needed `csv.url` ? Keeping for now to avoid breaking things
            // Previously csv.url = url
            data.url = url;
            return data;
          });
      }
      this.x = null
      // Again `eval(this.config.datasets.mapping.url_fn)(this)[0])`
      Promise.resolve(this.config.datasets.mapping && download(eval(this.config.datasets.mapping.url_fn)(this)[0]))
        .then(m => window.mapping = m && m.reduce((acc, d) => (acc[d.id || d.isin] = d, acc), {}))
        .then(() => Promise.all(next.map(download)))
        .then(d => next.reduce((acc, url, i) => (acc[url] = d[i], acc), {}))
        .then(downloads => this.x = Object.freeze(this.config.datasets.map(ds => downloads[eval(ds.url_fn)(this)[0]]))) // ... and again
    }, { deep: true, immediate: true })
  },
  methods: {
    xfilter(data, { inc, post, filters, dimensions }) {
      // prefiltering by date
      const dates = data.dates
      const domain = filters.domain
      if (domain && dates.keys().length) {
        const d0 = dates[dates.keys().find(k => k >= domain[0])] // same date (or next)
        const after_d1 = dates[dates.keys().find(k => k > domain[1])] // next date
        data = data.slice(d0, after_d1)
      }

      const xf = { data: [] }
      filters = filters.filter((v, k) => v && dimensions.includes(k))
      dimensions.map(dim => xf[dim] = {})

      data.forEach((line, i) => {
        dimensions.filter(dim => !xf[dim][line[dim]]).map(dim => xf[dim][line[dim]] = null)
        const filtered = filters.reduce((acc, fil, dim) => {
          if (fil.includes(line[dim])) return acc
          acc.push(dim)
          return acc
        }, [])
        if (filtered.length === 1) {
          const dim = filtered[0]
          xf[dim][line[dim]] = inc(xf[dim][line[dim]], line)
        }
        if (filtered.length) return
        xf.data.push(line)
        dimensions.map(dim => xf[dim][line[dim]] = inc(xf[dim][line[dim]], line))
      })

      if (post) return post(xf)
      return xf
    },
  },
}
