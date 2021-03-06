import initTranslationMixin from './translation/index.js'
// import('./translation/*').map(console.log)
import { createApp } from 'vue'

// function mergeTranslations()
// function importLocale(file) {
//   return import('./translation/' + file + '.yml')
// }

function createPlatformApp(App, translations) {
  const app = createApp(App)
  const translationMixin = initTranslationMixin(translations)
  app.mixin(translationMixin)
  return app
}
export default createPlatformApp