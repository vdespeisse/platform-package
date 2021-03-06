<style>
.screensharing .share { position: absolute;right: 20px;bottom: 20px;width: 40px;height: 40px;background-color: var(--primary);background-position: center center;background-repeat: no-repeat;background-size: cover;border-radius: 50%; }
.screensharing button { width: 40px;height: 40px;background-color: var(--primary);border-radius: 50%; }
.screensharing .all_disconnected_users { position: absolute;right: 20px;bottom: 70px;width: 50px; }
.screensharing .all_disconnected_users.inactive { transform: scaleY(0); }
.screensharing button.user { position: relative;bottom: 0;margin-bottom: 10px; }
.screensharing .all_disconnected_users .user { color: black;background-position: center center;background-repeat: no-repeat;background-size: cover; }
.screensharing .all_connected_users .user { color: black;background-position: center center;background-repeat: no-repeat;background-size: cover;margin-left: -15px; }
.screensharing .all_disconnected_users .user.connected { display: none; }
.screensharing .all_connected_users .user.disconnected { display: none; }
.screensharing .all_connected_users .user.connected { border: 2px solid var(--primary); }
.screensharing .all_connected_users { position: absolute;right: 65px;bottom: 10px; }
</style>

<template lang="pug">
.screensharing
  button.share(@click="toggle = !toggle") +
  .all_disconnected_users.column.bottom.right(:class="[{inactive:!toggle}]")
    button.user(:class="[{connected: $root.db.channels[user].length>2, disconnected: $root.db.channels[user].length<=2 }]" :style="'background-image: url(' + user.replace('AT','@').replace('DOT', '.').avatar() + ')'" @click="share_unshare(user)" v-for="user in $root.db.channels.keys()")
  .all_connected_users.row.bottom.right
    button.user(:class="[{connected: $root.db.channels[user].length>2, disconnected: $root.db.channels[user].length<=2}]" :style="'background-image: url(' + user.replace('AT','@').replace('DOT', '.').avatar() + ')'" @click="share_unshare(user)" v-for="user in $root.db.channels.keys()")
</template>

<script>
export const additions = {}
export default {
  data() {
    return {
      toggle: false,
    }
  },
  methods: {
    share_unshare(user) {
      if ($root.db.channels[user].length > 2) $root.stop_screenshare(user)
      else $root.screenshare(user)
    },
  },
}
</script>