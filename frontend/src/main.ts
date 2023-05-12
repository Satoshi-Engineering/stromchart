import { createApp } from 'vue'

import '@/modules/polyfill.randomUUID'
import '@/assets/css/main.css'
import i18n from '@/modules/initI18n'
import router from '@/router'
import App from '@/App.vue'

const app = createApp(App)
app.use(i18n)

app.use(router)

app.mount('#app')
