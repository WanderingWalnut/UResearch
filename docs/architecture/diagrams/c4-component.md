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
    identity["<b>IdentityModule</b><br/>TypeScript<br/>Verified sign-in, allowlist, Student profile"]
    discovery["<b>DiscoveryModule</b><br/>TypeScript<br/>Hybrid search, Saved Professor CRUD"]
    campaigns["<b>CampaignModule</b><br/>TypeScript<br/>Templates, drafts, personalization, enqueue sends"]
    inbox["<b>InboxModule</b><br/>TypeScript<br/>Thread list/detail, status chips, follow-up reminders"]
    delivery["<b>DeliveryModule</b><br/>TypeScript<br/>Provider integration TBD"]
  end

  subgraph data["Data + Async"]
    direction TB
    db[("<b>Database</b><br/>Supabase Postgres<br/>RLS-protected domain data")]
    queue["<b>Job Queue</b><br/>Supabase Queues<br/>Async work"]
  end

  subgraph integrations["External Integrations"]
    direction TB
    auth["<b>Auth</b><br/>Supabase Auth<br/>Sessions"]
    mail_provider["<b>Email delivery integration TBD</b><br/>External system"]
  end

  web -->|"sign in"| identity
  web -->|"search / save"| discovery
  web -->|"create / approve"| campaigns
  web -->|"threads / replies"| inbox

  identity -->|"session"| auth
  identity -->|"student row"| db
  discovery -->|"professor profiles"| db
  campaigns -->|"campaign rows"| db
  campaigns -->|"read profiles"| discovery
  campaigns -->|"send jobs"| queue
  inbox -->|"thread rows"| db
  inbox -->|"campaign context"| campaigns
  delivery -->|"provider calls"| mail_provider

  classDef clientNode fill:#f8fafc,stroke:#94a3b8,color:#0f172a,stroke-width:1px
  classDef appNode fill:#bfdbfe,stroke:#60a5fa,color:#0f172a,stroke-width:1px
  classDef external fill:#e2e8f0,stroke:#94a3b8,color:#0f172a,stroke-width:1px
  classDef dataNode fill:#d1fae5,stroke:#34d399,color:#064e3b,stroke-width:1px
  class web clientNode
  class identity,discovery,campaigns,inbox,delivery appNode
  class auth,mail_provider external
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
    send_worker["<b>CampaignSendWorker</b><br/>Edge Function<br/>Provider send, update message + thread"]
    ingest_worker["<b>ProfileIngestWorker</b><br/>Edge Function<br/>Crawl profiles, embeddings, FTS index"]
    reply_worker["<b>ReplySyncWorker</b><br/>Edge Function<br/>Provider match, thread message + reply_detected"]
  end

  subgraph outputs["External APIs + Data"]
    direction TB
    mail_provider["<b>Email delivery integration TBD</b><br/>External system"]
    profiles["<b>profiles.ucalgary.ca</b><br/>External system<br/>Ingestion source"]
    db[("<b>Database</b><br/>Supabase Postgres<br/>Service role writes")]
  end

  runtime -->|"consume batches"| queue
  queue -->|"due campaigns"| dispatch_worker
  queue -->|"send jobs"| send_worker
  queue -->|"reply-sync jobs"| reply_worker

  dispatch_worker -->|"enqueue messages"| queue
  dispatch_worker -->|"read campaigns"| db
  send_worker -->|"send"| mail_provider
  send_worker -->|"message + thread rows"| db
  ingest_worker -->|"batch crawl"| profiles
  ingest_worker -->|"professor rows"| db
  reply_worker -->|"fetch supported replies"| mail_provider
  reply_worker -->|"thread + event rows"| db

  classDef runtimeNode fill:#f8fafc,stroke:#94a3b8,color:#0f172a,stroke-width:1px
  classDef workerNode fill:#bfdbfe,stroke:#60a5fa,color:#0f172a,stroke-width:1px
  classDef external fill:#e2e8f0,stroke:#94a3b8,color:#0f172a,stroke-width:1px
  classDef dataNode fill:#d1fae5,stroke:#34d399,color:#064e3b,stroke-width:1px
  class runtime runtimeNode
  class dispatch_worker,send_worker,ingest_worker,reply_worker workerNode
  class mail_provider,profiles external
  class queue,db dataNode
  linkStyle default stroke:#475569,stroke-width:1.5px
```

## Proposed repo layout

Blueprint only — create folders as each slice ships.

```text
src/
  app/                          # Next.js routes (thin)
    (auth)/
    api/webhooks/mail/          # Reply sync webhook if selected integration supports it
    api/tracking/[token]/       # Open pixel (slice 5)
  modules/
    identity/                   # Slice 1
    discovery/                  # Slice 2
    campaigns/                  # Slice 3
    delivery/                   # Slice 3–4 after provider selection
    inbox/                      # Slice 4
  workers/                      # Supabase Edge Function entrypoints
    campaign-send/
    profile-ingest/
    reply-sync/
    campaign-dispatch/
supabase/
  migrations/                   # Just-in-time per slice
  functions/                    # Deploy targets → workers/
```

## Module rules

| Module | Aggregate roots | May call | Must not |
| --- | --- | --- | --- |
| **IdentityModule** | `students` | Auth | Campaigns, Discovery queries |
| **DiscoveryModule** | `saved_professors` (student side); reads `professor_profiles` | — | Delivery provider, queue |
| **CampaignModule** | `outreach_campaigns`, `campaign_messages`, `message_templates` | DiscoveryModule (read), queue | Direct provider send (workers only) |
| **InboxModule** | `outreach_threads`, `thread_messages`, `follow_up_reminders` | CampaignModule (read context) | Delivery provider |
| **DeliveryModule** | — (integration) | Selected provider | Domain campaign/thread mutations |

**Workers** call into `delivery/`, `campaigns/`, `discovery/` shared services rather than duplicating provider or SQL logic in function files.

## Slice mapping

| Slice | Modules / workers touched |
| --- | --- |
| 1 Student foundation | `identity/`, `app/(auth)/` after replacement PRD |
| 2 Discovery | `discovery/`, `workers/profile-ingest/` |
| 3 Campaign send | `campaigns/`, `workers/campaign-send/`, `workers/campaign-dispatch/` |
| 4 Inbox + reply sync | `inbox/`, `delivery/`, `workers/reply-sync/`, `app/api/webhooks/mail/` if supported |
| 5 Open pixel | `app/api/tracking/`, `campaigns/` (event insert) |

## HTTP routes outside App Server modules

| Route | Container | Notes |
| --- | --- | --- |
| Open tracking pixel | Vercel route or Edge Function | Service role insert to `message_events`; no session |
| Delivery-provider webhook | App Server route | Added only if selected integration supports reply events |

## Out of scope at this level

- Code-level class diagrams
- Phase 2 agentic / iMessage interface (same modules later)
- Per-page React component breakdown (see Stitch designs)
