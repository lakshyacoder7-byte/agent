begin;

alter table public.profiles
  add column if not exists occupation text,
  add column if not exists preferences jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_occupation_length_check'
  ) then
    alter table public.profiles
      add constraint profiles_occupation_length_check
      check (occupation is null or char_length(btrim(occupation)) between 1 and 100);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_preferences_object_check'
  ) then
    alter table public.profiles
      add constraint profiles_preferences_object_check
      check (jsonb_typeof(preferences) = 'object');
  end if;
end;
$$;

create table if not exists public.saved_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 500),
  description text check (description is null or char_length(description) <= 10000),
  source_url text not null check (
    char_length(btrim(source_url)) between 1 and 2048 and source_url ~* '^https?://'
  ),
  source_type text not null check (char_length(btrim(source_type)) between 1 and 50),
  image_url text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  query text not null check (char_length(btrim(query)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists saved_sources_user_created_at_idx
  on public.saved_sources (user_id, created_at desc);
create index if not exists saved_sources_user_source_type_idx
  on public.saved_sources (user_id, source_type);
create index if not exists search_history_user_created_at_idx
  on public.search_history (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.saved_sources enable row level security;
alter table public.search_history enable row level security;

revoke all on table public.profiles, public.saved_sources, public.search_history from anon, public;
grant select, insert, update, delete
  on table public.profiles, public.saved_sources, public.search_history
  to authenticated, service_role;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can read their own profile') then
    execute $policy$create policy "Users can read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id)$policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can insert their own profile') then
    execute $policy$create policy "Users can insert their own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id)$policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update their own profile') then
    execute $policy$create policy "Users can update their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id)$policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can delete their own profile') then
    execute $policy$create policy "Users can delete their own profile" on public.profiles for delete to authenticated using ((select auth.uid()) = id)$policy$;
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'saved_sources' and policyname = 'Users can read their own saved sources') then
    execute $policy$create policy "Users can read their own saved sources" on public.saved_sources for select to authenticated using ((select auth.uid()) = user_id)$policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'saved_sources' and policyname = 'Users can insert their own saved sources') then
    execute $policy$create policy "Users can insert their own saved sources" on public.saved_sources for insert to authenticated with check ((select auth.uid()) = user_id)$policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'saved_sources' and policyname = 'Users can update their own saved sources') then
    execute $policy$create policy "Users can update their own saved sources" on public.saved_sources for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)$policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'saved_sources' and policyname = 'Users can delete their own saved sources') then
    execute $policy$create policy "Users can delete their own saved sources" on public.saved_sources for delete to authenticated using ((select auth.uid()) = user_id)$policy$;
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'search_history' and policyname = 'Users can read their own search history') then
    execute $policy$create policy "Users can read their own search history" on public.search_history for select to authenticated using ((select auth.uid()) = user_id)$policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'search_history' and policyname = 'Users can insert their own search history') then
    execute $policy$create policy "Users can insert their own search history" on public.search_history for insert to authenticated with check ((select auth.uid()) = user_id)$policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'search_history' and policyname = 'Users can update their own search history') then
    execute $policy$create policy "Users can update their own search history" on public.search_history for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)$policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'search_history' and policyname = 'Users can delete their own search history') then
    execute $policy$create policy "Users can delete their own search history" on public.search_history for delete to authenticated using ((select auth.uid()) = user_id)$policy$;
  end if;
end;
$$;

create or replace function public.aven_create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  profile_name text;
begin
  profile_name := left(
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'New user'
    ),
    100
  );
  if char_length(profile_name) < 2 then
    profile_name := 'New user';
  end if;

  insert into public.profiles (id, full_name, role, occupation, preferences, interests)
  values (new.id, profile_name, 'other', null, '{}'::jsonb, '{}')
  on conflict (id) do nothing;

  return new;
end;
$function$;

revoke all on function public.aven_create_profile_for_new_user() from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'aven_create_profile_after_auth_user_insert'
      and not tgisinternal
  ) then
    execute 'create trigger aven_create_profile_after_auth_user_insert after insert on auth.users for each row execute function public.aven_create_profile_for_new_user()';
  end if;
end;
$$;

update public.profiles
set occupation = role
where occupation is null and role is not null;

update public.profiles
set preferences = jsonb_build_object('interests', to_jsonb(interests))
where preferences = '{}'::jsonb and cardinality(interests) > 0;

with auth_user_names as (
  select
    id,
    left(coalesce(
      nullif(btrim(raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(email, ''), '@', 1), ''),
      'New user'
    ), 100) as candidate_name
  from auth.users
)
insert into public.profiles (id, full_name, role)
select
  id,
  case when char_length(candidate_name) >= 2 then candidate_name else 'New user' end,
  'other'
from auth_user_names
on conflict (id) do nothing;

commit;