<template>
  <div class="shortPreview">
    <div v-if="short.type == 'photo'">
      <figure :class="short.filter">
        <img :src="short.src" alt="" srcset="" />
      </figure>
    </div>
  </div>
</template>
<script>
export default {
  name: "ShortPreview",
  props: ["short"],
};
</script>
<style lang="stylus">
@import '../../variables.styl';

.chatWindowSimple .shortPreview, .chatWindowDefault .shortPreview {
  /* width: 35%; */
  margin-left: 35px;
  margin-top: 5px;
  margin-bottom: 5px;
  position: relative;
  cursor: pointer;
}

.chatWindowSimple, .chatWindowDefault {
  .shortPreview:before {
    content: 'View Full';
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%);
    z-index: 2;
    opacity: 0;
  }

  .msg-short-like, .msg-short-comment {
    div:first-child {
      position: relative;

      :after {
        content: '';
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: var(--ui-radius);
        background-color: alpha($bg-dark, 0.5);
        z-index: 1;
        transition: opacity 0.2s;
        opacity: 0;
      }
    }
  }

  .msg-short-like, .msg-short-comment {
    div:first-child:hover {
      .shortPreview:before {
        opacity: 1;
      }

      :after {
        opacity: 1;
      }
    }
  }
}

.shortPreview figure {
  margin: 0;
}

.shortPreview figure::after, .shortPreview figure::before {
  border-radius: var(--ui-radius);
}

.shortPreview img {
  border-radius: var(--ui-radius);
  width: 100%;
  max-height: 50vh;
  object-fit: contain;
}

.chatWindowDefault .msg-short-like .shortPreview::after {
  content: '❤';
  position: absolute;
  right: -7px;
  bottom: -10px;
  color: hotpink;
  background-color: lighten($bg-dark, 15);
  padding: 5px;
  border-radius: 30px;
  line-height: 1;
}

.chatWindowSimple .msg-short-like .shortPreview::after {
  content: '❤';
  position: absolute;
  right: -7px;
  bottom: -10px;
  color: hotpink;
  background-color: lighten($bg-dark, 15);
  padding: 5px;
  border-radius: 30px;
  line-height: 1;
}

.chatWindowSimple .me .shortPreview::after {
  right: unset;
  left: -7px;
}
</style>