<style>
.pdf footer { flex-direction: column;line-height: 1.1;text-align: center;white-space: pre-line; }
.pdf .block-pdf-footer { margin: auto -30px -30px -30px;padding: 20px 30px;background: var(--primary-light);border-radius: 0; }
</style>

<template lang="pug">
footer(v-html="t.footer")
</template>

<script>
export const additions = {}
export default {
  methods: {
    pagenum() {
      const pagelength = document.querySelectorAll('.pdf-page').length
      if (!window.pagenum || window.pagenum >= pagelength) window.pagenum = 0
      return 1 + pagelength - ++window.pagenum + '/' + pagelength
    }
  },
}
</script>