# C4 Component Diagram — App Server & Workers

Lightweight blueprint for module boundaries inside the **App Server** and **Background Workers** containers. Zoom level below [`c4-container.md`](./c4-container.md). Update when code layout diverges.

## App Server (Next.js server)

Route handlers and server actions stay thin; domain logic lives in modules.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"background": "#f8fafc", "mainBkg": "#dbeafe", "primaryTextColor": "#0f172a", "lineColor": "#475569", "textColor": "#0f172a", "edgeLabelBackground": "#ffffff", "clusterBkg": "#ffffff", "clusterBorder": "#94a3b8", "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif"}} }%%
flowchart LR
  web["<b>Web App</b><br/>Next.js client<br/>Discovery, campaigns, templates, inbox UI"]

  subgraph app["App Server"]
    direction TB
    identity["<b>IdentityModule</b><br/>TypeScript<br/>Sign-in callback, allowlist, mailbox, Vault token store"]
    discovery["<b>DiscoveryModule</b><br/>TypeScript<br/>Hybrid search, Saved Professor CRUD"]
    campaigns["<b>CampaignModule</b><br/>TypeScript<br/>Templates, drafts, personalization, enqueue sends"]
    inbox["<b>InboxModule</b><br/>TypeScript<br/>Thread list/detail, status chips, follow-up reminders"]
    mailbox["<b>MailboxModule</b><br/>TypeScript<br/>Graph helpers, token refresh, webhook validation"]
  end

  subgraph data["Data + Async"]
    direction TB
    db[("<b>Database</b><br/>Supabase Postgres<br/>RLS-protected domain data")]
    queue["<b>Job Queue</b><br/>Supabase Queues<br/>Async work"]
  end

  subgraph integrations["External Integrations"]
    direction TB
    auth["<b>Auth</b><br/>Supabase Auth + Azure OAuth<br/>Sessions"]
    ms_graph["<b>Microsoft Graph</b><br/>External system<br/>Mail API"]
  end

  web -->|"sign in"| identity
  web -->|"search / save"| discovery
  web -->|"create / approve"| campaigns
  web -->|"threads / replies"| inbox

  identity -->|"OAuth session"| auth
  identity -->|"student + mailbox rows"| db
  identity -->|"refresh-token ref"| mailbox
  discovery -->|"professor profiles"| db
  campaigns -->|"campaign rows"| db
  campaigns -->|"read profiles"| discovery
  campaigns -->|"send jobs"| queue
  inbox -->|"thread rows"| db
  inbox -->|"campaign context"| campaigns
  mailbox -->|"token-backed calls"| ms_graph

  classDef clientNode fill:#f8fafc,stroke:#94a3b8,color:#0f172a,stroke-width:1px
  classDef appNode fill:#bfdbfe,stroke:#60a5fa,color:#0f172a,stroke-width:1px
  classDef external fill:#e2e8f0,stroke:#94a3b8,color:#0f172a,stroke-width:1px
  classDef dataNode fill:#d1fae5,stroke:#34d399,color:#064e3b,stroke-width:1px
  class web clientNode
  class identity,discovery,campaigns,inbox,mailbox appNode
  class auth,ms_graph external
  class db,queue dataNode
  linkStyle default stroke:#475569,stroke-width:1.5px
```

## Background Workers (Supabase Edge Functions)

Workers import shared logic from the same modules where possible; queue consumers stay thin.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"background": "#f8fafc", "mainBkg": "#dbeafe", "primaryTextColor": "#0f172a", "lineColor": "#475569", "textColor": "#0f172a", "edgeLabelBackground": "#ffffff", "clusterBkg": "#ffffff", "clusterBorder": "#94a3b8", "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif"}} }%%
flowchart LR
  runtime["<b>Worker runtime</b><br/>Supabase Edge Functions<br/>Queue consumers"]
  queue["<b>Job Queue</b><br/>Supabase Queues"]

  subgraph workers["Workers"]
    direction TB
    dispatch_worker["<b>CampaignDispatchWorker</b><br/>Edge Function<br/>scheduled_for due -> enqueue sends"]
    send_worker["<b>CampaignSendWorker</b><br/>Edge Function<br/>Graph sendMail, update message + thread"]
    ingest_worker["<b>ProfileIngestWorker</b><br/>Edge Function<br/>Crawl profiles, embeddings, FTS index"]
    reply_worker["<b>ReplySyncWorker</b><br/>Edge Function<br/>Three-tier match, thread message + reply_detected"]
    renew_worker["<b>SubscriptionRenewWorker</b><br/>Edge Function<br/>Renew Graph inbox subscriptions"]
  end

  subgraph outputs["External APIs + Data"]
    direction TB
    ms_graph["<b>Microsoft Graph</b><br/>External system"]
    profiles["<b>profiles.ucalgary.ca</b><br/>External system<br/>Ingestion source"]
    db[("<b>Database</b><br/>Supabase Postgres<br/>Service role writes")]
  end

  runtime -->|"consume batches"| queue
  queue -->|"due campaigns"| dispatch_worker
  queue -->|"send jobs"| send_worker
  queue -->|"reply-sync jobs"| reply_worker
  queue -->|"renewal jobs"| renew_worker

  dispatch_worker -->|"enqueue messages"| queue
  dispatch_worker -->|"read campaigns"| db
  send_worker -->|"sendMail"| ms_graph
  send_worker -->|"message + thread rows"| db
  ingest_worker -->|"batch crawl"| profiles
  ingest_worker -->|"professor rows"| db
  reply_worker -->|"fetch message"| ms_graph
  reply_worker -->|"thread + event rows"| db
  renew_worker -->|"PATCH subscription"| ms_graph

  classDef runtimeNode fill:#f8fafc,stroke:#94a3b8,color:#0f172a,stroke-width:1px
  classDef workerNode fill:#bfdbfe,stroke:#60a5fa,color:#0f172a,stroke-width:1px
  classDef external fill:#e2e8f0,stroke:#94a3b8,color:#0f172a,stroke-width:1px
  classDef dataNode fill:#d1fae5,stroke:#34d399,color:#064e3b,stroke-width:1px
  class runtime runtimeNode
  class dispatch_worker,send_worker,ingest_worker,reply_worker,renew_worker workerNode
  class ms_graph,profiles external
  class queue,db dataNode
  linkStyle default stroke:#475569,stroke-width:1.5px
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
