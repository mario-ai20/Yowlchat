# Supabase setup for YowlChat

You need two separate Supabase projects:

- `accounts` project for auth, profile, friends and AI
- `core` project for chats, stories, Echoes, map and media

## Run in the accounts project

1. Open the Supabase SQL editor for the accounts project.
2. Paste and run [`accounts.sql`](./accounts.sql).
3. That file now also creates the `SmtpConfiguration` table used by Yowl email delivery.

## Run in the core project

1. Open the Supabase SQL editor for the core project.
2. Paste and run [`core.sql`](./core.sql).
3. Paste and run [`storage.sql`](./storage.sql).
4. That file now also creates the `SmtpConfiguration` table used by Yowl email delivery if you keep SMTP config in the core project.

## Environment values

Fill your root [`.env`](../.env.example) with:

- `SUPABASE_ACCOUNTS_DATABASE_URL`
- `SUPABASE_CORE_DATABASE_URL`
- `NEXT_PUBLIC_ACCOUNT_SUPABASE_URL`
- `NEXT_PUBLIC_ACCOUNT_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CHAT_SUPABASE_URL`
- `NEXT_PUBLIC_CHAT_SUPABASE_ANON_KEY`
- `SUPABASE_CORE_URL`
- `SUPABASE_CORE_SERVICE_ROLE_KEY`

## Important

The two Supabase projects cannot be directly foreign-key linked across databases.
YowlChat keeps them in sync at the application layer by mirroring users into the core project.
