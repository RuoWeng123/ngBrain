import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initDb } from 'ngBrain/utils/idbData'

import App from './App.vue'
import router from './router'

import './assets/main.css'
initDb();
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
