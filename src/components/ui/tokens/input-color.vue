<style>
.input-color { border-radius: 4px;box-shadow: 0 0 1px #fff; }
.input-color input { position: absolute;visibility: hidden;margin-top: -30px;margin-left: -200px; }
.input-color .color { width: 1.4em;height: 1.4em;border-radius: var(--border-radius); }
</style>

<template lang="pug">
.input-color
  .color(:style="{ background: /^--/.test(label) ? 'var(' + label + ')' : value }")
  input(:value="value.hex()" type="color" @input="$emit('input', $event)" @change="$emit('change', $event)")
</template>

<script>
export const additions = {"props":["value","label"]}
export default {}
</script>