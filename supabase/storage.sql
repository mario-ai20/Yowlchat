-- YowlChat storage setup
-- Run this in the Supabase project that stores chats/media and Echoes assets.

insert into storage.buckets (id, name, public)
values ('yowl-media', 'yowl-media', true)
on conflict (id) do update
set public = excluded.public;

-- The server uploads with the service-role key, so no extra RLS policy is required
-- for the current implementation.
