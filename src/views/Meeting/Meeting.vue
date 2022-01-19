<template>
  <main class="wrapper">
    <div class="call-container">
      <!-- The Daily Prebuilt iframe is embedded in the div below using the ref -->
      <div id="call" ref="callRef"></div>
    </div>
  </main>
</template>

<script>
import DailyIframe from "@daily-co/daily-js";
import api from "./api.js";

const IFRAME_OPTIONS = {
  height: "100%",
  width: "100%",
  aspectRatio: 16 / 9,
  minWidth: "400px",
  maxWidth: "100vw",
  border: "none",
};

export default {
  name: "Meeting",
  data() {
    return {
      roomUrl: "",
      status: "call",
      user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : { username: "Guest" },
      callFrame: null,
      validRoomURL: false,
      roomError: false,
    };
  },
  mounted() {
    console.log("Im here");
    console.log(this.$route.query.meetingId);
    this.roomUrl = this.$route.query.meetingId;
    this.joinRoom(this.roomUrl);
  },
  methods: {
    createAndJoinRoom() {
      api
        .createRoom()
        .then((room) => {
          this.roomUrl = room.url;
          this.joinRoom(room.url);
        })
        .catch((e) => {
          console.log(e);
          this.roomError = true;
        });
    },
    // Daily callframe created and joined below
    joinRoom(url) {
      if (this.callFrame) {
        this.callFrame.destroy();
      }

      // Daily event callbacks
      const logEvent = (ev) => console.log(ev);
      const goToLobby = () => (this.status = "lobby");
      const goToCall = () => (this.status = "call");
      const leaveCall = () => {
        if (this.callFrame) {
          this.status = "home";
          this.callFrame.destroy();
        }
      };
      // DailyIframe container element
      const callWrapper = this.$refs.callRef;
      // Create Daily call
      const callFrame = DailyIframe.createFrame(callWrapper, {
        iframeStyle: IFRAME_OPTIONS,
        customLayout: true,
        cssFile: "./meetingStyle.css",
        showLeaveButton: true,
        userName: this.user.username || "",
      });
      callFrame.setTheme({
        colors: {
          accent: "#276ef1",
          accentText: "#FFFFFF",
          background: "#161618",
          backgroundAccent: "#232326",
          baseText: "#FFFFFF",
          border: "#2e2e2e",
          mainAreaBg: "#161618",
          mainAreaBgAccent: "#0c0c0d",
          mainAreaText: "#FFFFFF",
          supportiveText: "#FFFFFF",
        },
      });
      this.callFrame = callFrame;

      // Add event listeners and join call
      callFrame
        .on("loaded", logEvent)
        .on("started-camera", logEvent)
        .on("camera-error", logEvent)
        .on("joining-meeting", goToLobby)
        .on("joined-meeting", goToCall)
        .on("left-meeting", leaveCall);

      callFrame.join({ url, showFullscreenButton: true });
    },
    submitJoinRoom(e) {
      e.preventDefault();
      this.joinRoom(this.roomUrl);
    },
    validateInput(e) {
      this.validRoomURL = !!this.roomUrl && e.target.checkValidity();
    },
  },
};
</script>

<style>
html,
body ,#app,.wrapper,
.call-container,
#call {
  height: 100%;
  width: 100%;
}
</style>
