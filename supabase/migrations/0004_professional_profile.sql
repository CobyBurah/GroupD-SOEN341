-- Adds the professional-profile fields job seekers fill in: a short headline,
-- their location, and a longer bio. Limits here must match PROFILE_LIMITS in
-- src/lib/profiles.ts.
alter table public.profiles
  add column headline text not null default '' check (char_length(headline) <= 120),
  add column location text not null default '' check (char_length(location) <= 100),
  add column bio text not null default '' check (char_length(bio) <= 2000);

-- 0001 only granted update on (full_name, updated_at).
grant update (headline, location, bio) on public.profiles to authenticated;
