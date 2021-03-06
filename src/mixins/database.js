const mixins = []

if (localStorage.FIREBASE_NAME) {
  // TODO consider explicit import of `VueFire` instead of relying on`global.js` `window.VueFire = VueFire`
  // TODO consider explicit import of `firebase` instead of relying on `global.js` `window.firebase = firebase`
  Vue.use(VueFire)
  mixins.push({
    created() {
      firebase.initializeApp({
        apiKey: localStorage.FIREBASE_API_KEY,
        authDomain: localStorage.FIREBASE_NAME + '.firebaseapp.com',
        databaseURL: 'https://' + localStorage.FIREBASE_NAME + '.firebaseio.com',
      })
      if (this.online) {
        this.$bindAsObject('firedb', firebase.database().ref(localStorage.ENV + '/public'))
        if (localStorage.uid) {
          this.$bindAsObject('userdb', firebase.database().ref(localStorage.ENV + '/private/' + localStorage.uid))
          this.$bindAsObject('userinfo', firebase.database().ref('/users/' + localStorage.uid))
        }
      }
    }
  })
}

if (localStorage.HASURA) {
  mixins.push({
    async created() {
      const hasudb = (await (await fetch(localStorage.HASURA + '/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': 'myadminsecretkey',
        },
        body: JSON.stringify({
          query: `query {
            db_by_pk(project: "${localStorage.ENV}") {
              public
            }
          }`,
          variables: null,
        })
      })).json()).data.db_by_pk.public
      if (hasudb.data) hasudb.data = hasudb.data.map(v => Object.freeze(v))
      $root.hasudb = hasudb

      const updatedata = (async () => {
        const hasudata = (await (await fetch(localStorage.HASURA + '/v1/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': 'myadminsecretkey',
          },
          body: JSON.stringify({
            query: `query {
              db_by_pk(project: "${localStorage.ENV}") {
                public(path: "data")
              }
            }`,
            variables: null,
          })
        })).json()).data.db_by_pk.public
        $root.db.data = hasudata.map(v => Object.freeze(v))
      }).throttle(localStorage.HASURA_INTERVAL || 5000)

      const wsl = new WebSocketLink(
        new SubscriptionClient(localStorage.HASURA.replace('http', 'ws') + '/v1/graphql', {
          reconnect: true,
          timeout: 30000,
          connectionParams: () => {
            return {
              headers: {
                'x-hasura-admin-secret': 'myadminsecretkey',
              },
            }
          },
        },
      ))
      // TODO consider explicit import of execute instead of relying on `global.js` `window.execute = execute`. Also, this naming is too broad for a window-level method.
      execute(wsl, {
        query: gql(`subscription {
          db_by_pk(project: "${localStorage.ENV}") {
            updated_at
          }
        }`),
        variables: {}
      }).subscribe(r => {
        if (!r.data) return
        if (!window.last_update) return window.last_update = r.data.db_by_pk.updated_at
        window.last_update = r.data.db_by_pk.updated_at
        updatedata()
      }, e => console.error(e))

    }
  })
}
// TODO prefer explicit import instead of relying on `global.js` `window.axios = axios`
if (!localStorage.HASURA && !localStorage.FIREBASE_NAME ) {
  (async function () {
    try {
      const config = (await axios.get('dist/' + localStorage.PROJECT + '/config.json', { 'Cache-Control': 'no-cache' })).data
      if (config.__proto__ !== Object.prototype) throw 'Invalid config.json file'
      vm.localdb = { ...config }
      const database_url = localStorage.api_auth ? localStorage.api_auth + '/app?path=database.json' : 'dist/' + localStorage.PROJECT + '/database.json'
      const database = (await axios.get(database_url, { 'Cache-Control': 'no-cache' })).data
      // TODO: don't throw then catch it makes all errors silent and the throw kinda pointless
      if (database.__proto__ !== Object.prototype) throw 'Invalid database.json file'
      vm.localdb = { ...config, ...database }
    } catch(e) {}
  })()
}

// TODO prefer explicit import instead of relying on `global.js` `window.axios = axios`
if (new URLSearchParams(location.search).get('asof')) axios
  .get(`https://fireauth.100m.io/app/?path=asof/userflows-${format_asof(new URLSearchParams(location.search).get('asof'))}.json`)
  .then(r => vm.asofdb = r.data.__proto__ === Object.prototype ? {'userflows': r.data} : vm.asofdb)
  .catch(e => e)

// if (location.hostname !== '127.0.0.1') idb.get('localdb').then(r => vm.localdb = r)

export default {
  mixins,
  data() {
    return {
      online: navigator.onLine,
      db: {},
      localdb: null,
      hasudb: null,
      firedb: null,
      userdb: null,
      userinfo: null,
      localdb: null,
      asofdb: null,
      progress_list: {},
    }
  },
  computed: {
    progress() {
      const list = this.progress_list.v().filter(d => d.total && d.loaded !== d.total)
      return (list.sum(d => d.loaded / d.total) / list.length) || 0
    },
  },
  created() {
    window.addEventListener('online', () => this.online = true)
    window.addEventListener('offline', () => this.online = false)
    let ready = true
    const updatedb = () => {
      // console.log(new Date().toISOString(), 'ready', ready)
      if (!ready) return setTimeout(updatedb, 500)
      ready = false
      this.$nextTick(() => {
        const db = Object.assign({}, this.localdb, this.hasudb, this.firedb, this.userdb, this.userinfo, this.asofdb)
        if (!db.keys().length) return ready = true
        this.db = db
        this.$nextTick(() => setTimeout(() => ready = true, 500))
        // if (location.hostname !== '127.0.0.1') idb.set('localdb', db)
      })
    }
    this.$watch(() => [this.localdb, this.hasudb, this.firedb, this.userdb, this.userinfo, this.asofdb], updatedb)
  },
}
