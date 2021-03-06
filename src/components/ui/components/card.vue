<style>
.tag { display: inline-flex;justify-content: center;max-width: fit-content;padding: 2px 4px;color: white;background: var(--primary);border-radius: var(--border-radius);font: var(--p2); }
.card { display: flex;flex-direction: column;min-width: 240px;padding: 12px;background: white;border: 4px solid transparent;border-radius: 8px;box-shadow: var(--box-shadow);transition: var(--transition); }
.card.more { align-items: center;justify-content: center;color: var(--inactive);background: none;border-color: var(--inactive);box-shadow: none; }
.card .title { font: var(--h3);font-weight: 600;line-height: 1.5; }
.card .info { color: var(--inactive); }
.card .value { display: inline-flex;align-items: baseline;margin: 12px 0; }
.card .action { display: flex;margin: auto -8px 0;max-width: 100%; }
.card .action select { max-width: 60%; }
.card .action > * { flex: 1;margin: 0 8px; }
a.card .value { margin: 12px 0 0; }
a.card:hover { border-color: var(--highlight); }
.value .number { font: var(--h2);font-weight: 800;line-height: 1; }
.value .unit { font: var(--p1); }
.line-overflow { display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 2;overflow: hidden; }
</style>

<template lang="pug">
router-link.card(:tag="data.link ? 'a' : 'div'" :to="data.link || ''")
  .tag(:class="data.tag" v-if="data.tag") {{ t[data.tag] || data.tag }}
  .title(:class="data.info && 'line-overflow'") {{ t[data.title] || data.title }}
  slot(name="info" :data="data")
    .info.line-overflow {{ t[data.info] || data.info }}
  .value(v-html="unit(data.value)")
  slot(name="links" :data="data")
    .action(v-if="data.links")
      select(@change="share_path = $event.target.value")
        option(:value="link.link" v-for="link in data.links") {{ link.name }}
      router-link.button.primary(:to="share_path || data.links[0].link") {{ t.access }}
</template>

<script>
export const additions = {"props":["data"]}
export default {
  data() {
    return {
      share_path: 0,
    }
  },
}
</script>