# C4 Container Diagram — UResearch

Major building blocks inside UResearch and how they communicate.

```mermaid
C4Container
  title Container Diagram — UResearch Launch Stack

  Person(student, "Student", "UCalgary student")

  System_Boundary(uresearch, "UResearch") {
    Container(web, "Web App", "Next.js on Vercel", "Discovery, campaigns, templates, inbox UI")
    Container(api, "App Server Actions / Route Handlers", "Next.js server", "Auth checks, domain logic, enqueue jobs")
    Container(pixel, "Open Tracking Endpoint", "Vercel route or Edge Function", "Records opened Message Events")
    Container(workers, "Background Workers", "Supabase Edge Functions", "Send, ingest, reply sync, dispatch scheduled campaigns")
    ContainerDb(db, "Database", "Supabase Postgres + pgvector", "Students, profiles, campaigns, threads, message_events")
    Container(queue, "Job Queue", "Supabase Queues", "Async send and sync work")
    Container(realtime, "Realtime", "Supabase Realtime", "Live campaign and inbox updates")
    Container(auth, "Auth", "Supabase Auth + Azure OAuth", "Student sessions")
  }

  System_Ext(graph, "Microsoft Graph", "Mail send and mailbox sync")
  System_Ext(ingest, "UCalgary Sources", "Profile ingestion inputs")

  Rel(student, web, "Uses", "HTTPS")
  Rel(web, api, "Calls")
  Rel(web, auth, "Signs in")
  Rel(api, db, "Reads/writes", "Postgres + RLS")
  Rel(api, queue, "Enqueues jobs")
  Rel(workers, queue, "Consumes batches")
  Rel(workers, db, "Updates state + message_events")
  Rel(workers, graph, "sendMail, webhook sync, subscription renewal")
  Rel(realtime, db, "Broadcasts row changes")
  Rel(web, realtime, "Subscribes")
  Rel(pixel, db, "Inserts opened events", "Service role")
  Rel(workers, ingest, "Fetches profile source data")
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
