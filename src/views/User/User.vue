<template>
  <Head>
    <title>{{ `${user.username || "User"} | Oneline` }}</title>
    <meta
      property="og:title"
      :content="`${user.username || 'User'} | Oneline`"
    />
    <meta
      property="og:description"
      :content="user.description || 'Know about this person in Oneline'"
    />
    <meta property="og:image" :content="user.avatar || './assets/logo.png'" />
  </Head>
  <b-app :loading="loading" loading-text="Loading User Info">
    <b-card
      width="500px"
      class="center"
      style="background-color: transparent; box-shadow: none; margin-top: 5vh"
    >
      <b-flex>
        <div>
          <b-avatar
            :size="75"
            :username="user.username ? user.username : ''"
            :src="user?.avatar"
          ></b-avatar>
        </div>
        <div id="userInfo" class="pt-3">
          <h1 class="m-0 mt-3 ml-2">
            {{ user?.username }}
          </h1>
          <p id="userInfoPara">
            {{ user?.description }}
          </p>
        </div>
      </b-flex>
    </b-card>
    <div class="pl-5">
      <h2>Shorts</h2>
      <div
        id="shorts"
        v-masonry="containerId"
        transition-duration="0.3s"
        item-selector=".item"
        horizontal-order="true"
      >
        <div
          v-masonry-tile
          class="item"
          v-for="short in shorts"
          :key="short.time"
          v-on:click="openShort(short)"
        >
          <short-preview :short="short"></short-preview>
          <span
            class="ml-1 opacity-75"
            v-html="getFormattedTime(short.time)"
          ></span>
        </div>
      </div>
    </div>
  </b-app>
  <b-modal width="500px" v-model="shortModal.show" id="shortsModal">
    <div>
      <b-flex>
        <b-avatar :username="user.username || ''" :src="user.avatar"></b-avatar>
        <div>
          <h3 class="m-0">{{ user.username }}</h3>
          <small
            style="margin-left: 0"
            v-if="timeSince(shortModal.short.time) != '0 seconds'"
            >{{ timeSince(shortModal.short.time) }} ago</small
          >
          <small style="margin-left: 0" v-else>Just now</small>
        </div>
        <b-spacer></b-spacer>
        <b-btn
          bounce
          icon
          data-tooltip="Copy Short Link"
          @click="
            copy(`${baseUrl}?story=${shortModal.short.time}&user=${user.id}`)
          "
        >
          <b-icon name="mdi mdi-content-copy"></b-icon>
        </b-btn>
      </b-flex>
    </div>
    <br />

    <div class="short">
      <figure
        v-if="shortModal.short.type == 'photo'"
        :class="shortModal.short.filter"
      >
        <img class="shortImage" :src="shortModal.short.src" alt="" />
        <h4 class="shortImageCaption">{{ shortModal.short?.caption }}</h4>
      </figure>
      <figure v-else-if="shortModal.short.type == 'video'">
        <video
          class="shortImage"
          :src="shortModal.short.src"
          autoplay
          controls
          alt=""
        />
      </figure>
      <div v-else-if="shortModal.short.type == 'poll'">
        <b-card class="center">
          <ShortPollResults :poll="shortModal.short.poll" />
        </b-card>
      </div>
    </div>
  </b-modal>
</template>

<script>
/* eslint-disable */
import VueHorizontal from "vue-horizontal";
import db from "../../fire.js";
import {
  ref,
  get,
  child,
  onValue,
  query,
  limitToLast,
  orderByValue,
} from "firebase/database";
import stringify from "json-stable-stringify";
import ShortPreview from "@/components/ShortPreview/ShortPreview.vue";
import ShortPollResults from "@/components/ShortPollResults/ShortPollResults.vue";

