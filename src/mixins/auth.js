export const guard = (to, from, next) => {
  if (to.params.screen && !/^[A-z-_\d]*$/.test(to.params.screen)) return next('/')
  if (to.params.userflow && !/^[A-z-_\d]*$/.test(to.params.userflow.split('-')[0])) return next('/')

  const profile = JSON.parse(localStorage.getItem('profile'))
  const role = profile ? profile.role || 'user' : 'anonymous'
  const authenticated = !!profile
  const authorized = to.matched.every(r => {
    if (!r.meta.access) return true
    if (r.meta.access.includes('user') && authenticated) return true
    if (r.meta.access.includes(role)) return true
    return false
  })
  const path = window.location.pathname + window.location.search
  if (!authenticated && !authorized) return next(path.length > 1 ? '/login?path='+path : '/login')
  if (authenticated && !authorized) return next('/')

  return next()
}

export default {
  data() {
    return {
      profile: null,
      error: {},
    }
  },
  computed: {
    authenticated() { return !!this.profile },
    role() { return this.profile ? this.profile.role || 'user' : 'anonymous' },
  },
  mounted() {
    this.profile = JSON.parse(localStorage.getItem('profile'))
  },
}
