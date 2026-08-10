# UResearch Data Model

Canonical domain language lives in [`CONTEXT.md`](../../CONTEXT.md). This document turns the grilled launch decisions into entities, relationships, aggregates, and state machines.

Related docs:

- [`system-design.md`](./system-design.md) — modules, flows, stack
- [`diagrams/`](./diagrams/) — C4 context, container, component

## Design principles

- **Stable professor identity** — UResearch assigns `professors.id`; ingestion dedupes via `professor_source_keys`.
- **Campaign vs conversation** — **Campaign Messages** are initial bulk sends; **Thread Messages** are replies and follow-ups.
- **One thread per pair** — at most one **Outreach Thread** per **Student** and **Professor**.
- **Unified event stream** — all lifecycle, engagement, and sync history goes through `message_events`.
- **Postgres is source of truth** — current status columns are derived caches; events explain history.

## Bounded contexts and aggregates

| Context | Aggregate root | Child entities | Transaction boundary |
| --- | --- | --- | --- |
| Identity | `students` | — | Google sign-in and Student profile creation |
| Professor Discovery | `professors` | `professor_profiles`, `professor_source_keys` | Ingestion upsert per source key |
| Discovery (student) | `students` | `saved_professors` | Save/unsave professor |
| Campaigns | `outreach_campaigns` | `campaign_messages` | Draft edits; approval freezes recipient and message snapshots |
| Outreach Board | `outreach_threads` | `thread_messages` | Reply tracking, student-approved follow-up send |
| Templates | `message_templates` | — | Template CRUD owned by student |

Cross-aggregate rules:

- Campaign approval may create `campaign_messages` and enqueue sends; send completion creates or updates `outreach_threads`.
- At launch, a student-created reply event updates `outreach_threads.status` to `replied`; automated `reply_detected` events are future-only.

## Entity reference

### `universities`

Professor discovery catalog configuration.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `name` | e.g. University of Calgary |
| `slug` | e.g. `ucalgary` |
| `allowed_email_domains` | text[] nullable — optional future eligibility policy; not required for Google sign-in launch |

### `students`

Domain actor; one row per Supabase Auth user.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `auth_user_id` | UUID UNIQUE — FK to `auth.users` |
| `google_subject` | Stable Google account subject for the sign-in identity |
| `university_id` | FK → `universities` — Student-selected discovery catalog; launch default is UCalgary |
| `email` | From Google sign-in; does not need to match the University domain at launch |
| `display_name` | Optional |
| `program` | Optional reusable Student profile value for templates |
| `year_of_study` | Optional reusable Student profile value for templates |
| `signature` | Optional plain-text email signature; defaults to display name |
| `created_at`, `updated_at` | |

**Rule:** Created or updated after Google sign-in. UCalgary email-domain verification is not a launch requirement; the Student self-selects the launch University catalog. Full outreach setup is incomplete until the Student grants Gmail send permission and UResearch creates a connected `mailbox_connections` row.

### `mailbox_connections`

OAuth connection that lets UResearch send approved outreach from a Student's mailbox. Launch creates this connection during onboarding using Google Gmail send-only; mailbox reading is deferred.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `student_id` | FK → `students` |
| `provider` | `google` at launch; Microsoft can be added later if tenant consent is available |
| `provider_account_id` | Stable Google subject for the Gmail grant; must match `students.google_subject` at launch |
| `mailbox_address` | Connected Gmail address |
| `send_scope_granted` | boolean; true when Gmail send permission is present |
| `read_scope_granted` | boolean default `false`; must remain false at launch |
| `refresh_token_ref` | Reference to encrypted token storage, not browser-readable |
| `status` | `connected`, `revoked`, `reauth_required` |
| `created_at`, `updated_at` | |

**Unique:** `(student_id, provider)` at launch. Secondary Gmail senders are not supported until account-linking rules are explicitly designed.

