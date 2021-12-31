/* eslint-disable */
import NProgress from "nprogress";
import { createWebHistory, createRouter } from "vue-router";
import Chat from "@/views/Chat/Chat.vue";
import Login from "@/views/Login/Login.vue"
import db from "../fire.js";
import { ref, set, get, child, onValue, update, limitToLast, query, onDisconnect } from "firebase/database";
const defaultTitle = "Oneline";
const routes = [
  {
    path: "/",
    component: Chat,
  },
  {
    path: '/invite/:groupId',
    redirect: to => {
      const userId = localStorage.getItem("id");
      const groupId = to.params.groupId;
      if (!userId) {
        return { path: '/login' }
      }
      get(child(ref(db), "messages/" + groupId))
        .then((snapshot) => {
          if (snapshot.exists()) {
            var data = snapshot.val();
            delete data.messages;
            console.log(data);
            let members = data.members;
            members.push(userId);
            const chat = data;
            chat.addedTime = Date.now();
            update(child(ref(db), `messages/${groupId}`), { members });
            update(child(ref(db), `users/${userId}/chats`), { [data.id]: chat });
          } else {
            alert(
              "Group not found"
            );
            this.newChat.data.group.loading = false;
          }
          return { path: '/' }
        });
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeResolve((to, from, next) => {
  if (to.name) {
    NProgress.start();
  }
  next();
});

router.afterEach((to) => {
  console.log(to);
  document.title = to.name ? `${to.name} | Oneline` : defaultTitle;
  NProgress.done();
});
export default router;