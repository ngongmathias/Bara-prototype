# Redesign Roadmap - Black & White Chic Theme

## Overview
**Vision:** Investor-ready, chic, seamless black & white design with subtle animations and high-impact, low-noise enhancements.

**Rollout Strategy:** Small, shippable commits pushed incrementally to production. Confirm visibility on live Vercel site after each push before proceeding.

**Baseline Set for Immediate Rollout:**
- ✓ PageHeaderCard (unified search/filters/sort/count card)
- ✓ MatrixRain (green code rain effect globally behind all pages)
- ✓ Banner ads restyled (monochrome)
- Micro-interactions system (150–200ms transitions, black focus rings, hover lifts)
- Skeleton shimmers (monochrome loading states)
- Staggered reveal on scroll (IntersectionObserver-powered)
- Card hover magnetism (2–3px cursor follow)
- Typography & visual rhythm (invisible dividers, eyebrow labels)

**Optional "Wow" Extras (Choose 1-2 Early):**
1. Sticky Condensing Header Card
2. Right-Side Dot Progress Nav
3. Animated Counters/Sparklines
4. Subtle Grain Layer (2–3%)

---

## Completed ✓
- [x] Remove orange highlights and colored hero bars from homepage
- [x] Create `PageHeaderCard` shared component (title, search, filters, sort, results count)
- [x] Create `MatrixRain` global animation component (green code rain effect)
- [x] Mount `MatrixRain` globally behind all pages with white overlay (60% opacity)
- [x] Restyle banner ads to monochrome (TopBannerAd, BottomBannerAd)
- [x] Restyle ListingsPage with PageHeaderCard integration
- [x] Restyle MarketplacePage to monochrome with header card
- [x] Restyle EventsPage to black/white theme
- [x] Add SPA rewrite rules (vercel.json)
- [x] Add safe dev fallback for missing Supabase env vars

---

## Phase 0 (Current) - Global Tokens + Components
**Goal:** Build foundation system for all pages

### In Progress
- [ ] Insert PageHeaderCard at top of /listings (title+search only), non-destructive
  - Status: Testing deployment visibility

### Pending - High-Impact, Low-Noise Enhancements

#### Unified PageHeaderCard
- [ ] Refine PageHeaderCard component
  - One white card: title, search, filters, sort, result count
  - Subtle enter animation (y+fade 120ms)
  - Ensure consistent spacing and typography

#### Micro-Interactions System
- [ ] Implement across all interactive elements
  - Subtle hover lift (shadow only, no scale)
  - Focus ring in black (already in index.css, verify globally)
  - 150–200ms ease transitions on buttons, inputs, chips
  - Update all button/input components

#### Card Hover "Magnetism"
- [ ] Add to business/event/product cards
  - Cards lightly follow cursor by 2–3px
  - Clean black border accent on hover
  - Quick actions (call/website/map) gently appear
  - Smooth, performant transform

#### Staggered Reveal on Scroll
- [ ] IntersectionObserver-powered animations
  - Fade + translate (8–12px) for lists and grids
  - Stagger items by 25–40ms
  - No heavy parallax, keep it subtle
  - Apply to all grid/list views

#### Skeleton Shimmers
- [ ] Minimal monochrome shimmer placeholders
  - Update Skeleton component with premium shimmer
  - Apply to business cards, event cards, product cards
  - Show during loading states
  - Monochrome only (white/gray)

#### MatrixRain (Global Background)
- [x] Component created and mounted globally
- [x] White overlay (60% opacity) to lighten the effect
- [ ] Add per-page opacity controls (optional)
  - Default: 60% white overlay
  - Allow override per route if needed
  - Ensure respects `prefers-reduced-motion`

#### Banner Ads Restyle
- [x] Restyled to monochrome (TopBannerAd, BottomBannerAd)
- [ ] Verify integration
  - White card frames
  - Thin gray border
  - "Sponsored" label visible
  - Black CTA buttons

#### Typography and Visual Rhythm
- [ ] Editorial Typographic Hierarchy
  - Headlines: `font-comfortaa` in black, tightened letter-spacing
  - Body: `font-roboto` in dark gray, 1.65–1.75 line-height
  - Eyebrow labels (small uppercase) for section intros
  - Apply consistently across all pages

- [ ] Invisible Dividers
  - Replace lines with spacing groups (24/32/48px)
  - Use section "eyebrow" labels instead of visual dividers
  - Remove all colored dividing lines

