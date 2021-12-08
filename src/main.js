import { createApp } from 'vue';
import bounce_ui from "bounce-ui-vue";
import Popper from "vue3-popper";
import Notifications from '@kyvg/vue3-notification';
import App from './App.vue';
import router from './router';
const app = createApp(App);
app.use(bounce_ui);
app.use(router);
app.use(Notifications);
app.component("Popper", Popper);
app.mount('#app');
app.config.globalProperties.$toggleTheme();
// node_modules\bounce-ui-vue\dist\bounce_ui.css