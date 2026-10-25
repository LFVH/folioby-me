'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { toast } from 'react-toastify'
import { MessageSquareHeart, X } from 'lucide-react'
import { FEEDBACK_MENSAGEM_MAX, FEEDBACK_MENSAGEM_MIN, contarCaracteres } from '@/lib/feedback'

const AVISO_FECHADO_KEY = 'folioby:feedback-aviso-fechado-em'
const AVISO_PAUSA_MS = 7 * 24 * 60 * 60 * 1000
const FOCAVEIS = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href]'
const NOTAS = [
  { valor: 1, rotulo: 'Ruim' },
  { valor: 2, rotulo: 'Fraco' },
  { valor: 3, rotulo: 'Ok' },
  { valor: 4, rotulo: 'Bom' },
  { valor: 5, rotulo: 'Ótimo' },
]

function avisoFechadoRecentemente() {
  try {
    const fechadoEm = Number(localStorage.getItem(AVISO_FECHADO_KEY))
    return Boolean(fechadoEm) && Date.now() - fechadoEm < AVISO_PAUSA_MS
  } catch {
    return false
  }
}

function lembrarAvisoFechado() {
  try {
    localStorage.setItem(AVISO_FECHADO_KEY, String(Date.now()))
  } catch {
    // Sem storage o aviso só volta a aparecer no próximo carregamento.
  }
}

