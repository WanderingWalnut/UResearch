# Use managed outbound sender for launch outreach

## Status

Superseded by [ADR-0006](./0006-use-google-gmail-send-only-for-launch-outreach.md)

This ADR is retained as historical context only. Do not implement this managed-sender approach for launch. The current launch decision is Google sign-in plus Gmail send-only OAuth from the Student's connected Gmail mailbox.

The superseded decision was: UResearch would send approved initial Outreach Campaign emails through a managed outbound email provider rather than requiring Students to compose every message manually or granting Microsoft Graph mailbox access. That plan kept bulk outreach usable without a University of Calgary tenant-admin approval dependency, but it made professor-facing email come from a generic UResearch-controlled sender instead of the Student's own mailbox.

## Considered Options

- Continue with delegated Microsoft Graph send and mailbox permissions.
- Hand off every message to Outlook for manual student sending.
- Send approved Campaign Messages through a UResearch-managed outbound sender with `Reply-To` set to the Student's verified university email.

## Consequences

- Superseded by the Gmail send-only launch path.
- Send lifecycle tracking still exists, but delivery is through the connected Gmail mailbox.
- Professor replies land in the connected Gmail mailbox, which UResearch does not read or sync at launch.
