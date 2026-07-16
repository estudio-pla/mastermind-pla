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

## v1.3.1 — correção
- Adicionado package.json com dependência @netlify/blobs (faltava, causava erro
  "Cannot find package" nas funções de registrar/buscar).

## v1.4 — 2026-07-15
- MULTIUSUÁRIO: o cofre agora aceita usuário + senha (não só senha única). Cada
  pessoa tem seu próprio par de acesso, configurado em GATE_USERS (servidor,
  nunca no código). Kaue configurado como primeiro usuário.
- Rota /api/whoami identifica quem está logado, e o Mastermind cumprimenta pelo
  nome (ex: "bem-vindo, Kaue").
- AGENDA PERMANENTE (/api/agenda): memória de datas e lembretes, sem função de
  apagar (mesma regra da memória eterna). Ao entrar, o sistema já avisa sozinho
  os eventos que estão chegando nos próximos 35 dias — não precisa perguntar.
- Texto de espera agora é preparado e rotativo (4 mensagens diferentes a cada
  ~2s) em vez de um "Processando..." estático parado.
- Pendente: aniversário da Luana ainda não cadastrado — falta a data (dia/mês).
  Luana ainda não tem usuário/senha próprios em GATE_USERS.

## v1.5 — 2026-07-16
- Adicionado botão "COPIAR" ao lado de "OUVIR" na área de resposta do Gerente —
  copia o texto puro, pronto pra colar em qualquer lugar (ex: trazer de volta
  pro Claude, sem precisar reescrever contexto).
- Corrigido problema de símbolos crus (# e **) aparecendo na tela: a resposta do
  Gerente agora passa por um conversor de markdown simples antes de aparecer,
  virando títulos, negrito e listas de verdade, nunca símbolo solto.
- Fluxo de trabalho definido com Kaue: Gemini (Mastermind) registra e conversa
  o dia todo sem custo; Claude entra só na finalização, recebendo um resumo já
  pronto via copiar/colar — economiza tokens e evita reconstruir contexto do zero
  a cada nova conversa.
