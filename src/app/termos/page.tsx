import React from 'react';
import { Metadata } from 'next';
import { contact_mail } from '@/types';

export const metadata: Metadata = {
  title: 'Termos de Uso - FolioBy',
  description: 'Termos e condições de uso da plataforma FolioBy para portfólios criativos',
};

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-gray-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
          <h1 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-5xl lg:text-6xl">
            Termos de Uso
          </h1>
          <p className="mt-4 text-center text-lg text-gray-400">
            FolioBy - Sua vitrine criativa
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            Última atualização: 24/04/2026
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 text-gray-300">
          <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 md:p-8">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-white">
              <span className="mr-3 h-8 w-1 rounded-full bg-purple-500"></span>
              1. Aceitação dos Termos
            </h2>
            <p className="leading-relaxed">
              Bem-vindo ao <span className="font-medium text-purple-400">FolioBy</span>! Ao acessar ou
              utilizar nossa plataforma, você concorda integralmente com estes Termos de Uso. Se você
              não concorda com qualquer parte destes termos, por favor, não utilize nossos serviços.
            </p>
            <p className="mt-3 leading-relaxed">
              O FolioBy é uma plataforma online que permite que profissionais criativos,
              especialmente editores de imagem e vídeo, publiquem e divulguem seus portfólios.
            </p>
          </section>

          <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 md:p-8">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-white">
              <span className="mr-3 h-8 w-1 rounded-full bg-purple-500"></span>
              2. Cadastro e Conta
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Para publicar conteúdo, você deve criar uma conta e fornecer informações verdadeiras,
                precisas e atualizadas.
              </li>
              <li>Você é o único responsável por tudo o que acontecer em sua conta.</li>
              <li>Você deve manter sua senha em sigilo e seguro.</li>
              <li>
                Você deve ter pelo menos 18 anos de idade, ou a maioridade legal em seu país, para
                utilizar o serviço.
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-900/20 to-red-800/10 p-6 backdrop-blur-sm transition-all hover:border-red-500 md:p-8">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-white">
              <span className="mr-3 h-8 w-1 rounded-full bg-red-500"></span>
              3. Regras de Conduta e Conteúdo Proibido
            </h2>
            <p className="mb-4 leading-relaxed text-red-200">
              O FolioBy foi criado para exibir trabalhos criativos e profissionais. Para manter um
              ambiente seguro e legal, é estritamente proibido:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                'Conteúdo ilegal: qualquer material que viole leis locais, estaduais, nacionais ou internacionais.',
                'Pornografia e nudez explícita: é proibida a publicação de pornografia, material obsceno ou nudez explícita.',
                'Conteúdo criminoso: material que promova, incentive ou ensine crimes, violência ou terrorismo.',
                'Discurso de ódio e assédio: conteúdo que promova discriminação, racismo ou assédio.',
                'Violação de direitos autorais: publicar trabalhos que não são seus ou sem os devidos direitos.',
                'Conteúdo violento ou chocante: imagens de violência extrema sem contexto artístico legítimo.',
                'Malware e vírus: links ou arquivos que contenham código malicioso.',
                'Spam e autopromoção predatória: uso abusivo para redirecionar usuários.',
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-2 rounded-lg bg-black/20 p-3">
                  <span className="mt-1 text-red-400">!</span>
                  <span className="text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-lg border border-red-500/50 bg-red-900/30 p-4 font-medium text-red-200">
              O FolioBy se reserva o direito de remover qualquer conteúdo que viole estas regras,
              sem aviso prévio, e de suspender ou encerrar permanentemente a conta de usuários
              infratores.
            </p>
          </section>

          <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 md:p-8">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-white">
              <span className="mr-3 h-8 w-1 rounded-full bg-purple-500"></span>
              4. Propriedade Intelectual
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
                <h3 className="mb-2 font-semibold text-blue-300">Seu Conteúdo</h3>
                <p>
                  Você mantém todos os direitos sobre suas imagens e vídeos. Ao publicar, você nos
                  concede uma licença não exclusiva, mundial, livre de royalties para hospedar,
                  armazenar e exibir seu conteúdo na plataforma.
                </p>
              </div>
              <div className="rounded-lg border border-purple-500/30 bg-purple-900/20 p-4">
                <h3 className="mb-2 font-semibold text-purple-300">Plataforma</h3>
                <p>
                  O nome &quot;FolioBy&quot;, logotipo, design do site e código são de propriedade
                  exclusiva do FolioBy e não podem ser copiados ou reproduzidos sem autorização.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 md:p-8">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-white">
              <span className="mr-3 h-8 w-1 rounded-full bg-purple-500"></span>
              5. Direitos Autorais e DMCA
            </h2>
            <p className="leading-relaxed">
              Respeitamos a propriedade intelectual alheia. Se você acredita que seu trabalho foi
              copiado no FolioBy de forma que constitua violação de direitos autorais, por favor,
              nos informe imediatamente:
            </p>
            <div className="mt-4 rounded-lg bg-gray-700/50 p-4">
              <p className="font-mono text-purple-300">{' '}
              <a
                href={`mailto:${contact_mail}`}
                className="font-medium text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
              >
                {contact_mail}
              </a>{' '}</p>
              <p className="mt-2 text-sm text-gray-400">
                Forneceremos os dados necessários para que você possa registrar uma notificação
                formal de remoção.
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 md:p-8">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-white">
              <span className="mr-3 h-8 w-1 rounded-full bg-purple-500"></span>
              6. Limitação de Responsabilidade
            </h2>
            <p className="leading-relaxed">
              O FolioBy atua como uma plataforma de exibição. Nós{' '}
              <span className="font-medium text-red-400">não somos responsáveis</span> pelo conteúdo
              publicado pelos usuários. Não garantimos a veracidade, originalidade ou segurança das
              imagens postadas. Você utiliza a plataforma por sua conta e risco.
            </p>
          </section>

          <section className="rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-6 backdrop-blur-sm transition-all hover:border-emerald-400/60 md:p-8">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-white">
              <span className="mr-3 h-8 w-1 rounded-full bg-emerald-400"></span>
              7. Garantia de 7 Dias
            </h2>
            <p className="leading-relaxed text-emerald-100">
              Solicitações de reembolso realizadas dentro de 7 (sete) dias corridos a partir do
              pagamento receberão reembolso total do valor pago pelo uso da plataforma.
            </p>
            <p className="mt-3 leading-relaxed">
              Para solicitar o reembolso, o cliente deve enviar um e-mail para{' '}
              <a
                href={`mailto:${contact_mail}`}
                className="font-medium text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
              >
                {contact_mail}
              </a>{' '}
              dentro desse prazo, informando os dados da compra para identificação do pagamento.
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50">
              <h2 className="mb-3 flex items-center text-xl font-semibold text-white">
                <span className="mr-2 h-6 w-1 rounded-full bg-purple-500"></span>
                8. Modificações dos Termos
              </h2>
              <p>Podemos alterar estes Termos periodicamente. Notificaremos os usuários sobre mudanças significativas.</p>
            </section>
            <section className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50">
              <h2 className="mb-3 flex items-center text-xl font-semibold text-white">
                <span className="mr-2 h-6 w-1 rounded-full bg-purple-500"></span>
                9. Lei Aplicável
              </h2>
              <p>Estes Termos serão regidos de acordo com as leis da República Federativa do Brasil.</p>
            </section>
          </div>

          <section className="rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-8">
            <h2 className="mb-4 text-center text-2xl font-semibold text-white">Contato</h2>
            <p className="mb-6 text-center text-gray-300">
              Se você tiver dúvidas sobre estes Termos ou precisar solicitar reembolso dentro do
              prazo de garantia, entre em contato conosco:
            </p>
            <div className="flex flex-col items-center justify-center gap-6 text-center md:flex-row">
              <div className="w-full rounded-lg bg-black/30 p-4 md:w-auto">
                <p className="font-medium text-purple-400">E-mail</p>
                <a
                  href={`mailto:${contact_mail}`}
                  className="text-white underline underline-offset-4 hover:text-purple-300"
                >
                  {contact_mail}
                </a>
              </div>
              <div className="w-full rounded-lg bg-black/30 p-4 md:w-auto">
                <p className="font-medium text-purple-400">Site</p>
                <p className="text-white">www.folioby.com</p>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} FolioBy. Todos os direitos reservados.</p>
            <p className="mt-2">Feito para criativos, por criativos.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
