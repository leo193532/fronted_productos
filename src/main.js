import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import router from './router'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'
import PrimeVueComponents from './plugins/primevue'

const app = createApp(App)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

app.use(router)
app.use(ToastService)
app.use(PrimeVueComponents)
app.mount('#app')
