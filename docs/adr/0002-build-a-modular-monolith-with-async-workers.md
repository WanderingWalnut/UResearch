# Build a modular monolith with async workers

UResearch will launch as a modular monolith rather than separate microservices. The web app and domain modules share one codebase, while slow or failure-prone work such as campaign sending, professor profile ingestion, reply sync, and follow-up scheduling runs asynchronously through queues and workers.

## Consequences

- Product development stays fast because domain modules can evolve in one repo.
- Bulk email sending never depends on a browser tab or a single web request finishing.
- Module boundaries should still be explicit: Identity, Professor Discovery, Campaigns, Mailbox Integration, Workers, and Inbox.
- Services can be split later if a module needs independent scaling or ownership.
