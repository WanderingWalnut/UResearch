# C4 Context Diagram — UResearch

Shows UResearch in its environment: who uses it and which external systems it integrates with.

```mermaid
C4Context
  title System Context — UResearch (Phase 1 Launch)

  Person(student, "Student", "UCalgary student seeking research outreach")
  Person(professor, "Professor", "Receives outreach in university mailbox")

  System(uresearch, "UResearch", "Discover professors, run outreach campaigns, track threads and replies")

  System_Ext(microsoft, "Microsoft 365 / Azure AD", "OAuth sign-in and student mailbox via Graph")
  System_Ext(exchange, "Exchange Online", "Delivers email to professor inboxes")
  System_Ext(ucalgary_data, "UCalgary Profile Sources", "Professor directory pages/APIs for ingestion")

  Rel(student, uresearch, "Searches, saves professors, creates campaigns, reads inbox")
  Rel(student, microsoft, "Signs in, grants mailbox consent")
  Rel(uresearch, microsoft, "Send mail, sync replies, refresh tokens")
  Rel(microsoft, exchange, "Routes outbound/inbound mail")
  Rel(professor, exchange, "Reads and replies to email")
  Rel(uresearch, ucalgary_data, "Ingests professor profiles", "Batch jobs")
  Rel(professor, uresearch, "Loads tracking pixel when mail client requests images", "Optional HTTP GET")
```

## Data flows (summary)

| Flow | Direction | Notes |
| --- | --- | --- |
| Sign-in | Student → Microsoft → UResearch | Domain validated against university allowlist |
| Discovery | Student → UResearch | Reads pre-ingested profiles only |
| Campaign send | UResearch → Graph → Professor mailbox | Sent from student mailbox address |
| Reply sync | Graph → UResearch | Webhook or delta query |
| Open signal | Professor mail client → UResearch pixel | Recorded as `opened` **Message Event** |

## Out of scope at context level

- Cross-university outreach
- Full mailbox replacement
- Phase 2 agentic/iMessage interface (same domain objects later)
