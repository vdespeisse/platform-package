const ms = +(localStorage.fps || 500)
let time = performance.now()
function fps() {
  requestAnimationFrame(fps)
  const t = performance.now()
  if (t - time > (ms || 50)) console.log(`IO|Block ${~~(t - time)}ms`)
  time = t
}
fps()

export default {
  beforeCreate() {
    const component = this.$vnode ? this.$vnode.tag.split('-').slice(3).join('-') : '$root'
    const $computed = this.$options.computed
    const $methods = this.$options.methods
    // http://dealwithjs.io/design-patterns-decorating-in-javascript/
    function log_decorator(fn, key) {
      return function fn_decorated() {
        let start = performance.now()
        let result = fn.apply(this, arguments)
        let time = performance.now() - start
        if (time > ms) {
          const stringify = arg => {
            const type = Object.prototype.toString
              .call(arg)
              .slice(8, -1)
              .toLowerCase()
            if (type === 'function') return arg.toString()
            if (type === 'array') return '[' + arg.length + ']'
            if (type === 'object') return '{' + Object.keys(arg).length + '}'
            if (type === 'string') return arg.length > 6 ? arg.slice(0, 3) + '…' : arg
            if (type === 'number') return arg.toPrecision(2)
          }
          const signature = Array.from(arguments).map(stringify).join(', ')
          // const stack = new Error().stack.match(/Vue[^ ]*/g)
          console.log(`${time.toFixed(0)} ms - ${component}.${key}(${signature})`)
        }
        return result
      }
    }
    for (const key in $computed) {
      if ($computed[key].name === 'fn_decorated') return
      this.$options.computed[key] = log_decorator($computed[key], key)
    }
    for (const key in $methods) {
      if ($methods[key].name === 'fn_decorated') return
      this.$options.methods[key] = log_decorator($methods[key], key)
    }
  },
}
