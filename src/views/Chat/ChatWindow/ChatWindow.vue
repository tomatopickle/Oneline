<template>
  <div class="chatWindowDefault">
    <template v-for="(message, i) in messages" :key="i">
      <div
        :class="{
          msg: true,
          me: message.sender == user.id,
          sub:
            checkMsgFromSameUser(message, i) &&
            !checkTimeDifference(message, i),
          last:
            checkLastMsgFromSameUser(message, i) ||
            checkLastTimeForSameUser(message, i),
        }"
        v-if="message.type != 'info'"
        v-on:dblclick="
          reaction.message = i;
          addReaction(settings.data.likeEmoji);
        "
      >
        <div v-if="!settings.data.showExactTime">
          <div
            class="sameDay"
            v-if="checkDayDifference(message, i)"
            v-html="formatToDay(message.time)"
          ></div>
        </div>
        <div>
          <div class="messageActions">
            <b-flex>
              <sl-icon-button
                v-on:click="
                  reaction.message = i;
                  reaction.show = true;
                "
                name="addReaction"
                label="Add reaction"
                library="oneline"
              >
              </sl-icon-button>
              <sl-icon-button
                v-on:click="$emit('reply', message)"
                name="reply-fill"
                label="Reply"
              >
              </sl-icon-button>

              <sl-icon-button
                v-on:click="$emit('reply', message)"
                name="clipboard2-fill"
                label="Copy Message"
              >
              </sl-icon-button>
            </b-flex>
          </div>
          <div>
            <b-flex
              style="align-items: center"
              v-if="
                !(
                  checkMsgFromSameUser(message, i) &&
                  !checkTimeDifference(message, i)
                )
              "
            >
              <div class="senderAvatar">
                <Popper arrow :interactive="true" placement="right">
                  <b-avatar
                    :size="30"
                    class="senderAvatarEl"
                    :username="
                      users[message.sender]
                        ? users[message.sender].username
                        : ''
                    "
                    :src="users[message.sender]?.avatar"
                  >
                  </b-avatar>
                  <template #content>
                    <b-card
                      glass
                      class="p-0"
                      style="
                        max-width: 310px;
                        padding-right: 35px;
                        padding-bottom: 5px;
                      "
                    >
                      <b-flex>
                        <div>
                          <b-avatar
                            :size="45"
                            :username="
                              users[message.sender]
                                ? users[message.sender].username
                                : ''
                            "
                            :src="users[message.sender]?.avatar"
                          ></b-avatar>
                        </div>
                        <div>
                          <h4 class="m-0 mt-3 ml-2">
                            {{ users[message.sender]?.username }}
                          </h4>
                          <p class="userInfoPara">
                            {{ users[message.sender]?.description }}
                          </p>
                        </div>
                      </b-flex>
                      <b-flex style="width: 107%; padding-block: 5px">
                        <b-spacer v-if="message.sender != user.id"></b-spacer>
                        <b-btn
                          v-if="message.sender != user.id"
                          style="margin-right: -15px"
                          size="small"
                          color="primary"
                          v-on:click="
                            $emit('startMeetingWithUser', users[message.sender])
                          "
                        >
                          <b-icon
                            name="mdi mdi-video"
                            left
                            class="pr-1"
                          ></b-icon>
                          Meet
                        </b-btn>
                        <router-link :to="`/user/${message.sender}`">
                          <b-btn size="small">
                            <b-icon
                              name="mdi mdi-account"
                              left
                              class="pr-1"
                            ></b-icon>
                            View Profile
                          </b-btn></router-link
                        >
                      </b-flex>
                    </b-card>
                  </template>
                </Popper>
              </div>
              <small class="username flex"
                ><span>{{ users[message.sender]?.username }}</span>
                <div
                  v-if="checkIfUserHasTag(message.sender)"
                  class="userTag"
                  :style="{
                    '--tagColor':
                      this.chat.tags[checkIfUserHasTag(message.sender)].color,
                  }"
                >
                  {{ checkIfUserHasTag(message.sender) }}
                </div></small
              >
              <div
                class="time"
                v-html="
                  settings.data.showExactTime
                    ? getTime(message.time)
                    : formatTimeToAMPM(message.time)
                "
              ></div>
            </b-flex>
            <!-- Down there we're checking if the text contains emojis, as in only one emoji. Browsers act weird with this don't know why-->
            <div v-if="message.type == 'gif'" class="msg-gif">
              <v-lazy-image
                src-placeholder="https://res.cloudinary.com/abaan/image/upload/v1640548169/dark-loading-gif.gif"
                height="200"
                :src="message.src"
                :alt="message.title"
              />
            </div>
            <div v-else-if="message.type == 'file'">
              <div class="fileMsg">
                <b-flex>
                  <span>
                    {{ message.file.name }}
                  </span>
                  <b-spacer></b-spacer>
                  <b-btn
                    icon
                    ghost
                    v-on:click="downloadFile(message.file)"
                    :loading="
                      download.loading && message.file.time == download.time
                    "
                  >
                    <b-icon ghost name="mdi mdi-download"></b-icon>
                  </b-btn>
                </b-flex>
              </div>
            </div>
            <div v-else-if="message.type == 'audio'">
              <div class="fileMsg">
                <b-flex>
                  <b-btn
                    icon
                    ghost
                    v-on:click="
                      $emit('playAudio', message);
                      log(message.src);
                    "
                  >
                    <b-icon ghost name="mdi mdi-play"></b-icon>
                  </b-btn>
                  <span style="font-size: 16px">
                    {{ message.duration }}
                  </span>
                </b-flex>
              </div>
            </div>
            <div v-else-if="message.type == 'image'" class="msg-image">
              <div class="controls">
                <b-btn
                  icon
                  class="mr-1"
                  glass
                  color="primary"
                  v-on:click="downloadFile(message.file)"
                  :loading="
                    download.loading && message.file.time == download.time
                  "
                >
                  <b-icon name="mdi mdi-download"></b-icon>
                </b-btn>
                <b-btn
                  v-on:click="openImage(message)"
                  icon
                  glass
                  color="primary"
                >
                  <b-icon name="mdi mdi-fullscreen"></b-icon>
                </b-btn>
              </div>
              <v-lazy-image
                src-placeholder="https://res.cloudinary.com/abaan/image/upload/v1640548169/dark-loading-gif.gif"
                height="200"
                :src="message.file.url"
                :alt="message.file.name"
              />
            </div>
            <div v-else-if="message.type == 'likeShort'" class="msg-short-like">
              <div style="width: 35%">
                <short-preview
                  v-on:click="
                    Object.keys(this.users).forEach((usr) => {
                      if (message.sender != usr) {
                        $emit('openShort', {
                          short: message.short,
                          sender: usr,
                        });
                      }
                    })
                  "
                  :short="message.short"
                ></short-preview>
              </div>
              <span class="msg-text">{{
                message?.username + " liked your Short"
              }}</span>
            </div>
            <div
              v-else-if="message.type == 'commentShort'"
              class="msg-short-comment"
            >
              <div style="width: 35%">
                <short-preview
                  v-on:click="
                    Object.keys(this.users).forEach((usr) => {
                      if (message.sender != usr) {
                        $emit('openShort', {
                          short: message.short,
                          sender: usr,
                        });
                      }
                    })
                  "
                  :short="message.short"
                ></short-preview>
              </div>
              <span class="msg-text">{{ message.text }}</span>
            </div>
            <div v-else-if="message.type == 'reply'" :class="`msg-reply`">
              <b-flex bare class="msg-text opacity-70">
                <span class="font-semibold">{{
                  `${users[message.replyingTo.sender]?.username}: `
                }}</span>
                <div
                  class="parent-message"
                  v-html="
                    convertMessageToHTML(
                      message.replyingTo?.text ||
                        getMessagePreview(message.replyingTo)
                    )
                  "
                ></div>
              </b-flex>
              <div
                :class="{
                  'msg-text': true,
                  oneEmoji: checkOnlyOneEmoji(message.text),
                }"
                v-html="convertMessageToHTML(message.text)"
              ></div>
            </div>
            <div
              v-else
              :class="{
                'msg-text': true,
                oneEmoji: checkOnlyOneEmoji(message.text),
              }"
              v-html="convertMessageToHTML(message.text)"
            ></div>
          </div>
        </div>
        <!-- We don't want the reactions component if they aren't any reactions, the take up space -->
        <div class="reactions" v-if="!!message.reactions">
          <span
            v-for="(users, key) in message.reactions"
            :key="key"
            class="reaction"
            v-on:click="reactionClicked(i, key)"
          >
            <b-flex style="padding: 0" v-if="key != 'undefined'">
              <emoji :size="18" :data="emojiIndex" :emoji="key"></emoji>
              <span :class="'reactionNumber ' + checkIfUserReacted(users)">{{
                getNumberOfReactions(users)
              }}</span>
            </b-flex>
          </span>
        </div>
        <div
          class="reactions seenUsersIndicator"
          v-if="!!message.seen && i == lastMessage"
        >
          <template v-for="(usr, key) in message.seen" :key="key">
            <span v-if="usr.id != user.id">
              <b-flex style="padding: 0">
                <b-avatar
                  v-if="usr.username"
                  :username="usr.username || ''"
                  :src="usr.avatar || ''"
                  :size="20"
                ></b-avatar>
              </b-flex>
            </span>
          </template>
        </div>
      </div>
      <div v-else>
        <span class="info-message">
          <b-flex>
            <b-icon name="mdi mdi-information-outline"></b-icon>
            <span>{{ message.text }}</span>
          </b-flex>
        </span>
      </div>
      <link-preview
        v-if="findLink(message?.text) != false"
        :url="findLink(message?.text)"
      >
      </link-preview>
    </template>
  </div>
  <b-modal v-model="reaction.show">
    <Picker
      id="reactionPicker"
      color="#286ef1"
      autoFocus
      size="15"
      title="Pick a Reaction…"
      emoji="point_up"
      :data="emojiIndex"
      set="apple"
      @select="addReaction"
  /></b-modal>
  <b-modal
    v-model="image.show"
    height="100vh"
    width="100vw"
    id="fullScreenImageModal"
  >
    <div id="imagePreParent">
      <b-nav style="position: relative"
        ><template v-slot:branding>
          <b-flex class="m-0 p-0 w-full">
            <b-avatar
              :src="this.users[image.message?.sender]?.avatar || ''"
              :username="this.users[image.message?.sender]?.username || ''"
              :size="35"
            ></b-avatar>
            <h3 class="mt-0 mb-1">
              {{ this.users[image.message?.sender]?.username }}
            </h3>
            <transition name="fade" :duration="{ enter: 1000, leave: 10 }">
              <small id="lastOnline">
                <span> {{ getFormattedTime(image.message?.time) }} </span>
              </small>
            </transition>
          </b-flex>
        </template>
        <template v-slot:actions>
          <b-flex bare>
            <b-btn
              :loading="download.loading"
              style="height: 44px"
              icon
              ghost
              @click="downloadFile(image.file)"
            >
              <b-icon name="mdi mdi-download"></b-icon>
            </b-btn>
            <b-btn icon ghost @click="image.show = false">
              <b-icon name="mdi mdi-close"></b-icon>
            </b-btn>
          </b-flex>
        </template>
      </b-nav>
      <div style="flex-grow: 1">
        <ZoomImage :file="image.file"></ZoomImage>
      </div>
      <div id="imageThumbnails">
        <v-lazy-image
          :class="{
            thumbnailImage: true,
            selected: imageThumb.file.time == image.file.time,
          }"
          v-for="imageThumb in image.images"
          :key="imageThumb.time"
          src-placeholder="https://res.cloudinary.com/abaan/image/upload/v1640548169/dark-loading-gif.gif"
          :src="imageThumb.file?.url"
          :alt="imageThumb.file?.name"
          v-on:click="openImage(imageThumb)"
        />
      </div>
    </div>
  </b-modal>
