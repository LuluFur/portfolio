# Phase 2: Social Preview & Meta Tags

## Objective
Fix OG/Twitter image paths to absolute URLs on index.html. Add complete meta description, OG, and Twitter tags to all project pages so every page has proper social previews when shared.

## Execution Context
- **Branch:** `fix/social-meta-tags`
- **Files in scope:** All `*.html` files
- **Base URL:** `https://lewiswhitham.com/`
- **No build step** — files served as-is from GitHub Pages

## Context / Discovery Findings

### Current State
| Page | description | OG tags | Twitter tags | Image path |
|------|------------|---------|-------------|------------|
| index.html | Yes | Yes (complete) | Yes (complete) | RELATIVE (broken) |
| cube-defence.html | No | No | No | — |
| dashing-simulator.html | No | No | No | — |
| isosceles-invasion.html | No | No | No | — |
| math-cubed.html | No | No | No | — |
| sketches.html | No | No | No | — |
| slime-slasher.html | No | No | No | — |
| snek-solver.html | No | No | No | — |
| sustain-a-city.html | No | No | No | — |
| turret-defence.html | No | No | No | — |
| Dither-effect-example.html | No | No | No | — |

### Best OG Image per Page
| Page | Image file | Rationale |
|------|-----------|-----------|
| index.html | `neon-lit-portrait--t3chat--1.jpg` | Existing choice (portrait) |
| cube-defence.html | `Cube_Defence_Files/image-1764802740978.png` | Only available image |
| dashing-simulator.html | `Dashing_Simulator_Files/dash-sim-logo-cover-image.png` | Cover image (best preview) |
| isosceles-invasion.html | `Isosceles_Invasion_Files/image-1764803500445.png` | Only available image |
| math-cubed.html | `Math_Cubed_Files/image-1764803185994.png` | Only available image |
| sketches.html | `Snake_p5_sketch/snake-image.png` | Representative sketch image |
| slime-slasher.html | `Slime_Slasher_Files/image-1764803366175.png` | Only available image |
| snek-solver.html | `Snek_Solver_Files/Snek_Solver_Cover_Image.png` | Named as cover image |
| sustain-a-city.html | `Sustain_A_City_Files/SustainacityGameBackground.png` | Game background (best preview) |
| turret-defence.html | `Turret_Defence_Files/image-1764803419723.png` | Only available image |
| Dither-effect-example.html | `neon-lit-portrait--t3chat--1.jpg` | Fallback to portfolio image |

---

## Tasks

### Task 1: Fix index.html OG/Twitter image paths
**File:** `index.html`
1. Change `og:image` content from `neon-lit-portrait--t3chat--1.jpg` to `https://lewiswhitham.com/neon-lit-portrait--t3chat--1.jpg`
2. Change `twitter:image` content from `neon-lit-portrait--t3chat--1.jpg` to `https://lewiswhitham.com/neon-lit-portrait--t3chat--1.jpg`

### Task 2: Add meta tags to project pages
**Files:** `cube-defence.html`, `dashing-simulator.html`, `isosceles-invasion.html`, `math-cubed.html`, `slime-slasher.html`, `snek-solver.html`, `sustain-a-city.html`, `turret-defence.html`

For each file, add the following tags inside `<head>` after `<meta name="viewport">`:

```html
<meta name="description" content="{project-description}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://lewiswhitham.com/{page-filename}">
<meta property="og:title" content="{page-title}">
<meta property="og:description" content="{project-description}">
<meta property="og:image" content="https://lewiswhitham.com/{image-path}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://lewiswhitham.com/{page-filename}">
<meta property="twitter:title" content="{page-title}">
<meta property="twitter:description" content="{project-description}">
<meta property="twitter:image" content="https://lewiswhitham.com/{image-path}">
```

**Per-page values:**

