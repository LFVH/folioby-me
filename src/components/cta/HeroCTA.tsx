'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import HeaderIni from './HeaderIni'
import PricingSection from './PricingSection'

const currentFeatures = [
  {
    title: 'Portfólio por categorias',
    description:
      'Organize seu portfólio por categorias e facilite a leitura do seu trabalho. Fica mais simples apresentar estilos, serviços e áreas de atuação com clareza.',
  },
  {
    title: 'Conteúdos com imagem e GIF',
    description:
      'Publique imagens e GIFs dentro de cada categoria para mostrar peças, processos, animações e resultados de um jeito muito mais visual.',
  },
  {
    title: 'Perfil com descrição profissional',
    description:
      'Explique quem você é, o que faz e como trabalha em uma apresentação curta, direta e profissional, que passa mais segurança para quem visita seu perfil.',
  },
  {
    title: 'Links centralizados em um só lugar',
    description:
      'Reúna contatos, redes e canais importantes em uma única página. Na prática, seu perfil também pode funcionar como um hub de links do seu trabalho.',
  },
]

const futureModules = [
  {
    title: 'Customização de layout',
    description:
      'Expandir o que já existe com liberdade para ajustar cores e posições do layout, deixando cada página mais alinhada com a identidade de quem usa.',
  },
  {
    title: 'Módulo secretaria',
    description:
      'Uma frente para gerenciar agenda, compromissos e rotina de atendimento sem espalhar tudo em outras ferramentas.',
  },
  {
    title: 'Módulo planejamento',
    description:
      'Um espaço para organizar projetos, acompanhar etapas e tornar o planejamento mais visível no dia a dia.',
  },
  {
    title: 'Módulo contábil',
    description:
      'Uma área para registrar entradas e melhorar o controle financeiro ligado aos trabalhos e atendimentos.',
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
              Seu <span className="text-purple-500">portfólio em formato Netflix*</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-300 mb-2 max-w-3xl mx-auto leading-relaxed">
              Apresente suas produções de design e edição
              <span className="text-green-500 font-semibold"> profissionais</span>.
              Mostre seu trabalho com mais impacto, organização e valor percebido desde o primeiro clique.
            </p>

            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto"></div>

            <PricingSection />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-pink-500 transition-all duration-300">
                <div className="text-pink-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Portfólio</div>
                <h3 className="text-white font-bold text-lg mb-2">Visual de alto impacto</h3>
                <p className="text-gray-400 text-sm">
                  Uma apresentação mais forte para valorizar cada projeto e fazer seu portfólio chamar atenção logo no primeiro olhar.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-blue-500 transition-all duration-300">
                <div className="text-blue-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Categorias</div>
                <h3 className="text-white font-bold text-lg mb-2">Organização que vende melhor</h3>
                <p className="text-gray-400 text-sm">
                  Separe serviços, estilos e tipos de entrega em categorias para facilitar a navegação e reforçar seu posicionamento profissional.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-green-500 transition-all duration-300">
                <div className="text-green-500 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Perfil</div>
                <h3 className="text-white font-bold text-lg mb-2">Descrição e links</h3>
                <p className="text-gray-400 text-sm">
                  Tenha um perfil que resume sua proposta de valor e centraliza seus links mais importantes em um só lugar.
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-xs">
              *FolioBy não possui relação com a plataforma citada
            </p>

            <div className="mb-20">
              <h3 className="text-3xl font-bold text-white mb-4">
                Veja o <span className="text-purple-500">FolioBy</span> em ação
              </h3>
              <p className="text-gray-300 mb-10 max-w-2xl mx-auto">
                Uma estrutura pensada para criativos que querem mostrar portfólio, perfil e links de um jeito mais bonito, organizado e profissional.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="relative group overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-purple-800 to-pink-800 cursor-pointer">
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold">Portfólio por nicho</span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white font-medium">Galerias visuais</div>
                </div>

                <div className="relative group overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-blue-800 to-cyan-800 cursor-pointer">
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold">Imagens e GIFs</span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white font-medium">Conteúdo dinâmico</div>
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
                      <p className="text-white text-lg font-medium">Assista à demonstração</p>
                      <p className="text-gray-400 text-sm">2:30 min</p>
                    </div>
                  </div>

                  <div className="h-1 bg-gray-700">
                    <div className="w-0 h-full bg-purple-600 group-hover:w-1/3 transition-all duration-500"></div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mt-3">
                  Veja como o FolioBy ajuda a transformar apresentação visual em mais percepção de valor.
                </p>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 max-w-2xl mx-auto mt-12">
              <h3 className="text-2xl font-bold text-white mb-4">
                Comece a mostrar seu portfólio como um profissional
              </h3>
              {!session && (
                <Link
                  href="/signup"
                  className="px-5 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium shadow-lg hover:shadow-purple-500/25"
                >
                  Criar meu portfólio grátis
                </Link>
              )}

              <p className="text-gray-400 text-sm mt-4">
                Seus dados ficam protegidos e você pode começar sem complicação.
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
                Um portfólio visual com perfil estratégico para criativos venderem melhor o próprio trabalho
              </h3>
              <p className="mt-5 text-lg text-gray-300 leading-relaxed">
                O FolioBy foi pensado para reunir vitrine visual e posicionamento profissional em uma experiência simples. Em vez de espalhar portfólio, descrição e links em lugares diferentes, você concentra tudo em uma página que comunica melhor o que faz.
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
                  A evolução do FolioBy pode transformar a plataforma em um centro de operação para profissionais independentes
                </h4>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  A próxima etapa é ampliar o que já existe, permitindo customização de layout com cores e posições, e depois expandir a experiência com módulos práticos para rotina, projetos e organização do negócio.
                </p>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  Conto com sua participação para priorizar o que vem primeiro e ajudar a construir as ideias de forma que sejam realmente úteis para você!
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
