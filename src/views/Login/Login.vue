<template>
  <Head>
    <title>Login | Oneline</title>
    <meta property="og:description" content="Login to use Oneline" />
  </Head>
  <b-app>
    <b-flex>
      <b-spacer></b-spacer>
    </b-flex>
    <sl-card>
      <div slot="header">
        <b-flex>
          <img
            height="35"
            src="../../assets/logos/logo.png"
            alt="Oneline Logo"
          />
          <h4>Oneline</h4>
        </b-flex>
      </div>
      <sl-tab-group class="centered">
        <sl-tab slot="nav" panel="login">Login</sl-tab>
        <sl-tab slot="nav" panel="signUp">Sign Up</sl-tab>
        <sl-tab-panel name="login">
          <p>
            <b-form @submit="checkUser()">
              <sl-input
                v-model="login.email"
                label="Email"
                type="email"
                :helpText="login.emailErrorText"
              ></sl-input>
              <sl-input
                v-model="login.pwd"
                label="Password"
                :helpText="login.pwdErrorText"
                type="password"
                toggle-password
              ></sl-input>
            </b-form>
          </p>
          <br />
          <sl-button
            :loading="login.loading"
            @click="checkUser()"
            class="w-full"
            variant="primary"
          >
            Login
          </sl-button>
        </sl-tab-panel>
        <sl-tab-panel name="signUp">
          <p>
            <b-form @submit="createUser()">
              <sl-input v-model="signUp.username" label="Username"></sl-input>
              <sl-input
                v-model="signUp.email"
                label="Email"
                type="email"
              ></sl-input>
              <sl-input
                v-model="signUp.pwd"
                label="Password"
                type="password"
              ></sl-input>
              <sl-textarea
                rows="1"
                v-model="signUp.description"
                label="Description"
              ></sl-textarea>
            </b-form>
          </p>
          <br />
          <sl-button
            @click="createUser()"
            class="w-full"
            variant="primary"
            :loading="signUp.loading"
          >
            Sign Up
          </sl-button>
        </sl-tab-panel>
      </sl-tab-group>
    </sl-card>
  </b-app>
</template>

<script>
import db from "../../fire.js";
import {
  ref,
  set,
  // off,
  query,
  onValue,
  startAt,
  endAt,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { nanoid } from "nanoid";
import router from "../../router";
export default {
  data: () => {
    return {
      signUp: {
        username: "",
        pwd: "",
        email: "",
        loading: false,
        description: "",
      },
      login: {
        pwd: "",
        email: "",
        loading: false,
        emailErrorText: "",
        pwdErrorText: "",
      },
    };
  },
  methods: {
    createUser() {
      this.signUp.loading = true;
      const userId = nanoid();
      set(ref(db, "users/" + userId), {
        id: userId,
        username: this.signUp.username,
        email: this.signUp.email,
        description: this.signUp.description,
        pwd: this.signUp.pwd,
        chats: [],
      });
      this.signUp.loading = false;
      localStorage.setItem("id", userId);
      router.push("/");
      localStorage.removeItem("lastOpenedChat");
    },
    checkUser() {
      this.login.loading = true;
      this.login.emailErrorText = "";
      this.login.pwdErrorText = "";
      onValue(
        query(
          ref(db, `users/`),
          orderByChild("email"),
          limitToLast(1),
          startAt(this.login.email),
          endAt(this.login.email + "\uf8ff")
        ),
        (snapshot) => {
          this.login.loading = false;
          if (!snapshot.exists()) {
            this.login.emailErrorText = "Invalid Email";
            return;
          }
          const data = snapshot.val();
          const usr = data[Object.keys(data)[0]];
          if (usr.pwd == this.login.pwd) {
            console.log(usr);
            localStorage.setItem("id", usr.id);
            localStorage.removeItem("lastOpenedChat");
            router.push("/");
          } else {
            this.login.pwdErrorText = "Wrong Password";
          }
        }
      );
    },
  },
};
</script>

<style scoped>
sl-card {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translate(-50%);
  width: 360px;
}

h4 {
  margin: 0;
}
</style>
