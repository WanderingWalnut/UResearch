# Use Google Gmail send-only for launch outreach

## Status

Superseded in part by [ADR-0007](0007-support-gmail-outreach-conversations.md), 2026-09-05. The historical decision below is preserved. Gmail reading and in-app replies are now in launch scope; Google identity and same-account sending remain.

UResearch will launch with Google sign-in and Gmail send-only OAuth so approved Outreach Campaigns and student-approved Follow-ups are sent from the Student's connected Gmail mailbox. Gmail send permission is requested during the create/sign-up onboarding flow so the launch experience feels seamless before the Student starts outreach. This replaces the UResearch-managed sender plan because the product needs emails to feel like they come from the Student while avoiding Microsoft Graph tenant-consent blockers and deferring Gmail inbox-reading risk.

## Considered Options

- Use Microsoft Graph for UCalgary mailbox send/read.
- Use a UResearch-managed sending domain with `Reply-To` set to the Student.
- Use Google sign-in plus Gmail send-only.
- Request Gmail read/modify scopes and build an in-app inbox at launch.

## Consequences

- Professors see outreach from the Student's Gmail address, which is more natural than a generic UResearch sender.
- Launch onboarding includes the Gmail send-only consent step; campaign sending should not be the first time the Student discovers this permission requirement.
- The Google account used for sign-in is also the Gmail sender at launch; secondary Gmail senders and account-linking are deferred.
- If Gmail send permission is denied or revoked, UResearch keeps limited access available for discovery, saved professors, templates, and campaign drafts, but blocks approval, sending, and follow-ups behind a clear reconnect prompt.
- UResearch must pass the appropriate Google OAuth app verification for Gmail send access.
- UResearch does not request Gmail read/modify scopes at launch; reply tracking remains manual through Replied Marks.
- Full in-app Gmail reading is deferred until the team is ready for Google's restricted-scope requirements and any necessary security assessment.
- Microsoft Graph can be revisited later as a separate provider if tenant consent becomes available.
