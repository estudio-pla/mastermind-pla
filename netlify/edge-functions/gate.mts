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
    font-size: 20px;
    letter-spacing: 4px;
    text-align: center;
    padding: 14px;
    border-radius: 6px;
    outline: none;
    margin-bottom: 16px;
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
  }
  .error { color: #FF4444; font-size: 12px; margin-bottom: 16px; }
</style>
</head>
<body>
  <div class="box">
    <h1>ESTÚDIO PLÁ · MASTERMIND</h1>
    ${error ? '<div class="error">Senha incorreta</div>' : ''}
    <form method="POST" action="/__login">
      <input type="password" name="password" placeholder="••••••" autofocus autocomplete="off">
      <button type="submit">ENTRAR</button>
    </form>
  </div>
</body>
</html>`;

export default async (req, context) => {
  const url = new URL(req.url);
  const gatePassword = Netlify.env.get('GATE_PASSWORD');
  const expectedHash = gatePassword ? await hashPassword(gatePassword) : null;

  // Rota de login — processa o POST do formulário
  if (url.pathname === '/__login') {
    if (req.method === 'POST') {
      const form = await req.formData();
      const attempt = form.get('password');
      const attemptHash = attempt ? await hashPassword(attempt) : null;

      // DEBUG temporário
      if (url.searchParams.get('debug') === '1') {
        return new Response(JSON.stringify({
          gatePasswordSet: !!gatePassword,
          attempt,
          attemptHash,
          expectedHash,
          match: attemptHash === expectedHash
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (attempt && expectedHash && attemptHash === expectedHash) {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/',
            'Set-Cookie': `bios_gate=${expectedHash}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
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

  // Qualquer outra rota — verifica o cookie
  const cookie = getCookie(req, 'bios_gate');
  if (!expectedHash || cookie !== expectedHash) {
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
