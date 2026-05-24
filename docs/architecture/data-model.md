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
| Identity | `students` | `student_mailboxes` | Sign-in, domain validation, mailbox consent |
| Professor Discovery | `professors` | `professor_profiles`, `professor_source_keys` | Ingestion upsert per source key |
| Discovery (student) | `students` | `saved_professors` | Save/unsave professor |
| Campaigns | `outreach_campaigns` | `campaign_messages` | Draft edits; approval freezes snapshots |
| Inbox | `outreach_threads` | `thread_messages` | Reply sync, manual follow-up send |
| Templates | `message_templates` | — | Template CRUD owned by student |

Cross-aggregate rules:

- Campaign approval may create `campaign_messages` and enqueue sends; send completion creates or updates `outreach_threads`.
- `reply_detected` events update `outreach_threads.status` to `replied`.

## Entity reference

### `universities`

Launch configuration for a school.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `name` | e.g. University of Calgary |
| `slug` | e.g. `ucalgary` |
| `allowed_email_domains` | text[] — launch seed: `['ucalgary.ca']` |

### `students`

Domain actor; one row per Supabase Auth user.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `auth_user_id` | UUID UNIQUE — FK to `auth.users` |
| `university_id` | FK → `universities` |
| `email` | From Microsoft sign-in; must match allowlist |
| `display_name` | Optional |
| `created_at`, `updated_at` | |

**Rule:** Created or updated on first Microsoft sign-in after domain validation.

### `student_mailboxes`

Connected Microsoft 365 mailbox for send/reply.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `student_id` | FK → `students` UNIQUE at launch |
| `provider` | `microsoft` |
| `mailbox_address` | Send-as address |
| `consent_status` | `pending`, `connected`, `revoked` |
| `refresh_token_ref` | UUID — FK to `vault.secrets.id`; Microsoft refresh token stored in Supabase Vault |
| `graph_subscription_id` | Optional webhook subscription |
| `created_at`, `updated_at` | |

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
| `name` | |
| `subject` | Mustache placeholders — see system-design.md |
| `body` | HTML or markdown with Mustache placeholders |
| `created_at`, `updated_at` | |

**Launch placeholders:** `professor_name`, `professor_first_name`, `department`, `research_snippet`, `profile_url`, `student_name`. Missing values use documented fallbacks; raw `{{key}}` must not appear in approved snapshots.

**Starter templates:** Three system defaults copied to new students on first sign-in (General research inquiry, Referencing specific research, Short introduction).

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
| `approved_at` | timestamptz nullable |
| `created_at`, `updated_at` | |

### `campaign_messages`

One initial outbound email per professor in a campaign.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `campaign_id` | FK → `outreach_campaigns` |
| `professor_id` | FK → `professors` |
| `outreach_thread_id` | FK → `outreach_threads` nullable until sent |
| `status` | See message state machine |
| `recipient_email_snapshot` | Email used at send time |
| `subject_snapshot` | Rendered subject |
| `body_snapshot` | Rendered HTML body |
| `graph_message_id` | Set after Graph send |
| `graph_conversation_id` | For reply matching |
| `open_tracking_token` | Opaque pixel token |
| `created_at`, `updated_at` | |

**Unique:** `(campaign_id, professor_id)`

### `outreach_threads`

One conversation per student–professor pair.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `student_id` | FK → `students` |
| `professor_id` | FK → `professors` |
| `status` | `open`, `replied`, `closed` |
| `first_campaign_id` | FK → `outreach_campaigns` nullable |
| `last_activity_at` | |
| `created_at`, `updated_at` | |

**Unique:** `(student_id, professor_id)`

**Second campaign:** Additional **Campaign Messages** to the same **Professor** reuse this thread; `first_campaign_id` is unchanged. Message history spans campaigns via **Thread Message** `campaign_message_id` / `source`.

**Inbox sort:** `replied` threads first, then by `last_activity_at` desc. **Status chip:** one primary chip — Replied > Opened (latest campaign message) > No reply · 7d > none.

