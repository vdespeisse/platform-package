import componentsEn from './translation-components-en.yml'
import componentsFr from './translation-components-fr.yml'
import dimensionsEn from './translation-dimensions-en.yml'
import dimensionsFr from './translation-dimensions-fr.yml'
import interfaceEn from './translation-interface-en.yml'
import interfaceFr from './translation-interface-fr.yml'

const baseTranslations = {
  fr: {
    ...componentsFr,
    ...dimensionsFr,
    ...interfaceFr,
  },
  en: {
    ...componentsEn,
    ...dimensionsEn,
    ...interfaceEn,
  },
}

function mergeTranslations(translations) {
  if (!translations) return baseTranslations
  return {
    fr: {
      ...baseTranslations.fr,
      ...translations.fr
    },
    en: {
      ...baseTranslations.en,
      ...translations.en
    },
  }
}

export default function initTranslationMixin(translations) {
  const trads = mergeTranslations(translations)
  return {
    data() {
      // TODO: we should not have global variables like that, we shuold use a Store or a better solution
      return {
        lang: localStorage.LANG || 'fr',
      }
    },
    computed: {
      t() {
        return trads[this.lang] || {}
      }
    },
    watch: {
      lang() { localStorage.LANG = this.lang || 'fr' },
    },
  }
}



