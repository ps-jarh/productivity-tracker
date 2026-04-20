const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// gemini-2.0-flash: fast, cheap, supports images (multimodal)
const MODEL = 'gemini-2.0-flash'
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

/**
 * callClaude(system, userMsgOrHistory, imageData?)
 *
 * Drop-in replacement backed by Gemini. Same call signature as before:
 *   system           : string — persona / system instruction
 *   userMsgOrHistory : string | [{role, content}] — single message or chat history
 *   imageData        : { base64, type } | undefined — optional image
 */
export async function callClaude(system, userMsgOrHistory, imageData) {
  if (!API_KEY) {
    throw new Error(
      'API key missing. Copy .env.example to .env and set VITE_GEMINI_API_KEY.'
    )
  }

  // Build Gemini `contents` array
  let contents

  if (Array.isArray(userMsgOrHistory)) {
    // Chat history [{role:'user'|'assistant', content:string}]
    // Gemini uses 'user' and 'model' as role names
    contents = userMsgOrHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
  } else {
    // Single turn, optionally with an image
    const parts = []
    if (imageData) {
      parts.push({ inlineData: { mimeType: imageData.type, data: imageData.base64 } })
    }
    parts.push({ text: userMsgOrHistory || '' })
    contents = [{ role: 'user', parts }]
  }

  const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    }),
  })

  const data = await res.json()

  // Gemini error shape: { error: { message, code, status } }
  if (data.error) throw new Error(data.error.message)

  const candidate = data.candidates?.[0]
  if (!candidate) throw new Error('Gemini returned no candidates.')

  return (candidate.content?.parts || [])
    .filter(p => p.text)
    .map(p => p.text)
    .join('')
}
