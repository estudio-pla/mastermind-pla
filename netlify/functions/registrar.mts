import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, erro: 'Use POST' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const texto = (body.texto || '').trim();

    if (!texto) {
      return new Response(JSON.stringify({ ok: false, erro: 'Nada pra registrar' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const store = getStore('memoria-eterna');
    const agora = new Date();
    const chave = `log:${agora.getTime()}:${crypto.randomUUID()}`;

    // NUNCA existe função de apagar neste sistema — apenas set() e get().
    await store.setJSON(chave, {
      texto,
      timestamp: agora.getTime(),
      data: agora.toISOString(),
      dataLegivel: agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    });

    return new Response(JSON.stringify({ ok: true, chave }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, erro: err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: "/api/registrar"
};