**Rule:** Launch requests the narrow Gmail send scope during the create/sign-up onboarding flow. The Gmail grant must belong to the same Google account used for sign-in, verified by matching Google's stable subject identifier, not only the email address. Do not request Gmail read/modify scopes or store inbound mailbox content until the product intentionally takes on Google's restricted-scope review and security requirements.

**Send access gate:** A Student can approve campaigns, dispatch Campaign Messages, or send Follow-ups only when they have a `mailbox_connections` row with `provider = 'google'`, `provider_account_id = students.google_subject`, `status = 'connected'`, and `send_scope_granted = true`. Missing, mismatched, revoked, or `reauth_required` connections put the Student in limited access: discovery, saved professors, templates, and campaign drafts remain available, but send-gated actions must show a reconnect prompt.

### `professors`

Stable identity within a university.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `university_id` | FK → `universities` |
| `created_at` | |

### `professor_source_keys`

Ingestion dedupe keys.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `professor_id` | FK → `professors` |
| `university_id` | FK → `universities` |
| `source_type` | e.g. `ucalgary_profiles` |
| `source_id` | Profile slug from profiles.ucalgary.ca URL path |

**Unique:** `(university_id, source_type, source_id)`

### `professor_profiles`

Current searchable view of a professor.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `professor_id` | FK → `professors` UNIQUE |
| `display_name` | Required for search indexing |
| `department` | Optional; show fallback in UI if missing |
| `email` | Optional for search; required before **Campaign Message** send |
| `profile_url` | Canonical profiles.ucalgary.ca URL |
| `research_text` | Required for search indexing; min ~50 chars |
| `embedding` | vector(1536) — pgvector; `text-embedding-3-small`; cosine HNSW index |
| `search_vector` | tsvector — GIN index on `display_name`, `department`, `research_text` |
| `updated_at` | |

**Soft rule:** at most one profile per `(university_id, email)` where email is present.

**Searchability gate:** Profile appears in discovery when `display_name` and `research_text` (≥ ~50 chars) are present. Email not required for search or **Saved Professor**; required to add to **Outreach Campaign** or send.

**Hybrid search:** Discovery runs semantic (pgvector) + keyword (FTS on `search_vector`) legs in parallel, filtered by `university_id`, merged with RRF. Embedding input at ingest: `{display_name}\nDepartment: {department or "Unknown"}\n{research_text}`.

### `professor_contact_reports`

Student-reported review signal for possible bad professor contact data.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `professor_id` | FK → `professors` |
| `student_id` | FK → `students` |
| `outreach_thread_id` | FK → `outreach_threads` nullable |
| `campaign_message_id` | FK → `campaign_messages` nullable |
| `thread_message_id` | FK → `thread_messages` nullable |
| `report_type` | `bounced`, `bad_email` |
| `email_snapshot` | Professor email observed when the sent message was approved |
| `notes` | Optional student note |
| `status` | `open`, `reviewed`, `dismissed`, `resolved` |
| `reported_at`, `reviewed_at` | |

**Rule:** A Contact Issue Report does not automatically remove or change `professor_profiles.email`. It flags the contact data for review and can inform future ingestion/admin workflows.

### `saved_professors`

Student shortlist; independent of campaigns.

| Column | Notes |
| --- | --- |
| `student_id` | FK → `students` |
| `professor_id` | FK → `professors` |
| `notes` | Optional |
| `saved_at` | |

**Primary key:** `(student_id, professor_id)`

### `message_templates`

Reusable student-owned templates.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `student_id` | FK → `students` |
| `kind` | `campaign` or `follow_up` |
| `name` | |
| `subject` | Plain text with supported Template Variables |
| `body` | Plain text with supported Template Variables; no stored author HTML or markdown |
| `created_at`, `updated_at` | |

**Campaign variables:** `professor_name`, `professor_first_name`, `professor_last_name`, `department`, `research_snippet`, `profile_url`, `student_name`, `student_university`, `student_program`, `student_year`, `student_signature`. Missing values use documented fallbacks or produce a preview warning; raw `{{key}}` must not appear in approved snapshots.

