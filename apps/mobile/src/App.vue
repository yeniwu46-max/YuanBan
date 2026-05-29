<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useApiMode } from '@/config/apiMode'
import { useElderStore } from '@/stores/elder'
import { useGuardianStore } from '@/stores/guardian'
import { useHealthStore } from '@/stores/health'
import { syncFamilyDerivedState } from '@/stores/familySync'
import { useAlertStore } from '@/stores/alert'
import { configureTabBarForRole } from '@/utils/tabBar'
import { useSessionStore } from '@/stores/session'

onLaunch(() => {
  const session = useSessionStore()
  configureTabBarForRole(session.role)

  if (useApiMode()) {
    const elder = useElderStore()
    const health = useHealthStore()
    const guardian = useGuardianStore()
    void Promise.all([
      elder.hydrate('elder-001', { force: true }),
      health.hydrate('elder-001', { force: true }),
      guardian.hydrate({ force: true })
    ]).then(() => {
      syncFamilyDerivedState()
    })
  } else {
    syncFamilyDerivedState()
  }
})
</script>

<style lang="scss">
@import './styles.scss';
</style>
