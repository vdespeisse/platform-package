export default {
  data() {
    return {
      retract_filters: localStorage.retract_filters === 'true',
      retract_period: localStorage.retract_period !== 'false',
      retract_user: localStorage.retract_user !== 'false', // retracted by default
      retract: window.innerWidth < 900 || localStorage.retract === 'true',
      scroll: false,
      scrollpos: 0,
    }
  },
  methods: {
    onscroll($event) {
      if (this.size !== 'mobile') return
      const el = $event.target
      this.scroll = window.scrollY > this.scrollpos && (window.scrollY + window.innerHeight + 120) < document.body.scrollHeight  && window.scrollY > 60
      this.scrollpos = window.scrollY
    },
  },
  watch: {
    retract_filters() {
      localStorage.retract_filters = this.retract_filters
    },
    retract_period() {
      localStorage.retract_period = this.retract_period
    },
    retract_user() {
      localStorage.retract_user = this.retract_user
    },
    retract() {
      localStorage.retract = this.retract
      setTimeout(() => window.dispatchEvent(new Event('resize')), 300)
    },
  },
}
