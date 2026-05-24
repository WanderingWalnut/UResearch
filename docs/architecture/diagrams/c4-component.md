# C4 Component Diagram — App Server & Workers

Lightweight blueprint for module boundaries inside the **App Server** and **Background Workers** containers. Zoom level below [`c4-container.md`](./c4-container.md). Update when code layout diverges.

## App Server (Next.js server)

Route handlers and server actions stay thin; domain logic lives in modules.

```mermaid
C4Component
  title Component Diagram — App Server (Next.js)

  Container(web, "Web App", "Next.js client", "Discovery, campaigns, templates, inbox UI")
  ContainerDb(db, "Database", "Supabase Postgres", "RLS-protected domain data")
  Container(queue, "Job Queue", "Supabase Queues", "Async work")
  Container(auth, "Auth", "Supabase Auth + Azure OAuth", "Sessions")
  System_Ext(graph, "Microsoft Graph", "Mail API")

  Container_Boundary(app, "App Server") {
    Component(identity, "IdentityModule", "TypeScript", "Sign-in callback, domain allowlist, Student + StudentMailbox, Vault token store, starter templates")
    Component(discovery, "DiscoveryModule", "TypeScript", "Hybrid search, Saved Professor CRUD")
    Component(campaigns, "CampaignModule", "TypeScript", "Templates, campaign draft/approve, personalization, enqueue sends")
    Component(inbox, "InboxModule", "TypeScript", "Outreach Thread list/detail, status chips, manual follow-up reminders")
    Component(mailbox, "MailboxModule", "TypeScript", "Graph client helpers, OAuth token refresh, webhook validation")
  }

  Rel(web, identity, "Sign in, session")
  Rel(web, discovery, "Search, save")
  Rel(web, campaigns, "Create, preview, approve")
  Rel(web, inbox, "Threads, replies")

  Rel(identity, auth, "OAuth session")
  Rel(identity, db, "students, student_mailboxes, message_templates")
  Rel(discovery, db, "professor_profiles, saved_professors")
  Rel(campaigns, db, "outreach_campaigns, campaign_messages")
  Rel(campaigns, discovery, "Read professor profiles")
  Rel(campaigns, queue, "Enqueue send jobs")
  Rel(inbox, db, "outreach_threads, thread_messages, message_events")
  Rel(inbox, campaigns, "Read campaign context")

  Rel(mailbox, graph, "Token-backed API calls")
  Rel(identity, mailbox, "Store refresh token ref")
```

## Background Workers (Supabase Edge Functions)

Workers import shared logic from the same modules where possible; queue consumers stay thin.

```mermaid
C4Component
  title Component Diagram — Background Workers

  Container(workers, "Worker runtime", "Supabase Edge Functions", "Queue consumers")
  Container(queue, "Job Queue", "Supabase Queues", "")
  ContainerDb(db, "Database", "Supabase Postgres", "Service role writes")
  System_Ext(graph, "Microsoft Graph", "")
  System_Ext(profiles, "profiles.ucalgary.ca", "Ingestion source")

  Container_Boundary(w, "Workers") {
    Component(send_worker, "CampaignSendWorker", "Edge Function", "Graph sendMail, update Campaign Message + Thread")
    Component(ingest_worker, "ProfileIngestWorker", "Edge Function", "Crawl UCalgary Profiles, embeddings, FTS index")
    Component(reply_worker, "ReplySyncWorker", "Edge Function", "Three-tier match, Thread Message + reply_detected")
    Component(renew_worker, "SubscriptionRenewWorker", "Edge Function", "Renew Graph inbox subscriptions")
    Component(dispatch_worker, "CampaignDispatchWorker", "Edge Function", "scheduled_for due → enqueue sends")
  }

  Rel(workers, queue, "Consume batches")
  Rel(send_worker, db, "campaign_messages, outreach_threads, message_events")
  Rel(send_worker, graph, "sendMail")
  Rel(ingest_worker, profiles, "Batch crawl")
  Rel(ingest_worker, db, "professors, professor_profiles")
  Rel(reply_worker, graph, "Fetch message")
  Rel(reply_worker, db, "thread_messages, message_events")
  Rel(renew_worker, graph, "PATCH subscription")
  Rel(dispatch_worker, db, "outreach_campaigns")
  Rel(dispatch_worker, queue, "Enqueue per message")
```

## Proposed repo layout

Blueprint only — create folders as each slice ships.

```text
src/
  app/                          # Next.js routes (thin)
    (auth)/
    api/webhooks/graph/         # Reply sync webhook → MailboxModule
    api/tracking/[token]/       # Open pixel (slice 5)
  modules/
    identity/                   # Slice 1
    discovery/                  # Slice 2
    campaigns/                  # Slice 3
    mailbox/                    # Slice 1 (token refresh); slice 3–4 (send/sync)
    inbox/                      # Slice 4
  workers/                      # Supabase Edge Function entrypoints
    campaign-send/
    profile-ingest/
    reply-sync/
    subscription-renew/
    campaign-dispatch/
supabase/
  migrations/                   # Just-in-time per slice
  functions/                    # Deploy targets → workers/
```

## Module rules

| Module | Aggregate roots | May call | Must not |
| --- | --- | --- | --- |
| **IdentityModule** | `students`, `student_mailboxes` | MailboxModule (token ops), Auth | Campaigns, Discovery queries |
| **DiscoveryModule** | `saved_professors` (student side); reads `professor_profiles` | — | Graph, queue |
| **CampaignModule** | `outreach_campaigns`, `campaign_messages`, `message_templates` | DiscoveryModule (read), queue | Direct Graph send (workers only) |
| **InboxModule** | `outreach_threads`, `thread_messages`, `follow_up_reminders` | CampaignModule (read context) | Graph |
| **MailboxModule** | — (integration) | Graph, Vault | Domain campaign/thread mutations |

**Workers** call into `mailbox/`, `campaigns/`, `discovery/` shared services — not duplicate Graph or SQL logic in function files.

## Slice mapping

| Slice | Modules / workers touched |
| --- | --- |
| 1 Auth + mailbox | `identity/`, `mailbox/`, `app/(auth)/` |
| 2 Discovery | `discovery/`, `workers/profile-ingest/` |
| 3 Campaign send | `campaigns/`, `workers/campaign-send/`, `workers/campaign-dispatch/` |
| 4 Inbox + reply sync | `inbox/`, `mailbox/`, `workers/reply-sync/`, `workers/subscription-renew/`, `app/api/webhooks/graph/` |
| 5 Open pixel | `app/api/tracking/`, `campaigns/` (event insert) |

## HTTP routes outside App Server modules

| Route | Container | Notes |
| --- | --- | --- |
| Open tracking pixel | Vercel route or Edge Function | Service role insert to `message_events`; no session |
| Graph webhook | App Server route | Validates handshake, enqueues `reply-sync` job |

## Out of scope at this level

- Code-level class diagrams
- Phase 2 agentic / iMessage interface (same modules later)
- Per-page React component breakdown (see Stitch designs)
