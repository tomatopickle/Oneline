<template>
  <div class="zoom">
    <v-lazy-image
      id="chatImage"
      src-placeholder="https://res.cloudinary.com/abaan/image/upload/v1640548169/dark-loading-gif.gif"
      :src="file?.url"
      :alt="file?.name"
    />
  </div>
</template>
<script>
import { zoom } from "zoom-by-ironex";
export default {
  name: "ZoomImage",
  props: ["file"],
  mounted() {
    zoom();
  },
};
</script>
<style lang="stylus">
.zoom {
  height: 100%;
}
</style>