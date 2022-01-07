<template>
  <b-card
    class="fileUpload"
    height="65vh"
    @drop.prevent="dragFile"
    @dragover="dragging = true"
    @dragleave="dragging = false"
    :style="dragging ? `background-color :  var(--primary)` : ``"
  >
    <input
      ref="fileInp"
      type="file"
      multiple
      @change="addFile($event)"
      hidden
    />

    <div class="mt-32" v-show="Object.keys(files).length == 0">
      <h2 class="text-center">Drop a file or click to Upload</h2>
      <b-btn color="primary center" @click="$refs.fileInp.click()"
        >Upload</b-btn
      >
    </div>
    <div class="files" v-show="Object.keys(files).length != 0">
      <h4>Uploaded Files</h4>
      <div></div>
      <transition-group name="flip-list" tag="div">
        <div v-for="(file, i) in files" :key="i">
          <div class="file">
            <b-flex>
              <b-icon name="mdi mdi-file" size="20px"></b-icon>
              <span class="text-lg">{{ file.name }}</span>
              <b-spacer></b-spacer>
              <transition name="zoom" mode="out-in">
                <b-btn icon ghost v-if="file.done" class="p-0.5">
                  <b-icon name="mdi mdi-close"></b-icon
                ></b-btn>
                <b-spinner v-else></b-spinner>
              </transition>
            </b-flex>
            <div
              class="progress"
              :style="`width: ${file.done ? `0` : file.progress}%`"
            ></div>
          </div>
        </div>
      </transition-group>
    </div>
    <template #footer>
      <div v-show="allFilesLoaded">
        <b-input placeholder="Message" v-model="message"></b-input>
        <br />
        <b-flex style="height: max-content">
          <b-spacer></b-spacer>
          <b-btn color="secondary" @click="$refs.fileInp.click()"
            >Upload More</b-btn
          >
          <b-btn color="primary" @click="sendFiles()">
            Send
            <b-icon name="mdi mdi-send" right class="pl-0.5"></b-icon>
          </b-btn>
        </b-flex>
      </div>
    </template>
  </b-card>
</template>

<script>
/* eslint-disable */
import { BCard, BBtn, BFlex } from "bounce-ui-vue";
import EmojiConvertor from "emoji-js";
let emojiConvertor = new EmojiConvertor();
emojiConvertor.allow_native = true;
emojiConvertor.replace_mode = 'unified';
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { child, update, ref as dbRef,remove } from "firebase/database";
import { nanoid } from "nanoid";
import { storage } from "../../fire.js";
import db from "../../fire.js";
export default {
  components: {
    BCard,
    BBtn,
    BFlex,
  },
  props: { chat: Object, user: Object },
  data: () => {
    return {
      dragging: false,
      files: {},
      allFilesLoaded: false,
      message: "",
    };
  },
  methods: {
    addFile(e) {
      console.log(e.target);
      const files = e.target.files;
      Object.keys(files).forEach((key) => {
        console.log(files[key]);
        this.uploadFile(files[key]);
      });
    },
    dragFile(e) {
      this.dragging = false;
      console.log(e.dataTransfer.files);
      const files = e.dataTransfer.files;
      Object.keys(files).forEach((key) => {
        console.log(files[key]);
        this.uploadFile(files[key]);
      });
    },
    async uploadFile(file) {
      this.allFilesLoaded = false;
      var id = nanoid();
      console.log(file);
      this.files[id] = {
        name: file.name,
        progress: 0,
        done: false,
        url: "",
        path: `messages/${id}_${file.name}`,
        time: Date.now(),
        type: file.type,
      };
      const storageRef = ref(storage, `messages/${id}_${file.name}`);
      console.log(storage);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.files[id].progress = progress;
          console.log(progress);
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            this.files[id].done = true;
            this.files[id].url = downloadURL;
            let allFilesLoaded = false;
            let i = 0;
            Object.keys(this.files).forEach((key) => {
              i++;
              if (!this.files[key].done) {
                allFilesLoaded = false;
              } else {
                allFilesLoaded = true;
              }
              if (Object.keys(this.files).length == i) {
                this.allFilesLoaded = allFilesLoaded;
              }
            });
          });
        }
      );
    },
    sendFiles() {
      let i = 0;
      Object.keys(this.files).forEach((key) => {
        i++;
        var file = this.files[key];
        delete file.done, file.progress;
        console.log(this.chat, file);
        update(child(dbRef(db), `messages/${this.chat.id}/${file.time}`), {
          sender: this.user.id,
          file,
          time: file.time,
          type: file.type.split("/")[0] === "image" ? "image" : "file",
        });
        if (Object.keys(this.files).length == i) {
          if (this.message) {
            update(child(dbRef(db), `messages/${this.chat.id}/${Date.now()}`), {
              text: emojiConvertor.replace_colons(this.message),
              sender: this.user.id,
              time: Date.now(),
            });
            document.querySelector("#messageInp .editable").innerHTML = "";
            remove(dbRef(db, `seen/${this.chat.id}`));
          }
          this.$emit("uploaded");
        }
      });
    },
  },
};
</script>

<style lang="stylus" scoped>
@import "./style.styl"
</style>
