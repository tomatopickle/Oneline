import { createApp } from 'vue';
import bounce_ui from "bounce-ui-vue";
import Popper from "vue3-popper";
import Notifications from '@kyvg/vue3-notification';
import App from './App.vue';
import VLazyImage from "v-lazy-image";
import FileUpload from "./components/FileUpload/FileUpload.vue";
import VuePlyr from 'vue-plyr'
import 'vue-plyr/dist/vue-plyr.css'
import router from './router';
import './registerServiceWorker'
const app = createApp(App);
app.use(bounce_ui);
app.use(router);
app.component("VLazyImage", VLazyImage);
app.component("FileUpload", FileUpload);
app.use(Notifications);
app.use(VuePlyr, {
    plyr: {}
})
app.component("Popper", Popper);
app.mount('#app');
app.config.globalProperties.$toggleTheme();
// node_modules\bounce-ui-vue\dist\bounce_ui.css