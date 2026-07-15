import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  const store = getStore('agenda-eterna');

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { titulo, mesDia, usuario } = body;
      if (!titulo || !mesDia) {
        return new Response(JSON.stringify({ ok: false, erro: 'titulo e mesDia (MM-DD) são obrigatórios' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const chave = `evento:${crypto.randomUUID()}`;
      await store.setJSON(chave, {
        titulo,
        mesDia,
        usuario: usuario || null,
        criadoEm: new Date().toISOString()
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
  }

  // GET — lista todos os eventos, com quantos dias faltam a partir de hoje
  try {
    const { blobs } = await store.list();
    const hoje = new Date();
    const eventos = [];

    for (const b of blobs) {
      const entry = await store.get(b.key, { type: 'json' });
      if (!entry) continue;

      const [mes, dia] = entry.mesDia.split('-').map(Number);
      let proxima = new Date(hoje.getFullYear(), mes - 1, dia);
      if (proxima < hoje) proxima = new Date(hoje.getFullYear() + 1, mes - 1, dia);
      const diasFaltando = Math.round((proxima - hoje) / (1000 * 60 * 60 * 24));

      eventos.push({ ...entry, diasFaltando });
    }

    eventos.sort((a, b) => a.diasFaltando - b.diasFaltando);

    return new Response(JSON.stringify({ ok: true, eventos }), {
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
  path: "/api/agenda"
};
