# NovaCart AI — Design System (Phase 4)

Lean by design — this is a token spec meant to be pasted almost directly into `tailwind.config.ts` in Phase 5, not a standalone artifact. Full component-level detail gets filled in as each page is actually built (Phase 18, per-slice).

## Color

Avoiding default-Tailwind-blue and marketplace clichés (Amazon orange, Flipkart blue) — an indigo/violet primary reads as "AI/tech," paired with a warm amber accent for CTAs and an emerald/rose/amber semantic set.

```
primary   (indigo):  50 #eef2ff · 100 #e0e7ff · 300 #a5b4fc · 500 #6366f1 · 600 #4f46e5 · 700 #4338ca · 900 #312e81
accent    (amber):   400 #fbbf24 · 500 #f59e0b · 600 #d97706
neutral   (slate):   50 #f8fafc · 100 #f1f5f9 · 300 #cbd5e1 · 500 #64748b · 700 #334155 · 900 #0f172a · 950 #020617
success   (emerald): 500 #10b981
error     (rose):    500 #f43f5e
warning:             500 #f59e0b (= accent-500)
info      (sky):     500 #0ea5e9
```

**Dark mode:** true dark, not inverted gray — background `#0a0a0f`, surface `#131320`, border `#1f1f2e`, text-primary `#f1f5f9`, text-secondary `#94a3b8`. Primary/accent stay the same hue, shift 1 step lighter for contrast (`primary-400`/`accent-400` as the dark-mode "500").

## Type

Font: **Inter** (free, excellent optical quality at all sizes, what most of the reference bar — Linear, Stripe — effectively converge on anyway). `font-feature-settings: "cv11", "ss01"`, tracking tightened on large headings.

```
display   3.5rem/1.1   tracking -0.02em   (hero only)
h1        2.5rem/1.15  tracking -0.02em
h2        2rem/1.2     tracking -0.01em
h3        1.5rem/1.3
h4        1.25rem/1.4
body-lg   1.125rem/1.6
body      1rem/1.6                        (measure capped ~65ch)
body-sm   0.875rem/1.5
caption   0.75rem/1.4
```

## Spacing (8pt rhythm)

`1=4px · 2=8px · 3=12px · 4=16px · 6=24px · 8=32px · 12=48px · 16=64px · 24=96px · 32=128px`

## Radius / Shadow / Motion

```
radius:  sm 6px · md 10px · lg 16px · xl 24px · full 9999px
shadow:  sm/md/lg/xl — subtle, low-opacity (premium reads as restrained, not heavy drop shadows)
motion:  150ms (micro-interactions) · 200ms (default) · 300ms (entrances) · 500ms (page transitions)
easing:  ease-out for entrances, ease-in-out for toggles — transform/opacity only, respects prefers-reduced-motion
```

## Component Inventory

**Primitive:** Button (primary/secondary/ghost/destructive × sm/md/lg), Input, Textarea, Select, Checkbox, Radio, Switch, Card, Badge, Modal, Toast, Avatar, Dropdown, Tabs, Pagination, Breadcrumb, Table, Skeleton.

**Domain-specific:** ProductCard, PriceTag (paise → ₹ formatting, one place so money formatting is never duplicated), StarRating, EmptyState, ErrorState.

**AI-specific (Member 4's slice, listed here for consistency):** CitationChip, ConfirmationCard (write-tool confirmation), StreamingText, ToolActivityIndicator.

## Layout Patterns

```
Marketing (Landing):        centered hero, full-width sections
App (Home/Search/Product):  persistent header, max-width 1280px content
Auth:                       centered card, max-width 420px
Dashboard (Seller/Admin):   sidebar + content area
```
