import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { avisarCadastroNoTelegram, avisarFeedbackNoTelegram } from './telegram';

const feedback = { nota: 4, mensagem: 'Gostei da vitrine.', podeContatar: true, email: 'maria@exemplo.com', nome: 'Maria' };

describe('avisarFeedbackNoTelegram', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:abc');
    vi.stubEnv('TELEGRAM_CHAT_ID', '999');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('nao faz nada sem as variaveis de ambiente', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '');

    await avisarFeedbackNoTelegram(feedback);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('envia texto puro para o chat configurado', async () => {
    fetchMock.mockResolvedValue(new Response('{"ok":true}'));

    await avisarFeedbackNoTelegram(feedback);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/bot123:abc/sendMessage',
      expect.objectContaining({ method: 'POST' })
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.chat_id).toBe('999');
    expect(body.parse_mode).toBeUndefined();
    expect(body.text).toContain('Nota: 4/5');
    expect(body.text).toContain('maria@exemplo.com');
    expect(body.text).toContain('Gostei da vitrine.');
  });

  it('nunca lanca erro quando o Telegram falha', async () => {
    fetchMock.mockRejectedValue(new Error('fora do ar'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(avisarFeedbackNoTelegram(feedback)).resolves.toBeUndefined();
  });
});

describe('avisarCadastroNoTelegram', () => {
  const fetchMock = vi.fn();
  const cadastro = { nome: 'Maria Souza', email: 'maria@exemplo.com', slug: 'maria-souza', totalUsuarios: 8 };

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:abc');
    vi.stubEnv('TELEGRAM_CHAT_ID', '999');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://folioby.me');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('nao faz nada sem as variaveis de ambiente', async () => {
    vi.stubEnv('TELEGRAM_CHAT_ID', '');

    await avisarCadastroNoTelegram(cadastro);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('envia nome, e-mail, link da pagina e total de usuarios', async () => {
    fetchMock.mockResolvedValue(new Response('{"ok":true}'));

    await avisarCadastroNoTelegram(cadastro);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.chat_id).toBe('999');
    expect(body.parse_mode).toBeUndefined();
    expect(body.text).toContain('Novo cadastro no FolioBy');
    expect(body.text).toContain('Maria Souza');
    expect(body.text).toContain('maria@exemplo.com');
    expect(body.text).toContain('https://folioby.me/maria-souza');
    expect(body.text).toContain('Total de usuários: 8');
  });

  it('omite o total quando ele nao esta disponivel', async () => {
    fetchMock.mockResolvedValue(new Response('{"ok":true}'));

    await avisarCadastroNoTelegram({ ...cadastro, totalUsuarios: null });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.text).not.toContain('Total de usuários');
    expect(body.text).toContain('https://folioby.me/maria-souza');
  });

  it('nunca lanca erro quando o Telegram falha', async () => {
    fetchMock.mockRejectedValue(new Error('fora do ar'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(avisarCadastroNoTelegram(cadastro)).resolves.toBeUndefined();
  });
});
