# Progressive Photo Reveal

## Where to change thresholds

Update the thresholds only in `mobile/src/presentation/photoReveal/config.ts` (Level 1–5 at 10, 15, 20, 25, 30 messages). This is the single source of truth for reveal progression.

## Reveal levels (visual progression)

These levels are implemented in `mobile/src/presentation/components/RevealPhoto.tsx`:

- **Level 1**: True grayscale + very strong blur (silhouette only).
- **Level 2**: Grayscale + strong blur (orientation barely visible).
- **Level 3**: Color enabled + strong blur (features still hidden).
- **Level 4**: Color + light blur (mostly visible).
- **Level 5**: No filters (fully sharp).

## Important constraints

This feature is UI-only and read-only. Do not touch chat engine logic, message send/receive, backend logic, or the ConversationScreen implementation.
