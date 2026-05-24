# C4 Container Diagram — UResearch

Major building blocks inside UResearch and how they communicate.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"background": "#f8fafc", "mainBkg": "#dbeafe", "primaryTextColor": "#0f172a", "lineColor": "#475569", "textColor": "#0f172a", "edgeLabelBackground": "#ffffff", "clusterBkg": "#ffffff", "clusterBorder": "#94a3b8", "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif"}} }%%
flowchart LR
  student["<b>Student</b><br/>UCalgary student"];

  subgraph uresearch["UResearch"]
    direction LR

    subgraph clients["User-facing"]
      direction TB
      web["<b>Web App</b><br/>Next.js on Vercel<br/>Discovery, campaigns, templates, inbox UI"];
      pixel["<b>Open Tracking Endpoint</b><br/>Vercel route or Edge Function<br/>Records opened Message Events"];
    end

    subgraph app["Application"]
      direction TB
      api["<b>App Server Actions / Route Handlers</b><br/>Next.js server<br/>Auth checks, domain logic, enqueue jobs"];
      workers["<b>Background Workers</b><br/>Supabase Edge Functions<br/>Send, ingest, reply sync, dispatch campaigns"];
    end

    subgraph platform["Supabase Platform"]
      direction TB
      auth["<b>Auth</b><br/>Supabase Auth + Azure OAuth<br/>Student sessions"];
      db[("<b>Database</b><br/>Supabase Postgres + pgvector<br/>Students, profiles, campaigns, threads, message_events")];
      queue["<b>Job Queue</b><br/>Supabase Queues<br/>Async send and sync work"];
      realtime["<b>Realtime</b><br/>Supabase Realtime<br/>Live campaign and inbox updates"];
    end
  end

  subgraph external["External Systems"]
    direction TB
    ms_graph["<b>Microsoft Graph</b><br/>Mail send and mailbox sync"];
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
  workers -->|"send/sync/renew"| ms_graph;
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
  class ms_graph,ucalgary_sources externalNode;
  linkStyle default stroke:#475569,stroke-width:1.5px;
```

## Module to container mapping

| Module (from system design) | Primary container |
| --- | --- |
| Identity | Web + Auth + App server + `students`, `student_mailboxes` |
| Professor Discovery | Workers + `professors`, `professor_profiles`, pgvector |
| Campaigns | Web + App server + Workers + campaign tables |
| Mailbox Integration | Workers + Graph |
| Inbox | Web + Workers + thread tables |
| Workers | Supabase Edge Functions + Queue |

See [`diagrams/c4-component.md`](./diagrams/c4-component.md) for App Server module boundaries and proposed `src/modules/` layout.
