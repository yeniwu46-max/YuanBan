export type SemanticStatus = 'normal' | 'warm' | 'red' | 'gray'
export type MascotState = 'greeting' | 'listening' | 'thinking' | 'encouraging' | 'reminder' | 'caring'
export type DataSource = 'api' | 'mock'
export type TrendPoint = { time: string; values: number[]; status: string }
export type TrendSeries = {
  elderId: string
  metric: string
  days: number
  unit: string
  labels: string[]
  source: DataSource
  points: TrendPoint[]
  invalidCount: number
}