**Follow-up placeholders:** campaign placeholders plus `original_subject`, `days_since_last_outbound`, and `last_outbound_date`. Follow-up drafts are generated programmatically from these templates and context; no AI generation is used at launch.

**Starter templates:** Three campaign defaults copied to new students on first sign-in (General research inquiry, Referencing specific research, Short introduction) plus one follow-up default.

**Editor rule:** A searchable Variables control and typing `{{` open the same picker. The UI renders the selection as an inline token and inserts its canonical Mustache key into the stored subject/body. Students compose ordinary text; there is no rich-text toolbar or arbitrary HTML input.

### `outreach_campaigns`

Named batch outreach; no separate Audience entity.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `student_id` | FK → `students` |
| `name` | e.g. Fall 2026 CS Dept Outreach |
| `message_template_id` | FK → `message_templates` nullable |
| `template_snapshot` | jsonb — frozen at approval |
| `status` | See campaign state machine |
| `open_tracking_enabled` | boolean default `true` |
| `scheduled_for` | timestamptz nullable — null = send when approved |
| `send_pace_snapshot` | jsonb — interval and cap policy used to compute message `send_after` values at approval |
| `projected_first_send_at` | Nullable preview timestamp at approval |
| `projected_last_send_at` | Nullable preview timestamp at approval |
| `approved_at` | timestamptz nullable |
| `paused_at` | timestamptz nullable — set when Gmail access loss pauses remaining sends |
| `pause_reason` | nullable — launch value `gmail_reconnect_required` |
| `created_at`, `updated_at` | |

### `campaign_messages`

One initial outbound email per professor in a campaign.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `campaign_id` | FK → `outreach_campaigns` |
| `professor_id` | FK → `professors` |
| `outreach_thread_id` | FK → `outreach_threads` nullable until sent |
| `prior_outreach_thread_id` | FK → `outreach_threads` nullable; set at approval when this Professor was already contacted |
| `prior_outreach_confirmed_at` | Required when `prior_outreach_thread_id` is set |
| `status` | See message state machine |
| `recipient_email_snapshot` | Professor email frozen at campaign approval |
| `subject_snapshot` | Rendered subject |
| `text_body_snapshot` | Rendered plain-text body |
| `html_body_snapshot` | Minimal escaped HTML alternative frozen when queued; includes exactly one tracking pixel when enabled |
| `subject_override` | Nullable resolved-text customization for this Professor while the campaign is a draft |
| `text_body_override` | Nullable resolved-text customization for this Professor while the campaign is a draft |
| `customized_at` | Nullable; marks an individual Message Customization |
| `customized_from_template_updated_at` | Template timestamp used when the customization began |
| `customization_reviewed_at` | Required after a later template edit before approval; null means Needs review |
| `variable_warnings` | jsonb — missing Professor values and fallbacks shown during review |
| `variable_warnings_confirmed_at` | Required at approval when warnings are present |
| `mailbox_connection_id` | FK → `mailbox_connections`; connection used to send |
| `provider_message_id` | Set after Gmail send when available |
| `provider_conversation_id` | For future reply matching when available |
| `open_tracking_token` | Opaque pixel token |
| `send_after` | Earliest time this message is eligible for worker dispatch |
| `attempt_count` | Number of send attempts |
| `last_attempt_at` | Last worker attempt timestamp |
| `next_retry_at` | Nullable retry eligibility timestamp after transient failure |
| `failed_at` | Nullable terminal failure timestamp after retry ceiling or non-retryable provider error |
| `cancelled_at` | Nullable — set when Campaign Cancellation stops a queued message |
| `last_error` | Sanitized provider or worker error summary |
| `created_at`, `updated_at` | |

**Unique:** `(campaign_id, professor_id)`