| Page | title | description | image |
|------|-------|-------------|-------|
| cube-defence | Cube Defence — Lewis Whitham | A tower defence game built in Unity with C#. Place turrets, defend your base, and survive waves of enemies. | Cube_Defence_Files/image-1764802740978.png |
| dashing-simulator | Dashing Simulator — Lewis Whitham | A Roblox simulator game built with Luau. Dash through worlds, collect gems, and unlock new abilities. | Dashing_Simulator_Files/dash-sim-logo-cover-image.png |
| isosceles-invasion | Isosceles Invasion — Lewis Whitham | A geometric arcade shooter built in GameMaker. Defend against waves of triangle invaders. | Isosceles_Invasion_Files/image-1764803500445.png |
| math-cubed | Math Cubed — Lewis Whitham | An educational puzzle game combining math challenges with 3D cube mechanics. | Math_Cubed_Files/image-1764803185994.png |
| slime-slasher | Slime Slasher — Lewis Whitham | A fast-paced action game where you slash through hordes of slimes. | Slime_Slasher_Files/image-1764803366175.png |
| snek-solver | Snek Solver — Lewis Whitham | An isometric puzzle game built in Unity. Guide the snake to solve grid-based challenges. | Snek_Solver_Files/Snek_Solver_Cover_Image.png |
| sustain-a-city | Sustain a City — Lewis Whitham | A city-building simulation game focused on sustainability and resource management. | Sustain_A_City_Files/SustainacityGameBackground.png |
| turret-defence | Turret Defence — Lewis Whitham | A strategic turret placement game. Build defences and survive incoming enemy waves. | Turret_Defence_Files/image-1764803419723.png |

**Important:** Read each file's body content first to verify/improve the description — the descriptions above are reasonable defaults derived from project names and available context, but should be refined based on actual page content.

### Task 3: Add meta tags to sketches.html
**File:** `sketches.html`

Same pattern as Task 2:
- **title:** "p5.js Sketches — Lewis Whitham" (already the `<title>`)
- **description:** "Interactive p5.js sketches and creative coding experiments by Lewis Whitham."
- **image:** `https://lewiswhitham.com/Snake_p5_sketch/snake-image.png`
- **url:** `https://lewiswhitham.com/sketches.html`

### Task 4: Add meta tags to Dither-effect-example.html
**File:** `Dither-effect-example.html`

Same pattern:
- **title:** "Full Page Dither" (already the `<title>`)
- **description:** "A full-page dithering visual effect experiment by Lewis Whitham."
- **image:** `https://lewiswhitham.com/neon-lit-portrait--t3chat--1.jpg`
- **url:** `https://lewiswhitham.com/Dither-effect-example.html`

### Task 5: Verification
1. Grep all HTML files for `og:image` — every value must start with `https://`
2. Grep all HTML files for `twitter:image` — every value must start with `https://`
3. Grep all HTML files for `<meta name="description"` — every file except Dither-effect-example should have one
4. Count: 11 HTML files should have OG tags, 11 should have Twitter tags

---

## Verification Commands
```bash
# All OG images must be absolute URLs
grep -rn 'og:image' *.html | grep -v 'https://'

# All Twitter images must be absolute URLs
grep -rn 'twitter:image' *.html | grep -v 'https://'

# Count pages with description (should be 11)
grep -rl 'meta name="description"' *.html | wc -l

# Count pages with OG tags (should be 11)
grep -rl 'og:title' *.html | wc -l

# Count pages with Twitter tags (should be 11)
grep -rl 'twitter:title' *.html | wc -l
```

## Success Criteria
- All 11 HTML files have complete OG tags (type, url, title, description, image)
- All 11 HTML files have complete Twitter tags (card, url, title, description, image)
- All 10 non-demo pages have `<meta name="description">`
- All image paths are absolute URLs starting with `https://lewiswhitham.com/`
- Descriptions are accurate to actual page content (verified by reading body)
- No existing tags broken or duplicated

## Output
- All HTML files updated with social meta tags
- Commit: `fix(meta): add complete OG and Twitter meta tags to all pages`
