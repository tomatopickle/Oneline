<template>
  <Head>
    <title>Login | Oneline</title>
    <meta property="og:description" content="Login to use Oneline" />
  </Head>
  <b-app>
    <b-flex>
      <b-spacer></b-spacer>
      <b-btn icon @click="$toggleTheme"
        ><b-icon name="mdi mdi-brightness-6"></b-icon
      ></b-btn>
    </b-flex>
    <b-card width="350px">
      <template v-slot:header>
        <b-flex>
          <img
            height="35"
            src="../../assets/logos/logo.png"
            alt="Oneline Logo"
          />
          <h4>Oneline</h4>
        </b-flex>
      </template>
      <p>
        <b-tab
          style="width: 75%"
          class="center"
          v-model="tabIndex"
          :tabs="tabs"
        ></b-tab>

        <br />
        <b-tab-content v-model="tabIndex" :tabs="tabs">
          <template v-slot:0>
            <p>
              <b-form @submit="checkUser()">
                <b-input
                  v-model="login.email"
                  label="Email"
                  type="email"
                  :errorText="login.emailErrorText"
                ></b-input>
                <b-input
                  v-model="login.pwd"
                  label="Password"
                  :errorText="login.pwdErrorText"
                  type="password"
                ></b-input>
              </b-form>
            </p>
            <br />
            <b-btn
              :loading="login.loading"
              @click="checkUser()"
              block
              color="primary"
            >
              Login
            </b-btn>
            <br />
          </template>
          <template v-slot:1>
            <p>
              <b-form @submit="createUser()">
                <b-input v-model="signUp.username" label="Username"></b-input>
                <b-input
                  v-model="signUp.email"
                  label="Email"
                  type="email"
                ></b-input>
                <b-input
                  v-model="signUp.pwd"
                  label="Password"
                  type="password"
                ></b-input>
                <b-textarea
                  v-model="signUp.description"
                  label="Description"
                ></b-textarea>
              </b-form>
            </p>
            <br />
            <b-btn
              @click="createUser()"
              block
              color="primary"
              :loading="signUp.loading"
            >
              Sign Up
            </b-btn>
            <br />
          </template>
        </b-tab-content>
      </p>
    </b-card>
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
      tabs: [
        { name: "Login", value: "login" },
        { name: "Sign Up", value: "signup" },
      ],
      tabIndex: 0,
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
            // router.push("/");
          } else {
            this.login.pwdErrorText = "Wrong Password";
          }
        }
      );
      // get(child(ref(db), `users`))
      //   .then((snapshot) => {
      //     if (snapshot.exists()) {
      //       var data = snapshot.val();
      //       console.log(data);
      //       for (var usr in data) {
      //         usr = data[usr];
      //         if (usr.pwd == this.login.pwd && usr.email == this.login.email) {
      //           localStorage.setItem("id", usr.id);
      //           // router.push("/");
      //           this.login.loading = false;
      //         }
      //       }
      //       this.login.loading = false;
      //     } else {
      //       alert(
      //         "An error occurred with Oneline, please try again later. \nError: /users/ not available"
      //       );
      //       this.login.loading = false;
      //     }
      //   })
      //   .catch((error) => {
      //     console.error(error);
      //   });
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