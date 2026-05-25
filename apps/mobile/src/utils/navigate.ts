const FAMILY_TABS = new Set([
  '/pages/family/guardian/index',
  '/pages/family/report/index',
  '/pages/family/care/index',
  '/pages/family/settings/index'
])

const COMMUNITY_TABS = new Set([
  '/pages/community/dashboard/index',
  '/pages/community/workorders/index',
  '/pages/community/activity/index',
  '/pages/community/profile/index'
])

const ELDER_TABS = new Set([
  '/pages/home/index',
  '/pages/health/index',
  '/pages/companion/index',
  '/pages/service/index'
])

function normalizeRoute(route?: string) {
  if (!route) return ''
  return route.startsWith('/') ? route : `/${route}`
}

export function getCurrentRoute() {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1] as { route?: string } | undefined
  return normalizeRoute(current?.route)
}

function isSameRoute(url: string) {
  return getCurrentRoute() === normalizeRoute(url)
}

function runNavigate(
  primary: 'reLaunch' | 'redirectTo' | 'navigateTo',
  url: string,
  fallback: 'reLaunch' | 'redirectTo' = 'reLaunch'
) {
  if (isSameRoute(url)) return

  const onFail = () => {
    if (fallback === primary) return
    if (fallback === 'reLaunch') {
      uni.reLaunch({ url })
      return
    }
    uni.redirectTo({ url })
  }

  if (primary === 'reLaunch') {
    uni.reLaunch({ url, fail: onFail })
    return
  }
  if (primary === 'redirectTo') {
    uni.redirectTo({ url, fail: onFail })
    return
  }
  uni.navigateTo({ url, fail: onFail })
}

/** 子女端 / 老人端底部 Tab 切换：清空页面栈，移动端更稳 */
export function goMainTab(url: string) {
  if (
    FAMILY_TABS.has(normalizeRoute(url)) ||
    ELDER_TABS.has(normalizeRoute(url)) ||
    COMMUNITY_TABS.has(normalizeRoute(url))
  ) {
    runNavigate('reLaunch', url)
    return
  }
  runNavigate('reLaunch', url)
}

/** 登录等线性流程：替换当前页 */
export function goReplace(url: string) {
  runNavigate('redirectTo', url, 'reLaunch')
}

/** 进入详情页：保留返回栈 */
export function goDetail(url: string) {
  runNavigate('navigateTo', url, 'reLaunch')
}

/** 登录完成或需要重置栈时 */
export function goHome(url: string) {
  runNavigate('reLaunch', url)
}

/** 优先返回上一页，否则回到兜底页 */
export function goBack(fallback: string) {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({
      fail: () => goHome(fallback)
    })
    return
  }
  goHome(fallback)
}

export function isFamilyTab(url: string) {
  return FAMILY_TABS.has(normalizeRoute(url))
}

export function isCommunityTab(url: string) {
  return COMMUNITY_TABS.has(normalizeRoute(url))
}
