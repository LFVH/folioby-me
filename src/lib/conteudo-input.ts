import { LIMITES, textoOpcional, urlOpcional } from './limits'
import { isBlobUrl } from './media'

export interface ConteudoInput {
  name: string | null
  fonte: string | null
  link: string | null
  linkext: string | null
  mediaUrls: string[]
}

// Valida os campos de texto e de mídia do conteúdo (criação e edição).
// O tamanho em bytes nunca vem daqui: é medido no Blob pela rota.
export function validarConteudo(body: Record<string, unknown>): { ok: true; value: ConteudoInput } | { ok: false; error: string } {
  const name = textoOpcional(body.name, LIMITES.conteudoNome, 'O nome')
  if (!name.ok) return name

  const fonte = textoOpcional(body.fonte, LIMITES.conteudoFonte, 'A fonte')
  if (!fonte.ok) return fonte

  const linkext = urlOpcional(body.linkext, 'O link externo')
  if (!linkext.ok) return linkext

  const link = urlOpcional(body.link, 'O link do arquivo')
  if (!link.ok) return link

  const mediaUrls = Array.isArray(body.mediaUrls)
    ? body.mediaUrls.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : []

  if (mediaUrls.length > LIMITES.midiasPorConteudo) {
    return { ok: false, error: `Envie no máximo ${LIMITES.midiasPorConteudo} imagens por conteúdo.` }
  }

  if (mediaUrls.some((url) => !isBlobUrl(url))) {
    return { ok: false, error: 'Arquivo inválido. Envie o arquivo pelo formulário do FolioBy.' }
  }

  return { ok: true, value: { name: name.value, fonte: fonte.value, link: link.value, linkext: linkext.value, mediaUrls } }
}
