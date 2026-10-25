import { describe, it, expect } from 'vitest'
import { LIMITES, textoOpcional, urlOpcional, validarTextosCategoria } from './limits'
import { linkSchema, SignupFormSchema } from '@/app/api/auth/auth/definitions'

describe('limites de texto', () => {
  it('textoOpcional aceita ate o limite e recusa um caractere a mais', () => {
    expect(textoOpcional('x'.repeat(10), 10, 'Campo')).toEqual({ ok: true, value: 'x'.repeat(10) })
    expect(textoOpcional('x'.repeat(11), 10, 'Campo')).toEqual({ ok: false, error: 'Campo pode ter no máximo 10 caracteres.' })
    expect(textoOpcional('   ', 10, 'Campo')).toEqual({ ok: true, value: null })
    expect(textoOpcional(42, 10, 'Campo')).toEqual({ ok: true, value: null })
  })

  it('urlOpcional so aceita http(s) dentro do limite', () => {
    expect(urlOpcional('https://exemplo.com', 'Link').ok).toBe(true)
    expect(urlOpcional('javascript:alert(1)', 'Link').ok).toBe(false)
    expect(urlOpcional('data:text/html,oi', 'Link').ok).toBe(false)
    expect(urlOpcional(`https://a.com/${'x'.repeat(LIMITES.url)}`, 'Link').ok).toBe(false)
  })

  it('categoria limita nome (pt e en) e descricao', () => {
    expect(validarTextosCategoria({ nome: 'x'.repeat(LIMITES.categoriaNome) }).ok).toBe(true)
    expect(validarTextosCategoria({ nome: 'x'.repeat(LIMITES.categoriaNome + 1) }).ok).toBe(false)
    expect(validarTextosCategoria({ name: 'x'.repeat(LIMITES.categoriaNome + 1) }).ok).toBe(false)
    expect(validarTextosCategoria({ descricao: 'x'.repeat(LIMITES.categoriaDescricao + 1) }).ok).toBe(false)
    expect(validarTextosCategoria(null).ok).toBe(true)
  })

  it('cadastro limita nome e senha', () => {
    const base = { name: 'Maria', email: 'maria@exemplo.com', password: 'senha-segura' }

    expect(SignupFormSchema.safeParse(base).success).toBe(true)
    expect(SignupFormSchema.safeParse({ ...base, name: 'x'.repeat(LIMITES.usuarioNome + 1) }).success).toBe(false)
    expect(SignupFormSchema.safeParse({ ...base, password: 'x'.repeat(LIMITES.senhaMax + 1) }).success).toBe(false)
  })

  it('link do perfil limita titulo e URL', () => {
    const base = { nr_redesocial: 0, titulo: 'Site', link: 'https://exemplo.com' }

    expect(linkSchema.safeParse({ ...base, titulo: 'x'.repeat(LIMITES.linkTitulo + 1) }).success).toBe(false)
    expect(linkSchema.safeParse({ ...base, link: `https://exemplo.com/${'x'.repeat(LIMITES.url)}` }).success).toBe(false)
  })
})
