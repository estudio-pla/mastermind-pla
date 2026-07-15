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

## v1.2 — 2026-07-15
- Gerente nunca mais devolve erro técnico cru: uma re-tentativa automática silenciosa
  se o Gemini estiver sobrecarregado, e se mesmo assim falhar, devolve uma frase humana
  ("tive uma dificuldade agora, tenta de novo") em vez de mensagem de erro em código.
- Voz de leitura (Web Speech Synthesis, nativa do navegador, sem custo e sem limite de
  caracteres) agora tenta escolher automaticamente uma voz masculina em português, em
  vez de usar a voz padrão aleatória do sistema.
- Texto higienizado antes de ser lido em voz alta: remove markdown (#, *, _), tags
  técnicas ([SK-...]) e URLs, para leitura limpa e sem soletrar símbolos.
- Decisão registrada: ElevenLabs (voz Jack Caster) não é usada para respostas do
  Gerente por limite de caracteres da conta gratuita — reservada para os registros
  narrados (relatórios), não para o chat interativo.

## v1.3 — 2026-07-15
- Adicionada MEMÓRIA ETERNA: todo texto enviado no campo de tarefa/pergunta é
  registrado permanentemente (Netlify Blobs, store "memoria-eterna"), com data e
  hora, ANTES de qualquer outra coisa acontecer.
- Regra estrutural: este sistema NUNCA implementa função de apagar (delete) nesse
  armazenamento — não existe rota, botão, nem endpoint de exclusão em lugar nenhum
  do código. Só existe escrever (registrar) e ler (buscar).
- Criada função de busca (/api/buscar?q=palavra) para encontrar qualquer registro
  passado por palavra-chave, com data de quando foi escrito.
- Se o registro permanente falhar por qualquer motivo, o sistema PARA e avisa —
  nunca prossegue para o Gerente sem garantir que o texto foi salvo pra sempre.
