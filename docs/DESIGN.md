# Kairos — Design System & UI Philosophy

## Overview

The web presence for Kairos is designed to feel like an authoritative, high-end developer tool. Taking inspiration from modern, developer-first platforms (like Better Auth, Vercel, and Linear), the aesthetic is built around **command-line precision**, **system-matching light & dark modes**, and **strict geometric grids**. It avoids the overly friendly, colorful SaaS look in favor of a sober, technical, and architectural aesthetic. 

What makes the system distinctive is its strict adherence to a monochromatic canvas (black, deep charcoal, white, and slate) violently interrupted by **Kairos Orange (`#FF5500`)**. The UI avoids decorative chrome, soft shadows, and rounding. Instead, structure is defined by 1px hairline borders, stark typography, and generous negative space. 

**Key Characteristics:**
- **System Theme Responsive (Default System):** Adapts instantly to system light/dark settings without layout flashes, and supports manual user override caching using a fast, inline `<head>` script.
- **Structural Frame Lines:** Continuous `position: fixed` vertical side lines flanking the centered `1200px` content width that slice clean through the navbar to the top of the browser viewport.
- **Offset Grid System:** Centered background grids (`40px 40px` size) offset by `top: 60px` to match the navbar height, ensuring the top row is never chopped or shortened.
- **High-Contrast Typography:** Monumental, tightly tracked display headlines using Space Grotesk against high-legibility, slightly monospaced body copy.
- **Sharp Geometry:** Zero border radius. All corners are completely sharp (`0px`), mirroring the geometric lines of the Kairos logo. No rounded corners anywhere in the system.
- **Abstract Technical Media:** Imagery relies on abstract, node-based system architecture diagrams (ReactFlow Engine), ASCII art, code blocks, or schematic diagrams rather than lifestyle photography.
- **Tactile but Flat:** No drop shadows. Depth is achieved purely through surface color changes and border boundaries.

---

## Colors & Themes

Kairos supports a unified color token system powered by CSS variables that shift seamlessly between Light Theme (Default) and Dark Theme (`html.dark`).

### Theme Variables

| Variable | Light Theme (Default) | Dark Theme (`html.dark`) | Purpose |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#000000` | Global background canvas |
| `--surface` | `#F9F9F9` | `#0A0A0A` | Default container/card fill |
| `--surface-hover` | `#F3F3F3` | `#141414` | Hover states and toolbar panels |
| `--border` | `#E4E4E7` | `#222225` | Hairline dividers and grid lines |
| `--text-primary` | `#09090B` | `#EDEDED` | Main text and headings |
| `--text-muted` | `#71717A` | `#88888B` | Metadata, badges, and secondary labels |
| `--orange` | `#FF5500` | `#FF5500` | Brand accent color |
| `--orange-wash` | `rgba(255, 85, 0, 0.05)` | `rgba(255, 85, 0, 0.08)` | Highlight washes for active/recommended states |
| `--orange-border` | `rgba(255, 85, 0, 0.25)` | `rgba(255, 85, 0, 0.35)` | Active borders and focus indicators |

### Brand & Accent
- **Kairos Orange** (`#FF5500`): The sole brand color. Used sparingly for primary CTA buttons, active state indicators, syntax highlighting accents, and the core logo. It should never be used as a large background fill except in highly specific hero media.
- **Core Black & White**: High contrast base. Backgrounds shift between dark (`#000000`) and light (`#FFFFFF`) with opposing high-contrast text rendering.

---

## Typography

The typography should feel like a hybrid between editorial design and an IDE.

### Font Family
- **Display & Body**: `Space Grotesk`. Clean, technical, geometric display sans-serif.
- **Technical & Labels**: `JetBrains Mono` or `Geist Mono`. Used heavily for UI labels, badges, code snippets, and structural metadata.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---:|---:|---:|---:|---|
| Hero Display | Space Grotesk | 72px–96px | 500/600 | 1.00 | -0.04em | Very tight tracking. Used for the main architectural claim. |
| Section Heading | Space Grotesk | 36px–48px | 500 | 1.10 | -0.02em | Used to introduce new grid sections. |
| Card Title | Space Grotesk | 20px–24px | 500 | 1.30 | -0.01em | Feature names or architectural steps. |
| Body | Space Grotesk | 15px–16px | 400 | 1.60 | 0 | Standard explanatory text. |
| Mono Label | Mono | 12px–13px | 400 | 1.40 | 0.05em | Uppercase. Used for "STEP 01", "CLI", small badges. |

### Principles
- Rely on weight and scale for hierarchy, never color (except for accent links/buttons).
- Display text should feel "carved" into the screen—tightly spaced and highly contrasting.
- Use Monospaced fonts liberally for non-body text (eyebrows, tags, dates, steps) to reinforce the developer-tool aesthetic.

---

## Layout & Architecture

