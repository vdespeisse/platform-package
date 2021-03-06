export default function initTranslationMixin(translation) {
  return {
    data() {
      // TODO: we should not have global variables like that, we shuold use a Store or a better solution
      return {
        lang: localStorage.LANG || 'fr',
      }
    },
    computed: {
      t() {
        return translation[this.lang] || {}
      }
    },
    watch: {
      lang() { localStorage.LANG = this.lang || 'fr' },
    },
  }
}
