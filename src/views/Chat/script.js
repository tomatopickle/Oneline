/* eslint-disable */
import db from "../../fire.js";
import { ref, set, get, child, onValue, update, limitToLast, query, startAt } from "firebase/database";
import { nanoid } from "nanoid";
import router from "../../router";
import sortJson  from "sort-json";

import ChatWindow from "./ChatWindow/ChatWindow";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";
import EmojiConvertor from "emoji-js";
let emojiConvertor = new EmojiConvertor();
emojiConvertor.allow_native = true;
emojiConvertor.replace_mode = 'unified';
import axios from "axios";
let emojiIndex = new EmojiIndex(data);
let searchTimeout;
export default {
    name: "App",
    components: { ChatWindow, Picker },
    data: () => {
        return {
            enableScroll: false,
            emoji: false,
            emojiIndex: emojiIndex,
            emojisOutput: "",
            user: {},
            settingsHeading: ["Appearance"],
            chats: [],
            chatInfo: false,
            chat: {},
            gif: {
                gifs: [],
                search: "",
                loading: true
            },
            groupInfo: {
                modal: false,
                loading: false,
                data: {
                    name: "",
                    description: ""
                }
            },
            scrollDownBtn: false,
            limit: 25,
            messages: [],
            settings: {
                modal: false,
                button: {
                    text: "Save",
                    color: "primary",
                    check: false
                },
                index: 0,
                data: {
                    lightMode: false
                }
            },
            loading: true,
            typing: [],
            members: [],
            message: {
                text: ""
            },
            newChat: {
                modal: false,
                tabs: [
                    { name: "Personal", value: "personal" },
                    { name: "Group", value: "grp" },
                    { name: "New Group", value: "newGrp" }
                ],
                tabIndex: 0,
                data: {
                    personal: {
                        email: "",
                        loading: false
                    },
                    newGroup: {
                        name: "",
                        description: "",
                        loading: false
                    },
                    group: {
                        id: "",
                        loading: false
                    }
                }
            },
            opnChat: (chat) => {
                app.openChat(chat);
            }
        };
    },
    mounted() {
        onValue(child(ref(db), `users/${localStorage.getItem("id")}`), (snapshot) => {
            const data = snapshot.val();
            console.log(data);
            if (!data) {
                router.push("login");
            }
            this.user = data;
            console.log(data)
            this.loading = false;
            window.addEventListener('beforeunload', (event) => {
                update(child(ref(db), `users/${this.user.id}`), { lastOnline: Date.now() });
            });
            this.getChats();
            for (var key in this.user.settings) {
                if (!this.user?.settings[key]) return
                this.settings.data[key] = this.user?.settings[key];
            }
            this.applySettings();
            // Checking if a new contact is made
            if (Object.keys(data?.chats).length != Object.keys(this.user?.chats).length) {
                this.$notify("New Chat Added");
            }
        });
    },
    computed: {
        emojiDataAll() {
            return EmojiAllData;
        },
        emojiGroups() {
            return EmojiGroups;
        },
        checkIfUsersAreTyping() {
            return Object.keys(this.typing).length != 0
        }
    },
    methods: {
        addedEmoji(emoji) {
            this.message.text += emoji.native;
        },
        changeToEmoji(text) {
            return checkText(text)
        },
        getGifs() {
            this.gif.loading = true;
            axios.get(`https://api.giphy.com/v1/gifs/trending?rating=g&api_key=${process.env.VUE_APP_GIPHY_KEY}`, {})
                .then((response) => {
                    // handle success
                    console.log(response);
                    this.gif.gifs = response.data.data;
                    this.gif.loading = false;

                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                });
        },
        searchGifs(e) {
            if (e.key != 'Enter') return
            if (!this.gif.search) {
                this.getGifs();
            }
            this.gif.loading = true;
            // Restting the gif list will prevent the mix up of trending and searched gifs
            this.gif.gifs = [];

            axios.get(`https://api.giphy.com/v1/gifs/search?rating=g&api_key=${process.env.VUE_APP_GIPHY_KEY}&q=${this.gif.search}`, {})
                .then((response) => {
                    // handle success
                    console.log(response);
                    this.gif.gifs = response.data.data;
                    this.gif.loading = false;

                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                });
        },
        sendGif(gif) {
            console.log(gif);
            update(child(ref(db), `messages/${this.chat.id}/messages/${Date.now()}`), { src: gif.images.fixed_height.webp, title: gif.title, sender: this.user.id, time: Date.now(), type: "gif" });
        },
        changeGroupInfo() {
            this.groupInfo.loading = true;
            axios.post('https://oneline-functions.abaanshanid.repl.co/group/update', { id: this.chat.id, name: this.groupInfo.data.name, description: this.groupInfo.data.description })
                .then((response) => {
                    // handle success
                    console.log(response);
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                })
                .then(() => {
                    this.groupInfo.loading = false;

                });
        },
        // The controlled arg is used for functions calling this method, like the scrolled top function
        openChat(chat, controlled) {
            if (!controlled) {
                this.limit = 25;
            }
            onValue(query(ref(db, `messages/${chat.id}/messages`), limitToLast(this.limit)), (snapshot) => {
                var data = snapshot.val();
                this.chat = chat;
                this.groupInfo.data.name = chat?.name;
                this.groupInfo.data.description = chat?.description;
                this.members = [];
                this.typing = {};
                this.messages = data || {};
                for (var userIndex in this.user.chats[chat.id].members) {
                    var userId = this.user.chats[chat.id].members[userIndex];
                    get(ref(db, `users/${userId}`)).then((snapshot) => {
                        if (snapshot.exists()) {
                            var member = snapshot.val();
                            this.members.push(member);
                        }
                    });
                    onValue((child(ref(db), `typing/${userId}`)), (snapshot) => {
                        if (snapshot.exists()) {
                            var user = snapshot.val();
                            if ((user?.typing) && this.chat.id == user?.chat) {
                                this.typing[userId] = user.user.username;
                            } else if ((!user?.typing) && this.chat.id == user?.chat) {
                                delete this.typing[userId];
                            }
                        }
                    });
                }
            });
        },
        getChats() {
            this.chats = {};
            var chats = JSON.parse(JSON.stringify(this.user.chats));
            let i = 0;
            for (var id in chats) {
                i++;
                const chat = this.user.chats[id];
                // I added const chatId = id; coz the id var changes with the loop and the callback functions only get the last id
                if (chat.type == "personal") {
                    const chatId = id;

                    this.user.chats[chatId].members.forEach((usr) => {
                        if (usr != this.user.id) {
                            get(ref(db, `users/${usr}`)).then((snapshot) => {
                                if (snapshot.exists()) {
                                    var data = snapshot.val();
                                    onValue(query(ref(db, `messages/${chatId}/messages`), limitToLast(1)), (snapshot) => {
                                        var lastMessage = snapshot.val();
                                        this.chats[chatId] = { name: data.username, id: chat.id, data: data, lastMessageTime: (new Date(lastMessage[Object.keys(lastMessage)[0]]?.time)) };
                                    });
                                } else {
                                    alert(
                                        "Error: User not found while loading contacts, this is a Oneline problem, please contact Abaan"
                                    );
                                }
                            });
                        }
                    });
                } else {
                    const chatId = id;
                    onValue(query(ref(db, `messages/${id}/messages`), limitToLast(1)), (snapshot) => {
                        var lastMessage = snapshot.val();
                        this.chats[chatId] = { name: chat.name, id: chat.id, description: chat.description, lastMessageTime: (new Date(lastMessage[Object.keys(lastMessage)[0]]?.time)) };

                    });
                }
                if (i == Object.keys(this.user.chats).length) {
                    console.log(sortJson(this.chats, { ignoreCase: true, depth: 1}))
                    console.log("Sorted")
                }
            }
        },
        createPersonalChat() {
            this.newChat.data.personal.loading = true;
            var chatId = nanoid(15);
            get(child(ref(db), `users`))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        var data = snapshot.val();
                        for (var usr in data) {
                            usr = data[usr];
                            const chat = {
                                id: chatId,
                                type: "personal",
                                members: [this.user.id, usr.id]
                            };
                            if (usr.email == this.newChat.data.personal.email) {
                                set(ref(db, "messages/" + chatId), chat);
                                update(child(ref(db), `users/${this.user.id}/chats`), { [chatId]: chat });
                                update(child(ref(db), `users/${usr.id}/chats`), { [chatId]: chat });
                                this.newChat.data.personal.loading = false;
                                this.newChat.modal = false;
                            }
                        }
                    } else {
                        alert(
                            "User not found"
                        );
                        this.newChat.data.personal.loading = false;
                    }
                });

        },
        createGroupChat() {
            this.newChat.data.newGroup.loading = true;
            var chatId = nanoid(15);
            const chat = {
                id: chatId,
                name: this.newChat.data.newGroup.name,
                description: this.newChat.data.newGroup.description,
                type: "group",
                members: [this.user.id]
            };
            set(ref(db, "messages/" + chatId), chat);
            update(child(ref(db), `users/${this.user.id}/chats`), { [chatId]: chat });
            this.newChat.data.newGroup.loading = false;
            this.newChat.modal = false;

        },
        joinGroup() {
            get(child(ref(db), "messages/" + this.newChat.data.group.id))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        var data = snapshot.val();
                        delete data.messages;
                        console.log(data);
                        const chat = data;
                        update(child(ref(db), `users/${this.user.id}/chats`), { [data.id]: chat });
                        this.newChat.data.group.loading = false;
                        this.newChat.modal = false;
                    } else {
                        alert(
                            "Group not found"
                        );
                        this.newChat.data.group.loading = false;
                    }
                });
        },
        sendMessage() {
            if (this.message.text.trim().length < 1) return
            update(child(ref(db), `messages/${this.chat.id}/messages/${Date.now()}`), { text: emojiConvertor.replace_colons(this.message.text), sender: this.user.id, time: Date.now() });
            this.message.text = "";
        },
        checkEnterKey(e) {
            if (e.key == 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        },
        checkIfScrolledToTop(e) {
            if (e.target.scrollTop == 0) {
                this.limit = this.limit + 25;
                this.enableScroll = false;
                this.openChat(this.chat, true);
            } else if (e.target.scrollTop === (e.target.scrollHeight - e.target.offsetHeight)) {
                this.enableScroll = true;
            }
            this.scrollDownBtn = ((e.target.scrollTop + 75) < (e.target.scrollHeight - e.target.offsetHeight));
        },
        checkIfUserTyping() {
            update(child(ref(db), `typing/${this.user.id}`), { chat: this.chat.id, typing: true, user: this.user });
            if (searchTimeout != undefined) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                update(child(ref(db), `typing/${this.user.id}`), { chat: this.chat.id, typing: false, user: this.user });
            }, 500);
        },
        updateSettings() {
            // this.settings.loading = true;
            set(ref(db, `users/${this.user.id}/settings`), this.settings.data);
            this.settings.button.text = "Saved";
            this.settings.button.color = "success";
            this.settings.button.check = true;
            setTimeout(() => {
                this.settings.button.text = "Save";
                this.settings.button.color = "primary";
                this.settings.button.check = false;
            }, 1000);
            this.applySettings();
        },
        applySettings() {
            const settingsData = this.settings.data;
            if (settingsData?.lightMode) {
                this.$toggleTheme();
            } else {
                document.querySelector("html").classList.add("dark");
            }
        },
        scrollDown() {
            this.enableScroll = true;
            var el = document.getElementById("msgs");
            el.scrollTop = el.scrollHeight;
        }
    }
}