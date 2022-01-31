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
function getFileFromPasteEvent(event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData)
    .items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === "file") {
      return item.getAsFile();
    }
  }
}
export default {
  props: ["modelValue"],
  emits: ["filePasted"],
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