**Draft and customization rule:** Selecting a Professor creates or retains a `draft` Campaign Message. Preview resolves the template for that Professor. A Message Customization edits token-free final text, stores resolved subject/body overrides on that draft row, and does not mutate the Message Template or sibling Campaign Messages. If `message_templates.updated_at` becomes newer than `customized_from_template_updated_at`, preserve the overrides, clear `customization_reviewed_at`, and block approval until the Student reviews them. **Reset to template** clears the overrides and customization metadata for only that message. Approval renders the default or reviewed customized result into immutable snapshots.

**Variable validation rule:** A used Student-sourced variable with no value blocks campaign approval. Missing Professor-sourced values populate `variable_warnings`, render documented fallbacks, and require `variable_warnings_confirmed_at` before that Campaign Message can be queued.

**Prior outreach rule:** If an existing `outreach_threads` row exists for `(student_id, professor_id)` at approval time, the approval UI must show a Prior Outreach Warning and require explicit confirmation for that professor before queueing the Campaign Message. The message stores `prior_outreach_thread_id` and `prior_outreach_confirmed_at`; send workers must not dispatch a repeat-outreach message without that confirmation.

**Dispatch rule:** Campaign approval atomically freezes and queues all draft Campaign Messages; delivery remains asynchronous. `send_after` is derived from campaign `scheduled_for` plus the selected send pace. Launch defaults to one outbound message every three minutes and a configurable cap of 200 total Campaign Messages and Follow-ups per Student per rolling 24 hours. Student-approved Follow-ups receive the next available slot, so later Campaign Message estimates may move. Workers may only claim messages where `status = 'queued'`, the parent campaign is not paused, `send_after <= now()`, and either `next_retry_at is null` or `next_retry_at <= now()`.

**Cancellation rule:** A Student may cancel an approved or sending campaign. In one transaction, UResearch changes every still-queued Campaign Message to `cancelled` and records `cancelled_at`. A message already in `sending` may complete; `sent` and `failed` messages remain unchanged. Campaign summaries expose the partial outcome counts.

**Failure rule:** Failed Campaign Messages remain campaign-level recovery items. They do not create or attach to `outreach_threads`, do not create `thread_messages`, and do not appear on the Outreach Board until a retry succeeds and the message reaches `sent`.

### `outreach_threads`

One conversation per student–professor pair.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `student_id` | FK → `students` |
| `professor_id` | FK → `professors` |
| `status` | `open`, `replied`, `closed` |
| `replied_at` | Nullable; set when the Student marks a professor reply |
| `closed_at` | Nullable; set when the Student closes the thread |
| `closed_reason` | Nullable; `bounced`, `bad_email`, `not_relevant`, `other` |
| `first_campaign_id` | FK → `outreach_campaigns` nullable |
| `last_activity_at` | |
| `created_at`, `updated_at` | |

**Unique:** `(student_id, professor_id)`

**Second campaign:** Additional **Campaign Messages** to the same **Professor** require prior-outreach confirmation and reuse this thread; `first_campaign_id` is unchanged. A successful new send changes `replied` back to `open`, clears the current `replied_at`, and leaves previous reply events in history. Threads closed for `bounced` or `bad_email` cannot be reopened until the Contact Issue Report is resolved; other closed threads require explicit reopening.

**Board lanes:** `sent`, `opened`, `replied`. Queued, sending, and failed are operational outbound-message states, not normal board lanes. Failed campaign sends stay in campaign detail as Send Issues; failed follow-ups stay in thread detail as Send Issues. A missing **Opened Event** is not an error; the card remains in `sent` unless the Student marks it `replied`.

**Bounce rule:** UResearch treats provider acceptance as `sent`. Later mailbox bounces are not detected at launch. If the Student sees a bounce in Gmail, they can close the Outreach Thread with `closed_reason = 'bounced'` or `bad_email`; UResearch appends a `bounce_marked` Message Event and creates a `professor_contact_reports` row.

**Board sort:** within each lane, sort by `last_activity_at` desc. **Status chip:** one primary chip — Replied > Opened (latest campaign message) > Sent.

### `thread_messages`