</template>

<script>
/* eslint-disable */
import db from "../../../fire.js";

import { storage } from "../../../fire.js";
import VueHorizontal from "vue-horizontal";
import linkifyHtml from "linkify-html";
import {
  ref,
  set,
  get,
  child,
  onValue,
  update,
  remove,
  query,
  orderByChild,
  limitToLast,
  equalTo,
  startAfter,
  endBefore,
  orderByKey,
  startAt,
  off,
} from "firebase/database";
import {
  ref as storageRef,
  getDownloadURL,
  uploadBytesResumable,
  getBlob,
} from "firebase/storage";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex, Emoji } from "emoji-mart-vue-fast/src";
let emojiIndex = new EmojiIndex(data);
twemoji.size = "";
twemoji.base =
  "https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-160";
import { find } from "linkifyjs";
import LinkPreview from "../../../components/LinkPreview/LinkPreview.vue";
import ShortPreview from "../../../components/ShortPreview/ShortPreview.vue";
import ZoomImage from "../../../components/ZoomImage/ZoomImage.vue";
export default {
  name: "ChatWindow",
  components: {
    Picker,
    Emoji,
    LinkPreview,
    ShortPreview,
    VueHorizontal,
    ZoomImage,
  },
  emits: ["playAudio", "reply", "startMeetingWithUser", "openShort"],
  props: {
    user: Object,
    chat: Object,
    messages: Object,
    limit: Number,
    enableScroll: Boolean,
    settings: Object,
  },
  data: () => {
    return {
      image: {
        show: false,
        message: {},
        file: {
          src: "",
          name: "",
        },
        images: {},
      },
      users: {},
      emojiIndex: emojiIndex,
      baseUrl: "https://" + location.host,

      download: {
        loading: false,
        time: "",
      },
      reaction: {
        message: "",
        show: false,
      },
    };
  },
  computed: {
    emojiDataAll() {
      return EmojiAllData;
    },
    emojiGroups() {
      return EmojiGroups;
    },
    lastMessage() {
      return Object.keys(this.messages)[Object.keys(this.messages).length - 1];
    },
  },
  updated() {
    const messages = this.messages;
    const users = {};
    let i = 0;
    for (var messageId in messages) {
      const message = messages[messageId];
      get(child(ref(db), `users/${message.sender}`)).then((snapshot) => {
        var data = snapshot.val();
        users[message.sender] = data;
        if (Object.keys(messages).length - 1 == i) {
          this.users = users;
        }
        i++;
      });
    }
    this.$nextTick(function () {
      // If the user scrolled up, you don't want to scroll down
      if (this.limit != 25 && !this.enableScroll) {
        document
          .querySelectorAll(".msg")
          [
            document.querySelectorAll(".msg").length - (this.limit - 24)
          ]?.scrollIntoView(true);
        return;
      }
      var el = document.getElementById("msgs");
      el.scrollTop = el.scrollHeight;
    });
  },
  methods: {
    log(e) {
      console.log(e);
    },
    checkIfUserHasTag(userId) {
      if (
        this.chat?.assignedTags &&
        this.chat?.assignedTags[userId] &&
        this.chat?.tags[this.chat.assignedTags[userId]]?.name
      ) {
        return this.chat?.tags[this.chat.assignedTags[userId]]?.name;
      } else {
        return false;
      }
    },
    getMessagePreview(message) {
      if (message.type == "file") {
        return `(File) ${message.file.name}`;
      } else if (message.type == "likeShort") {
        return `Liked your Short`;
      } else if (message.type == "image") {
        return `(Image) ${message.file.name}`;
      } else if (message.type == "audio") {
        return `(Audio) ${message.duration}`;
      }
      return `${message.text}`;
    },
    openImage(message) {
      const file = message.file;
      this.image.show = true;
      this.image.file = file;
      this.image.message = message;
      onValue(
        query(
          ref(db, `chatImages/${this.chat.id}`),
          orderByKey(),
          startAfter(file.time.toString()),
          limitToLast(15)
        ),
        (snapshot) => {
          const nextImages = snapshot.val();
          onValue(
            query(
              ref(db, `chatImages/${this.chat.id}`),
              orderByKey(),
              endBefore(file.time.toString()),
              limitToLast(15)
            ),
            (snapshot) => {
              const prevImages = snapshot.val();
              const allImages = {
                ...prevImages,
                ...{ [message.time]: JSON.parse(JSON.stringify(message)) },
                ...nextImages,
              };
              this.image.images = allImages;
              off(
                query(
                  ref(db, `chatImages/${this.chat.id}`),
                  orderByKey(),
                  endBefore(file.time.toString()),
                  limitToLast(15)
                )
              );
              off(
                query(
                  ref(db, `chatImages/${this.chat.id}`),
                  orderByKey(),
                  startAfter(file.time.toString()),
                  limitToLast(15)
                )
              );
            }
          );
        }
      );
    },
    getFormattedTime(time) {
      return `${this.formatToDay(time)}, ${this.formatTimeToAMPM(time)}`;
    },
    async downloadFile(file) {
      this.download.loading = true;
      this.download.time = file.time;
      console.log(file);
      getBlob(storageRef(storage, file.path))
        .then((blob) => {
          // `url` is the download URL for 'images/stars.jpg'
          let downloadLink = document.getElementById("downloadLink");
          downloadLink.download = file.name;
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.click();
          this.download.time = "";
          this.download.loading = false;
        })
        .catch((error) => {
          // Handle any errors
        });
    },
    findLink(text) {
      if (!text) return false;
      return find(text)[0]?.href || false;
    },
    convertMessageToHTML(text) {
      if (!text) return;
      return twemoji.parse(
        linkifyHtml(text, { defaultProtocol: "https", target: "_blank" }),
        {
          className: "emojiImg",
        }
      );
    },
    reactionClicked(messageId, emoji) {
      get(
        child(
          ref(db),
          `messages/${this.chat.id}/${messageId}/reactions/${emoji}/${this.user.id}`
        )
      ).then((snapshot) => {
        var data = snapshot.val();
        if (data) {
          remove(
            child(
              ref(db),
              `messages/${this.chat.id}/${messageId}/reactions/${emoji}/${this.user.id}`
            )
          );
        } else {
          set(
            child(
              ref(db),
              `messages/${this.chat.id}/${messageId}/reactions/${emoji}/${this.user.id}`
            ),
            { user: this.user.id }
          );
        }
      });
    },
    addReaction(emoji) {
      console.log(emoji);
      const messageId = this.reaction.message;
      // At times the reaction dialog just closes weirdly, therefore this will reopen it
      if (!(typeof emoji == "object")) {
        return;
      }
      get(
        child(
          ref(db),
          `messages/${this.chat.id}/${messageId}/reactions/${emoji.id}/${this.user.id}`
        )
      ).then((snapshot) => {
        var data = snapshot.val();
        if (data) {
          remove(
            child(
              ref(db),
              `messages/${this.chat.id}/${messageId}/reactions/${emoji.id}/${this.user.id}`
            )
          );
        }
      });
      set(
        child(
          ref(db),
          `messages/${this.chat.id}/${messageId}/reactions/${emoji.id}/${this.user.id}`
        ),
        { user: this.user.id }
      );
      this.reaction.show = false;
    },
    twemojiConvert(text) {
      return twemoji.parse(text, { className: "emojiImg" });
    },
    checkOnlyOneEmoji(text) {
      text = text.replace(/<\/?[^>]+(>|$)/g, "").trim();
      return (
        /\p{Emoji}/u.test(text) &&
        text.replace(
          /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
          ""
        ).length == 0
      );
    },
    checkIfUserReacted(user) {
      if (user[this.user.id]) {
        return "user-reacted";
      }
    },
    getUser(message) {
      const users = JSON.parse(JSON.stringify(this.users));
      return users[message.sender] ? users[message.sender].username : "";
    },
    convertToEmoji(text) {
      return emojiConvertor.replace_colons(text);
    },
    checkMsgFromSameUser(message, i) {
      const messages = this.messages;
      const msgIndex = Object.keys(messages).indexOf(i);
      if (
        message.sender == this.getByIndex(messages, msgIndex - 1)?.sender &&
        this.getByIndex(messages, msgIndex - 1)?.type != "info"
      ) {
        return true;
      } else {
        return false;
      }
    },
    checkLastMsgFromSameUser(message, i) {
      const messages = this.messages;
      const msgIndex = Object.keys(messages).indexOf(i);
      if (message.sender != this.getByIndex(messages, msgIndex + 1)?.sender) {
        return true;
      } else {
        return false;
      }
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
    checkDayDifference(message, i) {
      const messages = this.messages;
      const msgIndex = Object.keys(messages).indexOf(i);
      const d1 = new Date(message?.time);
      const d2 = new Date(this.getByIndex(this.messages, msgIndex - 1)?.time);
      return !(
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
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
    checkTimeDifference(message, i) {
      const messages = this.messages;
      const msgIndex = Object.keys(this.messages).indexOf(i);
      return !(
        new Date(
          this.getByIndex(this.messages, msgIndex - 1)?.time
        ).getMinutes() == new Date(message?.time).getMinutes()
      );
    },
    checkLastTimeForSameUser(message, i) {
      const messages = this.messages;
      const msgIndex = Object.keys(this.messages).indexOf(i);
      return !(
        new Date(
          this.getByIndex(this.messages, msgIndex + 1)?.time
        ).getMinutes() == new Date(message?.time).getMinutes()
      );
    },
    getNumberOfReactions(json) {
      return Object.keys(json).length;
    },
    getTime(time) {
      return new Date(time).toLocaleString();
    },
    getByIndex: function (json, index) {
      return json[Object.keys(json)[index]];
    },
  },
};
</script>
<style lang="stylus">
@import './styles.styl';
</style>
