# Kairos — Design System & UI Philosophy

## Overview

The web presence for Kairos is designed to feel like an authoritative, high-end developer tool. Taking inspiration from modern, developer-first platforms (like Better Auth, Vercel, and Linear), the aesthetic is built around **command-line precision**, **dark mode by default**, and **strict geometric grids**. It avoids the overly friendly, colorful SaaS look in favor of a sober, technical, and architectural aesthetic. 

What makes the system distinctive is its strict adherence to a monochromatic canvas (black, deep charcoal, white, and slate) violently interrupted by **Kairos Orange (`#FF5500`)**. The UI avoids decorative chrome, soft shadows, and excessive rounding. Instead, structure is defined by 1px hairline borders, stark typography, and generous negative space. 

**Key Characteristics:**
- **Dark Mode Native:** Pure black backgrounds with deeply muted charcoal surfaces.
- **Strict Grids:** Features and sections are often divided by continuous 1px hairline borders, creating a structured, schematic feel.
- **High-Contrast Typography:** Monumental, tightly tracked display headlines against high-legibility, slightly monospaced body copy.
- **Sharp Geometry:** Minimal border radius. Corners are either completely sharp (`0px`) or micro-rounded (`4px`), mirroring the isometric blocks of the Kairos logo.
- **Abstract Technical Media:** Imagery relies on abstract, isometric 3D geometry (like the logo), ascii art, code blocks, or schematic diagrams rather than lifestyle photography.
- **Tactile but Flat:** No drop shadows. Depth is achieved purely through surface color changes and border boundaries.

---

## Colors

### Brand & Accent

- **Kairos Orange** (`#FF5500`): The sole brand color. Used sparingly for primary CTA buttons, active state indicators, syntax highlighting accents, and the core logo. It should never be used as a large background fill except in highly specific hero media.
- **Core Black** (`#000000`): The global background. Represents the infinite canvas.
- **Pure White** (`#FFFFFF`): Highest-contrast text (Headlines) and primary solid-fill buttons. 

### Surface & Background

- **Deep Charcoal** (`#0A0A0A` to `#111111`): Primary elevated surface color (e.g., inside feature cards or modal dialogs).
- **Subtle Surface** (`#18181B`): Hover states for interactive dark cards or secondary elevated areas.
- **Highlight Fill** (`rgba(255, 85, 0, 0.1)`): A 10% opacity orange wash used strictly for active selections or focus states.

### Text & Rules

- **Text Primary** (`#EDEDED`): Default body text.
- **Text Muted** (`#A1A1AA`): Secondary text, metadata, placeholders, and footer links.
- **Hairline Border** (`#27272A`): The structural glue of the UI. Used for card borders, section dividers, and the strict grid lines that separate content blocks.

---

## Typography

The typography should feel like a hybrid between editorial design and an IDE.

### Font Family

- **Display & Body**: `Geist` or `Inter`. Clean, technical, neutral neo-grotesque. 
- **Technical & Labels**: `Geist Mono` or `JetBrains Mono`. Used heavily for UI labels, badges, code snippets, and structural metadata.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---:|---:|---:|---:|---|
| Hero Display | Sans | 72px–96px | 500/600 | 1.00 | -0.04em | Very tight tracking. Used for the main architectural claim. |
| Section Heading | Sans | 36px–48px | 500 | 1.10 | -0.02em | Used to introduce new grid sections. |
| Card Title | Sans | 20px–24px | 500 | 1.30 | -0.01em | Feature names or architectural steps. |
| Body | Sans | 15px–16px | 400 | 1.60 | 0 | Standard explanatory text. |
| Mono Label | Mono | 12px–13px | 400 | 1.40 | 0.05em | Uppercase. Used for "STEP 01", "CLI", small badges. |

### Principles
- Rely on weight and scale for hierarchy, never color (except for hyperlinks).
- Display text should feel "carved" into the screen—tightly spaced and highly contrasting.
- Use Monospaced fonts liberally for non-body text (eyebrows, tags, dates, steps) to reinforce the developer-tool aesthetic.

---

## Layout & Architecture

### The Grid System
Kairos uses a highly visible grid system. Sections are not just floating in empty space; they are bounded by full-bleed 1px borders that intersect. 
- **Bento/Grid Cards:** Feature lists should be displayed in strict grids where the borders of the cards touch, forming a continuous matrix.
- **Asymmetry:** Allow for asymmetrical splits (e.g., a 1/3 text column on the left, a 2/3 interactive demo on the right) divided by a hard vertical rule.

### Whitespace Philosophy
Whitespace is used to isolate complexity. The conversational interface with the AI should be centrally focused, with massive margins on desktop. Density is reserved for the final output (the architectural diagrams and recommendation tables).

---

## Elevation & Depth (Flat UI)

Kairos is **strictly flat**. 

- **No Drop Shadows:** Do not use `box-shadow` to indicate elevation. 
- **Border-Driven:** A card is defined entirely by a 1px `#27272A` border on a black canvas. 
- **Hover States:** Hovering on a card does not lift it; it simply lightens the surface background (from `#0A0A0A` to `#18181B`) or shifts the border color slightly.

### Shape & Radius
- **Micro-Rounding Only:** The maximum border radius in the system is `4px` or `6px`. 
- **Sharp Corners (`0px`)** are encouraged for major layout divisions, echoing the strict, blocky nature of the isometric logo.
- Pill shapes (`999px` radius) are completely forbidden. Buttons are rectangles.

---

## Components

### **`button-primary`**
Solid White (`#FFFFFF`) background, Black text. `4px` radius. Compact padding. 
*Hover state:* Slightly dimmed (`#E5E5E5`). 
*Alternative:* Solid Kairos Orange (`#FF5500`) with White text for the absolute most critical action (e.g., "Generate Stack").

### **`button-secondary`**
Transparent background, 1px Hairline border, White text.
*Hover state:* Surface dark fill (`#18181B`).

### **`grid-card`**
A feature or output block. Dark charcoal fill (`#0A0A0A`), surrounded by a 1px border. Often numbered using a Monospaced font in the top left corner (e.g., `01`, `02`) to enforce the structured feel.

### **`tech-badge`**
Small inline indicator for tech stack choices (e.g., "Next.js", "Postgres"). Dark background, subtle border, mono text. 
*Active state:* Orange border, 10% Orange fill.

### **`chat-message-ai`**
The AI's message bubble. No chat bubble "tail". Just a sharp-cornered block with a subtle left-border highlight in Kairos Orange to indicate it is the system speaking.

### **`hero-media`**
The abstract isometric logo (rendered as an SVG or high-res texture) floating in the dark void. Consider adding subtle, high-frequency noise/grain to the background or media to give it a tactile, hardware-like feel.

---

## Do's and Don'ts

### Do
- Use pure Black (`#000000`) for the main background.
- Use 1px borders generously to structure information.
- Keep the UI incredibly stark. Let the text and the data be the focus.
- Use monospaced fonts for metadata, numbers, and UI labels.
- Make the Kairos Orange "pop" by keeping everything else desaturated.

### Don't
- Do not use gradients (except perhaps a subtle radial glow behind the hero media).
- Do not use drop shadows, soft glows, or glassmorphism.
- Do not use large border radii or pill-shaped buttons.
- Do not use playful, rounded, or heavily styled typography.
- Do not use lifestyle photography. 

---

*Kairos Design is about eliminating the noise so the architecture can speak for itself.*
