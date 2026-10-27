import { reactive } from 'vue'
export const requestStatus = reactive({ failedPaths: [] as string[] })
export function requestFailed(path: string) {
  if (!path.includes('/auth/') && !requestStatus.failedPaths.includes(path))
    requestStatus.failedPaths.push(path)
}
export function requestSucceeded(path: string) {
  requestStatus.failedPaths = requestStatus.failedPaths.filter((p) => p !== path)
}
