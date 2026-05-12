'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import HeaderIni from './HeaderIni'
import PricingSection from './PricingSection'

const currentFeatures = [
  {
    title: 'Portfolio por categorias',
    description:
      'Organize seu portfolio em categorias e deixe cada area do seu trabalho mais facil de entender, navegar e valorizar.',
  },
  {
    title: 'Conteudos com imagem e GIF',
    description:
      'Dentro de cada categoria, voce pode publicar conteudos visuais em imagem e GIF para mostrar pecas, processos, animacoes e resultados.',
  },
  {
    title: 'Perfil com descricao profissional',
    description:
      'Apresente quem voce e, o que faz e como trabalha em um texto que ajuda seu perfil a parecer mais claro, forte e confiavel.',
  },
  {
    title: 'Links centralizados em um so lugar',
    description:
      'Reuna contatos, redes e canais importantes em uma pagina que tambem pode funcionar como um Linktree do seu trabalho.',
  },
]

const futureModules = [
  {
    title: 'Customizacao de layout',
    description:
      'Expandir o que ja existe com liberdade para ajustar cores e posicoes do layout, deixando cada pagina mais pessoal.',
  },
  {
    title: 'Modulo secretaria',
    description:
      'Uma frente para gerenciar agenda, compromissos e rotina de atendimento sem espalhar tudo em outras ferramentas.',
  },
  {
    title: 'Modulo planejamento',
    description:
      'Um espaco para organizar projetos, acompanhar etapas e tornar o planejamento mais visivel no dia a dia.',
  },
  {
    title: 'Modulo contabil',
    description:
      'Uma area para registrar entradas e melhorar o controle financeiro ligado aos trabalhos e atendimentos.',
  },
]

