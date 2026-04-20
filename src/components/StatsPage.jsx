import { calcStreak } from '../helpers'

export default function StatsPage({ days, studyGoalHrs }) {
  const allS = Object.values(days).flatMap(d => d.sessions||[])
  const allT = Object.values(days).flatMap(d => d.targets||[])
  const sm = allS.filter(s => ['study','exercise'].includes(s.category)).reduce((a,b) => a+b.duration, 0)
  const focs = allS.filter(s => s.focus)
  const avgF = focs.length ? (focs.reduce((a,b) => a+(b.focus||0), 0)/focs.length).toFixed(1) : '—'
  const bySub = {}
  allS.forEach(s => { bySub[s.category] = (bySub[s.category]||0) + s.duration })
  const tot = Object.values(bySub).reduce((a,b) => a+b, 0) || 1
  const COLS = { study:'var(--accent)', break:'var(--green)', leisure:'var(--purple)', exercise:'#e07b54', other:'var(--muted)' }
  const ICO2 = { study:'📚', break:'☕', leisure:'🎮', exercise:'🏃', other:'✨' }
  const cards = [
    { icon:'⏱️', val:`${(sm/60).toFixed(1)}h`, label:'Study Time' },
    { icon:'✅', val:allT.filter(t=>t.done).length, label:'Targets Done' },
    { icon:'📅', val:Object.keys(days).length, label:'Days Tracked' },
    { icon:'🔥', val:calcStreak(days), label:'Day Streak' },
    { icon:'🎯', val:avgF, label:'Avg Focus' },
    { icon:'📝', val:allS.length, label:'Total Sessions' },
  ]
  const heat = Array.from({ length:49 }, (_,i) => {
    const dt = new Date(); dt.setDate(dt.getDate()-(48-i))
    const k = dt.toISOString().split('T')[0]
    const dv = days[k]; const mins = dv ? (dv.sessions||[]).reduce((a,b)=>a+b.duration,0) : 0
    const inten = mins===0?0:mins<60?.2:mins<120?.5:mins<180?.75:1
    return { k, inten, label:`${dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}: ${(mins/60).toFixed(1)}h` }
  })

  return (
    <div>
      <div style={{ fontFamily:'Fraunces,serif', fontSize:'1.25rem', fontWeight:700, marginBottom:6 }}>Stats</div>
      <p style={{ color:'var(--muted)', fontSize:'.78rem', marginBottom:18 }}>All-time overview.</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:18 }} className="three-col">
        {cards.map(c => (
          <div key={c.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:18 }}>
            <div style={{ fontSize:'1.3rem', marginBottom:8 }}>{c.icon}</div>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:'1.7rem', fontWeight:700 }}>{c.val}</div>
            <div style={{ fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginTop:2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div style={{ fontFamily:'Fraunces,serif', fontWeight:600, marginBottom:12 }}>Activity Heatmap (49 days)</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:4 }}>
          {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} style={{ fontSize:'.58rem', color:'var(--muted)', textAlign:'center' }}>{d}</div>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
          {heat.map(c => <div key={c.k} title={c.label} style={{ aspectRatio:'1', borderRadius:3, background:c.inten===0?'var(--bg2)':`rgba(196,119,58,${c.inten})` }} />)}
        </div>
      </div>

      <div className="panel">
        <div style={{ fontFamily:'Fraunces,serif', fontWeight:600, marginBottom:14 }}>Category Breakdown</div>
        {Object.entries(bySub).sort((a,b) => b[1]-a[1]).map(([cat, mins]) => (
          <div key={cat} style={{ marginBottom:13 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.76rem', marginBottom:5 }}>
              <span>{ICO2[cat]||'✨'} {cat.charAt(0).toUpperCase()+cat.slice(1)}</span>
              <span style={{ color:'var(--muted)' }}>{(mins/60).toFixed(1)}h</span>
            </div>
            <div style={{ height:5, background:'var(--bg2)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${Math.round(mins/tot*100)}%`, background:COLS[cat]||'var(--muted)', borderRadius:3 }} />
            </div>
          </div>
        ))}
        {!Object.keys(bySub).length && <div style={{ color:'var(--muted)', fontSize:'.78rem' }}>No sessions logged yet.</div>}
      </div>
    </div>
  )
}
