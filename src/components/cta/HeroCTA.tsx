'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PricingSection from './PricingSection'
import HeaderIni from '../HeaderIni'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function HeroCTA() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const refreshTrue = searchParams.get('refresh');
  

  useEffect(() => {
    const verifyPayment = async () => {
      await update({refreshToken: true});
      router.refresh()
      router.push("/")
    };

    if (refreshTrue) {
      verifyPayment();
    }
  }, [refreshTrue, update, router]);

  useEffect(() => {
    if (session && session.user.status) {
      router.push("/nextsteps/contents")
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      alert('Por favor, insira um email válido')
      return
    }

    const encodedEmail = encodeURIComponent(email)
    router.push(`/checkout?email=${encodedEmail}`)
    setEmail('')
  }

  return (
    <div className="relative bg-gradient-to-br from-purple-900 via-black to-blue-900 min-h-screen flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/80 to-black"></div>

      <HeaderIni />
      
      <div className="relative z-10 max-w-6xl mx-auto text-center pt-32">
        {/* Logo principal */}
        <div className="">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            FolioBy
          </h1>
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Seu <span className="text-purple-500">Portfólio em Formato Netflix</span>
        </h2>
        
        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-2 max-w-3xl mx-auto leading-relaxed">
          Organize suas produções de design e edição em categorias 
          <span className="text-green-500 font-semibold"> profissionais</span>. 
          Mostre seu trabalho como nunca antes.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto"></div>
        {/* Pricing Section */}
        <PricingSection />
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-purple-500 transition-all duration-300">
            <div className="text-purple-500 text-2xl mb-3">🎯</div>
            <h3 className="text-white font-bold text-lg mb-2">Categorias Personalizadas</h3>
            <p className="text-gray-400 text-sm">
              Organize por tipo de trabalho: edição de imagem, motion design, identidade visual e mais
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-pink-500 transition-all duration-300">
            <div className="text-pink-500 text-2xl mb-3">📺</div>
            <h3 className="text-white font-bold text-lg mb-2">Visual Netflix-style</h3>
            <p className="text-gray-400 text-sm">
              Apresentação cinematográfica que valoriza cada projeto e impressiona clientes
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-blue-500 transition-all duration-300">
            <div className="text-blue-500 text-2xl mb-3">🎨</div>
            <h3 className="text-white font-bold text-lg mb-2">Destaque seu Estilo</h3>
            <p className="text-gray-400 text-sm">
              Mostre sua evolução criativa e atraia mais oportunidades profissionais
            </p>
          </div>
        </div>

        {/* SEÇÃO DE DEMONSTRAÇÃO - EXEMPLOS E VÍDEO */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-white mb-4">
            Veja o <span className="text-purple-500">FolioBy</span> em Ação
          </h3>
          <p className="text-gray-300 mb-10 max-w-2xl mx-auto">
            Confira como criativos estão apresentando seus portfolios e conquistando novos clientes
          </p>

          {/* Grid de Exemplos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Exemplo 1 */}
            <div className="relative group overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-purple-800 to-pink-800 cursor-pointer">
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-semibold">Editor de Imagem</span>
              </div>
              <div className="absolute bottom-4 left-4 text-white font-medium">📸 15 projetos</div>
            </div>

            {/* Exemplo 2 */}
            <div className="relative group overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-blue-800 to-cyan-800 cursor-pointer">
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-semibold">Motion Design</span>
              </div>
              <div className="absolute bottom-4 left-4 text-white font-medium">🎬 8 animações</div>
            </div>

            {/* Exemplo 3 */}
            <div className="relative group overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-green-800 to-teal-800 cursor-pointer">
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-semibold">Identidade Visual</span>
              </div>
              <div className="absolute bottom-4 left-4 text-white font-medium">🎨 12 marcas</div>
            </div>
          </div>

          {/* Área de Vídeo Demonstração */}
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl">
              {/* Placeholder do Vídeo */}
              <div className="aspect-video bg-gradient-to-r from-purple-900 to-black flex items-center justify-center group cursor-pointer">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">▶</span>
                  </div>
                  <p className="text-white text-lg font-medium">Assista à demonstração</p>
                  <p className="text-gray-400 text-sm">2:30 min</p>
                </div>
              </div>
              
              {/* Barra de progresso simulada */}
              <div className="h-1 bg-gray-700">
                <div className="w-0 h-full bg-purple-600 group-hover:w-1/3 transition-all duration-500"></div>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mt-3">
              👆 Clique para ver como o FolioBy transforma a apresentação do seu trabalho
            </p>
          </div>
        </div>

        {/* CTA Form */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 max-w-2xl mx-auto mt-12">
          <h3 className="text-2xl font-bold text-white mb-4">
            Comece a Mostrar seu Portfolio como um Profissional
          </h3>
          {!session && (
            <Link 
              href="/signup" 
              className="px-5 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium shadow-lg hover:shadow-purple-500/25"
            >
              Criar meu Portfolio grátis
            </Link>
          )}

          <p className="text-gray-400 text-sm mt-4">
            🔒 Seus dados estão seguros. Comece grátis, cancele quando quiser.
          </p>
        </div>

        {/* Social Proof */}
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
    </div>
  )
}