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
import { getFileFromPasteEvent } from "../../../scripts/globalFunctions.js";
import "medium-editor/dist/css/themes/beagle.min.css";
import "medium-editor/dist/css/medium-editor.min.css";
import MediumEditor from "medium-editor";
export default {
  props: ["modelValue"],
  emits: ["filePasted", "update:modelValue"],
  mounted() {
    var editor = new MediumEditor(".editable", {
      // toolbar: {
      //   allowMultiParagraphSelection: true,
      //   buttons: [
      //     "bold",
      //     "italic",
      //     "justifyLeft",
      //     "justifyCenter",
      //     "justifyRight",
      //     "unorderedlist",
      //   ],
      //   anchor: {
      //     customClassOption: null,
      //     customClassOptionText: "Button",
      //     linkValidation: false,
      //     placeholderText: "Paste or type a link",
      //     targetCheckbox: false,
      //     targetCheckboxText: "Open in new window",
      //   },
      //   diffLeft: 0,
      //   diffTop: -10,
      //   firstButtonClass: "medium-editor-button-first",
      //   lastButtonClass: "medium-editor-button-last",
      //   relativeContainer: null,
      //   standardizeSelectionStart: false,
      //   static: false,
      //   align: "center",
      //   sticky: false,
      //   updateOnEmptySelection: false,
      // },
    });
    console.log(editor);
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
<style lang="stylus">
@import '../../../variables.styl';

.editable {
  blockqoute {
    border-left : 1px solid $primary;
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