# AI Design Handoff Prompt

Source: Figma file `z6yz2kWXO9D8gahuOyYW8J`, page "final", node `629:7274` (frame `Notes` → text "AI Design Handoff Prompt"). Extracted 2026-09-20. This is the prompt the current design was produced from; it describes the intended product behavior, information architecture, and the complete 29-screen list (each in light + dark).

---

You are redesigning the UI for TomeTrove, a book wish-list and price-monitoring web app. The current Figma file contains wireframe-level screens with complete interaction specs. Your job is to produce polished, production-ready visual designs that faithfully implement every behavior described below while dramatically improving aesthetics, layout quality, and visual hierarchy. Do not invent new features, remove existing ones, or alter any interaction logic.

## PRODUCT SUMMARY

TomeTrove lets authenticated users: (1) maintain a wish list of books, (2) elect up to 5 wishes for scheduled price monitoring across multiple stores, (3) receive in-app alerts when prices drop below a user-set threshold, and (4) share read-only subsets of their wish list via public token links. Auth is GitHub OAuth. The frontend is a multi-page app (Alpine.js on Cloudflare Workers). Light and dark themes are required for every screen.

## INFORMATION ARCHITECTURE

Three primary nav items: My Wishes, Watchlist, Shared Lists.

My Wishes (list-wishes): the full book wish list. Contains add-wish search component (title or ISBN), Import CSV button, and the reusable grid component. Each row exposes: delete-wish, elect-watchlist (max 5), on-demand price check (navigates to wish-detail).

Watchlist (view-watchlist): the monitored subset. Shows latest prices, price history access. Each row: unwatch-wish, on-demand price check, Detail (navigates to wish-detail).

Shared Lists (view-shares): list of public shareable wish lists. Actions: create-share, rename-share, delete-share, preview-share.

Wish Detail (wish-detail): reached from watchlist or on-demand price check. Price history chart (tooltip on hover: date, lowest price, book type icon, seller), automatic quotations table (monitored books only), on-demand quotations table, management actions (Check Prices with 1-hour cooldown + disabled state during operation, Unwatch, Delete).

User Preferences (preferences): accordion-style panels with independent expand/collapse. Country, Theme, Accepted Formats (drag-reorder), Alert Threshold (%), Reading Languages (matrix of languages x 9 editorial Types). Each panel has own Save button. Download Data (request/waiting/ready) and Delete Account flows.

Shared List Detail (shared-list): single shared list management. Add/remove items, rename. Items added by searching user's own wishes via autocomplete.

Public List View (shared-wishes-items): unauthenticated page at /list/{token}. List owner name, item count, read-only table (title, author, language, genre). Minimal header (logo + theme toggle only).

## GLOBAL WIDGETS

Header: logo, nav bar (active item is non-clickable), bell icon (notification badge with unread count, dropdown with read/unread states, click alert navigates to wish-detail), theme toggle, user icon, logout.

Footer: Privacy link, License link, copyright 2026 TomeTrove.

Alert overlay: 64px banner for toast notifications, auto-dismiss after 5s.

## ONBOARDING (FIRST LOGIN)

Forced redirect to preferences. Same preferences page operates as a 3-step progressive-disclosure wizard: Step 1 (Currency + Country + Alert Threshold) then Save reveals Step 2 (Reading Languages) then Save reveals Step 3 (Accepted Formats) then Finish redirects to list-wishes. Navigation is blocked until all steps are saved. Only logout and delete-account are accessible. On subsequent logins with incomplete preferences, user resumes from first incomplete step.

## REUSABLE GRID COMPONENT (used across My Wishes, Watchlist, Shared Lists)

States: no-filtered (default), filtered (active filter badges), no-results (No results found), empty-list (Nothing here yet, no search form), loading (smiley icon + Loading... + Retrieving data, please wait.).

Search: always-visible hint (Type the column name followed by : to search a specific column) styled Outfit Light 11px at 50% opacity. Cumulative AND logic: each new search narrows within current results. Filter badges show term + close button. Clear all link appears only with 2+ filters. Field-scoped syntax: author:tolkien, genre:fantasy, language:english, title:hamlet. Unrecognized prefixes default to title search. Plain text searches title implicitly.

Search field behavior: placeholder Search... when no-filtered; cleared and ready when filtered/no-results; clears on focus; search NOT triggered on clear, must press Enter; if focus lost without Enter, returns to empty/placeholder.

Autocomplete: when user types a recognized field name followed by colon, an inline type indicator appears.

Pagination: first/last page buttons. Disabled pages at 40% opacity. Changing page size restarts from page 1. Dropdown opens upward. Result count hidden when no results or empty; updates dynamically.

Sortable columns: clicking sorted column reverses order; clicking unsorted column sorts it a-z and un-sorts previous. Sort change restarts pagination from page 1.

Loading state: also triggered on page change, page size change, or filter application.

## ADD-WISH COMPONENT (within list-wishes)

Search by title: autocomplete at 3+ characters, debounced. DB lookup filtered by user's reading languages, show editions (one per language). Is this the book? Yes creates wish. No triggers lookup from OpenLibrary/Google Books.

Search by ISBN: submit on Enter (no autocomplete). If first 5 chars are digits, wait until 10 or 13 characters. DB lookup then external API fallback. Language mismatch warning (Wishes win: user can override). Duplicate detection: if book already in wish list with different edition, offer to replace.

