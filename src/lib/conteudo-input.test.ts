import { describe, it, expect } from 'vitest'
import { validarConteudo } from './conteudo-input'
import { LIMITES } from './limits'

const blob = 'https://abc123.public.blob.vercel-storage.com/nextsteps/arquivo.gif'

describe('validarConteudo', () => {
  it('aceita um conteudo valido e normaliza espacos e vazios', () => {
    const r = validarConteudo({ name: '  Reel  ', fonte: '', linkext: 'https://youtu.be/x', mediaUrls: [blob] })

    expect(r).toEqual({ ok: true, value: { name: 'Reel', fonte: null, link: null, linkext: 'https://youtu.be/x', mediaUrls: [blob] } })
  })

  it('recusa nome e fonte acima do limite, contando emoji como um caractere', () => {
    expect(validarConteudo({ name: 'x'.repeat(LIMITES.conteudoNome + 1) }).ok).toBe(false)
    expect(validarConteudo({ name: '\u{1F525}'.repeat(LIMITES.conteudoNome) }).ok).toBe(true)
    expect(validarConteudo({ name: 'ok', fonte: 'x'.repeat(LIMITES.conteudoFonte + 1) }).ok).toBe(false)
  })

  it('recusa link externo que nao seja http(s) ou longo demais', () => {
    expect(validarConteudo({ name: 'ok', linkext: 'javascript:alert(1)' })).toEqual({ ok: false, error: expect.stringContaining('http') })
    expect(validarConteudo({ name: 'ok', linkext: 'nao e link' }).ok).toBe(false)
    expect(validarConteudo({ name: 'ok', linkext: `https://a.com/${'x'.repeat(LIMITES.url)}` }).ok).toBe(false)
  })

  it('so aceita midia hospedada no nosso Blob', () => {
    expect(validarConteudo({ name: 'ok', mediaUrls: ['https://outro-site.com/a.gif'] }).ok).toBe(false)
    expect(validarConteudo({ name: 'ok', mediaUrls: ['http://abc.public.blob.vercel-storage.com/a.gif'] }).ok).toBe(false)
    expect(validarConteudo({ name: 'ok', mediaUrls: ['https://public.blob.vercel-storage.com.evil.com/a.gif'] }).ok).toBe(false)
  })

  it('limita a quantidade de imagens por conteudo', () => {
    const muitas = Array.from({ length: LIMITES.midiasPorConteudo + 1 }, () => blob)

    expect(validarConteudo({ name: 'ok', mediaUrls: muitas }).ok).toBe(false)
  })
})
