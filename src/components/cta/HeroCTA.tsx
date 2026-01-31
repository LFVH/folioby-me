'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PricingSection from './PricingSection'
import HeaderIni from '../HeaderIni'
import { useSession } from 'next-auth/react'

export default function HeroCTA() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const { data: session } = useSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica do email
    if (!email || !email.includes('@')) {
      alert('Por favor, insira um email válido')
      return
    }

    // Codificar o email para passar como query parameter
    const encodedEmail = encodeURIComponent(email)
    
    // Redirecionar para a página de checkout com o email
    router.push(`/checkout?email=${encodedEmail}`)
    
    // Opcional: limpar o campo após o envio
    setEmail('')
  }

  return (
<div className="relative bg-gradient-to-br from-orange-500 via-black to-red-900 min-h-screen flex items-center justify-center px-4">
  {/* Background Pattern */}
  <div className="absolute inset-0 bg-black/50"></div>
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/80 to-black"></div>

  <HeaderIni />
  
  <div className="relative z-10 max-w-6xl mx-auto text-center pt-32">
    {/* Logo principal */}
    <div className="">
      <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-4">
        DIRECTOR'S FLIX
      </h1>
      
    </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Sua <span className="text-red-500">Biblioteca Criativa</span> Ilimitada
        </h2>
        
        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-2 max-w-3xl mx-auto leading-relaxed">
          Milhares de referências organizadas e categorizadas para 
          <span className="text-green-500 font-semibold"> acelerar sua criatividade</span> e 
          <span className="text-blue-600 font-semibold"> inspirar suas edições</span>
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-purple-600 mx-auto"></div>
        <PricingSection />
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-red-500 transition-all duration-300">
            <div className="text-red-500 text-2xl mb-3">🎬</div>
            <h3 className="text-white font-bold text-lg mb-2">Referências Organizadas</h3>
            <p className="text-gray-400 text-sm">
              Conteúdos categorizados por estilo, gênero e tendência para busca rápida
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-purple-500 transition-all duration-300">
            <div className="text-purple-500 text-2xl mb-3">⚡</div>
            <h3 className="text-white font-bold text-lg mb-2">Inspiração Instantânea</h3>
            <p className="text-gray-400 text-sm">
              Supere o bloqueio criativo com nossa curadoria especializada
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-blue-500 transition-all duration-300">
            <div className="text-blue-500 text-2xl mb-3">🚀</div>
            <h3 className="text-white font-bold text-lg mb-2">Workflow Acelerado</h3>
            <p className="text-gray-400 text-sm">
              Encontre a referência perfeita em segundos e foque na criação
            </p>
          </div>
        </div>

        {/* CTA Form */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            Comece a Criar com Mais Inspiração
          </h3>
          {!session ? (
            <>
            <Link 
              href="/signup" 
              className="px-5 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium shadow-lg hover:shadow-red-500/25"
            >
              Cadastre-se e acesse grátis
            </Link>
            </>
          ) : (
                      <Link 
            href="/letsgo" 
            className="px-5 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium shadow-lg hover:shadow-red-500/25"
          >
            Acesse grátis
          </Link>
            
          )}


          <p className="text-gray-400 text-sm mt-4">
            🔒 Seus dados estão seguros. Não compartilhamos seu email com terceiros.
          </p>
        </div>

        {/* Social Proof */}
        <div className="mt-12">
          <p className="text-gray-400 mb-4">Trusted by creative teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-white font-bold text-lg">STUDIO A</div>
            <div className="text-white font-bold text-lg">EDIT PRO</div>
            <div className="text-white font-bold text-lg">CREATIVE HOUSE</div>
            <div className="text-white font-bold text-lg">MOTION LAB</div>
          </div>
        </div>
      </div>
    </div>
  )
}