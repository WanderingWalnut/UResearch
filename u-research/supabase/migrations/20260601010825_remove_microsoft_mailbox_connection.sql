create temporary table microsoft_mailbox_secret_refs on commit drop as
select refresh_token_ref
from public.student_mailboxes;

drop function public.complete_microsoft_mailbox_connection(uuid, text, text, text, text);
drop table public.student_mailboxes;

delete from vault.secrets
where id in (
  select refresh_token_ref
  from microsoft_mailbox_secret_refs
);