---

## Phase 1 - Listings Page (Complete Integration)
**Goal:** Fully integrate all enhancements on Listings first

- [ ] **PageHeaderCard Integration**
  - Replace old search header completely
  - Integrate filters, sort, result count
  - Add enter animation (y+fade 120ms)

- [ ] **Refine Business Cards**
  - Apply card hover magnetism (2–3px cursor follow)
  - Black border accent on hover
  - Quick actions appear smoothly
  - Update all chips/badges to monochrome

- [ ] **Apply Micro-Interactions**
  - All buttons: hover lift (shadow only)
  - All inputs: 150–200ms transitions
  - Filter chips: smooth hover states

- [ ] **Skeleton Shimmers**
  - Show during business data loading
  - Monochrome shimmer animation

- [ ] **Staggered Reveal**
  - Business cards grid: fade+translate on scroll
  - 25–40ms stagger between items

- [ ] **Banner Ads**
  - Verify monochrome integration
  - Ensure seamless fit with new design

---

## Phase 2 - Marketplace Page
**Goal:** Apply same shell and enhancements

- [ ] **PageHeaderCard Shell**
  - Replace top bars with unified card
  - Search, filters, sort, count

- [ ] **Product Cards**
  - Unify to monochrome style
  - Apply card magnetism
  - Remove colored badges/pills
  - Staggered reveal on scroll

- [ ] **Micro-Interactions**
  - Apply system-wide to all buttons/inputs

---

## Phase 3 - Events Page
**Goal:** Same shell, refined event cards

- [ ] **PageHeaderCard Shell**
  - Replace existing header
  - Integrate search, filters, time filters

- [ ] **Event Cards**
  - Monochrome time pills (replace colored ones)
  - Card magnetism on hover
  - Refined black/white/gray styling
  - Staggered reveal

- [ ] **Micro-Interactions**
  - Apply to all interactive elements

---

## Phase 4 - Optional "Wow" Additions (Tasteful)
**Goal:** Add subtle, investor-grade animations and interactions

### Choose 1-2 to Include Early

- [ ] **Sticky Condensing Header Card**
  - PageHeaderCard softly compresses to slim toolbar on scroll down
  - Expands on scroll up
  - Smooth height transitions (200ms ease)
  - Maintains search/key actions in condensed state

- [ ] **Right-Side Dot Progress Nav** (for long pages)
  - Tiny vertical dot indicator
  - Auto-highlights current section
  - Minimal labels on hover
  - Smooth scroll on click
  - Aids orientation without clutter

- [ ] **Animated Counters and Sparklines**
  - For investor-centric pages/stats
  - Animated numeric counters (with accessibility)
  - Tiny monochrome sparklines for trends
  - SVG-based, minimal
  - Trigger on scroll into view

- [ ] **Subtle Grain Layer (2–3%)**
  - Very faint grain adds tactility to large white surfaces
  - Performant (CSS or static image)
  - Toggleable via user preference
  - Respects performance settings

---

## Phase 5 - Polish & Consistency
**Goal:** Editorial refinement and accessibility

- [ ] **Editorial typography/vertical rhythm**
  - Already defined in Phase 0, verify implementation
  - Headlines: `font-comfortaa` in black, tightened letter-spacing
  - Body: `font-roboto` in dark gray, 1.65–1.75 line-height
  - Tune spacing across all pages (24/32/48px groups)
  - Ensure consistent heading hierarchy
  - Refine font weights and sizes

- [ ] **Performance and Accessibility**
  - `prefers-reduced-motion` respected globally (already done for MatrixRain)
  - Canvas optimization for MatrixRain (smooth FPS on mobile)
  - High-contrast focus states (black rings)
  - ARIA labeling improved across interactive elements

- [ ] **User Settings/Toggles** (optional)
  - Overlay density/opacity per page
  - Animation intensity control
  - Grain texture on/off
  - Reduced motion override

- [ ] **Final QA**
  - Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Mobile responsiveness check (iOS, Android)
  - Performance audit (Lighthouse score 90+)
  - Accessibility audit (WCAG AA compliance)
  - Investor review and feedback

---

## Notes
- **Incremental deployment:** Push small, verifiable changes to production after each step
- **Confirm visibility:** Check live Vercel site after each push before proceeding
- **Monochrome palette:** Black, white, grays only (no orange, blue, yellow, etc.)
- **Investor-ready:** Chic, seamless, modern, minimal
