# SAWIT Website Flow and Layout Summary

## Routing Flow
- / shows the public Welcome page.
- /auth shows the Auth page with sign-in or sign-up, based on the mode query param.
- /dashboard and all nested routes require auth; unauthenticated users are redirected to /auth.
- Unknown routes redirect to /.

## Global Structure
- Public area: Welcome + Auth.
- Private area: Dashboard layout shell with topbar, nav pills, search, avatar, and nested content.

## Page-by-Page Layout

### Welcome Page (/)
- Two-column hero layout.
- Left: headline, description, primary and secondary CTA buttons, three metric tiles.
- Right: dashboard preview card with portfolio summary, mini chart bars, and footnotes.
- Decorative orbit circle and gradient background.

### Auth Page (/auth)
- Auth shell with centered card.
- AuthLayout wraps either the Login form or Register form.
- Mode toggles via query param: mode=signin or mode=signup.
- On success, user is routed to /dashboard.

### Dashboard Layout (/dashboard/*)
- Topbar includes brand logo, search input, and main navigation pills.
- Nav pills link to Transactions, Subscriptions, Wishlist, Investments.
- Shortcut chip to Dashboard Analitik.
- Avatar button routes to Profile.
- Content area renders the nested route via Outlet.
- Floating AI analysis widget is always present.

### Dashboard Analitik (/dashboard)
- Header with icon, title, and description.
- Single-column workspace with Streamlit analytics embed.

### Transactions (/dashboard/transactions)
- Header, summary report, and transaction form.
- Filters for period and date range with reset.
- Transaction history list; loading and saving states.

### Subscriptions (/dashboard/subscriptions)
- Header and a single-column layout.
- Subscription tracker component as main content.

### Wishlist (/dashboard/wishlist)
- Header and a single-column layout.
- Wishlist calculator for savings targets.

### Investments (/dashboard/investments)
- Header and Streamlit stock analytics embed.
- Uses a configured stock dashboard URL.

### Profile (/dashboard/profile)
- Back button and profile header.
- Profile hero card with avatar, display name, email, and logout.
- Edit profile modal with photo upload/remove and password OTP flow.
- Budget category allocation form with update and save actions.

### Recommendation Page (Not Routed)
- AI recommendation dashboard with status, metrics, and suggestions.
- Fetches advice data and shows error or retry state if missing.
- Uses a header component with profile click handlers.

## Notes
- All dashboard pages share consistent section headers and a single-column workspace grid.
- Streamlit embeds are used for analytics and investment dashboards.

## Current UI — Minimal authoritative list (do not add/remove without checking)
Use this as the single source of truth when redesigning in Figma. Only include the items below
so the prototype matches the app's real capabilities and avoids extra icons/buttons.

- Global / Topbar (Dashboard): `BrandLogo` (compact), search input, nav pills: `Transactions`, `Subscriptions`, `Wishlist`, `Investments`; Dashboard Analitik chip; user avatar (opens profile). Floating AI toggle (icon `ai`) opens an analysis panel.
- Welcome page (public): large `lockup` logo top-left; hero headline + short description; two CTAs (primary + secondary); three metric tiles; a single small visual preview card (Portfolio) with pill + chip + 4 small bars; decorative gradient/orbit only.
- Auth page: single centered auth card with `email`, `password`, password visibility toggle, submit; link to switch between sign-in and sign-up.
- Dashboard pages (each follows header + single-column content pattern):
	- Dashboard Analitik & Investments: header + Streamlit iframe embed + `Buka penuh` button.
	- Transactions: header, `SummaryReport` (income/expense/balance), `TransactionForm` (description, amount, type, method, date, predict-category button), filters toolbar, transaction list rows (read-only entries) and loading/empty states.
	- Subscriptions: subscription tracker list/cards and add/edit controls.
	- Wishlist: wishlist calculator form + result card(s).
	- Profile: profile hero (avatar/initials, name, email), Back button; edit modal with photo upload/remove, name/email inputs, change-password via OTP (send OTP button + OTP input), Save / Cancel; budget category grid with numeric inputs + Save/Update.
- Recommendation component exists but is not routed by default: status hero, metric tiles, suggestion list, refresh button.

- Shared UI primitives to keep exact:
	- Buttons: primary (filled) and one secondary only per hero; submit/save buttons; small pill buttons.
	- Icons: only use names present in `Icon.jsx` (e.g. `ai`, `dashboard`, `receipt`, `subscription`, `target`, `investment`, `budget`, `income`, `expense`, `balance`, `check`, `search`, `pencil`, `user`, `wallet`, `calendar`, `save`, `form`).
	- Panels/cards: consistent header (icon + eyebrow + title) and body area; use the same rounded radii and shadow scale.
	- Loading and disabled states: `.page-loading`, disabled/`is-disabled` buttons, and textual progress states like "Memuat..." or "Menyimpan...".

Notes:
- Do not add extra nav items, global actions, or modal types beyond what's listed.
- Keep hero CTAs minimal (primary + one secondary) to match current product flows.
- If a new icon is truly necessary, prefer extending `Icon.jsx` with a single new glyph and register it in the list above.

## Frontend Detailed Spec (for redesign in Figma)
This section lists the UI components, important CSS classes, design tokens, and interactions to reproduce in Figma.

