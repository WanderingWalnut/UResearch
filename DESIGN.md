---
name: Deep Intelligence
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#45474b'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#76777b'
  outline-variant: '#c6c6cb'
  surface-tint: '#5c5e64'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#191c21'
  on-primary-container: '#81848a'
  inverse-primary: '#c4c6cd'
  secondary: '#0050cc'
  on-secondary: '#ffffff'
  secondary-container: '#0266ff'
  on-secondary-container: '#f9f7ff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00210f'
  on-tertiary-container: '#519168'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e2e9'
  primary-fixed-dim: '#c4c6cd'
  on-primary-fixed: '#191c21'
  on-primary-fixed-variant: '#44474d'
  secondary-fixed: '#dae1ff'
  secondary-fixed-dim: '#b3c5ff'
  on-secondary-fixed: '#001849'
  on-secondary-fixed-variant: '#003fa4'
  tertiary-fixed: '#aef2c2'
  tertiary-fixed-dim: '#93d5a8'
  on-tertiary-fixed: '#00210f'
  on-tertiary-fixed-variant: '#0a522f'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
  surface-main: '#FFFFFF'
  surface-neutral: '#F9F9F7'
  ink-primary: '#12151A'
  ink-secondary: '#636C7A'
  accent-blue: '#0066FF'
  accent-green: '#1C5E3A'
  border-subtle: '#E5E7EB'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style
The design system is engineered for high-density data environments, prioritizing clarity, precision, and a sense of "quiet power." It draws inspiration from modern enterprise productivity tools, blending a **Corporate/Modern** foundation with **Minimalist** restraint. The brand personality is professional, authoritative, and data-centric, designed to make complex research feel manageable and organized.

The aesthetic utilizes expansive whitespace, crisp edges, and a focused color palette to reduce cognitive load. Subtle depth cues and high-quality typography ensure that even the most information-dense screens remain legible and approachable for power users.

## Colors
This design system uses a sophisticated "Deep Navy and Crisp White" palette. 

- **Primary:** A deep, near-black navy (`#12151A`) used for text, iconography, and primary brand elements to establish authority.
- **Secondary:** A vibrant, digital blue (`#0066FF`) reserved for primary actions, progress indicators, and interactive highlights.
- **Tertiary:** A refined forest green (`#1C5E3A`) used specifically for success states and data points representing growth or completion.
- **Neutral:** A warm, off-white (`#F9F9F7`) serves as the background foundation, reducing the harshness of pure white while maintaining a clean appearance.

Color application should be sparse, using the vibrant blue only to guide the user's eye toward critical interactions.

## Typography
The typography strategy balances modern aesthetics with technical precision. 

- **Headlines:** Uses **Hanken Grotesk** for its sharp, contemporary feel. Larger sizes use tighter letter-spacing to appear more cohesive.
- **Body:** Uses **Inter** for its exceptional legibility in data-heavy environments. Standard body text is set to 14px to optimize information density without sacrificing readability.
- **Labels:** Uses **JetBrains Mono** for metadata, IDs, and technical data points. The monospaced nature helps users quickly scan and compare alphanumeric research strings.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Content is contained within a max-width of 1440px for desktop viewing to prevent line lengths from becoming unreadable.

- **Grid:** A 12-column system is used for dashboards, while a sidebar-main configuration is preferred for research workspaces.
- **Rhythm:** An 8px base grid governs all spatial relationships.
- **Density:** High-density views (tables/lists) use 8px internal padding, while marketing or landing pages use 16-24px padding to create a more premium, airy feel.
- **Reflow:** On mobile, columns collapse to a single stack with 16px side margins. Sidebars transition to bottom-sheet navigation or hidden drawers.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surface Tiers:** The base background is neutral (`#F9F9F7`). Primary cards and containers use pure white (`#FFFFFF`) with a 1px subtle border (`#E5E7EB`).
- **Shadows:** Only used to indicate interactivity or temporary overlay. Use a single "Ambient Shadow": `0 4px 12px rgba(0, 0, 0, 0.05)`.
- **Floating Elements:** Modals and dropdowns receive a more pronounced shadow and a slightly thicker border to separate them from the underlying data grid.

## Shapes
This design system utilizes a **Soft** shape language. 

- **Base Radius:** 4px (0.25rem) for inputs, buttons, and small components. This retains a technical, precise feel.
- **Large Radius:** 8px (0.5rem) for cards and main content containers.
- **Pill:** Reserved exclusively for status tags and chips to provide a clear visual contrast against rectangular data fields.

## Components
- **Buttons:** Primary buttons are Solid Navy (`#12151A`) with white text. Secondary buttons are White with a 1px border. Interactions use a subtle opacity shift (90%) on hover.
- **Input Fields:** Use 14px text with 8px internal padding. Focus state is a 1px blue border with a faint 2px blue outer glow.
- **Cards:** White background, subtle border, no shadow unless hovered. Used to group research modules or data summaries.
- **Chips/Tags:** Small, pill-shaped elements. Use light-tinted backgrounds (e.g., 10% blue) with high-contrast text for categorization.
- **Data Tables:** The core of the system. Use "Zebra striping" with `#F9F9F7` and horizontal borders only. Header rows use `label-md` typography.
- **Navigation:** Vertical sidebar using `body-md` weight. Active states are indicated by a 2px blue vertical bar on the left edge.