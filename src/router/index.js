/* eslint-disable */
// https://8080-ivory-locust-dd1gz0gt.ws-eu28.gitpod.io/user/NiF99xoa7mQDWGZWW8ckO
import NProgress from "nprogress";
import { createWebHistory, createRouter } from "vue-router";
import Chat from "@/views/Chat/Chat.vue";
import Login from "@/views/Login/Login.vue";
import Meeting from "@/views/Meeting/Meeting.vue"; 
import Invite from "@/views/Invite/Invite.vue";
import User from "@/views/User/User.vue";
const defaultTitle = "Oneline";
const routes = [
  {
    path: "/",
    component: Chat,
  },
  {
    path: "/invite",
    name: "Group Invite",
    component: Invite,
  },
  {
    path: "/user/:userId",
    name: "User",
    component: User,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/meeting",
    name: "Meeting",
    component: Meeting,
  }
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
  // document.title = to.name ? `${to.name} | Oneline` : defaultTitle;
  NProgress.done();
});
export default router;