# UResearch web app

Next.js 16 / React 19. The landing page implements approved design iteration 04.

## Design system

Read [DESIGN.md](../DESIGN.md) before changing UI. Use [shared tokens](styles/tokens.css) and [React primitives](components/ui/primitives.tsx). View `/design-system` for component examples, states, and color roles. The [frozen design screens](../docs/design/README.md) preserve the approved reference for future workspace implementation.

**Brand:** `UResearch.` text wordmark only. **Theme:** white canvas, dark text, blue actions, small areas of semantic color. No decorative accent borders.

## Run and verify

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000` for the landing page and `http://localhost:3000/design-system` for the component reference.

```sh
pnpm test
pnpm lint
pnpm build
```

The public landing page, design reference, and fonts do not require a Supabase session. Other routes still use the existing session refresh; follow `.env.example` when working on app integration. Never commit `.env` files.

The demo uses fictional Professors and messages. It loops automatically while visible, pauses on hover or keyboard focus, and becomes static with reduced motion. The hero CTA joins the waitlist; the header action scrolls to the product demonstration. No email is read or sent by this page.

Inter and Hanken Grotesk are loaded through `next/font`. Material Symbols are self-hosted as a small subset under `public/fonts/`, with their license.

## Deployment

Vercel project `u-research` is connected to `WanderingWalnut/UResearch`. Its framework is Next.js and its repository root directory is `u-research`. Pushes to `main` build the live site; other branches receive previews. The checked-in `vercel.json` preserves framework detection. Keep preview credentials and local environment files out of source and deployment archives. The design-review Site is a separate historical artifact; Vercel serves the React implementation.
