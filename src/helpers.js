export function todayKey() {
  return new Date().toISOString().split('T')[0]
}

export function emptyDay() {
  return { wakeTime: null, wakeMood: null, targets: [], sessions: [] }
}

export function getDay(days, key) {
  return days[key] || emptyDay()
}

export function calcStreak(days) {
  let s = 0
  const now = new Date()
  for (let i = 0; ; i++) {
    const dt = new Date(now)
    dt.setDate(dt.getDate() - i)
    const k = dt.toISOString().split('T')[0]
    if (days[k] && ((days[k].sessions || []).length > 0 || (days[k].targets || []).length > 0)) s++
    else break
  }
  return s
}

export function fmt(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^#{1,3} (.+)$/gm, '<b>$1</b>')
    .replace(/\n/g, '<br/>')
}

export const CAT_ICON  = { study:'📚', exercise:'🏃', reading:'📖', project:'💡', chore:'🧹', other:'✨' }
export const CAT_COLOR = { study:'var(--accent)', break:'var(--green)', leisure:'var(--purple)', exercise:'var(--accent)', other:'var(--muted)' }
export const CAT_LABEL = { study:'Study', break:'Break', leisure:'Leisure', exercise:'Exercise', other:'Other' }
