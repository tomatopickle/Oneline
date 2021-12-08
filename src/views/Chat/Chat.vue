<template>
  <b-app :loading="loading">
    <template v-slot:prepend>
      <b-sidebar id="contacts" width="250px">
        <template v-slot:header>
          <b-flex>
            <div class="font-normal">Oneline</div>
            <b-spacer></b-spacer>
            <b-btn icon ghost @click="settings.modal = true"
              ><b-icon name="mdi mdi-cog"></b-icon
            ></b-btn>
          </b-flex>
        </template>
        <div>
          <br />
          <b-list class="border-0 p-0 m-0" style="margin: -19px">
            <template v-slot:header>
              <b-flex class="pl-4 pr-1">
                <h4 class="m-0">Chats</h4>
                <b-spacer></b-spacer>
                <b-btn @click="newChat.modal = true" icon color="primary" ghost>
                  <b-icon name="mdi mdi-plus"></b-icon
                ></b-btn>
              </b-flex>
            </template>
            <b-input ghost placeholder="Search" class="w-11/12 center">
              <template v-slot:inner-prepend>
                <b-icon name="mdi mdi-magnify"></b-icon>
              </template>
            </b-input>
            <template v-for="(chat, i) in chats" :key="i">
              <b-list-item
                clickable
                v-on:click="openChat(chat)"
                class="contact"
              >
                <b-flex>
                  <b-avatar
                    :size="35"
                    :username="chat.name"
                    :src="chat?.src"
                  ></b-avatar>
                  <span>{{ chat.name }}</span>
                </b-flex>
              </b-list-item>
            </template>
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
    <div class="flex flex-col h-full">
      <b-nav
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
      <div
        @scroll="checkIfScrolledToTop($event)"
        class="flex-grow overflow-y-scroll overflow-x-hidden"
        id="msgs"
      >
        <chat-window
          :limit="limit"
          :messages="messages"
          :user="user"
          :chat="chat"
        ></chat-window>
      </div>
      <div id="msgInp">
        <b-card class="w-full mr-0 max-w-full">
          <transition name="fade" :duration="{ enter: 200, leave: 300 }">
            <Picker
              v-show="emoji"
              color="#286ef1"
              autoFocus
              id="emojiPicker"
              title="Pick your emoji…"
              emoji="point_up"
              :data="emojiIndex"
              set="apple"
              @select="addedEmoji"
            />
          </transition>
          <transition name="fade" :duration="{ enter: 200, leave: 300 }">
            <div id="typingBar" v-if="typing.length != 0">
              <span v-for="username in typing" :key="username">{{
                username == this.user.username ? "You" : username
              }}</span>
              typing...
            </div>
          </transition>
          <b-flex class="m-0 p-0">
            <b-btn class="-mr-2 ml-1" ghost icon color="primary">
              <b-icon name="mdi mdi-plus"></b-icon>
            </b-btn>
            <b-textarea
              @keypress="checkIfUserTyping()"
              @keyup="checkEnterKey($event)"
              v-model="message.text"
              class="font-normal w-full flex-grow"
              placeholder="Your Message"
            >
            </b-textarea>
            <b-btn ghost icon class="-ml-3" @click="emoji = !emoji">
              <b-icon name="mdi mdi-emoticon"></b-icon>
            </b-btn>
            <div>
              <transition name="fade" mode="out-in" :duration="200">
                <b-btn
                  v-if="message.text"
                  icon
                  color="primary"
                  @click="sendMessage()"
                >
                  <b-icon name="mdi mdi-send"></b-icon>
                </b-btn>
                <b-btn v-else icon color="primary">
                  <b-icon name="mdi mdi-microphone"></b-icon>
                </b-btn>
              </transition>
            </div>
          </b-flex>
        </b-card>
      </div>
    </div>
    <b-modal width="500px" v-model="settings.modal">
      <b-card>
        <template v-slot:header>
          <b-flex>
            <h4 class="mt-0 mb-0">Settings</h4>
            <b-spacer></b-spacer>
            <b-btn @click="settings.modal = false" icon ghost>
              <b-icon name="mdi mdi-close"> </b-icon>
            </b-btn>
          </b-flex>
        </template>
        <br />
        <p>Settings will come soon</p>
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
          class="w-9/12 center"
          :tabs="newChat.tabs"
          v-model="newChat.tabIndex"
        ></b-tab>
        <br />
        <b-tab-content v-model="newChat.tabIndex" :tabs="newChat.tabs">
          <template v-slot:0>
            <p>
              <b-input
                class="w-10/12 center"
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
                class="w-10/12 center"
                label="Group ID"
                v-model="newChat.data.group.id"
                placeholder="Enter the group ID you want to join"
              ></b-input>
              <br />
              <b-flex>
                <b-spacer></b-spacer>
                <b-btn :loading="newChat.data.group.loading" color="primary"
                  >Join Chat</b-btn
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
              <b-btn @click="chatInfo = false" icon ghost
                ><b-icon name="mdi mdi-close"></b-icon
              ></b-btn>
            </b-flex>
          </template>
          <div>
            <br />
            <b-avatar class="center" :username="chat.name || ''"></b-avatar>
            <h4 class="text-center">{{ chat.name }}</h4>
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
