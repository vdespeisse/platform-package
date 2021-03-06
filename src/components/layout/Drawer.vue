<template>
<div class="drawer-wrapper">
  <slot name="button" v-if="button">
    <button btn primary @click="open = true">
      <svg-icon :name="icon" v-if="icon"></svg-icon>
      {{ button }}
    </button>
  </slot>
  <transition name="fade">
    <div class="overlay" @click="$emit('close')" v-if="open"></div>
  </transition>
  <transition name="fade">
    <svg class="close" v-if="open" @click="$emit('close')">
      <line fill="none" stroke="#FFFFFF" stroke-width="2" stroke-miterlimit="10" x1="2" y1="2" x2="18" y2="18" />
      <line fill="none" stroke="#FFFFFF" stroke-width="2" stroke-miterlimit="10" x1="18" y1="2" x2="2" y2="18" />
    </svg>
  </transition>
  <transition :name="$root.size === 'mobile' ? 'slide-top' : 'slide-left'">
    <div class="drawer" v-if="open">
      <slot></slot>
    </div>
  </transition>
</div>
</template>

<script>
export default {
  props: ['button', 'icon', 'toggle'],
  data() { return { open: !!this.toggle } },
  watch: {
    toggle(val) {
      this.open = !!val
    },
  },
  mounted() {
    this.$emit('mounted', this)
    this.$on('open', () => this.open = true)
    this.$on('close', () => this.open = false)
    this.ev_keydown = e => {
      if (e.key === 'Escape') this.$emit('close')
    }
    window.addEventListener('keydown', this.ev_keydown)
  },
  detached() {
    window.removeEventListener('keydown', this.ev_keydown)
  },
}
</script>
