# Phase 1: Duplicate HTML / CSS / JS Cleanup

## Objective
Eliminate all duplicate tags, declarations, comments, and redundant code across the entire codebase. Zero duplication when done.

## Execution Context
- **Branch:** `fix/duplicate-cleanup`
- **Files in scope:** `index.html`, `assets/css/style.css`, `assets/js/main.js`
- **Files out of scope:** All other `*.html` (confirmed clean), `assets/js/sdf_background.js` (confirmed clean)
- **No build step** — changes are live on save

## Context / Discovery Findings

### HTML Duplicates
| File | Line(s) | Issue |
|------|---------|-------|
| `index.html` | 29-30 | Duplicate `<base href="./">` tag — remove one |

### CSS Duplicates (`assets/css/style.css`)
| Line(s) | Selector | Issue |
|---------|----------|-------|
| 36-37 | `body` | Duplicate `background-color: #13141f;` — remove one |
| 141 vs 150 | `.eyebrow` | Conflicting `display: block` then `display: flex` — keep `flex` (it's the intended layout) |
| 570-571 | `.cta-btn .icon` | Duplicate `width: 1.2rem;` — remove one |
| 79 vs 252 | `.content-wrapper` | Split across two blocks — consolidate into one |
| 589 vs 699 | `.logo-marquee` | Two rule blocks with conflicting `max-width` and `mask-image` values — consolidate (keep line 699 values as they're the latest/optimized version) |
| 175/1440/1492/1608 | `.asset-item` | Four separate definitions — consolidate into one block + media queries |
| 199 vs 223 | `.asset-item::after` | Two definitions — consolidate |
| 1485 vs 1602 | `.gallery-grid` | Two definitions with different column values — consolidate |
| 107 vs 1997 | `.project-article` | Two definitions — consolidate |
| 1524 vs 1639 | `.asset-body` | Two identical definitions — consolidate |
| 1528 vs 1643 | `.asset-title` | Two definitions with different values — consolidate |
| 1502 vs 1617 | `.asset-thumb` | Two definitions with different values — consolidate |

### JS Duplicates (`assets/js/main.js`)
| Line(s) | Issue |
|---------|-------|
| 5 vs 7 | Duplicate `// Page Load Flow` comment — remove one |
| 367-372 | Back-to-back section headers (MARQUEE CONTROLLER then PARTICLE SYSTEM) — the MARQUEE CONTROLLER header is orphaned (ParticleSystem class follows). Remove the orphaned header |
| 515-522 | Identical `forEach` clone loop repeated twice — intentional (creates 2 extra copies for 3x total). Refactor to `for` loop with count, but preserve behavior |
| 684-688 vs 741-745 | Identical C# filter conditional — extract to a helper method on the class |

---

## Tasks

### Task 1: Fix HTML duplicate
**File:** `index.html`
1. Remove duplicate `<base href="./">` on line 30 (keep line 29)
2. Verify only one `<base>` tag remains

### Task 2: Fix CSS duplicate declarations within rule blocks
**File:** `assets/css/style.css`
1. Remove duplicate `background-color: #13141f;` (line 37)
2. Remove the first `display: block;` from `.eyebrow` (line 141), keeping `display: flex;` (line 150)
3. Remove duplicate `width: 1.2rem;` from `.cta-btn .icon` (line 571)

### Task 3: Consolidate duplicate CSS rule selectors
**File:** `assets/css/style.css`

Consolidate these split selectors — merge properties into the **first** occurrence and delete the later duplicate block, unless the later block is inside a media query (in which case leave it as a responsive override):

1. `.content-wrapper` (lines 79 and 252) — merge into one block
2. `.logo-marquee` (lines 589 and 699) — the later block (699) has the optimized values; merge there and remove the earlier block
3. `.asset-item` (lines 175, 1440, 1492, 1608) — determine which are base vs responsive/page-specific, consolidate
4. `.asset-item::after` (lines 199 and 223) — merge into one
5. `.gallery-grid` (lines 1485 and 1602) — consolidate
6. `.project-article` (lines 107 and 1997) — consolidate
7. `.asset-body` (lines 1524 and 1639) — consolidate (identical)
8. `.asset-title` (lines 1528 and 1643) — consolidate (keep latest values)
9. `.asset-thumb` (lines 1502 and 1617) — consolidate

**Approach:** Read each pair carefully. If both are in the same scope (not one in a media query), merge. If one is a media query override, leave it. Avoid breaking any existing visual behavior.

### Task 4: Fix JS duplicate comments and orphaned header
**File:** `assets/js/main.js`
1. Remove duplicate `// Page Load Flow` comment (line 7)
2. Remove orphaned `// MARQUEE CONTROLLER` section header block (lines 367-369) — the real MarqueeController class starts at line 483 with its own JSDoc header. The ParticleSystem class follows immediately after line 372.

### Task 5: Refactor JS duplicate clone loop
**File:** `assets/js/main.js`
1. Replace the two identical `this.items.forEach(...)` clone loops (lines 515-522) with a single loop that runs twice:
   ```js
   for (let c = 0; c < 2; c++) {
     this.items.forEach(item => {
       this.track.appendChild(item.cloneNode(true));
     });
   }
   ```
2. Verify marquee still has 3 sets of items (1 original + 2 clones)

### Task 6: Extract JS duplicate filter logic
**File:** `assets/js/main.js`
1. Extract the repeated C# filter conditional into a class method on `MarqueeController`:
   ```js
   getWhiteFilter(item) {
     return item.alt === "C#"
       ? 'grayscale(100%) brightness(500%) drop-shadow(0 0 0 rgba(0,0,0,0))'
       : 'brightness(0) invert(1) drop-shadow(0 0 0 rgba(0,0,0,0))';
   }
   ```
2. Replace both occurrences (lines ~684-688 and ~741-745) with calls to `this.getWhiteFilter(originalItem)`

### Task 7: Verification
1. Open `index.html` in browser — verify page renders correctly
2. Verify marquee scrolls and pops correctly
3. Grep for remaining duplicate patterns:
   - `grep -c '<base' index.html` should return 1
   - No consecutive identical lines in CSS
   - No consecutive identical comments in JS
4. Run a final scan: no selector appears more than once outside of media queries

---

## Verification Commands
```bash
# Duplicate base tags (should return 1)
grep -c '<base' index.html

# Duplicate background-color in body (should return 1)
grep -c 'background-color: #13141f' assets/css/style.css

# Duplicate "Page Load Flow" (should return 1)
grep -c 'Page Load Flow' assets/js/main.js

# Orphaned MARQUEE CONTROLLER header before ParticleSystem (should return 0)
grep -c 'MARQUEE CONTROLLER - JS Driven' assets/js/main.js
```

## Success Criteria
- Zero duplicate HTML tags across all files
- Zero duplicate CSS property declarations within same rule block
- No CSS selector appears in multiple non-media-query blocks
- Zero duplicate/orphaned JS comments
- No copy-paste code blocks in JS (clone loop and filter logic refactored)
- Site renders identically to before changes (visual regression = zero)

## Output
- Clean codebase with all duplication removed
- Commit: `fix(cleanup): remove duplicate HTML tags, CSS declarations, and JS comments`
