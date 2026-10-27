import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import AppPage from './components/AppPage.vue'
import AppIcon from './components/AppIcon.vue'
// #ifdef H5
import { installH5Accessibility } from './utils/h5Accessibility'
// #endif

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  app.component('AppPage', AppPage)
  app.component('AppIcon', AppIcon)
  // #ifdef H5
  if (typeof document !== 'undefined') installH5Accessibility()
  // #endif
  return {
    app
  }
}

