<template>
  <sl-dialog
    height="65vh"
    @drop.prevent="dragFile"
    @dragover="dragging = true"
    @dragleave="dragging = false"
    :class="{ me: dragging }"
    style="--width: 750px"
    :label="Object.keys(files).length != 0 ? 'Upload Files' : ''"
  >
    <div class="fileUpload">
      <input
        ref="fileInp"
        type="file"
        multiple
        @change="addFile($event)"
        hidden
      />
      <div v-show="Object.keys(files).length == 0" class="fileUploadScreen">
        <h2 class="text-center">Drop a file or click to Upload</h2>
        <sl-button
          variant="primary"
          class="center block w-max"
          @click="$refs.fileInp.click()"
        >
          <sl-icon slot="prefix" name="plus-lg"></sl-icon>
          Upload
        </sl-button>
      </div>
      <div class="files" v-show="Object.keys(files).length != 0">
        <transition-group name="flip-list" tag="div">
          <div v-for="(file, i) in files" :key="i">
            <div class="file">
              <b-flex>
                <b-icon name="mdi mdi-file" size="20px"></b-icon>
                <span class="text-lg">{{ file.name }}</span>
                <b-spacer></b-spacer>
                <transition name="zoom" mode="out-in">
                  <sl-tooltip hoist content="Remove File" v-if="file.done">
                    <sl-icon-button
                      v-on:click="deleteFile(file)"
                      name="dash-lg"
                    ></sl-icon-button>
                  </sl-tooltip>
                  <sl-spinner v-else style="font-size: 1.5rem"></sl-spinner>
                </transition>
              </b-flex>
              <div
                class="progress"
                :style="`width: ${file.done ? `0` : file.progress}%`"
              ></div>
            </div>
          </div>
        </transition-group>
        <b-flex bare>
          <b-spacer></b-spacer>
          <sl-button @click="$refs.fileInp.click()" variant="primary" outline>
            <sl-icon slot="prefix" name="plus-lg"></sl-icon> Upload More
          </sl-button>
        </b-flex>
      </div>
    </div>

    <div slot="footer" v-show="allFilesLoaded">
      <br />
      <b-flex style="height: max-content">
        <sl-textarea
          class="w-full"
          resize="auto"
          placeholder="Message (Optional)"
          v-model="message"
          rows="1"
        ></sl-textarea>
        <b-spacer></b-spacer>
        <sl-button @click="sendFiles()" variant="primary">
          Send <sl-icon library="oneline" slot="suffix" name="send"></sl-icon>
        </sl-button>
      </b-flex>
    </div>
  </sl-dialog>
</template>
<script>
/* eslint-disable */
import { BCard, BBtn, BFlex } from "bounce-ui-vue";
import EmojiConvertor from "emoji-js";
let emojiConvertor = new EmojiConvertor();
emojiConvertor.allow_native = true;
emojiConvertor.replace_mode = "unified";
import {
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import { child, update, ref as dbRef, remove } from "firebase/database";
import { nanoid } from "nanoid";
import { storage } from "../../fire.js";
import db from "../../fire.js";
export default {
  components: { BCard, BBtn, BFlex },
  props: { chat: Object, user: Object },
  data: () => {
    return { dragging: false, files: {}, allFilesLoaded: false, message: "" };
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
    deleteFile(file) {
      console.log(file);
      this.files[file.id].done = false;
      deleteObject(ref(storage, file.path)).then(() => {
        delete this.files[file.id];
        if (Object.keys(this.files).length == 0) {
          this.allFilesLoaded = false;
        }
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
        id,
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
        if (file.type.split("/")[0] === "image") {
          update(child(ref(db), `chatImages/${this.chat.id}/${file.time}`), {
            sender: this.user.id,
            file,
            time: file.time,
          });
        }
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
@import './style.styl';
</style>
