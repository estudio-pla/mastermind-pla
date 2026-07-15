export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ text: 'Só aceito perguntas enviadas pelo formulário.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const key = Netlify.env.get('GEMINI_API_KEY');
  if (!key) {
    return new Response(JSON.stringify({ text: 'Ainda não estou configurado corretamente. Avisa o Kaue pra checar minha chave de acesso.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ text: 'Não entendi o que foi enviado. Tenta de novo.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { systemPrompt, userInput } = body;
  if (!userInput) {
    return new Response(JSON.stringify({ text: 'Preciso de uma pergunta ou tarefa pra responder.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const chamarGemini = async () => fetch(
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

  try {
    let geminiRes = await chamarGemini();

    // Uma re-tentativa automática se o Gemini estiver sobrecarregado (503)
    if (!geminiRes.ok && geminiRes.status === 503) {
      await new Promise(r => setTimeout(r, 1500));
      geminiRes = await chamarGemini();
    }

    if (!geminiRes.ok) {
      return new Response(JSON.stringify({
        text: 'Tive uma dificuldade agora pra pensar na resposta. Tenta de novo em alguns segundos.'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(JSON.stringify({ text: text || 'Não consegui formular uma resposta agora. Tenta reformular a pergunta.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      text: 'Tive um problema inesperado agora. Tenta de novo em alguns segundos.'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = {
  path: "/api/gerente"
};
