import { useRef } from 'react'
import Modal from './Modal'

export function LogModal({ onClose, onSave }) {
  const lTitle = useRef(); const lCat = useRef(); const lDur = useRef()
  const lStart = useRef(); const lFocus = useRef(); const lNotes = useRef(); const lLearn = useRef()

  return (
    <Modal onClose={onClose} width={490}>
      <div style={{ fontFamily:'Fraunces,serif', fontSize:'1.15rem', fontWeight:700, marginBottom:4 }}>Log a Session</div>
      <div style={{ fontSize:'.73rem', color:'var(--muted)', marginBottom:18 }}>Record what you did, how long, and what you learned.</div>

      <label className="lbl">What did you do?</label>
      <input ref={lTitle} className="inp" placeholder="e.g. Studied Organic Chemistry Ch.4" style={{ marginBottom:13 }} />

      <div style={{ display:'flex', gap:11, marginBottom:13 }}>
        <div style={{ flex:1 }}>
          <label className="lbl">Category</label>
          <select ref={lCat} className="sel">
            <option value="study">📚 Study</option><option value="break">☕ Break</option>
            <option value="leisure">🎮 Leisure</option><option value="exercise">🏃 Exercise</option><option value="other">✨ Other</option>
          </select>
        </div>
        <div style={{ flex:1 }}>
          <label className="lbl">Duration (mins)</label>
          <input ref={lDur} className="inp" type="number" min={1} placeholder="45" />
        </div>
      </div>

      <div style={{ display:'flex', gap:11, marginBottom:13 }}>
        <div style={{ flex:1 }}>
          <label className="lbl">Start time</label>
          <input ref={lStart} className="inp" type="time" defaultValue={new Date().toTimeString().slice(0,5)} />
        </div>
        <div style={{ flex:1 }}>
          <label className="lbl">Focus score (1–10)</label>
          <input ref={lFocus} className="inp" type="number" min={1} max={10} placeholder="7" />
        </div>
      </div>

      <label className="lbl">Notes</label>
      <textarea ref={lNotes} className="inp ta" placeholder="What did you cover? Any blockers?" style={{ marginBottom:13 }} />

      <label className="lbl">Key learning 💡</label>
      <textarea ref={lLearn} className="inp ta" placeholder="Main takeaway from this session…" style={{ marginBottom:20 }} />

      <div style={{ display:'flex', gap:9, justifyContent:'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-accent" onClick={() => {
          const title = lTitle.current?.value.trim()
          const dur = parseInt(lDur.current?.value)
          if (!title || !dur) return
          onSave({ id:Date.now(), title, category:lCat.current?.value||'study', duration:dur, startTime:lStart.current?.value, focus:parseInt(lFocus.current?.value)||null, notes:lNotes.current?.value.trim(), learning:lLearn.current?.value.trim(), ts:Date.now() })
        }}>Save Session</button>
      </div>
    </Modal>
  )
}

export function DoneModal({ onClose, onSave }) {
  const dTime = useRef(); const dLearn = useRef()

  return (
    <Modal onClose={onClose} width={410}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2.4rem', marginBottom:9 }}>🎯</div>
        <div style={{ fontFamily:'Fraunces,serif', fontSize:'1.15rem', fontWeight:700, marginBottom:4 }}>Mark as Complete?</div>
        <div style={{ fontSize:'.73rem', color:'var(--muted)', marginBottom:18 }}>Add how it went.</div>
      </div>
      <label className="lbl">Actual time taken (mins)</label>
      <input ref={dTime} className="inp" type="number" min={1} placeholder="60" style={{ marginBottom:13 }} />
      <label className="lbl">What did you learn / accomplish?</label>
      <textarea ref={dLearn} className="inp ta" placeholder="Key takeaway…" style={{ marginBottom:20 }} />
      <div style={{ display:'flex', gap:9, justifyContent:'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-accent" onClick={() => onSave(parseInt(dTime.current?.value)||null, dLearn.current?.value.trim())}>Mark Done ✓</button>
      </div>
    </Modal>
  )
}
