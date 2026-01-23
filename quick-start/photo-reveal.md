# Progressive Photo Reveal

## Where to change thresholds

Update the thresholds only in `mobile/src/presentation/photoReveal/config.ts` (Level 1–5 at 10, 15, 20, 25, 30 messages). This is the single source of truth for reveal progression.

## Important constraints

This feature is UI-only and read-only. Do not touch chat engine logic, message send/receive, backend logic, or the ConversationScreen implementation.
