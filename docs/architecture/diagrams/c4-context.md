# C4 Context Diagram — UResearch

> Scope update, 2026-09-05: [ADR-0007](../../adr/0007-support-gmail-outreach-conversations.md) supersedes send-only, deferred reply-sync, and manual-reply-only statements in this earlier blueprint. Full Gmail outreach conversations are now planned for launch. This blueprint has not yet been revised for the sync implementation; use ADR-0007 and the new Gmail-conversations PRD for that work.

Shows UResearch in its environment: who uses it and which external systems it integrates with.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"background": "#f8fafc", "mainBkg": "#dbeafe", "primaryTextColor": "#0f172a", "lineColor": "#475569", "textColor": "#0f172a", "edgeLabelBackground": "#ffffff", "clusterBkg": "#ffffff", "clusterBorder": "#94a3b8", "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif"}} }%%
flowchart LR
  subgraph users["People"]
    direction TB
    student["<b>Student</b><br/>Student seeking research outreach"];
    professor["<b>Professor</b><br/>Receives outreach in university mailbox"];
  end

  uresearch["<b>UResearch</b><br/>Discover professors, run outreach campaigns,<br/>track threads and replies"];

  subgraph external["External Systems"]
    direction TB
    identity["<b>Google Sign-In</b><br/>External identity for Student accounts"];
    delivery["<b>Gmail API</b><br/>Send-only mailbox connection"];
    ucalgary_data["<b>UCalgary Profile Sources</b><br/>Professor directory pages/APIs for ingestion"];
  end

  student -->|"discover / campaign / board"| uresearch;
  student -->|"sign in"| identity;
  uresearch -->|"send approved campaign messages"| delivery;
  delivery -->|"deliver mail"| professor;
  professor -->|"reply to connected Gmail address"| student;
  uresearch -->|"ingest profiles"| ucalgary_data;
  professor -->|"tracking pixel request"| uresearch;

  classDef personNode fill:#f8fafc,stroke:#94a3b8,color:#0f172a,stroke-width:1px;
  classDef systemNode fill:#bfdbfe,stroke:#60a5fa,color:#0f172a,stroke-width:1px;
  classDef externalNode fill:#e2e8f0,stroke:#94a3b8,color:#0f172a,stroke-width:1px;
  class student,professor personNode;
  class uresearch systemNode;
  class identity,delivery,ucalgary_data externalNode;
  linkStyle default stroke:#475569,stroke-width:1.5px;
```

## Data flows (summary)

| Flow | Direction | Notes |
| --- | --- | --- |
| Sign-in | Student → Google Sign-In → UResearch | Google identity creates the Student account |
| Discovery | Student → UResearch | Reads pre-ingested profiles only |
| Campaign send | UResearch → Gmail API → Professor mailbox | Sends approved Campaign Messages from the connected Gmail mailbox |
| Reply path | Professor → Student mailbox | Replies go to the connected Gmail mailbox; UResearch does not read it at launch |
| Open signal | Professor mail client → UResearch pixel | Recorded as `opened` **Message Event** |

## Out of scope at context level

- Cross-university outreach
- Gmail inbox reading at launch
- Phase 2 agentic/iMessage interface (same domain objects later)
