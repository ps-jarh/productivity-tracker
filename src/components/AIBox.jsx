import { fmt } from '../helpers'

export default function AIBox({ loading, text }) {
  if (!loading && !text) return null
  return (
    <div className="ai-box">
      <div className="ai-lbl">✦ AI Coach</div>
      {loading
        ? <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--ai)', fontSize:'.78rem' }}>
            <div className="spin" /><span>Thinking…</span>
          </div>
        : <div className="ai-txt" dangerouslySetInnerHTML={{ __html: fmt(text) }} />
      }
    </div>
  )
}
