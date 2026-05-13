-- YowlChat core database
-- Run this in the Supabase project you use for chats, stories, map data and media metadata.
--
-- Important:
-- The current backend mirrors users from the accounts project into this core project.
-- That keeps Prisma relations working while the two Supabase projects stay separate.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

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
  "passwordHash" text not null default '',
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

create table if not exists public."Chat" (
  "id" text primary key,
  "title" text not null,
  "isGroup" boolean not null default false,
  "isArchived" boolean not null default false,
  "pinnedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

drop trigger if exists set_chat_updated_at on public."Chat";
create trigger set_chat_updated_at
before update on public."Chat"
for each row execute function public.set_updated_at();

create table if not exists public."ChatParticipant" (
  "id" text primary key,
  "chatId" text not null references public."Chat" ("id") on delete cascade,
  "userId" text not null references public."User" ("id") on delete cascade,
  "unreadCount" integer not null default 0,
  "lastReadAt" timestamptz,
  "isTyping" boolean not null default false,
  "isMuted" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("chatId", "userId")
);

drop trigger if exists set_chat_participant_updated_at on public."ChatParticipant";
create trigger set_chat_participant_updated_at
before update on public."ChatParticipant"
for each row execute function public.set_updated_at();

create table if not exists public."Message" (
  "id" text primary key,
  "chatId" text not null references public."Chat" ("id") on delete cascade,
  "senderId" text not null references public."User" ("id") on delete cascade,
  "content" text not null,
  "mediaUrl" text,
  "mediaType" text,
  "ephemeralSeconds" integer,
  "replyToId" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "deletedAt" timestamptz
);

drop trigger if exists set_message_updated_at on public."Message";
create trigger set_message_updated_at
before update on public."Message"
for each row execute function public.set_updated_at();

create index if not exists "Message_chatId_createdAt_idx" on public."Message" ("chatId", "createdAt");

create table if not exists public."MessageReceipt" (
  "id" text primary key,
  "messageId" text not null references public."Message" ("id") on delete cascade,
  "userId" text not null references public."User" ("id") on delete cascade,
  "deliveredAt" timestamptz,
  "readAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("messageId", "userId")
);

drop trigger if exists set_message_receipt_updated_at on public."MessageReceipt";
create trigger set_message_receipt_updated_at
before update on public."MessageReceipt"
for each row execute function public.set_updated_at();

create table if not exists public."Story" (
  "id" text primary key,
  "authorId" text not null references public."User" ("id") on delete cascade,
  "mediaUrl" text not null,
  "mediaType" text not null,
  "caption" text,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

drop trigger if exists set_story_updated_at on public."Story";
create trigger set_story_updated_at
before update on public."Story"
for each row execute function public.set_updated_at();

create index if not exists "Story_authorId_expiresAt_idx" on public."Story" ("authorId", "expiresAt");

create table if not exists public."StoryView" (
  "id" text primary key,
  "storyId" text not null references public."Story" ("id") on delete cascade,
  "userId" text not null references public."User" ("id") on delete cascade,
  "viewedAt" timestamptz not null default now(),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("storyId", "userId")
);

drop trigger if exists set_story_view_updated_at on public."StoryView";
create trigger set_story_view_updated_at
before update on public."StoryView"
for each row execute function public.set_updated_at();

create table if not exists public."Memory" (
  "id" text primary key,
  "userId" text not null references public."User" ("id") on delete cascade,
  "title" text not null,
  "mediaUrl" text not null,
  "folder" text not null,
  "favorite" boolean not null default false,
  "isPrivate" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

drop trigger if exists set_memory_updated_at on public."Memory";
create trigger set_memory_updated_at
before update on public."Memory"
for each row execute function public.set_updated_at();

create table if not exists public."Streak" (
  "id" text primary key,
  "fromUserId" text not null references public."User" ("id") on delete cascade,
  "toUserId" text not null references public."User" ("id") on delete cascade,
  "flameCount" integer not null default 0,
  "lastUpdatedAt" timestamptz not null default now(),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("fromUserId", "toUserId")
);

drop trigger if exists set_streak_updated_at on public."Streak";
create trigger set_streak_updated_at
before update on public."Streak"
for each row execute function public.set_updated_at();

create table if not exists public."Reaction" (
  "id" text primary key,
  "emoji" text not null,
  "userId" text not null references public."User" ("id") on delete cascade,
  "messageId" text references public."Message" ("id") on delete cascade,
  "storyId" text references public."Story" ("id") on delete cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

drop trigger if exists set_reaction_updated_at on public."Reaction";
create trigger set_reaction_updated_at
before update on public."Reaction"
for each row execute function public.set_updated_at();

create index if not exists "Reaction_userId_idx" on public."Reaction" ("userId");

create table if not exists public."LocationPing" (
  "id" text primary key,
  "userId" text not null references public."User" ("id") on delete cascade,
  "lat" double precision not null,
  "lng" double precision not null,
  "ghostMode" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

drop trigger if exists set_location_ping_updated_at on public."LocationPing";
create trigger set_location_ping_updated_at
before update on public."LocationPing"
for each row execute function public.set_updated_at();

create index if not exists "LocationPing_userId_createdAt_idx" on public."LocationPing" ("userId", "createdAt");