### `thread_messages`

Inbound and outbound messages in a thread.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `thread_id` | FK → `outreach_threads` |
| `direction` | `outbound`, `inbound` |
| `source` | `campaign`, `manual_reply`, `follow_up`, `graph_sync` |
| `campaign_message_id` | FK nullable — set when sourced from campaign send |
| `subject` | |
| `body` | |
| `graph_message_id` | |
| `sent_at` | |
| `created_at` | |

### `message_events`

Unified append-only event stream.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `entity_type` | `campaign_message`, `thread_message`, `outreach_thread` |
| `entity_id` | UUID |
| `event_type` | See event types below |
| `occurred_at` | timestamptz |
| `source` | `worker`, `pixel_endpoint`, `graph_sync`, `user` |
| `payload` | jsonb |

**Event types (launch):**

| Type | Entity | Meaning |
| --- | --- | --- |
| `queued` | campaign_message | Approved and waiting for worker |
| `sending` | campaign_message | Worker claimed send |
| `sent` | campaign_message | Graph send accepted |
| `failed` | campaign_message | Send or sync error |
| `retried` | campaign_message | Retry scheduled |
| `opened` | campaign_message | Pixel requested |
| `reply_detected` | outreach_thread | Inbound reply matched |
| `follow_up_sent` | thread_message | Manual follow-up dispatched |
| `thread_created` | outreach_thread | First outbound established |

Dedupe `opened` events per message within a short window to reduce preview-pane noise.

### `follow_up_reminders` (launch: manual only)

Optional nudge records; no automated send at launch.

| Column | Notes |
| --- | --- |
| `id` | UUID PK |
| `thread_id` | FK → `outreach_threads` |
| `student_id` | FK → `students` |
| `status` | `pending`, `dismissed`, `completed` |
| `created_at` | |

## State machines

### Outreach Campaign

```text
draft → approved → sending → completed
  │        │
  └────────┴── cancelled
```

| Status | Meaning |
| --- | --- |
| `draft` | Name, professors, previews editable |
| `approved` | Snapshots frozen; waiting for `scheduled_for` or immediate dispatch |
| `sending` | At least one **Campaign Message** not terminal |
| `completed` | All messages terminal (`sent` or `failed`) |
| `cancelled` | Student cancelled before all sends finished |

Derived from child **Campaign Message** statuses for dashboard views.

### Campaign Message

```text
draft → queued → sending → sent
                    └──→ failed
```

`replied` is tracked on **Outreach Thread**, not duplicated as a terminal campaign message status.

### Outreach Thread

```text
open → replied
  └──→ closed
```

Do not prompt **Follow-ups** when status is `replied`.

## Scheduling model

Campaign scheduling is **UResearch-owned**, not Outlook deferred send:

1. Approval stores `scheduled_for` (nullable).
2. Dispatch worker selects campaigns where `approved_at` is set and `scheduled_for <= now()`.
3. Worker calls Graph `sendMail` immediately at dispatch time.

## Open tracking

When `open_tracking_enabled` is true, `body_snapshot` includes:

```html
<img src="https://uresearch.app/t/o/{open_tracking_token}" width="1" height="1" alt="" />
```

Pixel endpoint writes `message_events` row with `event_type = 'opened'`. UI shows **Opened** from this event stream. Outlook may block or prefetch images; dedupe and expect gaps.

## Row Level Security (sketch)

- **Student-owned rows:** `students`, `saved_professors`, `message_templates`, `outreach_campaigns`, `campaign_messages`, `outreach_threads`, `thread_messages`, `follow_up_reminders` — policy via `student_id` matching `auth.uid()` → `students.auth_user_id`.
- **Professor directory:** read-only for authenticated students where `professor.university_id = student.university_id`.
- **Ingestion tables:** service role only for workers.
- **message_events:** readable when parent entity belongs to student; pixel endpoint uses service role insert.

Module boundaries and folder layout: [`diagrams/c4-component.md`](./diagrams/c4-component.md).
