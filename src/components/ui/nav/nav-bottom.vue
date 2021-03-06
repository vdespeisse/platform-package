<style>
:root {
  --nav-bottom-background: linear-gradient(180deg, #222 45%, #000 100%);
  --nav-bottom-background-accent: var(--text-dark);
  --nav-bottom-color: white;
  --nav-bottom-icon-fill: var(--inactive);
  --nav-bottom-hover: rgb(255, 255, 255, 0.2);
  --nav-bottom-active-background: var(--background);
  --nav-bottom-active-color: var(--text);
  --nav-bottom-menu-height: 50px;
  --nav-bottom-account-margin: 30px;
  --nav-retract-button-background: #333;
  --nav-retract-button-svg: white;
}
.nav-bottom { background: var(--nav-bottom-background); }
.nav-bottom { z-index: 1040;position: fixed;top: 0;display: flex;flex-direction: column;width: var(--menu-left);height: 100%;color: white;font: var(--p1); }
.nav-bottom .logo { cursor: pointer;max-width: 80%;height: 80px;margin: 40px auto;text-align: center; } /* 160px */
.nav-bottom svg { width: 20px;height: 20px;fill: var(--nav-bottom-icon-fill); }
.nav-bottom > * { flex-shrink: 0; }
.nav-bottom .title { position: absolute;left: 0;width: 100%;color: var(--primary);font-size: 20px;font-weight: 500;text-transform: uppercase; }
.nav-bottom .menu-title { display: none; }
.nav-bottom a, .nav-bottom .lang { cursor: pointer;display: flex;align-items: center;width: 100%;height: 50px;padding-left: 16px;color: var(--nav-bottom-color);border-left: 6px solid transparent;font-size: 16px;text-transform: none; }
.nav-bottom .lang label { width: 50%; }
.nav-bottom #lang { min-height: 50px;width: 50%;border: none;border-radius: 0;margin-left: 10px;min-width: unset; }
.laptop.menu-retract .nav-bottom #lang { width: 100%;margin: 0;padding: 0 24px 0 4px; }
.nav-bottom a:hover { background: var(--nav-bottom-hover); }
.nav-bottom a span { overflow: hidden;max-width: fit-content;width: 190px;margin: 0 0 0 8px;text-align: left; }
.nav-bottom a.exact { color: var(--nav-bottom-active-color);background: var(--nav-bottom-active-background);border-left: 6px solid var(--highlight); }
.nav-bottom a.exact svg { fill: var(--nav-bottom-active-color); }
.nav-bottom .account { display: flex;align-items: center;justify-content: center;height: 50px;margin-bottom: var(--nav-bottom-account-margin);padding: 2px;background: var(--nav-bottom-background-accent);font-weight: 600; }
.laptop.menu-retract .nav-bottom .title { visibility: hidden; }
.laptop.menu-retract .nav-bottom .account { font-size: 12px;text-align: center;word-break: break-word;hyphens: auto; }
.nav-bottom .links { overflow: auto;height: calc(100vh - 210px - var(--nav-bottom-menu-height) - var(--nav-bottom-account-margin)); }

.menu-retract .nav-bottom .lang label { display: none; }
.menu-retract .nav-bottom .lang { padding: 0;border: 0; }
.menu-user .nav-bottom > :not(.user-menu):not(.retract-button) { pointer-events: none;filter: blur(4px); }
/* Icon & Drawer */
.svg-icon { width: 24px;height: 24px; }
.drawer-wrapper .overlay { z-index: 10000;position: fixed;top: 0;left: 0;min-width: 100vw;min-height: 100vh;background: rgb(0, 0, 0, .5);cursor: pointer; }
.drawer-wrapper .drawer { z-index: 10001;position: fixed;top: 0;left: 0;margin: 10px;padding: 20px;width: calc(100% - 20px);height: calc(100% - 20px);overflow: auto;background: white; }
.drawer-wrapper .close { z-index: 10002;position: fixed;top: 10px;right: 10px;width: 40px;height: 40px;padding: 10px;background: rgb(0, 0, 0, .5);cursor: pointer; }
.drawer-wrapper button .svg-icon { position: relative;top: 4px;width: 16px;height: 16px;fill: white; }
@media (min-width: 600px) { .drawer-wrapper .drawer { margin: 0;padding: 40px;width: 60%;height: 100%; } }

/* Responsive */
.mobile:not(.laptop).menu-retract .nav-bottom { transform: translateX(-100%); }
.retract-button { z-index: 10;position: absolute;top: 4px;right: -20px;cursor: pointer;display: flex;align-items: center;justify-content: center;width: 20px;height: 52px;background: var(--nav-retract-button-background);border-bottom-right-radius: 4px;border-top-right-radius: 4px;transition: var(--transition); }
.retract-button svg { width: 28px;height: 20px;padding: 2px;transition: var(--transition);fill: var(--nav-retract-button-svg);transform: rotate(180deg); }
.laptop.retract-button:hover { background: rgb(255, 255, 255, 0.2); }
.laptop.menu-retract .retract-button svg { transform: rotate(0); }
.laptop.menu-retract .nav-bottom a.user > span,
.laptop.menu-retract .nav-bottom a.user > svg { display: none; }
.laptop.menu-retract .nav-bottom a span { width: 0; }
.laptop.menu-retract .nav-bottom { transform: translateX(calc(60px - 100%)); }
.laptop.menu-retract .nav-bottom .user { padding: 10px; }
.mobile:not(.tablet) :matches(.block, .kpi, .card) { border-radius: 0;box-shadow: none; }
.mobile:not(.tablet) :matches(h1, h2, h3, .subtext) { padding: 0 16px; }
.menu-retract .nav-bottom .link-powered { padding: 4px;border: 0; }
.nav-bottom .link-powered svg { width: 100px; }
.nav-bottom::after { position: absolute;bottom: -60px;left: -160px;pointer-events: none;width: 400px;content: url('data:image/svg+xml;utf8,<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(%23clip0)"><path d="M9 5.005L4.001 10 2 8l3.002-2.995L2 2l2.001-2L9 5.005z" fill="%23FFF" fill-opacity=".1"/></g><defs><clipPath id="clip0"><path fill="%23FFF" d="M0 0h10v10H0z"/></clipPath></defs></svg>'); }
</style>

<template lang="pug">
nav.nav-bottom(@click.stop='$root.retract_user = true')
  .logo(@click="$router.push('/');$root.app = ''")
    img(:src="!$root.retract && /laptop/.test($root.size) ? ($root.cssvar.nav || '').slice(4, -1) : ($root.cssvar.icon || '').slice(4, -1)")
    .title {{ t.title }}
  .account
    // <div>{{ t[$root.userflow.name] || ($root.userflow.name && $root.userflow.name.titleize()) }}</div>
    div(v-if="$root.db.env")  {{ $root.db.env }}
    div(v-if="$root.userflow && $root.userflow.shares")
      | {{ t.share }} {{ ($root.userflow.shares[$root.params.userflow.split('-')[1]] && $root.userflow.shares[$root.params.userflow.split('-')[1]].share) || '' }}
  .links
    router-link.slash(:class="{ exact: $route.path === '/' }", :to="$root.db.config.menu ? ['/', $root.query.map((v, k) => k + '=' + v).v().join('&')].filter(d => d).join('?') : '/'")
      svg-icon(:name='$root.config.screens.slash.icon')
      span {{ t.slash }}
    router-link(:class='[{ exact: $route.params.screen === path }, path]', :to="[path, $root.query.map((v, k) => k + '=' + v).v().join('&')].filter(d => d).join('?')", v-for='path in $root.config.menu')
      svg-icon(:name='$root.config.screens[path].icon')
      span {{ t[path] }}
    template(v-for='screen, i in $root.screens', v-if="$root.screen.path !== 'slash' && !$root.config.menu")
      .menu.column(:key='i', v-if="type(screen) === 'array'", @click='opened = opened === screen[0].path ? null : screen[0].path')
        a.menu-title
          svg-icon(:name='screen[0].icon')
          span {{ t[screen[0].path] }}
        .menu-links.column(:class='{ opened: opened === screen[0].path }')
          router-link(:class='{ selected: $route.params.screen === s.path, [s.path]: true }', :to="s.path === 'slash' ? '/' : { params: { screen: s.path }, query: $route.query || s.query }", v-for='s, i in screen.slice(1)')
            svg-icon(:name='s.icon')
            span {{ t[s.path] }}
      router-link(:class='[screen.path]', :to="{ params: { screen: screen.path }, query: ($route.query || screen.query).filter((v,k) => $root.size.includes('laptop') || k !== 'opened') }", v-if="$root && type(screen) === 'object' && (($root.role === 'admin' || ($root.profile && !$root.profile.screens)) || (($root.profile && $root.profile.screens) || []).includes(screen.path))")
        svg-icon(:name='screen.icon')
        span {{ t[screen.path] }}
  nav-user-menu(:data_quality_badge="data_quality_badge")
  .retract-button(@click='$root.retract = !$root.retract')
    svg-icon(:name="/laptop/.test($root.size) ? 'nx-chevron' : 'ic_menu'")
</template>

<script>
export const additions = {}
export default {
  data() {
    return {
      opened: '',
    }
  },
  computed: {
    data_quality_badge() {
      if (!$root.db['data-quality']) return false
      if (!$root.profile || $root.profile.role !== 'admin') return false
      return this.checks.map(d => d.error_number + d.warning_number).sum()
    },
    checks() {
      const ignore_list = $root.db['data-quality-ignored'] || {}
      const is_ignored = message => !!ignore_list[message.md5()]
      return $root.db['data-quality'].map(d => d.v()).v().flatten().group('name').v().map(grp => {
        const messages = grp
          .filter(d => d.error_output || d.warning_output)
          .map(d => {
            const message = (d.error_output || d.warning_output).join('\n')
            return {
              type: d.error_output ? 'error': 'warning',
              message,
              ignore: is_ignored(message),
            }
          })
        const error_number = messages.filter(d => d.type === 'error' && !d.ignore).v().length
        const warning_number = messages.filter(d => d.type === 'warning' && !d.ignore).v().length
        return {
          name: grp[0].name,
          label: grp[0].description,
          category: grp[0].category,
          messages,
          error_number,
          warning_number,
          result: error_number + warning_number === 0 ? 0 : error_number === 0 ? 1 : 2,
        }
      })
    },
  },
}
</script>