-- TeraJobs initial schema
-- Run this in Supabase Dashboard > SQL Editor.
-- This schema establishes candidate profiles, companies, jobs, applications and private resume storage.

create extension if not exists pgcrypto;

create type public.account_role as enum ('candidate', 'employer', 'admin');
create type public.job_status as enum ('draft', 'published', 'paused', 'closed');
create type public.application_status as enum ('applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.account_role not null default 'candidate',
  full_name text,
  phone text,
  city text,
  state text,
  email text,
  headline text,
  education text,
  experience_years numeric(4,1) default 0,
  skills text[] not null default '{}',
  resume_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  website text,
  logo_path text,
  city text,
  state text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  company_name text,
  title text not null,
  description text not null,
  category text,
  city text not null,
  state text,
  salary_min integer,
  salary_max integer,
  employment_type text,
  experience_min numeric(4,1) default 0,
  experience_max numeric(4,1),
  vacancies integer not null default 1,
  status public.job_status not null default 'draft',
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  resume_path text,
  cover_note text,
  status public.application_status not null default 'applied',
  applied_at timestamptz not null default now(),
  unique(job_id, candidate_id)
);

create table public.saved_jobs (
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(candidate_id, job_id)
);

create index jobs_status_city_created_idx on public.jobs(status, city, created_at desc);
create index jobs_category_idx on public.jobs(category);
create index applications_candidate_idx on public.applications(candidate_id, applied_at desc);
create index applications_job_idx on public.applications(job_id, applied_at desc);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;

-- Profiles: users can read/update their own profile.
create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Users create own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Public can view published jobs. Employers manage only their own jobs.
create policy "Anyone can view published jobs" on public.jobs for select using (status = 'published' or employer_id = auth.uid());
create policy "Employers create own jobs" on public.jobs for insert to authenticated with check (employer_id = auth.uid());
create policy "Employers update own jobs" on public.jobs for update to authenticated using (employer_id = auth.uid()) with check (employer_id = auth.uid());
create policy "Employers delete own jobs" on public.jobs for delete to authenticated using (employer_id = auth.uid());

-- Company details are visible to visitors; only the owner can change them.
create policy "Anyone can view companies" on public.companies for select using (true);
create policy "Owners create company" on public.companies for insert to authenticated with check (owner_id = auth.uid());
create policy "Owners update company" on public.companies for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Candidates see their own applications; employers see applications to their jobs.
create policy "Candidates and relevant employers view applications" on public.applications for select to authenticated
using (candidate_id = auth.uid() or exists (
  select 1 from public.jobs j where j.id = applications.job_id and j.employer_id = auth.uid()
));
create policy "Candidates apply as themselves" on public.applications for insert to authenticated
with check (candidate_id = auth.uid() and exists (
  select 1 from public.jobs j where j.id = applications.job_id and j.status = 'published'
));
create policy "Relevant employers update application status" on public.applications for update to authenticated
using (exists (select 1 from public.jobs j where j.id = applications.job_id and j.employer_id = auth.uid()))
with check (exists (select 1 from public.jobs j where j.id = applications.job_id and j.employer_id = auth.uid()));

create policy "Candidates manage saved jobs" on public.saved_jobs for all to authenticated
using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());

-- Private resume bucket. Application-based access is enforced by policies below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('candidate-resumes', 'candidate-resumes', false, 5242880,
  array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

create policy "Candidates upload own resume folder" on storage.objects for insert to authenticated
with check (bucket_id = 'candidate-resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Candidates and applying employers read resumes" on storage.objects for select to authenticated
using (
  bucket_id = 'candidate-resumes' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.resume_path = name and j.employer_id = auth.uid()
    )
  )
);

create policy "Candidates update own resumes" on storage.objects for update to authenticated
using (bucket_id = 'candidate-resumes' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'candidate-resumes' and (storage.foldername(name))[1] = auth.uid()::text);

-- Create a profile row whenever a new auth user registers.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
