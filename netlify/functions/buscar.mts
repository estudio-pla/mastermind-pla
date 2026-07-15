import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  const url = new URL(req.url);
  const termo = (url.searchParams.get('q') || '').toLowerCase().trim();

  if (!termo) {
    return new Response(JSON.stringify({ ok: false, erro: 'Envie ?q=palavra pra buscar' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const store = getStore('memoria-eterna');
    const { blobs } = await store.list({ prefix: 'log:' });

    const resultados = [];
    for (const b of blobs) {
      const entry = await store.get(b.key, { type: 'json' });
      if (entry && entry.texto && entry.texto.toLowerCase().includes(termo)) {
        resultados.push(entry);
      }
    }

    resultados.sort((a, b) => b.timestamp - a.timestamp);

    return new Response(JSON.stringify({
      ok: true,
      termo,
      total: resultados.length,
      resultados: resultados.slice(0, 50)
    }), {
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
  path: "/api/buscar"
};
