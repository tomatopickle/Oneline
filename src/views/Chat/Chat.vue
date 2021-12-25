<template>
  <b-app :loading="loading">
    <template v-slot:prepend>
      <b-sidebar id="contacts" width="250px">
        <template v-slot:header>
          <b-flex class="m-0" style="margin-left: -15px">
            <img class="h-10" src="../../assets/logos/logo.png" alt="Logo" />
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
        v-on:scroll="checkIfScrolledToTop($event)"
        class="flex-grow overflow-y-scroll overflow-x-hidden"
        id="msgs"
      >
        <chat-window
          :limit="limit"
          :messages="messages"
          :user="user"
          :chat="chat"
          :enableScroll="enableScroll"
        ></chat-window>
        <transition name="fadeUp">
          <b-btn
            v-if="scrollDownBtn"
            icon
            glass
            @click="scrollDown()"
            color="primary"
            id="scrollDownButton"
          >
            <b-icon name="mdi mdi-chevron-down"></b-icon>
          </b-btn>
        </transition>
      </div>
      <div id="msgInp">
        <b-card class="w-full mr-0 max-w-full">
          <transition name="fade" :duration="{ enter: 200, leave: 300 }">
            <div id="typingBar" v-if="checkIfUsersAreTyping">
              <span v-for="username in typing" :key="username">{{
                username == this.user.username ? "You" : username
              }}</span>
              typing...
            </div>
          </transition>
          <b-flex class="m-0 p-0" bare>
            <b-btn class="-mr-2 ml-1" ghost icon color="primary">
              <b-icon name="mdi mdi-plus"></b-icon>
            </b-btn>
            <b-textarea
              ghost
              v-on:keypress="checkIfUserTyping()"
              v-on:keyup="checkEnterKey($event)"
              v-model="message.text"
              class="font-normal w-full flex-grow"
              placeholder="Your Message"
            >
            </b-textarea>
            <Popper
              style="border: none !important"
              position="top"
              offsetSkid="25px"
            >
              <b-btn ghost icon class="-ml-3" id="emojiBtn">
                <b-icon name="mdi mdi-emoticon"></b-icon>
              </b-btn>
              <template #content>
                <div>
                  <Picker
                    color="#286ef1"
                    autoFocus
                    title="Pick your emoji…"
                    emoji="point_up"
                    :data="emojiIndex"
                    set="apple"
                    @select="addedEmoji"
                  /></div
              ></template>
            </Popper>
            <div>
              <Popper
                style="border: none !important"
                position="top"
                offsetSkid="25px"
              >
                <b-btn ghost icon style="margin-left: 15px;margin-right:15px" @click="getGifs()">
                  <b-icon size="25px">
                    <svg
                      width="100%"
                      style="height: 29px;margin: auto;display: block;margin-bottom: 5px;"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 30 30"
                    >
                      <path
                        fill="currentColor"
                        d="M 6 5 C 3.8034768 5 2 6.8034768 2 9 L 2 21 C 2 23.196523 3.8034768 25 6 25 L 24 25 C 26.196523 25 28 23.196523 28 21 L 28 9 C 28 6.8034768 26.196523 5 24 5 L 6 5 z M 9.8867188 11.046875 C 11.666719 11.046875 12.975312 12.075625 13.195312 13.640625 L 11.628906 13.640625 C 11.394906 12.878625 10.762719 12.435547 9.8867188 12.435547 C 8.6707187 12.435547 7.9238281 13.401422 7.9238281 14.982422 C 7.9238281 16.595422 8.7072188 17.576172 9.9492188 17.576172 C 10.982219 17.576172 11.697516 16.964641 11.728516 16.056641 L 11.732422 15.921875 L 10.099609 15.921875 L 10.099609 14.736328 L 13.261719 14.736328 L 13.261719 15.697266 C 13.261719 17.711266 11.977875 18.964844 9.921875 18.964844 C 7.683875 18.964844 6.3105469 17.461047 6.3105469 14.998047 C 6.3105469 12.571047 7.6947187 11.046875 9.8867188 11.046875 z M 14.779297 11.240234 L 16.355469 11.240234 L 16.355469 18.771484 L 14.779297 18.771484 L 14.779297 11.240234 z M 18.185547 11.240234 L 23 11.240234 L 23 12.587891 L 19.761719 12.587891 L 19.761719 14.548828 L 22.824219 14.548828 L 22.824219 15.837891 L 19.761719 15.837891 L 19.761719 18.771484 L 18.185547 18.771484 L 18.185547 11.240234 z"
                      ></path>
                    </svg>
                  </b-icon>
                </b-btn>
                <template #content>
                  <div>
                   <b-card glass height="75vh" width="350px" style="overflow-y:auto;" :loading="gif.loading" id="gifsPanel"> 
                     <template #header>
                       <b-input @keyup="searchGifs($event)" placeholder="Search" v-model="gif.search"></b-input>
                     </template>
                     <div class="grid-3"> 
                       <transition-group name="fadeUp" tag="div">
                       <div v-for="(gif,i) in gif.gifs" :key="i" class="gif  col" v-on:click="sendGif(gif)">
                         <img width="100px"
                          loop autoplay :src="gif.images.original.webp" />
                       </div>
                       </transition-group>
                     </div>
                   </b-card>
                   </div
                ></template>
              </Popper>
            </div>
            <div>
              <transition name="fade" mode="out-in" :duration="200">
                <b-btn
                  style="margin-left: 10px"
                  v-if="message.text"
                  icon
                  color="primary"
                  @click="sendMessage()"
                >
                  <b-icon name="mdi mdi-send"></b-icon>
                </b-btn>
                <b-btn style="margin-left: 10px" v-else icon color="primary">
                  <b-icon name="mdi mdi-microphone"></b-icon>
                </b-btn>
              </transition>
            </div>
          </b-flex>
        </b-card>
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
          </b-nav-panel></template
        >
        <b-card bare height="275px" width="100%">
          <b-tab-content v-model="settings.index">
            <template v-slot:0>
              <b-flex>
                <span>Light Mode</span>
                <b-spacer></b-spacer>
                <b-switch v-model="settings.data.lightMode"></b-switch>
              </b-flex>
            </template>
          </b-tab-content>
          <template #footer>
            <b-flex style="height: max-content">
              <b-spacer></b-spacer>
              <b-btn @click="applySettings()"> Apply </b-btn>
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
              <b-btn @click="chatInfo = false" icon ghost
                ><b-icon name="mdi mdi-close"></b-icon
              ></b-btn>
            </b-flex>
          </template>
          <div>
            <b-avatar class="center" :username="chat.name || ''"></b-avatar>
            <h4 class="text-center">{{ chat.name }}</h4>
            <div class="center">
              <h5 class="text-center">
                <span>Group ID: </span><span>{{ chat.id }}</span>
              </h5>
              <b-btn block size="small" @click="groupInfo.modal = true">
                Edit Group Info</b-btn
              >
              <b-btn block size="small"> Copy Invite Link </b-btn>
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
