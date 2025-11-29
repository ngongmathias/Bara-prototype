# Desktop Navbar Improvements Needed

## Current Issues:
1. **Font size too small** - Text is hard to read
2. **Left side looks empty** - Logo on left, everything pushed to right
3. **Items pushed off screen** - Can't see all navigation items
4. **Breakpoint too large** - Desktop nav only shows at 2000px+ (min-[2000px])

## Recommended Changes:

### 1. Change Breakpoint
- **Current:** `hidden min-[2000px]:flex` (only shows at 2000px+)
- **Change to:** `hidden lg:flex` (shows at 1024px+)
- **Location:** Line 172 in `src/components/Header.tsx`

### 2. Increase Font Sizes
- **Current:** Default button size, no explicit font size
- **Change to:** 
  - Add `size="lg"` to all Button components
  - Add `className="text-base font-medium"` for 16px font
  - Increase icon size from `w-4 h-4` to `w-5 h-5`

### 3. Better Spacing
- **Current:** `space-x-3` (12px between items)
- **Optimal:** `space-x-2` (8px) with `px-4` on each button for better balance

### 4. Simplify Center Navigation
- **Keep in center:** Listings, Marketplace, Events, Advertise
- **Move to right:** User menu, Country selector, Language selector
- **Remove from center:** WriteReview, Admin (keep in mobile menu only)

### 5. Layout Structure
```
[Logo]  [---- Center Nav Items ----]  [User | Country | Language]
```

## Implementation Steps:
1. Change `min-[2000px]` to `lg` on line 172
2. Add `size="lg"` to all navigation Button components
3. Add `text-base font-medium px-4` to button classNames
4. Change icon sizes from `w-4 h-4 mr-1` to `w-5 h-5 mr-2`
5. Reorganize items: center nav vs right actions

## Files to Edit:
- `src/components/Header.tsx` (lines 171-377)

## Current State:
- Mobile navbar: ✅ Working well with scroller
- Desktop navbar: ⚠️ Needs improvement (too small, poor layout)
- Popup ads: ✅ Rounded corners on mobile
- Events page: ✅ Collapsible filters on mobile
