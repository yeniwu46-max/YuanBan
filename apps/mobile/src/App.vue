<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useApiMode } from '@/config/apiMode'
import { useElderStore } from '@/stores/elder'
import { useGuardianStore } from '@/stores/guardian'
import { useHealthStore } from '@/stores/health'
import { syncFamilyDerivedState } from '@/stores/familySync'
import { useAlertStore } from '@/stores/alert'

onLaunch(() => {
  if (useApiMode()) {
    const elder = useElderStore()
    const health = useHealthStore()
    const guardian = useGuardianStore()
    const alert = useAlertStore()
    void Promise.all([
      elder.hydrate(),
      health.hydrate(),
      guardian.hydrate(),
      alert.hydrate()
    ]).then(() => syncFamilyDerivedState())
  } else {
    syncFamilyDerivedState()
  }
})
</script>

<style lang="scss">
@import './styles.scss';
</style>
