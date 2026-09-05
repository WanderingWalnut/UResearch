# C4 Container Diagram — UResearch

> Scope update, 2026-09-05: [ADR-0007](../../adr/0007-support-gmail-outreach-conversations.md) supersedes send-only, deferred reply-sync, and manual-reply-only statements in this earlier blueprint. Full Gmail outreach conversations are now planned for launch. This blueprint has not yet been revised for the sync implementation; use ADR-0007 and the new Gmail-conversations PRD for that work.

Major building blocks inside UResearch and how they communicate.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"background": "#f8fafc", "mainBkg": "#dbeafe", "primaryTextColor": "#0f172a", "lineColor": "#475569", "textColor": "#0f172a", "edgeLabelBackground": "#ffffff", "clusterBkg": "#ffffff", "clusterBorder": "#94a3b8", "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif"}} }%%
flowchart LR
  student["<b>Student</b><br/>Google-signed-in student"];

  subgraph uresearch["UResearch"]
    direction LR

    subgraph clients["User-facing"]
      direction TB
      web["<b>Web App</b><br/>Next.js on Vercel<br/>Discovery, campaigns, templates, Outreach Board"];
      pixel["<b>Open Tracking Endpoint</b><br/>Vercel route or Edge Function<br/>Records opened Message Events"];
    end

    subgraph app["Application"]
      direction TB
      api["<b>App Server Actions / Route Handlers</b><br/>Next.js server<br/>Auth checks, domain logic, enqueue jobs"];
      workers["<b>Background Workers</b><br/>Supabase Edge Functions<br/>Send, ingest, dispatch campaigns"];
    end

    subgraph platform["Supabase Platform"]
      direction TB
      auth["<b>Auth</b><br/>Supabase Auth<br/>Student sessions"];
      db[("<b>Database</b><br/>Supabase Postgres + pgvector<br/>Students, profiles, campaigns, threads, message_events")];
      queue["<b>Job Queue</b><br/>Supabase Queues<br/>Async send and sync work"];
      realtime["<b>Realtime</b><br/>Supabase Realtime<br/>Live campaign and board updates"];
    end
  end

  subgraph external["External Systems"]
    direction TB
    delivery["<b>Gmail API</b><br/>Send-only connected mailbox"];
    ucalgary_sources["<b>UCalgary Sources</b><br/>Profile ingestion inputs"];
  end

  student -->|"HTTPS"| web;
  web -->|"server calls"| api;
  web -->|"sign in"| auth;
  web -->|"subscribe"| realtime;
  api -->|"read/write"| db;
  api -->|"enqueue jobs"| queue;
  queue -->|"job batches"| workers;
  workers -->|"state + events"| db;
  workers -->|"send campaign messages"| delivery;
  workers -->|"fetch profiles"| ucalgary_sources;
  db -->|"row changes"| realtime;
  realtime -->|"live updates"| web;
  pixel -->|"opened events"| db;

  classDef personNode fill:#f8fafc,stroke:#94a3b8,color:#0f172a,stroke-width:1px;
  classDef appNode fill:#bfdbfe,stroke:#60a5fa,color:#0f172a,stroke-width:1px;
  classDef dataNode fill:#d1fae5,stroke:#34d399,color:#064e3b,stroke-width:1px;
  classDef externalNode fill:#e2e8f0,stroke:#94a3b8,color:#0f172a,stroke-width:1px;
  class student personNode;
  class web,pixel,api,workers appNode;
  class auth,db,queue,realtime dataNode;
  class delivery,ucalgary_sources externalNode;
  linkStyle default stroke:#475569,stroke-width:1.5px;
```

## Module to container mapping

| Module (from system design) | Primary container |
| --- | --- |
| Identity | Web + Auth + App server + `students` |
| Professor Discovery | Workers + `professors`, `professor_profiles`, pgvector |
| Campaigns | Web + App server + Workers + campaign tables |
| Delivery | Workers + Gmail API |
| Outreach Board | Web + Workers + thread tables |
| Workers | Supabase Edge Functions + Queue |

See [`diagrams/c4-component.md`](./diagrams/c4-component.md) for App Server module boundaries and proposed `src/modules/` layout.
