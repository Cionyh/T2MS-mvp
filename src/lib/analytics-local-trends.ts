/**
 * Bucket message timestamps into local calendar periods for Analytics charts.
 */

function localDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function localWeekKey(date: Date): string {
  const year = date.getFullYear()
  const start = new Date(year, 0, 1)
  const week = Math.ceil(
    (date.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )
  return `${year}-W${String(week).padStart(2, "0")}`
}

function localMonthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

export function bucketTrendsByLocalTime(isoTimestamps: string[]): {
  daily: Array<{ date: string; count: number }>
  weekly: Array<{ week: string; count: number }>
  monthly: Array<{ month: string; count: number }>
} {
  const daily: Record<string, number> = {}
  const weekly: Record<string, number> = {}
  const monthly: Record<string, number> = {}

  for (const iso of isoTimestamps) {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) continue

    const dayKey = localDateKey(date)
    daily[dayKey] = (daily[dayKey] || 0) + 1

    const weekKey = localWeekKey(date)
    weekly[weekKey] = (weekly[weekKey] || 0) + 1

    const monthKey = localMonthKey(date)
    monthly[monthKey] = (monthly[monthKey] || 0) + 1
  }

  return {
    daily: Object.entries(daily)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    weekly: Object.entries(weekly)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week)),
    monthly: Object.entries(monthly)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  }
}