No results: No books found for the query. Try a different title or ISBN.

## SHARED LISTS BEHAVIOR

Create/edit: New list name field and Existing list dropdown are mutually exclusive. Typing in one resets the other.

Expiration: No expiration checkbox and date field are mutually exclusive. Checking disables the date field; entering a date unchecks the checkbox.

Lists are materialized subsets (not filtered views). Removing a wish from the wish list cascades to shared lists. Public URLs use unguessable tokens.

## USER PREFERENCES DETAILS

Sections expand/collapse independently. Opening one does NOT auto-close others (each has its own Save button; auto-closing risks unsaved state loss). Navigation links in Column A expand the corresponding card AND scroll to it. Collapsed state shows Change if configured or Choose if empty. Reading Languages shown in native script (e.g. English, Italiano).

## LANGUAGE PICKER

First visit: right column empty. Returning: pre-populated with saved preferences in alphabetical order as NativeName (EnglishName). Newly added languages appear at TOP. All 9 Types checked by default for new languages. Minimum one language must remain (close button disabled/hidden for last one). Preferred star: first language added is auto-preferred; only one preferred at a time; clicking hollow star transfers preference.

## WISH DETAIL: PRICE CHART

Each data point = lowest price across all sources for that retrieval. Tooltip on hover: date, lowest price, book type (New/Used/eBook with icons), seller name. Tooltip follows cursor.

Check Prices: triggers on-demand retrieval, button disabled during operation. Chart shows semi-transparent overlay with loading indicator while existing data stays visible. On completion, new point merges into line, both tables refresh.

Automatic quotations: updated on every scheduled monitoring run, only for watched books.

On-demand quotations: populated only on user click. For unwatched books this is the only table. Both tables can coexist for watched books.

## ALERT SYSTEM

Bell icon in header shows red badge with unread count. Clicking opens notification dropdown. Alert click navigates to wish-detail for the triggering book. Alert marked as read (alert_read_at set) on click. Read state: green checkmark. Unread: no checkmark. Hover: row background highlights. Mark all as read button.

Threshold: user-configured percentage (default 5%). Alert fires when price drops at or above threshold below baseline. Baseline refreshed after 12 months via monthly consolidation.

## DESIGN SYSTEM CONSTRAINTS

Typography: Outfit font family (Light, Regular, Bold weights used in wireframes).

Color: current wireframes use a dark navy (#0A2540 range) for dark theme and a light blue-grey for light theme. Bound to Figma variables: maintain variable bindings.

Grid: desktop-only (1280px viewport). Mobile responsive is out of scope for now.

Components: header/footer, buttons (primary green, secondary outline, destructive red), form inputs, autocomplete dropdowns, listing/grid rows, pagination.

No cover images stored: book data is text-only (title, author, language, genre, publisher, year). Design around text tables, not media cards.

Login with GitHub button uses GitHub brand mark.

## DATA MODEL CONTEXT (for realistic content)

Books have: original title, original language, editorial Type (9 types: Fiction, Poetry, Theatre, Comics, Essay, Memoir, Manual, Travel, Reference), Genre, and ontology tags. Authors stored in Latin + original script. Editions are per-language with ISBN, publisher, year. Wishes are for books (not editions): editions are tracked as alternatives. Price quotes store: price in cents, currency, store, used/new/ebook flags, baseline flag. Shared lists have: name, token, optional expiration, filter criteria (retained for reference).

## SCREENS TO PRODUCE (each in light + dark)

1. Homepage (unauthenticated): login landing with Login with GitHub and product description
2. My Wishes / default: empty state with add-wish search component
3. My Wishes / populated: grid with sample book data, showing all row actions
4. My Wishes / search results: filtered state with filter badges
5. Watchlist / default: monitored books with latest prices
6. Wish Detail / empty (no data): unwatched book, no quotes yet
7. Wish Detail / retrieving quotes: loading overlay on chart
8. Wish Detail / watched (with data): full chart, automatic + on-demand tables
9. Wish Detail / unwatched (sparse data): on-demand table only
10. Wish Detail / delete confirmation
11. Import Wishes / upload: CSV upload step
12. Import Wishes / reconciling: matching table with skip/confirm per row
13. Import Wishes / summary: import results
14. Shared Lists / default: list of shared lists with actions
15. Shared Lists / search autocomplete open: adding a book to a list
16. Shared Lists / book selected: add-to-list form (new or existing list)
17. Shared Lists / book added overlay: confirmation
18. Shared Lists / edit wishlist overlay: rename/manage
19. Public List View (shared-wishes-items): unauthenticated visitor view
20. User Preferences / all closed: accordion summary view
21. User Preferences / country expanded
22. User Preferences / theme expanded
23. User Preferences / accepted formats expanded
24. User Preferences / alert threshold expanded
25. User Preferences / reading languages expanded (with language picker)
26. User Preferences / download data (request, waiting, ready states)
27. User Preferences / delete account
28. Alert overlay (toast banner)
29. Notification dropdown (bell menu with read/unread alerts)

Preserve all interaction logic exactly as specified. Focus your creative energy on: visual hierarchy, spacing and rhythm, color palette refinement, typography scale, component polish, empty-state illustrations, and micro-interactions. Every behavioral note in this file is authoritative: do not simplify or omit any interaction.
