export default async (req, context) => {
  const url = new URL(req.url);
  const file = url.searchParams.get('file'); // "amigdala.json" ou "reptiliano.json"

  if (!file || !['amigdala.json', 'reptiliano.json'].includes(file)) {
    return new Response(JSON.stringify({ error: 'Parâmetro file inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = Netlify.env.get('GITHUB_TOKEN');
  if (!token) {
    return new Response(JSON.stringify({ error: 'GITHUB_TOKEN não configurado no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const ghRes = await fetch(
      `https://api.github.com/repos/estudio-pla/bios-pla/contents/${file}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!ghRes.ok) {
      return new Response(JSON.stringify({ error: `GitHub respondeu ${ghRes.status}` }), {
        status: ghRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await ghRes.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
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
  path: "/api/memoria"
};
