import { createApp } from 'vue';
import App from './App.vue';
import './assets/app.css';

window.BASENAME = 'keepInMindWordsDictionary';
window.PROFILESTORE = 'keepInMindWordsDictionaryProfiles';
window.DICTSTORE = 'keepInMindWordsDictionaries';

createApp(App).mount('#app');
