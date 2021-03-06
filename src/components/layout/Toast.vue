<template>
<div class="toast-list" @mouseover="messages.map(m => m.pause && m.pause())" @mouseout="messages.map(m => m.resume && m.resume())">
  <div class="toast" :class="message.type" v-for="message, i in messages" :key="i">
    <span class="toast-description" v-if="(message.description || t.unknown_error).includes('<html>')" v-html="t[message.description] || message.description || t.unknown_error"></span>
    <span class="toast-description" v-else>{{ t[message.description] || message.description || t.unknown_error }}</span>
    <div class="progress-bar" :style="{ opacity: .5 + .5 * message.progress / 100 }"></div>
  </div>
</div>
</template>

<script>
export default {
  props: ['messages'],
}
</script>
