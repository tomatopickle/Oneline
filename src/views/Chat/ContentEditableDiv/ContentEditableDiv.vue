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
};
</script>
