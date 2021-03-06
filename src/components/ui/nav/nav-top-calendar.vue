<style>

</style>

<template lang="pug">
.nav-top-calendar.calendars(:class="{ monthly, active: current || list }", v-if='$root.screen.datasets && !/cost-insight/.test(localStorage.PROJECT)')
  .overlay(@click="list = false;current= null;focus = 'to'", v-if="list || current")
  .period.row.center(v-if='monthly')
    div(:class="{ active: current && focus === 'from' }", @click="list = false;focus = 'from';current = current && current.format() === $root.domain[0] ? null : new Date($root.domain[0])")
      .on {{ t.from }}
      .day {{ new Date($root.domain[0]).format('day, mon, year', $root.lang) }}
    .timeline.column.center.left(v-if='!$root.retract_period')
      plot-time(:data='$root.domains && $root.domains.inception')
    div(:class="{ active: current && focus === 'to' }", @click="list = false;focus = 'to';current = current && current.format() === $root.domain[1] ? null : new Date($root.domain[1])")
      .on {{ t.to.toLowerCase() }}
      .day {{ new Date($root.domain[1]).format('day, mon, year', $root.lang) }}
    svg-icon(:class='{ active: list }', name='pt-icon-more', style='transform: rotate(90deg);width: 36px;height: 36px;padding: 12px;', @click.native='list = !list;current = null')
  .period.row.center(v-else='')
    div(@click="list = false;current = current ? null : new Date(focus === 'from' ? $root.domain[0] : $root.domain[1])")
      .on {{ current ? '' : t.asof }}
      .day
        | {{ new Date(current ? current : focus === 'from' ? $root.domain[0] : $root.domain[1]).format('day, mon, year', $root.lang) }}
    // <svg-icon name="pt-icon-more" style="transform: rotate(90deg);width: 36px;height: 36px;padding: 12px;" @click.native="list = !list"></svg-icon>
  .neo-calendar(:class='focus', v-if='current')
    .row.between(style='margin-bottom: 12px;')
      .month.row.center.between
        svg-icon(name='nx-chevron', @click.native="current = new Date(current ? current : focus === 'from' ? $root.domain[0] : $root.domain[1]).minus('1 month')", v-if='current')
        |           {{ current.format('month', $root.lang).capitalize(true) }}
        svg-icon(name='nx-chevron', @click.native="current = new Date(current ? current : focus === 'from' ? $root.domain[0] : $root.domain[1]).plus('1 month')", v-if='current')
      .year.row.center.between
        svg-icon(name='nx-chevron', @click.native="current = new Date(current ? current : focus === 'from' ? $root.domain[0] : $root.domain[1]).minus('1 year')", v-if='current')
        |           {{ current.format('year', $root.lang) }}
        svg-icon(name='nx-chevron', @click.native="current = new Date(current ? current : focus === 'from' ? $root.domain[0] : $root.domain[1]).plus('1 year')", v-if='current')
    .calendar
      .week
        .day(v-for='day in days') {{ day }}
      .week(v-for='week in weeks')
        .day(:class="{ disabled: !$root.dates.includes(current.format('YYYY-MM-') + ('0' + day).slice(-2)), active: (focus === 'from' ? $root.domain[0] : $root.domain[1]) === current.format('%Y-%m-') + ('0' + day).slice(-2) }", v-for='day in week', @click='update_calendar(day)') {{ day }}
  .period-list.column(v-if='list')
    div(v-for='domain, key in $root.domains', @click='list = false;update_domain(domain)')
      div {{ t[key] }}
      div
        | {{ t.from }} {{ domain.map(d => d.format()).join(' ' + t.to.toLowerCase() + ' ') }}
    div(@click='list = false;$root.retract_period = !$root.retract_period') {{ $root.retract_period ? t.expand_period : t.retract_period }}
</template>

<script>
export const additions = {"props":["nopnop"]}
export default {
  data() {
    return {
      list: false,
      current: null,
      focus: 'to',
    }
  },
  computed: {
    months() {
      const months = Array(12).fill().map((_, i) => Date.format(new Date('2000-01-01').plus(i+'month'), 'month'))
      return months.slice(0, 12).map((v, i) => months[12 + i] || v)
    },
    days() {
      return Array(7).fill().map((_, i) => new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date('2000-01-' + (i + 10)))).map(d => d[0].toUpperCase())
    },
    weeks() {
      const current = this.current
      if (!current) return
      const lastday = current.minus('1 month').end('month').getDate()
      const dow = current.start('month').getDay() - 1
      const days = current.end('month').getDate()
      const start = 1 + lastday - dow > lastday ? (dow == 0 ? [] : (0).upto(5).map(d => null)) : (1 + lastday - dow).upto(lastday).map(d => null);
      const middle = (1).upto(days)
      const end = dow == 0 ? (1).upto(6 - (dow + days) % 7).map(d => null) : (1).upto(7 - (dow + days) % 7).map(d => null)
      return [].concat(start, middle, end).chunk(7)
    },
    monthly() {
      return $root.query.evolution || $root.config.datasets[$root.screen.datasets[0]].period !== 'daily'
    },
  },
  methods: {
    update_calendar(day) {
      // HACK: +4 hours bug in rawjs when change GMT from 2 to 1
      const date = new Date(this.current.format()).start('month').plus((day - 1) + 'day').plus('4 hours')
      if (!this.monthly) {
        update_domain([date])
        this.current = null
      }
      if (this.focus === 'from') {
        update_domain([date, $root.domain[1]])
        this.current = null
      }
      if (this.focus === 'to') {
        update_domain([$root.domain[0], date])
        this.current = null
      }
      this.focus = 'to'
    },
  },
}
</script>