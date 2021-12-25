<template>
  <router-view/>
  <!-- <router-view v-slot="{ Component }">
  <transition name="fadeUpBig">
    <component :is="Component" />
  </transition>
</router-view> -->
  <notifications position="bottom right" />
</template>
<script>
export default {};
</script>
<style src="../node_modules/bounce-ui-vue/dist/bounce_ui.css"></style>
<style>
@import url("./styles.css");
@tailwind utilities;
@tailwind base;
</style>
