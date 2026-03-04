import React from 'react';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Termos de Uso - FolioBy',
  description: 'Termos e condições de uso da plataforma FolioBy para portfólios criativos',
};
export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-gray-100">
      {}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Termos de Uso
          </h1>
          <p className="text-center text-gray-400 mt-4 text-lg">
            FolioBy - Sua vitrine criativa
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
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700 hover:border-purple-500/50 transition-all">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-purple-500 mr-3 rounded-full"></span>
              1. Aceitação dos Termos
            </h2>
            <p className="leading-relaxed">
              Bem-vindo ao <span className="text-purple-400 font-medium">FolioBy</span>! Ao acessar ou utilizar nossa plataforma, você concorda integralmente com estes Termos de Uso. Se você não concorda com qualquer parte destes termos, por favor, não utilize nossos serviços.
            </p>
            <p className="leading-relaxed mt-3">
              O FolioBy é uma plataforma online que permite que profissionais criativos, especialmente editores de imagem e vídeo, publiquem e divulguem seus portfólios.
            </p>
          </section>
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700 hover:border-purple-500/50 transition-all">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-purple-500 mr-3 rounded-full"></span>
              2. Cadastro e Conta
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Para publicar conteúdo, você deve criar uma conta e fornecer informações verdadeiras, precisas e atualizadas.</li>
              <li>Você é o único responsável por tudo o que acontecer em sua conta.</li>
              <li>Você deve manter sua senha em sigilo e seguro.</li>
              <li>Você deve ter pelo menos 18 anos de idade, ou a maioridade legal em seu país, para utilizar o serviço.</li>
            </ul>
          </section>
          {}
          <section className="bg-gradient-to-r from-red-900/20 to-red-800/10 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-red-500/30 hover:border-red-500 transition-all">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-red-500 mr-3 rounded-full"></span>
              3. Regras de Conduta e Conteúdo Proibido
            </h2>
            <p className="leading-relaxed mb-4 text-red-200">
              O FolioBy foi criado para exibir trabalhos criativos e profissionais. Para manter um ambiente seguro e legal, é estritamente proibido:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Conteúdo Ilegal: Qualquer material que viole leis locais, estaduais, nacionais ou internacionais.",
                "Pornografia e Nudez Explícita: É proibida a publicação de pornografia, material obsceno, ou nudez explícita.",
                "Conteúdo Criminoso: Material que promova, incentive ou ensine crimes, violência ou terrorismo.",
                "Discurso de Ódio e Assédio: Conteúdo que promova discriminação, racismo ou assédio.",
                "Violação de Direitos Autorais: Publicar trabalhos que não são seus ou sem os devidos direitos.",
                "Conteúdo Violento ou Chocante: Imagens de violência extrema sem contexto artístico legítimo.",
                "Malware e Vírus: Links ou arquivos que contenham código malicioso.",
                "Spam e Autopromoção Predatória: Uso abusivo para redirecionar usuários."
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-2 bg-black/20 p-3 rounded-lg">
                  <span className="text-red-400 mt-1">⚠️</span>
                  <span className="text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 font-medium">
              ⚖️ O FolioBy se reserva o direito de remover qualquer conteúdo que viole estas regras, sem aviso prévio, e de suspender ou encerrar permanentemente a conta de usuários infratores.
            </p>
          </section>
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700 hover:border-purple-500/50 transition-all">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-purple-500 mr-3 rounded-full"></span>
              4. Propriedade Intelectual
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <h3 className="font-semibold text-blue-300 mb-2">📸 Seu Conteúdo:</h3>
                <p>Você mantém todos os direitos sobre suas imagens e vídeos. Ao publicar, você nos concede uma licença não-exclusiva, mundial, livre de royalties para hospedar, armazenar e exibir seu conteúdo na plataforma.</p>
              </div>
              <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                <h3 className="font-semibold text-purple-300 mb-2">⚙️ Plataforma:</h3>
                <p>O nome "FolioBy", logotipo, design do site e código são de propriedade exclusiva do FolioBy e não podem ser copiados ou reproduzidos sem autorização.</p>
              </div>
            </div>
          </section>
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700 hover:border-purple-500/50 transition-all">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-purple-500 mr-3 rounded-full"></span>
              5. Direitos Autorais e DMCA
            </h2>
            <p className="leading-relaxed">
              Respeitamos a propriedade intelectual alheia. Se você acredita que seu trabalho foi copiado no FolioBy de forma que constitua violação de direitos autorais, por favor, nos informe imediatamente:
            </p>
            <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
              <p className="font-mono text-purple-300">📧 abuso@folioby.com</p>
              <p className="text-sm text-gray-400 mt-2">Forneceremos os dados necessários para que você possa registrar uma notificação formal de remoção.</p>
            </div>
          </section>
          {}
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700 hover:border-purple-500/50 transition-all">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="w-1 h-8 bg-purple-500 mr-3 rounded-full"></span>
              6. Limitação de Responsabilidade
            </h2>
            <p className="leading-relaxed">
              O FolioBy atua como uma plataforma de exibição. Nós <span className="text-red-400 font-medium">não somos responsáveis</span> pelo conteúdo publicado pelos usuários. Não garantimos a veracidade, originalidade ou segurança das imagens postadas. Você utiliza a plataforma por sua conta e risco.
            </p>
          </section>
          {}
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <span className="w-1 h-6 bg-purple-500 mr-2 rounded-full"></span>
                7. Modificações dos Termos
              </h2>
              <p>Podemos alterar estes Termos periodicamente. Notificaremos os usuários sobre mudanças significativas.</p>
            </section>
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <span className="w-1 h-6 bg-purple-500 mr-2 rounded-full"></span>
                8. Lei Aplicável
              </h2>
              <p>Estes Termos serão regidos de acordo com as leis da República Federativa do Brasil.</p>
            </section>
          </div>
          {}
          <section className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-8 border border-purple-500/50">
            <h2 className="text-2xl font-semibold text-white mb-4 text-center">
              📬 Contato
            </h2>
            <p className="text-center text-gray-300 mb-6">
              Se você tiver dúvidas sobre estes Termos, entre em contato conosco:
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center">
              <div className="bg-black/30 p-4 rounded-lg w-full md:w-auto">
                <p className="text-purple-400 font-medium">E-mail</p>
                <p className="text-white">contato@folioby.com</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg w-full md:w-auto">
                <p className="text-purple-400 font-medium">Site</p>
                <p className="text-white">www.folioby.com</p>
              </div>
            </div>
          </section>
          {}
          <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-800">
            <p>© {new Date().getFullYear()} FolioBy. Todos os direitos reservados.</p>
            <p className="mt-2">Feito para criativos, por criativos.</p>
          </div>
        </div>
      </main>
    </div>
  );
}