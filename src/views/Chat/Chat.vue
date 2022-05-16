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
      <sl-card id="contacts" width="250px">
        <div slot="header">
          <b-flex class="m-0">
            <img height="30" src="../../assets/logos/logo.png" alt="Logo" />
            <div class="font-normal">Oneline</div>
            <b-spacer></b-spacer>
            <sl-icon-button
              name="gear"
              label="Settings"
              @click="settings.modal = true"
            ></sl-icon-button>
          </b-flex>
        </div>
        <div>
          <sl-card class="no-border no-padding w-full">
            <div slot="header">
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
                <h3 class="m-0">Chats</h3>
                <b-spacer></b-spacer>
                <sl-dropdown style="max-width: 200px">
                  <sl-button slot="trigger" variant="primary" outline circle>
                    <sl-icon name="plus-lg" label="New"></sl-icon>
                  </sl-button>
                  <sl-menu>
                    <sl-menu-item
                      @click="
                        newChat.tabIndex = 0;
                        newChat.modal = true;
                      "
                      ><span>New Chat</span></sl-menu-item
                    >
                    <sl-menu-item
                      @click="
                        newChat.modal = true;
                        newChat.tabIndex = 1;
                      "
                      ><span>Join Group</span></sl-menu-item
                    >
                    <sl-menu-item
                      @click="
                        newChat.modal = true;
                        newChat.tabIndex = 2;
                      "
                      ><span>New Group</span></sl-menu-item
                    >
                  </sl-menu>
                </sl-dropdown>
              </b-flex>
            </div>
            <sl-input
              clearable
              filled
              placeholder="Search"
              class="w-11/12 center my-2"
            >
              <sl-icon name="search" slot="prefix"></sl-icon>
            </sl-input>
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
                      class
                    />
                    <path
                      d="m256 121c-20.81 0-40.54 4.73-58.17 13.19l179.98 179.98c8.46-17.63 13.19-37.36 13.19-58.17 0-74.44-60.56-135-135-135z"
                      fill="#5e5e5e"
                      data-original="#000000"
                      class
                    />
                    <path
                      d="m256 0c-141.486 0-256 114.497-256 256 0 141.568 114.389 256 256 256 141.486 0 256-114.497 256-256 0-141.568-114.389-256-256-256zm-226 256c0-57.051 21.095-109.126 55.909-148.878l318.969 318.969c-39.748 34.813-91.821 55.909-148.878 55.909-124.996 0-226-100.969-226-226zm396.091 148.878-318.969-318.969c39.748-34.813 91.821-55.909 148.878-55.909 124.996 0 226 100.969 226 226 0 57.051-21.095 109.126-55.909 148.878z"
                      fill="#5e5e5e"
                      data-original="#000000"
                      class
                    />
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
                >New Chat</b-btn
              >
            </template>
            <transition-group name="flip-list" tag="div">
              <template v-for="(chat, i) in chats" :key="i">
                <div
                  clickable
                  v-on:click="openChat(chat)"
                  :class="
                    'contact ' + (chat.unreadMessages > 0 ? 'unreadMsgs' : '')
                  "
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
                      <span class="chatName">{{ chat.name }}</span>
                      <br />
                      <small class="chatMessagePreview">{{
                        stripHtml(getMessagePreview(chat))
                      }}</small>
                    </span>
                  </b-flex>
                </div>
              </template>
            </transition-group>
          </sl-card>
        </div>
        <div slot="footer">
          <b-flex class="m-0 p-0">
            <router-link :to="'/user/' + user.id">
              <b-avatar
                :username="user.username ? user?.username : 'loading'"
                :src="user.avatar"
                :size="35"
              ></b-avatar>
            </router-link>
            <sl-card class="no-padding no-border">
              <div slot="header">
                <h4>{{ user?.username }}</h4>
              </div>
              <small>{{ user?.email }}</small>
            </sl-card>
          </b-flex>
        </div>
      </sl-card>
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
        <div v-if="chat.id" class="bar sticky">
          <b-flex>
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
            <b-spacer> </b-spacer>
            <b-flex bare>
              <sl-button
                icon
                circle
                v-if="!chat.archive"
                @click="startMeeting()"
                :loading="newMeetingBtnDisabled"
                variant="primary"
                outline
              >
                <sl-icon name="camera-video-fill"></sl-icon>
              </sl-button>
              <sl-button circle icon @click="chatInfo = !chatInfo">
                <sl-icon name="info-circle-fill"></sl-icon>
              </sl-button>
            </b-flex>
          </b-flex>
        </div>
        <br />
        <br />
        <br />
        <br />
        <div class="w-max center" v-if="Object.keys(chats).length == 0">
          <br />
          <br />
          <br />
          <img
            class="center block"
            height="150"
            src="@/assets/logos/logo.png"
            alt="Oneline Logo"
          />
          <br />
          <h1 class="mt-0">Hmm... You don't have any chats</h1>
          <br />
          <b-btn @click="newChat.modal = true" color="primary" class="center">
            <b-icon name="mdi mdi-plus" left></b-icon>Create New Chat
          </b-btn>
        </div>
        <div class="w-max center" v-else-if="!chat.id">
          <br />
          <br />
          <br />
          <img
            class="center block"
            height="150"
            src="@/assets/pickChatIcon.png"
            alt="Oneline Logo"
          />
          <br />
          <h1 class="mt-0">Pick a chat from the left sidebar</h1>
          <br />
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
          <sl-button
            v-if="scrollDownBtn"
            icon
            circle
            @click="scrollDown()"
            color="secondary"
            id="scrollDownButton"
          >
            <sl-icon name="chevron-down"></sl-icon>
          </sl-button>
        </transition>
      </div>
      <div id="groupArchivedMessage" v-if="chat.archive">
        <p>This group is archived, you can't send new messages</p>
      </div>
      <template v-if="audio.show || reply.show">
        <br />
        <br />
      </template>
      <div id="messageInp" v-if="chat?.id && !chat.archive">
        <div v-show="reply.show">
          <div id="replyMessage">
            <span class="text-blue-600">{{
              members[reply.message.sender]?.username
            }}</span
            >:&nbsp;
            <span
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
            <span>
              {{
                instantUpload.loading ? "Uploading..." : instantUpload.fileName
              }}
            </span>
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
          >
            <b-icon name="mdi mdi-close"></b-icon>
          </b-btn>
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
              <b-icon name="mdi mdi-check"></b-icon>
            </b-btn>
          </b-flex>
          <b-flex v-else>
            <b-spinner style="transform: scale(0.5)"></b-spinner>
            <span>Uploading...</span>
          </b-flex>
        </div>
        <template v-if="!recording.show">
          <sl-tooltip content="Send File">
            <sl-icon-button
              @click="fileUpload.show = true"
              style="font-size: 2rem"
              name="plus"
            >
            </sl-icon-button>
          </sl-tooltip>
          <content-editable-div
            ref="messageBar"
            @keypress="checkIfUserTyping($event)"
            @keydown="checkEnterKey($event)"
            @blur="userLeftMessageBox()"
            v-model="message.text"
            data-placeholder="Message"
            class="editable"
          ></content-editable-div>
          <sl-tooltip content="Send Recording">
            <sl-icon-button
              @click="startRecording()"
              style="font-size: 1.5rem"
              name="mic"
            >
            </sl-icon-button>
          </sl-tooltip>

          <sl-dropdown>
            <sl-tooltip slot="trigger" content="Insert Emoji">
              <sl-icon-button style="font-size: 1.5rem" name="emoji-smile">
              </sl-icon-button>
            </sl-tooltip>
            <div>
              <Picker
                color="#286ef1"
                :autoFocus="true"
                title="Pick your emoji…"
                emoji="point_up"
                :data="emojiIndex"
                set="apple"
                @select="addedEmoji"
              />
            </div>
          </sl-dropdown>
          <sl-dropdown>
            <sl-tooltip slot="trigger" content="Send GIF">
              <sl-icon-button
                @click="getGifs()"
                style="font-size: 1.5rem"
                name="filetype-gif"
              >
              </sl-icon-button>
            </sl-tooltip>
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
                        >
                          <b-icon name="mdi mdi-arrow-left"></b-icon>
                        </b-btn>
                      </transition>
                      <h3 class="ml-1">Recent</h3>
                      <b-spacer></b-spacer>
                      <b-btn
                        v-if="!gif.viewingRecent"
                        @click="getAllRecentGifs()"
                        ghost
                        size="small"
                        color="primary"
                      >
                        View All
                        <b-icon right name="mdi mdi-chevron-right"></b-icon>
                      </b-btn>
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
                    <h3 class="ml-1" v-if="!gif.searched && !gif.viewingRecent">
                      Trending
                    </h3>
                    <b-flex bare v-else-if="!gif.viewingRecent">
                      <b-btn ghost size="small" icon @click="getGifs()">
                        <b-icon name="mdi mdi-arrow-left"></b-icon>
                      </b-btn>
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
              </b-card>
            </div>
          </sl-dropdown>
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
          <b-icon left name="mdi mdi-phone"></b-icon>Join
        </b-btn>
        <b-btn size="medium" block color="danger" @click="declineMeeting()">
          <b-icon left name="mdi mdi-phone-hangup"></b-icon>Decline
        </b-btn>
        <br />
      </b-card>
    </transition>
    <b-modal v-model="short.show" width="75vw">
      <b-card height="100%" glass>
        <template #header>
          <b-flex>
            <h4 class="mt-0 mb-0">What are you gonna post?</h4>
            <b-spacer></b-spacer>
            <b-btn @click="short.show = false" icon ghost>
              <b-icon name="mdi mdi-close"></b-icon>
            </b-btn>
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
        <template #footer></template>
      </b-card>
    </b-modal>
    <b-modal v-model="short.photo.show" width="50vw">
      <b-card height="500px" glass>
        <template #header>
          <b-flex>
            <h4 class="mt-0 mb-0">Upload Short</h4>
            <b-spacer></b-spacer>
            <b-btn @click="short.photo.show = false" icon ghost>
              <b-icon name="mdi mdi-close"></b-icon>
            </b-btn>
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
                <b-icon left name="mdi mdi-tray-arrow-up"></b-icon>Upload Image
              </b-btn>
              <br />
              <br />
              <small class="text-center block w-full">
                <b>Tip:</b> You can also paste images
              </small>
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
                <b-icon left name="mdi mdi-tray-arrow-up"></b-icon>Upload Short
              </b-btn>
            </div>
          </transition>
        </div>
        <template #footer></template>
      </b-card>
    </b-modal>

    <b-modal v-model="short.video.show" width="50vw">
      <short-video-uploader @close="short.video.show = false" :user="user" />
    </b-modal>
    <b-modal v-model="short.poll.show" width="500px">
      <short-poll-wizard @close="short.poll.show = false" :user="user" />
    </b-modal>
    <sl-dialog
      @sl-request-close="settings.modal = false"
      :open="settings.modal"
      :label="settingsHeading[settings.index]"
      style="--width: 750px"
    >
      <sl-tab-group placement="start">
        <template v-for="(heading, i) in settingsHeading" :key="heading">
          <sl-tab
            @click="settings.index = i"
            slot="nav"
            :panel="heading.toLowerCase()"
          >
            <sl-icon :name="settingsIcons[i]" class="mr-5"></sl-icon>
            {{ heading }}
          </sl-tab>
        </template>
        <sl-tab-panel name="appearance">
          <div>
            <b-flex>
              <span>Light Mode</span>
              <b-spacer></b-spacer>
              <sl-switch
                :checked="settings.data.lightMode"
                v-on:sl-change="
                  ($event) => {
                    settings.data.lightMode = $event.target.checked;
                    updateSettings();
                  }
                "
              ></sl-switch>
            </b-flex>
            <b-flex>
              <span>Theme Color</span>
              <b-spacer></b-spacer>
              <sl-color-picker
                id="themeColorPicker"
                hoist
                :value="settings.data.themeColor"
                @sl-change="
                  settings.data.themeColor = $event.target.value;
                  applySettings();
                "
                label="Select a color"
              ></sl-color-picker>
            </b-flex>
            <transition name="fade">
              <b-flex
                v-if="
                  user.settings?.themeColor &&
                  settings.data.themeColor != user.settings.themeColor
                "
              >
                <span>You've changed a setting</span>
                <b-spacer></b-spacer>
                <sl-button
                  @click="
                    settings.data.themeColor = user.settings.themeColor;
                    applySettings();
                  "
                  >Cancel</sl-button
                >
                <sl-button variant="primary" @click="updateSettings()"
                  >Save</sl-button
                >
              </b-flex>
            </transition>

            <b-flex>
              <span>Message UI</span>
              <b-spacer></b-spacer>
              <sl-select
                :value="settings.data.messagesSimpleMode ? 'simple' : 'text'"
              >
                <sl-menu-item
                  @click="
                    settings.data.messagesSimpleMode = true;
                    updateSettings();
                  "
                  value="simple"
                  >Simple</sl-menu-item
                >
                <sl-menu-item
                  @click="
                    settings.data.messagesSimpleMode = false;
                    updateSettings();
                  "
                  value="text"
                  >Text</sl-menu-item
                >
              </sl-select>
            </b-flex>
          </div>
        </sl-tab-panel>
        <sl-tab-panel name="account">
          <div class="w-2/3 center">
            <b-avatar
              class="center"
              :src="userInfo.data.avatar"
              :username="userInfo.data.username || ''"
              :size="75"
            ></b-avatar>
            <sl-button
              @click="uploadAvatar()"
              icon
              class="center mt-2 mb-2 w-max block"
              outline
              size="small"
            >
              <sl-icon name="pencil-square"></sl-icon>
              Change
            </sl-button>
            <sl-input
              v-model="userInfo.data.username"
              placeholder="Username"
              label="User Name"
            ></sl-input>

            <sl-textarea
              v-model="userInfo.data.description"
              placeholder="Description"
              label="Description"
            ></sl-textarea>
            <br />
            <b-flex>
              <b-spacer></b-spacer>
              <sl-button
                @click="updateSettings()"
                :loading="settings.button.loading"
                variant="primary"
              >
                {{ settings.button.text }}
              </sl-button>
            </b-flex>
          </div> </sl-tab-panel
        ><sl-tab-panel name="chat">
          <b-flex>
            <span>Show Exact Time</span>
            <b-spacer></b-spacer>
            <sl-switch
              :checked="settings.data.showExactTime"
              v-on:sl-change="
                ($event) => {
                  settings.data.showExactTime = $event.target.checked;
                  updateSettings();
                }
              "
            ></sl-switch>
          </b-flex>
          <b-flex>
            <div class="flex flex-col">
              <span>Double click reaction</span>
              <small style="margin-left: 0">{{
                "Current emoji: " + settings.data.likeEmoji.native
              }}</small>
            </div>
            <b-spacer></b-spacer>
            <sl-dropdown placement="left" skidding="90" ref="likeEmojiModal">
              <sl-button slot="trigger">Change</sl-button>
              <div>
                <Picker
                  id="likeEmojiPicker"
                  color="#286ef1"
                  autofocus
                  size="15"
                  title="Pick a Reaction…"
                  emoji="point_up"
                  :data="emojiIndex"
                  set="apple"
                  @select="setNewLikeEmoji"
                />
              </div>
            </sl-dropdown>
          </b-flex>
          <p class="text-sm opacity-75 pl-2 block mb-0 w-11/12">
            When you double click a message, we'll add this emoji as your
            reaction
          </p></sl-tab-panel
        ><sl-tab-panel name="notifications">
          <div v-show="!settings.notificationGranted">
            <span>We need your permission to send notifications</span>
            <br />
            <br />
            <sl-button
              style="margin-inline: 15%"
              class="w-3/4 center"
              variant="primary"
              @click="askNotificationPermission()"
              >Give Permission</sl-button
            >
          </div>
          <div v-show="settings.notificationGranted">
            <b-flex>
              <span>Enable Notifications</span>
              <b-spacer></b-spacer>
              <sl-switch
                :checked="settings.data.notification.enabled"
                v-on:sl-change="
                  ($event) => {
                    settings.data.notification.enabled = $event.target.checked;
                    updateSettings();
                  }
                "
              ></sl-switch>
            </b-flex>
            <b-flex v-show="settings.data.notification.enabled">
              <span>Notifications for a new message</span>
              <b-spacer></b-spacer>
              <sl-switch
                :checked="settings.data.notification.newMessage"
                v-on:sl-change="
                  ($event) => {
                    settings.data.notification.newMessage =
                      $event.target.checked;
                    updateSettings();
                  }
                "
              ></sl-switch>
            </b-flex>
            <b-flex v-show="settings.data.notification.enabled">
              <span>Enable Meeting Notifications</span>
              <b-spacer></b-spacer>
              <sl-switch
                :checked="settings.data.notification.meetingNotifcations"
                v-on:sl-change="
                  ($event) => {
                    settings.data.notification.meetingNotifcations =
                      $event.target.checked;
                    updateSettings();
                  }
                "
              ></sl-switch>
            </b-flex></div></sl-tab-panel
        ><sl-tab-panel name="sounds">
          <b-flex>
            <span>Ringtones for Meeting Invites</span>
            <b-spacer></b-spacer>
            <sl-switch
              :checked="settings.data.ringtoneForMeetingInvite"
              v-on:sl-change="
                ($event) => {
                  settings.data.ringtoneForMeetingInvite =
                    $event.target.checked;
                  updateSettings();
                }
              "
            ></sl-switch> </b-flex></sl-tab-panel
        ><sl-tab-panel name="about">
          <h4 class="my-0 pt-2">Cache</h4>
          <p v-if="getLastUpdatedTime">{{ getLastUpdatedTime }}</p>
          <p>
            <b-flex bare>
              <span>Force Update</span>
              <sl-button class="-my-9 ml-5" @click="clearCache()" size="small"
                >Clear Cache</sl-button
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
          </p></sl-tab-panel
        >
      </sl-tab-group>
    </sl-dialog>

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
            <b-btn @click="groupInfo.modal = false" icon ghost>
              <b-icon name="mdi mdi-close"></b-icon>
            </b-btn>
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
          >
            <b-icon name="mdi mdi-camera" left></b-icon>Change
          </b-btn>
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
              >Update</b-btn
            >
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
              alt
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
              alt
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
                      >{{ option.name }}</b-btn
                    >
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
        <br />The messages you sent will not be deleted
        <p>Are you sure you want to leave this group?</p>
        <br />
        <template v-slot:float>
          <b-flex>
            <b-spacer></b-spacer>
            <b-btn @click="leaveGroup = false">Cancel</b-btn>
            <b-btn
              color="danger"
              :loading="leavingGroup"
              @click="leaveGroupFunction()"
              >Leave</b-btn
            >
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
            <b-btn @click="archiveGroup = false">Cancel</b-btn>
            <b-btn
              color="danger"
              :loading="leavingGroup"
              @click="archiveGroupFunction()"
              >Archive</b-btn
            >
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
          <br />
        </template>
        <template v-slot:footer>
          <b-flex>
            <b-spacer></b-spacer>
            <b-btn @click="createTag.show = false">Cancel</b-btn>
            <b-btn color="primary" @click="createTagFunction()">Create</b-btn>
          </b-flex>
        </template>
      </b-card>
    </b-modal>
    <sl-dialog
      :open="newChat.modal"
      @sl-after-hide="newChat.modal = false"
      label="New Chat"
      class="dialog-overview"
    >
      <sl-tab-group class="centered">
        <sl-tab slot="nav" panel="new-chat" :active="newChat.tabIndex == 0"
          >New Chat</sl-tab
        >
        <sl-tab slot="nav" panel="join-group" :active="newChat.tabIndex == 1"
          >Join Group</sl-tab
        >
        <sl-tab slot="nav" panel="new-group" :active="newChat.tabIndex == 2"
          >Create Group</sl-tab
        >

        <sl-tab-panel name="new-chat" :active="newChat.tabIndex == 0">
          <sl-input
            class="center"
            label="Email ID"
            type="email"
            v-model="newChat.data.personal.email"
            placeholder="Email of the user you want to chat with"
          ></sl-input>
          <br />
          <b-flex>
            <b-spacer></b-spacer>
            <sl-button
              :disabled="!newChat.data.personal.email"
              :loading="newChat.data.personal.loading"
              @click="createPersonalChat()"
              variant="primary"
              >Create Chat</sl-button
            >
          </b-flex>
        </sl-tab-panel>
        <sl-tab-panel name="join-group" :active="newChat.tabIndex == 1">
          <sl-input
            class="center"
            label="Group ID"
            v-model="newChat.data.group.id"
            placeholder="Enter the group ID you want to join"
          ></sl-input>
          <br />
          <b-flex>
            <b-spacer></b-spacer>
            <sl-button
              @click="joinGroup()"
              :disabled="!newChat.data.group.id"
              :loading="newChat.data.group.loading"
              variant="primary"
              >Join Chat</sl-button
            >
          </b-flex></sl-tab-panel
        >
        <sl-tab-panel name="new-group" :active="newChat.tabIndex == 2">
          <sl-input
            label="Group Name"
            v-model="newChat.data.newGroup.name"
            placeholder="My Awesome Group"
          ></sl-input>
          <sl-textarea
            label="Group Description"
            v-model="newChat.data.newGroup.description"
            placeholder="This group is awesome"
          ></sl-textarea>
          <br />
          <b-flex>
            <b-spacer></b-spacer>
            <sl-button
              :disabled="
                !newChat.data.newGroup.name ||
                !newChat.data.newGroup.description
              "
              :loading="newChat.data.newGroup.loading"
              @click="createGroupChat()"
              variant="primary"
              >Create Group</sl-button
            >
          </b-flex></sl-tab-panel
        >
      </sl-tab-group>
    </sl-dialog>
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
                    chat?.tags &&
                    chat?.assignedTags[userId] &&
                    chat?.tags[chat.assignedTags[userId]] &&
                    chat?.tags[chat.assignedTags[userId]]?.name
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
                            </h5>
                          </b-flex>
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
