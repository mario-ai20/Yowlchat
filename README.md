# YowlChat

YowlChat is a premium, mobile-first social chat experience inspired by the pace and polish of modern camera-first apps, with original Yowl branding and assets.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + Framer Motion + Zustand
- Node.js + Express + Socket.IO
- Prisma + PostgreSQL
- JWT auth with refresh tokens

## Run

1. `copy .env.example .env`
2. Install deps with `npm install`
3. Start both apps: `npm.cmd run dev`

The server now starts in free `memory` mode by default, so it will not crash if you have no database yet.

If you want the split setup, set:

- `DATABASE_PROVIDER=split`
- `SUPABASE_ACCOUNTS_DATABASE_URL=<your Supabase URL for accounts>`
- `SUPABASE_CORE_DATABASE_URL=<your Supabase URL for chats/media>`
- `SUPABASE_ACCOUNTS_URL=<your Supabase project URL for accounts>`
- `SUPABASE_ACCOUNTS_PUBLISHABLE_KEY=<your Supabase anon/publishable key for accounts>`
- `SUPABASE_CORE_URL=<your Supabase project URL for chats/media>`
- `SUPABASE_CORE_PUBLISHABLE_KEY=<your Supabase anon/publishable key for chats/media>`

Legacy aliases are also supported:

- `SUPABASE_DATABASE_URL`
- `ACCOUNTS_DATABASE_URL`
- `POSTGRES_DATABASE_URL`

## Email delivery

YowlChat sends account verification and password reset codes through SMTP. If the SMTP variables are missing, the app will still run in development, but the server will only show preview codes and no real email will be delivered.

Set these variables for production:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

## Vercel deployment

YowlChat can run on Vercel as the web app plus API routes.

1. Set the Vercel project root to `apps/web`
2. Add the same Supabase env vars in Vercel
3. Leave `NEXT_PUBLIC_API_URL` empty on Vercel so the app uses same-origin `/api`
4. Deploy

The Next API catch-all in `apps/web/src/pages/api/[...path].ts` forwards requests to the existing Express routes, so auth and the current REST API can run in the Vercel app.

Socket.IO is still local/backend-driven. On Vercel the app will safely stay idle if no `NEXT_PUBLIC_SOCKET_URL` is set.

## Automatic redeploys

This repo now includes a GitHub Action that can trigger a Vercel production deploy on every push to `main`.

1. Create a Vercel Deploy Hook for the YowlChat project
2. Add it to GitHub repository secrets as `VERCEL_DEPLOY_HOOK_URL`
3. Push to `main`

If the secret is missing, the workflow skips deployment safely and prints a warning instead of failing the build.

## Structure

- `apps/web` - Next.js frontend
- `apps/server` - Express + Socket.IO API
- `packages/ui` - shared UI primitives
- `packages/types` - shared types
- `packages/config` - shared constants
