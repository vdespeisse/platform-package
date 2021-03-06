import Block from './layout/Block.vue'
import Brick from './layout/Brick.vue'
import Drawer from './layout/Drawer.vue'
import PlotTime from './layout/PlotTime.vue'
import Toast from './layout/Toast.vue'

import codemirror from './codemirror.vue'
import PlotBar from './PlotBar.vue'
import PlotHeatmap from './PlotHeatmap.vue'
import PlotLine from './PlotLine.vue'
import PlotScatter from './PlotScatter.vue'
import PlotWaterfall from './PlotWaterfall.vue'
import PlotBase from './PlotBase.vue'
import PlotBox from './PlotBox.vue'


import edit from '../directives/v-edit'
import focus from '../directives/v-focus'
import indeterminate from '../directives/v-indeterminate'

const components = {
  Block,
  Brick,
  Drawer,
  PlotTime,
  Toast,

  codemirror,
  PlotBar,
  PlotHeatmap,
  PlotLine,
  PlotScatter,
  PlotWaterfall,
  PlotBase,
  PlotBox,
}

const directives = {
  edit,
  focus,
  indeterminate,
}

export default {
  install(Vue) {
    // TODO why use map instead of forEach ?
    Object.keys(components).map(name => Vue.component_async(name, components[name]))
    Object.keys(directives).map(name => Vue.directive(name, directives[name]))
  },
}
