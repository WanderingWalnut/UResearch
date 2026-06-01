# UResearch

UResearch helps students find academic research opportunities and manage professor outreach in one place.

## Language

**Student**:
A person using UResearch to discover research opportunities and manage outreach to professors. At launch, each **Student** maps one-to-one to a Supabase Auth user. The sign-in method is being redesigned.
_Avoid_: User, account, applicant

**University**:
The academic institution a **Student** belongs to, inferred from the student's university email domain and used as the launch boundary for professor discovery. Each **University** maintains an allowlist of permitted email domains; at launch, University of Calgary allows `@ucalgary.ca`.
_Avoid_: School, organization, tenant

**Professor**:
An academic researcher or lab lead a **Student** may contact for research opportunities. UResearch assigns each **Professor** a stable internal identity that does not change when contact details or profile text are updated.
_Avoid_: Research contact, recipient, PI

**Professor Profile**:
UResearch's current searchable view of a **Professor**, including research interests and contact details collected before students search. Profile fields such as email may change over time; outbound campaign messages store contact snapshots at approval time.
_Avoid_: Project, opportunity, listing

**Professor Source Key**:
An external identifier from a university ingestion source used to recognize the same **Professor** across ingestion runs, such as a directory ID or canonical profile URL. UResearch uses source keys for deduplication; they are not the primary identity used by campaigns or threads.
_Avoid_: Email address, professor slug

**Saved Professor**:
A **Professor** a **Student** has bookmarked from discovery for possible future outreach. Saving does not send email or create an **Outreach Thread**.
_Avoid_: Favorite, bookmark, draft recipient

**Message Template**:
A reusable outreach email pattern owned by a **Student**, with subject, body, and personalization placeholders such as professor name or research interest. Editing a **Message Template** does not change past **Outreach Campaigns**.
_Avoid_: Email draft, campaign, snippet

**Outreach Campaign**:
A student-approved batch of personalized outreach emails to selected **Professors**. Has a student-chosen name and selected **Professors**; there is no separate reusable Audience entity at launch. Stays in `draft` until the **Student** explicitly approves it; after approval, recipient contact and rendered message snapshots are immutable. May include an optional `scheduled_for` time; when null, sending starts immediately after approval.
_Avoid_: Blast, mail merge, send job, audience list

**Campaign Message**:
The initial personalized outbound email from an **Outreach Campaign** to a single **Professor**. Tracks the campaign send lifecycle (`draft` through `sent` or `failed`). Follow-ups and manual replies are **Thread Messages**, not **Campaign Messages**.
_Avoid_: Email, send, recipient row

**Thread Message**:
One inbound or outbound email within an **Outreach Thread**, such as a professor reply, a student manual reply, or a follow-up send. **Campaign Messages** become the first outbound **Thread Message** when sent.
_Avoid_: Email, message row

**Follow-up**:
A student-initiated reminder or nudge to continue an **Outreach Thread** after no reply. At launch, **Follow-ups** are manual only; the **Student** decides when to act. Automated follow-up sends may come later.
_Avoid_: Auto-send, drip campaign, sequence step

**Student Mailbox**:
The outbound email identity associated with a **Student** so UResearch can support professor outreach. The launch sending and reply-sync strategy is being redesigned.
_Avoid_: UResearch sender, shared inbox, managed mailbox

**Opened Event**:
A **Message Event** of type `opened`, recorded when an email client requests the tracking pixel embedded in a **Campaign Message**. UResearch treats **Opened Events** as the product signal for "opened" in the UI, but the underlying mechanism is not cryptographically guaranteed because email clients may block, prefetch, or proxy image loads.
_Avoid_: Read receipt, read status, confirmed read

**Message Event**:
An append-only record in the unified event stream for a **Campaign Message**, **Thread Message**, or **Outreach Thread**. Includes lifecycle events such as `queued`, `sent`, `failed`, `retried`, and engagement events such as `opened`, plus sync events such as `reply_detected`.
_Avoid_: Log line, audit row, webhook payload

**Outreach Thread**:
The ongoing email conversation between one **Student** and one **Professor**. The inbox shows **Outreach Threads**, not the **Student**'s full mailbox. Conversation outcome such as `replied` is tracked on the **Outreach Thread**.
_Avoid_: Full inbox, mailbox, email client

## Relationships

