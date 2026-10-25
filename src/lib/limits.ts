// Limites de texto aplicados na API, no banco (CHECK da migration 20261026120000_limites_texto)
// e nos formulários (maxLength). Ao mudar um valor aqui, ajuste também a migration.
export const LIMITES = {
  conteudoNome: 120,
  conteudoFonte: 200,
  url: 2048,
  categoriaNome: 60,
  categoriaDescricao: 300,
  linkTitulo: 60,
  usuarioNome: 100,
  senhaMin: 8,
  senhaMax: 72, // o bcrypt só considera os primeiros 72 bytes
  midiasPorConteudo: 30,
} as const

// Conta caracteres como o Postgres (char_length): um emoji vale 1.
export const contarCaracteres = (texto: string) => Array.from(texto).length

type Resultado<T> = { ok: true; value: T } | { ok: false; error: string }

// Texto opcional: vazio vira null; acima do limite é recusado com mensagem amigável.
export function textoOpcional(valor: unknown, max: number, campo: string): Resultado<string | null> {
  if (typeof valor !== 'string') return { ok: true, value: null }

  const texto = valor.trim()
  if (!texto) return { ok: true, value: null }

  if (contarCaracteres(texto) > max) {
    return { ok: false, error: `${campo} pode ter no máximo ${max} caracteres.` }
  }

  return { ok: true, value: texto }
}

// Nome (pt/en) e descrição da categoria; campos ausentes passam (a rota decide o que é obrigatório).
export function validarTextosCategoria(body: Record<string, unknown> | null | undefined): { ok: true } | { ok: false; error: string } {
  const campos: [unknown, number, string][] = [
    [body?.nome, LIMITES.categoriaNome, 'O nome da categoria'],
    [body?.name, LIMITES.categoriaNome, 'O nome da categoria em inglês'],
    [body?.descricao, LIMITES.categoriaDescricao, 'A descrição'],
  ]
  for (const [valor, max, campo] of campos) {
    const resultado = textoOpcional(valor, max, campo)
    if (!resultado.ok) return resultado
  }
  return { ok: true }
}

// URL opcional: só http(s), para nunca virar javascript: num link clicável.
export function urlOpcional(valor: unknown, campo: string): Resultado<string | null> {
  const texto = textoOpcional(valor, LIMITES.url, campo)
  if (!texto.ok || texto.value === null) return texto

  try {
    const url = new URL(texto.value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return { ok: false, error: `${campo} precisa começar com http:// ou https://.` }
    }
  } catch {
    return { ok: false, error: `${campo} não é um link válido.` }
  }

  return texto
}
