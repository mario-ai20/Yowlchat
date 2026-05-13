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
- `SUPABASE_ACCOUNTS_SERVICE_ROLE_KEY=<your Supabase service role key for accounts>`
- `SUPABASE_ACCOUNTS_ANON_KEY=<your Supabase anon key for accounts>`
- `SUPABASE_ACCOUNTS_PUBLISHABLE_KEY=<your Supabase anon/publishable key for accounts>`
- `SUPABASE_CORE_URL=<your Supabase project URL for chats/media>`
- `SUPABASE_CORE_SERVICE_ROLE_KEY=<your Supabase service role key for chats/media>`
- `SUPABASE_CORE_ANON_KEY=<your Supabase anon key for chats/media>`
- `SUPABASE_CORE_PUBLISHABLE_KEY=<your Supabase anon/publishable key for chats/media>`

If you only have one Supabase project configured in Vercel, the generic aliases also work:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ACCOUNT_SUPABASE_URL`
- `NEXT_PUBLIC_ACCOUNT_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CHAT_SUPABASE_URL`
- `NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY`

Legacy aliases are also supported:

- `SUPABASE_DATABASE_URL`
- `ACCOUNTS_DATABASE_URL`
- `POSTGRES_DATABASE_URL`

## Email delivery

YowlChat reads SMTP settings from the accounts database first. If that does not work, it falls back to the accounts Supabase REST API, then the core database, then the core Supabase REST API, and finally the SMTP environment variables. In production, preview codes are hidden and the app only uses real mail delivery.

Create this singleton table in the accounts database:

```sql
create table if not exists "SmtpConfiguration" (
  id text primary key,
  host text not null,
  port integer not null default 587,
  secure boolean not null default false,
  "user" text not null,
  password text not null,
  "from" text,
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now()
);
```

Insert or update one row with id `primary`:

```sql
insert into "SmtpConfiguration" (
  id, host, port, secure, "user", password, "from"
) values (
  'primary',
  'smtp.your-provider.com',
  587,
  false,
  'no-reply@yowl.chat',
  'CHANGE_ME_SMTP_PASSWORD',
  'YowlChat <no-reply@yowl.chat>'
)
on conflict (id) do update set
  host = excluded.host,
  port = excluded.port,
  secure = excluded.secure,
  "user" = excluded."user",
  password = excluded.password,
  "from" = excluded."from",
  "updatedAt" = now();
```

You can still set these variables for fallback or local development:

- `SUPABASE_ACCOUNTS_URL`
- `SUPABASE_ACCOUNTS_SERVICE_ROLE_KEY`
- `SUPABASE_CORE_URL`
- `SUPABASE_CORE_SERVICE_ROLE_KEY`
- `SMTP_URL`
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
