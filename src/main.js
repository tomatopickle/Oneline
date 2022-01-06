import { createApp } from 'vue';
import bounce_ui from "bounce-ui-vue";
import { ObserveVisibility } from 'vue-observe-visibility';
import Popper from "vue3-popper";
import Notifications from '@kyvg/vue3-notification';
import App from './App.vue';
import VLazyImage from "v-lazy-image";
import router from './router';
import './registerServiceWorker'
const app = createApp(App);
app.use(bounce_ui);
app.use(router);
app.component("VLazyImage",VLazyImage);
app.use(Notifications);
app.component("Popper", Popper);
app.directive('observe-visibility', { beforeMount: ObserveVisibility.beforeMount, update: ObserveVisibility.update, unmounted: ObserveVisibility.unbind });
app.mount('#app');
app.config.globalProperties.$toggleTheme();
// node_modules\bounce-ui-vue\dist\bounce_ui.css