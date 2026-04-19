import { useState, useRef } from 'react'
import { callClaude } from '../api'
import { fmt } from '../helpers'
import AIBox from './AIBox'

function ChatBubble({ m }) {
  return (
    <div style={{ marginBottom:11, textAlign:m.role==='user'?'right':'left' }}>
      <div style={{ display:'inline-block', maxWidth:'84%', padding:'9px 13px', borderRadius:m.role==='user'?'11px 11px 3px 11px':'11px 11px 11px 3px', fontSize:'.8rem', lineHeight:1.6, background:m.role==='user'?'var(--ink)':'var(--ai-light)', color:m.role==='user'?'var(--bg)':'var(--ink)', border:m.role==='ai'?'1px solid var(--ai-border)':'none', textAlign:'left' }}>
        {m.loading
          ? <span style={{ display:'flex', alignItems:'center', gap:8, color:'var(--ai)' }}><div className="spin" />Thinking…</span>
          : <span dangerouslySetInnerHTML={{ __html: fmt(m.text) }} />}
      </div>
    </div>
  )
}

export default function AICoachPage({ st, buildCtx }) {
  const [summary, setSummary]   = useState({ loading:false, text:'' })
  const [insights, setInsights] = useState({ loading:false, text:'' })
  const [schedImg, setSchedImg] = useState(null)
  const [schedOut, setSchedOut] = useState({ loading:false, text:'' })
  const [dragOver, setDragOver] = useState(false)
  const [chatMsgs, setChatMsgs] = useState([
    { role:'ai', text:`Hey ${st.user}! I'm your AI coach. Ask me anything — study tips, motivation, or just check in! 🎯`, id:0 }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const fileRef = useRef(); const schedCtx = useRef(); const chatEnd = useRef()

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = ev => {
      const r = ev.target.result
      setSchedImg({ src:r, base64:r.split(',')[1], type:file.type })
    }
    reader.readAsDataURL(file)
  }

  const sendChat = async () => {
    const msg = chatInput.trim(); if (!msg || chatLoading) return
    setChatInput('')
    const uid = Date.now(); const aid = uid + 1
    setChatMsgs(prev => [...prev,
      { role:'user', text:msg, id:uid },
      { role:'ai', text:'', loading:true, id:aid }
    ])
    setChatLoading(true)
    try {
      // Build conversation history (last 8 messages)
      const history = chatMsgs
        .slice(-8)
        .filter(m => !m.loading)
        .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
      history.push({ role: 'user', content: msg })

      const replyText = await callClaude(
        `You are ${st.user}'s personal AI productivity coach. Warm, direct, and genuinely helpful. Their data: ${buildCtx()}. Keep responses concise (2-4 sentences). Be specific and actionable.`,
        history  // pass full history as the user message array
      )
      setChatMsgs(prev => prev.map(m => m.id === aid ? { ...m, text:replyText, loading:false } : m))
    } catch(e) {
      setChatMsgs(prev => prev.map(m => m.id === aid ? { ...m, text:`⚠ ${e.message}`, loading:false } : m))
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div>
      <div style={{ fontFamily:'Fraunces,serif', fontSize:'1.3rem', fontWeight:700, marginBottom:4 }}>✦ AI Coach</div>
      <p style={{ color:'var(--muted)', fontSize:'.78rem', marginBottom:22 }}>Powered by Claude — your personal study companion</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }} className="two-col">
        {/* Summary */}
        <div className="panel">
          <div style={{ fontSize:'1.7rem', marginBottom:9 }}>📋</div>
          <div style={{ fontFamily:'Fraunces,serif', fontWeight:600, marginBottom:5 }}>End-of-Day Summary</div>
          <div style={{ fontSize:'.73rem', color:'var(--muted)', lineHeight:1.6, marginBottom:14 }}>Full AI debrief — achievements, focus analysis, and tips for tomorrow.</div>
          <button className="btn btn-ai" disabled={summary.loading} style={{ width:'100%', padding:11 }} onClick={async () => {
            setSummary({ loading:true, text:'' })
            try {
              const text = await callClaude(
                `You are a thoughtful productivity coach writing an end-of-day summary for ${st.user}. Be warm and personal. Cover: 1) Day headline/vibe, 2) Specific achievements, 3) Focus & energy analysis, 4) 2-3 concrete improvements for tomorrow. Use **bold** for key points.`,
                `Write my end-of-day summary. Data: ${buildCtx()}`
              )
              setSummary({ loading:false, text })
            } catch(e) { setSummary({ loading:false, text:`⚠ ${e.message}` }) }
          }}>{summary.loading ? 'Generating…' : 'Generate Summary'}</button>
          <AIBox loading={summary.loading} text={summary.text} />
        </div>

        {/* Insights */}
        <div className="panel">
          <div style={{ fontSize:'1.7rem', marginBottom:9 }}>📈</div>
          <div style={{ fontFamily:'Fraunces,serif', fontWeight:600, marginBottom:5 }}>Weekly Insights</div>
          <div style={{ fontSize:'.73rem', color:'var(--muted)', lineHeight:1.6, marginBottom:14 }}>Patterns, trends, and a specific action plan to level up next week.</div>
          <button className="btn btn-ai" disabled={insights.loading} style={{ width:'100%', padding:11 }} onClick={async () => {
            setInsights({ loading:true, text:'' })
            try {
              const text = await callClaude(
                `You are a data-driven productivity analyst for student ${st.user}. Analyse last 7 days: 1) Key patterns, 2) What's working, 3) #1 blocker, 4) Specific 3-step action plan. Use **bold** for insights.`,
                `Analyse my week. Data: ${buildCtx()}`
              )
              setInsights({ loading:false, text })
            } catch(e) { setInsights({ loading:false, text:`⚠ ${e.message}` }) }
          }}>{insights.loading ? 'Analysing…' : 'Analyse Week'}</button>
          <AIBox loading={insights.loading} text={insights.text} />
        </div>
      </div>

      {/* Schedule Planner */}
      <div className="panel" style={{ marginBottom:18 }}>
        <div style={{ fontSize:'1.7rem', marginBottom:9 }}>🗓️</div>
        <div style={{ fontFamily:'Fraunces,serif', fontWeight:600, marginBottom:5 }}>Smart Weekly Planner</div>
        <div style={{ fontSize:'.73rem', color:'var(--muted)', lineHeight:1.6, marginBottom:16 }}>Upload a photo of your class timetable — AI extracts your classes and builds an optimised weekly study plan.</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, alignItems:'start' }} className="two-col">
          <div>
            <div
              style={{ border:`2px dashed ${dragOver?'var(--ai)':'var(--ai-border)'}`, borderRadius:11, padding:'26px 18px', textAlign:'center', cursor:'pointer', background:dragOver?'#e0d8f0':'var(--ai-light)', transition:'all .2s' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]) }}>
              <div style={{ fontSize:'2rem', marginBottom:7 }}>📸</div>
              <div style={{ fontSize:'.8rem', color:'var(--muted)' }}><span style={{ color:'var(--ai)', fontWeight:500 }}>Click or drag</span> to upload timetable</div>
              <div style={{ fontSize:'.66rem', color:'var(--muted)', marginTop:4 }}>JPG · PNG · WEBP</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => processFile(e.target.files[0])} />
            {schedImg && (
              <div style={{ marginTop:10, borderRadius:9, overflow:'hidden', maxHeight:200, border:'1px solid var(--border)' }}>
                <img src={schedImg.src} alt="Schedule" style={{ width:'100%', objectFit:'cover' }} />
              </div>
            )}
          </div>
          <div>
            <label className="lbl">Extra context for AI</label>
            <textarea ref={schedCtx} className="inp ta" placeholder="e.g. Football Tue 5-7pm, prefer mornings, need extra Maths time…" style={{ marginBottom:13 }} />
            <button className="btn btn-ai" disabled={!schedImg||schedOut.loading} style={{ width:'100%', padding:11 }} onClick={async () => {
              if (!schedImg) return
              setSchedOut({ loading:true, text:'' })
              try {
                const extra = schedCtx.current?.value.trim()
                const text = await callClaude(
                  `You are a student schedule optimiser for ${st.user}. Daily study goal: ${st.studyGoalHrs}h. Analyse the timetable image: 1) List all classes with times/days, 2) Build an optimised weekly study plan with specific slots per subject, breaks, revision, 3) Give 2-3 personalised tips. Use **bold** subject names.`,
                  `Analyse this timetable and build my weekly study plan.${extra?' Extra context: '+extra:''}`,
                  schedImg
                )
                setSchedOut({ loading:false, text })
              } catch(e) { setSchedOut({ loading:false, text:`⚠ ${e.message}` }) }
            }}>{schedOut.loading ? 'Analysing…' : '✦ Analyse & Build Plan'}</button>
          </div>
        </div>
        {(schedOut.loading || schedOut.text) && <AIBox loading={schedOut.loading} text={schedOut.text} />}
      </div>

      {/* Chat */}
      <div className="panel">
        <div style={{ fontSize:'1.7rem', marginBottom:9 }}>💬</div>
        <div style={{ fontFamily:'Fraunces,serif', fontWeight:600, marginBottom:5 }}>Ask Your AI Coach</div>
        <div style={{ fontSize:'.73rem', color:'var(--muted)', lineHeight:1.6, marginBottom:14 }}>Study techniques, motivation, time management — ask anything.</div>
        <div style={{ maxHeight:300, overflowY:'auto', marginBottom:14 }}>
          {chatMsgs.map((m, i) => <ChatBubble key={i} m={m} />)}
          <div ref={chatEnd} />
        </div>
        <div style={{ display:'flex', gap:9 }}>
          <input className="inp" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask your coach…" style={{ flex:1, border:'1.5px solid var(--border)' }}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }} />
          <button className="btn btn-ai" disabled={chatLoading||!chatInput.trim()} onClick={sendChat}>{chatLoading?'…':'Send'}</button>
        </div>
      </div>
    </div>
  )
}
