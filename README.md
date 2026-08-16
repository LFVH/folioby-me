# FolioBy

> Uma plataforma SaaS para profissionais criativos exibirem trabalhos, perfil e links em uma experiência visual inspirada em catálogos de streaming.

O **FolioBy** transforma o portfólio profissional em uma vitrine organizada, com página pública personalizada e painel de gerenciamento. A proposta é centralizar projetos, posicionamento e canais de contato em um só lugar, facilitando a apresentação de designers, editores, motion designers e outros profissionais visuais.

## Problema que resolve

Profissionais criativos costumam dividir seu trabalho entre redes sociais, drives, sites e links de contato. O FolioBy reúne esses elementos em uma experiência coerente e navegável, para que cada pessoa possa apresentar sua produção com mais contexto e valor percebido.

## Funcionalidades

- **Portfólio público por URL personalizada:** cada usuário possui um *slug* exclusivo para compartilhar seu trabalho.
- **Galerias organizadas por categorias:** crie e edite categorias para separar estilos, serviços ou tipos de entrega.
- **Gestão de conteúdo:** cadastre, edite, busque e remova trabalhos; associe-os a uma ou mais categorias.
- **Suporte a mídias visuais:** publicação de imagens, GIFs e sequências de imagens, com preview antes do envio.
- **Perfil profissional:** edição de descrição rica e centralização de links importantes em uma página pública.
- **Autenticação e área protegida:** cadastro, login e controle de acesso ao painel do usuário.
- **Planos e assinaturas:** estrutura para checkout e gestão de assinaturas via Stripe e Mercado Pago, com processamento de webhooks do Mercado Pago.
- **Uploads escaláveis:** armazenamento de arquivos usando Vercel Blob.
- **Segurança de navegação:** middleware para permissões, proteção de rotas e limitação de requisições em produção.

## Tecnologias utilizadas

| Camada | Tecnologias |
| --- | --- |
| Front-end | Next.js 16, React 18, TypeScript e Tailwind CSS |
| Interface | Headless UI, Radix UI, Lucide e React Icons |
| Estado e formulários | TanStack Query, Zustand, React Hook Form e Zod |
| Editor de texto | TipTap |
| Back-end | Route Handlers do Next.js e NextAuth |
| Banco de dados | PostgreSQL e Prisma ORM |
| Arquivos | Vercel Blob |
| Pagamentos | Stripe e Mercado Pago |
| Proteção | Upstash Redis / Ratelimit, JWT, bcrypt e validação de webhook com HMAC |

## Arquitetura em alto nível

```text
Visitante
   └── Página pública /{slug} e /{slug}/profile

Usuário autenticado
   └── Painel /nextsteps
          ├── Conteúdos e categorias
          ├── Perfil e links
          └── Assinatura

Next.js API + NextAuth
   ├── Prisma + PostgreSQL
   ├── Vercel Blob
   ├── Stripe
   └── Mercado Pago + webhooks
```

## Execução local

### Pré-requisitos

- Node.js 20 ou superior
- PostgreSQL acessível
- Conta/configuração dos serviços opcionais usados pelo projeto (Vercel Blob, Stripe, Mercado Pago e Upstash)

### Instalação

```bash
npm install
```

Crie um arquivo `.env.local` com as variáveis necessárias. As principais são:

```env
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Pagamentos (conforme integrações usadas)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUB_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=

# Serviços opcionais
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Gere o cliente do Prisma e inicie a aplicação:

```bash
npm run prisma:generate
npm run dev
```

Depois, acesse `http://localhost:3000`.

> O comando `npm run dev` sincroniza o schema do Prisma com o banco. Utilize um banco de desenvolvimento dedicado antes de executá-lo.

## Destaques para apresentação em portfólio

- Construção de uma aplicação full-stack com experiência pública e área autenticada.
- Modelagem relacional para usuários, conteúdos, categorias, assinaturas e histórico.
- Integração de pagamentos recorrentes e tratamento seguro de eventos assíncronos por webhook.
- Implementação de uma experiência de gerenciamento de mídia com upload, preview, filtros e paginação.
- Atenção a segurança com autenticação, controle de rotas, rate limiting e verificação criptográfica de requisições externas.

## Status

Projeto em evolução. O repositório demonstra a base funcional da plataforma e suas integrações principais.