// Aviso para usuários logados (painel e página inicial) com formulário de feedback.
export default function FeedbackPrompt() {
  const { status } = useSession()
  const pathname = usePathname()
  const areaDoApp = pathname === '/' || pathname.startsWith('/nextsteps')

  const [restantes, setRestantes] = useState<number | null>(null)
  const [avisoVisivel, setAvisoVisivel] = useState(false)
  const [formAberto, setFormAberto] = useState(false)
  const [pathnameDoForm, setPathnameDoForm] = useState(pathname)
  const [nota, setNota] = useState(0)
  const [mensagem, setMensagem] = useState('')
  const [podeContatar, setPodeContatar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState('')
  const gatilhoRef = useRef<HTMLButtonElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const primeiroCampoRef = useRef<HTMLInputElement>(null)
  const devolverFoco = useRef(false)

  // Trocar de página fecha o formulário (ajuste de estado no render, sem efeito extra).
  if (pathname !== pathnameDoForm) {
    setPathnameDoForm(pathname)
    setFormAberto(false)
  }

  const fecharForm = useCallback(() => {
    devolverFoco.current = true
    setFormAberto(false)
    setErroForm('')
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || !areaDoApp || restantes !== null) {
      return
    }

    let cancelado = false
    fetch('/api/feedback')
      .then((res) => (res.ok ? res.json() : null))
      .then((dados) => {
        if (!cancelado && dados?.success) {
          const disponiveis = Math.max(dados.limite - dados.enviados, 0)
          setRestantes(disponiveis)
          setAvisoVisivel(disponiveis > 0 && !avisoFechadoRecentemente())
        }
      })
      .catch(() => {})

    return () => {
      cancelado = true
    }
  }, [status, areaDoApp, restantes])

  useEffect(() => {
    if (!formAberto) {
      if (devolverFoco.current) {
        devolverFoco.current = false
        gatilhoRef.current?.focus()
      }
      return
    }

    const form = formRef.current
    const checado = form?.querySelector<HTMLInputElement>('input[name="nota"]:checked')
    ;(checado ?? primeiroCampoRef.current)?.focus()

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const teclado = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        fecharForm()
        return
      }

      // Mantém o Tab dentro do formulário enquanto ele está aberto.
      if (event.key === 'Tab' && form) {
        const focaveis = Array.from(form.querySelectorAll<HTMLElement>(FOCAVEIS))
        const primeiro = focaveis[0]
        const ultimo = focaveis[focaveis.length - 1]
        if (event.shiftKey && document.activeElement === primeiro) {
          event.preventDefault()
          ultimo?.focus()
        } else if (!event.shiftKey && document.activeElement === ultimo) {
          event.preventDefault()
          primeiro?.focus()
        }
      }
    }

    document.addEventListener('keydown', teclado)
    return () => {
      document.removeEventListener('keydown', teclado)
      document.body.style.overflow = overflowAnterior
    }
  }, [formAberto, fecharForm])

  if (status !== 'authenticated' || !areaDoApp || !restantes) {
    return null
  }

  function fecharAviso() {
    lembrarAvisoFechado()
    setAvisoVisivel(false)
  }

  const mensagemLimpa = mensagem.trim()
  const podeEnviar = nota > 0 && contarCaracteres(mensagemLimpa) >= FEEDBACK_MENSAGEM_MIN && !enviando

  async function enviar(event: React.FormEvent) {
    event.preventDefault()
    if (!podeEnviar) {
      setErroForm(
        nota === 0
          ? 'Escolha uma nota de 1 a 5.'
          : `Escreva pelo menos ${FEEDBACK_MENSAGEM_MIN} caracteres.`
      )
      return
    }

    setEnviando(true)
    setErroForm('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota, mensagem: mensagemLimpa, podeContatar }),
      })
      const dados = await res.json().catch(() => null)

      if (res.status === 201) {
        toast.success('Obrigado! Seu feedback foi registrado.')
        setRestantes(Math.max(dados.limite - dados.enviados, 0))
        setNota(0)
        setMensagem('')
        setPodeContatar(false)
        setFormAberto(false)
        fecharAviso()
        return
      }

      if (res.status === 409) {
        toast.info(dados?.message ?? 'Você já enviou o número máximo de feedbacks.')
        setRestantes(0)
        return
      }

      setErroForm(dados?.message ?? 'Não foi possível enviar agora. Tente de novo em instantes.')
    } catch {
      setErroForm('Não foi possível enviar agora. Verifique sua conexão.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      {avisoVisivel && (
        <div
          role="status"
          className="fixed bottom-5 left-4 right-20 z-50 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur sm:right-auto sm:max-w-xs"
        >
          <div className="flex items-start gap-3">
            <MessageSquareHeart aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">O que você está achando do FolioBy?</p>
              <p className="mt-1 text-sm text-zinc-400">Sua opinião decide as próximas melhorias. Leva 1 minuto.</p>
              <button
                ref={gatilhoRef}
                type="button"
                onClick={() => setFormAberto(true)}
                className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Dar feedback
              </button>
            </div>
            <button
              type="button"
              onClick={fecharAviso}
              aria-label="Fechar aviso de feedback"
              title="Agora não"
              className="rounded-full p-1 text-zinc-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      )}

      {formAberto && (
        <div className="fixed inset-0 z-[60] flex overflow-y-auto bg-black/70 p-4" onClick={fecharForm}>
          <form
            ref={formRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-titulo"
            onClick={(event) => event.stopPropagation()}
            onSubmit={enviar}
            className="m-auto w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="feedback-titulo" className="text-lg font-semibold">Seu feedback sobre o FolioBy</h2>
              <button
                type="button"
                onClick={fecharForm}
                aria-label="Fechar formulário"
                className="rounded-full p-1 text-zinc-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm text-zinc-300">Que nota você dá para a plataforma?</legend>
              <div className="mt-2 flex gap-2">
                {NOTAS.map(({ valor, rotulo }, index) => (
                  <label key={valor} title={rotulo} className="cursor-pointer">
                    <input
                      ref={index === 0 ? primeiroCampoRef : undefined}
                      type="radio"
                      name="nota"
                      value={valor}
                      checked={nota === valor}
                      onChange={() => setNota(valor)}
                      aria-label={`${valor} - ${rotulo}`}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className="flex size-11 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-zinc-300 ring-1 ring-zinc-800 transition-colors hover:bg-zinc-800 peer-checked:bg-red-600 peer-checked:text-white peer-checked:ring-red-600 peer-focus-visible:ring-2 peer-focus-visible:ring-red-400"
                    >
                      {valor}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label htmlFor="feedback-mensagem" className="mt-5 block text-sm text-zinc-300">
              O que você achou? O que faltou ou atrapalhou?
            </label>
            <textarea
              id="feedback-mensagem"
              value={mensagem}
              onChange={(event) => setMensagem(event.target.value)}
              maxLength={FEEDBACK_MENSAGEM_MAX}
              rows={5}
              required
              className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-black p-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
              placeholder="Ex.: gostei da vitrine, mas não entendi como organizar as categorias."
            />
            <p className="mt-1 text-right text-xs text-zinc-500">
              {contarCaracteres(mensagem)}/{FEEDBACK_MENSAGEM_MAX}
            </p>

            <label className="mt-3 flex items-start gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={podeContatar}
                onChange={(event) => setPodeContatar(event.target.checked)}
                className="mt-0.5 size-4 accent-red-600"
              />
              Pode me chamar por e-mail para conversar sobre isso.
            </label>

            {erroForm && (
              <p role="alert" className="mt-4 text-sm text-red-400">{erroForm}</p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">
                {restantes === 1 ? 'Último envio disponível.' : `Você ainda pode enviar ${restantes} feedbacks.`}
              </p>
              <button
                type="submit"
                disabled={enviando}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                {enviando ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