- A **Student** belongs to one **University**, inferred by matching their sign-in email domain against that **University**'s allowed email domains.
- At launch, a **Student** may discover and contact only **Professors** from their own **University**.
- A **Professor** has one **Professor Profile** in a **University** directory.
- A **Professor** may have one or more **Professor Source Keys** for ingestion deduplication within a **University**.
- A **Professor**'s email is contact data on their **Professor Profile**, not the primary identity key.
- A **Professor** may receive outreach from many **Students**.
- A **Student** may save many **Professors** as **Saved Professors** before starting an **Outreach Campaign**.
- Saving a **Professor** does not create an **Outreach Thread** or send email.
- A **Student** may create many **Outreach Campaigns**.
- A **Student** may own many **Message Templates** and reuse them across **Outreach Campaigns**.
- An **Outreach Campaign** references a **Message Template** and stores an immutable template snapshot at approval.
- An **Outreach Campaign** has a lifecycle status: `draft`, `approved`, `sending`, `completed`, or `cancelled`.
- An **Outreach Campaign** has a name and contains one or more **Campaign Messages**, one per selected **Professor**.
- Each **Campaign Message** targets exactly one **Professor**.
- A **Campaign Message** is sent through the launch delivery strategy selected for the **Student** who owns the **Outreach Campaign**.
- A **Campaign Message** has one current status derived from its latest lifecycle **Message Event**, and a full append-only **Message Event** history.
- An **Opened Event** is a **Message Event** with type `opened`.
- An **Outreach Thread** and **Thread Message** may also have **Message Events** such as `reply_detected` or `follow_up_sent`.
- A **Student** and a **Professor** have at most one **Outreach Thread** between them.
- An **Outreach Thread** contains one or more **Thread Messages**.
- A **Campaign Message**, once sent, creates or attaches to the **Outreach Thread** for that **Student** and **Professor** (reuse if thread already exists).
- **Follow-ups** attach to an **Outreach Thread** and do not create new **Campaign Messages**.
- An **Outreach Thread** has a conversation status such as `open`, `replied`, or `closed`. Do not schedule **Follow-ups** after the thread is `replied`.

## Example dialogue

> **Dev:** "When a **Student** starts outreach, should we create the campaign immediately?"
> **Domain expert:** "Only if they have selected professors and approved the message."

## Flagged ambiguities

- "user" was used to mean the person doing outreach — resolved: use **Student** for the domain actor and reserve "user" for auth or implementation details.
- "recipient" was used to mean the professor being contacted — resolved: use **Professor** in domain language.
- "project" and "opportunity" were used for discovery — resolved for launch: Students discover **Professor Profiles**, not guaranteed open positions.
- "read" was used for email tracking — resolved: use **Opened Event** because opens are unreliable and do not prove the professor read the message.
- "inbox" was used for communication management — resolved: UResearch manages **Outreach Threads**, not the Student's full mailbox.
- Cross-university outreach is out of launch scope, but the model should not prevent adding it later.
- "email as professor identity" was proposed — resolved: UResearch assigns a stable **Professor** ID; ingestion matches via **Professor Source Key** when available; email is mutable contact data with at most one profile per email per **University** as a soft dedupe rule, not the primary key.
- "one thread per campaign message vs per student-professor pair" — resolved: one **Outreach Thread** per **Student** and **Professor** pair; **Campaign Message** is the initial campaign send; follow-ups and replies are **Thread Messages**.
- "automated follow-ups at launch" — resolved: **Follow-ups** are manual and student-triggered at launch; automated sends may come later.
- "save potential matches" from product summary — resolved: use **Saved Professor** as a personal shortlist independent of **Outreach Campaigns**.
- "template snapshot without template entity" — resolved: **Message Template** is a reusable student-owned entity; **Outreach Campaign** stores an immutable snapshot at approval.
- "when is a campaign created and can it be edited after approval?" — resolved: campaign stays `draft` until explicit approval; after approval, recipient contact and rendered **Campaign Message** snapshots are immutable; unsent messages may be cancelled but not silently rewritten.
- "scheduled campaign sends" — resolved: optional campaign-level `scheduled_for` at approval, default send-now; UResearch workers dispatch at the scheduled time rather than relying on a mailbox provider's deferred send for bulk campaigns.
- "Audiences as separate entity" from Stitch designs — resolved: no separate Audience at launch; an **Outreach Campaign** name plus its selected **Professors** is the audience; **Saved Professors** is the reusable selection pool.
- "exact UCalgary email domain rules" — resolved: use a per-**University** allowed email domain allowlist; launch with `ucalgary.ca` only, extensible without model changes.
- "open tracking default" — resolved: enabled by default on **Outreach Campaigns** with per-campaign opt-out (`open_tracking_enabled`); UI shows **Opened** without extra disclaimer copy.
- "separate opened_events vs message_events tables" — resolved: one unified append-only **Message Event** stream with an `opened` event type for pixel loads and lifecycle/sync event types for operational history.
- "opened tracking is guaranteed when images load" — resolved for product language: UI treats **Opened** as the engagement signal; engineering must still handle image blocking, prefetch, and duplicate pixel requests without claiming confirmed read.
- "Student vs Supabase Auth user" — resolved: one Supabase Auth user maps one-to-one to one **Student** record after verified sign-in.
- "launch sign-in method" — unresolved: the mandatory Microsoft OAuth approach is blocked by University tenant policy. Re-evaluate identity-only Microsoft sign-in against passwordless university-email verification.
- "Student Mailbox integration" — unresolved: re-evaluate manual Outlook compose handoff, a UResearch-managed sending domain, and other delivery/reply-sync strategies before adding provider-specific schema.
