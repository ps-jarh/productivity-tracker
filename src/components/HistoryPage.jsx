import { useState } from 'react'
import { CAT_COLOR, CAT_LABEL, todayKey } from '../helpers'

export default function HistoryPage({ days }) {
  const [filter, setFilter] = useState('all')
  const dayKeys = Object.keys(days).sort().reverse()

  return (
    <div>
      <div style={{ fontFamily:'Fraunces,serif', fontSize:'1.25rem', fontWeight:700, marginBottom:6 }}>History</div>
      <p style={{ color:'var(--muted)', fontSize:'.78rem', marginBottom:18 }}>All your logged sessions and targets.</p>

      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
        {[['all','All'],['study','📚 Study'],['break','☕ Break'],['leisure','🎮 Leisure']].map(([f, l]) => (
          <button key={f} className={`btn ${filter===f?'btn-accent':'btn-ghost'}`} style={{ fontSize:'.68rem' }} onClick={() => setFilter(f)}>{l}</button>
        ))}
      </div>

      {!dayKeys.length && <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>No history yet. Start logging sessions!</div>}

      {dayKeys.map(dk => {
        const dv = days[dk]
        let sessions = [...(dv.sessions||[])]
        if (filter !== 'all') sessions = sessions.filter(s => s.category === filter)
        const targets = dv.targets||[]
        if (!sessions.length && filter !== 'all') return null
        const label = dk === todayKey() ? 'Today' : new Date(dk+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})
        const tm = sessions.reduce((a,b) => a+b.duration, 0)
        const dt = targets.filter(t => t.done).length
        return (
          <div key={dk} style={{ marginBottom:26 }}>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:'.88rem', fontWeight:600, color:'var(--muted)', marginBottom:11, display:'flex', alignItems:'center', gap:10 }}>
              {label}
              <span style={{ fontSize:'.7rem', fontWeight:400 }}>{tm ? ` ${(tm/60).toFixed(1)}h` : ''}{dt ? ` · ${dt} tasks` : ''}</span>
              <div style={{ flex:1, height:1, background:'var(--border)' }} />
            </div>
            {dv.wakeTime && <div style={{ fontSize:'.73rem', color:'var(--muted)', marginBottom:9 }}>🌅 Woke at {dv.wakeTime}{dv.wakeMood?' — '+dv.wakeMood:''}</div>}
            {sessions.map(s => (
              <div key={s.id} style={{ background:'var(--bg2)', borderRadius:10, padding:13, marginBottom:8, borderLeft:`3px solid ${CAT_COLOR[s.category]||'var(--muted)'}` }}>
                <div style={{ fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)' }}>{CAT_LABEL[s.category]}{s.startTime?' · '+s.startTime:''}</div>
                <div style={{ fontSize:'.88rem', fontWeight:500, margin:'2px 0 4px' }}>{s.title}</div>
                <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>
                  {s.duration}min{s.focus?` · Focus ${s.focus}/10`:''}{s.notes?` · ${s.notes}`:''}
                </div>
                {s.learning && <div style={{ fontSize:'.73rem', color:'var(--green)', marginTop:4, fontStyle:'italic' }}>💡 {s.learning}</div>}
              </div>
            ))}
            {targets.filter(t => t.done).map(t => (
              <div key={t.id} style={{ display:'flex', gap:10, padding:'9px 12px', background:'var(--bg2)', borderRadius:8, marginBottom:6, borderLeft:'3px solid var(--green)' }}>
                <div style={{ color:'var(--green)' }}>✓</div>
                <div>
                  <div style={{ fontSize:'.82rem', fontWeight:500 }}>{t.name}</div>
                  <div style={{ fontSize:'.67rem', color:'var(--muted)' }}>{t.timeTaken?`Took ${t.timeTaken}min`:''}{t.doneAt?` · ${t.doneAt}`:''}</div>
                  {t.learning && <div style={{ fontSize:'.71rem', color:'var(--green)', fontStyle:'italic', marginTop:2 }}>💡 {t.learning}</div>}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
