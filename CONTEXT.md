# UResearch

UResearch helps students find academic research opportunities and manage professor outreach in one place.

The current Gmail conversation scope is defined in [ADR-0007](docs/adr/0007-support-gmail-outreach-conversations.md). Full outreach conversations are planned for launch; this document describes product intent, not completed implementation.

## Language

**Student**:
A person using UResearch to discover research opportunities and manage outreach to professors. A Student may save their program, year of study, and plain-text signature for reuse through **Template Variables**.
_Avoid_: User, account, applicant

**University**:
The academic institution whose professor directory UResearch supports for discovery. At launch, the active **University** catalog is University of Calgary.
_Avoid_: School, organization, tenant

**University Catalog Selection**:
The **Student**'s chosen professor discovery catalog. At launch, Students self-select the University of Calgary catalog; UResearch does not require a matching university email domain.
_Avoid_: Eligibility verification, tenant membership, email-domain proof

**Google Account**:
The external identity a **Student** uses to sign in to UResearch and grant Gmail reading and sending access during launch onboarding. At launch, the same **Google Account** must be used for sign-in and the **Student Mailbox**.
_Avoid_: University email verification, Microsoft sign-in

**Gmail Send Permission**:
The Google OAuth permission that lets UResearch send approved **Campaign Messages**, **Follow-ups**, and **Student Replies** from the **Student Mailbox**; reading outreach conversations uses the separate **Gmail Read Permission**. At launch, this permission is requested as part of the create/sign-up flow so onboarding feels seamless before the **Student** starts outreach.
_Avoid_: Full mailbox control, Microsoft Graph consent

**Gmail Read Permission**:
The Google OAuth permission that lets UResearch retrieve messages from the Student Mailbox. The app displays linked outreach conversations; the provider scope itself is not limited to those threads.
_Avoid_: Send-only access, per-Professor OAuth scope

**Student Reply**:
An ordinary email the Student writes in an Outreach Thread after receiving a reply. It becomes an outbound Thread Message and is sent through Gmail only after the Student explicitly sends it.
_Avoid_: Automatic Follow-up, new Campaign Message

**Limited Access**:
The product state for a **Student** who has signed in with Google but does not currently have **Gmail Send Permission**. The **Student** may still discover **Professor Profiles**, save **Professors**, manage **Message Templates**, and draft **Outreach Campaigns**, but cannot approve, send, or follow up until Gmail is connected again.
_Avoid_: Failed signup, blocked account, disabled user

**Gmail Connection Prompt**:
A clear action prompt shown when a **Student** needs to grant or restore **Gmail Send Permission** or **Gmail Read Permission**. It explains that UResearch needs reading and sending access to show outreach conversations and send Student-approved messages from the **Student Mailbox**.
_Avoid_: Generic permission error, hidden settings requirement, full inbox consent

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
A reusable plain-email pattern owned by a **Student**, with a subject, simple body, and **Template Variables** such as professor name or research interest. Editing a **Message Template** does not change past **Outreach Campaigns**.
_Avoid_: Email draft, campaign, snippet

**Template Variable**:
A named Professor or Student value inserted through the Variables menu or `{{` shortcut and replaced before sending. The editor presents it as a readable inline token; the Professor receives only the resolved ordinary text.
_Avoid_: Merge tag, code, raw placeholder

**Message Customization**:
A Student-authored change to one Professor's resolved, token-free draft within an **Outreach Campaign**. It changes only that Professor's eventual **Campaign Message** and is preserved—but flagged for review—if the reusable **Message Template** later changes.
_Avoid_: Template edit, campaign-wide change, separate email

**Outreach Campaign**:
A student-approved batch of personalized outreach emails to selected **Professors**. Has a student-chosen name and selected **Professors**; there is no separate reusable Audience entity at launch. Stays in `draft` until the **Student** explicitly approves it; after approval, recipient contact and rendered message snapshots are immutable. May include an optional `scheduled_for` time; when null, sending starts immediately after approval.
_Avoid_: Blast, mail merge, send job, audience list

