import { createWebHistory, createRouter } from "vue-router";
import Chat from "@/views/Chat/Chat.vue";
import Login from "@/views/Login/Login.vue";

const routes = [
  {
    path: "/",
    name: "Chat",
    component: Chat,
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

export default router;