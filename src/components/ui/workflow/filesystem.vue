<style>
.filesystem .node { position: relative; }
.filesystem .active::before { position: absolute;top: 0;left: -16px;width: calc(100% + 32px);height: 100%;content: ' ';background: var(--primary);opacity: 0.3; }
.filesystem .row { height: 30px;padding: 4px;position: relative; }
.filesystem .key { position: relative; }
.filesystem .svg-icon { height: 20px;width: 20px;fill: #676767; }
.filesystem .svg-icon:not(.rotate) { transform: rotate(-90deg); }
.filesystem .dot { height: 6px;width: 6px;border-radius: 6px;position: relative;top: 8px;margin-left: 8px;margin-right: 6px;background: #676767; }
</style>

<template lang="pug">
.filesystem
  .node(v-for="node, key in filetree")
    .row(:class="{ active : [path, key].filter().join('/') === $route.query.filepath }" @click="toggle_node(key, node)" :style="'padding-left: ' + (20 * (path || '').split('/').filter().length) + 'px'")
      a(v-if="node.filter(d => d.includes('/')).length")
        svg-icon(class="icon" :class="{ rotate: !close[key] }" name="pt-keyboard-arrow-down")
      .dot(v-else)
      .key {{ key.titleize() }}
    filesystem(:data="node" :path="[path, key].filter().join('/')" v-if="!close[key]")
</template>

<script>
export const additions = {"props":["data","path"]}
export default {
  data() {
    return {
      close: {}
    }
  },
  mounted() {
    this.close = this.filetree.map((d,k) => true)
  },
  computed: {
    filetree() {
      return this.data.reduce((acc, v) => {
          var array = v.split('/').filter()
          if (array.length <= 1) return acc
          var key = array[0]
          var value = array.slice(1).join('/')
          acc[key] = acc.keys().includes(key) ? acc[key].concat([value]) : [value]
          return acc;
      }, {})
    },
  },
  methods: {
    toggle_node(key, node) {
      Vue.set(this.close, key, !this.close[key])
      if (node.filter(d => d.includes('/')).length) return this.update_query({ filepath: null })
      this.update_query({ filepath: [this.path, key].filter().join('/')})
    }
  }
}
</script>