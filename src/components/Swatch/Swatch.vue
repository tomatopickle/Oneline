<template>
  <div
    class="swatch"
    :style="{ backgroundColor: color, border: `${color} 2px solid` }"
  ></div>
</template>
<script>
export default {
  props: ["color"],
};
</script>
<style lang="stylus">
@import '../../variables.styl';

.swatch {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s cubic-bezier(0.2, 0, 0.13, 2);

  &:hover {
    transform: scale(1.25);
  }

  &:active {
    transform: scale(0.9);
  }
}
</style>