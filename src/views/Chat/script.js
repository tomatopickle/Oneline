/* eslint-disable */
import axios from "axios";
import './styles/style.styl';
import filters from "./scripts/filters.js";
import db from "@/fire.js";
import { storage } from "@/fire.js";
import { getFileFromPasteEvent } from "@/scripts/globalFunctions.js";
import PubNub from "pubnub";
import VueHorizontal from "vue-horizontal";
import { ref, set, get, endAt, remove, child, onValue, update, limitToLast, query, onDisconnect, onChildAdded, orderByKey, startAfter, serverTimestamp, startAt, off } from "firebase/database";
import { nanoid } from "nanoid";
import router from "@/router";
import stringify from "json-stable-stringify";
import ChatWindow from "./ChatWindow/ChatWindow";
import ChatWindowSimple from "./ChatWindowSimple/ChatWindowSimple";
import ContentEditableDiv from "./ContentEditableDiv/ContentEditableDiv";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex, Emoji } from "emoji-mart-vue-fast/src";
import EmojiConvertor from "emoji-js";
import { ref as storageRef, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";
import recordAudio from "./scripts/recordAudio.js";
import Player from '@/components/Player/Player.vue';
import Swatch from '@/components/Swatch/Swatch.vue';
import ShortVideoUploader from '@/components/ShortVideoUploader/ShortVideoUploader.vue';

// Variables for emoji search and display
let meetingRingtone = new Audio(require("./assets/ringtone.mp3"));
meetingRingtone.loop = true;
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
let pubnub;
export default {
    name: "Chat",
    components: {
        ChatWindow, ContentEditableDiv, ChatWindowSimple, Picker, Emoji, Player, VueHorizontal, Swatch, ShortVideoUploader
    },
    provide() {
        return {
            openShort: this.openShort
        }
    },
    data: () => {
        return {
            shortsAvatars: {},
            newMeetingBtnDisabled: false,
            instantUpload: {
                show: false,
                loading: true,
                file: {},
                fileName: "Loading..."
            },
            shorts: {
                show: false,
                user: {},
                index: 0,
                commentText: "",
                short: {},
                shorts: {}
            },
            short: {
                show: false,
                photo: {
                    show: false,
                    uploaded: false,
                    blobUrl: "",
                    filters,
                    filterSelected: false,
                    data: {
                        filter: "",
                        caption: "",
                        src: "",
                    }
                },
                video: {
                    show: false
                }
            },
            meetingInvite: {
                show: false,
                data: {}
            },
            audio: {
                show: false,
                src: ""
            },
            reply: {
                show: false,
                message: {}
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
            settingsHeading: ["Appearance", "Account", "Chat", "Notifications", "Sounds", "About"],
            chats: {},
            baseUrl: "https://" + location.host,
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
                modalLoading: false,
                loading: false,
                data: {
                    name: "",
                    description: ""
                }
            },
            userInfo: {
                loading: false,
                data: {
                    username: "",
                    avatar: "",
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
                loading: false,
                button: {
                    text: "Save",
                    color: "primary",
                    check: false
                },
                index: 0,
                colors: ["var(--primary)", "var(--success)", "var(--danger)", "#5327f1", "#f127e4", "#eab308", "#f14d27"],
                notificationGranted: false,
                likeEmojiModal: false,
                data: {
                    ringtoneForMeetingInvite: true,
                    showExactTime: false,
                    lightMode: false,
                    likeEmoji: { "_data": { "name": "Thumbs Up Sign", "unified": "1F44D", "has_img_apple": true, "has_img_google": true, "has_img_twitter": true, "has_img_facebook": true, "keywords": ["thumbs_up", "thumbsup", "yes", "awesome", "good", "agree", "accept", "cool", "hand", "like"], "text": "", "short_names": ["+1", "thumbsup"], "added_in": "6.0", "sheet_x": 13, "sheet_y": 28, "search": "+1,thumbsup,thumbs,up,sign,thumbs_up,yes,awesome,good,agree,accept,cool,hand,like", "skin_tone": 1 }, "_skins": null, "_sanitized": { "id": "+1", "name": "Thumbs Up Sign", "colons": ":+1::skin-tone-1:", "unified": "1f44d", "skin": 1, "native": "👍" }, "id": "+1", "name": "Thumbs Up Sign", "colons": ":+1::skin-tone-1:", "unified": "1f44d", "skin": 1, "native": "👍", "short_names": ["+1", "thumbsup"], "short_name": "+1" },
                    messagesSimpleMode: false,
                    messagesSimpleModeColor: "var(--primary)",
                    notification: {
                        granted: false,
                        enabled: true,
                        newMessage: true,
                        meetingNotifcations: true
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
        window.addEventListener('paste', (e) => {
            if (this.short.photo.show && !this.short.photo.uploadBtnLoading) {
                this.short.photo.uploadBtnLoading = true;
                var file = getFileFromPasteEvent(e);
                console.log(file);
                uploadBytes(storageRef(storage, `stories/${this.user.id}/${Date.now()}`), file).then((snapshot) => {
                    console.log('Uploaded a blob or file!');
                    console.log(snapshot);
                    getDownloadURL(snapshot.metadata.ref).then((url) => {
                        this.short.photo.data.src = url;
                        this.short.photo.uploadBtnLoading = false;
                    });
                });
            } else {
                if (!getFileFromPasteEvent(e)) return
                this.filePastedInMsgBar(getFileFromPasteEvent(e));
            }
        });
        if (Notification) {
            this.settings.notificationGranted = Notification.permission == "granted";
        } else {
            this.settings.notificationGranted = false;
        }
        console.log(this.$route.query)
        if (this.$route.query?.story && this.$route.query?.user) {
            this.openShortWithId(this.$route.query.story, this.$route.query.user, true);
        }
        onValue(child(ref(db), `users/${localStorage.getItem("id")}`), (snapshot) => {
            const data = snapshot.val();
            localStorage.setItem("user", JSON.stringify(data));
            if (!data.id) {
                router.push("login");
            }
            this.user = data;
            this.userInfo.data = data;
            console.log(data)
            pubnub = new PubNub({
                publishKey: "pub-c-c7a63789-7f5f-4050-826c-e75505e9631e",
                subscribeKey: "sub-c-2a2cb9c6-7935-11ec-add2-a260b15b99c5",
                uuid: data.id
            });
            update(child(ref(db), `status/${this.user.id}`), { status: "online" });
            onDisconnect(ref(db, `users/${this.user.id}/lastOnline`)).set(serverTimestamp());
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
                const lastMessage = this.messages[Object.keys(this.messages)[Object.keys(this.messages).length - 1]];
                if (!this.windowHidden && this.chat.id) {
                    this.userSeenLastMessage();
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
        },
        getLastUpdatedTime() {
            return localStorage.getItem("lastUpdateTime") ? `Last Updated On: ${new Date(parseInt(localStorage.getItem("lastUpdateTime"))).toLocaleString()}` : false
        }
    },
    methods: {
        log(e) {
            console.log(e)
        },
        clearCache() {
            if (!confirm("You will be logged out after clearing cache, do you want to proceed?")) return
            caches.keys().then(function (names) {
                for (let name of names) caches.delete(name);
            });
            localStorage.clear();
            alert("Cache cleared");
            router.push("/login");
        },
        filePastedInMsgBar(fileObj) {
            this.instantUpload.loading = true;
            this.instantUpload.fileName = fileObj.name;
            this.instantUpload.show = true;
            const id = nanoid();
            let file = {
                name: fileObj.name,
                url: "",
                id,
                path: `messages/${id}_${fileObj.name}`,
                time: Date.now(),
                type: fileObj.type,
            }
            uploadBytes(storageRef(storage, `messages/${id}_${fileObj.name}`), fileObj).then((snapshot) => {
                getDownloadURL(snapshot.metadata.ref).then((url) => {
                    file.url = url;
                    this.instantUpload.file = file;
                    this.instantUpload.loading = false;
                });
            });
        },
        startMeetingWithUser(user) {
            for (var chatId in this.chats) {
                const chat = this.chats[chatId];
                if (chat.type == "personal" && chat.data.id == user.id) {
                    this.newMeetingBtnDisabled = true;
                    Object.keys(chat).forEach((key) => {
                        if (!chat[key]) {
                            delete chat[key]
                        }
                    });
                    axios.post('https://Oneline-Functions.abaanshanid.repl.co/meetings/rooms')
                        .then((response) => {
                            const room = response.data.room;
                            const token = response.data.token;
                            console.log(response.data);
                            set(ref(db, "meetingInvite/" + chat.id), { from: this.user, room, chat: chat });
                            const data = router.resolve({ path: '/meeting', query: { meetingId: room.url, token } });
                            window.open(data.href, '_blank');
                            setTimeout(() => { remove(ref(db, "meetingInvite/" + chat.id)) }, 3000);
                            this.newMeetingBtnDisabled = false;
                            if (this.settings.notificationGranted && this.settings.data.notification.enabled && this.settings.data.notification.meetingNotifcations) {
                                if (chat.type == "personal") {
                                    new Notification(`${chat.name} has been invited`, { badge: "https://res.cloudinary.com/abaan/image/upload/v1642608838/pngaaa.com-463061_lry8is.png" });
                                } else {
                                    new Notification(`Everyone in ${chat.name} has been invited`, { badge: "https://res.cloudinary.com/abaan/image/upload/v1642608838/pngaaa.com-463061_lry8is.png" });
                                }
                                pubnub.subscribe({ channels: [`declineMeeting.${chat.id}`] });
                                pubnub.addListener({
                                    message: (m) => {
                                        console.log(m);
                                        new Notification(`${m.message} declined your invitation`);
                                    },
                                });
                            };
                        })
                        .catch(function (error) {
                            // handle error
                            console.log(error);
                        })
                }
            }
            console.log(this.chat)


        },
        likeShort() {
            for (var chatId in this.chats) {
                const chat = this.chats[chatId];
                if (chat.type == "personal" && chat.data.id == this.shorts.user.id) {
                    console.log(this.chats[chatId]);
                    this.openChat(chat);
                    this.shorts.show = false;
                    update(child(ref(db), `messages/${chat.id}/${Date.now()}`), { type: "likeShort", short: this.shorts.short, username: this.user.username, sender: this.user.id, time: Date.now() });
                }
            }
        },
        commentShort() {
            for (var chatId in this.chats) {
                const chat = this.chats[chatId];
                if (chat.type == "personal" && chat.data.id == this.shorts.user.id) {
                    console.log(this.chats[chatId]);
                    this.openChat(chat);
                    this.shorts.show = false;
                    update(child(ref(db), `messages/${chat.id}/${Date.now()}`), { type: "commentShort", short: this.shorts.short, text: this.shorts.commentText, sender: this.user.id, time: Date.now() });
                    this.shorts.commentText = '';
                }
            }
        },
        viewedShort() {
            this.shorts.short = this.getByIndex(this.shorts.shorts, this.shorts.index);
            console.log(this.getByIndex(this.shorts.shorts, this.shorts.index));
            if (this.shorts.short) {
                set(ref(db, `users/${this.user.id}/lastSeenShort/${this.shorts.user.id}`), this.shorts.short.time);
            }
            if (Object.keys(this.shorts.shorts)[Object.keys(this.shorts.shorts).length - 1] == this.shorts.short.time) {
                delete this.shortsAvatars[this.shorts.user.id]
            }
        },
        getByIndex(json, index) {
            return json[Object.keys(json)[index]];
        },
        uploadGroupAvatar() {
            var input = document.createElement('input');
            input.type = 'file';

            input.onchange = e => {
                this.groupInfo.modalLoading = true;
                var file = e.target.files[0];
                input.remove();
                console.log(file);
                uploadBytes(storageRef(storage, `groupAvatar/${this.chat.id}`), file).then((snapshot) => {
                    console.log('Uploaded a blob or file!');
                    console.log(snapshot);
                    getDownloadURL(snapshot.metadata.ref).then((url) => {
                        axios.post('https://oneline-functions.abaanshanid.repl.co/group/update/avatar', { id: this.chat.id, avatar: url })
                            .then((response) => {
                                // handle success
                                this.chats[this.chat.id].src = url;
                                this.chat.src = url;
                                this.openChat(this.chat);
                                update(child(ref(db), `messages/${this.chat.id}/${Date.now()}`), { text: `${this.user.username} changed the group image`, type: "info", time: Date.now(), sender: this.user.id, action: "groupInfoChanged" });
                                this.groupInfo.modalLoading = false;
                            });

                    });
                });
            }
            input.click();
        },
        uploadAvatar() {
            var input = document.createElement('input');
            input.type = 'file';

            input.onchange = e => {
                this.settings.loading = true;
                var file = e.target.files[0];
                input.remove();
                console.log(file);
                uploadBytes(storageRef(storage, `userAvatar/${this.user.id}`), file).then((snapshot) => {
                    console.log('Uploaded a blob or file!');
                    console.log(snapshot);
                    getDownloadURL(snapshot.metadata.ref).then((url) => {
                        update(child(ref(db), `users/${this.user.id}`), {
                            avatar: url
                        });
                        this.settings.loading = false;
                    });
                });
            }
            input.click();
        },
        uploadShortImage() {
            var input = document.createElement('input');
            input.type = 'file';

            input.onchange = e => {
                this.short.photo.uploadBtnLoading = true;
                var file = e.target.files[0];
                input.remove();
                console.log(file);
                uploadBytes(storageRef(storage, `stories/${this.user.id}/${Date.now()}`), file).then((snapshot) => {
                    console.log('Uploaded a blob or file!');
                    console.log(snapshot);
                    getDownloadURL(snapshot.metadata.ref).then((url) => {
                        this.short.photo.data.src = url;
                        this.short.photo.uploadBtnLoading = false;
                    });
                });
            }
            input.click();
        },
        uploadShortPhoto() {
            const time = Date.now();
            set(ref(db, `shorts/${this.user.id}/${time}`), {
                time,
                type: "photo",
                src: this.short.photo.data.src,
                caption: this.short.photo.data.caption,
                filter: this.short.photo.data.filter
            });
            this.openShort({ user: this.user, badge: 1 });
            this.short = {
                show: false,
                photo: {
                    show: false,
                    uploaded: false,
                    blobUrl: "",
                    filters,
                    filterSelected: false,
                    data: {
                        filter: "",
                        caption: "",
                        src: "",
                    }
                }
            }
        },
        startMeeting() {
            console.log(this.chat)
            this.newMeetingBtnDisabled = true;
            let chat = this.chat;
            Object.keys(chat).forEach((key) => {
                if (!chat[key]) {
                    delete chat[key]
                }
            });
            axios.post('https://Oneline-Functions.abaanshanid.repl.co/meetings/rooms')
                .then((response) => {
                    const room = response.data.room;
                    const token = response.data.token;
                    console.log(response.data);
                    set(ref(db, "meetingInvite/" + chat.id), { from: this.user, room, chat: chat });
                    const data = router.resolve({ path: '/meeting', query: { meetingId: room.url, token } });
                    window.open(data.href, '_blank');
                    setTimeout(() => { remove(ref(db, "meetingInvite/" + chat.id)) }, 3000);
                    this.newMeetingBtnDisabled = false;
                    if (this.settings.notificationGranted && this.settings.data.notification.enabled && this.settings.data.notification.meetingNotifcations) {
                        if (chat.type == "personal") {
                            new Notification(`${chat.name} has been invited`, { badge: "https://res.cloudinary.com/abaan/image/upload/v1642608838/pngaaa.com-463061_lry8is.png" });
                        } else {
                            new Notification(`Everyone in ${chat.name} has been invited`, { badge: "https://res.cloudinary.com/abaan/image/upload/v1642608838/pngaaa.com-463061_lry8is.png" });
                        }
                        pubnub.subscribe({ channels: [`declineMeeting.${chat.id}`] });
                        pubnub.addListener({
                            message: (m) => {
                                console.log(m);
                                new Notification(`${m.message} declined your invitation`);
                            },
                        });
                    };
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                })

        },
        declineMeeting() {
            pubnub.publish(
                {
                    channel: `declineMeeting.${this.chat.id}`,
                    message: this.user.username
                },
                function (status, response) {
                    console.log(status, response);
                }
            );
            meetingRingtone.pause();
            meetingRingtone.currentTime = 0;
            this.meetingInvite.show = false;
        },
        joinMeeting(room) {
            meetingRingtone.pause();
            meetingRingtone.currentTime = 0;
            const data = router.resolve({ path: '/meeting', query: { meetingId: room.url } });
            window.open(data.href, '_blank');
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
                    this.recording.uploading = false;
                    this.recording.show = false;
                    this.clearAudioRecordingVars();
                })
            });
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
            });
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
                    update(child(ref(db), `messages/${this.chat.id}/${Date.now()}`), { text: `${this.user.username} changed the group's information`, type: "info", time: Date.now(), sender: this.user.id, action: "groupInfoChanged" });
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
            if (this.chats[chat.id]) {
                this.chats[chat.id].unreadMessages = 0;
            }
            onValue(query(ref(db, `chats/${chat.id}`)), (snapshot) => {
                if (!snapshot.exists()) {
                    localStorage.removeItem("lastOpenedChat");
                    return
                }
                let chatData = snapshot.val();
                this.chat = chatData;
                this.chat.src = chat?.src;
                this.chat.lastOnline = chat?.lastOnline;
                if (!chatData.name) {
                    this.chat.name = chat.name;
                }
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
                            if ((user?.typing) && this.chat.id == user?.chat && user?.user?.username != this.user.username) {
                                this.typing[userId] = user.user.username;
                            } else if ((!user?.typing) && this.chat.id == user?.chat) {
                                delete this.typing[userId];
                            }
                        }
                    });
                });
                onValue(query(ref(db, `messages/${chat.id}`), limitToLast(this.limit)), (snapshot) => {
                    var data = snapshot.val();
                    if (this.chat.id != chat.id) return
                    this.groupInfo.data.name = chatData?.name;
                    this.groupInfo.data.description = chatData?.description;
                    this.typing = {};
                    this.messages = data || {};
                    if (!this.windowHidden) {
                        this.userSeenLastMessage();
                    }
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
                onValue((child(ref(db), `meetingInvite/${id}`)), (snapshot) => {
                    if (snapshot.exists()) {
                        console.log("inv coming", snapshot.val());
                        if (snapshot.val().from.username != this.user.username) {
                            if (this.settings.data.ringtoneForMeetingInvite) {
                                meetingRingtone.play();
                            }
                            this.meetingInvite.show = true;
                            this.meetingInvite.data = snapshot.val();
                        }
                    }
                });
                /* A little info about some weird stuff in this function
                    1) I added const chatId = id; coz the id var changes with the loop and the callback functions only get the last id
                    2) The JSON sorting function is called a bunch of times rather than calling it once after it's all over, I did this because
                       I don't know which would be the last one to be finished because it's only called after a data request. Since the personal
                       chats have to make two requests these are slower, but it might be the last to be called.
               */
                if (chat.type == "personal") {
                    this.getPersonalChat(id, this.user.chats[id]);
                } else {
                    this.getGroupChat(id, this.user.chats[id]);

                }
            }
        },
        newMessage(lastMessage) {
            if (lastMessage.text) {
                const congratsWords = ["congrats", "congratulations", "🎉", ":tada:", "happy birthday"]
                if (congratsWords.some(el => lastMessage.text.includes(el))) {
                    startConfetti();
                    setTimeout(stopConfetti, 3000);
                }
            }
        },
        getGroupChat(chatId, chat) {
            let unreadMessages = 0;
            onValue(query(ref(db, `lastSeenMessage/${this.user.id}/${chatId}`)), (snapshot) => {
                if (!snapshot.exists()) return
                let lastSeenMessageTime = snapshot.val()
                lastSeenMessageTime = lastSeenMessageTime.toString();
                console.log(lastSeenMessageTime)
                onValue(query(ref(db, `messages/${chatId}`), orderByKey(), startAfter(lastSeenMessageTime), limitToLast(100)), (snapshot) => {
                    off(query(ref(db, `messages/${chatId}`), orderByKey(), startAfter(lastSeenMessageTime), limitToLast(100)));
                    if (!snapshot.exists() || this.chat.id == chatId) {
                        if (this.chats[chatId]) {
                            this.chats[chatId].unreadMessages = 0;
                        }
                        return
                    }
                    if (this.chats[chatId]) {
                        this.chats[chatId].unreadMessages = Object.keys(snapshot.val()).length;
                    } else {
                        unreadMessages = Object.keys(snapshot.val()).length;
                    }
                });
            });
            onChildAdded(query(ref(db, 'messages/' + chatId), orderByKey(), startAfter(Date.now().toString()), limitToLast(1)), (data) => {
                var lastMessage = data.val();
                if (this.chat.id == chatId) {
                    this.newMessage(lastMessage);
                }
                if (this.chats[chatId] && this.chat.id != chatId) {
                    this.chats[chatId].unreadMessages++;
                }
                get(ref(db, `users/${lastMessage?.sender}`)).then((snapshot) => {
                    if (lastMessage) {
                        var sender = snapshot.val();
                        lastMessage.senderInfo = sender;
                    }
                    if (this.settings.notificationGranted && this.settings.data.notification.enabled && this.settings.data.notification.newMessage) {
                        if (this.windowHidden && this.user.id != lastMessage?.sender) {
                            new Notification(`${sender.username} in ${chat.name}`, { body: this.stripHtml(lastMessage.text) });
                        }
                    }
                });
            });
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
                    // If there's a past record of an unread message
                    if (this.chats[chatId] && this.chat.id != chatId) {
                        unreadMessages = this.chats[chatId].unreadMessages;
                    } else {
                        unreadMessages = 0;
                    }
                    this.chats[chatId] = { name: chat.name, src: chat.avatar, id: chat.id, type: "group", description: chat.description, addedTime: chat.addedTime, unreadMessages, lastMessage: lastMessage ? (lastMessage) : { text: "New Group", time: Date.now() } };
                    var s = stringify(JSON.parse(JSON.stringify(this.chats)), function (a, b) {
                        return a.value.lastMessage?.time < b.value.lastMessage?.time ? 1 : -1;
                    });
                    this.chats = JSON.parse(s);
                });
            });
        },
        getPersonalChat(chatId, chat) {
            let unreadMessages = 0;
            onValue(query(ref(db, `lastSeenMessage/${this.user.id}/${chatId}`)), (snapshot) => {
                if (!snapshot.exists()) return
                let lastSeenMessageTime = snapshot.val()
                lastSeenMessageTime = lastSeenMessageTime.toString();
                onValue(query(ref(db, `messages/${chatId}`), orderByKey(), startAfter(lastSeenMessageTime), limitToLast(100)), (snapshot) => {
                    off(query(ref(db, `messages/${chatId}`), orderByKey(), startAfter(lastSeenMessageTime), limitToLast(100)));
                    if (!snapshot.exists() || this.chat.id == chatId) {
                        if (this.chats[chatId]) {
                            this.chats[chatId].unreadMessages = 0;
                        }
                        return
                    }
                    if (this.chats[chatId]) {
                        this.chats[chatId].unreadMessages = Object.keys(snapshot.val()).length;
                    } else {
                        unreadMessages = Object.keys(snapshot.val()).length;
                    }
                });
            });
            onChildAdded(query(ref(db, 'messages/' + chatId), orderByKey(), startAfter(Date.now().toString()), limitToLast(1)), (data) => {
                var lastMessage = data.val();
                if (this.chat.id == chatId) {
                    this.newMessage(lastMessage);
                }
                if (this.chats[chatId] && this.chat.id != chatId) {
                    this.chats[chatId].unreadMessages++;
                }
                get(ref(db, `users/${lastMessage?.sender}`)).then((snapshot) => {
                    if (lastMessage) {
                        var sender = snapshot.val();
                        lastMessage.senderInfo = sender;
                    }
                    if (this.settings.notificationGranted && this.settings.data.notification.enabled && this.settings.data.notification.newMessage) {
                        if (this.windowHidden && this.user.id != lastMessage?.sender) {
                            new Notification(`${sender.username} in DMs`, { body: this.stripHtml(lastMessage.text) });
                        }
                    }
                });
            });
            this.user.chats[chatId].members.forEach((usr) => {
                if (usr != this.user.id) {
                    get(ref(db, `users/${usr}`)).then(snapshot => {
                        if (snapshot.exists()) {
                            var data = snapshot.val();
                            this.getShorts(data);
                            let lastOnline = 0;
                            onValue(query(ref(db, `status/${usr}`)), (snapshot) => {
                                var status = snapshot.exists() ? snapshot.val().status : "offline";
                                if (status == "offline") {
                                    lastOnline = data.lastOnline || 0;
                                } else {
                                    lastOnline = 0;
                                }
                                if (this.chat.id == chatId) {
                                    this.chat.lastOnline = lastOnline;
                                }
                                // Used to get the latest message preview
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
                                        // If there's a past record of an unread message
                                        if (this.chats[chatId] && this.chat.id != chatId) {
                                            unreadMessages = this.chats[chatId].unreadMessages;
                                        } else {
                                            unreadMessages = 0;
                                        }
                                        console.log(unreadMessages)
                                        this.chats[chatId] = { name: data.username, src: data.avatar, id: chat.id, type: "personal", addedTime: chat.addedTime, lastOnline, unreadMessages, data, lastMessage: snapshot.exists() ? lastMessage : { text: "New Chat", time: Date.now() }, status };
                                        var s = stringify(JSON.parse(JSON.stringify(this.chats)), function (a, b) {
                                            return a.value.lastMessage?.time < b.value.lastMessage?.time ? 1 : -1;
                                        });
                                        this.chats = JSON.parse(s);
                                    });

                                });
                            });
                        }
                    });
                }
            });
        },
        userSeenLastMessage() {
            const lastSeenMsgTime = Object.keys(this.messages)[Object.keys(this.messages).length - 1];
            if (this.messages[lastSeenMsgTime].sender != this.user.id) {
                set(
                    child(
                        ref(db),
                        `messages/${this.chat.id}/${lastSeenMsgTime}/seen/${this.user.username}`
                    ),
                    this.user
                );
            }
            set(
                child(
                    ref(db),
                    `lastSeenMessage/${this.user.id}/${this.chat.id}`
                ),
                lastSeenMsgTime
            );
        },
        getShorts(user) {
            var date = new Date();
            date.setDate(date.getDate() - 1);
            let time = date.getTime();
            try {
                time = this.user.lastSeenShort[user.id] != undefined ? this.user.lastSeenShort[user.id] : time;
            }
            catch (err) {

            }
            onValue(query(ref(db, `shorts/${user.id}`), orderByKey(), startAfter(time.toString())), (snapshot) => {
                if (!snapshot.exists()) return
                this.shortsAvatars[user.id] = { user, badge: Object.keys(snapshot.val()).length };
            });
        },

        openShort(short) {
            console.log(short)
            this.shorts.show = true;
            onValue(query(ref(db, `shorts/${short.user.id}`), limitToLast(short.badge)), (snapshot) => {
                console.log(snapshot.val());
                this.shorts.user = short.user;
                this.shorts.shorts = JSON.parse(stringify(snapshot.val(), function (a, b) {
                    return a.key > b.key ? 1 : -1;
                }));
                this.shorts.short = this.getByIndex(this.shorts.shorts, 0);
                set(ref(db, `users/${this.user.id}/lastSeenShort/${this.shorts.user.id}`), this.shorts.short.time);
                if (Object.keys(this.shorts.shorts).length == 1) {
                    delete this.shortsAvatars[short.user.id]
                }
            });
        },
        openShortWithId(id, userId, controlled) {
            console.log(id, userId)
            this.shorts.show = true;
            get(child(ref(db), `users/${userId}`))
                .then((snapshot) => {
                    const user = snapshot.val();
                    console.log(user);
                    this.shorts.user = user;
                    get(child(ref(db), `shorts/${userId}/${id}`))
                        .then((snapshot) => {
                            console.log(snapshot.val());
                            this.shorts.shorts = { [id]: snapshot.val() }
                            this.shorts.short = snapshot.val();
                            if (controlled) {
                                router.replace({ path: '/' });
                            }
                        });
                });
        },
        getMessagePreview(chat) {
            if (!chat.lastMessage.senderInfo) { return `New Chat` }
            if (chat.lastMessage.type == "file") {
                return `${chat.lastMessage.senderInfo.username}: (File) ${chat.lastMessage.file.name}`
            } else if (chat.lastMessage.type == "likeShort") {
                return `${chat.lastMessage.senderInfo.username}: Liked your Short`
            } else if (chat.lastMessage.type == "image") {
                return `${chat.lastMessage.senderInfo.username}: (Image) ${chat.lastMessage.file.name}`
            } else if (chat.lastMessage.type == "audio") {
                return `${chat.lastMessage.senderInfo.username}: (Audio) ${chat.lastMessage.duration}`
            }
            return `${chat.lastMessage.senderInfo.username}: ${chat.lastMessage.text}`
        },
        stripHtml(html) {
            let doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.body.textContent || "";
        },
        timeSince(date) {
            if (date == 0) return ''
            date = new Date(date);
            var seconds = Math.floor((new Date() - date) / 1000);

            var interval = seconds / 31536000;

            if (interval > 1) {
                return Math.floor(interval) + " year" + (Math.floor(interval) == 1 ? "" : "s");
            }
            interval = seconds / 2592000;
            if (interval > 1) {
                return Math.floor(interval) + " month" + (Math.floor(interval) == 1 ? "" : "s");
            }
            interval = seconds / 86400;
            if (interval > 1) {
                return Math.floor(interval) + " day" + (Math.floor(interval) == 1 ? "" : "s");
            }
            interval = seconds / 3600;
            if (interval > 1) {
                return Math.floor(interval) + " hour" + (Math.floor(interval) == 1 ? "" : "s");
            }
            interval = seconds / 60;
            if (interval > 1) {
                return Math.floor(interval) + " minute" + (Math.floor(interval) == 1 ? "" : "s");
            }
            return Math.floor(seconds) + " second" + (Math.floor(interval) == 1 ? "" : "s");
        },
        getReplyPreview(message) {
            if (message.type == "file") {
                return `(File) ${message.file.name}`
            } else if (message.type == "image") {
                return `(Image) ${message.file.name}`
            } else if (message.type == "audio") {
                return `(Audio) ${message.duration}`
            }
            return `${message.text}`
        },
        sendReplyMessage() {
            if (this.message.text.trim().length < 1) return
            update(child(ref(db), `messages/${this.chat.id}/${Date.now()}`), { text: emojiConvertor.replace_colons(this.message.text), type: "reply", replyingTo: this.reply.message, sender: this.user.id, time: Date.now() });
            this.message.text = "";
            this.reply = { show: false, message: {} };
            document.querySelector("#messageInp .editable").innerHTML = "";
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
            if (document.querySelector("#messageInp .editable").textContent.trim().length < 1) return
            if (!this.instantUpload.loading && this.instantUpload.file) {
                this.sendInstantUpload();
            }
            update(child(ref(db), `messages/${this.chat.id}/${Date.now()}`), { text: emojiConvertor.replace_colons(this.message.text), sender: this.user.id, time: Date.now() });
            this.message.text = "";
            document.querySelector("#messageInp .editable").innerHTML = "";
        },
        deleteInstantUpload() {
            deleteObject(storageRef(storage, this.instantUpload.file.path)).then(() => {
                this.instantUpload.loading = true;
                this.instantUpload.file = {};
                this.instantUpload.show = false;
            });
        },
        sendInstantUpload() {
            const file = this.instantUpload.file;
            update(child(ref(db), `messages/${this.chat.id}/${file.time}`), {
                sender: this.user.id,
                file,
                time: file.time,
                type: file.type.split("/")[0] === "image" ? "image" : "file",
            });
            update(child(ref(db), `chatImages/${this.chat.id}/${file.time}`), {
                sender: this.user.id,
                file,
                time: file.time,
            });
            this.instantUpload.loading = true;
            this.instantUpload.file = {};
            this.instantUpload.show = false;
        },
        getTime(time) {
            return new Date(time).toLocaleString();
        },
        checkEnterKey(e) {
            if (e.key == 'Enter') {
                if (userTypedColon) {
                    e.preventDefault();
                    const text = this.emojiComplete.emojis[this.emojiComplete.selectedIndex]?.short_name.replace(emojiQuery, "") + ": ";
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
                if (!e.shiftKey) {
                    e.preventDefault();
                    if (!this.reply.show) {
                        this.sendMessage();
                    } else {
                        this.sendReplyMessage();
                    }
                }
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
            update(ref(db, `users/${this.user.id}`), this.userInfo.data);
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
            if (settingsData.messagesSimpleModeColor) {
                document.documentElement.style.setProperty('--chat-me-color', settingsData.messagesSimpleModeColor);
            }
            if (settingsData?.lightMode) {
                document.querySelector("html").classList.remove("dark");
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
