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
  const [schedOut, setSchedOut] = useState({ loading:false, text:'' })
  const [dragOver, setDragOver] = useState(false) // kept to avoid ref errors, unused
  const [chatMsgs, setChatMsgs] = useState([
    { role:'ai', text:`Hey ${st.user}! I'm your AI coach. Ask me anything — study tips, motivation, or just check in! 🎯`, id:0 }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const schedCtx = useRef(); const chatEnd = useRef()

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
      <p style={{ color:'var(--muted)', fontSize:'.78rem', marginBottom:22 }}>Powered by Groq — your personal study companion</p>

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

      {/* Schedule Planner — image input not supported by Groq */}
      <div className="panel" style={{ marginBottom:18 }}>
        <div style={{ fontSize:'1.7rem', marginBottom:9 }}>🗓️</div>
        <div style={{ fontFamily:'Fraunces,serif', fontWeight:600, marginBottom:5 }}>Smart Weekly Planner</div>
        <div style={{ fontSize:'.73rem', color:'var(--muted)', lineHeight:1.6, marginBottom:16 }}>Build an optimised weekly study plan around your class schedule.</div>
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'18px 20px', display:'flex', alignItems:'flex-start', gap:14 }}>
          <div style={{ fontSize:'1.4rem', flexShrink:0 }}>⚠️</div>
          <div>
            <div style={{ fontSize:'.82rem', fontWeight:500, marginBottom:4 }}>Image upload not available with Groq</div>
            <div style={{ fontSize:'.75rem', color:'var(--muted)', lineHeight:1.6, marginBottom:12 }}>
              Groq models don't support image input. You can still describe your timetable in text below and the AI will build a study plan for you.
            </div>
            <label className="lbl">Describe your weekly schedule</label>
            <textarea ref={schedCtx} className="inp ta" placeholder="e.g. Mon/Wed/Fri: Maths 9-10am, Physics 11-12. Tue/Thu: English 10-11am, Chemistry 2-3pm. Football practice Tue 5-7pm…" style={{ marginBottom:12 }} />
            <button className="btn btn-ai" disabled={schedOut.loading} style={{ padding:'9px 20px' }} onClick={async () => {
              const desc = schedCtx.current?.value.trim()
              if (!desc) return
              setSchedOut({ loading:true, text:'' })
              try {
                const text = await callClaude(
                  `You are a student schedule optimiser for ${st.user}. Daily study goal: ${st.studyGoalHrs}h. Based on the schedule the user describes: 1) Summarise their weekly classes/commitments, 2) Build an optimised weekly study plan with specific time slots per subject, breaks, and revision sessions, 3) Give 2-3 personalised tips. Use **bold** for subject names.`,
                  `Here is my weekly schedule: ${desc}. Please build my optimised study plan.`
                )
                setSchedOut({ loading:false, text })
              } catch(e) { setSchedOut({ loading:false, text:`⚠ ${e.message}` }) }
            }}>{schedOut.loading ? 'Building plan…' : '✦ Build My Study Plan'}</button>
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
