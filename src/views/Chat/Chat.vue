<template>
  <Head>
    <title>Oneline</title>
    <meta
      property="og:description"
      content="The free, fast and reliable chat app."
    />
    <meta property="og:image" content="./favicon.ico" />
  </Head>
  <b-app :loading="loading">
    <teleport to="body">
      <b-flex v-if="shorts.show" id="shortsControl">
        <template
          v-for="shortAvatar in shortsAvatars"
          :key="shortAvatar.user.id"
        >
          <b-avatar
            :class="
              'shortThumbnail ' +
              (shorts.user.id == shortAvatar.user.id ? 'selected' : '')
            "
            :username="
              shortAvatar.user.username ? shortAvatar.user?.username : 'loading'
            "
            :src="shortAvatar.user.avatar"
            :size="35"
            :data-badge="shortAvatar.badge"
            v-on:click="openShort(shortAvatar)"
          ></b-avatar>
        </template>
      </b-flex>
    </teleport>
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
              <b-flex>
                <b-avatar
                  id="uploadShort"
                  :username="user.username ? user?.username : 'loading'"
                  :src="user.avatar"
                  :size="35"
                  @click="short.show = true"
                ></b-avatar>
                <template
                  v-for="shortAvatar in shortsAvatars"
                  :key="shortAvatar.user.id"
                >
                  <b-avatar
                    class="shortThumbnail"
                    :username="
                      shortAvatar.user.username
                        ? shortAvatar.user?.username
                        : 'loading'
                    "
                    :src="shortAvatar.user.avatar"
                    :size="35"
                    :data-badge="shortAvatar.badge"
                    v-on:click="openShort(shortAvatar)"
                  ></b-avatar>
                </template>
              </b-flex>
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
                  <div class="badge" v-show="chat.unreadMessages > 0">
                    <span>{{ chat.unreadMessages }}</span>
                  </div>
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
                        stripHtml(getMessagePreview(chat))
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
              <router-link :to="'/user/' + user.id">
                <b-avatar
                  :username="user.username ? user?.username : 'loading'"
                  :src="user.avatar"
                  :size="35"
                ></b-avatar>
              </router-link>
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
    <div
      class="flex flex-col h-full"
      style="position: relative; overflow: hidden"
    >
      <div
        v-on:scroll="checkIfScrolledToTop($event)"
        class="flex-grow overflow-y-scroll overflow-x-hidden"
        id="msgs"
      >
        <b-nav sticky v-if="chat.id"
          ><template v-slot:branding>
            <b-flex class="m-0 p-0 w-full">
              <b-avatar
                :username="chat?.name || ''"
                :src="chat?.src"
                :size="35"
              ></b-avatar>
              <h3 class="mt-0 mb-1">{{ chat?.name }}</h3>
            </b-flex>
            <transition name="fade" :duration="{ enter: 1000, leave: 10 }">
              <small
                id="lastOnline"
                v-if="chat?.lastOnline && chat.lastOnline != 0"
                ref="lastOnline"
              >
                <span>Available {{ timeSince(chat?.lastOnline) }} ago</span>
              </small>

              <small id="lastOnline" v-else-if="chat.type == 'personal'"
                >Online</small
              >
            </transition>
          </template>
          <template v-slot:actions>
            <b-flex bare>
              <b-btn
                v-if="!chat.archive"
                icon
                @click="startMeeting()"
                :loading="newMeetingBtnDisabled"
              >
                <b-icon name="mdi mdi-video"></b-icon>
              </b-btn>
              <b-btn color="secondary" icon @click="chatInfo = !chatInfo"
                ><b-icon name="mdi mdi-information-outline"></b-icon
              ></b-btn>
            </b-flex>
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
            :src="chat?.src"
            :size="65"
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
            $refs.messageBar.$el.focus();
          "
          @playAudio="
            audio.show = true;
            audio.src = $event.src;
          "
          @openShort="
            log($event.short);
            openShortWithId($event.short.time, $event.sender);
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
            $refs.messageBar.$el.focus();
          "
          @playAudio="
            audio.show = true;
            audio.src = $event.src;
          "
          @openShort="
            log($event.short);
            openShortWithId($event.short.time, $event.sender);
          "
          @startMeetingWithUser="startMeetingWithUser($event)"
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
      <div id="groupArchivedMessage" v-if="chat.archive">
        <p>This group is archived, you can't send new messages</p>
      </div>
      <template v-if="audio.show || reply.show"><br /><br /></template>
      <div id="messageInp" v-if="chat?.id && !chat.archive">
        <div v-show="reply.show">
          <div id="replyMessage">
            <span class="text-blue-600">{{
              members[reply.message.sender]?.username
            }}</span
            >:&nbsp;<span
              class="w-full flex-grow"
              v-html="getReplyPreview(reply.message)"
            ></span>
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
        <div v-show="instantUpload.show">
          <div id="instantUpload">
            <span>{{
              instantUpload.loading ? "Uploading..." : instantUpload.fileName
            }}</span>
            <b-spacer></b-spacer>
            <transition name="zoom" mode="out-in">
              <b-spinner
                class="primary"
                v-if="instantUpload.loading"
                style="transform: scale(0.5); margin: -15px"
              ></b-spinner>
              <div v-else class="flex">
                <b-btn
                  @click="deleteInstantUpload()"
                  size="small"
                  icon
                  class="mr-1"
                >
                  <b-icon name="mdi mdi-delete"></b-icon>
                </b-btn>
                <b-btn
                  @click="sendInstantUpload()"
                  size="small"
                  icon
                  color="primary"
                >
                  <b-icon name="mdi mdi-send"></b-icon>
                </b-btn>
              </div>
            </transition>
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
              username + " "
            }}</span>
            typing...
          </div>
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
            ref="messageBar"
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
    <transition name="fadeUp">
      <b-card
        id="meetingInvite"
        width="210px"
        style="min-width: 0"
        v-show="meetingInvite.show"
      >
        <h4>Meeting Invite</h4>
        <b-avatar
          :username="meetingInvite.data?.from?.username || ''"
          :src="meetingInvite.data?.from?.avatar"
          class="center"
        ></b-avatar>
        <h3>{{ meetingInvite.data?.from?.username }}</h3>
        <b-btn
          @click="
            joinMeeting(meetingInvite.data.room);
            meetingInvite.show = false;
          "
          size="medium"
          block
          style="margin-bottom: 5px"
          color="success"
        >
          <b-icon left name="mdi mdi-phone"></b-icon>
          Join</b-btn
        >
        <b-btn size="medium" block color="danger" @click="declineMeeting()">
          <b-icon left name="mdi mdi-phone-hangup"></b-icon>
          Decline</b-btn
        >
        <br />
      </b-card>
    </transition>
    <b-modal v-model="short.show" width="75vw">
      <b-card height="100%" glass>
        <template #header>
          <b-flex>
            <h4 class="mt-0 mb-0">What are you gonna post?</h4>
            <b-spacer></b-spacer>
            <b-btn @click="short.show = false" icon ghost
              ><b-icon name="mdi mdi-close"></b-icon
            ></b-btn>
          </b-flex>
        </template>
        <div>
          <transition-group name="fadeUp" tag="div">
            <b-flex>
              <b-btn
                glass
                class="storyModeBtn"
                color="primary"
                @click="
                  short.show = false;
                  short.photo.show = true;
                "
              >
                <br />
                <b-icon size="50px" name="mdi mdi-camera"></b-icon>
                <h4>Photo</h4>
              </b-btn>
              <b-btn
                @click="
                  short.show = false;
                  short.video.show = true;
                "
                glass
                class="storyModeBtn"
                color="primary"
              >
                <br />
                <b-icon size="50px" name="mdi mdi-video"></b-icon>
                <h4>Video</h4>
              </b-btn>
              <b-btn
                @click="
                  short.show = false;
                  short.poll.show = true;
                "
                glass
                class="storyModeBtn"
                color="primary"
              >
                <br />
                <b-icon size="50px" name="mdi mdi-poll"></b-icon>
                <h4>Poll (Beta)</h4>
              </b-btn>
              <b-btn glass class="storyModeBtn text-left" color="primary">
                <h1>&nbsp;More</h1>
                <h1>Coming</h1>
                <h1>Soon...</h1>
              </b-btn>
            </b-flex>
          </transition-group>
        </div>
        <template #footer> </template>
      </b-card>
    </b-modal>
    <b-modal v-model="short.photo.show" width="50vw">
      <b-card height="500px" glass>
        <template #header>
          <b-flex>
            <h4 class="mt-0 mb-0">Upload Short</h4>
            <b-spacer></b-spacer>
            <b-btn @click="short.photo.show = false" icon ghost
              ><b-icon name="mdi mdi-close"></b-icon
            ></b-btn>
          </b-flex>
        </template>
        <div>
          <transition name="fadeUp" mode="out-in">
            <div v-if="!short.photo.data.src">
              <b-btn
                @click="uploadShortImage()"
                :loading="short.photo.uploadBtnLoading"
                color="primary"
                class="center mt-36"
              >
                <b-icon left name="mdi mdi-tray-arrow-up"></b-icon>
                Upload Image
              </b-btn>
              <br /><br />
              <small class="text-center block w-full"
                ><b>Tip:</b> You can also paste images</small
              >
            </div>
            <div v-else>
              <figure
                id="shortPhotoUploadParent"
                :class="short.photo.data.filter"
              >
                <img
                  id="shortPhotoUpload"
                  :src="short.photo.data.src"
                  alt="Loading Image"
                />
              </figure>
            </div>
          </transition>
          <transition name="fadeUp">
            <div v-if="short.photo.data.src">
              <h4 style="margin-block: 0">Filters</h4>
              <vue-horizontal ref="shortsPhotoFilters" style="width: 42vw">
                <template v-slot:btn-prev>
                  <b-btn size="small" bounce circle icon>
                    <b-icon size="24px" name="mdi mdi-chevron-left"></b-icon>
                  </b-btn>
                </template>

                <template v-slot:btn-next>
                  <b-btn size="small" bounce circle icon>
                    <b-icon size="24px" name="mdi mdi-chevron-right"></b-icon>
                  </b-btn>
                </template>
                <template
                  v-for="filter in short.photo.filters"
                  :key="filter.usage"
                >
                  <figure
                    v-if="filter.is_done"
                    :class="'filterPreview ' + filter.usage"
                    v-on:mouseover="
                      if (!short.photo.data.filterSelected) {
                        short.photo.data.filter = filter.usage;
                      }
                    "
                    v-on:mouseleave="
                      if (!short.photo.data.filterSelected) {
                        short.photo.data.filter = '';
                      }
                    "
                    v-on:click="
                      short.photo.data.filterSelected = true;
                      short.photo.data.filter = filter.usage;
                    "
                  >
                    <img
                      @load="$refs.shortsPhotoFilters.refresh()"
                      :src="short.photo.data.src"
                    />
                  </figure>
                </template>
              </vue-horizontal>
              <b-input
                v-model="short.photo.data.caption"
                placeholder="Caption for Short (Optional)"
              ></b-input>
              <br />
              <b-btn
                block
                color="primary"
                class="mt-1"
                @click="uploadShortPhoto()"
              >
                <b-icon left name="mdi mdi-tray-arrow-up"></b-icon>
                Upload Short
              </b-btn>
            </div>
          </transition>
        </div>
        <template #footer> </template>
      </b-card>
    </b-modal>

    <b-modal v-model="short.video.show" width="50vw">
      <short-video-uploader @close="short.video.show = false" :user="user" />
    </b-modal>
    <b-modal v-model="short.poll.show" width="500px">
      <short-poll-wizard @close="short.poll.show = false" :user="user" />
    </b-modal>
    <b-modal v-model="settings.modal" width="750px">
      <b-card
        height="440px"
        width="750px"
        glass-sidebar
        id="settingsModal"
        :loading="settings.loading"
      >
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
            <template #2> Account </template>
            <template #3> Chat </template>
            <template #4> Notifications </template>
            <template #5> Sounds </template>
            <template #6> About </template>
          </b-nav-panel></template
        >
        <b-card bare height="325px" width="100%">
          <b-tab-content v-model="settings.index">
            <template v-slot:0>
              <div>
                <b-flex>
                  <span>Light Mode</span>
                  <b-spacer></b-spacer>
                  <b-switch
                    @change="applySettings()"
                    v-model="settings.data.lightMode"
                  ></b-switch>
                </b-flex>

                <h4 class="ml-2 my-0">Chat UI</h4>
                <b-flex class="m-auto w-max">
                  <div>
                    <div
                      @click="
                        settings.data.messagesSimpleMode = false;
                        updateSettings();
                      "
                      :class="{
                        chatWindowPreview: true,
                        selected: !settings.data.messagesSimpleMode,
                      }"
                    >
                      <svg
                        width="373"
                        height="149"
                        viewBox="0 0 373 149"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="104"
                          y="18"
                          width="208"
                          height="36"
                          rx="18"
                          fill="#242427"
                        />
                        <circle cx="67.5" cy="36.5" r="28.5" fill="#353535" />
                        <rect
                          x="104"
                          y="97"
                          width="208"
                          height="36"
                          rx="18"
                          fill="#242427"
                        />
                        <circle cx="67.5" cy="115.5" r="28.5" fill="#353535" />
                      </svg>
                    </div>
                    <h4 class="text-center my-1">Text</h4>
                  </div>
                  <div>
                    <div
                      @click="
                        settings.data.messagesSimpleMode = true;
                        updateSettings();
                      "
                      :class="{
                        chatWindowPreview: true,
                        selected: settings.data.messagesSimpleMode,
                      }"
                    >
                      <svg
                        width="416"
                        height="151"
                        viewBox="0 0 416 151"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M199 34C199 32.1429 199 31.2143 199.051 30.4303C199.839 18.4122 209.412 8.8391 221.43 8.05139C222.214 8 223.143 8 225 8H402.571C405.79 8 407.4 8 408.494 8.87267C408.728 9.05942 408.941 9.27187 409.127 9.50604C410 10.6003 410 12.2098 410 15.4286V15.4286C410 34.7415 410 44.398 404.764 50.9638C403.643 52.3688 402.369 53.6435 400.964 54.764C394.398 60 384.742 60 365.429 60H225C223.143 60 222.214 60 221.43 59.9486C209.412 59.1609 199.839 49.5878 199.051 37.5697C199 36.7857 199 35.8571 199 34V34Z"
                          fill="#3958FC"
                        />
                        <path
                          d="M6 97.4286C6 94.2098 6 92.6003 6.87267 91.506C7.05942 91.2719 7.27187 91.0594 7.50604 90.8727C8.60034 90 10.2098 90 13.4286 90H173C174.857 90 175.786 90 176.57 90.0514C188.588 90.8391 198.161 100.412 198.949 112.43C199 113.214 199 114.143 199 116V116C199 117.857 199 118.786 198.949 119.57C198.161 131.588 188.588 141.161 176.57 141.949C175.786 142 174.857 142 173 142H50.5714C31.2585 142 21.602 142 15.0362 136.764C13.6312 135.643 12.3565 134.369 11.236 132.964C6 126.398 6 116.741 6 97.4286V97.4286Z"
                          fill="#1D1D20"
                        />
                      </svg>
                    </div>
                    <h4 class="text-center my-1">Simple</h4>
                  </div>
                </b-flex>
                <b-flex v-if="settings.data.messagesSimpleMode">
                  <span>Message Color</span>
                  <b-spacer></b-spacer>
                  <template v-for="color in settings.colors" :key="color">
                    <swatch
                      v-on:click="
                        settings.data.messagesSimpleModeColor = color;
                        applySettings();
                      "
                      :color="color"
                    />
                  </template>
                </b-flex>
              </div>
            </template>
            <template v-slot:1>
              <b-card
                bare
                width="200px"
                height="200px"
                class="center relative bottom-9"
              >
                <b-avatar
                  class="center"
                  :src="userInfo.data.avatar"
                  :username="userInfo.data.username || ''"
                  :size="75"
                ></b-avatar>
                <b-btn
                  @click="uploadAvatar()"
                  icon
                  class="center mt-2 mb-2"
                  size="small"
                  ><b-icon name="mdi mdi-camera" left></b-icon> Change</b-btn
                >
                <b-input
                  v-model="userInfo.data.username"
                  placeholder="Username"
                  label="User Name"
                ></b-input>

                <b-textarea
                  v-model="userInfo.data.description"
                  placeholder="Description"
                  label="Description"
                ></b-textarea>
                <br />
                <br />
              </b-card>
            </template>
            <template v-slot:2>
              <b-flex>
                <span>Show Exact Time</span>
                <b-spacer></b-spacer>
                <b-switch v-model="settings.data.showExactTime"></b-switch>
              </b-flex>
              <b-flex>
                <div class="flex flex-col">
                  <span>Double click reaction</span>
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
              <p class="text-sm opacity-75 pl-2 block mb-0 w-11/12">
                When you double click a message, we'll add this emoji as your
                reaction
              </p>
            </template>
            <template v-slot:3>
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
                <b-flex v-show="settings.data.notification.enabled">
                  <span>Enable Meeting Notifications</span>
                  <b-spacer></b-spacer>
                  <b-switch
                    @change="applySettings()"
                    v-model="settings.data.notification.meetingNotifcations"
                  ></b-switch>
                </b-flex>
              </div>
            </template>
            <template v-slot:4>
              <b-flex>
                <span>Ringtones for Meeting Invites</span>
                <b-spacer></b-spacer>
                <b-switch
                  @change="applySettings()"
                  v-model="settings.data.ringtoneForMeetingInvite"
                ></b-switch>
              </b-flex>
            </template>
            <template v-slot:5>
              <h4 class="my-0 pt-2">Cache</h4>
              <p v-if="getLastUpdatedTime">{{ getLastUpdatedTime }}</p>
              <!-- I had to wrap this in a p tag to get the perfect padding -->
              <p>
                <b-flex bare>
                  <span>Force Update</span>
                  <b-btn class="-my-9 ml-5" @click="clearCache()" size="small"
                    >Clear Cache</b-btn
                  >
                </b-flex>
              </p>
              <h4 class="my-0 pt-2">Bugs</h4>
              <p>
                Found a bug? Great!, please report it at our
                <a
                  target="_blank"
                  href="https://github.com/tomatopickle/Oneline/issues/new"
                  title="Report Bug"
                  >issues section</a
                >
              </p>
              <h4 class="my-0 pt-2">Credits</h4>
              <p>
                Icons made by
                <a
                  target="_blank"
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
          <template v-slot:footer>
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
      <b-card height="100%" :loading="groupInfo.modalLoading">
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
            :src="chat?.src"
            :size="75"
          ></b-avatar>
          <b-btn
            @click="uploadGroupAvatar()"
            icon
            class="center mt-2 mb-2"
            size="small"
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
    <b-modal width="500px" v-model="shorts.show" id="shorts">
      <div>
        <b-flex>
          <b-avatar
            :username="shorts.user.username || ''"
            :src="shorts.user.avatar"
          ></b-avatar>
          <div>
            <h3 class="m-0">{{ shorts.user.username }}</h3>
            <small
              style="margin-left: 0"
              v-if="timeSince(shorts.short.time) != '0 seconds'"
              >{{ timeSince(shorts.short.time) }} ago</small
            >
            <small style="margin-left: 0" v-else>Just now</small>
          </div>
          <b-spacer></b-spacer>
          <b-btn
            bounce
            icon
            data-tooltip="Copy Short Link"
            @click="
              copy(
                `${baseUrl}?story=${shorts.short.time}&user=${shorts.user.id}`
              )
            "
          >
            <b-icon name="mdi mdi-content-copy"></b-icon>
          </b-btn>
          <b-btn
            bounce
            icon
            color="primary"
            outline
            data-tooltip="Send Like Message"
            @click="likeShort()"
          >
            <b-icon name="mdi mdi-heart"></b-icon>
          </b-btn>
        </b-flex>
      </div>
      <br />
      <vue-horizontal
        snap="center"
        @prev="
          shorts.index--;
          viewedShort();
        "
        @next="
          shorts.index++;
          viewedShort();
        "
        ref="shortsSlider"
      >
        <template v-slot:btn-prev>
          <b-btn bounce circle glass icon color="primary">
            <b-icon size="24px" name="mdi mdi-chevron-left"></b-icon>
          </b-btn>
        </template>

        <template v-slot:btn-next>
          <b-btn bounce circle glass icon color="primary">
            <b-icon size="24px" name="mdi mdi-chevron-right"></b-icon>
          </b-btn>
        </template>
        <div class="short" v-for="short in shorts.shorts" :key="short.time">
          <figure :class="short.filter" v-if="short.type == 'photo'">
            <img
              @load="
                $refs.shortsSlider.refresh();
                $refs.shortsSlider.scrollToIndex(0);
                shorts.index = 0;
              "
              class="shortImage"
              :src="short.src"
              alt=""
            />
            <h4 class="shortImageCaption">{{ shorts.short?.caption }}</h4>
          </figure>
          <figure :class="short.filter" v-else-if="short.type == 'video'">
            <video
              @load="
                $refs.shortsSlider.refresh();
                $refs.shortsSlider.scrollToIndex(0);
                shorts.index = 0;
              "
              class="shortImage"
              :src="short.src"
              controls
              alt=""
            />
          </figure>
          <div :class="short.filter" v-else-if="short.type == 'poll'">
            <b-card glass width="400px" class="center">
              <h4>{{ short.poll.name }}</h4>
              <div class="center w-3/4">
                <div v-if="!Object.keys(short?.voters || {}).includes(user.id)">
                  <template v-for="option in short.poll.options" :key="option">
                    <b-btn
                      v-on:click="votePoll(option)"
                      block
                      style="margin-top: 5px; z-index: 0"
                    >
                      {{ option.name }}
                    </b-btn>
                  </template>
                </div>
                <div v-else>
                  <ShortPollResults :poll="short.poll" />
                </div>
                <br />
              </div>
            </b-card>
          </div>
        </div>
      </vue-horizontal>
      <b-flex>
        <b-form
          class="w-full"
          @submit="
            if (shorts.commentText) {
              commentShort();
            }
          "
        >
          <b-input
            ghost
            v-model="shorts.commentText"
            :placeholder="'Message ' + shorts.user.username"
          ></b-input>
        </b-form>
        <b-btn @click="commentShort()" circle icon glass color="secondary">
          <b-icon size="26px" name="mdi mdi-send"></b-icon>
        </b-btn>
      </b-flex>
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
    <b-modal width="500px" v-model="archiveGroup">
      <b-card glass>
        <template v-slot:header>
          <h4 class="mt-0 mb-0">Archive Group</h4>
        </template>
        <p>
          Messages sent will not be deleted, members can still view previous
          messages but won't be able to send new ones.
        </p>
        <p>Are you sure you want to archive this group?</p>
        <br />
        <br />
        <template v-slot:float>
          <b-flex>
            <b-spacer></b-spacer>
            <b-btn @click="archiveGroup = false"> Cancel </b-btn>
            <b-btn
              color="danger"
              :loading="leavingGroup"
              @click="archiveGroupFunction()"
            >
              Archive
            </b-btn>
          </b-flex>
        </template>
      </b-card>
    </b-modal>
    <b-modal width="500px" v-model="createTag.show">
      <b-card glass>
        <template v-slot:header>
          <h4 class="mt-0 mb-0">Create Tag</h4>
        </template>
        <h5 class="my-2">Tag Name</h5>

        <b-input
          v-model="createTag.data.name"
          placeholder="Something cool... what about a 'Ghost' tag"
        ></b-input>
        <h5 class="my-2">Tag Color</h5>
        <div class="w-max flex center">
          <template v-for="color in createTag.colors" :key="color">
            <swatch
              class="mx-1"
              v-on:click="createTag.data.color = color"
              :color="color"
            />
          </template>
        </div>
        <br />
        <template v-if="createTag.data.name">
          <h5 class="my-2">Tag Preview</h5>

          <div
            id="tagPreview"
            :style="{ backgroundColor: this.createTag.data.color }"
          >
            {{ createTag.data.name }}
          </div>
          <br
        /></template>
        <template v-slot:footer>
          <b-flex>
            <b-spacer></b-spacer>
            <b-btn @click="createTag.show = false"> Cancel </b-btn>
            <b-btn color="primary" @click="createTagFunction()"> Create </b-btn>
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
                  :disabled="!newChat.data.group.id"
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
                  :disabled="
                    !newChat.data.newGroup.name ||
                    !newChat.data.newGroup.description
                  "
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
            <b-avatar
              :src="chat?.src"
              class="center"
              :username="chat.name || ''"
            ></b-avatar>
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
                  v-if="!chat.archive"
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
                  v-if="user.id != chat.admin"
                  @click="createTag.show = true"
                  outline
                  data-tooltip="Create tag"
                  color="primary"
                >
                  <b-icon size="22px" name="mdi mdi-tag-plus"></b-icon>
                </b-btn>
                <b-btn
                  icon
                  circle
                  v-if="user.id != chat.admin"
                  outline
                  data-tooltip="Leave Group"
                  v-on:click="leaveGroup = true"
                  color="danger"
                >
                  <b-icon size="22px" name="mdi mdi-logout-variant"></b-icon>
                </b-btn>
                <b-btn
                  v-else-if="!chat.archive"
                  icon
                  circle
                  outline
                  data-tooltip="Archive Group"
                  v-on:click="archiveGroup = true"
                  color="danger"
                >
                  <b-icon size="22px" name="mdi mdi-archive-outline"></b-icon>
                </b-btn>
                <b-btn
                  v-else
                  icon
                  circle
                  outline
                  data-tooltip="Unarchive Group"
                  v-on:click="unarchiveGroupFunction()"
                  color="danger"
                >
                  <b-icon
                    size="22px"
                    name="mdi mdi-archive-arrow-up-outline"
                  ></b-icon>
                </b-btn>
              </b-flex>
            </div>
            <template v-if="chat.tags">
              <h3 class="mb-1">Tags</h3>
              <div class="px-2" id="totTags">
                <template v-for="(tag, i) in chat.tags" :key="i">
                  <div
                    class="tag"
                    :style="{
                      backgroundColor: tag.color,
                      '--tagColor': tag.color,
                    }"
                  >
                    {{ tag.name }}
                    <div
                      v-if="chat.admin == user.id"
                      data-tooltip="Remove tag"
                      v-on:click="removeTag(i)"
                      class="tagCloseButton"
                    >
                      &#215;
                    </div>
                  </div>
                </template>
              </div>
            </template>
            <h3>Members</h3>
            <template v-for="(usr, i) in members" :key="i">
              <b-list-item
                :class="{
                  relative: true,
                  memberInfo: true,
                  isAdmin: i == chat?.admin,
                }"
              >
                <div v-if="i == chat?.admin" class="memberLabel adminLabel">
                  Admin
                </div>
                <div
                  v-if="
                    chat?.assignedTags &&
                    chat?.assignedTags[i] &&
                    chat?.tags[chat.assignedTags[i]]?.name
                  "
                  class="memberLabel"
                  :style="{
                    backgroundColor: chat.tags[chat.assignedTags[i]].color,
                  }"
                >
                  {{ chat.tags[chat.assignedTags[i]].name }}
                </div>
                <b-flex>
                  <b-avatar
                    :size="35"
                    :username="usr.username"
                    :src="usr?.avatar"
                  ></b-avatar>
                  <span>{{ usr.username }}</span>
                  <div class="memberActionButtons" v-if="chat.admin == user.id">
                    <Popper arrow :interactive="false" placement="top">
                      <b-btn icon>
                        <b-icon name="mdi mdi-tag"></b-icon>
                      </b-btn>
                      <template #content>
                        <div glass class="tagSelectDialog">
                          <b-flex
                            style="
                              margin-left: 5px;
                              margin-bottom: 5px;
                              margin-top: 2px;
                            "
                          >
                            <b-avatar
                              :size="25"
                              :username="usr.username"
                              :src="usr?.avatar"
                            ></b-avatar>
                            <h5 class="my-0">
                              Assign a tag to {{ usr.username }}
                            </h5></b-flex
                          >
                          <div style="margin-bottom: 5px">
                            <template v-for="(tag, i) in chat.tags" :key="i">
                              <div
                                v-on:click="assignTag(i, usr.id)"
                                class="tag"
                                :style="{ backgroundColor: tag.color }"
                              >
                                {{ tag.name }}
                              </div>
                            </template>
                          </div>
                          <b-btn
                            style="font-size: 15px; padding-block: 2px"
                            block
                            v-on:click="assignTag(i, usr.id)"
                            >Remove tag</b-btn
                          >
                        </div>
                      </template>
                    </Popper>
                  </div>
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
@import url("./styles/style.css");
</style>
<style scoped>
.contact {
  user-select: none;
}
</style>
