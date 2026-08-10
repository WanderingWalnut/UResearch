# Pause Microsoft Graph mailbox integration

## Status

Accepted

## Context

The first auth slice assumed a UCalgary Student could grant delegated Microsoft Graph permissions for profile access, mail sending, mail reading, and offline access. A real `@ucalgary.ca` sign-in reached a tenant-admin approval gate. UResearch is not pursuing University IT approval as a launch dependency.

## Decision

Pause the Microsoft OAuth and Graph mailbox implementation. Retain generic Supabase primitives and provider-neutral domain concepts, but remove Azure routes, Graph callback logic, Microsoft token storage, and the Microsoft-only `student_mailboxes` table. Do not add replacement provider-specific schema until a new PRD selects a tenant-compatible identity, delivery, and reply-sync strategy.

## Options Considered

- Continue with delegated Microsoft Graph permissions and request tenant-admin approval.
- Use Microsoft sign-in for identity only and redesign mailbox delivery separately.
- Use passwordless university-email verification and redesign mailbox delivery separately.
- Use a manual Outlook compose handoff for launch.
- Use a UResearch-managed sending domain for automated delivery.

## Consequences

- Professor discovery work can continue on the retained `universities`, `students`, and `message_templates` primitives.
- Microsoft-backed mailbox sending and reply sync are not launch assumptions.
- [ADR-0006](./0006-use-google-gmail-send-only-for-launch-outreach.md) resolves the replacement path: Google sign-in, Gmail send-only delivery, and student-maintained reply state at launch.
- The hosted Supabase project needs the rollback migration applied after explicit approval.
