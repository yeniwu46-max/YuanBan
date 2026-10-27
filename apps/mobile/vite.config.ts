import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { uniSlotCompat } from './build/uni-slot-compat'

const uniPlugin = typeof uni === 'function' ? uni : (uni as { default: typeof uni }).default

export default defineConfig({
  plugins: [uniSlotCompat(), uniPlugin()],
  // Resolve real package paths for pnpm's isolated dependency graph (Reka UI).
  resolve: {
    preserveSymlinks: false,
    alias: { 'reka-ui': realpathSync(fileURLToPath(new URL('./node_modules/reka-ui/dist/index.js', import.meta.url))) }
  },
  server: {
    host: '0.0.0.0',
    port: 5180,
    strictPort: true,
    warmup: {
      clientFiles: [
        './src/pages/tabs/tab0/index.vue',
        './src/pages/tabs/tab1/index.vue',
        './src/pages/tabs/tab2/index.vue',
        './src/pages/tabs/tab3/index.vue',
        './src/pages/home/index.vue',
        './src/pages/health/index.vue',
        './src/pages/companion/index.vue',
        './src/pages/service/index.vue',
        './src/pages/family/guardian/index.vue',
        './src/pages/family/report/index.vue',
        './src/pages/family/care/index.vue',
        './src/pages/family/settings/index.vue',
        './src/pages/community/dashboard/index.vue',
        './src/pages/community/workorders/index.vue',
        './src/pages/community/activity/index.vue',
        './src/pages/community/profile/index.vue',
        './src/pkg-elder-detail/sos/index.vue',
        './src/pkg-family-detail/family/alert/index.vue',
        './src/pkg-community-detail/community/alert/index.vue'
      ]
    }
  }
})
