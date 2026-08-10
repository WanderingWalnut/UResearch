# Launch with university-bound professor discovery

## Status

Amended by [ADR-0006](./0006-use-google-gmail-send-only-for-launch-outreach.md)

At launch, a Student discovers and contacts Professors from the self-selected University of Calgary catalog. UResearch does not verify that the Student belongs to UCalgary or require a matching university email domain. The catalog boundary remains because the first reliable dataset is UCalgary Professor Profiles; it is a discovery scope, not an eligibility claim.

## Consequences

- The launch experience is simpler and easier to seed with high-quality data.
- Google-signed-in Students may select the UCalgary catalog without university email-domain validation.
- The data model should still allow future universities and cross-university outreach without rewriting core campaign concepts.
