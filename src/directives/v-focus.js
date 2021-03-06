export default {
  inserted(el, binding) {
    if (binding.value === false) el.blur()
    else el.focus()
  },
  update(el, binding) {
    if (binding.value === false) el.blur()
    else el.focus()
  },
}
