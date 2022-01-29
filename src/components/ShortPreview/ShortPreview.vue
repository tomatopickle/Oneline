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
<style>
.chatWindowSimple .shortPreview,
.chatWindowDefault .shortPreview {
  /* width: 35%; */
  margin-left: 35px;
  margin-top: 5px;
  margin-bottom: 5px;
  position: relative;
}
.shortPreview figure {
  margin: 0;
}
.shortPreview figure::after,
.shortPreview figure::before {
  border-radius: var(--ui-radius);
}
.shortPreview img {
  border-radius: var(--ui-radius);
  width: 100%;
}
.chatWindowDefault .msg-short-like .shortPreview::after {
  content: "❤";
  position: absolute;
  right: -7px;
  bottom: -10px;
  color: hotpink;
  background-color: hsl(var(--bg-dark), 13%);
  padding: 5px;
  border-radius: 30px;
  line-height: 1;
}
.chatWindowSimple .msg-short-like .shortPreview::after {
  content: "❤";
  position: absolute;
  right: -7px;
  bottom: -10px;
  color: hotpink;
  background-color: hsl(var(--bg-dark), 13%);
  padding: 5px;
  border-radius: 30px;
  line-height: 1;
}
.chatWindowSimple .me .shortPreview::after {
  right: unset;
  left: -7px;
}
</style>