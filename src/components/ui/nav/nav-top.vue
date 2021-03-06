<style>
:root {
  --nav-top-background: var(--text);
  --nav-top-color: white;
  --nav-top-calendars-border: 1px solid var(--nav-top-color);
  --nav-top-shadow: none;
}
.nav-top .svg-icon { pointer-events: all;cursor: pointer;}
.nav-top { z-index: 1010;position: fixed;top: 0;display: flex;width: 100%;height: var(--menu-top);background: var(--nav-top-background);font: var(--p2);user-select: none; box-shadow: var(--nav-top-shadow);}
.nav-top-calendar .overlay { position: fixed;top: 0;left: 0;width: 100vw;height: 100vh;}
.nav-top .calendars { position: relative;align-self: center;height: 36px;margin: 0;margin-right: auto;padding: 0;border: var(--nav-top-calendars-border);border-radius: var(--border-radius); }
.nav-top .calendars.active { border-bottom-left-radius: 0;border-bottom-right-radius: 0; }
.nav-top .calendars .svg-icon:first-child { transform: rotate(180deg); }
.nav-top .calendars .svg-icon { width: 31px;height: 36px;margin: 0;fill: var(--nav-top-color); }
.nav-top .calendars .screen { font-weight: 700; }
.nav-top .calendars .period { height: 100%;margin-top: -1px;color: var(--nav-top-color);text-transform: capitalize; }
.nav-top .calendars .period > *:hover,
.nav-top .calendars .period > .active { cursor: pointer;background: rgb(255, 255, 255, 0.1); }
.nav-top .calendars .period > div { display: flex;align-items: center;justify-content: center;min-width: 126px;height: 100%;padding: 0 4px;border-right: 1px solid rgb(255, 255, 255, 0.5);transition: var(--transition); }
.nav-top .calendars .period > span { flex: 1; }
.nav-top .calendars .period > .timeline { padding: 0;background: rgb(255, 255, 255, 0.2); }
.nav-top .calendars .timeline .axis text { font-size: 8px;fill: white; }
.nav-top .calendars .timeline .axis line { display: none; }
.nav-top .calendars .component.x-axis { margin-top: 1px; }
.nav-top .calendars .plot-time { position: relative;top: 14px;min-height: 49px;width: 260px;margin-top: -14px; }
.nav-top .calendars .plot-time .rectangle-plot .render-area rect { fill: transparent;stroke: transparent; }
.nav-top .calendars .plot-time .selection-box-layer .drag-edge-lr { opacity: 1!important;stroke: rgb(255, 221, 0)!important;stroke-width: 3px; }
.nav-top .calendars .plot-time .selection-box-layer .selection-area { fill: rgb(255, 221, 0);fill-opacity: 0.2; }
.nav-top .calendars .plot-time .drag-box-layer.movable .selection-area { stroke: transparent; }
.nav-top .disabled { pointer-events: none;color: #bbb; }
.neo-calendar { width: 280px;padding: 12px;background: var(--text);border: var(--border);border-radius: 4px;line-height: 2.6; }
.neo-calendar .year { min-width: 100px; }
.neo-calendar .week:nth-child(1) { pointer-events: none;color: var(--primary); }
.neo-calendar .week { display: flex;align-items: center;justify-content: center;font-size: 12px; }
.neo-calendar .month svg,
.neo-calendar .year svg { padding: 9px;fill: var(--primary)!important; }
.neo-calendar .month { min-width: 145px; }
.neo-calendar .display { display: flex;align-items: center;justify-content: center;margin-bottom: 12px;color: var(--primary);text-transform: uppercase; }
.neo-calendar .day.active { color: white;background: var(--primary); }
.neo-calendar .day { flex: 1;text-align: center; }
.neo-calendar .current { flex: 1;text-align: center; }
.neo-calendar :matches(.last, .next) svg { width: 50px;height: 25px;padding: 0 20px;fill: var(--primary); }
.neo-calendar :matches(.last, .next) { height: 25px; }
.neo-calendar :matches(.last, .next, .day):hover { background: rgb(0, 0, 0, 0.06); }
.nav-top .neo-calendar { z-index: 1000;position: absolute;top: 34px;left: -1px;min-height: 220px;width: 290px;background: white;border: none;border-radius: 0;box-shadow: var(--box-shadow);line-height: 1.8; }
.nav-top .monthly .neo-calendar.to { right: -1px;left: unset; }
.period .day { margin-left: 4px;font-weight: 600;white-space: pre; }
.period-list { z-index: 1000;position: absolute;top: 34px;right: -1px;width: 290px;background: white;border: none;border-radius: 0;box-shadow: var(--box-shadow);line-height: 1.8; }
.period-list > div { display: flex;align-items: baseline;padding: 8px 12px;text-transform: none; }
.period-list > div:hover { cursor: pointer;background: rgb(0, 0, 0, 0.06); }
.period-list > div > :first-child,
.period-list .period-custom { color: var(--primary);font-weight: 600; }
.period-list > div > :last-child::before { margin: 0 4px;content: "-"; }
.period-list > div > :last-child { font-size: 11px; }
.nav-top-tabs { color: var(--nav-top-color);}
.nav-top-tabs svg { fill: var(--nav-top-color);}
.nav-top .tabs { display: flex;align-items: center;justify-content: center;margin-left: auto;text-transform: none;background: var(--nav-top-background); }
.nav-top .tabs > * { cursor: pointer;display: flex;flex-direction: column;align-items: center;justify-content: center;min-width: 120px;width: 14vw;height: 100%;padding: 0 6px;color: var(--nav-top-color);border-bottom: 6px solid transparent;border-top: 6px solid transparent;text-align: center; }
.nav-top .tabs > * > :last-child { color: var(--inactive); }
.nav-top .tabs > *:hover { background: rgb(255, 255, 255, 0.1); }
.nav-top .tabs > *.active { color: var(--text);background: var(--background);border-top: 6px solid var(--highlight); }
.nav-top .tabs > *.active > :last-child { opacity: 0.6;color: var(--text); }

/* Responsive */
.nav-top { padding-left: 60px; }
.mobile .nav-top { padding-left: 40px; }
.laptop .nav-top { padding-left: calc(var(--menu-left) + 40px); }
.mobile:not(.laptop) { --menu-top: 120px; }
.mobile:not(.laptop) .nav-top { height: 60px; }
.mobile:not(.laptop) .nav-top .tabs > * { align-items: start;justify-content: center; }
.mobile:not(.laptop) .board.click .line:not(.first-line):not([class*="grp-"]) { display: inline-block; width: 100%; }
.mobile:not(.laptop) .card { width: 100%!important; }
.mobile:not(.laptop) .nav-top { justify-content: center; }
.mobile:not(.laptop) .nav-top .calendars { margin: 0; }
.mobile:not(.laptop) .nav-top .tabs { position: fixed;top: 59px;right: 0;width: 100%;height: 50px; }
.mobile:not(.laptop) .nav-top .tabs > * { flex: 1;border-width: 3px; }
.mobile:not(.laptop) .nav-top .tabs > *.active { border-bottom: 3px solid var(--highlight);border-top: 3px solid transparent; }
.mobile:not(.laptop) .nav-top .tabs > * > :last-child { display: none; }
.tablet:not(.laptop) .nav-top .tabs > * { width: 15vw; }
.mobile:not(.laptop) .retract-button { top: 10px;right: -40px;width: 40px;height: 40px; }
</style>

<template lang="pug">
nav.nav-top
  nav-top-calendar
  nav-top-tabs
</template>

<script>
export const additions = {"props":["type"]}
export default {
  computed: {
      title() {
        return this.t[this.$route.params.userflow] || this.t[this.$route.params.screen || 'slash']
      },
  }
}
</script>