### Component Inventory (file → primary responsibilities)
- `BrandLogo` (`client/src/components/brand/BrandLogo.jsx`): logo variants (`mark`, `lockup`, `compact`). Provide SVG/PNG assets at multiple sizes (recommended: 64px, 128px, 256px).
- `Icon` (`client/src/components/ui/Icon.jsx`): inline SVG icon set. Icons used: `ai`, `dashboard`, `receipt`, `subscription`, `target`, `investment`, `budget`, `income`, `expense`, `balance`, `check`, `search`, `pencil`, `user`, `wallet`, `calendar`, `save`, `form`.
- `AnalysisPreview` (`client/src/components/dashboard/AnalysisPreview.jsx`): Streamlit iframe wrapper, header with `streamlit-button`, placeholder state.
- `SummaryReport` (`client/src/components/dashboard/SummaryReport.jsx`): income/expense/balance small report card.
- `FloatingAnalisisAi` (`client/src/components/advice/FloatingAnalisisAi.jsx`): floating toggle + panel with metrics and suggestions.
- Auth forms: `LoginForm` / `RegisterForm` (under `client/src/features/auth/components/`) — standard inputs, password visibility, submit flows.
- Transactions components: `TransactionForm`, `TransactionHistory`, `SummaryReport` (in `client/src/features/transactions/`).
- Subscriptions: `SubscriptionTracker` (single-column tracker UI).
- Wishlist: `WishlistCalculator` (form + cards).
- Profile: profile hero card, edit modal (photo upload + OTP flow), budget allocation form (category cards).

### Key Pages (what to design per screen)
- `Welcome` (public): hero (headline, description, CTA primary/secondary), metrics row (3 tiles), visual preview card (optional), decorative orbit and gradient. Provide desktop / tablet / mobile variants.
- `Auth` (public): centered auth card with toggles for sign-in / sign-up. Include validation states and error messages.
- `Dashboard` (private shell): topbar with brand (left), search input (center-left), nav pills (center), dashboard shortcut pill, user avatar (right). Content area is a single column panel stack.
- `Transactions` (private): header, summary report, transaction input form (fields: description, amount, type, date, method), filters toolbar, transactions list rows, empty / loading states.
- `Subscriptions`, `Wishlist`, `Investments`, `Profile`, `Recommendation`: each as single-column panels — design cards, lists, and modals as shown in the code.

### Important CSS classes & selectors (map to Figma components)
- Layout containers: `.welcome-shell`, `.welcome-hero`, `.welcome-section`, `.dashboard-shell`, `.dashboard-topbar`, `.dashboard-content`, `.workspace-grid`, `.primary-column`.
- Common cards/panels: `.panel`, `.welcome-card`, `.report-card`, `.chart-card`, `.panel-header`, `.panel-title`, `.panel-icon`.
- Buttons: `.welcome-button` (primary), `.welcome-button.secondary`, `.submit-button`, `.budget-update-button`, `.streamlit-button`, `.welcome-nav-cta`.
- Navigation pills: `.dashboard-pill`, `.dashboard-pill.active`.
- Form controls: `.profile-edit-field`, `.category-budget-card`, inputs (`input`, `select`, date inputs) inside forms.
- Floating UI: `.analisis-ai-toggle`, `.analisis-ai-panel`.

### Design tokens / CSS variables to carry into Figma
- Colors (CSS var names used in project): `--background`, `--surface`, `--surface-soft`, `--primary`, `--primary-dark`, `--gold`, `--text`, `--muted`, `--border`.
- Spacing: base paddings used (clamp values in `welcome.css`): `clamp(20px, 5vw, 64px)` — replicate responsive padding tokens.
- Radii: `8px`, `12px`, `18px`, `999px` used for pills and rounded cards.
- Elevation: shadows such as `0 24px 60px rgba(23, 94, 57, 0.16)` and lighter `0 20px 40px rgba(23, 94, 57, 0.08)`.

### Buttons & Iconography
- Primary CTA (light background variants): use high contrast fill (white on green) or inverted white with green border depending on hero background.
- Secondary CTA: outline or transparent with gold/white text depending on section background.
- Icons: keep stroke-based monochrome icons sized at `18px`–`22px`. In Figma, provide 2 color states: `currentColor` (text/icon) and subtle-muted.

### Interactions & States (to prototype)
- Loading states: `.page-loading`, disabled buttons (`is-disabled`), and skeleton cards for lists.
- Forms: input error messages (inline), success states, optimistic save state (mutating indicator texts like "Menyimpan...").
- Floating AI: toggle opens a panel; when open it fetches data and shows success / empty / error states.
- Modal: profile edit appears in overlay modal; supports image preview, remove, and OTP entry.

### Data / API integration points (for designer awareness)
- Base API: `VITE_API_BASE_URL` → endpoints used by frontend:
	- `POST /api/auth/login`, `POST /api/auth/register`
	- `GET /api/transactions/`, `POST /api/transactions/`, `POST /api/transactions/predict-category`
	- `GET /api/budget/summary/{month}`, `POST /api/budget/set`
	- `GET /api/advice/` (financial advice used by FloatingAnalisisAi)
	- Profile endpoints: photo upload and profile update
- Streamlit: analytics embed URLs controlled by `VITE_STREAMLIT_URL` and `VITE_STOCK_STREAMLIT_URL`.

### State management & hooks
- Auth: `useAuth` provides `token`, `user`, `isAuthenticated`, `setSession`, `clearSession`.
- Transactions: `useTransactions` handles fetching, adding, mutation state, and category prediction calls.

### Accessibility notes
- Keep clear focus states for keyboard navigation (pills, buttons, inputs).
- Use semantic headings (h1/h2/h3) and `aria-label` on complex regions (Streamlit iframe, floating AI, nav).
- Buttons include `aria-expanded`/`aria-label` where appropriate (floating AI toggle).

### Assets & export checklist for Figma
- Logo: export as SVG + PNG at 1x/2x/3x, provide `lockup` and `compact` variants.
- Icons: export as SVGs (individual icons) and provide stroke weights matching the app (1.8px equivalent).
- Color tokens: provide swatches for each CSS var and tints (10%/20% darker/lighter) for hover/active states.
- Components: panels, nav pills, metric tiles, and hero CTAs as reusable components.


