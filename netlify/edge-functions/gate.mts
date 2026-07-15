async function hashPassword(pw) {
  const data = new TextEncoder().encode(pw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getCookie(req, name) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

function getUsers() {
  try {
    const raw = Netlify.env.get('GATE_USERS');
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

const LOGIN_PAGE = (error) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mastermind — Acesso</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #08080C;
    color: #E2E2E8;
    font-family: 'Courier New', monospace;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .box {
    background: #0F0F16;
    border: 1px solid #2A2A35;
    border-radius: 10px;
    padding: 40px;
    width: 320px;
    text-align: center;
  }
  .box h1 { font-size: 16px; letter-spacing: 3px; color: #30D158; margin-bottom: 24px; }
  input {
    width: 100%;
    background: #16161E;
    border: 1px solid #2A2A35;
    color: #E2E2E8;
    font-family: 'Courier New', monospace;
    font-size: 16px;
    letter-spacing: 2px;
    text-align: center;
    padding: 14px;
    border-radius: 6px;
    outline: none;
    margin-bottom: 12px;
  }
  input:focus { border-color: #30D158; }
  button {
    width: 100%;
    background: #30D158;
    border: none;
    color: #08080C;
    font-family: 'Courier New', monospace;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 2px;
    padding: 14px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 4px;
  }
  .error { color: #FF4444; font-size: 12px; margin-bottom: 16px; }
</style>
</head>
<body>
  <div class="box">
    <h1>ESTÚDIO PLÁ · MASTERMIND</h1>
    ${error ? '<div class="error">Usuário ou senha incorretos</div>' : ''}
    <form method="POST" action="/__login">
      <input type="text" name="usuario" placeholder="usuário" autocomplete="off" autofocus>
      <input type="password" name="password" placeholder="senha" autocomplete="off">
      <button type="submit">ENTRAR</button>
    </form>
  </div>
</body>
</html>`;

export default async (req, context) => {
  const url = new URL(req.url);
  const users = getUsers();

  // Rota de login — processa o POST do formulário
  if (url.pathname === '/__login') {
    if (req.method === 'POST') {
      const form = await req.formData();
      const usuario = (form.get('usuario') || '').trim().toLowerCase();
      const attempt = form.get('password');
      const senhaReal = users[usuario];

      if (usuario && attempt && senhaReal && attempt === senhaReal) {
        const hash = await hashPassword(senhaReal);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/',
            'Set-Cookie': `bios_gate=${usuario}.${hash}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
          }
        });
      }
      return new Response(LOGIN_PAGE(true), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    return new Response(LOGIN_PAGE(false), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // Verifica quem está logado, a partir do cookie
  const cookie = getCookie(req, 'bios_gate');
  const [cookieUser, cookieHash] = cookie ? cookie.split('.') : [null, null];
  const senhaEsperada = cookieUser ? users[cookieUser] : null;
  const hashEsperado = senhaEsperada ? await hashPassword(senhaEsperada) : null;
  const autenticado = cookieUser && cookieHash && hashEsperado && cookieHash === hashEsperado;

  // Rota interna — quem está logado agora (usada pelo frontend para personalizar)
  if (url.pathname === '/api/whoami') {
    return new Response(JSON.stringify({
      ok: !!autenticado,
      usuario: autenticado ? cookieUser : null
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (!autenticado) {
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/__login' }
    });
  }

  return context.next();
};

export const config = {
  path: "/*"
};
