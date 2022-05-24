<template>
  <div class="chatWindowSimple">
    <context-menu ref="menu" @closed="selectedMessage = ''">
      <sl-menu>
        <sl-menu-item
          value="react"
          v-on:click="
            reaction.message = selectedMessage;
            reaction.show = true;
          "
        >
          <sl-icon slot="prefix" library="oneline" name="addReaction"></sl-icon>
          React
        </sl-menu-item>
        <sl-menu-item
          value="reply"
          v-on:click="$emit('reply', messages[selectedMessage])"
        >
          <sl-icon slot="prefix" name="reply-fill"></sl-icon>
          Reply
        </sl-menu-item>
        <sl-menu-item value="copy">
          <sl-icon slot="prefix" name="clipboard-fill"></sl-icon>
          Copy
        </sl-menu-item>
      </sl-menu>
    </context-menu>
    <transition-group name="messageAnimation" tag="div">
      <template v-for="(message, i) in messages" :key="message.time">
        <div v-if="!settings.data.showExactTime">
          <div
            class="sameDay"
            v-if="checkDayDifference(message, i)"
            v-html="formatToDay(message.time)"
          ></div>
        </div>
        <div
          @click.right.prevent="
            selectedMessage = i;
            $refs.menu.open($event);
          "
          :class="{
            msg: true,
            reply: message.type == 'reply',
            sub:
              checkMsgFromSameUser(message, i) &&
              !checkTimeDifference(message, i),
            last:
              checkLastMsgFromSameUser(message, i) ||
              checkLastTimeForSameUser(message, i),
            reacted: !!message.reactions,
            selected: i == selectedMessage,
          }"
          v-if="message.type != 'info'"
          v-on:dblclick="
            reaction.message = i;
            addReaction(settings.data.likeEmoji);
          "
          tabindex="0"
          @focus="selectedMessage = i"
        >
          <div
            class="time"
            v-if="checkTimeDifference(message, i)"
            v-html="
              settings.data.showExactTime
                ? getTime(message.time)
                : formatTimeToAMPM(message.time)
            "
          ></div>
          <div
            :class="{
              me: message.replyingTo.sender == user.id,
              relative: true,
              replyingToMessage: true,
            }"
            v-if="message.type == 'reply'"
          >
            <small
              class="username flex"
              v-if="
                message.type != 'reply' &&
                (checkTimeDifference(message, i) ||
                  !(
                    checkMsgFromSameUser(message, i) &&
                    !checkTimeDifference(message, i)
                  ))
              "
            >
              <span>{{ users[message.replyingTo.sender]?.username }}</span>
              <sl-tag
                v-if="checkIfUserHasTag(message.replyingTo.sender)"
                class="tag my-1"
                size="small"
                :style="{
                  '--color':
                    this.chat.tags[checkIfUserHasTag(message.replyingTo.sender)]
                      ?.color,
                  '--backgroundColor':
                    this.chat.tags[checkIfUserHasTag(message.replyingTo.sender)]
                      ?.backgroundColor,
                }"
                pill
              >
                {{ checkIfUserHasTag(message.replyingTo.sender) }}</sl-tag
              >
            </small>
            <b-flex bare>
              <sl-dropdown hoist placement="right">
                <b-avatar
                  slot="trigger"
                  tabindex="0"
                  :size="30"
                  class="senderAvatarEl"
                  :username="
                    users[message.replyingTo.sender] ? users[message.replyingTo.sender].username : ''
                  "
                  :src="users[message.replyingTo.sender]?.avatar"
                >
                </b-avatar>
                <sl-card class="userInfo">
                  <b-flex>
                    <div>
                      <b-avatar
                        :size="45"
                        :username="
                          users[message.replyingTo.sender]
                            ? users[message.replyingTo.sender].username
                            : ''
                        "
                        :src="users[message.replyingTo.sender]?.avatar"
                      ></b-avatar>
                    </div>
                    <div>
                      <h3 class="my-0 pl-1">
                        {{ users[message.replyingTo.sender]?.username }}
                      </h3>
                      <p>
                        {{ users[message.replyingTo.sender]?.description }}
                      </p>
                    </div>
                  </b-flex>
                  <b-flex slot="footer">
                    <b-spacer></b-spacer>
                    <sl-button
                      size="medium"
                      v-if="message.replyingTo.sender != user.id"
                      variant="primary"
                      v-on:click="
                        $emit('startMeetingWithUser', users[message.replyingTo.sender])
                      "
                    >
                      <sl-icon slot="prefix" name="camera-video-fill"></sl-icon>
                      Meet
                    </sl-button>
                    <router-link :to="`/user/${message.replyingTo.sender}`">
                      <sl-button size="medium">
                        <sl-icon slot="prefix" name="person-fill"></sl-icon>
                        View Profile
                      </sl-button>
                    </router-link>
                  </b-flex>
                </sl-card>
              </sl-dropdown>
              <div
                :class="{
                  'msg-text': true,
                  oneEmoji: checkOnlyOneEmoji(message.replyingTo.text),
                }"
                v-html="
                  message.replyingTo?.text
                    ? convertMessageToHTML(message.replyingTo?.text)
                    : ''
                "
              ></div>
            </b-flex>
            <small
              v-if="
                users &&
                users[message.sender]?.username &&
                users[message.replyingTo.sender]?.username
              "
            >
              <b>{{ users[message.sender]?.username }}</b> replying to
              <b> {{ users[message.replyingTo.sender]?.username }}</b>
            </small>
          </div>
          <div
            :class="{
              relative: true,
              me: message.sender == user.id,
            }"
          >
            <small
              class="username flex"
              v-if="
                message.type != 'reply' &&
                (checkTimeDifference(message, i) ||
                  !(
                    checkMsgFromSameUser(message, i) &&
                    !checkTimeDifference(message, i)
                  ))
              "
            >
              <span>{{ users[message.sender]?.username }}</span>
              <sl-tag
                v-if="checkIfUserHasTag(message.sender)"
                class="tag my-1"
                size="small"
                :style="{
                  '--color':
                    this.chat.tags[checkIfUserHasTag(message.sender)]?.color,
                  '--backgroundColor':
                    this.chat.tags[checkIfUserHasTag(message.sender)]
                      ?.backgroundColor,
                }"
                pill
              >
                {{ checkIfUserHasTag(message.sender) }}</sl-tag
              >
            </small>
            <b-flex>
              <sl-dropdown hoist placement="right">
                <b-avatar
                  slot="trigger"
                  tabindex="0"
                  :size="30"
                  class="senderAvatarEl"
                  v-if="
                    message.type == 'reply' ||
                    checkTimeDifference(message, i) ||
                    !(
                      checkMsgFromSameUser(message, i) &&
                      !checkTimeDifference(message, i)
                    )
                  "
                  :username="
                    users[message.sender] ? users[message.sender].username : ''
                  "
                  :src="users[message.sender]?.avatar"
                >
                </b-avatar>
                <sl-card class="userInfo">
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
                      <h3 class="my-0 pl-1">
                        {{ users[message.sender]?.username }}
                      </h3>
                      <p>
                        {{ users[message.sender]?.description }}
                      </p>
                    </div>
                  </b-flex>
                  <b-flex slot="footer">
                    <b-spacer></b-spacer>
                    <sl-button
                      size="medium"
                      v-if="message.sender != user.id"
                      variant="primary"
                      v-on:click="
                        $emit('startMeetingWithUser', users[message.sender])
                      "
                    >
                      <sl-icon slot="prefix" name="camera-video-fill"></sl-icon>
                      Meet
                    </sl-button>
                    <router-link :to="`/user/${message.sender}`">
                      <sl-button size="medium">
                        <sl-icon slot="prefix" name="person-fill"></sl-icon>
                        View Profile
                      </sl-button>
                    </router-link>
                  </b-flex>
                </sl-card>
              </sl-dropdown>
              <div class="msg-content">
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
                      <sl-icon-button
                        name="download"
                        v-if="
                          !(
                            download.loading &&
                            message.file.time == download.time
                          )
                        "
                        v-on:click="downloadFile(message.file)"
                      >
                      </sl-icon-button>
                      <sl-spinner v-else style="font-size: 33px"></sl-spinner>
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
                <div
                  v-else-if="message.type == 'likeShort'"
                  class="msg-short-like"
                >
                  <b-flex bare>
                    <div>
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
                  </b-flex>
                  <b-flex bare>
                    <span class="msg-text">{{
                      (message.username || "ERROR") + " liked your Short"
                    }}</span>
                  </b-flex>
                </div>
                <div
                  v-else-if="message.type == 'commentShort'"
                  class="msg-short-comment"
                >
                  <b-flex bare>
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
                  </b-flex>
                  <b-flex bare>
                    <span class="msg-text">{{ message.text }}</span>
                  </b-flex>
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
              </div>
              <b-flex bare class="messageActions">
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
                  name="clipboard-fill"
                  label="Copy Message"
                >
                </sl-icon-button>
              </b-flex>
            </b-flex>
            <transition name="fadeUp">
              <div class="reactions" v-if="!!message.reactions">
                <span
                  v-for="(users, key) in message.reactions"
                  :key="key"
                  class="reaction"
                  v-on:click="reactionClicked(i, key)"
                >
                  <b-flex style="padding: 0" v-if="key != 'undefined'">
                    <emoji :size="15" :data="emojiIndex" :emoji="key"></emoji>
                    <span
                      :class="'reactionNumber ' + checkIfUserReacted(users)"
                      >{{ getNumberOfReactions(users) }}</span
                    >
                  </b-flex>
                </span>
              </div>
            </transition>
            <b-flex bare>
              <link-preview
                v-if="findLink(message?.text) != false"
                :url="findLink(message?.text)"
              >
              </link-preview>
            </b-flex>
          </div>
          <b-flex v-if="!!message.seen && i == lastMessage" class="seenUsers">
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
          </b-flex>
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
  onChildAdded,
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
import ContextMenu from "@/components/ContextMenu/ContextMenu.vue";

export default {
  name: "ChatWindowSimple",
  components: {
    Picker,
    Emoji,
    LinkPreview,
    ShortPreview,
    VueHorizontal,
    ZoomImage,
    ContextMenu,
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
      contextMenu: false,
      selectedMessage: "",
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
        this.chat?.tags &&
        this.chat?.assignedTags[userId] &&
        this.chat?.tags[this.chat.assignedTags[userId]] &&
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