Inbound and outbound messages in a thread.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `thread_id` | FK → `outreach_threads` |
| `direction` | `outbound`, `inbound` |
| `source` | `campaign`, `manual_reply`, `follow_up`, `provider_sync` |
| `status` | `queued`, `sending`, `sent`, `failed` for outbound worker-sent rows; nullable for future inbound sync rows |
| `campaign_message_id` | FK nullable — set when sourced from campaign send |
| `subject` | |
| `body_text` | Rendered plain-text body |
| `body_html` | Minimal escaped HTML alternative with equivalent text/line breaks and optional tracking pixel |
| `mailbox_connection_id` | FK → `mailbox_connections` nullable; set for outbound Gmail sends |
| `provider_message_id` | |
| `provider_conversation_id` | For future reply matching when available |
| `send_after` | Earliest time this outbound message is eligible for worker dispatch |
| `attempt_count` | Number of send attempts |
| `last_attempt_at` | Last worker attempt timestamp |
| `next_retry_at` | Nullable retry eligibility timestamp after transient failure |
| `failed_at` | Nullable terminal failure timestamp after retry ceiling or non-retryable provider error |
| `last_error` | Sanitized provider or worker error summary |
| `sent_at` | |
| `created_at` | |

**Follow-up rule:** Follow-up Thread Messages are created only after the Student approves the programmatically generated Follow-up Draft. Approval creates an outbound `thread_messages` row with `source = 'follow_up'`, `status = 'queued'`, and `send_after = now()`. Follow-ups consume the same per-Student pace and rolling 24-hour limit as Campaign Messages, but take the next available slot ahead of queued bulk campaign work. The same async Gmail send worker applies send access/rate/retry/reconnect checks and sets `sent_at` after provider acceptance. Launch does not create a `follow_up_drafts` table, autosave unsent edits, create Gmail mailbox drafts, or use AI to generate follow-up copy.

**Follow-up failure rule:** Failed follow-up Thread Messages remain thread-level recovery items. They stay visible as Send Issues on the Outreach Thread detail and do not change the board lane.

### `message_events`

Unified append-only event stream.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `entity_type` | `campaign_message`, `thread_message`, `outreach_thread` |
| `entity_id` | UUID |
| `event_type` | See event types below |
| `occurred_at` | timestamptz |
| `source` | `worker`, `pixel_endpoint`, `provider_sync`, `user` |
| `payload` | jsonb |

**Event types (launch):**

| Type | Entity | Meaning |
| --- | --- | --- |
| `queued` | campaign_message, thread_message | Approved and waiting for worker |
| `sending` | campaign_message, thread_message | Worker claimed send |
| `sent` | campaign_message, thread_message | Delivery provider accepted send |
| `failed` | campaign_message, thread_message | Send or sync error |
| `retried` | campaign_message, thread_message | Retry scheduled |
| `cancelled` | campaign_message | Student cancelled the queued campaign send |
| `opened` | campaign_message | Pixel requested |
| `reply_marked` | outreach_thread | Student marked the thread as replied |
| `bounce_marked` | outreach_thread | Student marked a later mailbox bounce |
| `contact_issue_reported` | outreach_thread | Professor contact data flagged for review |
| `reply_detected` | outreach_thread | Future automated inbound reply match |
| `follow_up_sent` | thread_message | Student-approved follow-up dispatched |
| `thread_created` | outreach_thread | First outbound established |

For launch, each Campaign Message has at most one `opened` event. Enforce this under concurrent pixel requests with a partial unique index:

```sql
create unique index message_events_one_open_per_campaign_message
on message_events (entity_id)
where entity_type = 'campaign_message'
  and event_type = 'opened';
```

The pixel endpoint uses `insert ... on conflict do nothing`; it does not select before inserting. The retained event records the first accepted pixel request. Later proxy, prefetch, and repeat requests still receive the pixel but do not add events.

### `follow_up_reminders` (launch: student-approved only)

