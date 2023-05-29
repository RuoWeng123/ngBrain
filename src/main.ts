import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initDb } from 'ngBrain/utils/idbData'
import ElementPlus from 'element-plus'
import socket from './socket/initSocket'
import App from './App.vue'
import router from './router'

import './assets/main.css'
initDb();
const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.mixin(socket)

app.mount('#app')
