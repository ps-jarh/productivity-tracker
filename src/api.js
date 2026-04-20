const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "llama3-8b-8192", 
    messages: [{ role: "user", content: userMsg }]
  })
});

const data = await res.json();
const botReply = data.choices[0].message.content;
