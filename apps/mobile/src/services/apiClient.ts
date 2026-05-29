const DEFAULT_BASE = 'http://localhost:8000'

declare const uni: {
  request?: (options: {
    url: string
    method?: string
    data?: unknown
    header?: Record<string, string>
    success?: (res: { statusCode: number; data: unknown }) => void
    fail?: (err: unknown) => void
  }) => void
}

export function getApiBaseUrl(): string {
  const env = import.meta.env as ImportMeta['env'] & {
    VITE_API_BASE?: string
  }
  const fromEnv = env.VITE_API_BASE
  return fromEnv || DEFAULT_BASE
}

export type ApiRole = 'elder' | 'family' | 'community'

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  role?: ApiRole
  userId?: string
}

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, detail: unknown) {
    super(typeof detail === 'string' ? detail : `HTTP ${status}`)
    this.status = status
    this.detail = detail
  }
}

function buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json'
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (options.role) {
    headers['X-Role'] = options.role
  }
  if (options.userId) {
    headers['X-User-Id'] = options.userId
  }
  return headers
}

function parseResponse<T>(status: number, data: unknown): T {
  if (status < 200 || status >= 300) {
    throw new ApiError(status, data)
  }
  if (status === 204) {
    return undefined as T
  }
  return data as T
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`
  const method = options.method || 'GET'
  const headers = buildHeaders(options)

  const uniRequest = typeof uni !== 'undefined' ? uni.request : undefined
  if (uniRequest) {
    return new Promise<T>((resolve, reject) => {
      uniRequest({
        url,
        method,
        data: options.body,
        header: headers,
        success: (res) => {
          try {
            resolve(parseResponse<T>(res.statusCode, res.data))
          } catch (e) {
            reject(e)
          }
        },
        fail: (err) => reject(err)
      })
    })
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  })

  if (!res.ok) {
    let detail: unknown = res.statusText
    try {
      detail = await res.json()
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail)
  }

  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}

export function getHealth() {
  return apiRequest<{ status: string; service: string }>('/health')
}
