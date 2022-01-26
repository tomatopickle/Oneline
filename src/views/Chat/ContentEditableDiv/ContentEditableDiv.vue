<template>
  <div
    contenteditable="true"
    v-once
    v-html="modelValue"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.innerHTML)"
  ></div>
</template>
<script>
export default {
  props: ["modelValue"],
  mounted() {
    this.$el.addEventListener("paste", function (e) {
      e.preventDefault();
      var text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    });
  },
};
</script>