Optional nudge records shown as card badges or board filters; no automated send at launch. They do not create board lanes.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `thread_id` | FK → `outreach_threads` |
| `student_id` | FK → `students` |
| `due_at` | Defaults to latest outbound message sent time + 7 days |
| `status` | `pending`, `dismissed`, `completed` |
| `created_at` | |

**Rule:** A reminder is due only while the thread is neither `replied` nor `closed`; sending a student-approved **Follow-up** marks the active reminder `completed`, and the Student may dismiss it without sending.

## State machines

### Outreach Campaign

```text
draft → approved → sending → completed
  │        │         │
  └────────┴─────────┴──→ cancelled
```

| Status | Meaning |
| --- | --- |
| `draft` | Name, professors, previews editable |
| `approved` | Snapshots frozen; waiting for `scheduled_for` or immediate dispatch; may be paused for Gmail reconnection |
| `sending` | At least one **Campaign Message** not terminal |
| `completed` | All messages terminal (`sent` or `failed`) |
| `cancelled` | Student stopped all still-queued sends; sent or in-flight messages may remain |

Derived from child **Campaign Message** statuses for dashboard views.

### Campaign Message

```text
draft → queued → sending → sent
          │          └──→ failed
          └─────────────→ cancelled
```

`replied` is tracked on **Outreach Thread**, not duplicated as a terminal campaign message status.

### Outreach Thread

```text
open → replied
 ↑       │
 ├───────┘  (new confirmed outreach)
 └──→ closed
```

Do not prompt **Follow-ups** when status is `replied`. At launch, `replied` is student-maintained and describes the latest outreach cycle. A confirmed later Campaign Message reopens the thread while prior reply events remain in history. Follow-up due is derived as a card badge or filter on `sent` and `opened` cards, not as a separate lane.

## Scheduling model

Campaign scheduling is **UResearch-owned**, not mailbox-provider deferred send:

1. Approval stores `scheduled_for` (nullable).
2. Dispatch worker selects campaigns where `approved_at` is set and `scheduled_for <= now()`.
3. Worker invokes Gmail send through the selected `mailbox_connections` row immediately at dispatch time.

## Open tracking

When campaign approval creates a queued Campaign Message and `open_tracking_enabled` is true, UResearch generates its opaque `open_tracking_token` and appends exactly one pixel to `html_body_snapshot`:

```html
<img src="https://uresearch.app/t/o/{open_tracking_token}" width="1" height="1" alt="" />
```

Every outbound message is sent as MIME `multipart/alternative` with an ordinary `text/plain` part and a minimal, visually unstyled `text/html` part. The worker sends the immutable snapshots without adding or changing pixels. UResearch previews and message-history views render `text_body_snapshot`; they never render `html_body_snapshot` or request its pixel. The HTML exists for email-client compatibility and optional tracking, not for rich presentation.

The pixel endpoint atomically attempts to write the Campaign Message's single `opened` event and returns the valid pixel whether the insert succeeds, conflicts, or fails. UI shows **Opened** from this event stream. Final campaign review includes a visible per-campaign opt-out, and the privacy policy describes the tracking mechanism. Email clients may block, prefetch, or proxy images, so UResearch expects both missing and non-human signals and never claims confirmed reading. Tracking data is deleted with the Student account.

## Row Level Security (sketch)

- **Student-owned rows:** `students`, `mailbox_connections`, `saved_professors`, `message_templates`, `outreach_campaigns`, `campaign_messages`, `outreach_threads`, `thread_messages`, `follow_up_reminders`, `professor_contact_reports` — policy via `student_id` matching `auth.uid()` → `students.auth_user_id`.
- **Professor directory:** read-only for authenticated students where `professor.university_id = student.university_id`.
- **Ingestion tables:** service role only for workers.
- **message_events:** readable when parent entity belongs to student; pixel endpoint uses service role insert.

Module boundaries and folder layout: [`diagrams/c4-component.md`](./diagrams/c4-component.md).
