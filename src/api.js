const API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''

// Groq model — llama-3.3-70b-versatile is fast, smart, and free-tier friendly
// Other good options: llama-3.1-8b-instant (faster), mixtral-8x7b-32768 (longer context)
const MODEL = 'llama-3.3-70b-versatile'
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * callClaude(system, userMsgOrHistory, imageData?)
 *
 * Drop-in replacement backed by Groq (OpenAI-compatible API).
 *   system           : string — persona / system instruction
 *   userMsgOrHistory : string | [{role, content}] — single message or chat history
 *   imageData        : ignored — Groq does not support image input
 */
export async function callClaude(system, userMsgOrHistory, imageData) {
  if (!API_KEY) {
    throw new Error(
      'API key missing. Copy .env.example to .env and set VITE_GROQ_API_KEY.'
    )
  }

  // Groq uses the OpenAI messages format: [{role, content}]
  let messages = [{ role: 'system', content: system }]

  if (Array.isArray(userMsgOrHistory)) {
    // Chat history — roles are already 'user' / 'assistant'
    messages = messages.concat(userMsgOrHistory.map(m => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: m.content,
    })))
  } else {
    messages.push({ role: 'user', content: userMsgOrHistory || '' })
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  const data = await res.json()

  // Groq/OpenAI error shape: { error: { message, type, code } }
  if (data.error) throw new Error(data.error.message)

  return data.choices?.[0]?.message?.content || ''
}
