# UResearch design system

**Approved:** iteration 04, 5 September 2026. This file replaces the earlier “Deep Intelligence” exploration. The approved brand is the text **UResearch.** with a blue period. No separate logo, pictorial brand mark, or alternate name.

## Source of truth

1. [Shared CSS tokens](u-research/styles/tokens.css) define production color, spacing, type, shape, and timing values.
2. [Reusable React components](u-research/components/ui/primitives.tsx) own repeated UI appearance and native semantics. Their [CSS Module](u-research/components/ui/primitives.module.css) uses those tokens.
3. `/design-system` is the live component reference in the app. Check component changes here and on the landing page before accepting them.
4. [Frozen iteration 04 screens](docs/design/iteration-04/index.html) preserve the approved visual direction across pages. These are illustrative HTML, not application implementation. The original review remains [online](https://uresearch-design-review.wanderingwalnut.chatgpt.site/?revision=4#landing).

Change tokens before adding page-specific overrides. Change a shared component before copying its markup. Do not copy the reference prototype's layered CSS into production. Root CONTEXT.md and docs/adr/ govern behavior; a mockup does not override them.

## Visual principles

- White is the main canvas. Use dark text and neutral separators. Small areas of color provide contrast: status labels, avatars, navigation selection, Template Variables, and relevant message highlights.
- Keep the accepted Hanken Grotesk headings and Inter body text. Do not use a monospace font for ordinary labels.
- Keep cards compact. Show the Professor, a short subject or research focus, and one useful activity detail. Open the full Outreach Thread for the conversation. Do not show unexplained match percentages.
- No decorative accent borders: no colored top edge, side stripe, inset accent shadow, or accent outline on selected navigation. A soft selection fill and stronger text are sufficient. Keyboard focus rings remain required.
- Use one Material Symbols Outlined icon family. Icons assist navigation or meaning; they are not decoration beside every button. Keep visible labels on primary actions.

## Color roles

The tokens file is the exact value authority. Do not maintain a second theme configuration in JavaScript.

| Role | Token | Use |
| --- | --- | --- |
| White canvas / surface | `--canvas`, `--surface` | Main page and cards |
| Subtle surface / lane | `--surface-subtle`, `--surface-lane` | Sidebar and board grouping |
| Text / secondary text | `--ink`, `--muted` | Main content and supporting detail |
| Neutral separator | `--border` | 1px structural divisions |
| Blue action | `--action`, `--action-hover` | Primary action and hover |
| Selection | `--selection`, `--selection-ink` | Active item; no accent border |
| Sent / Opened / Replied | `--sent-*`, `--opened-*`, `--replied-*` | Small labels with text, never color alone |
| Success / warning / error | `--success-*`, `--warning-*`, `--danger-*` | Meaningful feedback with a written explanation |
| Template Variable | `--variable-*` | Readable resolved-value placeholder |
| Search highlight | `--search-highlight*` | Relevant phrase in discovery results |
| Avatar tones | `--avatar-*` | Distinguish people; no status meaning |

## Typography, density, and shape

Headings and wordmark: Hanken Grotesk. Body and labels: Inter. Fonts are loaded once in the root layout. Main text is 14–16px with 1.5–1.55 line height. Captions are 12px. The landing headline is 52px on desktop and 36px on phones, with tight tracking and 1.13 line height. Small text inside the illustrative demo may be 9–12px; this is not the minimum size for real forms or email reading.

Use the 4px spacing scale: 4, 8, 12, 16, 20, 24, 32, 48, 64. Desktop landing content is at most 1120px. Phones use 16–20px page margins. Preserve compact row spacing; do not inflate cards to fill the viewport. At narrow widths, simplify the product illustration without hiding access to actual application content.

Use 6px control radii, 8px cards, 12px enclosing demo panels, and 5px labels. Use subtle neutral borders. The landing demo has a soft shadow; normal data cards do not need raised shadows.

## Reusable component contract

| Component | Contract |
| --- | --- |
| `Wordmark` | Text only, blue period. Wrap in a normal home link where navigation is needed. |
| `Button` | Native button; defaults to `type="button"`. `primary`, `secondary`, or `ghost`. Uses native disabled state. |
| `ActionLink` | Native anchor styled like a button. Use for navigation, never fake a disabled link. |
| `Icon` | Fixed supported names from the self-hosted Material Symbols subset. Decorative and hidden from assistive technology; parent provides its label. |
| `Avatar` | Small initials block, four approved tones. Adjacent visible Professor name supplies identity. |
| `StatusBadge` | Sent, Opened, or Replied text with a soft semantic fill. |
| `TemplateVariable` | Inline blue fill and readable text; no border or raw template syntax. |

Use native input, textarea, select, and dialog semantics when those controls are implemented. Do not build a second component framework or a speculative form engine. Add shared components when actual pages require them; show new states on `/design-system`. Base UI remains the preferred candidate when a complex accessible control exceeds native capabilities; this landing page does not need it installed.

## Page and flow rules

- Sidebar groups: Search, Outreach, Account. Settings stays at the bottom. Use soft active-item fill and the shared icon family.
- Do not repeat a large page title and subtitle when the navigation already supplies the location. Keep record titles and headings that explain real content. Maintain a meaningful accessible page heading.
- Outreach Board cards open a full conversation view with a clear return path, not a popup.
- Conversations prioritize the thread list, full inbound/outbound email exchange, and reply composer. No marketing heading above the inbox. Gmail functionality follows ADR-0007 and is not implemented by this landing page.
- Campaign editor retains readable variables and preview. Review may use a dialog that returns to editing without losing work.
- Landing copy is university-neutral; do not claim every University catalog is available. No unverified scores, university affiliation banner, or repeated feature-summary tiles.

## Motion and accessibility

The product demonstration starts automatically, cycles through board → selection → Professor reply → Student reply → sent confirmation, then repeats. Its tiles and simulated cursor are an illustration, not controls. Label the sample clearly. No visible playback button or “Illustrative demo” footer label. Pause on hover or keyboard focus; resume when neither is present. Make the demonstration focusable and explain pause behavior in its accessible description. A native Pause animation checkbox, revealed only on keyboard focus, lets keyboard and assistive-technology readers persist the pause after leaving the demo. Do not gate playback behind a Play button.

Pause the timer when off-screen or when the document is hidden. Reduced motion shows a useful static conversation, with no cursor movement or autoplay. Do not announce every automatic scene to a screen reader; provide a stable summary. Always clean up timers and listeners.

Use 160–180ms UI reveals and a 650ms simulated cursor move. Keep the rest of the page still. The React View Transitions audit found only same-page anchors, no route changes, Suspense loading, or list reordering. CSS is sufficient for this continuous illustration. Revisit React ViewTransition when real list→detail navigation is implemented; do not enable experimental route behavior solely for the demo.

All controls require visible keyboard focus, meaningful accessible names, and native semantics. Focus rings are not decorative accent borders. Text must meet WCAG AA contrast. Do not rely only on color. Ensure no horizontal page overflow at 320px, 390px, 768px, and desktop widths. Keyboard interaction and reduced motion are part of acceptance, not optional polish.

## Change and verification process

1. Update tokens or the smallest shared component; keep page composition in its own CSS Module.
2. Check `/design-system` and the affected page at phone and desktop widths. Compare with the frozen iteration 04 reference.
3. Run the existing test, lint, and build commands. Keep one focused interaction test for autoplay, pause/resume, visibility, and reduced motion.
4. Complete independent correctness/accessibility review and a separate Ponytail complexity review. Fix findings and re-review changed areas.

A new palette, font, logo, or navigation pattern requires a new design review. Routine use of the existing system does not.

## Sources and provenance

- [Notion homepage](https://www.notion.com/), inspected 5 September 2026: white page, dark headings, localized colored labels/icons and automated product demonstrations. Inspiration only; no Notion assets were copied.
- [Original Stitch project](https://stitch.withgoogle.com/projects/13233268902123685858): original blue actions, grouped navigation, and compact data presentation. Iteration 04 plus the wordmark decision is the approved set; older variants are historical.
- [Material Symbols](https://fonts.google.com/icons): Outlined, 20px optical size, weight 400, unfilled. Local subset and Apache 2.0 license live in `u-research/public/fonts/`.
- Local skills: Ponytail, Ponytail Review, Vercel React Best Practices, and React View Transitions. Use the audit findings above instead of adding unused animation infrastructure.
