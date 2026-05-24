# C4 Context Diagram — UResearch

Shows UResearch in its environment: who uses it and which external systems it integrates with.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"background": "#f8fafc", "mainBkg": "#dbeafe", "primaryTextColor": "#0f172a", "lineColor": "#475569", "textColor": "#0f172a", "edgeLabelBackground": "#ffffff", "clusterBkg": "#ffffff", "clusterBorder": "#94a3b8", "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif"}} }%%
flowchart LR
  subgraph users["People"]
    direction TB
    student["<b>Student</b><br/>UCalgary student seeking research outreach"];
    professor["<b>Professor</b><br/>Receives outreach in university mailbox"];
  end

  uresearch["<b>UResearch</b><br/>Discover professors, run outreach campaigns,<br/>track threads and replies"];

  subgraph external["External Systems"]
    direction TB
    microsoft["<b>Microsoft 365 / Azure AD</b><br/>OAuth sign-in and student mailbox via Graph"];
    exchange["<b>Exchange Online</b><br/>Delivers email to professor inboxes"];
    ucalgary_data["<b>UCalgary Profile Sources</b><br/>Professor directory pages/APIs for ingestion"];
  end

  student -->|"discover / campaign / inbox"| uresearch;
  student -->|"sign in + consent"| microsoft;
  uresearch -->|"send mail / sync replies"| microsoft;
  microsoft -->|"route mail"| exchange;
  professor -->|"read + reply"| exchange;
  uresearch -->|"ingest profiles"| ucalgary_data;
  professor -->|"tracking pixel request"| uresearch;

  classDef personNode fill:#f8fafc,stroke:#94a3b8,color:#0f172a,stroke-width:1px;
  classDef systemNode fill:#bfdbfe,stroke:#60a5fa,color:#0f172a,stroke-width:1px;
  classDef externalNode fill:#e2e8f0,stroke:#94a3b8,color:#0f172a,stroke-width:1px;
  class student,professor personNode;
  class uresearch systemNode;
  class microsoft,exchange,ucalgary_data externalNode;
  linkStyle default stroke:#475569,stroke-width:1.5px,color:#0f172a;
```

## Data flows (summary)

| Flow | Direction | Notes |
| --- | --- | --- |
| Sign-in | Student → Microsoft → UResearch | Domain validated against university allowlist |
| Discovery | Student → UResearch | Reads pre-ingested profiles only |
| Campaign send | UResearch → Graph → Professor mailbox | Sent from student mailbox address |
| Reply sync | Graph → UResearch | Change notification webhooks |
| Open signal | Professor mail client → UResearch pixel | Recorded as `opened` **Message Event** |

## Out of scope at context level

- Cross-university outreach
- Full mailbox replacement
- Phase 2 agentic/iMessage interface (same domain objects later)
