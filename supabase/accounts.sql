-- YowlChat accounts database
-- Run this in the Supabase project you use for auth, profile, friends and AI.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

create table if not exists public."SmtpConfiguration" (
  "id" text primary key,
  "host" text not null,
  "port" integer not null default 587,
  "secure" boolean not null default false,
  "user" text not null,
  "password" text not null,
  "from" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

drop trigger if exists set_smtp_configuration_updated_at on public."SmtpConfiguration";
create trigger set_smtp_configuration_updated_at
before update on public."SmtpConfiguration"
for each row execute function public.set_updated_at();

create table if not exists public."User" (
  "id" text primary key,
  "email" text not null unique,
  "username" text not null unique,
  "firstName" text,
  "lastName" text,
  "birthDate" timestamptz,
  "phoneNumber" text,
  "gender" text,
  "displayName" text not null,
  "passwordHash" text not null,
  "avatarUrl" text,
  "bio" text,
  "location" text,
  "theme" text not null default 'dark',
  "publicProfile" boolean not null default true,
  "isGhostMode" boolean not null default false,
  "pushNotificationsEnabled" boolean not null default true,
  "autoSaveEchoes" boolean not null default true,
  "flames" integer not null default 0,
  "yowlScore" integer not null default 0,
  "lastSeenAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

alter table if exists public."User"
  add column if not exists "firstName" text,
  add column if not exists "lastName" text,
  add column if not exists "birthDate" timestamptz,
  add column if not exists "phoneNumber" text,
  add column if not exists "gender" text,
  add column if not exists "theme" text not null default 'dark',
  add column if not exists "pushNotificationsEnabled" boolean not null default true,
  add column if not exists "autoSaveEchoes" boolean not null default true;

drop trigger if exists set_user_updated_at on public."User";
create trigger set_user_updated_at
before update on public."User"
for each row execute function public.set_updated_at();

create table if not exists public."Session" (
  "id" text primary key,
  "userId" text not null references public."User" ("id") on delete cascade,
  "deviceId" text not null,
  "refreshTokenHash" text not null,
  "userAgent" text,
  "ipAddress" text,
  "revokedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("userId", "deviceId")
);

alter table if exists public."Session"
  add column if not exists "deviceId" text;

drop trigger if exists set_session_updated_at on public."Session";
create trigger set_session_updated_at
before update on public."Session"
for each row execute function public.set_updated_at();

create table if not exists public."Friendship" (
  "id" text primary key,
  "requesterId" text not null references public."User" ("id") on delete cascade,
  "addresseeId" text not null references public."User" ("id") on delete cascade,
  "status" text not null default 'pending',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("requesterId", "addresseeId")
);

drop trigger if exists set_friendship_updated_at on public."Friendship";
create trigger set_friendship_updated_at
before update on public."Friendship"
for each row execute function public.set_updated_at();

create table if not exists public."Notification" (
  "id" text primary key,
  "userId" text not null references public."User" ("id") on delete cascade,
  "type" text not null,
  "title" text not null,
  "body" text not null,
  "seen" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

drop trigger if exists set_notification_updated_at on public."Notification";
create trigger set_notification_updated_at
before update on public."Notification"
for each row execute function public.set_updated_at();

create table if not exists public."AiConversation" (
  "id" text primary key,
  "userId" text not null references public."User" ("id") on delete cascade,
  "title" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

drop trigger if exists set_ai_conversation_updated_at on public."AiConversation";
create trigger set_ai_conversation_updated_at
before update on public."AiConversation"
for each row execute function public.set_updated_at();

create table if not exists public."AiMessage" (
  "id" text primary key,
  "conversationId" text not null references public."AiConversation" ("id") on delete cascade,
  "role" text not null,
  "content" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

drop trigger if exists set_ai_message_updated_at on public."AiMessage";
create trigger set_ai_message_updated_at
before update on public."AiMessage"
for each row execute function public.set_updated_at();

create index if not exists "Session_userId_idx" on public."Session" ("userId");
create index if not exists "Friendship_requesterId_idx" on public."Friendship" ("requesterId");
create index if not exists "Friendship_addresseeId_idx" on public."Friendship" ("addresseeId");
create index if not exists "Notification_userId_idx" on public."Notification" ("userId");
create index if not exists "AiConversation_userId_idx" on public."AiConversation" ("userId");
create index if not exists "AiMessage_conversationId_idx" on public."AiMessage" ("conversationId");
