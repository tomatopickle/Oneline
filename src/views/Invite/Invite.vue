<template>
  <b-app :loading="loading" loading-text="Loading Invite Info">
    <b-card width="350px">
      <template v-slot:header>
        <b-flex bare>
          <img
            height="35"
            src="../../assets/logos/logo.png"
            alt="Oneline Logo"
          />
          <h4 class="font-medium ml-3">Invitation</h4>
        </b-flex>
      </template>
      <b-avatar :username="inv.name" class="center"></b-avatar>
      <h3 class="text-center">{{ inv.name }}</h3>
      <p class="text-center">{{ inv.description }}</p>
      <br />
      <b-flex class="center">
        <b-spacer></b-spacer>
        <b-btn @click="$router.push('/')">Cancel</b-btn> 
        <b-btn @click="addToGroup()" :loading="btnLoading" color="primary"
          >Join Group</b-btn
        >
        <b-spacer></b-spacer>
      </b-flex>
    </b-card>
  </b-app>
</template>

<script>
import db from "../../fire.js";
import { ref, get, child, update } from "firebase/database";
export default {
  data: () => {
    return {
      loading: true,
      inv: {
        name: "",
      },
      btnLoading: true,
    };
  },
  mounted() {
    const groupId = this.$route.query.groupId;
    get(child(ref(db), "messages/" + groupId)).then((snapshot) => {
      if (snapshot.exists()) {
        var data = snapshot.val();
        this.inv = data;
        this.loading = false;
        this.btnLoading = false;
      } else {
        alert("Invalid Invite, please try with a different URL");
        this.$router.push("/");
      }
    });
  },
  methods: {
    addToGroup() {
      this.btnLoading = true;
      const userId = localStorage.getItem("id");
      const groupId = this.$route.query.groupId;
      if (!userId) {
        this.$router.push("/login");
      }
      get(child(ref(db), "messages/" + groupId)).then((snapshot) => {
        if (snapshot.exists()) {
          get(child(ref(db), "users/" + userId)).then((snapshot) => {
            update(
              child(ref(db), `messages/${groupId}/messages/${Date.now()}`),
              {
                text: `${snapshot.val().username} joined the group`,
                type: "info",
                time: Date.now(),
                sender: userId,
                action: "groupJoined",
              }
            );
          });
          var data = snapshot.val();
          delete data.messages;
          console.log(data);
          let members = data.members;
          members.push(userId);
          const chat = data;
          chat.addedTime = Date.now();
          update(child(ref(db), `messages/${groupId}`), { members });
          // We don't want members property in user data
          delete chat.messages;
          update(child(ref(db), `users/${userId}/chats`), { [data.id]: chat });
          this.btnLoading = false;
          this.$router.push("/");
        } else {
          alert("Invalid Invite, please try with a different URL");
          this.$router.push("/");
        }
      });
    },
  },
};
</script>

<style scoped>
.card {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translate(-50%);
}
</style>
