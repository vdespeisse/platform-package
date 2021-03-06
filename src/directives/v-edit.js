export default (el, binding) => {
  el.innerHTML = get(binding.value) || vm.t[get(binding.value.replace('.' + vm.lang, ''))] || ''
  if (vm.profile.role !== 'admin') return
  el.setAttribute('v-edit', binding.value || '-')
  el.spellcheck = false
  el.contentEditable = true
  const clean = str => str
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, m => {
      let tag = m.match(/<[^ >]+/)[0]
      const closing = tag[1] === '/'
      tag = tag.slice(1 + closing)
      if (closing && ['br', 'b', 'i', 'u', 'strong', 'em'].includes(tag)) return '</' + tag + '>'
      if (closing) return ''
      if (tag === 'div') return '<br>'
      if (['br', 'b', 'i', 'u', 'strong', 'em'].includes(tag)) return '<' + tag + '>'
      return ''
    })
    .replace(/^(<br>| )*/, '')
    .replace(/(<br>| )*$/, '')
  el.onkeydown = e => (e.ctrlKey || e.metaKey) && /^s$/i.test(e.key) && (e.preventDefault(), set(binding.value, clean(el.innerHTML))) || ''
  el.onblur = e => set(binding.value, clean(el.innerHTML))
  el.onpaste = e => {
    e.stopPropagation()
    e.preventDefault()
    const str = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain')
    const range = window.getSelection().getRangeAt(0)
    range.deleteContents()
    range.insertNode(new DOMParser().parseFromString('<span>' + clean(str).replace(/(<br>)+/g, '<br>') + '</span>', 'text/html').body.querySelector('span'))
  }
}
