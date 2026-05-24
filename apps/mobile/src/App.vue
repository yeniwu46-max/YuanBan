<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useAlertStore } from '@/stores/alert'

onLaunch(() => {
  useAlertStore().initLiveStats()
})
</script>

<style lang="scss">
@import './styles.scss';
</style>
