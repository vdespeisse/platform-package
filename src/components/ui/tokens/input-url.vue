<style>
.tool-panel section label.field-url { padding: 0 0 0 20px; }
.input-url { display: flex; }
.input-url img { max-width: 30px;max-height: 30px;margin: auto 10px; }
.input-url input[type=file] { display: none; }
</style>

<template lang="pug">
.input-url
  img(:src="value.slice(4, -1)")
  label.file FILE
    input(type="file" @input="upload($event)")
  label.url(@click="$emit('input', 'url(' + window.prompt('URL') + ')')") URL
</template>

<script>
export const additions = {"props":["value","label"]}
export default {
  methods: {
    upload($event) {
      const reader  = new FileReader()
      reader.addEventListener('load', () => this.$emit('input', 'url(' + reader.result + ')'), false)
      reader.readAsDataURL($event.target.files[0])
    },
  },
}
</script>