import React from 'react';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Política de Privacidade - FolioBy',
  description: 'Saiba como o FolioBy coleta, usa e protege seus dados pessoais em conformidade com a LGPD.',
};
export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-gray-100">
      {}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-blue-900/20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
            Política de Privacidade
          </h1>
          <p className="text-center text-gray-400 mt-4 text-lg">
            FolioBy - Sua privacidade é nossa prioridade
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Última atualização: 04/03/2026
          </p>
        </div>
      </div>
      {}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 text-gray-300">
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700">
            <p className="leading-relaxed text-lg">
              No <span className="text-green-400 font-medium">FolioBy</span>, sua privacidade é levada a sério. 
              Esta Política explica como coletamos, usamos, compartilhamos e protegemos suas informações 
              pessoais em conformidade com a <span className="text-blue-400">Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</span>.
            </p>
          </section>
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700 hover:border-green-500/50 transition-all">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-green-500 mr-3 rounded-full"></span>
              1. Dados que Coletamos
            </h2>
            <div className="space-y-6">
              {}
              <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-500/30">
                <h3 className="text-xl font-semibold text-blue-300 mb-3 flex items-center">
                  <span className="mr-2">👤</span> Dados de Perfil (Públicos)
                </h3>
                <p className="mb-2">Para criar e personalizar seu portfólio, coletamos:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><span className="text-green-400">Nome completo ou artístico:</span> Exibido publicamente na sua página de portfólio para identificação profissional.</li>
                  <li><span className="text-green-400">Imagem de perfil (foto ou avatar):</span> Exibida publicamente para dar rosto ao seu trabalho.</li>
                </ul>
                <p className="mt-3 text-sm text-gray-400">
                  <span className="text-yellow-400">📌 Finalidade:</span> Identificar você como criador do portfólio e permitir que outros usuários conheçam seu trabalho.
                </p>
              </div>
              {}
              <div className="bg-purple-900/20 p-5 rounded-lg border border-purple-500/30">
                <h3 className="text-xl font-semibold text-purple-300 mb-3 flex items-center">
                  <span className="mr-2">📧</span> Dados de Contato (Privados)
                </h3>
                <p className="mb-2">Para comunicação e acesso à plataforma, coletamos:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><span className="text-green-400">E-mail:</span> Utilizado para login, recuperação de senha e comunicações importantes sobre o serviço.</li>
                </ul>
                <p className="mt-3 text-sm text-gray-400">
                  <span className="text-yellow-400">📌 Finalidade:</span> Autenticação segura e canal oficial de comunicação.
                </p>
                <p className="mt-2 text-sm bg-purple-900/40 p-2 rounded">
                  <span className="text-purple-300">🔒 Estes dados NÃO são exibidos publicamente.</span>
                </p>
              </div>
              {}
              <div className="bg-yellow-900/20 p-5 rounded-lg border border-yellow-500/30">
                <h3 className="text-xl font-semibold text-yellow-300 mb-3 flex items-center">
                  <span className="mr-2">💳</span> Dados de Pagamento
                </h3>
                <p className="mb-2">Processados de forma segura pelo Stripe:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><span className="text-green-400">Dados de cartão de crédito:</span> Coletados e processados exclusivamente pelo Stripe.</li>
                  <li><span className="text-green-400">Informações de faturamento:</span> Endereço, CPF/CNPJ quando necessário para emissão de notas.</li>
                </ul>
                <div className="mt-4 p-3 bg-black/40 rounded-lg">
                  <p className="text-sm font-medium text-yellow-300">⚠️ Importante:</p>
                  <p className="text-sm">O FolioBy <span className="text-red-400">NÃO ARMAZENA</span> dados de cartão de crédito. Todo o processamento é feito diretamente nos servidores seguros do <span className="text-blue-400">Stripe</span>, que é certificado PCI DSS nível 1.</p>
                </div>
              </div>
              {}
              <div className="bg-gray-700/30 p-5 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-300 mb-3 flex items-center">
                  <span className="mr-2">🤖</span> Dados Coletados Automaticamente
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Endereço IP</li>
                  <li>Tipo de navegador e dispositivo</li>
                  <li>Páginas acessadas e tempo de navegação</li>
                  <li>Cookies (essenciais para funcionamento)</li>
                </ul>
              </div>
            </div>
          </section>
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700 hover:border-green-500/50 transition-all">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-green-500 mr-3 rounded-full"></span>
              2. Como Utilizamos seus Dados
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 bg-black/30 p-4 rounded-lg">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-green-400">Para exibir seu portfólio</h3>
                  <p className="text-sm">Nome e foto de perfil são públicos para mostrar quem você é.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-black/30 p-4 rounded-lg">
                <span className="text-2xl">🔐</span>
                <div>
                  <h3 className="font-semibold text-green-400">Autenticação e segurança</h3>
                  <p className="text-sm">E-mail para login e proteção da sua conta.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-black/30 p-4 rounded-lg">
                <span className="text-2xl">📢</span>
                <div>
                  <h3 className="font-semibold text-green-400">Comunicação</h3>
                  <p className="text-sm">Enviar atualizações, dicas e informações do serviço.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-black/30 p-4 rounded-lg">
                <span className="text-2xl">💳</span>
                <div>
                  <h3 className="font-semibold text-green-400">Processar pagamentos</h3>
                  <p className="text-sm">Via Stripe, com máxima segurança.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-black/30 p-4 rounded-lg">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-green-400">Melhorar o serviço</h3>
                  <p className="text-sm">Análise de uso para tornar o FolioBy melhor.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-black/30 p-4 rounded-lg">
                <span className="text-2xl">⚖️</span>
                <div>
                  <h3 className="font-semibold text-green-400">Cumprir obrigações legais</h3>
                  <p className="text-sm">Atender requisições judiciais e prevenir fraudes.</p>
                </div>
              </div>
            </div>
          </section>
          {}
          <section className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 md:p-8 border border-blue-500/50">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-blue-500 mr-3 rounded-full"></span>
              3. Processamento de Pagamentos - Stripe
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center p-4">
                <svg viewBox="0 0 80 34" className="w-full">
                  <path fill="#6772E5" d="M17.1 6.7h6.8v20.3h-6.8V6.7zm26.7 0c-3.8 0-6.4 2-7.5 5.2h-.1v-4.6h-6.7v20.3h6.7v-9.7c0-3.1 1.7-5 4.7-5 2.8 0 4.3 1.8 4.3 5v9.7h6.8v-11c0-6.3-3.5-9.9-8.9-9.9zm-38.9 0c-2.7 0-5 1.5-6.1 3.9h-.1V6.7H.3v20.3h6.7v-9.7c0-3.1 1.7-5 4.7-5 2.8 0 4.3 1.8 4.3 5v9.7h6.8v-11c0-6.3-3.6-9.9-9-9.9zm48.3 0v20.3h6.8v-3.9h.1c1.1 2.4 3.5 3.9 6.4 3.9 5 0 8.9-3.8 8.9-9.8 0-5.9-3.8-9.7-8.8-9.7-3 0-5.4 1.5-6.4 4h-.1v-4.8h-6.9zm10.9 14c-2.4 0-4.1-1.6-4.1-4.2 0-2.5 1.7-4.2 4.1-4.2 2.5 0 4.2 1.7 4.2 4.2 0 2.6-1.7 4.2-4.2 4.2z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-lg mb-2">Utilizamos o <span className="text-blue-400 font-bold">Stripe</span> como processador de pagamentos.</p>
                <p className="text-gray-300">Todos os dados financeiros são enviados diretamente para o Stripe, seguindo os mais altos padrões de segurança da indústria (PCI DSS Nível 1).</p>
                <p className="mt-3 text-sm">Para mais informações, consulte a <a href="https://stripe.com/br/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Política de Privacidade do Stripe</a>.</p>
              </div>
            </div>
          </section>
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-green-500 mr-3 rounded-full"></span>
              4. Compartilhamento de Dados
            </h2>
            <p className="mb-3">Seus dados <span className="text-red-400">NÃO</span> são vendidos para terceiros. Podemos compartilhar apenas:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="text-green-400">Com o Stripe:</span> Exclusivamente para processar pagamentos.</li>
              <li><span className="text-green-400">Por obrigação legal:</span> Com autoridades judiciais quando exigido por lei.</li>
              <li><span className="text-green-400">Dados públicos:</span> Nome e foto de perfil são visíveis para qualquer visitante do seu portfólio (essa é a finalidade do serviço).</li>
            </ul>
          </section>
          {}
          <section className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl p-6 md:p-8 border border-green-500/50">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-green-500 mr-3 rounded-full"></span>
              5. Seus Direitos (LGPD - Lei 13.709/2018)
            </h2>
            <p className="mb-4">Você tem direito a:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Confirmar se tratamos seus dados",
                "Acessar seus dados pessoais",
                "Corrigir dados incompletos ou errados",
                "Solicitar anonimização ou bloqueio",
                "Solicitar portabilidade dos dados",
                "Eliminar dados desnecessários",
                "Revogar consentimento a qualquer momento",
                "Solicitar exclusão da conta"
              ].map((direito, index) => (
                <div key={index} className="bg-black/30 p-3 rounded-lg flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-sm">{direito}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 p-4 bg-black/40 rounded-lg">
              Para exercer seus direitos, entre em contato pelo e-mail: <span className="text-green-400 font-mono">lgpd@folioby.com</span>
            </p>
          </section>
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-green-500 mr-3 rounded-full"></span>
              6. Armazenamento e Segurança
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">🔒</span>
                <span>Seus dados são armazenados em servidores seguros com criptografia.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">🌍</span>
                <span>Servidores localizados no Brasil (ou conforme legislação aplicável).</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">⏱️</span>
                <span>Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão, dados são removidos em até 30 dias, exceto quando necessário cumprir obrigações legais.</span>
              </li>
            </ul>
          </section>
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-green-500 mr-3 rounded-full"></span>
              7. Cookies
            </h2>
            <p>Utilizamos cookies essenciais para:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Manter você logado</li>
              <li>Lembrar preferências</li>
              <li>Analisar tráfego (anonymized)</li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">Você pode desabilitar cookies nas configurações do navegador, mas algumas funcionalidades podem ser afetadas.</p>
          </section>
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 text-center">
              📞 Dúvidas ou Exercer seus Direitos?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="text-purple-400 font-medium">Para questões gerais</p>
                <p className="text-white">contato@folioby.com</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="text-green-400 font-medium">LGPD / Dados Pessoais</p>
                <p className="text-white">lgpd@folioby.com</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">
              Nossa equipe responderá em até 15 dias úteis.
            </p>
          </section>
          {}
          <section className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-sm">
              <span className="text-yellow-400">Encarregado de Dados (DPO):</span> [Nome do responsável] - dpo@folioby.com
            </p>
          </section>
          {}
          <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-800">
            <p>© {new Date().getFullYear()} FolioBy. Todos os direitos reservados.</p>
            <p className="mt-2">Versão 1.0 - Em conformidade com a LGPD.</p>
          </div>
        </div>
      </main>
    </div>
  );
}