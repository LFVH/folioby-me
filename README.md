# FolioBy

> A SaaS platform for creative professionals to showcase their work, profile, and links in a visual experience inspired by streaming catalogs.

**FolioBy** turns a professional portfolio into an organized showcase, combining a custom public page — accessible through your own personalized slug (folioby.me/yourname) — with a management dashboard. Its purpose is to bring projects, personal positioning, and contact channels together in one place, including a Linktree-style link hub for your social and professional links, making it easier for designers, editors, motion designers, and other visual professionals to present their work.

## The problem it solves

Creative professionals often spread their work across social media, cloud drives, websites, and contact links. FolioBy brings these elements together in a consistent, easy-to-navigate experience so users can present their work with more context and perceived value.

## Features

- **Public portfolio with a custom URL:** each user has a unique *slug* to share their work.
- **Category-based galleries:** create and edit categories to organize styles, services, or deliverable types.
- **Content management:** create, edit, search, and delete projects; assign them to one or more categories.
- **Visual media support:** publish images, GIFs, and image sequences, with a preview before upload.
- **Professional profile:** edit rich-text descriptions and centralize important links on a public page.
- **Authentication and protected workspace:** sign-up, sign-in, and access control for the user dashboard.
- **Plans and subscriptions:** checkout and subscription-management infrastructure with Stripe and Mercado Pago, including Mercado Pago webhook processing.
- **Scalable uploads:** file storage powered by Vercel Blob, with image validation and per-user storage accounting.
- **Navigation security:** middleware for permissions, route protection, and production request rate limiting.

### Upload limits

- Accepted media types: JPEG, PNG, GIF, WebP, and AVIF.
- Maximum size per portfolio upload: **500 MB**.
- Maximum profile image size: **5 MB**.
- Maximum storage per user: **2 GB**.

Limits are checked before issuing the Vercel Blob client token. Usage is persisted in the database and adjusted when content or profile images are added and removed.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Front end | Next.js 16, React 18, TypeScript, and Tailwind CSS |
| UI | Headless UI, Radix UI, Lucide, and React Icons |
| State and forms | TanStack Query, Zustand, React Hook Form, and Zod |
| Rich-text editor | TipTap |
| Back end | Next.js Route Handlers and NextAuth |
| Database | PostgreSQL and Prisma ORM |
| File storage | Vercel Blob |
| Payments | Stripe and Mercado Pago |
| Protection | Upstash Redis / Ratelimit, JWT, bcrypt, and HMAC webhook validation |

## High-level architecture

```text
Visitor
   └── Public pages: /{slug} and /{slug}/profile

Authenticated user
   └── Dashboard: /nextsteps
          ├── Content and categories
          ├── Profile and links
          └── Subscription

Next.js API + NextAuth
   ├── Prisma + PostgreSQL
   ├── Vercel Blob
   ├── Stripe
   └── Mercado Pago + webhooks
```

## Architecture and technical decisions

- **Full-stack Next.js:** public pages, authenticated dashboard, and API Route Handlers live in the same application, keeping feature ownership close to its UI and reducing deployment complexity.
- **Server-side authorization:** NextAuth, middleware, and `verifyUser` protect dashboard and upload endpoints; the server remains the source of truth for permissions and quotas.
- **Relational core:** PostgreSQL and Prisma model users, content, categories, subscriptions, history, refresh tokens, and webhook requests. BigInt byte counters track storage without relying on client state.
- **External services by responsibility:** Vercel Blob stores media, while Stripe and Mercado Pago handle billing. Webhook routes validate and record provider events independently from the user interface.
- **Shared validation at boundaries:** Zod, route-level checks, rate limiting, and signed webhook validation reduce the amount of untrusted data that reaches application logic.
- **Client-side media flow:** portfolio files are uploaded directly to Vercel Blob after the server validates the authenticated user, requested size, type, and remaining quota.

## Running locally

### Prerequisites

- Node.js 20 or later
- An accessible PostgreSQL database
- Accounts and configuration for the optional services used by the project: Vercel Blob, Stripe, Mercado Pago, and Upstash

### Installation

```bash
npm install
```

Create a `.env.local` file with the required variables. The main ones are:

```env
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Payments (depending on the integrations in use)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUB_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=

# Optional services
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Generate the Prisma client and start the application:

```bash
npm run prisma:generate
npm run dev
```

Then open `http://localhost:3000`.

> `npm run dev` synchronizes the Prisma schema with the database. Use a dedicated development database before running it.

## Testing and CI

Tests use [Vitest](https://vitest.dev/) with a Node environment and cover files matching `src/**/*.test.ts`. The current suite includes the credentials authentication flow, using Prisma mocks and bcrypt checks rather than a live database for that unit test.

Run the checks locally with:

```bash
npm run lint
npm run test
npm run build
```

GitHub Actions runs the same lint, test, and build checks on every push and pull request. The workflow provisions PostgreSQL 16 as a service, installs dependencies with `npm ci`, generates the Prisma client as part of the test/build scripts, and uses Node.js 24 in CI.

## Portfolio highlights

- Built a full-stack application with both public-facing and authenticated experiences.
- Designed a relational data model for users, content, categories, subscriptions, and history.
- Integrated recurring payments and secure asynchronous webhook-event handling.
- Implemented a media management experience with uploads, previews, filters, and pagination.
- Prioritized security with authentication, route control, rate limiting, and cryptographic validation of external requests.

## Status

This project is under active development. The repository demonstrates the platform's functional foundation and its main integrations.
