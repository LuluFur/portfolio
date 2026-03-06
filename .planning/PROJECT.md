# Portfolio Bug Fixes & Quality Pass

## Vision

Fix all identified bugs, HTML issues, performance problems, accessibility gaps, and SEO defects across lewiswhitham.com — without changing the visual design, adding new features, or breaking existing URLs.

## Context

Thorough code review of the portfolio (static HTML/CSS/JS site hosted on GitHub Pages) identified 10 concrete issues ranging from duplicate HTML tags to missing mobile navigation, broken social preview images, and unnecessary library loads on sub-pages. Each issue becomes a phase with further discovery of related problems in the same category.

## Requirements

### Validated

- Site renders correctly on desktop with SDF background, marquee, typewriter, and card transitions — existing
- 8 game project pages with consistent hero/article layout — existing
- Programs section with 3-column layout (Engines / Languages / Tools) — existing
- Contact section with copy-to-clipboard email and social links — existing
- Scroll animations via IntersectionObserver — existing
- Mobile SDF shader disabled for performance — existing

### Active

- [ ] Fix duplicate `<base>` tag in index.html
- [ ] Fix duplicate CSS declarations in style.css
- [ ] Fix duplicate JS comments in main.js
- [ ] Fix OG/Twitter image paths to absolute URLs for social previews
- [ ] Update copyright footer year
- [ ] Fix CTA button accessibility (inline onclick, missing labels)
- [ ] Add mobile navigation (hamburger toggle)
- [ ] Remove unnecessary p5.js CDN load from project pages
- [ ] Remove redundant HTML marquee duplicates (JS already clones)
- [ ] Add loading indicator or improve card-flip transition UX
- [ ] Discover and fix related issues in each category during phase execution

### Out of Scope

- Visual redesign — fixes only, no aesthetic changes
- New features — no new sections, animations, or functionality
- Content rewrites — don't change copy, descriptions, or project details
- Build tooling — no bundlers, frameworks, or build steps
- URL changes — preserve all existing page URLs

## Stack

- **Type:** Static HTML/CSS/JS
- **Hosting:** GitHub Pages (lewiswhitham.com)
- **No build step** — files served as-is
- **Key files:** index.html, assets/css/style.css, assets/js/main.js, assets/js/sdf_background.js
- **Sub-pages:** 9 project/sketch HTML pages sharing common CSS/JS

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Bug fixes prioritized over UX/SEO | User preference — fix broken things first | Phases ordered bugs-first |
| No visual redesign in scope | Preserve existing design language | Only fix, don't change aesthetics |
| No frameworks/bundlers | Site is static HTML, must stay that way | Pure HTML/CSS/JS fixes only |
| Preserve all URLs | Pages may be externally linked | No file renames or restructuring |
| YOLO mode | User prefers autonomous execution | Auto-approve at each step |
| Standard depth | Balanced discovery + execution | 3-5 tasks per phase |

---
*Last updated: 2026-03-06 after initialization*