**Campaign Message**:
The initial personalized, visually unstyled email from an **Outreach Campaign** to a single **Professor**. It reads like a normal personal email and tracks the campaign send lifecycle from `draft` through `sent`, `failed`, or `cancelled`.
_Avoid_: Email, send, recipient row

**Campaign Cancellation**:
A **Student**'s request to stop every unsent **Campaign Message** in an approved or sending **Outreach Campaign**. Messages already sent cannot be recalled, and a message already being sent may still complete.
_Avoid_: Recall, delete campaign, undo send

**Send Issue**:
A recovery item shown when an approved outbound message cannot be delivered or needs Gmail reconnection. Campaign send issues appear in campaign detail; follow-up send issues appear in the relevant **Outreach Thread** detail. A **Send Issue** is not an **Outreach Board** lane or card.
_Avoid_: Board lane, thread status, professor reply state

**Send Pace**:
The shared dispatch schedule that controls when queued **Campaign Messages** and **Follow-ups** become eligible for sending. Launch defaults to one outbound message every three minutes and a configurable cap of 200 outbound messages per **Student** per rolling 24 hours.
_Avoid_: Board status, Gmail scheduled send, browser-side delay

**Projected Send Window**:
The expected first-send and last-send time shown before and during an **Outreach Campaign**. It may move as higher-priority **Follow-ups**, retries, or Gmail throttling consume the shared **Send Pace**.
_Avoid_: Guaranteed delivery time, mailbox scheduled send, board status

**Prior Outreach Warning**:
A user-friendly highlight shown when a **Student** selects a **Professor** who already has an **Outreach Thread**. It summarizes the prior contact status and last activity, then asks the **Student** to explicitly confirm before sending another **Campaign Message**.
_Avoid_: Duplicate error, hard block, hidden guardrail

**Thread Message**:
One inbound or outbound email within an **Outreach Thread**, such as a professor reply, a student manual reply, or a follow-up send. **Campaign Messages** become the first outbound **Thread Message** when sent.
_Avoid_: Email, message row

**Follow-up**:
A student-approved reminder or nudge sent through the **Student Mailbox** to continue an **Outreach Thread** after no reply. At launch, **Follow-ups** are never automatic; the **Student** decides when to send. Automated follow-up sends may come later.
_Avoid_: Auto-send, drip campaign, sequence step

**Follow-up Draft**:
A programmatically generated suggested **Follow-up** created from a deterministic template, the original outreach context, and **Professor Profile** fields. It is editable and must be approved by the **Student** before sending; launch does not use AI generation for **Follow-up Drafts** and does not persist unsent draft edits.
_Avoid_: AI-written reply, automatic follow-up, saved mailbox draft

**Follow-up Reminder**:
A task cue on an **Outreach Board** card indicating that the **Student** may want to send a **Follow-up**. By default, it appears seven days after the latest outbound message when the **Outreach Thread** is not `replied` or `closed`.
_Avoid_: Board lane, automated follow-up, required next step

**Student Mailbox**:
The Gmail mailbox for the same **Google Account** the **Student** uses to sign in. UResearch connects the **Student Mailbox** during launch onboarding with **Gmail Send Permission** and **Gmail Read Permission**. The app synchronizes linked outreach conversations, including incoming replies and messages sent in Gmail.
_Avoid_: UResearch sender, shared inbox, Microsoft Graph mailbox

**Opened Event**:
A **Message Event** of type `opened`, recorded for the first request to a tracking pixel that UResearch adds when a **Campaign Message** becomes queued. Each **Campaign Message** has at most one **Opened Event**. UResearch treats this event as the product signal for "opened" in the UI, but the underlying mechanism is not cryptographically guaranteed because email clients may block, prefetch, or proxy image loads.
_Avoid_: Read receipt, read status, confirmed read

**Message Event**:
An append-only record in the unified event stream for a **Campaign Message**, **Thread Message**, or **Outreach Thread**. Includes lifecycle events such as `queued`, `sent`, `failed`, `retried`, and engagement events such as `opened`, plus sync events such as `reply_detected`.
_Avoid_: Log line, audit row, webhook payload

