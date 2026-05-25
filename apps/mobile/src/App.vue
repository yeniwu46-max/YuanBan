<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { syncFamilyDerivedState } from '@/stores/familySync'

onLaunch(() => {
  syncFamilyDerivedState()
})
</script>

<style lang="scss">
@import './styles.scss';
</style>
