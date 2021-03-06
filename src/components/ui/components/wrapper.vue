<style>

</style>

<template lang="pug">

</template>

<script>
export const additions = {"props":["value"]}
export default {
  render(h) {
    if (!this.value || typeof this.value === 'function') return
    return h({ template: '<div>' + this.value + '</div>' })
  },
}
</script>