import { useRef, useState } from 'react'
import { CAT_ICON, CAT_COLOR, CAT_LABEL, fmt } from '../helpers'
import { callClaude } from '../api'
import AIBox from './AIBox'

// ── Progress Rings ──
function Rings({ td, studyGoalHrs }) {
  const sm = td.sessions.filter(s => ['study','exercise'].includes(s.category)).reduce((a,b) => a+b.duration, 0)
  const gm = studyGoalHrs * 60
  const tn = td.targets.length, tdn = td.targets.filter(x => x.done).length
  const sn = td.sessions.length
  const rings = [
    { label:'Study', val:`${(sm/60).toFixed(1)}h`, pct:Math.min(1, sm/(gm||1)), color:'#c4773a' },
    { label:'Targets', val:`${tdn}/${tn}`, pct: tn ? tdn/tn : 0, color:'#4a7c59' },
    { label:'Sessions', val:`${sn}`, pct:Math.min(1, sn/5), color:'#6b5fa0' },
  ]
  const R = 26, C = 2 * Math.PI * R
  return (
    <div style={{ display:'flex', gap:16, justifyContent:'space-around' }}>
      {rings.map(r => (
        <div key={r.label} style={{ textAlign:'center' }}>
          <svg width="64" height="64" style={{ transform:'rotate(-90deg)' }} viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={R} fill="none" stroke="var(--bg2)" strokeWidth="5" />
            <circle cx="32" cy="32" r={R} fill="none" stroke={r.color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - r.pct)} style={{ transition:'stroke-dashoffset 1s' }} />
          </svg>
          <div style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:'.88rem', color:r.color }}>{r.val}</div>
          <div style={{ fontSize:'.58rem', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginTop:3 }}>{r.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Day Timeline ──
function Timeline({ td }) {
  const items = []
  if (td.wakeTime) items.push({ time:td.wakeTime, type:'wake', title:'Woke up', sub:td.wakeMood||'' })
  td.sessions.forEach(s => {
    if (s.startTime) items.push({ time:s.startTime, type:s.category==='break'?'break':s.category==='leisure'?'leisure':'study', title:s.title, sub:s.duration+'min' })
  })
  td.targets.filter(t => t.done && t.doneAt).forEach(t => items.push({ time:t.doneAt, type:'done', title:`✓ ${t.name}`, sub:t.timeTaken?t.timeTaken+'min':'done' }))
  items.sort((a,b) => a.time.localeCompare(b.time))

  const DOT = { wake:'var(--ink)', study:'var(--accent)', break:'var(--green)', leisure:'var(--purple)', done:'var(--green)' }
  const ICO = { wake:'☀', study:'📚', break:'☕', leisure:'🎮', done:'✓' }

  if (!items.length) return <div style={{ textAlign:'center', padding:'14px 0', color:'var(--muted)', fontSize:'.78rem' }}>Your day will appear here.</div>
  return (
    <div style={{ position:'relative' }}>
      <div style={{ position:'absolute', left:12, top:0, bottom:0, width:1, background:'var(--border)' }} />
      {items.map((item, i) => (
        <div key={i} style={{ display:'flex', gap:13, marginBottom:14, position:'relative' }}>
          <div style={{ width:24, height:24, borderRadius:'50%', background:DOT[item.type]||'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.58rem', color:'#fff', flexShrink:0, zIndex:1 }}>{ICO[item.type]||'📚'}</div>
          <div style={{ flex:1, paddingTop:2 }}>
            <div style={{ fontSize:'.62rem', color:'var(--muted)' }}>{item.time}</div>
            <div style={{ fontSize:'.78rem', fontWeight:500 }}>{item.title}</div>
            {item.sub && <div style={{ fontSize:'.66rem', color:'var(--accent)' }}>{item.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TodayPage({ td, setToday, setLogOpen, setDoneModal, st, buildCtx }) {
  const wkTime = useRef(); const wkMood = useRef()
  const tName = useRef(); const tCat = useRef(); const tEst = useRef()
  const [showAddTgt, setShowAddTgt] = useState(false)
  const [qfb, setQfb] = useState({ show:false, loading:false, text:'' })

  const sortedSessions = [...td.sessions].sort((a,b) => (a.startTime||'').localeCompare(b.startTime||''))

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 350px', gap:22, alignItems:'start' }} className="two-col">
      {/* Left */}
      <div>
        {/* Wakeup */}
        {td.wakeTime ? (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'15px 20px', marginBottom:18, display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 8px rgba(26,22,18,.06)' }}>
            <span style={{ fontSize:'1.4rem' }}>🌅</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'.62rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)' }}>Woke up at</div>
              <div style={{ fontFamily:'Fraunces,serif', fontSize:'1.35rem', fontWeight:700 }}>{td.wakeTime}</div>
              {td.wakeMood && <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>{td.wakeMood}</div>}
            </div>
            <button className="btn btn-red" onClick={() => setToday(d => ({ ...d, wakeTime:null, wakeMood:null }))}>Reset</button>
          </div>
        ) : (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'15px 20px', marginBottom:18, display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 8px rgba(26,22,18,.06)', flexWrap:'wrap' }}>
            <span style={{ fontSize:'1.4rem' }}>⏰</span>
            <div style={{ flex:1, minWidth:220 }}>
              <div style={{ fontSize:'.62rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', marginBottom:6 }}>Log your wake-up time</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <input ref={wkTime} className="inp" type="time" defaultValue={new Date().toTimeString().slice(0,5)} style={{ width:110 }} />
                <input ref={wkMood} className="inp" placeholder="How are you feeling?" style={{ flex:2, minWidth:140 }} />
                <button className="btn btn-accent" onClick={() => {
                  const t = wkTime.current?.value; if (!t) return
                  setToday(d => ({ ...d, wakeTime:t, wakeMood:wkMood.current?.value||'' }))
                }}>Log</button>
              </div>
            </div>
          </div>
        )}

        {/* Targets */}
        <div className="panel">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:600 }}>Today's Targets</div>
              <div style={{ fontSize:'.68rem', color:'var(--muted)', marginTop:1 }}>{td.targets.filter(x=>x.done).length}/{td.targets.length} done</div>
            </div>
            <button className="btn btn-accent" onClick={() => setShowAddTgt(v => !v)}>+ Add</button>
          </div>

          {td.targets.length === 0 && <div style={{ textAlign:'center', padding:'20px 0', color:'var(--muted)', fontSize:'.8rem' }}>🎯 No targets yet — add one!</div>}
          {td.targets.map(t => (
            <div key={t.id} style={{ display:'flex', alignItems:'flex-start', gap:11, padding:11, borderRadius:10, marginBottom:8, background:'var(--bg2)', cursor:'pointer', opacity:t.done ? .6 : 1 }}
              onClick={e => {
                if (e.target.dataset.del) return
                if (t.done) setToday(d => ({ ...d, targets:d.targets.map(x => x.id===t.id ? {...x,done:false,timeTaken:null,learning:null,doneAt:null} : x) }))
                else setDoneModal(t.id)
              }}>
              <div style={{ width:19, height:19, border:`2px solid ${t.done?'var(--green)':'var(--border)'}`, borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.68rem', background:t.done?'var(--green)':'transparent', color:t.done?'#fff':'transparent', flexShrink:0, marginTop:2, transition:'all .15s' }}>{t.done?'✓':''}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'.82rem', fontWeight:500, textDecoration:t.done?'line-through':'none', color:t.done?'var(--muted)':'var(--ink)', marginBottom:3 }}>{CAT_ICON[t.category]||'✨'} {t.name}</div>
                <div style={{ fontSize:'.67rem', color:'var(--muted)', display:'flex', gap:10, flexWrap:'wrap' }}>
                  {t.estMins && <span>Est. {t.estMins}min</span>}
                  {t.done && t.timeTaken && <span style={{ color:'var(--green)' }}>Took {t.timeTaken}min</span>}
                  {t.done && t.doneAt && <span>Done {t.doneAt}</span>}
                  {t.done && t.learning && <span style={{ color:'var(--green)', fontStyle:'italic' }}>💡 {t.learning}</span>}
                </div>
              </div>
              <button data-del="1" style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--border)', fontSize:'.75rem', padding:'2px 4px' }}
                onClick={e => { e.stopPropagation(); setToday(d => ({ ...d, targets:d.targets.filter(x => x.id!==t.id) })) }}>✕</button>
            </div>
          ))}

          {showAddTgt && (
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:14, marginTop:10, display:'flex', flexDirection:'column', gap:9 }}>
              <input ref={tName} className="inp" placeholder="Target name (e.g. Finish Chapter 5)" />
              <div style={{ display:'flex', gap:9 }}>
                <select ref={tCat} className="sel" style={{ flex:1 }}>
                  <option value="study">📚 Study</option><option value="exercise">🏃 Exercise</option>
                  <option value="reading">📖 Reading</option><option value="project">💡 Project</option>
                  <option value="chore">🧹 Chore</option><option value="other">✨ Other</option>
                </select>
                <input ref={tEst} className="inp" type="number" placeholder="Est. mins" style={{ width:100 }} />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-green" style={{ flex:1 }} onClick={() => {
                  const name = tName.current?.value.trim(); if (!name) return
                  setToday(d => ({ ...d, targets:[...d.targets, { id:Date.now(), name, category:tCat.current?.value||'study', estMins:parseInt(tEst.current?.value)||null, done:false, timeTaken:null, learning:null, doneAt:null }] }))
                  if (tName.current) tName.current.value = ''
                  if (tEst.current) tEst.current.value = ''
                  setShowAddTgt(false)
                }}>Save</button>
                <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowAddTgt(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Sessions */}
        <div className="panel">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:600 }}>Session Log</div>
              <div style={{ fontSize:'.68rem', color:'var(--muted)', marginTop:1 }}>What have you been doing?</div>
            </div>
            <button className="btn btn-purple" onClick={() => setLogOpen(true)}>+ Log</button>
          </div>

          {sortedSessions.length === 0 && <div style={{ textAlign:'center', padding:'20px 0', color:'var(--muted)', fontSize:'.8rem' }}>📝 No sessions yet today.</div>}
          {sortedSessions.map(s => (
            <div key={s.id} style={{ background:'var(--bg2)', borderRadius:10, padding:13, marginBottom:9, borderLeft:`3px solid ${CAT_COLOR[s.category]||'var(--muted)'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', marginBottom:2 }}>{CAT_LABEL[s.category]}{s.startTime?' · '+s.startTime:''}</div>
                  <div style={{ fontSize:'.88rem', fontWeight:500, marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>
                    <span style={{ fontFamily:'Fraunces,serif', fontWeight:600, color:CAT_COLOR[s.category]||'var(--muted)' }}>{s.duration}min</span>
                    {s.focus ? ` · Focus ${s.focus}/10` : ''}{s.notes ? ` · ${s.notes}` : ''}
                  </div>
                  {s.learning && <div style={{ fontSize:'.75rem', color:'var(--green)', marginTop:5, fontStyle:'italic' }}>💡 {s.learning}</div>}
                </div>
                <button style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--border)', fontSize:'.75rem' }}
                  onClick={() => setToday(d => ({ ...d, sessions:d.sessions.filter(x => x.id!==s.id) }))}>✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Feedback */}
        {qfb.show && <AIBox loading={qfb.loading} text={qfb.text} />}
        <button className="btn btn-ai" disabled={qfb.loading} style={{ width:'100%', padding:12, marginBottom:20 }} onClick={async () => {
          setQfb({ show:true, loading:true, text:'' })
          try {
            const text = await callClaude(
              `You are a warm, encouraging productivity coach. User is ${st.user}. Give brief (3-4 sentences), specific, actionable feedback on their day so far. Be honest but motivating.`,
              `Quick feedback on my day. Data: ${buildCtx()}`
            )
            setQfb({ show:true, loading:false, text })
          } catch(e) { setQfb({ show:true, loading:false, text:`⚠ ${e.message}` }) }
        }}>{qfb.loading ? '✦ Thinking…' : qfb.show ? '✦ Refresh Feedback' : '✦ Get AI Feedback on Today'}</button>
      </div>

      {/* Right sidebar */}
      <div>
        <div className="panel">
          <div style={{ fontFamily:'Fraunces,serif', fontWeight:600, marginBottom:16 }}>Progress</div>
          <Rings td={td} studyGoalHrs={st.studyGoalHrs} />
        </div>
        <div className="panel">
          <div style={{ fontFamily:'Fraunces,serif', fontWeight:600, marginBottom:16 }}>Day Timeline</div>
          <Timeline td={td} />
        </div>
      </div>
    </div>
  )
}
