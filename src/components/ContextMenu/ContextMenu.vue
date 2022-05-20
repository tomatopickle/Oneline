<template>
  <transition name="fade">
    <div
      @click="close()"
      v-click-outside="close"
      v-show="display"
      class="context-menu"
      :style="{ top, left }"
    >
      <slot></slot>
    </div>
  </transition>
</template>
<script>
export default {
  name: "ContextMenu",
  emits: ["closed"],
  data() {
    return {
      left: 0,
      top: 0,
      display: false,
    };
  },
  methods: {
    open(evt) {
      // updates position of context menu
      this.left = mouseX(evt) + "px";
      this.top = mouseY(evt) + "px";
      console.log(evt);
      this.display = true;
      console.log("opened");
    },
    close() {
      this.display = false;
      this.$emit("closed");
      console.log("closed");
    },
  },
};

function mouseX(evt) {
  if (evt.pageX) {
    return evt.pageX;
  } else if (evt.clientX) {
    return (
      evt.clientX +
      (document.documentElement.scrollLeft
        ? document.documentElement.scrollLeft
        : document.body.scrollLeft)
    );
  } else {
    return null;
  }
}

function mouseY(evt) {
  if (evt.pageY) {
    return evt.pageY;
  } else if (evt.clientY) {
    return (
      evt.clientY +
      (document.documentElement.scrollTop
        ? document.documentElement.scrollTop
        : document.body.scrollTop)
    );
  } else {
    return null;
  }
}
</script>
<style>
.context-menu {
  position: fixed;
  z-index: 999;
  outline: none;
}
</style>
