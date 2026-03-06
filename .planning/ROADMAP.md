# Roadmap — Portfolio Bug Fixes & Quality Pass

## v1.0 — Quality & Bug Fix Pass

Fix all 10 identified issues from code review, with discovery of related problems in each category.

### Phase 1: Duplicate HTML cleanup
**Issue #1, #2, #3** — Fix duplicate `<base>` tags, duplicate CSS declarations, duplicate JS comments, and scan all files for similar duplication issues.
- Research: No
- Scope: `index.html`, `assets/css/style.css`, `assets/js/main.js`, all `*.html`
- Done: Zero duplicate tags/declarations/comments across entire codebase

### Phase 2: Social preview & meta tags
**Issue #4** — Fix OG/Twitter image paths to absolute URLs. Discover and fix any other broken or missing meta tags across all pages.
- Research: No
- Scope: All `*.html` `<head>` sections
- Done: All social preview images use absolute URLs, all pages have complete OG/Twitter meta

### Phase 3: Footer & stale content
**Issue #5** — Update copyright year. Scan for any other outdated or stale hardcoded content across all pages.
- Research: No
- Scope: All `*.html` footer sections
- Done: Copyright current, no stale dates or content anywhere

### Phase 4: Accessibility — buttons & interactive elements
**Issue #6** — Replace inline `onclick` with event listeners, add proper ARIA labels. Audit all interactive elements for a11y gaps.
- Research: No
- Scope: `index.html`, `assets/js/main.js`, all `*.html`
- Done: No inline handlers, all interactive elements have ARIA labels, keyboard navigable

### Phase 5: Mobile navigation
**Issue #7** — Add hamburger menu toggle for mobile. Verify nav works across all pages and breakpoints.
- Research: Yes — check current CSS breakpoints and nav behavior on sub-pages
- Scope: `assets/css/style.css`, `assets/js/main.js`, all `*.html` nav elements
- Done: Nav fully functional on mobile with toggle, consistent across all pages

### Phase 6: Unnecessary library loads
**Issue #8** — Remove p5.js CDN from project pages that don't use it. Audit all pages for unused script/CSS includes.
- Research: Yes — check which pages actually use p5.js vs just loading it
- Scope: All `*.html` `<head>` script tags
- Done: No page loads scripts it doesn't use

### Phase 7: Marquee DOM optimization
**Issue #9** — Remove redundant HTML-duplicated marquee items since JS already clones them. Verify marquee still loops smoothly.
- Research: Yes — trace full marquee clone logic to ensure removal is safe
- Scope: `index.html` marquee section, `assets/js/main.js` MarqueeController
- Done: Single set of marquee items in HTML, JS handles all cloning, smooth loop preserved

### Phase 8: Page transition UX
**Issue #10** — Add visual feedback during the 1s card-flip navigation delay. Discover any other transition/loading UX gaps.
- Research: Yes — check all page transition paths (card click, back navigation, page entry)
- Scope: `assets/js/main.js`, `assets/css/style.css`
- Done: Users see loading feedback during transitions, no frozen-feeling moments

### Phase 9: Font loading & favicon
**Suggestions** — Add proper font loading for Space Grotesk (or remove the reference). Add favicon. Fix `user-select: none` on body.
- Research: Yes — check if Space Grotesk is actually rendering or falling back
- Scope: All `*.html` `<head>`, `assets/css/style.css`
- Done: Font loads explicitly or reference removed, favicon set, text selectable where appropriate

### Phase 10: Email handler conflict & final audit
**Suggestions** — Fix email contact element doing both mailto and copy-to-clipboard. Final sweep for any remaining issues.
- Research: No
- Scope: `index.html`, `assets/js/main.js`
- Done: Email click has single clear behavior, zero known issues remaining
