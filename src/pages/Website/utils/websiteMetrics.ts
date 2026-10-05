import type { IWebsiteStats } from '@/interfaces/IWebsiteStats'

export interface IWebsiteMetric {
  id: string
  value: number | null | undefined
  description: string
  display: 'counter' | 'number'
}

// undefined while loading, null when the metrics service couldn't answer.
export function buildWebsiteMetrics(
  stats: IWebsiteStats | null | undefined
): IWebsiteMetric[] {
  const pick = (key: keyof IWebsiteStats) =>
    stats === null ? null : stats?.[key]

  return [
    {
      id: 'visits',
      value: pick('clicks'),
      description: 'visitas desde a entrada na aliança',
      display: 'counter',
    },
    {
      id: 'last-month',
      value: pick('clicks30d'),
      description: 'visitas no último mês',
      display: 'number',
    },
    {
      id: 'redirects',
      value: pick('referrals'),
      description: 'redirecionamentos para a aliança',
      display: 'number',
    },
  ]
}
