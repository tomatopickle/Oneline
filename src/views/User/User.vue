<template>
  <b-app :loading="loading" loading-text="Loading User Info">
    <b-card width="500px" class="center">
      <b-flex>
        <div>
          <b-avatar
            :size="75"
            :username="user.username ? user.username : ''"
            :src="user?.avatar"
          ></b-avatar>
        </div>
        <div id="userInfo">
          <h1 class="m-0 mt-3 ml-2">
            {{ user?.username }}
          </h1>
          <p id="userInfoPara">
            {{ user?.description }}
          </p>
        </div>
      </b-flex>
    </b-card>
  </b-app>
</template>

<script>
/* eslint-disable */
import db from "../../fire.js";
import { ref, get, child, update } from "firebase/database";
export default {
  data: () => {
    return {
      loading: true,
      user: {},
    };
  },
  mounted() {
    const groupId = this.$route.query.groupId;
    get(child(ref(db), "users/" + this.$route.params.userId)).then(
      (snapshot) => {
        if (snapshot.exists()) {
          var data = snapshot.val();
          this.user = data;
          this.loading = false;
          this.btnLoading = false;
        } else {
          alert("Invalid Invite, please try with a different URL");
          this.$router.push("/");
        }
      }
    );
  },
  methods: {},
};
</script>

<style scoped>
.card {
  margin-top: 5vh;
}
#userInfo {
  margin-left: 15px;
}
#userInfoPara {
  margin-left: 0;
}
</style>
