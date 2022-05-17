import { createApp } from "vue";
import { VueMasonryPlugin } from "vue-masonry/src/masonry.plugin.js";
import { createHead, Head } from "@vueuse/head";
import bounce_ui from "bounce-ui-vue";
import Popper from "vue3-popper";
import { Skeletor } from "vue-skeletor";
import Notifications from "@kyvg/vue3-notification";
import App from "./App.vue";
import VLazyImage from "v-lazy-image";
import FileUpload from "./components/FileUpload/FileUpload.vue";
import router from "./router";
import "./registerServiceWorker";
import "vue-skeletor/dist/vue-skeletor.css";
import "@shoelace-style/shoelace";
import "@shoelace-style/shoelace/dist/themes/light.css";
import "@shoelace-style/shoelace/dist/themes/dark.css";
import ShoelaceModelDirective from "@shoelace-style/vue-sl-model";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import { registerIconLibrary } from "@shoelace-style/shoelace/dist/utilities/icon-library.js";

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.73/dist/"
);

const url = location.href;
const oldUrl = "oneline-web.netlify.app";
if (url.includes(oldUrl)) {
  location.replace(url.replace(oldUrl, "oneline.surge.sh"));
}

const app = createApp(App);
const head = createHead();
app.use(ShoelaceModelDirective);
app.use(head);
app.use(bounce_ui);
app.use(router);
app.use(VueMasonryPlugin);
app.use(Notifications);
app.component("VLazyImage", VLazyImage);
app.component("FileUpload", FileUpload);
app.component("Head", Head);
app.component(Skeletor.name, Skeletor);
app.component("Popper", Popper);
app.mount("#app");

if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  document.querySelector("html").classList.add("dark");
  document.querySelector("html").classList.add("sl-theme-dark");
}

registerIconLibrary("oneline", {
  resolver: (name) => `./svgs/${name}.svg`,
  mutator: (svg) => svg.setAttribute("fill", "currentColor"),
});
