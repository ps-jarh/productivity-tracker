const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''

/**
 * callClaude(system, userMsgOrHistory, imageData?)
 *
 * userMsgOrHistory can be:
 *   - A string  → single user message
 *   - An array  → full [{role, content}] history (used for chat)
 *   - undefined → treated as empty string
 *
 * imageData (optional): { base64: string, type: string }
 */
export async function callClaude(system, userMsgOrHistory, imageData) {
  if (!API_KEY) {
    throw new Error(
      'API key missing. Copy .env.example → .env and set VITE_ANTHROPIC_API_KEY.'
    )
  }

  let messages

  if (Array.isArray(userMsgOrHistory)) {
    // Full chat history passed in
    messages = userMsgOrHistory
  } else {
    // Single turn — build the content block
    const content = imageData
      ? [
          { type: 'image', source: { type: 'base64', media_type: imageData.type, data: imageData.base64 } },
          { type: 'text', text: userMsgOrHistory || '' },
        ]
      : (userMsgOrHistory || '')

    messages = [{ role: 'user', content }]
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system,
      messages,
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
}