### The Grid System
Kairos uses a highly visible grid system. Sections are not just floating in empty space; they are bounded by full-bleed 1px borders that intersect.
- **Bento/Grid Cards:** Feature lists should be displayed in strict grids where the borders of the cards touch, forming a continuous matrix.
- **Centered Hero Background Grid:** A `40px 40px` geometric grid aligned inside the `1200px` content column. It is offset at `top: 60px` to start exactly below the navbar, ensuring clean layout blocks.
- **Aesthetic Framing Lines:** Center-aligned vertical borders (`max-width: 1200px`) run fixed on the left and right sides of the viewport, cutting clean through the navbar. They are hidden on mobile viewports under `768px` to preserve screen clarity.
- **Asymmetry:** Allow for asymmetrical splits (e.g., a 1/3 text column on the left, a 2/3 interactive demo on the right) divided by a hard vertical rule.

### Whitespace Philosophy
Whitespace is used to isolate complexity. The conversational interface with the AI should be centrally focused, with massive margins on desktop. Density is reserved for the final output (the architectural diagrams and recommendation tables).

---

## Elevation & Depth (Flat UI)

Kairos is **strictly flat**. 

- **No Drop Shadows:** Do not use `box-shadow` to indicate elevation. 
- **Border-Driven:** A card is defined entirely by a 1px border (`var(--border)`) on the canvas. 
- **Hover States:** Hovering on a card does not lift it; it simply changes the surface background to `var(--surface-hover)` or shifts the border color slightly.

### Shape & Radius
- **Strictly 0px Border Radius:** No border-radius is allowed anywhere in the system. Every element—buttons, inputs, cards, dialogs, badges, and code boxes—has perfectly sharp, 90-degree corners.
- Pill shapes (`999px` radius) are completely forbidden. Buttons are rectangles.

---

## Components

### **`button-primary`**
Solid primary color (`var(--text-primary)`) background with opposing (`var(--bg)`) text, or solid `Kairos Orange` (`#FF5500`) with white text. `0px` radius (perfectly sharp). Compact padding. 
*Hover state:* Slightly dimmed (`opacity: 0.85` or light scale overlays).

### **`button-secondary`**
Transparent background, 1px Hairline border (`var(--border)`), `var(--text-primary)` text, `0px` radius.
*Hover state:* Surface dark fill (`var(--surface-hover)`).

### **`grid-card`**
A feature or output block. Surface fill (`var(--surface)`), surrounded by a 1px border. Perfect `0px` sharp corners. Often numbered using a Monospaced font in the top left corner (e.g., `01`, `02`) to enforce the structured feel.

### **`tech-badge`**
Small inline indicator for tech stack choices (e.g., "Next.js", "Hono"). Dark/light background, subtle border, mono text. `0px` sharp corners.
*Active state:* Orange border, Orange wash fill.

### **`chat-message-ai`**
The AI's message bubble. No chat bubble "tail". Just a sharp-cornered block (`0px` radius) with a subtle left-border highlight in Kairos Orange to indicate it is the system speaking.

### **`hero-media` (ReactFlow Engine)**
The interactive node-based system architecture diagram built with `@xyflow/react`. Features custom sharp-cornered node cards displaying official tech SVG icons (e.g., Hono, Next.js, Cloudflare, React, Supabase) and straight connection paths. Includes a bottom toolbar representing target profiles:
- **Managed SaaS**: Labeled with Supabase, Clerk, and Redis icons.
- **AWS**: Labeled with the AWS cloud icon.
- **GCP**: Labeled with the Google Cloud icon.

### **`brand-logo`**
A minimal geometric logo (`/public/logo.svg`) consisting of two smaller orange triangles and a large split chevron in brand orange (`#FF5500`). It aligns with the technical theme and has no rounded contours.

---

## Do's and Don'ts

### Do
- Use theme CSS variables (`var(--bg)`, `var(--surface)`) for all colors to support light/dark modes.
- Use 1px borders generously to structure information.
- Keep the UI incredibly stark. Let the text and the data be the focus.
- Use monospaced fonts for metadata, numbers, and UI labels.
- Make the Kairos Orange "pop" by keeping everything else desaturated.
- Keep all border-radius settings strictly at `0px`.
- ONLY use Material Design Icons (Sharp Variant) for any iconography throughout the application to maintain sharp, geometric, and curve-free structures.

### Don't
- Do not use gradients (except perhaps a subtle radial glow behind the hero media).
- Do not use drop shadows, soft glows, or glassmorphism.
- Do not use any rounded corners or pill-shaped buttons.
- Do not use playful, rounded, or heavily styled typography.
- Do not use lifestyle photography. 
- Do not use any icon library or variant that contains rounded, soft-cornered paths or contours.

---

*Kairos Design is about eliminating the noise so the architecture can speak for itself.*
