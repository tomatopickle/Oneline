<template>
  <div
    contenteditable="true"
    v-once
    class="editable"
    v-html="modelValue"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.innerHTML)"
  ></div>
</template>
<script>
import "medium-editor/dist/css/themes/beagle.min.css";
import "medium-editor/dist/css/medium-editor.min.css";
import MediumEditor from "medium-editor";
export default {
  props: ["modelValue"],
  emits: ["filePasted", "update:modelValue"],
  mounted() {
    new MediumEditor(".editable", {
      targetBlank: true,
      toolbar: {
        buttons: [
          "bold",
          "italic",
          "underline",
          "anchor",
          "h2",
          "h3",
          "quote",
          "unorderedlist",
        ],
      },
    });
  },
};
</script>
<style lang="stylus">
@import '../../../variables.styl';

.editable {
  blockquote {
    border-left: 3px solid var(--primary);
    padding-left: 10px;
    margin: 0;
  }

  p {
    margin-block: 0;
  }
}

.medium-editor-placeholder-relative:after, .medium-editor-placeholder:after {
  opacity: 0.7;
  font-style: normal;
}

.medium-editor-toolbar li button {
  line-height: 0.33;
}

html.dark {
  .medium-editor-toolbar {
    background-color: $bg-dark;
    border-radius: var(--ui-radius);
  }

  .medium-editor-toolbar li button:hover {
    background-color: lighten($bg-dark, 2);
    color: white;
  }

  .medium-editor-toolbar li .medium-editor-button-active {
    background-color: $bg-dark;
    color: $primary;
  }

  .medium-editor-toolbar-actions button, .medium-editor-toolbar-actions li {
    border-radius: var(--ui-radius);
  }

  .medium-toolbar-arrow-under:after {
    border-color: $bg-dark transparent transparent;
  }
}
</style>