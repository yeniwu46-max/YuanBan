import type { UserRole } from '@/types/family'

export const TAB_SHELL_PATHS = [
  '/pages/tabs/tab0/index',
  '/pages/tabs/tab1/index',
  '/pages/tabs/tab2/index',
  '/pages/tabs/tab3/index'
] as const

export type TabShellPath = (typeof TAB_SHELL_PATHS)[number]

export type TabItem = {
  key: string
  label: string
  contentPath: string
  shellPath: TabShellPath
}

const ELDER_TABS: TabItem[] = [
  { key: 'home', label: '首页', contentPath: '/pages/home/index', shellPath: TAB_SHELL_PATHS[0] },
  { key: 'health', label: '健康', contentPath: '/pages/health/index', shellPath: TAB_SHELL_PATHS[1] },
  { key: 'companion', label: '小鼋', contentPath: '/pages/companion/index', shellPath: TAB_SHELL_PATHS[2] },
  { key: 'service', label: '服务', contentPath: '/pages/service/index', shellPath: TAB_SHELL_PATHS[3] }
]

const FAMILY_TABS: TabItem[] = [
  { key: 'guardian', label: '守护', contentPath: '/pages/family/guardian/index', shellPath: TAB_SHELL_PATHS[0] },
  { key: 'report', label: '报告', contentPath: '/pages/family/report/index', shellPath: TAB_SHELL_PATHS[1] },
  { key: 'care', label: '关怀', contentPath: '/pages/family/care/index', shellPath: TAB_SHELL_PATHS[2] },
  { key: 'settings', label: '设置', contentPath: '/pages/family/settings/index', shellPath: TAB_SHELL_PATHS[3] }
]

const COMMUNITY_TABS: TabItem[] = [
  { key: 'dashboard', label: '看板', contentPath: '/pages/community/dashboard/index', shellPath: TAB_SHELL_PATHS[0] },
  { key: 'workorders', label: '工单', contentPath: '/pages/community/workorders/index', shellPath: TAB_SHELL_PATHS[1] },
  { key: 'activity', label: '活动', contentPath: '/pages/community/activity/index', shellPath: TAB_SHELL_PATHS[2] },
  { key: 'profile', label: '档案', contentPath: '/pages/community/profile/index', shellPath: TAB_SHELL_PATHS[3] }
]

export const ROLE_TABS: Record<UserRole, TabItem[]> = {
  elder: ELDER_TABS,
  family: FAMILY_TABS,
  community: COMMUNITY_TABS
}

const ALL_CONTENT_PATHS = new Set(
  [...ELDER_TABS, ...FAMILY_TABS, ...COMMUNITY_TABS].map((t) => t.contentPath)
)

export function normalizeRoute(route?: string) {
  if (!route) return ''
  const path = route.startsWith('/') ? route : `/${route}`
  return path.split('?')[0] ?? path
}

export function getTabsForRole(role: UserRole): TabItem[] {
  return ROLE_TABS[role]
}

export function isTabContentRoute(url: string) {
  return ALL_CONTENT_PATHS.has(normalizeRoute(url))
}

export function isTabShellRoute(url: string) {
  return TAB_SHELL_PATHS.includes(normalizeRoute(url) as TabShellPath)
}

export function resolveShellPath(contentOrShellUrl: string, role: UserRole): string | null {
  const normalized = normalizeRoute(contentOrShellUrl)
  if (TAB_SHELL_PATHS.includes(normalized as TabShellPath)) {
    return normalized
  }
  const tabs = getTabsForRole(role)
  const match = tabs.find((t) => t.contentPath === normalized)
  return match?.shellPath ?? null
}

export function resolveContentPath(shellOrContentUrl: string, role: UserRole): string | null {
  const normalized = normalizeRoute(shellOrContentUrl)
  const tabs = getTabsForRole(role)
  const byShell = tabs.find((t) => t.shellPath === normalized)
  if (byShell) return byShell.contentPath
  const byContent = tabs.find((t) => t.contentPath === normalized)
  return byContent?.contentPath ?? null
}

export function getDefaultHomeShell(role: UserRole) {
  return TAB_SHELL_PATHS[0]
}

/** 同步原生 tabBar 文案（custom tabBar 下主要供 MP 兼容） */
export function configureTabBarForRole(role: UserRole) {
  const tabs = getTabsForRole(role)
  tabs.forEach((tab, index) => {
    uni.setTabBarItem({
      index,
      text: tab.label,
      pagePath: tab.shellPath.replace(/^\//, '')
    })
  })
}
