create extension if not exists supabase_vault with schema vault;

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  allowed_email_domains text[] not null,
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  university_id uuid not null references public.universities(id),
  email text not null,
  display_name text,
  starter_templates_seeded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_mailboxes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.students(id) on delete cascade,
  provider text not null check (provider = 'microsoft'),
  mailbox_address text not null,
  consent_status text not null check (consent_status in ('pending', 'connected', 'revoked')),
  refresh_token_ref uuid not null references vault.secrets(id),
  graph_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  name text not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.universities (name, slug, allowed_email_domains)
values ('University of Calgary', 'ucalgary', array['ucalgary.ca']);

alter table public.universities enable row level security;
alter table public.students enable row level security;
alter table public.student_mailboxes enable row level security;
alter table public.message_templates enable row level security;

revoke all on table public.universities from anon;
revoke all on table public.students from anon;
revoke all on table public.student_mailboxes from anon;
revoke all on table public.message_templates from anon;

grant select on table public.universities to authenticated;
grant select on table public.students to authenticated;
grant select on table public.student_mailboxes to authenticated;
grant select, insert, update, delete on table public.message_templates to authenticated;

create policy "Authenticated students can read universities"
  on public.universities for select
  to authenticated
  using (true);

create policy "Students can read their own profile"
  on public.students for select
  to authenticated
  using (auth_user_id = (select auth.uid()));

create policy "Students can read their own mailbox"
  on public.student_mailboxes for select
  to authenticated
  using (
    exists (
      select 1
      from public.students
      where students.id = student_mailboxes.student_id
        and students.auth_user_id = (select auth.uid())
    )
  );

create policy "Students can manage their own templates"
  on public.message_templates for all
  to authenticated
  using (
    exists (
      select 1
      from public.students
      where students.id = message_templates.student_id
        and students.auth_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.students
      where students.id = message_templates.student_id
        and students.auth_user_id = (select auth.uid())
    )
  );

create or replace function public.complete_microsoft_mailbox_connection(
  p_auth_user_id uuid,
  p_email text,
  p_display_name text,
  p_mailbox_address text,
  p_refresh_token text
)
returns public.student_mailboxes
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_domain text;
  v_university_id uuid;
  v_student public.students;
  v_mailbox public.student_mailboxes;
  v_refresh_token_ref uuid;
begin
  if p_refresh_token is null or length(trim(p_refresh_token)) = 0 then
    raise exception 'Microsoft refresh token is required';
  end if;

  v_domain := lower(split_part(trim(p_email), '@', 2));

  select universities.id
  into v_university_id
  from public.universities
  where v_domain = any(universities.allowed_email_domains);

  if v_university_id is null then
    raise exception 'University email domain is not allowed';
  end if;

  insert into public.students (
    auth_user_id,
    university_id,
    email,
    display_name
  )
  values (
    p_auth_user_id,
    v_university_id,
    lower(trim(p_email)),
    nullif(trim(p_display_name), '')
  )
  on conflict (auth_user_id)
  do update set
    university_id = excluded.university_id,
    email = excluded.email,
    display_name = coalesce(excluded.display_name, students.display_name),
    updated_at = now()
  returning * into v_student;

  select student_mailboxes.refresh_token_ref
  into v_refresh_token_ref
  from public.student_mailboxes
  where student_mailboxes.student_id = v_student.id;

  if v_refresh_token_ref is null then
    select vault.create_secret(
      p_refresh_token,
      'microsoft-refresh-token:' || v_student.id::text,
      'Microsoft Graph delegated refresh token for UResearch Student Mailbox'
    )
    into v_refresh_token_ref;
  else
    perform vault.update_secret(
      v_refresh_token_ref,
      p_refresh_token,
      'microsoft-refresh-token:' || v_student.id::text,
      'Microsoft Graph delegated refresh token for UResearch Student Mailbox'
    );
  end if;

  insert into public.student_mailboxes (
    student_id,
    provider,
    mailbox_address,
    consent_status,
    refresh_token_ref
  )
  values (
    v_student.id,
    'microsoft',
    lower(trim(p_mailbox_address)),
    'connected',
    v_refresh_token_ref
  )
  on conflict (student_id)
  do update set
    mailbox_address = excluded.mailbox_address,
    consent_status = excluded.consent_status,
    refresh_token_ref = excluded.refresh_token_ref,
    updated_at = now()
  returning * into v_mailbox;

  if v_student.starter_templates_seeded_at is null then
    insert into public.message_templates (student_id, name, subject, body)
    values
      (
        v_student.id,
        'General research inquiry',
        'Research opportunity inquiry',
        'Hello {{professor_name}},' || E'\n\n' ||
        'I am interested in learning more about research opportunities in {{department}}. ' ||
        'Your work on {{research_snippet}} caught my attention.' || E'\n\n' ||
        'Would you be open to a brief conversation?' || E'\n\n' ||
        'Best regards,' || E'\n' ||
        '{{student_name}}'
      ),
      (
        v_student.id,
        'Referencing specific research',
        'Question about your research',
        'Hello {{professor_name}},' || E'\n\n' ||
        'I came across your profile and was particularly interested in {{research_snippet}}. ' ||
        'I would appreciate the opportunity to ask whether your group has room for a student researcher.' || E'\n\n' ||
        'Best regards,' || E'\n' ||
        '{{student_name}}'
      ),
      (
        v_student.id,
        'Short introduction',
        'Student research inquiry',
        'Hello {{professor_first_name}},' || E'\n\n' ||
        'I am a student interested in {{department}} and would value the chance to discuss possible research opportunities.' || E'\n\n' ||
        'Best regards,' || E'\n' ||
        '{{student_name}}'
      );

    update public.students
    set starter_templates_seeded_at = now(),
        updated_at = now()
    where id = v_student.id;
  end if;

  return v_mailbox;
end;
$$;

revoke all on function public.complete_microsoft_mailbox_connection(uuid, text, text, text, text) from public;
revoke all on function public.complete_microsoft_mailbox_connection(uuid, text, text, text, text) from anon;
revoke all on function public.complete_microsoft_mailbox_connection(uuid, text, text, text, text) from authenticated;
grant execute on function public.complete_microsoft_mailbox_connection(uuid, text, text, text, text) to service_role;
