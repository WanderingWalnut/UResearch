# Iteration 04 implementation review

Reviewed 5 September 2026. The accepted design uses the UResearch. text wordmark with no separate logo.

## Scope

- Shared tokens and native React primitives in `u-research/styles` and `u-research/components/ui`.
- React landing page and `/design-system` gallery.
- Public-route session-refresh exclusions for the landing page, gallery, and font assets.
- Frozen approved HTML reference in this directory; no Gmail application implementation.

## Verification

- Four tests passed across three files: existing configuration checks, public-route matching, and the demo lifecycle.
- Demo test covers autoplay, a full loop, hover/focus pause, persistent keyboard pause, off-screen/background pause, reduced-motion changes, no clickable illustration tiles, and timer cleanup.
- ESLint, TypeScript, and Next.js production build passed. Landing and gallery prerender as static pages.
- Browser checked at 320px, 390px, 768px, and 1280px. No horizontal page overflow. Corrected message spacing keeps the sent confirmation within the demo frame.
- Independent correctness/accessibility review has no remaining findings. Independent Ponytail review concluded “Lean already. Ship.” Retired Motion components, unused motion tokens/dependency, and a duplicate mobile rule were removed.

## Deliberate limits

Landing actions scroll to the product demonstration until onboarding and discovery routes exist. All demo messages are fictional. There is no live Gmail connection or email sending here. React ViewTransition was audited and deferred because this page has no route transitions, Suspense loading, or list reordering; the continuous illustration uses CSS transitions.

The final refinement removes the visible playback button and “Illustrative demo” footer label. A native pause checkbox appears during keyboard navigation and persists the pause after focus leaves. The independent reviewer rechecked this refinement with no remaining findings.

## Cursor alignment refinement

The illustrative cursor now measures its card, composer, and Send reply targets after layout changes. Composing, sending, and confirmation have separate scenes. Cursor alignment was checked at 320, 390, 768, and 1280 pixels; Send reply had no measured positioning error or page overflow. The 320-pixel sent confirmation fits inside the frame. Tests cover target remeasurement and the full six-scene loop. Tests, lint, production build, and independent correctness/Ponytail review passed.

The follow-up restores the solid blue cursor with a thin white edge for contrast over blue controls. It remains visible in all six scenes, travels through a measured reading target, and returns visibly to the board. Reply text fades in after cursor arrival; confirmation fades in over 160ms. Reduced motion keeps a static cursor. Browser checks confirmed opacity 1 and cursor bounds inside the phone canvas in all six scenes. Tests, lint, build, and independent review passed.
