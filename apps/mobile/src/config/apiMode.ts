/** 生产构建设 VITE_USE_API=true 时走 REST；本地开发默认 Mock */
export function useApiMode(): boolean {
  const env = (import.meta as ImportMeta & { env?: { VITE_USE_API?: string } }).env
  return env?.VITE_USE_API === 'true'
}
