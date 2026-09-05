# Support full Gmail outreach conversations

## Status

Accepted product direction, 2026-09-05. Implementation has not started. Supersedes the send-only and manual-reply-only constraints in [ADR-0006](0006-use-google-gmail-send-only-for-launch-outreach.md). Google identity, same-account sending, Limited Access, and explicit outbound approval remain.

## Context

The Student needs to read a Professor's reply and respond in the same workspace. A sent-message preview with an Open conversation button does not provide that workflow. The product owner explicitly requested full email conversations during the design review.

## Decision

Support incoming and outgoing email in outreach-related **Outreach Threads** at launch. The conversation workspace presents a selectable thread list, chronological messages, and an in-app reply composer. A board card navigates directly to its conversation; it does not first open a summary modal.

Use the same Google Account for identity and the Student Mailbox. Plan for `gmail.readonly` plus `gmail.send`; do not request `gmail.modify` or full mailbox-control scope merely to display messages and send replies. These are planned scopes, not permissions granted by this document. OAuth approval and any required assessment are release dependencies.

The app displays linked outreach conversations, not the Student's general Gmail inbox. This is an application filter: Gmail reading consent itself is broader and must be described honestly. Initially link provider thread IDs returned by outreach sends. An Outreach Thread may map to more than one provider thread because repeat campaigns can start new email subjects. Never join unrelated mail using only a matching display name or subject.

Read all messages in a linked provider thread, including replies sent from Gmail, deduplicated by mailbox and provider message ID. Add in-app replies to the selected provider thread using its thread ID and valid reply headers. Show queued, sent, and failed states honestly; API acceptance is not proof of delivery. Preserve the app's one-Student/one-Professor Outreach Thread identity and immutable approved Campaign Message snapshots.

Detected incoming Professor replies set the current outreach cycle to Replied and suppress its no-reply reminder. A reply by the Student continues the conversation; it does not reopen an initial-outreach cycle. A newly approved Campaign Message can start a new cycle as before. Delayed synchronization of old replies must not mark a later outreach cycle replied. Keep a manual Replied Mark as a correction mechanism, not the primary flow. Bounce notices and automated responses must not be treated as Professor replies.

## Options considered

- Keep Gmail send-only and require Gmail for every incoming reply: simpler delivery, but misses the requested workflow.
- Read linked outreach conversations and send replies: selected; meets the request while keeping the product focused.
- Build a full Gmail replacement with folders, deletion, labels, and arbitrary mail composition: not requested.

## Consequences and implementation questions

- New work: reading consent, mailbox synchronization, provider-thread mapping, safe message rendering, reply sending, and connection recovery.
- Synchronization must handle repeated notifications, expired history cursors, reconnects, pagination, and replies made in Gmail. Push notifications are sync hints, not complete messages. Choose and document freshness targets and polling/push strategy in the implementation ticket.
- Minimize stored email content, protect credentials server-side, isolate Student records, and define deletion and retention before release. Do not load remote email images or execute HTML from incoming messages by default.
- Do not claim Gmail read/unread labels are synchronized by an app-only read indicator.
- Attachment upload/download, CC/reply-all, importing pre-existing unlinked mail, and group conversations need a bounded follow-up decision. The current visual prototype does not settle those capabilities.
- General university wording on the landing page does not expand the currently supported University catalog. University of Calgary remains the implemented catalog boundary until a separate discovery decision changes it.

## Delivery tracking

[PRD #6](https://github.com/WanderingWalnut/UResearch/issues/6) tracks the scope. Implementation tickets: [connection #7](https://github.com/WanderingWalnut/UResearch/issues/7), [sync #8](https://github.com/WanderingWalnut/UResearch/issues/8), [conversation UI and replies #9](https://github.com/WanderingWalnut/UResearch/issues/9), and [release decisions #10](https://github.com/WanderingWalnut/UResearch/issues/10).

## Sources

- [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes): reading and sending are separate scopes; reading is restricted.
- [Gmail threads](https://developers.google.com/workspace/gmail/api/guides/threads): retrieve messages in a thread and preserve threading when replying.
- [Gmail synchronization](https://developers.google.com/workspace/gmail/api/guides/sync): partial synchronization and recovery from unavailable history.
- [Gmail push notifications](https://developers.google.com/workspace/gmail/api/guides/push): backend change notifications and watch renewal.