**Outreach Thread**:
The ongoing outreach history between one **Student** and one **Professor**. It keeps earlier activity together while its current state reflects the latest outreach cycle; a confirmed new **Campaign Message** reopens a previously replied thread.
_Avoid_: Full inbox, mailbox, email client

**Outreach Board**:
A student-facing management board for tracking **Outreach Threads** across `sent`, `opened`, and `replied` lanes.
_Avoid_: Inbox, full mailbox, email client

**Replied Mark**:
A student-maintained indication that a **Professor** replied in the **Student Mailbox**.
_Avoid_: Reply sync, detected reply, automatic reply status

**Bounce Mark**:
A student-maintained indication that a sent outreach email later bounced in the **Student Mailbox**. Automated bounce classification is a separate implementation decision; reading access alone does not establish reliable bounce detection.
_Avoid_: Automatic bounce sync, Gmail delivery failure, provider webhook

**Contact Issue Report**:
A review signal that a **Professor Profile** may have bad contact data, such as a bounced or invalid email address. It does not automatically edit the **Professor Profile**.
_Avoid_: Automatic profile correction, global suppression, verified invalid email

## Relationships

- A **Student** signs in with a **Google Account**.
- A **Student** has one launch **Student Mailbox**, and it must belong to the same **Google Account** used for sign-in.
- Full outreach setup requires **Gmail Send Permission** and **Gmail Read Permission** for the **Student Mailbox**. Missing read access pauses conversation sync; missing send access blocks sending. Discovery and drafting remain available.
- A **Student** without current **Gmail Send Permission** is in **Limited Access** and sees a **Gmail Connection Prompt** before send-gated actions.
- At launch, UResearch discovery is scoped to the **Student**'s **University Catalog Selection**, initially the University of Calgary catalog.
- A **Professor** has one **Professor Profile** in a **University** directory.
- A **Professor** may have one or more **Professor Source Keys** for ingestion deduplication within a **University**.
- A **Professor**'s email is contact data on their **Professor Profile**, not the primary identity key.
- A **Professor** may receive outreach from many **Students**.
- A **Student** may save many **Professors** as **Saved Professors** before starting an **Outreach Campaign**.
- Saving a **Professor** does not create an **Outreach Thread** or send email.
- A **Student** may create many **Outreach Campaigns**.
- A **Student** may own many **Message Templates** and reuse them across **Outreach Campaigns**.
- A **Message Template** uses a simple subject-and-body editor with inline **Template Variables**, not rich-text or newsletter styling.
- The Variables menu and `{{` keyboard shortcut open the same searchable variable picker.
- UResearch resolves every **Template Variable** before sending and never exposes raw template syntax to a **Professor**.
- A missing Student-sourced **Template Variable** blocks approval until the Student completes the required profile field.
- A missing Professor-sourced **Template Variable** uses its readable fallback, highlights the affected Professor during review, and requires acknowledgement before approval.
- A **Message Customization** is applied after variable resolution and frozen into only the selected Professor's **Campaign Message** at approval.
- Editing the reusable **Message Template** preserves existing **Message Customizations**, marks them for review, and offers an explicit reset to the latest template.
- An **Outreach Campaign** references a **Message Template** and stores an immutable template snapshot at approval.
- An **Outreach Campaign** has a lifecycle status: `draft`, `approved`, `sending`, `completed`, or `cancelled`.
- A **Campaign Cancellation** stops queued messages but cannot recall sent messages; a message already being sent may still complete.
- An **Outreach Campaign** has a name and contains one or more **Campaign Messages**, one per selected **Professor**.
- Each **Campaign Message** targets exactly one **Professor**.
- **Campaign Messages** and **Follow-ups** share the same per-Student **Send Pace** and rolling 24-hour cap.
- A student-approved **Follow-up** takes the next available send slot ahead of queued bulk **Campaign Messages**.
- A large **Outreach Campaign** may spill queued **Campaign Messages** into the next available rolling 24-hour window when the **Send Pace** cap is reached.
- A **Student** sees the **Projected Send Window** before approving an **Outreach Campaign**.
- A **Student** sees a **Prior Outreach Warning** before approving a **Campaign Message** to a **Professor** with an existing **Outreach Thread**.
- A **Prior Outreach Warning** requires explicit confirmation but does not block legitimate repeat outreach.
- A **Campaign Message** is sent through the **Student Mailbox** using **Gmail Send Permission**.
- Gmail API acceptance means a **Campaign Message** or **Follow-up** is treated as sent by UResearch; later bounce emails are not auto-detected at launch.
- A failed **Campaign Message** creates a **Send Issue**, not an **Outreach Thread** or **Outreach Board** card.
- A failed **Follow-up** creates a **Send Issue** on the relevant **Outreach Thread**, not a new board lane.
- Replies to a **Campaign Message** go to the **Student Mailbox**.
- A **Campaign Message** has one current status derived from its latest lifecycle **Message Event**, and a full append-only **Message Event** history.
- An **Opened Event** is a **Message Event** with type `opened`.
- An **Outreach Thread** and **Thread Message** may also have **Message Events** such as `reply_detected` or `follow_up_sent`.
- A **Student** and a **Professor** have at most one **Outreach Thread** between them.
- An **Outreach Thread** contains one or more **Thread Messages**.
- The **Outreach Board** contains one card per **Outreach Thread**.
- The default **Outreach Board** lanes are `sent`, `opened`, and `replied`; queued and failed sends are operational states, not normal board lanes.
- **Opened Events** move cards from `sent` to `opened`, but `opened` is not required before a **Replied Mark**.
- A **Campaign Message**, once sent, creates or attaches to the **Outreach Thread** for that **Student** and **Professor** (reuse if thread already exists).
- A confirmed new **Campaign Message** reopens a `replied` **Outreach Thread** and returns its board card to `sent`; earlier replies remain in the thread history.
- A thread closed for `bounced` or `bad_email` cannot be reopened until its contact issue is resolved; other closed threads require explicit reopening.
- **Follow-ups** attach to an **Outreach Thread** and do not create new **Campaign Messages**.
- A **Follow-up Draft** is generated programmatically from templates and context; it is not AI-generated at launch.
- A **Follow-up Draft** must be reviewed and approved by the **Student** before it becomes a sent **Follow-up**.
- Unsent edits to a **Follow-up Draft** are ephemeral at launch; closing the flow discards them.
- Approved **Follow-ups** use the same async Gmail sending worker path as **Campaign Messages**.
- **Follow-up Reminders** appear as card badges or board filters on `sent` and `opened` cards, not as **Outreach Board** lanes.
- A default **Follow-up Reminder** is due seven days after the latest outbound message unless the **Outreach Thread** is `replied` or `closed`.
- An **Outreach Thread** has a conversation status such as `open`, `replied`, or `closed`. Do not schedule **Follow-ups** after the thread is `replied`.
- At launch, a detected incoming Professor reply for the current outreach cycle sets `replied`; a **Replied Mark** remains a manual correction. Old replies, Student replies, bounce notices, and automated responses must not mark a later cycle replied.
- At launch, a later bounced email comes from a **Bounce Mark** added by the **Student**, not automatic mailbox sync.
- A **Bounce Mark** closes the **Outreach Thread** with a bounce-oriented reason and creates a **Contact Issue Report** for review.

