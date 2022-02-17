<template>
  <b-card height="500px" glass>
    <template #header>
      <b-flex>
        <h4 class="mt-0 mb-0">Upload Short</h4>
        <b-spacer></b-spacer>
        <b-btn icon ghost @click="$emit('close')"
          ><b-icon name="mdi mdi-close"></b-icon
        ></b-btn>
      </b-flex>
    </template>
    <div>
      <transition name="fadeUp" mode="out-in">
        <div v-if="!data.src">
          <b-btn
            @click="uploadVideo()"
            :loading="uploadBtnLoading"
            color="primary"
            class="center mt-36"
          >
            <b-icon left name="mdi mdi-tray-arrow-up"></b-icon>
            Upload Video
          </b-btn>
          <br /><br />
        </div>
        <div v-else>
          <video controls autoplay :src="data.src"></video>
          <br /><br /><br />
          <b-btn block color="primary" class="mt-1" @click="uploadShortVideo()">
            <b-icon left name="mdi mdi-tray-arrow-up"></b-icon>
            Upload Short
          </b-btn>
        </div>
      </transition>
    </div>
    <template #footer> </template>
  </b-card>
</template>
<script>
import { storage } from "@/fire.js";
import db from "@/fire.js";
import {
  ref as storageRef,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { ref, set } from "firebase/database";
export default {
  name: "ShortVideoUploader",
  props: ["user"],
  inject: ["openShort"],
  emits: ["close"],
  data: () => {
    return {
      showModal: false,
      uploadBtnLoading: false,
      data: { src: "" },
    };
  },
  methods: {
    uploadVideo() {
      var input = document.createElement("input");
      input.type = "file";

      input.onchange = (e) => {
        this.uploadBtnLoading = true;
        var file = e.target.files[0];
        input.remove();
        console.log(file);
        uploadBytes(
          storageRef(storage, `stories/${this.user.id}/${Date.now()}`),
          file
        ).then((snapshot) => {
          console.log("Uploaded a blob or file!");
          console.log(snapshot);
          getDownloadURL(snapshot.metadata.ref).then((url) => {
            this.data.src = url;
            this.uploadBtnLoading = false;
            this.$emit("close");
          });
        });
      };
      input.click();
    },
    uploadShortVideo() {
      const time = Date.now();
      set(ref(db, `shorts/${this.user.id}/${time}`), {
        time,
        type: "video",
        src: this.data.src,
      });
      this.openShort({ user: this.user, badge: 1 });
      this.data.src = "";
      this.$emit("close");
    },
  },
};
</script>
<style lang="stylus"></style>