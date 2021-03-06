export default {
  created() {
    const control_id = new Date().iso().slice(0, 19)
    const control_fn = next => eval(next)
    this.$watch(() => this.db.control && this.db.control[control_id], control_fn)
    this.$watch('db.control.all', control_fn)
    set('control.' + control_id, '')
    disconnect('control.' + control_id)
  },
}
