/* eslint-disable */
import db from "../../fire.js";
import { ref, set, get, child, onValue, update, limitToLast, query, startAt } from "firebase/database";
import { nanoid } from "nanoid";
import router from "../../router";
import ChatWindow from "./ChatWindow/ChatWindow";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";
import EmojiConvertor from "emoji-js";
let emojiConvertor = new EmojiConvertor();
emojiConvertor.allow_native = true;
emojiConvertor.replace_mode = 'unified';

let emojiIndex = new EmojiIndex(data);
let searchTimeout;
export default {
    name: "App",
    components: { ChatWindow, Picker },
    data: () => {
        return {
            emoji: false,
            emojiIndex: emojiIndex,
            emojisOutput: "",
            user: {},
            chats: [],
            chatInfo: false,
            chat: {},
            limit: 25,
            messages: [],
            settings: { modal: false },
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
                ],
                tabIndex: 0,
                data: {
                    personal: {
                        email: "",
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
            this.loading = false;
            this.getChats();
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
        }
    },
    methods: {
        addedEmoji(emoji) {
            this.message.text += emoji.native;
        },
        changeToEmoji(text) {
            return checkText(text)
        },
        // The controlled arg is used for functions calling this method, like the scrolled top function
        openChat(chat, controlled) {
            if (!controlled) {
                this.limit = 25;
            }
            onValue(query(ref(db, `messages/${chat.id}/messages`), limitToLast(this.limit)), (snapshot) => {
                var data = snapshot.val();
                this.chat = chat;
                this.members = [];
                this.typing = [];
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
                                this.typing.push(user.user.username);
                            } else if ((!user?.typing) && this.chat.id == user?.chat) {
                                this.typing.forEach((usr, i) => {
                                    if (usr == user.user.username) {
                                        this.typing.splice(i, 1);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        },
        getChats() {
            var chats = JSON.parse(JSON.stringify(this.user.chats));
            for (var id in chats) {
                const chat = this.user.chats[id];
                if (chat.type == "personal") {
                    this.user.chats[id].members.forEach((usr) => {
                        if (usr != this.user.id) {
                            get(ref(db, `users/${usr}`)).then((snapshot) => {
                                if (snapshot.exists()) {
                                    var data = snapshot.val();
                                    this.chats.push({ name: data.username, id: chat.id, data: data });
                                } else {
                                    alert(
                                        "Error: User not found while loading contacts, this is a Oneline problem, please contact Abaan"
                                    );
                                }
                            });
                        }
                    });
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
                this.openChat(this.chat, true);
            }
        },
        checkIfUserTyping() {
            update(child(ref(db), `typing/${this.user.id}`), { chat: this.chat.id, typing: true, user: this.user });
            if (searchTimeout != undefined) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                update(child(ref(db), `typing/${this.user.id}`), { chat: this.chat.id, typing: false, user: this.user });
            }, 500);
        }
    }
}