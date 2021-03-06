export default {
  data() {
    return {
      swipe: {},
      swipefn: {},
      swipestop: false,
    }
  },
  methods: {
    swipeblock(name, length) {
      if (!this.swipe[name]) Vue.set(this.swipe, name, 0)
      return ($event) => {
        if (this.size !== 'mobile') return
        this.swipestop = true
        if ($event.direction === Hammer.DIRECTION_RIGHT) {
          this.swipe[name] = Math.max(0, this.swipe[name] - 1)
        }
        if ($event.direction === Hammer.DIRECTION_LEFT) {
          this.swipe[name] = Math.min(length - 1, this.swipe[name] + 1)
        }
      }
    },
    swipepage($event) {
      if (this.size !== 'mobile') return
      if (this.swipestop) return this.swipestop = false
      this.swipestop = false
      const index = this.screens.findIndex(this.screen)
      if ($event.direction === Hammer.DIRECTION_RIGHT && index > 0) {
        this.$router.push(this.screens[index - 1])
      }
      if ($event.direction === Hammer.DIRECTION_LEFT && index < this.screens.length - 1) {
        this.$router.push(this.screens[index + 1])
      }
    },
  },
}
