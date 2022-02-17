<template>
  <b-card height="500px" glass>
    <template #header>
      <b-flex>
        <h4 class="mt-0 mb-0">Upload Short</h4>
        <b-spacer></b-spacer>
        <b-btn icon ghost @click="$emit('close')"
          ><b-icon name="mdi mdi-close"></b-icon
        ></b-btn>
      </b-flex>
    </template>
    <div>
      <b-input
        label="Poll Name"
        v-model="pollName"
        placeholder="Poll Name"
      ></b-input>
      <b-flex bare>
        <b-form
          class="w-full pr-2"
          @submit="
            if (option.name && !options.includes(option.name)) {
              options.push(option.name);
              option.name = '';
            }
          "
        >
          <b-input
            label="Options"
            v-model="option.name"
            placeholder="Option Name"
          ></b-input> </b-form
        ><b-btn
          :disabled="!option.name || options.includes(option.name)"
          icon
          style="margin-top: 20px"
          color="primary"
          outline
          @click="options.push(option.name)"
        >
          <b-icon name="mdi mdi-plus"></b-icon
        ></b-btn>
      </b-flex>
      <span class="ml-1 text-sm mt-3 mb-1 block">Poll Preview</span>
      <div id="pollPreview">
        <h4>{{ pollName || "Poll Name" }}</h4>
        <transition-group name="fadeUp">
          <template v-for="option in options" :key="option">
            <b-btn block style="margin-top: 5px; z-index: 0">
              {{ option }}
            </b-btn>
          </template>
        </transition-group>
      </div>
    </div>
    <template #footer>
      <b-btn
        :disabled="options.length == 0 || !pollName"
        block
        color="primary"
        class="mt-1"
        @click="uploadShortPoll()"
      >
        <b-icon left name="mdi mdi-tray-arrow-up"></b-icon>
        Upload Short
      </b-btn>
    </template>
  </b-card>
</template>
<script>
/* eslint-disable */
import db from "@/fire.js";
import { ref, set } from "firebase/database";
export default {
  name: "ShortPollWizard",
  props: ["user"],
  inject: ["openShort"],
  emits: ["close"],
  data: () => {
    return {
      option: {
        name: "",
      },
      pollName: "",
      options: [],
    };
  },
  methods: {
    uploadShortPoll() {
      const options = this.options;
      let poll = { name: this.pollName, options: {} };
      options.forEach((name) => {
        poll.options[name] = { name, votes: 0 };
      });
      const time = Date.now();
      set(ref(db, `shorts/${this.user.id}/${time}`), {
        time,
        type: "poll",
        poll,
      });
      this.openShort({ user: this.user, badge: 1 });
      this.$emit("close");
    },
  },
};
</script>
<style lang="stylus">
@import '~@/variables.styl';

#pollPreview {
  margin: auto;
  max-width: 500px;
  max-height: 200px;
  overflow-y: auto;
  background-color: lighten(alpha($bg-dark, 0.25), 25);
  padding: 15px;
  border-radius: var(--ui-radius);
  position: relative;

  h4 {
    margin-block: 5px;
    margin-bottom: 7px;
  }
}
</style>