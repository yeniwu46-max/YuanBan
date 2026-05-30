import { getAccessToken, getApiBaseUrl } from '@/services/apiClient'
import { invalidateCache } from '@/services/requestCache'

type AlertEventPayload = {
  type: string
  alert?: { id: string; elder_id: string }
  elder_id?: string
}

let source: EventSource | null = null

export function startAlertEventStream(onAlert: () => void) {
  stopAlertEventStream()
  const token = getAccessToken()
  if (!token || typeof EventSource === 'undefined') return

  const url = `${getApiBaseUrl()}/api/v1/events/stream?token=${encodeURIComponent(token)}`
  source = new EventSource(url)

  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as AlertEventPayload
      if (data.type === 'alert.created') {
        invalidateCache('guardian:')
        invalidateCache('alerts')
        onAlert()
      }
    } catch {
      /* ignore */
    }
  }
}

export function stopAlertEventStream() {
  source?.close()
  source = null
}
