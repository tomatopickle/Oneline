<template>
  <div class="chatWindowSimple">
    <transition-group name="messageAnimation" tag="div">
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
          <div>
            <div
              class="time"
              v-if="checkTimeDifference(message, i)"
              v-html="getTime(message.time)"
            ></div>
            <Popper
              style="width: 100%"
              :offsetSkid="message.sender == user.id ? '500%' : '-225%'"
              :interactive="false"
            >
              <b-btn ghost icon class="messageActionBtn">
                <b-icon name="mdi mdi-chevron-down"></b-icon>
              </b-btn>
              <template #content>
                <b-card class="messageActions p-0 m-0" glass>
                  <b-list-item
                    clickable
                    v-on:click="
                      reaction.message = i;
                      reaction.show = true;
                    "
                  >
                    <b-flex>
                      <b-icon style="height: 30px">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          xmlns:xlink="http://www.w3.org/1999/xlink"
                          aria-hidden="true"
                          role="img"
                          width="1em"
                          height="1em"
                          preserveAspectRatio="xMidYMid meet"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M24 4c0 .55-.45 1-1 1h-1v1c0 .55-.45 1-1 1s-1-.45-1-1V5h-1c-.55 0-1-.45-1-1s.45-1 1-1h1V2c0-.55.45-1 1-1s1 .45 1 1v1h1c.55 0 1 .45 1 1zm-2.48 4.95c.31.96.48 1.99.48 3.05c0 5.52-4.48 10-10 10S2 17.52 2 12S6.48 2 12 2c1.5 0 2.92.34 4.2.94c-.12.33-.2.68-.2 1.06c0 1.35.9 2.5 2.13 2.87A3.003 3.003 0 0 0 21 9c.18 0 .35-.02.52-.05zM7 9.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5S9.33 8 8.5 8S7 8.67 7 9.5zm9.31 4.5H7.69c-.38 0-.63.42-.44.75c.95 1.64 2.72 2.75 4.75 2.75s3.8-1.11 4.75-2.75a.503.503 0 0 0-.44-.75zM17 9.5c0-.83-.67-1.5-1.5-1.5S14 8.67 14 9.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5z"
                            fill="currentColor"
                          />
                        </svg>
                      </b-icon>
                      <span>React</span>
                    </b-flex>
                  </b-list-item>
                  <b-list-item clickable v-on:click="$emit('reply', message)">
                    <b-flex>
                      <b-icon size="18px" name="mdi mdi-reply"> </b-icon>
                      <span>Reply</span>
                    </b-flex>
                  </b-list-item>
                  <b-list-item clickable>
                    <b-flex>
                      <b-icon size="18px" name="mdi mdi-content-copy"> </b-icon>
                      <span>Copy</span>
                    </b-flex>
                  </b-list-item>
                </b-card>
              </template>
            </Popper>
            <small
              class="username"
              v-if="
                message.sender != user.id &&
                (checkTimeDifference(message, i) ||
                  !(
                    checkMsgFromSameUser(message, i) &&
                    !checkTimeDifference(message, i)
                  ))
              "
              >{{ users[message.sender]?.username }}</small
            >
            <b-flex>
              <b-spacer v-if="message.sender == user.id"></b-spacer>
              <div class="senderAvatar">
                <b-avatar
                  v-if="
                    message.sender != user.id &&
                    (checkTimeDifference(message, i) ||
                      !(
                        checkMsgFromSameUser(message, i) &&
                        !checkTimeDifference(message, i)
                      ))
                  "
                  :size="30"
                  :username="
                    users[message.sender] ? users[message.sender].username : ''
                  "
                >
                </b-avatar>
              </div>
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
                  <b-btn icon glass color="primary">
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
              <div v-else-if="message.type == 'reply'" class="msg-reply-parent">
                <div class="flex">
                  <b-spacer v-if="message.sender == user.id"></b-spacer>
                  <div :class="`msg-reply`">
                    <b-avatar
                      :size="20"
                      :username="
                        users[message.sender]
                          ? users[message.sender].username
                          : ''
                      "
                    ></b-avatar>
                    <div
                      v-html="
                        message.replyingTo.text
                          ? convertMessageToHTML(message.replyingTo.text)
                          : ''
                      "
                    ></div>
                  </div>
                </div>
                <div
                  :class="{
                    'msg-text': true,
                    oneEmoji: checkOnlyOneEmoji(message.text),
                  }"
                  v-html="
                    message?.text ? convertMessageToHTML(message?.text) : ''
                  "
                ></div>
              </div>
              <div v-else>
                <div
                  :class="{
                    'msg-text': true,
                    oneEmoji: checkOnlyOneEmoji(message.text),
                  }"
                  v-html="
                    message?.text ? convertMessageToHTML(message?.text) : ''
                  "
                ></div>
              </div>
            </b-flex>
            <b-flex bare>
              <b-spacer v-if="message.sender == user.id"></b-spacer>
              <link-preview
                v-if="findLink(message?.text) != false"
                :url="findLink(message?.text)"
              >
              </link-preview>
            </b-flex>
          </div>
          <div class="reactions">
            <span
              v-for="(users, key) in message.reactions"
              :key="key"
              class="reaction"
              v-on:click="reactionClicked(i, key)"
            >
              <b-flex style="padding: 0" v-if="key != 'undefined'">
                <emoji :size="15" :data="emojiIndex" :emoji="key"></emoji>
                <span :class="'reactionNumber ' + checkIfUserReacted(users)">{{
                  getNumberOfReactions(users)
                }}</span>
              </b-flex>
            </span>
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
      </template>
    </transition-group>
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
</template>

<script>
/* eslint-disable */
import db from "../../../fire.js";
import { storage } from "../../../fire.js";
import linkifyHtml from "linkify-html";
import {
  ref,
  set,
  get,
  child,
  onValue,
  update,
  remove,
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
export default {
  name: "ChatWindow",
  components: { Picker, Emoji, LinkPreview },
  emits: ["playAudio", "reply"],
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
      users: {},
      emojiIndex: emojiIndex,
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