export default function HeroCTA() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const searchParams = useSearchParams()
  const refreshTrue = searchParams.get('refresh')

  useEffect(() => {
    const verifyPayment = async () => {
      await update({ refreshToken: true })
      router.refresh()
      router.push('/')
    }

    if (refreshTrue) {
      verifyPayment()
    }
  }, [refreshTrue, update, router])

  useEffect(() => {
    if (session && session.user.status) {
      router.push('/nextsteps/contents')
    }
  }, [session, router])

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-black to-blue-900">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/80 to-black"></div>

      <HeaderIni />

      <div className="relative z-10">
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-6xl mx-auto text-center pt-32 pb-16">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
              FolioBy
            </h1>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Seu <span className="text-purple-500">portfolio em formato Netflix*</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-300 mb-2 max-w-3xl mx-auto leading-relaxed">
              Apresente suas producoes de design e edicao
              <span className="text-green-500 font-semibold"> profissionais</span>.
              Mostre seu trabalho com mais impacto, organizacao e valor percebido.
            </p>

            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto"></div>

            <PricingSection />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-pink-500 transition-all duration-300">
                <div className="text-pink-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Portfolio</div>
                <h3 className="text-white font-bold text-lg mb-2">Visual de alto impacto</h3>
                <p className="text-gray-400 text-sm">
                  Uma apresentacao forte para valorizar cada projeto e ajudar seu portfolio a se destacar logo no primeiro olhar.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-blue-500 transition-all duration-300">
                <div className="text-blue-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Categorias</div>
                <h3 className="text-white font-bold text-lg mb-2">Organizacao que vende melhor</h3>
                <p className="text-gray-400 text-sm">
                  Separe servicos, estilos e tipos de entrega em categorias para facilitar a leitura e reforcar seu posicionamento.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-green-500 transition-all duration-300">
                <div className="text-green-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Perfil</div>
                <h3 className="text-white font-bold text-lg mb-2">Descricao e links</h3>
                <p className="text-gray-400 text-sm">
                  Tenha um perfil que resume sua proposta de valor e centraliza seus links mais importantes em um so lugar.
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-xs">
              *FolioBy nao possui relacao com a plataforma citada
            </p>

            <div className="mb-20">
              <h3 className="text-3xl font-bold text-white mb-4">
                Veja o <span className="text-purple-500">FolioBy</span> em acao
              </h3>
              <p className="text-gray-300 mb-10 max-w-2xl mx-auto">
                Uma estrutura pensada para criativos que querem mostrar portfolio, perfil e links de forma mais bonita e profissional.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="relative group overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-purple-800 to-pink-800 cursor-pointer">
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold">Portfolio por nicho</span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white font-medium">Galerias visuais</div>
                </div>

                <div className="relative group overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-blue-800 to-cyan-800 cursor-pointer">
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold">Imagens e GIFs</span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white font-medium">Conteudo dinamico</div>
                </div>

                <div className="relative group overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-green-800 to-teal-800 cursor-pointer">
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold">Perfil com links</span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white font-medium">Hub profissional</div>
                </div>
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl">
                  <div className="aspect-video bg-gradient-to-r from-purple-900 to-black flex items-center justify-center group cursor-pointer">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-4xl">{'>'}</span>
                      </div>
                      <p className="text-white text-lg font-medium">Assista a demonstracao</p>
                      <p className="text-gray-400 text-sm">2:30 min</p>
                    </div>
                  </div>

                  <div className="h-1 bg-gray-700">
                    <div className="w-0 h-full bg-purple-600 group-hover:w-1/3 transition-all duration-500"></div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mt-3">
                  Veja como o FolioBy ajuda a transformar apresentacao visual em percepcao de valor.
                </p>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 max-w-2xl mx-auto mt-12">
              <h3 className="text-2xl font-bold text-white mb-4">
                Comece a mostrar seu portfolio como um profissional
              </h3>
              {!session && (
                <Link
                  href="/signup"
                  className="px-5 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium shadow-lg hover:shadow-purple-500/25"
                >
                  Criar meu portfolio gratis
                </Link>
              )}

              <p className="text-gray-400 text-sm mt-4">
                Seus dados ficam protegidos e voce pode comecar sem complicacao.
              </p>
            </div>

            <div className="mt-12">
              <p className="text-gray-400 mb-4">Usado por criativos de</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="text-white font-bold text-lg">DESIGN STUDIO</div>
                <div className="text-white font-bold text-lg">MOTION HOUSE</div>
                <div className="text-white font-bold text-lg">EDIT PRO</div>
                <div className="text-white font-bold text-lg">CRIATIVOS BR</div>
              </div>
            </div>
          </div>
        </section>

        <section id="sobre" className="scroll-mt-28 px-4 pb-24">
          <div className="max-w-6xl mx-auto rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md p-8 md:p-12 shadow-2xl shadow-black/30">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-purple-400/40 bg-purple-500/10 px-4 py-1 text-sm font-medium text-purple-200">
                Sobre o sistema
              </span>
              <h3 className="mt-5 text-3xl md:text-5xl font-bold text-white leading-tight">
                Um portfolio visual com perfil estrategico para criativos venderem melhor o proprio trabalho
              </h3>
              <p className="mt-5 text-lg text-gray-300 leading-relaxed">
                O FolioBy foi pensado para juntar apresentacao visual e posicionamento profissional em uma experiencia simples. Em vez de espalhar portfolio, descricao e links em varios lugares, voce concentra tudo em uma pagina que comunica melhor o que entrega.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentFeatures.map((feature, index) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-black/30 p-6 transition-colors hover:border-purple-400/40"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/15 text-purple-200 font-semibold">
                      0{index + 1}
                    </span>
                    <h4 className="text-xl font-semibold text-white">{feature.title}</h4>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 p-8">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  Ideias futuras
                </p>
                <h4 className="mt-3 text-2xl md:text-3xl font-bold text-white">
                  A evolucao do FolioBy pode transformar a plataforma em um centro de operacao para profissionais independentes
                </h4>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  A proxima etapa é ampliar o que ja existe, permitindo customizacao de layout com cores e posicoes, e depois expandir a experiencia com modulos praticos para rotina, projetos e controle de entradas.
                </p>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  Conto com sua participação para priorizar o que vem primeiro e ajudar a construir as ideias de forma que sejam realmente uteis para você!
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {futureModules.map((module) => (
                  <div
                    key={module.title}
                    className="rounded-2xl border border-white/10 bg-black/30 p-5"
                  >
                    <h5 className="text-lg font-semibold text-white">{module.title}</h5>
                    <p className="mt-3 text-sm leading-relaxed text-gray-300">{module.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
