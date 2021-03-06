<style>
.workflow { display: flex;min-height: 100%; }
.workflow .overlay { position: absolute;display: flex;top: 0;bottom: 0;left: 0;right: 0; }
.workflow .range { flex: 1;display: flex;justify-content: center;padding: 10px;color: var(--inactive);border-right: 1px solid rgb(196, 196, 196, .5); }
.workflow .step h3, .workflow .action { background: white; }
.workflow .step { position: relative;display: flex;padding-top: 80px; }
.workflow .step h3 { position: absolute;top: 20px;left: 20px;max-width: calc(100% - 40px); }
[class*="rid-"] .workflow .step h3 { top: 40px; }
.workflow .step h3 div { overflow: hidden;white-space: pre;text-overflow: ellipsis; }
.workflow .step::before { content: ' ';position: absolute;left: 10px;top: 70px;right: 10px;height: 8px;background: var(--primary); }
.workflow .action { position: relative;cursor: pointer;margin: 10px;padding: 16px 13px;border: 4px solid transparent;box-shadow: 0 0 0 1px rgb(0,0,0,.1), var(--box-shadow);transition: var(--transition); }
.workflow .action:hover { border-color: rgb(255, 221, 68, .5); }
.workflow .action.selected { border-color: var(--highlight); }
.workflow .action > div { overflow: auto;display: flex;align-items: center; }
.workflow .action > div > .name { flex: 1;white-space: pre;overflow: hidden;text-overflow: ellipsis; }
.workflow .action > div > .task { flex-shrink: 0; }
.workflow .action-fixed { position: fixed; bottom: 200px;right: 60px; }
.workflow .step:nth-child(2) .actions:nth-child(2) .action[tt]:after { left: 0;transform: translate(0, -95%); }
.workflow .step:nth-child(2) .actions:nth-child(2) .action[tt]:hover:after { transform: translate(0, calc(-100% - 5px)); }
.workflow .step:last-child .actions:last-child .action[tt]:after { left: unset;right: 0;transform: translate(0, -95%); }
.workflow .step:last-child .actions:last-child .action[tt]:hover:after { transform: translate(0, calc(-100% - 5px)); }
.workflow .step h3 input { width: 100%; }
.workflow .step h3 > button.left { display: none;z-index: 1;position: absolute;left: -25px;top: 5px; }
.workflow .step h3 > button.right { display: none;z-index: 1;position: absolute;right: -25px;top: 5px; }
.workflow .action > button.top { display: none;position: absolute;top: -25px;right: -25px; }
.workflow .action > button.left { display: none;z-index: 1;position: absolute;left: -25px;top: calc(50% - 15px); }
.workflow .action > button.right { display: none;z-index: 1;position: absolute;right: -25px;top: calc(50% - 15px); }
.workflow :matches(.step h3, .action):hover > button { display: flex; }
.workflow .step button { width: 30px;height: 30px;padding: 8px;align-items: center; }
.workflow .step button svg { width: 100%;height: 100%; }
.workflow .type { width: 18px;height: 18px;fill: var(--inactive); }
</style>

<template lang="pug">
.workflow
  .overlay(:style="{ width: range.size + 'px' }")
    .range(v-for="date in range.dates") {{ date }}
  .step(v-for="step, name, i in data.actions.v().group('step').map(grp => grp.group(d => d.parallel || d.id))")
    h3(:step="i + 1" :class="{ edit: !$root.query.rid }")
      input(:value="name" @input="data.actions.v().filter(d => d && d.step === name).map(a => a.step = $event.target.value)" v-if="!$root.query.rid")
      div(v-else) {{ name }}
      button.left(@click="create('Pre-' + name, data.actions.v().filter(d => d && d.step === name).first().id)" v-if="!$root.query.rid")
        svg-icon(name="nx-plus")
      button.right(@click="create('Post-' + name, data.actions.v().filter(d => d && d.step === name).last().id + 1)" v-if="!$root.query.rid")
        svg-icon(name="nx-plus")
    .actions(:style="['min-width', 'max-width'].map(k => k + ': ' + (Math.max(range.median / 3, actions.v().map('duration').max()) * 300 / range.median) + 'px').join(';')" v-for="actions, id in step" )
      .action(:class="{ selected: action.id === +$root.query.action_id }" :tt="action.desc || action.name" @click="update_query({ action_id: action.id })" v-for="action in actions")
        div(v-if="!data.actions.v().find(a => a.name !== a.step && a.step === action.name)")
          div(:class="action.status")
        div(v-else)
          .substep(v-for="a in data.actions.v().filter(a => a.name === action.name)")
        div
          .name {{ action.name }}
          .task(:class="[action.status, { skipped: action.skipped &&action.skipped !== 'rerun'}]")
          svg-icon.type(:name="{ run_command: 'ic_settings', wait_for: 'pt-icon-time' }[action.type]" v-if="!['user_input', 'user_validation'].includes(action.type)") {{ action.type }}
          .owner(:style="{ background: 'var(--cat' + ((action.user || '').charCodeAt(0) % 10 + 1) + ')' }" v-else) {{ (action.user || '').split('@')[0].split('.').map('0').join('').upper() }}
        button.top(@click="remove(action.id)" v-if="!$root.query.rid")
          svg-icon(name="pt-icon-trash")
        button.left(@click="create(action.step, action.id)" v-if="!$root.query.rid")
          svg-icon(name="nx-plus")
        button.right(@click="create(action.step, action.id + 1)" v-if="!$root.query.rid")
          svg-icon(name="nx-plus")
</template>

<script>
export const additions = {"props":["data"]}
export default {
  computed: {
    range() {
      let start = new Date().start('day')
      if ($root.query.rid !== undefined) {
        const workflow = $root.db.data.workflows[$root.query.id]
        const run = $root.db.data.runs.v().find(d => d && d.id === +$root.query.rid)
        const delay = workflow.actions.v().map(d => d.duration || 0).sum()
        start = new Date(run.context.legal_date || new Date()).minus(`${24 * delay} hours`).start('day')
      }
      const median = this.data.actions.v().filter().map(d => d.duration || 0).median()
      const periods = this.data.actions.v().filter().map(d => Math.max(median / 3, d.duration || 0))
      return {
        size: periods.sum() * 300 / median,
        dates: periods.reduce((acc, p, i) => (acc.push(Math.round(24 * periods.sum() / periods.length) + (acc[i - 1] || 0)), acc), []).map(p => start.plus(p + 'hours').format(median > 1 ? 'day, month' : 'mon, day, hour, minute', $root.lang.replace(/^en$/, 'en-GB'))),
        periods,
        median,
      }
    },
  },
  methods: {
    create(step, id) {
      const actions = this.data.actions.v()
      actions.splice(id - 1, 0, { name: 'Step' + id, step, duration: this.range.median })
      if (!$root.db.data.workflows || !$root.db.data.workflows[this.$route.query.id || 0]) set(['data', 'workflows', this.data.id].join('.'), this.data)
      $root.db.data.workflows[this.$route.query.id || 0].actions = actions.reduce((acc, a, i) => (a.id = i + 1, acc[i + 1] = a, acc), {})
    },
    remove(id) {
      const actions = this.data.actions.v()
      actions.splice(id - 1, 1)
      if (!$root.db.data.workflows || !$root.db.data.workflows[this.$route.query.id || 0]) set(['data', 'workflows', this.data.id].join('.'), this.data)
      $root.db.data.workflows[this.$route.query.id || 0].actions = actions.reduce((acc, a, i) => (a.id = i + 1, acc[i + 1] = a, acc), {})
    },
  },
}
</script>