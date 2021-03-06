<style>
.board input[type=checkbox] { -webkit-appearance: none;width: 18px;height: 18px;padding: 0;border: 2px solid #777;position: relative; }
.board input[type=checkbox]::before {content: " ";position: absolute;z-index: 1;top: -14px;right: -14px;width: 40px;height: 40px; }
.board .all_actions { width: 100%;justify-content: space-between; }
.board button.icon:disabled { background: white; fill: #ddd; }
.board .select-all.all, .board input[type=checkbox]:checked { background-color:var(--text-dark);border-color: var(--text-dark); }
.board .select-all.all::after, .board input[type=checkbox]:checked::after { position: absolute;top: -2px;left: -2px;width: 18px;height: 18px;content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFF"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'); }
.board .select-all:hover, .board input[type=checkbox]:hover { border-color: var(--text-dark);cursor: pointer; }
.board .select-all { width: 18px;height: 18px;padding: 0;border-radius: 4px;border: 2px solid #777;position: relative; }
.board .select-all.partial { background: #777; }
.board .select-all.partial::after { position: absolute;top: -1px;left: -1px;width: 38px;height: 28px;content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFF"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 4h2c.6 0 1 .4 1 1s-.4 1-1 1H2c-.6 0-1-.4-1-1s.4-1 1-1h4z" /></svg>'); }
.board .select-all.partial:hover { background: var(--text-dark); }

.board .even { background: var(--primary-light); }
.board .line { position: relative;display: flex;flex-wrap: wrap;align-items: center;justify-content: center;min-height: 30px;padding: 8px;border-radius: var(--border-radius);font: var(--p2); }
.board .line.first-line { cursor: pointer;font-weight: 600;user-select: none; }
.board.nohead .line.first-line,
.board.nosort .line.first-line { pointer-events: none; }
.nosort :matches(.asc, .desc)::before { display: none; }
.board .line .cell { flex: 1;padding: 0 4px;word-break: break-word;text-align: center;min-width: 0;display: flex;flex-direction: column;align-items: center;justify-content: center; }
section.plus { width: 100%;padding: 8px; }
.subline { width: 100%; }
.sort.asc, .sort.desc { text-decoration: underline; }
.board.click .line:not(.first-line):not([class*="grp-"]) { cursor: pointer;padding-left: 4px;border-bottom-left-radius: 0;border-left: 4px solid transparent;border-top-left-radius: 0; }
.board.click .line:not(.first-line):not([class*="grp-"]):hover { background: rgb(255, 221, 68, 0.15); }
.board.click .line:not(.first-line):not([class*="grp-"]).active { border-color: var(--highlight); }
.board [class*="grp-"] { margin-top: 10px;margin-left: -16px;background: white!important;border-radius: 0!important;font-weight: 600!important; }
.board [class*="grp-"] .plus .icon { display: none; }
.board .grp-1 { border-bottom: 4px solid var(--cat1); }
.board .grp-2 { border-bottom: 4px solid var(--cat2); }
.board .grp-3 { border-bottom: 4px solid var(--cat3); }
.board .grp-4 { border-bottom: 4px solid var(--cat4); }
.board .grp-5 { border-bottom: 4px solid var(--cat5); }
.board .grp-6 { border-bottom: 4px solid var(--cat6); }
.board .grp-7 { border-bottom: 4px solid var(--cat7); }
.board .grp-8 { border-bottom: 4px solid var(--cat8); }
.board .grp-9 { border-bottom: 4px solid var(--cat9); }
.board .grp-10 { border-bottom: 4px solid var(--cat10); }

.board .line .tooltip { display: none;position: absolute;right: 0;top: 0;height: 100%;padding: 0 10px;background: white; }
.board .line:not(.first-line):hover::before { z-index: 1;position: absolute;height: 100%;width: 100%;content: ' ';box-shadow: var(--box-shadow);border-radius: var(--border-radius);pointer-events: none; }
.board .line:not(.first-line):hover > .tooltip { display: flex;align-items: center;justify-content: center; }

.board .vertical-line-top { border-left: 2px solid #777;height: 23px;position: absolute;top: 0;left: 16px; }
.board .vertical-line-bottom { border-left: 2px solid #777;height: 23px;position: absolute;bottom: 0;left: 16px; }
.board .horizontal-line { border-bottom: 2px solid #777;width: 10px;position: absolute;left:16px; }
.board .single .vertical-line-top, .single .vertical-line-bottom, .single .horizontal-line { display: none; }
.board .main_line .cell .vertical-line-top, .main_line > .cell > .horizontal-line { display: none; }
.board .main_line .cell .vertical-line-bottom { height: 15px;top: 31px; }
.board .select input { position: absolute; left: 8px;top: 14px; }
.board .subline input { left: 25px; }
.board .group .line:last-child .vertical-line-bottom { display: none; }
.board .line.first-line .cell.select { display: flex;justify-content: flex-start;align-items: left; }
.board .line.first-line .cell.asc::before { position: absolute;width: 18px;height: 18px;right: -15px;content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); }
.board .line.first-line .cell.desc::before { position: absolute;width: 18px;height: 18px;right: -15px;content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>'); }
.board .select.cell { width: 20px; }
.board .select a { position: absolute;top: 11px;left: 23px; fill: #777; }
</style>

<template lang="pug">
.board(:class="{ click: !!click_ }")
  .actions.row.center.left.expand
    slot(name="actions" :selected_lines="selected_lines")
  .line.first-line
    .cell.select(v-if="select_")
      .select-all(:class="select_all_state" @click="select_all")
      a(@click="collapsed = window.eq(collapsed.unique(), lines.map('_group_id').unique()) ? [] : lines.map('_group_id').unique()" v-if="!window.eq(lines.map('_group_id').unique(), lines.map('_line_id').unique())")
        svg-icon(class="icon" :name="window.eq(collapsed.unique(), lines.map('_group_id').unique()) ? 'pt-keyboard-arrow-up' : 'pt-keyboard-arrow-down'")
    .cell(:class="[k, { asc: sort_ == k, desc: sort_ == '-' + k }]" :tt="t[k] || k.titleize()" @click="sort_ = sort_ === k ? '-' + k : k" v-for="k, i in columns_ || data[0].keys()")
      slot(:name="'header-' + k")
        div {{ t[k] || k.titleize() }}
  .group(v-for="line in lines")
    .line(:class="[line._class, { even: line._line_id % 2 === 0, main_line: line._group && line._group.length, single: !line._group || !line._group.length, active: click_ && $root.query[click_] === line[click_] }]" @click="(update_query({ [click_]: $root.query[click_] === line[click_] ? null : line[click_] })) || (select_ && (selected = selected.toggle(line._line_id)))")
      .cell.select(v-if="select_")
        .vertical-line-top
        .vertical-line-bottom
        .horizontal-line
        input(type="checkbox" :value="line._line_id" @click.stop="" @input="selected = selected.toggle(line._line_id)" v-model="selected")
        a(@click.stop="" @click="collapsed = collapsed.toggle(line._group_id)" v-if="line._group && line._group.length")
          svg-icon(class="icon" :name="collapsed.includes(line._group_id) ? 'pt-keyboard-arrow-up' : 'pt-keyboard-arrow-down'")
      .cell(:class="k" v-for="k in columns_ || data[0].keys()")
        slot(:name="'cell-' + k" :line="line" :column="k") {{ format(k)(line[k]) }}
      .tooltip
        slot(name="tooltip" :line="line")
      section.plus(:key="line[expand_]" v-if="expand_ && $root.query[expand_] === line[expand_]" @click.stop="")
        slot(name="expand" :line="line")
    .line.subline(:class="{ even: subline._line_id % 2 === 0 }" v-for="subline in line._group" v-if="line._group && !collapsed.includes(line._group_id)" @click="(select_ && (selected = selected.toggle(subline._line_id)))")
      .cell.select(v-if="select_")
        .vertical-line-top
        .vertical-line-bottom
        .horizontal-line
        input(type="checkbox" :value="subline._line_id" @click.stop="" @input="selected = selected.toggle(subline._line_id)" v-model="selected")
      .cell(:class="k" v-for="k in columns_ || data[0].keys()")
        slot(:name="'cell-' + k" :line="subline" :column="k") {{ format(k)(subline[k]) }}
      .tooltip
        slot(name="tooltip" :line="subline")
      section.plus(:key="subline[expand_]" v-if="expand_ && $root.query[expand_] === subline[expand_]" @click.stop="")
        slot(name="expand" :line="subline")
</template>

<script>
export const additions = {"props":["data","metadata"]}
export default {
  data() {
    const m = this.metadata || {}
    const options = {
      expand_: '',
      select_: m.select,
      selected: [],
      collapsed: [],
      sort_: m.sort || '',
      find_group_: '',
      desc_: false,
      group_: d => d.v(),
      click_: m.expand || null,
      columns_: [],
    }
    return options.map((v, k) => m[k.slice(0, -1)] || v)
  },
  mounted() {
    this.collapsed = this.lines.map('_group_id').unique()
  },
  computed: {
    lines() {
      const { data, sort_, desc_, group_, find_group_ } = this
      var i = -1
      return data.v()
        .sort(sort_ || '')
        .group(group_)
        .map((v, k) => Object.assign(v.find(find_group_) || v.find(d => true), { _group: v.filter(d => d != (v.find(find_group_) || v.find(d => true))) }))
        .v()
        .map((d, k) => {
          i++;
          return Object.assign(d, { _group_id: k, _line_id: i, _group: d._group && d._group.map(l => {
            i++
            return Object.assign(l, { _line_id: i })
          })})
        })
    },
    flattened_lines() {
      return this.lines
        .map(d => [Object.assign({}, d, { _group: null })].concat(d._group))
        .flatten()
    },
    selected_lines() {
      return this.flattened_lines.filter(d => d && this.selected.includes(d._line_id))
    },
    select_all_state() {
      if (this.selected_lines.length && eq(this.flattened_lines, this.selected_lines)) return 'all'
      if (this.selected.length) return 'partial'
      return 'none'
    },
  },
  methods: {
    unselect_all(){
      this.selected = []
    },
    select_all() {
      if (this.select_all_state === 'all') {
          return this.selected = []
      }
      this.selected = this.flattened_lines.map(d => d._line_id)
    },
  },
}
</script>