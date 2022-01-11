/* eslint-disable */
import axios from "axios";
import db from "../../fire.js";
import { storage } from "../../fire.js";
import { ref, set, get, remove, child, onValue, update, limitToLast, query, onDisconnect, onChildAdded } from "firebase/database";
import { nanoid } from "nanoid";
import router from "../../router";
import stringify from "json-stable-stringify";
import ChatWindow from "./ChatWindow/ChatWindow";
import ChatWindowSimple from "./ChatWindowSimple/ChatWindowSimple";
import ContentEditableDiv from "./ContentEditableDiv/ContentEditableDiv";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex, Emoji } from "emoji-mart-vue-fast/src";
import EmojiConvertor from "emoji-js";
import { ref as storageRef, getDownloadURL, uploadBytes } from "firebase/storage";
import recordAudio from "./scripts/recordAudio.js";
import Player from '../../components/Player/Player.vue';
// Variables for emoji search and display
let emojiConvertor = new EmojiConvertor();
emojiConvertor.allow_native = true;
emojiConvertor.replace_mode = 'unified';
let userTypedColon = false;
let emojiQuery = "";
let emojiIndex = new EmojiIndex(data);
let searchTimeout;
// Variables for the audio recorder
let audioRecordingTimer;
let audioRecorder;
export default {
    name: "App",
    components: {
        ChatWindow, ContentEditableDiv, ChatWindowSimple, Picker, Emoji, Player
    },
    data: () => {
        return {
            audio: {
                show: false,
                src: ""
            },
            recording: {
                show: false,
                time: {
                    minutes: 0,
                    seconds: 0
                },
                uploading: false
            },
            emojiComplete: {
                emojis: [],
                selectedIndex: 0
            },
            enableScroll: false,
            emoji: false,
            emojiIndex: emojiIndex,
            emojisOutput: "",
            fileUpload: {
                show: false
            },
            downloading: false,
            user: {},
            settingsHeading: ["Appearance", "Chat", "Notifications", "About"],
            chats: {},
            baseUrl: location.href,
            chatInfo: false,
            chat: {},
            windowHidden: false,
            leavingGroup: false,
            gif: {
                gifs: [],
                chips: [],
                search: "",
                recent: { notAvailable: true },
                loading: true,
                searched: false,
                viewingRecent: false
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
            leaveGroup: false,
            messages: [],
            seen: {},
            settings: {
                modal: false,
                button: {
                    text: "Save",
                    color: "primary",
                    check: false
                },
                index: 0,
                notificationGranted: false,
                likeEmojiModal: false,
                data: {
                    lightMode: false,
                    likeEmoji: { "_data": { "name": "Thumbs Up Sign", "unified": "1F44D", "has_img_apple": true, "has_img_google": true, "has_img_twitter": true, "has_img_facebook": true, "keywords": ["thumbs_up", "thumbsup", "yes", "awesome", "good", "agree", "accept", "cool", "hand", "like"], "text": "", "short_names": ["+1", "thumbsup"], "added_in": "6.0", "sheet_x": 13, "sheet_y": 28, "search": "+1,thumbsup,thumbs,up,sign,thumbs_up,yes,awesome,good,agree,accept,cool,hand,like", "skin_tone": 1 }, "_skins": null, "_sanitized": { "id": "+1", "name": "Thumbs Up Sign", "colons": ":+1::skin-tone-1:", "unified": "1f44d", "skin": 1, "native": "👍" }, "id": "+1", "name": "Thumbs Up Sign", "colons": ":+1::skin-tone-1:", "unified": "1f44d", "skin": 1, "native": "👍", "short_names": ["+1", "thumbsup"], "short_name": "+1" },
                    messagesSimpleMode: false,
                    notification: {
                        granted: false,
                        enabled: false,
                        newMessage: false
                    }
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
        this.settings.notificationGranted = Notification.permission == "granted";
        onValue(child(ref(db), `users/${localStorage.getItem("id")}`), (snapshot) => {
            const data = snapshot.val();
            console.log(data);
            if (!data) {
                router.push("login");
            }
            this.user = data;
            console.log(data);
            update(child(ref(db), `status/${this.user.id}`), { status: "online" });
            onDisconnect(child(ref(db), `users/${this.user.id}`)).update({ lastOnline: Date.now() });
            onDisconnect(child(ref(db), `status/${this.user.id}`)).update({ status: "offline" });
            this.loading = false;
            this.getChats();
            if (this.user?.settings) {
                const settings = JSON.parse(JSON.stringify(this.user.settings));
                Object.keys(settings).forEach((key) => {
                    if (!this.user?.settings[key]) return
                    this.settings.data[key] = this.user?.settings[key];

                });
                this.applySettings();

            }
            // Checking if a new contact is made
            if (Object.keys(data?.chats).length != Object.keys(this.user?.chats).length) {
                this.$notify("New Chat Added");
            }
            document.addEventListener("visibilitychange", (e) => {
                this.windowHidden = (document.visibilityState === "hidden");
                if (!this.windowHidden && this.chat.id && this.messages[Object.keys(this.messages)[Object.keys(this.messages).length - 1]].sender != this.user.id) {
                    set(ref(db, "seen/" + this.chat.id), { [this.user.username]: true });
                }
            });
            if (localStorage.getItem("lastOpenedChat")) {
                this.openChat(JSON.parse(localStorage.getItem("lastOpenedChat")));
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
        log(e) {
            console.log(e)
        },
        startRecording() {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(async stream => {
                    this.recording.show = true;
                    audioRecorder = await recordAudio();
                    audioRecorder.start();
                    let sec = 0;
                    function pad(val) { return val > 9 ? val : "0" + val; }
                    audioRecordingTimer = setInterval(() => {
                        this.recording.time.seconds = pad(++sec % 60);
                        this.recording.time.minutes = pad(parseInt(sec / 60, 10));
                    }, 1000);
                });
        },
        async sendRecording() {
            // recordingMediaRecorder.stop();
            const audio = await audioRecorder.stop();
            this.recording.uploading = true;
            console.log(audio);
            const audioBlob = audio.audioBlob;
            var file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
            console.log(file);
            const time = Date.now();
            // setTimeout(() => {
            //     this.recording.uploading = false;
            // }, 1000);
            uploadBytes(storageRef(storage, `messages/${time}`), file).then((snapshot) => {
                console.log('Uploaded a blob or file!');
                console.log(snapshot);
                getDownloadURL(snapshot.metadata.ref).then((url) => {
                    update(child(ref(db), `messages/${this.chat.id}/${time}`), {
                        sender: this.user.id,
                        src: url,
                        time: time,
                        duration: `${this.recording.time.minutes}:${this.recording.time.seconds}`,
                        type: "audio",
                    });
                    // this.clearAudioRecordingVars();
                })
            });
            this.recording.show = false;
        },
        async stopRecording() {
            await audioRecorder.stop();
            this.clearAudioRecordingVars();
            this.recording.show = false;
        },
        clearAudioRecordingVars() {
            clearInterval(audioRecordingTimer);
            audioRecordingTimer = "";
            this.recording.time.seconds = 0;
            this.recording.time.minutes = 0;
        },
        copy(text) {
            const cb = navigator.clipboard;
            cb.writeText(text);
        },
        setNewLikeEmoji(emoji) {
            if (!(typeof emoji == "object")) {
                return;
            }
            emoji = JSON.parse(JSON.stringify(emoji));
            Object.keys(emoji).forEach((key) => {
                if (!emoji[key]) {
                    delete emoji[key]
                }
            })
            this.settings.data.likeEmoji = emoji;
            this.settings.likeEmojiModal = false;
        },
        addedEmoji(emoji) {
            if (!(typeof emoji == "object")) {
                return;
            }
            document.querySelector("#messageInp .editable").innerHTML += emoji.native;
        },
        changeToEmoji(text) {
            return checkText(text)
        },
        getGifs() {
            this.gif.loading = true;
            this.gif.viewingRecent = false;
            this.gif.search = "";
            onValue(query(ref(db, `recent-gifs/${this.user.id}`), limitToLast(4)), (snapshot) => {
                if (snapshot.exists()) {
                    this.gif.recent = JSON.parse(stringify(snapshot.val(), function (a, b) {
                        return a.key < b.key ? 1 : -1;
                    }));
                }
                axios.get(`https://api.giphy.com/v1/gifs/trending?rating=g&api_key=${process.env.VUE_APP_GIPHY_KEY}`, {})
                    .then((response) => {
                        this.gif.gifs = response.data.data;
                        axios.get(`https://api.giphy.com/v1/trending/searches?api_key=${process.env.VUE_APP_GIPHY_KEY}`, {})
                            .then((chips) => {
                                this.gif.chips = chips.data.data;
                                this.gif.chips.length = 7;
                                this.gif.loading = false;
                                this.gif.searched = false;
                            });
                    });
            });
        },
        getAllRecentGifs() {
            this.gif.gifs = [];
            this.gif.viewingRecent = true;
            this.gif.searched = false;
            this.gif.loading = true;
            onValue(query(ref(db, `recent-gifs/${this.user.id}`), limitToLast(25)), (snapshot) => {
                if (snapshot.exists()) {
                    this.gif.recent = JSON.parse(stringify(snapshot.val(), function (a, b) {
                        return a.key < b.key ? 1 : -1;
                    }));
                }
                this.gif.loading = false;
            });
        },
        searchGifs(e, q) {
            if (!q && e?.key != 'Enter') return
            if (!this.gif.search) {
                this.getGifs();
            }
            // Restting the gif list will prevent the mix up of trending and searched gifs
            this.gif.gifs = [];
            this.gif.viewingRecent = false;
            this.gif.searched = true;
            this.gif.loading = true;

            axios.get(`https://api.giphy.com/v1/gifs/search?rating=g&api_key=${process.env.VUE_APP_GIPHY_KEY}&q=${this.gif.search}`, {})
                .then((response) => {
                    this.gif.gifs = response.data.data;
                    this.gif.loading = false;

                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                });
        },
        sendGif(gif) {
            update(child(ref(db), `recent-gifs/${this.user.id}/${Date.now()}`), gif);
            update(child(ref(db), `messages/${this.chat.id}/${Date.now()}`), { src: gif.images.fixed_height.webp, title: gif.title, sender: this.user.id, time: Date.now(), type: "gif" });
        },
        changeGroupInfo() {
            this.groupInfo.loading = true;
            axios.post('https://oneline-functions.abaanshanid.repl.co/group/update', { id: this.chat.id, name: this.groupInfo.data.name, description: this.groupInfo.data.description })
                .then((response) => {
                    // handle success
                    update(child(ref(db), `messages/${this.chat.id}/${Date.now()}`), { text: `${this.user.username} changed the group's information`, type: "info", time: Date.now(), sender: this.user.id, action: "groupInfoChanged" }); information - outlin
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                })
                .then(() => {
                    this.groupInfo.loading = false;

                });
        },
        sendHi() {
            update(child(ref(db), `messages/${this.chat.id}/${Date.now()}`), { text: emojiConvertor.replace_colons(":wave: Hi"), sender: this.user.id, time: Date.now() });
        },
        askNotificationPermission() {
            Notification.requestPermission().then((result) => {
                this.settings.notificationGranted = result == "granted";
            });
        },
        // The controlled arg is used for functions calling this method, like the scrolled top function
        openChat(chat, controlled) {
            if (!controlled) {
                this.limit = 25;
            }
            localStorage.setItem("lastOpenedChat", JSON.stringify(chat));
            this.members = {};
            this.seen = {};
            onValue(query(ref(db, `chats/${chat.id}`)), (snapshot) => {
                if (!snapshot.exists()) {
                    localStorage.removeItem("lastOpenedChat");
                    return
                }
                let chatData = snapshot.val();
                this.chat = chatData;
                onValue(query(ref(db, `seen/${chat.id}`)), (snapshot) => {
                    if (this.chat.id != chat.id) return
                    this.seen = snapshot.val();
                    delete this.seen[this.user.username];
                    if (this.enableScroll) {
                        this.scrollDown();
                    }
                });
                if (!chatData.name) {
                    this.chat.name = chat.name;
                }
                onValue(query(ref(db, `messages/${chat.id}`), limitToLast(this.limit)), (snapshot) => {
                    var data = snapshot.val();
                    if (this.chat.id != chat.id) return
                    this.groupInfo.data.name = chatData?.name;
                    this.groupInfo.data.description = chatData?.description;
                    this.typing = {};
                    this.messages = data || {};
                    chatData.members.forEach((userId) => {
                        get(ref(db, `users/${userId}`)).then((snapshot) => {
                            if (snapshot.exists()) {
                                var member = snapshot.val();
                                this.members[userId] = member;
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
                    });

                });
            });
        },
        getChats() {
            if (!this.user.chats) return
            this.chats = {};
            var chats = JSON.parse(JSON.stringify(this.user.chats));
            let i = 0;
            for (var id in chats) {
                i++;
                const chat = this.user.chats[id];

                /* A little info about some weird stuff in this function
                    1) I added const chatId = id; coz the id var changes with the loop and the callback functions only get the last id
                    2) The JSON sorting function is called a bunch of times rather than calling it once after it's all over, I did this because
                       I don't know which would be the last one to be finished because it's only called after a data request. Since the personal
                       chats have to make two requests these are slower, but it might be the last to be called.
               */
                if (chat.type == "personal") {
                    const chatId = id;
                    const index = i;
                    onChildAdded(query(ref(db, 'messages/' + chatId), limitToLast(1)), (data) => {
                        var lastMessage = data.val();
                        get(ref(db, `users/${lastMessage?.sender}`)).then((snapshot) => {
                            if (lastMessage) {
                                var sender = snapshot.val();
                                lastMessage.senderInfo = sender;
                            }
                            if (this.settings.notificationGranted && this.settings.data.notification.enabled && this.settings.data.notification.newMessage) {
                                if (this.windowHidden && this.user.id != lastMessage?.sender) {
                                    new Notification(`${sender.username} in DMs`, { body: lastMessage.text });
                                } else if (!this.windowHidden && this.chat.id == chatId && this.user.id != lastMessage?.sender && this.enableScroll) {
                                    set(ref(db, "seen/" + chatId), { [this.user.username]: true });
                                }
                            }
                        });
                    });
                    this.user.chats[chatId].members.forEach((usr) => {
                        if (usr != this.user.id) {
                            get(ref(db, `users/${usr}`)).then((snapshot) => {
                                if (snapshot.exists()) {
                                    var data = snapshot.val();
                                    onValue(query(ref(db, `status/${usr}`)), (snapshot) => {
                                        var status = snapshot.exists() ? snapshot.val().status : "offline";
                                        onValue(query(ref(db, `messages/${chatId}`), limitToLast(1)), (snapshot) => {
                                            if (snapshot.exists()) {
                                                var lastMessage = snapshot.val();
                                                lastMessage = lastMessage[Object.keys(lastMessage)[0]];
                                            }
                                            get(ref(db, `users/${lastMessage?.sender}`)).then((snapshot) => {
                                                if (lastMessage) {
                                                    var sender = snapshot.val();
                                                    lastMessage.senderInfo = sender;
                                                }
                                                this.chats[chatId] = { name: data.username, id: chat.id, type: "personal", addedTime: chat.addedTime, data, lastMessage: snapshot.exists() ? lastMessage : { text: "New Chat", time: Date.now() }, status };
                                                var s = stringify(JSON.parse(JSON.stringify(this.chats)), function (a, b) {
                                                    return a.value.lastMessage?.time < b.value.lastMessage?.time ? 1 : -1;
                                                });
                                                this.chats = JSON.parse(s);
                                            });

                                        });


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
                    const index = i;
                    const chatId = id;
                    onChildAdded(ref(db, 'messages/' + chatId), (data) => {
                        var lastMessage = data.val();
                        get(ref(db, `users/${lastMessage?.sender}`)).then((snapshot) => {
                            if (lastMessage) {
                                var sender = snapshot.val();
                                lastMessage.senderInfo = sender;
                            }
                            if (this.settings.notificationGranted && this.settings.data.notification.enabled && this.settings.data.notification.newMessage) {
                                if (this.windowHidden && this.user.id != lastMessage?.sender) {
                                    new Notification(`${sender.username} in ${chat.name}`, { body: lastMessage.text });
                                }
                            };
                        });
                    });
                    onValue(query(ref(db, `messages/${id}`), limitToLast(1)), (snapshot) => {
                        if (snapshot.exists()) {
                            var lastMessage = snapshot.val();
                            lastMessage = lastMessage[Object.keys(lastMessage)[0]];
                        }
                        get(ref(db, `users/${lastMessage?.sender}`)).then((snapshot) => {
                            if (lastMessage) {
                                var sender = snapshot.val();
                                lastMessage.senderInfo = sender;
                            }
                            this.chats[chatId] = { name: chat.name, id: chat.id, type: "group", description: chat.description, addedTime: chat.addedTime, lastMessage: lastMessage ? (lastMessage) : { text: "New Group", time: Date.now() } };
                            var s = stringify(JSON.parse(JSON.stringify(this.chats)), function (a, b) {
                                return a.value.lastMessage?.time < b.value.lastMessage?.time ? 1 : -1;
                            });
                            this.chats = JSON.parse(s);
                        });
                    });
                }

            }
        },
        getMessagePreview(chat) {
            if (!chat.lastMessage.senderInfo) { return `New Chat` }
            if (chat.lastMessage.type == "file") {
                return `${chat.lastMessage.senderInfo.username}: (File) ${chat.lastMessage.file.name}`
            } else if (chat.lastMessage.type == "image") {
                return `${chat.lastMessage.senderInfo.username}: (Image) ${chat.lastMessage.file.name}`
            } else if (chat.lastMessage.type == "audio") {
                return `${chat.lastMessage.senderInfo.username}: (Audio) ${chat.lastMessage.duration}`
            }
            return `${chat.lastMessage.senderInfo.username}: ${chat.lastMessage.text}`
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
                                members: [this.user.id, usr.id],
                                addedTime: Date.now()
                            };
                            if (usr.email == this.newChat.data.personal.email) {
                                set(ref(db, "chats/" + chatId), chat);
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
                members: [this.user.id],
                addedTime: Date.now()
            };
            set(ref(db, "chats/" + chatId), chat);
            delete chat.members;
            update(child(ref(db), `users/${this.user.id}/chats`), { [chatId]: chat });
            this.newChat.data.newGroup.loading = false;
            this.newChat.modal = false;

        },
        joinGroup() {
            get(child(ref(db), "chats/" + this.newChat.data.group.id))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        var data = snapshot.val();
                        delete data.messages;
                        let members = data.members;
                        members.push(this.user.id);
                        const chat = data;
                        chat.addedTime = Date.now();
                        update(child(ref(db), `chats/${this.newChat.data.group.id}`), { members });
                        delete chat.messages;
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
        leaveGroupFunction() {
            this.leavingGroup = true;
            axios.post('https://oneline-functions.abaanshanid.repl.co/group/leave', { id: this.chat.id, user: this.user.id })
                .then((response) => {
                    // handle success  
                    update(child(ref(db), `messages/${this.chat.id}/${Date.now()}`), { text: `${this.user.username} left the group`, type: "info", time: Date.now(), sender: this.user.id, action: "groupLeft" });
                    this.leavingGroup = false;
                    this.leaveGroup = false;
                    this.chat = {};
                    this.$router.go();
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                })
                .then(() => {
                    this.leavingGroup = false;
                });
        },
        sendMessage() {
            if (this.message.text.trim().length < 1) return
            update(child(ref(db), `messages/${this.chat.id}/${Date.now()}`), { text: emojiConvertor.replace_colons(this.message.text), sender: this.user.id, time: Date.now() });
            this.message.text = "";
            document.querySelector("#messageInp .editable").innerHTML = "";
            remove(ref(db, `seen/${this.chat.id}`));
        },
        getTime(time) {
            return new Date(time).toLocaleString();
        },
        checkEnterKey(e) {
            if (e.key == 'Enter') {
                e.preventDefault();
                if (userTypedColon) {
                    const text = this.emojiComplete.emojis[this.emojiComplete.selectedIndex].short_name.replace(emojiQuery, "") + ": ";
                    let selection = window.getSelection();
                    let range = selection.getRangeAt(0);
                    range.deleteContents();
                    let node = document.createTextNode(text);
                    range.insertNode(node);
                    for (let position = 0; position != text.length; position++) {
                        selection.modify("move", "right", "character");
                    };
                    this.message.text = e.target.innerText;
                    this.clearEmojiSearch();
                    return
                }
                this.sendMessage();
                userTypedColon = false;
            }
            if (!e.ctrlKey && !e.shiftKey && e.key != "Backspace" && !e.key.includes("Arrow") && e.key.length == 1) {
                if (userTypedColon) {
                    emojiQuery += e.key;
                    emojiQuery.replace(":", "");
                    this.searchEmojisForCompletion(emojiQuery);
                    this.emojiComplete.selectedIndex = 0;
                }
            } else if (e.key == "Backspace") {
                // To be honest, even I don't know exactly how this code is working. One thing ik is that .slice(0,-1) is used to simulate a Backspace, .slice(-1) is used to get the last letter of the word
                emojiQuery = emojiQuery.slice(0, -1);
                this.searchEmojisForCompletion(emojiQuery);
                if (e.target.innerText.slice(0, -1).replace(emojiQuery, "").slice(-1) != ":") {
                    this.clearEmojiSearch();
                }
                if (!emojiQuery) {
                    this.emojiComplete.emojis = [];
                    return
                }
            } else if (e.key.includes("Arrow")) {
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    this.emojiComplete.selectedIndex = (this.emojiComplete.selectedIndex == 0) ? this.emojiComplete.emojis.length - 1 : this.emojiComplete.selectedIndex - 1;
                } else if (e.key == "ArrowDown") {
                    e.preventDefault();
                    this.emojiComplete.selectedIndex = (this.emojiComplete.selectedIndex == this.emojiComplete.emojis.length - 1) ? 0 : this.emojiComplete.selectedIndex + 1;
                }
                if (!this.isScrolledIntoView(document.querySelector("#emojiComplete .selected"), document.getElementById("emojiComplete"))) {
                    document.querySelector("#emojiComplete .selected").scrollIntoView();
                }
            }
            if (e.key == ":") {
                userTypedColon = !userTypedColon;
                if (!userTypedColon) {
                    emojiQuery = "";
                    this.emojiComplete.emojis = [];
                }
            }
            if (e.key == "Escape") {
                this.clearEmojiSearch();
            }
        },
        isScrolledIntoView(el, holder) {
            holder = holder || document.body
            const { top, bottom, height } = el.getBoundingClientRect()
            const holderRect = holder.getBoundingClientRect()

            return top <= holderRect.top
                ? holderRect.top - top <= height
                : bottom - holderRect.bottom <= height
        },
        searchEmojisForCompletion(q) {
            this.emojiComplete.emojis = [];
            Object.keys(emojiIndex._nativeEmojis).forEach(key => {
                const emoji = emojiIndex._nativeEmojis[key];
                if (emoji.short_name.startsWith(q)) {
                    this.emojiComplete.emojis.push(emoji);
                }
            });

        },
        clearEmojiSearch() {
            userTypedColon = false;
            emojiQuery = "";
            this.emojiComplete.emojis = [];
            this.emojiComplete.selectedIndex = 0;
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
        checkIfUserTyping(e) {
            update(child(ref(db), `typing/${this.user.id}`), { chat: this.chat.id, typing: true, user: this.user });
            if (searchTimeout != undefined) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                update(child(ref(db), `typing/${this.user.id}`), { chat: this.chat.id, typing: false, user: this.user });
            }, 500);
        },
        userLeftMessageBox() {
            update(child(ref(db), `typing/${this.user.id}`), { chat: this.chat.id, typing: false, user: this.user });

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
                document.querySelector("meta[name='theme-color']").setAttribute("content", "#fff");
            } else {
                document.querySelector("html").classList.add("dark");
                document.querySelector("meta[name='theme-color']").setAttribute("content", "#242428");
            }
        },
        scrollDown() {
            this.enableScroll = true;
            var el = document.getElementById("msgs");
            el.scrollTop = el.scrollHeight;
        }
    }
}