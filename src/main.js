import { createApp } from 'vue';
import { VueMasonryPlugin } from "vue-masonry/src/masonry.plugin.js";
import { createHead, Head } from '@vueuse/head';
import bounce_ui from "bounce-ui-vue";
import Popper from "vue3-popper";
import Notifications from '@kyvg/vue3-notification';
import App from './App.vue';
import VLazyImage from "v-lazy-image";
import FileUpload from "./components/FileUpload/FileUpload.vue";
import router from './router';
import './registerServiceWorker'
const app = createApp(App);
const head = createHead();
app.use(head);
app.use(bounce_ui);
app.use(router);
app.use(VueMasonryPlugin);
app.component("VLazyImage", VLazyImage);
app.component("FileUpload", FileUpload);
app.component("Head", Head);
app.use(Notifications);
app.component("Popper", Popper);
app.mount('#app');
// node_modules\bounce-ui-vue\dist\bounce_ui.css