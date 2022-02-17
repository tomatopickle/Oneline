 <template>
  <template v-for="option in poll.options" :key="option.name">
    <div
      v-if="option.name"
      :class="{ voteResultOpt: true, top: top == option?.name }"
    >
      <b>{{ option?.votes }}</b>
      <span>{{ option?.name }}</span>
    </div>
  </template>
</template>
<script>
export default {
  props: ["poll"],
  emits: ["ready"],
  data: () => {
    return { top: "" };
  },
  updated() {
    const options = this.poll.options;
    var maxValue = 0;
    for (var key in options) {
      const value = options[key].votes;
      if (value > maxValue) {
        maxValue = value;
        this.top = key;
      }
    }
  },
  mounted() {
    const options = this.poll.options;
    var maxValue = 0;
    for (var key in options) {
      const value = options[key].votes;
      if (value > maxValue) {
        maxValue = value;
        this.top = key;
      }
    }
  },
};
</script>
<style lang="stylus">
@import '~@/variables.styl';

.voteResultOpt {
  display: flex;
  align-items: center;
  border: 1px solid lighten($bg-dark, 20%);
  border-radius: var(--ui-radius);
  margin-block: 7px;
  padding: 5px;
  transition: border 1s;

  b {
    margin-inline: 5px;
  }

  span {
    text-align: center;
    width: 80%;
  }

  &.top {
    border-color: lighten($primary, 7);
    color: lighten($primary, 7);
  }
}
</style>