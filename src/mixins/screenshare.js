export default {
  computed: {
    idmail() {
      return this.profile && this.profile.email.replace(/@/g, 'AT').replace(/\./g, 'DOT')
    },
    user_following() {
      return this.db.channels && this.db.channels[this.idmail]
    },
    path_following() {
      return this.db.users && this.db.users[this.user_following]
    },
    change_path() {
      const change_path = () => {
        if (this.idmail) set('users.' + this.idmail, this.$route.fullPath)
      }
      return change_path.throttle(500)
    },
  },
  created() {
    if (this.idmail) {
      set('users.' + this.idmail, this.$route.fullPath)
      set('channels.' + this.idmail, this.$route.fullPath)
      disconnect('channels.' + this.idmail)
    }
    this.$watch('$route.fullPath', this.change_path)
    this.$watch('path_following', next => this.$router.push(next))
  },
  methods: {
    screenshare(email) { set('users.' + email, this.$route.fullPath);this.follow(email);this.control(email) },
    stop_screenshare(email) { this.stop_following(email);this.stop_controling(email) },
    follow(email) { set('channels.' + this.idmail, email)  },
    control(email) { set('channels.' + email, this.idmail)  },
    stop_following(email) { set('channels.' + this.idmail, '')  },
    stop_controling(email) { set('channels.' + email, '')  },
  }
}
