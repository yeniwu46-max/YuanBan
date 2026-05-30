<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useApiMode } from '@/config/apiMode'
import { useElderStore } from '@/stores/elder'
import { useGuardianStore } from '@/stores/guardian'
import { useHealthStore } from '@/stores/health'
import { syncFamilyDerivedState } from '@/stores/familySync'
import { configureTabBarForRole } from '@/utils/tabBar'
import { useSessionStore } from '@/stores/session'
import { goReplace } from '@/utils/navigate'
import { prefetchForRole } from '@/services/prefetch'

onLaunch(async () => {
  const session = useSessionStore()
  configureTabBarForRole(session.role)

  if (useApiMode()) {
    const ok = await session.restoreSession()
    if (!ok) {
      goReplace('/pages/login-welcome/index')
      return
    }
    await prefetchForRole()
    syncFamilyDerivedState()
  } else {
    syncFamilyDerivedState()
  }
})
</script>

<style lang="scss">
@import './styles.scss';
</style>
