// Avisos no Telegram do dono do FolioBy (novo feedback, novo cadastro).
// Só envia se TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID estiverem configuradas.
import { getSiteUrl } from './site-url';

const TIMEOUT_MS = 3000;

interface FeedbackAviso {
  nota: number;
  mensagem: string;
  podeContatar: boolean;
  email?: string | null;
  nome?: string | null;
}

interface CadastroAviso {
  nome: string;
  email: string;
  slug: string;
  totalUsuarios?: number | null;
}

// Nunca lança: quem chama já concluiu o que importa e o aviso é só conveniência.
async function enviarAviso(linhas: string[], assunto: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return;
  }

  // Texto puro (sem parse_mode): nada do que o usuário escreveu é interpretado como formatação.
  const text = linhas.join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`Aviso de ${assunto} no Telegram recusado:`, res.status);
    }
  } catch (error) {
    console.error(`Aviso de ${assunto} no Telegram falhou:`, error instanceof Error ? error.name : 'erro');
  }
}

export async function avisarFeedbackNoTelegram(feedback: FeedbackAviso): Promise<void> {
  await enviarAviso(
    [
      'Novo feedback no FolioBy',
      `Nota: ${feedback.nota}/5`,
      `De: ${feedback.nome ?? 'sem nome'} <${feedback.email ?? 'sem e-mail'}>`,
      `Pode contatar: ${feedback.podeContatar ? 'sim' : 'não'}`,
      '',
      feedback.mensagem,
    ],
    'feedback'
  );
}

export async function avisarCadastroNoTelegram(cadastro: CadastroAviso): Promise<void> {
  await enviarAviso(
    [
      'Novo cadastro no FolioBy',
      `Nome: ${cadastro.nome}`,
      `E-mail: ${cadastro.email}`,
      `Página: ${getSiteUrl()}/${cadastro.slug}`,
      ...(cadastro.totalUsuarios ? [`Total de usuários: ${cadastro.totalUsuarios}`] : []),
    ],
    'cadastro'
  );
}