export default {
  name: "User",
  components: { ShortPreview, VueHorizontal, ShortPollResults },
  data: () => {
    return {
      baseUrl: "https://" + location.host,
      loading: true,
      user: {},
      shorts: {},
      shortModal: {
        show: false,
        short: {},
      },
    };
  },
  mounted() {
    if (
      !document.querySelector("html").classList.contains("dark") &&
      (localStorage.getItem("lightMode") != "true" ||
        localStorage.getItem("lightMode") != true)
    ) {
      this.$toggleTheme();
      document
        .querySelector("meta[name='theme-color']")
        .setAttribute("content", "#242428");
    } else {
      document
        .querySelector("meta[name='theme-color']")
        .setAttribute("content", "#fff");
    }
    get(child(ref(db), "users/" + this.$route.params.userId)).then(
      (snapshot) => {
        if (snapshot.exists()) {
          var data = snapshot.val();
          this.user = data;
          // document.title = `${data.username} | Oneline`;
          this.loading = false;
          onValue(
            query(
              ref(db, `shorts/${this.$route.params.userId}`),
              limitToLast(25)
            ),
            (snapshot) => {
              if (snapshot.exists()) {
                // To sort according to short time
                var data = JSON.parse(
                  stringify(snapshot.val(), function (a, b) {
                    return a.key < b.key ? 1 : -1;
                  })
                );
                this.shorts = data;
              }
              this.loading = false;
            }
          );
        } else {
          alert("Error: User not found");
          this.$router.push("/");
        }
      }
    );
  },
  methods: {
    openShort(short) {
      this.shortModal.short = short;
      this.shortModal.show = true;
    },
    copy(text) {
      const cb = navigator.clipboard;
      cb.writeText(text);
    },
    getFormattedTime(time) {
      return `${this.formatToDay(time)}, ${this.formatTimeToAMPM(time)}`;
    },
    timeSince(date) {
      if (date == 0) return "";
      date = new Date(date);
      var seconds = Math.floor((new Date() - date) / 1000);

      var interval = seconds / 31536000;

      if (interval > 1) {
        return (
          Math.floor(interval) +
          " year" +
          (Math.floor(interval) == 1 ? "" : "s")
        );
      }
      interval = seconds / 2592000;
      if (interval > 1) {
        return (
          Math.floor(interval) +
          " month" +
          (Math.floor(interval) == 1 ? "" : "s")
        );
      }
      interval = seconds / 86400;
      if (interval > 1) {
        return (
          Math.floor(interval) + " day" + (Math.floor(interval) == 1 ? "" : "s")
        );
      }
      interval = seconds / 3600;
      if (interval > 1) {
        return (
          Math.floor(interval) +
          " hour" +
          (Math.floor(interval) == 1 ? "" : "s")
        );
      }
      interval = seconds / 60;
      if (interval > 1) {
        return (
          Math.floor(interval) +
          " minute" +
          (Math.floor(interval) == 1 ? "" : "s")
        );
      }
      return (
        Math.floor(seconds) + " second" + (Math.floor(interval) == 1 ? "" : "s")
      );
    },
    formatToDay(timestamp) {
      var in_the_last_7days_date_options = { weekday: "long" };
      var same_year_date_options = { month: "short", day: "numeric" };
      var far_date_options = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      var dt = new Date(timestamp);
      var date = dt.getDate();
      var time_diff = timestamp - Date.now();
      var diff_days = new Date().getDate() - date;
      var diff_months = new Date().getMonth() - dt.getMonth();
      var diff_years = new Date().getFullYear() - dt.getFullYear();

      var is_today = diff_years === 0 && diff_months === 0 && diff_days === 0;
      var is_yesterday =
        diff_years === 0 && diff_months === 0 && diff_days === 1;
      var is_in_the_last_7days =
        diff_years === 0 && diff_months === 0 && diff_days > 1 && diff_days < 7;
      var is_same_year = diff_years === 0;

      if (is_today) {
        return "Today";
      } else if (is_yesterday) {
        return "Yesterday";
      } else if (is_in_the_last_7days) {
        return dt.toLocaleString("en", in_the_last_7days_date_options);
      } else if (is_same_year) {
        return dt.toLocaleString("en", same_year_date_options);
      } else {
        return dt.toLocaleString("en", far_date_options);
      }
    },
    formatTimeToAMPM(timestamp) {
      const date = new Date(timestamp);
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? "0" + minutes : minutes;
      var strTime = hours + ":" + minutes + " " + ampm;
      return strTime;
    },
  },
};
</script>

<style>
#userInfo {
  margin-left: 15px;
}
#userInfoPara {
  margin-left: 0;
}
#shorts {
  width: 97vw;
  user-select: none;
}
#shorts .item {
  width: 22vw;
  margin: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}
#shorts .item:active {
  transform: scale(0.9);
}
#shorts .item:hover .shortPreview:before,
#shorts .item:hover:after {
  opacity: 1;
}
.shortPreview {
  position: relative;
}
#shorts .item .shortPreview:before {
  content: "";
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: var(--ui-radius);
  background-color: #1a1a1ab5;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.2s;
}
#shorts .item:after {
  content: "View Full";
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%);
  z-index: 2;
  opacity: 0;
  transition: opacity 0.2s;
}
#shortsModal .modal {
  overflow: hidden;
}
#shortsModal .modal-backdrop {
  backdrop-filter: blur(10px);
}
#shortsModal figure {
  position: relative;
  width: max-content;
  max-width: 100%;
  margin: auto;
}
#shortsModal figure:hover .shortImageCaption {
  opacity: 0;
}
#shortsModal figure::after,
#shortsModal figure::before {
  border-radius: var(--ui-radius);
}
#shortsModal .shortImage {
  border-radius: var(--ui-radius);
  max-height: 55vh;
  margin: auto;
  width: 100%;
  object-fit: contain;
}
</style> 
