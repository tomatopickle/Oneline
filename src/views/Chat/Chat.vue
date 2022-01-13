<template>
  <b-app :loading="loading">
    <template v-slot:prepend>
      <b-sidebar id="contacts" width="250px">
        <template v-slot:header>
          <b-flex class="m-0" style="margin-left: -15px">
            <img height="30" src="../../assets/logos/logo.png" alt="Logo" />
            <div class="font-normal">Oneline</div>
            <b-spacer></b-spacer>
            <b-btn icon ghost @click="settings.modal = true"
              ><b-icon name="mdi mdi-cog"></b-icon
            ></b-btn>
          </b-flex>
        </template>
        <div>
          <br />
          <b-list
            class="border-0 p-0 m-0"
            style="margin: -19px; background: transparent"
          >
            <template v-slot:header>
              <b-flex class="pl-4 pr-1">
                <h4 class="m-0">Chats</h4>
                <b-spacer></b-spacer>
                <Popper
                  arrow
                  :interactive="false"
                  offsetDistance="15px"
                  offsetSkid="-35px"
                >
                  <b-btn icon color="primary" ghost>
                    <b-icon name="mdi mdi-plus"></b-icon
                  ></b-btn>
                  <template #content>
                    <b-card class="contextMenu p-0 m-0">
                      <b-list-item
                        clickable
                        @click="
                          newChat.tabIndex = 0;
                          newChat.modal = true;
                        "
                      >
                        <b-flex>
                          <span>New Chat</span>
                        </b-flex>
                      </b-list-item>
                      <b-list-item
                        clickable
                        @click="
                          newChat.modal = true;
                          newChat.tabIndex = 1;
                        "
                      >
                        <b-flex>
                          <span>Join Group</span>
                        </b-flex>
                      </b-list-item>
                      <b-list-item
                        clickable
                        @click="
                          newChat.tabIndex = 2;
                          newChat.modal = true;
                        "
                      >
                        <b-flex>
                          <span>New Group</span>
                        </b-flex>
                      </b-list-item>
                    </b-card>
                  </template>
                </Popper>
              </b-flex>
            </template>
            <b-input ghost placeholder="Search" class="w-11/12 center">
              <template v-slot:inner-prepend>
                <b-icon name="mdi mdi-magnify"></b-icon>
              </template>
            </b-input>
            <template v-if="Object.keys(chats).length == 0">
              <br />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:svgjs="http://svgjs.com/svgjs"
                width="100"
                height="100"
                x="0"
                y="0"
                viewBox="0 0 512 512"
                style="enable-background: new 0 0 512 512"
                xml:space="preserve"
                class="center"
              >
                <g>
                  <g xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="m134.19 197.83c-8.46 17.63-13.19 37.36-13.19 58.17 0 37.48 15.42 72.44 42.77 97.97l-27.77 37.03h120c20.81 0 40.54-4.73 58.17-13.19z"
                      fill="#5e5e5e"
                      data-original="#000000"
                      class=""
                    ></path>
                    <path
                      d="m256 121c-20.81 0-40.54 4.73-58.17 13.19l179.98 179.98c8.46-17.63 13.19-37.36 13.19-58.17 0-74.44-60.56-135-135-135z"
                      fill="#5e5e5e"
                      data-original="#000000"
                      class=""
                    ></path>
                    <path
                      d="m256 0c-141.486 0-256 114.497-256 256 0 141.568 114.389 256 256 256 141.486 0 256-114.497 256-256 0-141.568-114.389-256-256-256zm-226 256c0-57.051 21.095-109.126 55.909-148.878l318.969 318.969c-39.748 34.813-91.821 55.909-148.878 55.909-124.996 0-226-100.969-226-226zm396.091 148.878-318.969-318.969c39.748-34.813 91.821-55.909 148.878-55.909 124.996 0 226 100.969 226 226 0 57.051-21.095 109.126-55.909 148.878z"
                      fill="#5e5e5e"
                      data-original="#000000"
                      class=""
                    ></path>
                  </g>
                </g>
              </svg>
              <br />
              <p class="text-center">You don't have any chats</p>
              <b-btn
                color="primary"
                outline
                class="center"
                size="small"
                @click="newChat.modal = true"
              >
                New Chat</b-btn
              >
            </template>
            <transition-group name="flip-list" tag="div">
              <template v-for="(chat, i) in chats" :key="i">
                <b-list-item
                  clickable
                  v-on:click="openChat(chat)"
                  class="contact"
                >
                  <b-flex>
                    <b-avatar
                      :size="35"
                      :class="chat.status ? 'status-' + chat.status : ''"
                      :username="chat.name"
                      :src="chat?.src"
                    ></b-avatar>
                    <span class="flex-grow">
                      <span class="chatName">
                        {{ chat.name }}
                      </span>
                      <br />
                      <small class="chatMessagePreview">{{
                        getMessagePreview(chat)
                      }}</small>
                    </span>
                  </b-flex>
                </b-list-item>
              </template>
            </transition-group>
          </b-list>
        </div>
        <template v-slot:footer>
          <b-divider class="mt-0 mb-0" style="height: 15px"></b-divider>
          <b-list-item class="m-0 p-0">
            <b-flex class="m-0 p-0">
              <b-avatar
                :username="user.username ? user?.username : 'loading'"
                :size="35"
              ></b-avatar>
              <b-list-item style="padding: 0">
                <template v-slot:heading>
                  <h4>{{ user?.username }}</h4>
                </template>
                <small>{{ user?.email }}</small>
              </b-list-item>
            </b-flex>
          </b-list-item>
        </template>
      </b-sidebar>
    </template>
    <div class="flex flex-col h-full" style="position: relative">
      <div
        v-on:scroll="checkIfScrolledToTop($event)"
        class="flex-grow overflow-y-scroll overflow-x-hidden"
        id="msgs"
      >
        <b-nav sticky v-if="chat.id"
          ><template v-slot:branding>
            <b-flex class="m-0 p-0 w-full">
              <b-avatar :username="chat?.name || ''" :size="35"></b-avatar>
              <h3 class="mt-0 mb-0">{{ chat?.name }}</h3>
            </b-flex>
          </template>
          <template v-slot:actions>
            <b-btn ghost color="primary" icon @click="chatInfo = !chatInfo"
              ><b-icon name="mdi mdi-information-outline"></b-icon
            ></b-btn>
          </template>
        </b-nav>
        <br /><br /><br /><br />
        <div class="w-max center" v-if="Object.keys(chats).length == 0">
          <br /><br /><br />
          <img
            class="center block"
            height="150"
            src="../../assets/logos/logo.png"
            alt="Oneline Logo"
          />
          <br />
          <h1 class="mt-0">Hmm... You don't have any chats</h1>
          <br />
          <b-btn @click="newChat.modal = true" color="primary" class="center">
            <b-icon name="mdi mdi-plus" left></b-icon>
            Create New Chat
          </b-btn>
        </div>
        <div v-if="chat.id">
          <b-avatar
            class="center"
            :username="chat.name || ''"
            size="65"
          ></b-avatar>
          <h2 class="text-center">{{ chat.name }}</h2>
          <small class="block text-center text-opacity-5">{{
            "Created Chat on " + getTime(chat.addedTime)
          }}</small>
        </div>
        <div v-if="chat.id && Object.keys(messages).length == 0">
          <br />
          <b-btn @click="sendHi()" color="primary" class="center"
            >Say Hi 👋</b-btn
          >
        </div>
        <br />
        <chat-window-simple
          @reply="
            reply.show = true;
            reply.message = $event;
          "
          @playAudio="
            audio.show = true;
            audio.src = $event.src;
          "
          v-if="settings.data.messagesSimpleMode"
          :limit="limit"
          :messages="messages"
          :settings="settings"
          :user="user"
          :chat="chat"
          :enableScroll="enableScroll"
        ></chat-window-simple>
        <chat-window
          @reply="
            reply.show = true;
            reply.message = $event;
          "
          @playAudio="
            audio.show = true;
            audio.src = $event.src;
          "
          v-else
          :limit="limit"
          :messages="messages"
          :settings="settings"
          :user="user"
          :chat="chat"
          :enableScroll="enableScroll"
        ></chat-window>
        <transition name="fadeUp">
          <b-btn
            v-if="scrollDownBtn"
            icon
            @click="scrollDown()"
            color="secondary"
            id="scrollDownButton"
          >
            <b-icon name="mdi mdi-chevron-down"></b-icon>
          </b-btn>
        </transition>
      </div>
      <br /><br /><br />
      <template v-if="audio.show || reply.show"><br /><br /></template>
      <div id="messageInp" v-if="chat?.id">
        <div v-show="reply.show">
          <div id="replyMessage">
            <span class="text-blue-600">{{
              members[reply.message.sender]?.username
            }}</span
            >:&nbsp;<span>{{ getReplyPreview(reply.message) }}</span>
            <b-spacer></b-spacer>
            <b-btn
              icon
              ghost
              style="padding: 0"
              @click="reply = { show: false, message: {} }"
            >
              <b-icon name="mdi mdi-close"></b-icon>
            </b-btn>
          </div>
        </div>
        <div id="emojiComplete">
          <div
            v-for="(emoji, i) in emojiComplete.emojis"
            :key="i"
            :class="i == emojiComplete.selectedIndex ? 'selected' : ''"
          >
            <b-flex>
              <emoji :size="32" :data="emojiIndex" :emoji="emoji.colons" />
              <span>{{ emoji.colons }}</span>
            </b-flex>
          </div>
        </div>
        <div id="audioPlyr" v-if="audio.show">
          <player :src="audio.src"></player>
          <b-btn
            icon
            ghost
            @click="
              audio.show = false;
              audio.src = ``;
            "
            ><b-icon name="mdi mdi-close"></b-icon
          ></b-btn>
        </div>
        <transition name="fade" :duration="{ leave: 300 }">
          <div id="typingBar" v-if="checkIfUsersAreTyping">
            <span v-for="username in typing" :key="username">{{
              (username == this.user.username ? "You" : username) + " "
            }}</span>
            typing...
          </div>
        </transition>
        <transition name="fade" :duration="{ enter: 200, leave: 300 }">
          <small
            id="seenIndicator"
            v-if="seen && Object.keys(seen).length != 0"
          >
            <span> Seen by </span>
            <span v-for="(i, usr) in seen" :key="usr">
              {{ usr }}
            </span>
          </small>
        </transition>
        <div v-if="recording.show" class="w-full">
          <b-flex v-if="!recording.uploading">
            <div id="recordingLight"></div>
            <span>{{
              `${recording.time.minutes}:${recording.time.seconds}`
            }}</span>
            <b-spacer></b-spacer>
            <b-btn icon color="danger" @click="stopRecording()">
              <b-icon name="mdi mdi-close"></b-icon>
            </b-btn>
            <b-btn icon color="success" @click="sendRecording()">
              <b-icon name="mdi mdi-check"></b-icon
            ></b-btn>
          </b-flex>
          <b-flex v-else>
            <b-spinner style="transform: scale(0.5)"></b-spinner>
            <span>Uploading...</span>
          </b-flex>
        </div>
        <template v-if="!recording.show">
          <b-icon
            name="mdi mdi-plus messageBtn"
            @click="fileUpload.show = true"
          ></b-icon>
          <content-editable-div
            @keypress="checkIfUserTyping($event)"
            @keydown="checkEnterKey($event)"
            @blur="userLeftMessageBox()"
            v-model="message.text"
            data-placeholder="Message"
            class="editable"
          ></content-editable-div>
          <b-icon
            @click="startRecording()"
            name="mdi mdi-microphone messageBtn"
            size="23px"
            class="mt-0.5"
          ></b-icon>
          <Popper
            style="border: none !important"
            position="top"
            offsetSkid="25px"
          >
            <b-icon
              name="mdi mdi-emoticon popperBtn messageBtn"
              style="margin-right: 50px"
            ></b-icon>
            <template #content>
              <div>
                <Picker
                  color="#286ef1"
                  :autoFocus="true"
                  title="Pick your emoji…"
                  emoji="point_up"
                  :data="emojiIndex"
                  set="apple"
                  @select="addedEmoji"
                /></div
            ></template>
          </Popper>
          <Popper
            style="border: none !important"
            position="top"
            offsetSkid="25px"
          >
            <b-icon @click="getGifs()">
              <svg
                width="100%"
                class="messageBtn"
                style="
                  height: 29px;
                  display: block;
                  margin-right: 15px;
                  margin-left: 10px;
                  width: 40px;
                "
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 30 30"
              >
                <path
                  fill="currentColor"
                  d="M 6 5 C 3.8034768 5 2 6.8034768 2 9 L 2 21 C 2 23.196523 3.8034768 25 6 25 L 24 25 C 26.196523 25 28 23.196523 28 21 L 28 9 C 28 6.8034768 26.196523 5 24 5 L 6 5 z M 9.8867188 11.046875 C 11.666719 11.046875 12.975312 12.075625 13.195312 13.640625 L 11.628906 13.640625 C 11.394906 12.878625 10.762719 12.435547 9.8867188 12.435547 C 8.6707187 12.435547 7.9238281 13.401422 7.9238281 14.982422 C 7.9238281 16.595422 8.7072188 17.576172 9.9492188 17.576172 C 10.982219 17.576172 11.697516 16.964641 11.728516 16.056641 L 11.732422 15.921875 L 10.099609 15.921875 L 10.099609 14.736328 L 13.261719 14.736328 L 13.261719 15.697266 C 13.261719 17.711266 11.977875 18.964844 9.921875 18.964844 C 7.683875 18.964844 6.3105469 17.461047 6.3105469 14.998047 C 6.3105469 12.571047 7.6947187 11.046875 9.8867188 11.046875 z M 14.779297 11.240234 L 16.355469 11.240234 L 16.355469 18.771484 L 14.779297 18.771484 L 14.779297 11.240234 z M 18.185547 11.240234 L 23 11.240234 L 23 12.587891 L 19.761719 12.587891 L 19.761719 14.548828 L 22.824219 14.548828 L 22.824219 15.837891 L 19.761719 15.837891 L 19.761719 18.771484 L 18.185547 18.771484 L 18.185547 11.240234 z"
                ></path>
              </svg>
            </b-icon>
            <template #content="{ close }">
              <div>
                <b-card
                  height="75vh"
                  width="460px"
                  style="overflow-y: auto"
                  :loading="gif.loading"
                  id="gifsPanel"
                >
                  <template #header>
                    <b-input
                      @keyup="searchGifs($event)"
                      placeholder="Search"
                      v-model="gif.search"
                    ></b-input>
                  </template>
                  <div class="grid-3">
                    <template v-if="!gif.searched && !gif.recent.notAvailable">
                      <b-flex bare>
                        <transition name="zoom">
                          <b-btn
                            v-if="gif.viewingRecent"
                            ghost
                            size="small"
                            icon
                            @click="getGifs()"
                            ><b-icon name="mdi mdi-arrow-left"></b-icon
                          ></b-btn>
                        </transition>
                        <h3 class="ml-1">Recent</h3>
                        <b-spacer></b-spacer>
                        <b-btn
                          v-if="!gif.viewingRecent"
                          @click="getAllRecentGifs()"
                          ghost
                          size="small"
                          color="primary"
                          >View All<b-icon
                            right
                            name="mdi mdi-chevron-right"
                          ></b-icon
                        ></b-btn>
                      </b-flex>
                      <transition-group name="fadeUp" tag="div">
                        <div
                          v-for="(gif, i) in gif.recent"
                          :key="i"
                          class="gif col"
                          v-on:click="
                            sendGif(gif);
                            close();
                          "
                        >
                          <v-lazy-image
                            width="100px"
                            src-placeholder="https://res.cloudinary.com/abaan/image/upload/v1640548169/dark-loading-gif.gif"
                            :src="gif.images?.original.webp"
                          />
                        </div>
                      </transition-group>
                    </template>
                    <transition name="fadeUp" mode="out-in">
                      <h3
                        class="ml-1"
                        v-if="!gif.searched && !gif.viewingRecent"
                      >
                        Trending
                      </h3>
                      <b-flex bare v-else-if="!gif.viewingRecent">
                        <b-btn ghost size="small" icon @click="getGifs()"
                          ><b-icon name="mdi mdi-arrow-left"></b-icon
                        ></b-btn>
                        <h3 class="ml-1">Results</h3>
                      </b-flex>
                    </transition>
                    <template v-if="!gif.searched && !gif.viewingRecent">
                      <transition-group name="fadeUp" tag="div">
                        <div
                          v-on:click="
                            gif.search = text;
                            searchGifs(null, text);
                          "
                          v-for="(text, i) in gif.chips"
                          :key="i"
                          class="chip"
                          role="button"
                          tabindex="1"
                        >
                          {{ text }}
                        </div>
                      </transition-group>
                    </template>
                    <transition-group name="fadeUp" tag="div">
                      <div
                        v-for="(gif, i) in gif.gifs"
                        :key="i"
                        class="gif col"
                        v-on:click="
                          sendGif(gif);
                          close();
                        "
                      >
                        <v-lazy-image
                          width="100px"
                          src-placeholder="https://res.cloudinary.com/abaan/image/upload/v1640548169/dark-loading-gif.gif"
                          :src="gif.images.original.webp"
                        />
                      </div>
                    </transition-group>
                  </div>
                </b-card></div
            ></template>
          </Popper>
        </template>
      </div>
    </div>
    <b-modal v-model="settings.modal" width="750px">
      <b-card height="350px" width="750px" glass-sidebar>
        <template #header>
          <b-flex>
            <h4 class="m-0">{{ this.settingsHeading[settings.index] }}</h4>
            <b-spacer></b-spacer>
            <b-btn @click="settings.modal = false" icon ghost
              ><b-icon name="mdi mdi-close"></b-icon
            ></b-btn>
          </b-flex>
        </template>
        <template #prepend>
          <b-nav-panel v-model="settings.index" style="min-width: 150px">
            <template #header>
              <h4>Settings</h4>
            </template>
            <template #1> Appearance </template>
            <template #2> Chat </template>
            <template #3> Notifications </template>
            <template #4> About </template>
          </b-nav-panel></template
        >
        <b-card bare height="275px" width="100%">
          <b-tab-content v-model="settings.index">
            <template v-slot:0>
              <b-flex>
                <span>Light Mode</span>
                <b-spacer></b-spacer>
                <b-switch
                  @change="applySettings()"
                  v-model="settings.data.lightMode"
                ></b-switch>
              </b-flex>
              <b-flex>
                <span>Messages Simple Mode</span>
                <b-spacer></b-spacer>
                <b-switch v-model="settings.data.messagesSimpleMode"></b-switch>
              </b-flex>
            </template>
            <template v-slot:1>
              <b-flex>
                <div class="flex flex-col">
                  <span>Like Emoji</span>
                  <small style="margin-left: 0">{{
                    "Current emoji: " + settings.data.likeEmoji.native
                  }}</small>
                </div>
                <b-spacer></b-spacer>
                <b-btn
                  color="secondary"
                  @click="settings.likeEmojiModal = true"
                >
                  Change
                </b-btn>
              </b-flex>
              <p class="text-sm opacity-75 pl-1 block">
                When you double click a message, we'll add this emoji as your
                reaction
              </p>
            </template>
            <template v-slot:2>
              <div v-show="!settings.notificationGranted">
                <span>We need your permission to send notifications</span>
                <br /><br />
                <b-btn
                  size="medium"
                  block
                  color="primary"
                  @click="askNotificationPermission()"
                  >Give Permission</b-btn
                >
              </div>
              <div v-show="settings.notificationGranted">
                <b-flex>
                  <span>Enable Notifications</span>
                  <b-spacer></b-spacer>
                  <b-switch
                    @change="applySettings()"
                    v-model="settings.data.notification.enabled"
                  ></b-switch>
                </b-flex>
                <b-flex v-show="settings.data.notification.enabled">
                  <span>Notifications for a new message</span>
                  <b-spacer></b-spacer>
                  <b-switch
                    @change="applySettings()"
                    v-model="settings.data.notification.newMessage"
                  ></b-switch>
                </b-flex>
              </div>
            </template>
            <template v-slot:3>
              <h4 class="my-0">Bugs</h4>
              <p>
                Found a bug? Great!, please report it at our
                <a
                  href="https://github.com/tomatopickle/Oneline/issues/new"
                  title="Report Bug"
                  >issues section</a
                >
              </p>
              <h4 class="my-0">Credits</h4>
              <p>
                Icons made by
                <a
                  href="https://www.flaticon.com/authors/ilham-fitrotul-hayat"
                  title="Ilham Fitrotul Hayat"
                  >Ilham Fitrotul Hayat</a
                >
                from
                <a href="https://www.flaticon.com/" title="Flaticon"
                  >www.flaticon.com</a
                >
              </p>
            </template>
          </b-tab-content>
          <template #footer>
            <b-flex
              style="height: max-content"
              v-if="settingsHeading[settings.index] != 'About'"
            >
              <b-spacer></b-spacer>
              <b-btn
                @click="updateSettings()"
                :color="settings.button.color"
                :loading="settings.button.loading"
              >
                <transition name="zoom" :duration="{ enter: 100, leave: 250 }">
                  <b-icon
                    name="mdi mdi-check"
                    v-if="settings.button.check"
                    left
                  ></b-icon>
                </transition>
                <span>{{ settings.button.text }}</span>
              </b-btn>
            </b-flex>
          </template>
        </b-card>
      </b-card>
    </b-modal>
    <b-modal v-model="settings.likeEmojiModal">
      <Picker
        color="#286ef1"
        autoFocus
        size="15"
        title="Pick a Reaction…"
        emoji="point_up"
        :data="emojiIndex"
        set="apple"
        @select="setNewLikeEmoji"
    /></b-modal>
    <b-modal
      v-model="fileUpload.show"
      width="50vw"
      @dragover.prevent
      @drop.prevent
    >
      <file-upload
        :user="user"
        :chat="chat"
        @uploaded="
          fileUpload.show = false;
          message.text = ``;
        "
      ></file-upload>
    </b-modal>
    <b-modal v-model="groupInfo.modal" width="400px">
      <b-card height="100%">
        <template #header>
          <b-flex>
            <h4 class="mt-0 mb-0">Group Info</h4>
            <b-spacer></b-spacer>
            <b-btn @click="groupInfo.modal = false" icon ghost
              ><b-icon name="mdi mdi-close"></b-icon
            ></b-btn>
          </b-flex>
        </template>
        <div>
          <b-avatar
            class="center"
            :username="chat.name || ''"
            size="75"
          ></b-avatar>
          <b-btn icon class="center mt-2 mb-2" size="small"
            ><b-icon name="mdi mdi-camera" left></b-icon> Change</b-btn
          >
          <b-input
            v-model="groupInfo.data.name"
            placeholder="My Awesome Group"
            label="Name"
          ></b-input>

          <b-textarea
            v-model="groupInfo.data.description"
            placeholder="This group is awesome"
            label="Description"
          ></b-textarea>
          <br />
        </div>
        <template #footer>
          <b-flex>
            <b-spacer></b-spacer>
            <b-btn
              color="primary"
              :loading="groupInfo.loading"
              @click="changeGroupInfo()"
            >
              Update
            </b-btn>
          </b-flex>
        </template>
      </b-card>
    </b-modal>
    <b-modal width="500px" v-model="leaveGroup">
      <b-card glass>
        <template v-slot:header>
          <h4 class="mt-0 mb-0">Leave Group</h4>
        </template>
        <br />
        The messages you sent will not be deleted
        <p>Are you sure you want to leave this group?</p>
        <br />
        <template v-slot:float>
          <b-flex>
            <b-spacer></b-spacer>
            <b-btn @click="leaveGroup = false"> Cancel </b-btn>
            <b-btn
              color="danger"
              :loading="leavingGroup"
              @click="leaveGroupFunction()"
            >
              Leave
            </b-btn>
          </b-flex>
        </template>
      </b-card>
    </b-modal>
    <b-modal width="500px" v-model="newChat.modal">
      <b-card>
        <template v-slot:header>
          <b-flex>
            <h4 class="mt-0 mb-0">New Chat</h4>
            <b-spacer></b-spacer>
            <b-btn @click="newChat.modal = false" icon ghost
              ><b-icon name="mdi mdi-close"></b-icon
            ></b-btn>
          </b-flex>
        </template>
        <br />
        <b-tab
          class="center"
          :tabs="newChat.tabs"
          v-model="newChat.tabIndex"
          style="width: 91%"
        ></b-tab>
        <b-tab-content
          v-model="newChat.tabIndex"
          :tabs="newChat.tabs"
          style="margin-top: 10px"
        >
          <template v-slot:0>
            <p>
              <b-input
                class="center"
                label="Email ID"
                type="email"
                v-model="newChat.data.personal.email"
                placeholder="Email of the user you want to chat with"
              ></b-input>
              <br />
              <b-flex>
                <b-spacer></b-spacer>
                <b-btn
                  :disabled="!newChat.data.personal.email"
                  :loading="newChat.data.personal.loading"
                  @click="createPersonalChat()"
                  color="primary"
                  >Create Chat</b-btn
                >
              </b-flex>
            </p>
          </template>
          <template v-slot:1>
            <p>
              <b-input
                class="center"
                label="Group ID"
                v-model="newChat.data.group.id"
                placeholder="Enter the group ID you want to join"
              ></b-input>
              <br />
              <b-flex>
                <b-spacer></b-spacer>
                <b-btn
                  @click="joinGroup()"
                  :loading="newChat.data.group.loading"
                  color="primary"
                  >Join Chat</b-btn
                >
              </b-flex>
            </p>
          </template>
          <template v-slot:2>
            <p>
              <b-input
                class="center"
                label="Group Name"
                v-model="newChat.data.newGroup.name"
                placeholder="My Awesome Group"
              ></b-input>
              <b-textarea
                class="center"
                label="Group Description"
                v-model="newChat.data.newGroup.description"
                placeholder="This group is awesome"
              ></b-textarea>
              <br />
              <b-flex>
                <b-spacer></b-spacer>
                <b-btn
                  :disabled="!newChat.data.newGroup.name"
                  :loading="newChat.data.newGroup.loading"
                  @click="createGroupChat()"
                  color="primary"
                  >Create Group</b-btn
                >
              </b-flex>
            </p>
          </template>
        </b-tab-content>
      </b-card>
    </b-modal>
    <template v-slot:append>
      <transition name="fade" :duration="{ enter: 0, leave: 50 }">
        <b-sidebar width="250px" v-show="chatInfo">
          <template v-slot:header>
            <b-flex class="m-0 p-0">
              <h4>Chat Info</h4>
              <b-spacer></b-spacer>
              <b-btn @click="chatInfo = false" icon ghost>
                <b-icon name="mdi mdi-close"></b-icon>
              </b-btn>
            </b-flex>
          </template>
          <div>
            <b-avatar class="center" :username="chat.name || ''"></b-avatar>
            <h4 class="text-center">{{ chat.name }}</h4>
            <div class="center" v-if="chat.type == 'group'">
              <b-flex class="center w-max">
                <b-btn
                  data-tooltip="Edit Group Info"
                  icon
                  outline
                  circle
                  @click="groupInfo.modal = true"
                  color="primary"
                >
                  <b-icon size="22px" name="mdi mdi-pencil"></b-icon>
                </b-btn>
                <b-btn
                  icon
                  circle
                  outline
                  data-tooltip="Copy Invite Link"
                  v-on:click="copy(`${baseUrl}invite?groupId=${chat.id}`)"
                  color="primary"
                >
                  <b-icon size="22px" name="mdi mdi-content-copy"></b-icon>
                </b-btn>
                <b-btn
                  icon
                  circle
                  outline
                  data-tooltip="Leave Group"
                  v-on:click="leaveGroup = true"
                  color="danger"
                >
                  <b-icon size="22px" name="mdi mdi-logout-variant"></b-icon>
                </b-btn>
              </b-flex>
            </div>
            <h3>Members</h3>
            <template v-for="(user, i) in members" :key="i">
              <b-list-item>
                <b-flex>
                  <b-avatar
                    :size="35"
                    :username="user.username"
                    :src="user?.src"
                  ></b-avatar>
                  <span>{{ user.username }}</span>
                </b-flex>
              </b-list-item>
            </template>
          </div>
        </b-sidebar>
      </transition>
    </template>
  </b-app>
</template>
<script src="./script.js"></script>
<style>
@import url("./styles.css");
</style>
<style scoped>
.contact {
  user-select: none;
}
</style>
