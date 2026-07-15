# Changelog — Mastermind

## v1.1 — 2026-07-15
- Adicionado microfone (🎙) no campo de tarefa: fala vira texto (Web Speech API, pt-BR).
  Funciona automaticamente com fone Bluetooth já pareado no dispositivo — não precisa
  de configuração extra dentro do app, o navegador usa o microfone padrão do sistema.
- Adicionado botão "▶ OUVIR" na área de resposta: lê a resposta do Gerente em voz alta
  (Web Speech Synthesis API, pt-BR). Voz do navegador, não é a voz do Jack Caster —
  possível upgrade futuro via ElevenLabs se desejado.
- Botão de envio redesenhado: microfone e "↑ ENVIAR" lado a lado, acima do campo de texto.

## v1.0 — 2026-07-15
- Cérebro Completo conectado a reptiliano.json e amigdala.json via funções de servidor
  (netlify/functions/memoria.mts), sem exposição de token no cliente.
- Gerente (L3) conectado ao Gemini via função de servidor (netlify/functions/gerente.mts),
  sem exposição de chave no cliente.
- Acesso travado por senha via Edge Function (netlify/edge-functions/gate.mts) — funciona
  no plano gratuito, sem precisar de upgrade.
