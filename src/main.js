import initTranslationMixin from './translation/index.js'
// import('./translation/*').map(console.log)
import { createApp } from 'vue'
import initComponents from './components/index.js'
import { initRouter, parseRouteGlob } from './router'
// import dynamicComponents from './components/ui/**/*.vue'
// import dynamicComponents from 'virtual-module'
// import autocomplete from './components/ui/components/autocomplete.vue'
// import board from './components/ui/components/board.vue'
// import card from './components/ui/components/card.vue'
// import test from './components/ui/components/test.vue'


// TODO Remove this, only export default createPlatformApp
import auth from './mixins/auth.js'
import contextualisation from './mixins/contextualisation.js'
import control from './mixins/control.js'
import database from './mixins/database.js'
// import screenshare from './mixins/screenshare.js'
import scroll from './mixins/scroll.js'
import swipe from './mixins/swipe.js'
import userflow from './mixins/userflow.js'
import xfilter from './mixins/xfilter.js'
import datareport from './mixins/datareport.js'

// function importDynamicComponent(componentPath) {
//   const name = componentPath.split('/').slice(-1)[0].split('.vue')[0]
//   return {
//     name,
//     component: import(`./components/${componentPath}.vue`)
//   }
// }
// const dynamicComponents = sync(['./components/ui/**/*.vue'])
function createPlatformApp(App, { translations, routes }) {
  console.log('dqs')
  const app = createApp(App)
  const translationMixin = initTranslationMixin(translations)
  app.mixin(translationMixin)
  // console.log('dyna', dynamicComponents)
  // TODO not great to mutate app
  initComponents(app)
  // app.component('autocomplete', autocomplete)
  // app.component('board', board)
  // app.component('card', card)
  // app.component('test', test)

  // console.log('import', import.meta.glob('./components/ui/**/*.vue'))
  // dynamicComponents.map(componentPath => {
  //   const { name, component } = importDynamicComponent(componentPath)
  //   app.component(name, component)
  // })
  // if (routes) {
  //   const router = initRouter(routes)
  //   app.use(router)
  // }
  return app
}
// export default 
export {
  auth,
  contextualisation,
  control,
  database,
  scroll,
  swipe,
  userflow,
  xfilter,
  datareport,
  createPlatformApp,
  parseRouteGlob,
}