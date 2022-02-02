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
import { getFileFromPasteEvent } from "../../../scripts/globalFunctions.js";
export default {
  props: ["modelValue"],
  emits: ["filePasted", "update:modelValue"],
  mounted() {
    this.$el.addEventListener("paste", (e) => {
      const file = getFileFromPasteEvent(e);
      if (file) {
        this.$emit("filePasted", file);
      }
      e.preventDefault();
      var text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    });
  },
};
</script>