## Example dialogue

> **Dev:** "When a **Student** starts outreach, should we create the campaign immediately?"
> **Domain expert:** "Only if they have selected professors and approved the message."

## Flagged ambiguities

- "user" was used to mean the person doing outreach — resolved: use **Student** for the domain actor and reserve "user" for auth or implementation details.
- "recipient" was used to mean the professor being contacted — resolved: use **Professor** in domain language.
- "project" and "opportunity" were used for discovery — resolved for launch: Students discover **Professor Profiles**, not guaranteed open positions.
- "read" was used for email tracking — resolved: use **Opened Event** because opens are unreliable and do not prove the professor read the message.
- "inbox" was used for communication management — resolved: UResearch presents an **Outreach Board** of **Outreach Threads**, not the Student's full mailbox.
- Cross-university outreach is out of launch scope, but the model should not prevent adding it later.
- "email as professor identity" was proposed — resolved: UResearch assigns a stable **Professor** ID; ingestion matches via **Professor Source Key** when available; email is mutable contact data with at most one profile per email per **University** as a soft dedupe rule, not the primary key.
- "one thread per campaign message vs per student-professor pair" — resolved: one **Outreach Thread** per **Student** and **Professor** pair; **Campaign Message** is the initial campaign send; follow-ups and replies are **Thread Messages**.
- "kanban card" was used for the board UI — resolved: one board card is one **Outreach Thread**, not one **Campaign Message** or one **Outreach Campaign**.
- "automated follow-ups at launch" — resolved: **Follow-ups** are manual and student-triggered at launch; automated sends may come later.
- "save potential matches" from product summary — resolved: use **Saved Professor** as a personal shortlist independent of **Outreach Campaigns**.
- "template snapshot without template entity" — resolved: **Message Template** is a reusable student-owned entity; **Outreach Campaign** stores an immutable snapshot at approval.
- "plain text vs styled campaign email" — resolved: the editor feels like a simple personal-email composer with inline Template Variables; delivery has no visual styling and includes plain-text plus unstyled HTML alternatives for email compatibility and optional open tracking.
- "how are Template Variables inserted?" — resolved: a searchable Variables control and the `{{` shortcut open the same picker; selected variables appear as subtle inline tokens only in the editor.
- "which reusable Student details are available to templates?" — resolved: Student name, University, program, year of study, and plain-text signature; introductory sentences are composed from these fields rather than stored as a second free-form introduction.
- "what happens when a Template Variable is missing?" — resolved: missing Student profile values block approval; missing Professor values show readable fallbacks and require review of affected recipients.
- "can one Professor's message be edited independently?" — resolved: yes; a Message Customization changes only that Professor's resolved draft and becomes part of the frozen Campaign Message snapshot.
- "what happens to Message Customizations after the template changes?" — resolved: preserve them, mark them for review, and let the Student explicitly reset any one message to the latest template.
- "can Template Variables be inserted while customizing one Professor's message?" — resolved: no; customization edits the already-resolved ordinary text exactly as it will be sent.
- "when is a campaign created and can it be edited after approval?" — resolved: campaign stays `draft` until explicit approval; after approval, recipient contact and rendered **Campaign Message** snapshots are immutable; unsent messages may be cancelled but not silently rewritten.
- "scheduled campaign sends" — resolved: optional campaign-level `scheduled_for` at approval, default send-now; UResearch workers dispatch at the scheduled time rather than relying on a mailbox provider's deferred send for bulk campaigns.
- "Audiences as separate entity" from Stitch designs — resolved: no separate Audience at launch; an **Outreach Campaign** name plus its selected **Professors** is the audience; **Saved Professors** is the reusable selection pool.
- "exact UCalgary email domain rules" — superseded for launch: Google sign-in and Gmail outreach access replace mandatory `@ucalgary.ca` verification; UCalgary remains the launch professor catalog.
- "open tracking default" — resolved: enabled by default on **Outreach Campaigns** with per-campaign opt-out (`open_tracking_enabled`); UI shows **Opened** without extra disclaimer copy.
- "separate opened_events vs message_events tables" — resolved: one unified append-only **Message Event** stream with an `opened` event type for pixel loads and lifecycle/sync event types for operational history.
- "when is the tracking pixel added?" — resolved: when approval creates a queued **Campaign Message**, UResearch generates its opaque tracking token and stores exactly one pixel in its immutable HTML snapshot; UResearch previews use the plain-text snapshot and never load that pixel.
- "how many Opened Events should duplicate pixel requests create?" — resolved: at most one per **Campaign Message**, enforced atomically in Postgres; later proxy, prefetch, and repeat requests return the pixel without adding another event.
- "opened tracking is guaranteed when images load" — resolved for product language: UI treats **Opened** as the engagement signal without claiming confirmed read; image blocking can hide opens, while prefetch or proxy loads can create the single Opened Event without a human read.
- "Student vs Supabase Auth user" — resolved: one Supabase Auth user maps one-to-one to one **Student** record after verified sign-in.
- "launch sign-in method" — resolved: use Google sign-in, not Microsoft OAuth or email/password university verification.
- "Student Mailbox integration" — resolved under ADR-0007: Gmail Read Permission synchronizes linked outreach conversations; Gmail Send Permission sends approved Campaign Messages, Follow-ups, and Student Replies.
- "manual compose handoff vs managed sending" — resolved under ADR-0007: Use Gmail sending for approved Campaign Messages, Follow-ups, and Student Replies from the in-app conversation composer.
- "full Gmail inbox in-app at launch" — resolved under ADR-0007: Full outreach conversations are in scope under ADR-0007. An arbitrary Gmail inbox replacement remains outside scope. Restricted-scope verification is a release dependency.
- "who may use UResearch when Google sign-in allows personal email?" — resolved: any Google-signed-in **Student** may self-select the University of Calgary **University Catalog Selection** at launch; stricter eligibility can be added later.
- "when should Gmail send permission be requested?" — resolved: request it during the create/sign-up onboarding flow, not only at first send time.
- "what happens if Gmail send permission is denied or revoked?" — resolved: keep the **Student** in **Limited Access**, pause queued sends, and require explicit resumption after Gmail is reconnected.
- "can the sending Gmail mailbox differ from the sign-in Google account?" — resolved for launch: no; the same **Google Account** is both identity and sender.
- "does paced sending happen in the browser?" — resolved: no; **Send Pace** is enforced by background workers deciding when queued **Campaign Messages** are eligible for dispatch.
- "should the daily sending cap be small?" — resolved: no; launch defaults to 200 total **Campaign Messages** and **Follow-ups** per **Student** per rolling 24 hours, while pacing individual sends every three minutes.
- "what happens when a campaign exceeds the rolling 24-hour cap?" — resolved: queued messages spill into the next available window automatically, with a **Projected Send Window** shown before approval.
- "should repeat outreach to the same professor be blocked?" — resolved: no; show a user-friendly **Prior Outreach Warning**, require explicit confirmation, and reuse the existing **Outreach Thread**.
- "should failed sends appear on the Outreach Board?" — resolved: no; show them as **Send Issues** in campaign or thread detail until successfully retried.
- "should follow-up drafts use AI?" — resolved: no; generate **Follow-up Drafts** programmatically from deterministic templates and context to control costs.
- "should unsent edited follow-up drafts be saved?" — resolved: no for launch; regenerate them on demand and persist only after approval/send.
- "should follow-ups send synchronously?" — resolved: no; approved **Follow-ups** use the same async worker path as **Campaign Messages**.
- "how are later bounce emails handled without Gmail reading?" — resolved: Gmail API acceptance is `sent`; later bounces are manual **Bounce Marks** that close the **Outreach Thread** and create **Contact Issue Reports**.
- "how does a board card become replied without mailbox sync?" — resolved under ADR-0007: Detected Professor replies update the current cycle automatically; manual Replied Marks remain a correction path.
- "should queued be a board lane?" — resolved: no; queued is operational send state. The student-facing board starts at `sent`.
- "does a card need to become opened before replied?" — resolved: no; if no **Opened Event** is recorded, the card stays `sent` and the **Student** can still add a **Replied Mark**.
- "should follow-up due be a board lane?" — resolved: no; use **Follow-up Reminders** as card badges and board filters layered on `sent` or `opened`.
- "when is a follow-up due?" — resolved: default to seven days after the latest outbound message while the **Outreach Thread** is neither `replied` nor `closed`; the **Student** decides whether to act.
- "does a Follow-up share campaign sending limits?" — resolved: yes; Follow-ups count toward the same pace and rolling cap, and a student-approved Follow-up receives the next available slot.
- "what does cancelling a campaign do?" — resolved: cancel every queued Campaign Message, allow an in-flight send to finish, and retain sent messages in history.
- "what happens when a Student contacts a Professor again after a reply?" — resolved: reuse and reopen the Outreach Thread so the board reflects the latest outreach cycle while preserving prior history.
- "how is open tracking presented and retained?" — resolved: enable it by default with a visible per-campaign opt-out, describe it in the privacy policy, never claim confirmed reading, and delete its data with the Student account.
