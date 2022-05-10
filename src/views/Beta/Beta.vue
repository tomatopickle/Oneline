<template>
  <Head>
    <title>Beta | Oneline</title>
    <meta
      property="og:description"
      content="You can post, comment stuff here"
    />
  </Head>
  <b-app>
    <b-nav class="z-10">
      <template v-slot:branding>
        <b-flex>
          <img height="40" src="@/assets/logos/logo.png" alt="Oneline Logo" />
          <h2 class="mr-2">Oneline</h2>
          <span>Beta</span>
        </b-flex>
      </template>
      <template v-slot:actions>
        <b-btn
          @click="newPost.show = true"
          color="primary"
          v-show="user.username"
          >Create Post</b-btn
        >
      </template>
    </b-nav>
    <br /><br /><br /><br />
    <b-flex style="align-items: baseline">
      <b-spacer></b-spacer>
      <div>
        <template v-for="i in 10" :key="i">
          <b-card width="750px">
            <b-flex>
              <Skeletor circle size="50" />
              <Skeletor height="25" width="100" />
            </b-flex>
            <Skeletor class="center" height="100" width="650" />
            <br />
          </b-card>
          <br />
        </template>
        <br /><br />
      </div>
      <b-spacer></b-spacer>

      <b-card class="sticky top-24" width="300px">
        <template #header>
          <span>Follow People</span>
        </template>
        <p class="mb-2">Follow more people to get better content</p>
        <template #footer>
          <b-btn outline color="primary" block>Explore</b-btn>
        </template>
      </b-card>
    </b-flex>
    <b-modal width="500px" v-model="newPost.show">
      <b-card width="500px" height="400px" overflow>
        <template #header>
          <b-flex>
            <b-avatar
              :username="user.username || ''"
              :src="user.avatar"
              :size="35"
            ></b-avatar>
            <span>{{ `Post as ${user.username}` }}</span>
            <b-spacer></b-spacer>
            <b-btn icon ghost @click="newPost.show = false">
              <b-icon name="mdi mdi-close"></b-icon>
            </b-btn>
          </b-flex>
        </template>
        <br />
        <b-textarea
          ghost
          height="200px"
          placeholder="What do you wanna say to your followers?"
          id="createPostTextarea"
        ></b-textarea>
        <br />
        <b-flex>
          <b-btn circle icon
            ><b-icon size="25px" name="mdi mdi-image"></b-icon
          ></b-btn>
          <b-btn circle icon
            ><b-icon size="25px" name="mdi mdi-video"></b-icon
          ></b-btn>

          <b-spacer></b-spacer>
          <b-btn color="primary">Post</b-btn>
        </b-flex>
      </b-card>
    </b-modal>
    <br />
  </b-app>
</template>

<script>
/*eslint-disable */
import db from "../../fire.js";
import {
  ref,
  set,
  // off,
  query,
  get,
  startAt,
  endAt,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { nanoid } from "nanoid";
import router from "../../router";
export default {
  data: () => {
    return {
      user: {},
      newPost: {
        show: false,
      },
    };
  },
  mounted() {
    get(ref(db, `users/${localStorage.getItem("id")}`)).then((snapshot) => {
      console.log(snapshot.val());
      if (snapshot.exists()) {
        this.user = snapshot.val();
        const settingsData = this.user.settings.data;
        if (settingsData?.lightMode) {
          document.querySelector("html").classList.remove("dark");
          document
            .querySelector("meta[name='theme-color']")
            .setAttribute("content", "#fff");
        } else {
          document.querySelector("html").classList.add("dark");
          document
            .querySelector("meta[name='theme-color']")
            .setAttribute("content", "#242428");
        }
      }
    });
  },
  methods: {},
};
</script>

<style scoped lang="stylus">
@import './styles/style.styl';
</style>