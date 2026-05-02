import { useState, useEffect, useCallback } from 'react'
import { todayKey, getDay, calcStreak } from './helpers'
import Onboarding from './components/Onboarding'
import TodayPage from './components/TodayPage'
import HistoryPage from './components/HistoryPage'
import StatsPage from './components/StatsPage'
import AICoachPage from './components/AICoachPage'
import { LogModal, DoneModal } from './components/Modals'

const STORAGE_KEY = 'myday_v3'

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null }
}

export default function App() {
  const [st, setSt] = useState(() => loadState() || { user:null, studyGoalHrs:6, wakeGoalTime:'07:00', days:{} })
  const [page, setPage] = useState('today')
  const [clock, setClock] = useState('')
  const [toast, setToast] = useState(null)
  const [logOpen, setLogOpen] = useState(false)
  const [doneModal, setDoneModal] = useState(null) // target id

  // Persist to localStorage on every state change
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)) }, [st])

  // Live clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }))
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])

  const toast_ = (msg, ai=false) => { setToast({ msg, ai }); setTimeout(() => setToast(null), 2600) }

  const td = getDay(st.days, todayKey())

  const setToday = useCallback((fn) => {
    setSt(s => {
      const k = todayKey()
      const d = getDay(s.days, k)
      return { ...s, days:{ ...s.days, [k]:fn(d) } }
    })
  }, [])

  const buildCtx = useCallback(() => {
    const allS = Object.values(st.days).flatMap(d => d.sessions||[])
    const sm = td.sessions.filter(s => ['study','exercise'].includes(s.category)).reduce((a,b) => a+b.duration, 0)
    const focs = allS.filter(s => s.focus)
    const avgF = focs.length ? (focs.reduce((a,b) => a+(b.focus||0), 0)/focs.length).toFixed(1) : 'unknown'
    return `User: ${st.user}. Goal: ${st.studyGoalHrs}h/day. Today (${todayKey()}): woke ${td.wakeTime||'not logged'}, mood "${td.wakeMood||'—'}", ${(sm/60).toFixed(1)}h studied, ${td.sessions.length} sessions, ${td.targets.filter(x=>x.done).length}/${td.targets.length} targets done. Sessions: ${JSON.stringify(td.sessions)}. Targets: ${JSON.stringify(td.targets)}. Streak: ${calcStreak(st.days)} days. Avg focus: ${avgF}/10.`
  }, [st, td])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  if (!st.user) {
    return <Onboarding onComplete={({ name, studyGoalHrs, wakeGoalTime }) => {
      setSt(s => ({ ...s, user:name, studyGoalHrs, wakeGoalTime }))
    }} />
  }

  return (
    <div style={{ minHeight:'100vh' }}>
      {/* ── HEADER ── */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 22px', background:'rgba(245,240,232,.94)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:13 }}>
          <div style={{ fontFamily:'Fraunces,serif', fontSize:'1rem', fontWeight:600 }}>
            Good <span style={{ color:'var(--accent)', fontStyle:'italic' }}>{greeting}</span>,{' '}
            <span style={{ color:'var(--accent)' }}>{st.user}</span>
          </div>
          <div style={{ fontSize:'.68rem', color:'var(--muted)', borderLeft:'1px solid var(--border)', paddingLeft:13 }}>
            {new Date().toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' })}
          </div>
        </div>

        <nav style={{ display:'flex', gap:4 }}>
          {[['today','Today'],['history','History'],['stats','Stats'],['ai','✦ AI Coach']].map(([id, label]) => (
            <button key={id}
              className={`btn ${page===id?(id==='ai'?'btn-ai':'btn-accent'):'btn-ghost'}`}
              style={{ fontSize:'.68rem', ...(id==='ai'&&page!=='ai'?{color:'var(--ai)',borderColor:'var(--ai-border)',background:'var(--ai-light)'}:{}) }}
              onClick={() => setPage(id)}>
              {label}
            </button>
          ))}
        </nav>

        <div style={{ fontFamily:'Fraunces,serif', fontSize:'.95rem', fontStyle:'italic', color:'var(--muted)' }}>{clock}</div>
      </header>

      {/* ── CONTENT ── */}
      <div style={{ padding:22, maxWidth:1100, margin:'0 auto' }}>
        {page === 'today' && (
          <TodayPage
            td={td} setToday={setToday}
            setLogOpen={setLogOpen} setDoneModal={setDoneModal}
            st={st} buildCtx={buildCtx}
          />
        )}
        {page === 'history' && <HistoryPage days={st.days} />}
        {page === 'stats'   && <StatsPage days={st.days} studyGoalHrs={st.studyGoalHrs} />}
        {page === 'ai'      && <AICoachPage st={st} buildCtx={buildCtx} />}
      </div>

      {/* ── MODALS ── */}
      {logOpen && (
        <LogModal
          onClose={() => setLogOpen(false)}
          onSave={(session) => {
            setToday(d => ({ ...d, sessions:[...d.sessions, session] }))
            setLogOpen(false)
            toast_('Session logged! ✅')
          }}
        />
      )}

      {doneModal !== null && (
        <DoneModal
          onClose={() => setDoneModal(null)}
          onSave={(timeTaken, learning) => {
            const id = doneModal
            setToday(d => ({ ...d, targets:d.targets.map(t => t.id===id ? { ...t, done:true, timeTaken, learning, doneAt:new Date().toTimeString().slice(0,5) } : t) }))
            setDoneModal(null)
            toast_('Target complete! 🎯')
          }}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position:'fixed', bottom:22, right:22, background:toast.ai?'var(--ai)':'var(--ink)', color:'#fff', borderRadius:10, padding:'11px 18px', fontSize:'.8rem', zIndex:999, boxShadow:'0 4px 18px rgba(0,0,0,.2)', animation:'up .3s ease' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
