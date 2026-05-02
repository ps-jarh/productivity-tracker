import { useRef } from 'react'

export default function Onboarding({ onComplete }) {
  const nameRef = useRef(); const goalRef = useRef(); const wakeRef = useRef()

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div className="up" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'44px 48px', width:460, boxShadow:'0 8px 40px rgba(26,22,18,.14)' }}>
        <div style={{ fontFamily:'Fraunces,serif', fontStyle:'italic', color:'var(--accent)', fontSize:'.85rem', marginBottom:6 }}>Welcome to</div>
        <div style={{ fontFamily:'Fraunces,serif', fontSize:'2.1rem', fontWeight:700, marginBottom:8 }}>MyDay ✦ AI</div>
        <p style={{ color:'var(--muted)', fontSize:'.8rem', lineHeight:1.6, marginBottom:28 }}>
          Personal productivity tracker with AI coaching, day summaries, and smart weekly planning. Your data stays on your device.
        </p>

        <label className="lbl">Your name</label>
        <input ref={nameRef} className="inp" placeholder="e.g. Rahul" style={{ marginBottom:16 }} />

        <div style={{ display:'flex', gap:12, marginBottom:20 }}>
          <div style={{ flex:1 }}>
            <label className="lbl">Daily study goal (hrs)</label>
            <input ref={goalRef} className="inp" type="number" min={1} max={16} placeholder="6" />
          </div>
          <div style={{ flex:1 }}>
            <label className="lbl">Usual wake-up time</label>
            <input ref={wakeRef} className="inp" type="time" defaultValue="07:00" />
          </div>
        </div>

        <button className="btn btn-accent" style={{ width:'100%', padding:14, fontSize:'.82rem' }} onClick={() => {
          const name = nameRef.current?.value.trim()
          if (!name) return
          onComplete({ name, studyGoalHrs: parseFloat(goalRef.current?.value) || 6, wakeGoalTime: wakeRef.current?.value || '07:00' })
        }}>
          Start tracking →
        </button>
      </div>
    </div>
  )
}
