export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Use POST' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const key = Netlify.env.get('GEMINI_API_KEY');
  if (!key) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { systemPrompt, userInput } = body;

    if (!userInput) {
      return new Response(JSON.stringify({ error: 'userInput é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': key
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt || '' }] },
          contents: [{ parts: [{ text: userInput }] }]
        })
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: errData.error?.message || `Gemini respondeu ${geminiRes.status}` }), {
        status: geminiRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(JSON.stringify({ text: text || '(resposta vazia)' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: "/api/gerente"
};
