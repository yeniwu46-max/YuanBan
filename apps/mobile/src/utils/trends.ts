import type { TrendPoint, TrendSeries } from '../types/presentation'

export const metricPresentation: Record<string, { title: string; unit: string; labels: string[] }> =
  {
    heartRate: { title: '心率', unit: '次/分', labels: ['心率'] },
    breathRate: { title: '呼吸', unit: '次/分', labels: ['呼吸'] },
    bloodPressure: { title: '血压', unit: 'mmHg', labels: ['收缩压', '舒张压'] },
    sleep: { title: '睡眠', unit: '小时', labels: ['睡眠时长'] },
  }
export function historyKey(source: string, elderId: string, metric: string, days: number) {
  return JSON.stringify([source, elderId, metric, days])
}
/** Missing/invalid latest values must not acquire a reassuring status label. */
export function isMetricUsable(metric: { key: string; value: string | number }) {
  if (metricPresentation[metric.key]) return parseMetricValue(metric.key, String(metric.value)) !== null
  return metric.value != null && String(metric.value).trim() !== '' && !['--', '—'].includes(String(metric.value))
}
export function parseMetricValue(metric: string, raw: string): number[] | null {
  const text = String(raw).trim()
  if (metric === 'bloodPressure') {
    const match = text.match(/^(\d+(?:\.\d+)?)\s*[/／]\s*(\d+(?:\.\d+)?)\s*(?:mmHg)?$/i)
    if (!match) return null
    const values = [Number(match[1]), Number(match[2])]
    return values.every((v) => Number.isFinite(v) && v > 0 && v < 1000) && values[0] >= values[1]
      ? values
      : null
  }
  const match = text.match(/^(\d+(?:\.\d+)?)\s*(?:次\/分|小时|h|bpm)?$/i)
  if (!match) return null
  const value = Number(match[1])
  return Number.isFinite(value) && value >= 0 && (metric !== 'sleep' || value <= 24)
    ? [value]
    : null
}
export function normalizeHistory(
  input: {
    elderId: string
    metric: string
    days: number
    source: 'api' | 'mock'
    rows: { recorded_at: string; value: string; status: string }[]
  },
  now = Date.now(),
): TrendSeries {
  const config = metricPresentation[input.metric] || { unit: '', labels: [input.metric] }
  let invalidCount = 0
  const points: TrendPoint[] = []
  for (const row of input.rows) {
    const timestamp = Date.parse(row.recorded_at),
      values = parseMetricValue(input.metric, row.value)
    if (!Number.isFinite(timestamp) || !values) {
      invalidCount++
      continue
    }
    if (timestamp > now || timestamp < now - input.days * 86400000) continue
    points.push({ time: new Date(timestamp).toISOString(), values, status: row.status })
  }
  points.sort((a, b) => Date.parse(a.time) - Date.parse(b.time))
  // Keep the latest received entry for a duplicate measurement timestamp.
  const unique = [...new Map(points.map((p) => [p.time, p])).values()]
  return { ...input, unit: config.unit, labels: config.labels, points: unique, invalidCount }
}

/** Existing demo record labels are converted to timestamps, not extrapolated into new samples. */
export function mockRecordTime(label: string, now = new Date()): string {
  const date = new Date(now)
  date.setSeconds(0, 0)
  const hm = label.match(/(\d{2}):(\d{2})/)
  if (hm) date.setHours(Number(hm[1]), Number(hm[2]), 0, 0)
  else date.setHours(7, 0, 0, 0)
  if (label.includes('昨天') || label === '昨晚') date.setDate(date.getDate() - 1)
  const day = label.match(/周([一二三四五六日天])/)
  if (day) {
    const wanted = '日一二三四五六'.indexOf(day[1] === '天' ? '日' : day[1])
    date.setDate(date.getDate() - ((date.getDay() - wanted + 7) % 7))
  }
  if (date > now) date.setDate(date.getDate() - 1)
  return date.toISOString()
}
