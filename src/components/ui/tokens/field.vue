<style>

</style>

<template lang="pug">
label(:class="[label, type.replace('input', 'field')]")
  | {{ label.titleize() }}
  component(:is="type" :label="label" :value="value" @change="$emit('change', $event)" @input="$emit('input', $event)")
</template>

<script>
export const additions = {"props":["value","label"]}
export default {
  computed: {
    type() {
      if (/^(rgb|hsl)/.test(this.value) || /^#[0-9A-f]{3}/.test(this.value)) return 'input-color'
      if (/^url\(/.test(this.value)) return 'input-url'
      return 'input'
    },
  },
}
</script>