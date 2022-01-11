<template>
  <audio
    :src="src"
    autoplay
    @canplay="loading = false"
    ref="audioPlayer"
    @timeupdate="onPlaying"
    @playing="playing = true"
    @pause="playing = false"
  >
    Your browser does not support the
    <code>audio</code> element.
  </audio>
  <div class="player">
    <b-btn :loading="loading" bounce circle icon @click="play" v-if="!playing"
      ><b-icon size="23px" name="mdi mdi-play"></b-icon
    ></b-btn>
    <b-btn bounce circle icon @click="pause" v-else
      ><b-icon size="23px" name="mdi mdi-pause"></b-icon
    ></b-btn>
    <input
      type="range"
      min="0"
      max="100"
      step="1"
      v-model="seekValue"
      @change="onSeek"
    />
    <span>{{ displayTime }}</span>
    <b-btn bounce size="tiny" style="margin-left: 5px" @click="checkSpeed()">
      {{ speed + "x" }}
    </b-btn>
  </div>
</template>

<script>
function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  minutes = minutes >= 10 ? minutes : "0" + minutes;
  seconds = Math.floor(seconds % 60);
  seconds = seconds >= 10 ? seconds : "0" + seconds;
  return minutes + ":" + seconds;
}
export default {
  name: "App",
  props: ["src"],
  data() {
    return {
      currentTime: 0,
      displayTime: "00:00",
      seekValue: 0,
      playing: false,
      speed: 1,
      loading: true,
    };
  },
  methods: {
    checkSpeed() {
      let speed = this.speed;
      if (speed == 2) {
        speed = 5;
      } else if (speed == 5) {
        speed = 0.75;
      } else if (speed == 0.75) {
        speed = 0.5;
      } else if (speed == 0.5) {
        speed = 1;
      } else {
        speed = 2;
      }
      this.setSpeed(speed);
    },
    changedState(e) {
      console.log(e);
      this.playing = e.playing;
    },
    play() {
      this.$refs.audioPlayer.play();
    },
    pause() {
      this.$refs.audioPlayer.pause();
    },
    stop() {
      const { audioPlayer } = this.$refs;
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    },
    setSpeed(speed) {
      this.$refs.audioPlayer.playbackRate = speed;
      this.speed = speed;
    },
    onPlaying() {
      const { audioPlayer } = this.$refs;
      if (!audioPlayer) {
        return;
      }
      this.currentTime = audioPlayer.currentTime;
      this.seekValue = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      this.displayTime = formatTime(audioPlayer.currentTime);
    },
    onSeek() {
      const { audioPlayer } = this.$refs;
      const seekto = audioPlayer.duration * (this.seekValue / 100);
      audioPlayer.currentTime = seekto;
    },
  },
};
</script>
<style lang="css">
.player {
  display: flex;
  align-items: center;
  flex-grow: 1;
}
.player input {
  flex-grow: 1;
  margin-inline: 1rem;
}
.player .btn.loading .spinner_parent {
  top: 9px !important;
}
</style>