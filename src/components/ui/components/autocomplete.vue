<style>
h1 .autocomplete { margin-left: auto;padding-left: 24px;background: var(--search) no-repeat left 10px center / 20px, var(--chevron-down) no-repeat right 8px center / 16px;background-color: var(--input); }
.autocomplete { position: relative;display: flex;align-items: center;max-width: 400px;width: 100%;height: 40px;background: var(--input);border-radius: 4px;box-shadow: var(--shadow);transition: 200ms;font: var(--p1);--active: var(--gray1);padding-right: 16px;background: var(--input) no-repeat right 8px center / 16px var(--chevron-down); }
.autocomplete[active] { border-radius: 4px 4px 0 0; }
.autocomplete .values { display: flex;height: 41px;overflow: auto; }
.autocomplete .values span:hover { background: var(--gray2); }
.autocomplete .values::-webkit-scrollbar { width: 1px;height: 1px; }
.autocomplete .category { font-size: 10px; }
.autocomplete span { z-index: 1;cursor: pointer;display: flex;flex-direction: column;justify-content: center;height: 40px;padding: 0 8px;white-space: nowrap;line-height: 1.1; }
.autocomplete input { min-width: 50px;max-width: unset;background: none;box-shadow: none;flex: 1; }
.autocomplete button { z-index: 1;min-width: 40px;padding: 0;background: none;box-shadow: none;font-size: 80%; }
.autocomplete .overlay { position: fixed;top: 0;bottom: 0;left: 0;right: 0; }
.autocomplete .list { z-index: 2;position: absolute;top: 40px;left: 0;width: 100%;max-height: 200px;overflow: hidden auto;display: flex;flex-direction: column;background: var(--gray1);box-shadow: var(--shadow); }
.autocomplete .list .menu { z-index: 2;position: sticky;top: 0; }
.autocomplete .list span { padding: 8px;border-radius: 0;background: var(--input); }
.autocomplete .list, .autocomplete .list span:last-child { border-radius: 0 0 4px 4px; }
.autocomplete:not(.right) .values { order: -1;padding-left: 8px;margin-right: -8px; }
</style>

<template lang="pug">
.autocomplete(:active="active" @click="$el.querySelector('input').focus()")
  input(autocomplete="unset" :placeholder="placeholder" v-model="search" @keydown="keydown" @focus="focus" @blur="blur")
  .values
    span(@click.stop="value instanceof Array ? toggle(v) : $el.querySelector('input').focus()" v-for="v in [value].filter().flat()")
      .category {{ v.split && v.split('.').slice(0, -1).join(' / ') }}
      .label {{ data.access(v) || v }}
  button(@click.stop="toggle(null);exit()" v-if="value && value.length || search")
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-circle"><circle fill="var(--gray3)" cx="12" cy="12" r="10"></circle><line stroke="white" x1="15" y1="9" x2="9" y2="15"></line><line stroke="white" x1="9" y1="9" x2="15" y2="15"></line></svg>
  template(v-if="active")
    .list
      span.menu(@click="menu.pop()" v-if="menu.length") < {{ menu.last() }}
      span(:hover="index === i" @mouseover="index = i" @click="menu.push(k)" v-for="[k, v], i in sorted_list" v-if="v instanceof Object") {{ k }} ({{ v.keys().length }}) >
      span(:active="value instanceof Array ? value.includes(menu.concat(k).join('.')) : value === menu.concat(k).join('.')" :hover="index === i" @mouseover="index = i" @click="toggle(k)" v-else)
        .category {{ k.split && k.split('.').slice(0, -1).join(' / ') }}
        .label {{ v }}
    .overlay(@click.stop.prevent="exit")
</template>

<script>
export const additions = {"props":["data","value","options"]}
export default {
  data() {
    return {
      placeholder: this.options && this.options.placeholder,
      search: '',
      menu: [],
      index: -1,
      active: false,
      focus: () => this.active = true,
      blur: (() => this.active = document.activeElement === this.$el.querySelector('input')).debounce(200),
      exit: () => (this.active = false, this.search = '', this.menu = [], this.$el.querySelector('input').blur()),
      toggle: k => {
        if (this.list[k] instanceof Object && this.list[k]) return (this.menu.push(k), this.index = 0)
        if (this.value instanceof Array) this.$emit('input', k === null ? [] : this.value.toggle(this.data.access(k) || k.includes('.') ? k : this.menu.concat(k).join('.')))
        else this.$emit('input', !k || k === this.value ? null : k.includes('.') ? k : this.menu.concat(k).join('.'))
        setTimeout(this.exit, 0)
      },
      keydown: $event => {
        if ($event.ctrlKey || $event.metaKey) return
        if ($event.key === 'ArrowUp') return this.index = Math.max(-1, this.index - 1)
        if ($event.key === 'ArrowDown') return this.index = Math.min(this.list.keys().length - 1, this.index + 1)
        if ($event.key === 'Enter' && this.index !== -1 && this.list.keys().length) return this.toggle(this.list.keys()[this.index])
        if ($event.key === 'Escape') return this.exit()
        if ($event.key === 'Backspace' && $event.target.selectionStart === 0) return this.toggle(this.value instanceof Array && this.value.length ? this.value.last() : null)
        this.index = -1
      },
    }
  },
  computed: {
    sorted_list() {
      if (this.search) {
        const flat = (obj, prefix) => typeof obj === 'object' ? Object.entries(obj || {}).reduce((acc, [k, v]) => Object.assign(acc, flat(v, [prefix, k].filter(x => x).join('.'))), {}) : { [prefix]: obj }
        const flat_data = Object.entries(flat(this.data)).sort([1, 0])
        return flat_data.filter(RegExp(this.search, 'i')).slice(0, 100)
      }
      return Object.entries(this.data.access(this.menu.join('.'))).sort([1, 0])
    },
    list() {
      return Object.fromEntries(this.sorted_list)
    },
  },
}
</script>