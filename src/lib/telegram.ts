// Aviso de novo feedback no Telegram do dono do FolioBy.
// Só envia se TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID estiverem configuradas.
const TIMEOUT_MS = 3000;

interface FeedbackAviso {
  nota: number;
  mensagem: string;
  podeContatar: boolean;
  email?: string | null;
  nome?: string | null;
}

export async function avisarFeedbackNoTelegram(feedback: FeedbackAviso): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return;
  }

  // Texto puro (sem parse_mode): nada do que o usuário escreveu é interpretado como formatação.
  const text = [
    'Novo feedback no FolioBy',
    `Nota: ${feedback.nota}/5`,
    `De: ${feedback.nome ?? 'sem nome'} <${feedback.email ?? 'sem e-mail'}>`,
    `Pode contatar: ${feedback.podeContatar ? 'sim' : 'não'}`,
    '',
    feedback.mensagem,
  ].join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error('Aviso de feedback no Telegram recusado:', res.status);
    }
  } catch (error) {
    // O feedback já foi salvo; falha no aviso não pode virar erro para o usuário.
    console.error('Aviso de feedback no Telegram falhou:', error instanceof Error ? error.name : 'erro');
  }
}
