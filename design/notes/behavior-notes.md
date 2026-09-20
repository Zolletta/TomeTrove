# Behavior Notes

Source: Figma file `z6yz2kWXO9D8gahuOyYW8J`, page "final", node `338:1039` (frame `Notes` → text "notes"). Extracted 2026-09-20. This text is the authoritative interaction spec for the components and screens in this design export.

## Listing

COMPONENT STATES

- State=no-filtered → default listing, no active filters
- State=filtered → active filter badge(s), filtered grid results
- State=no-results → grid replaced by "No results found" message
- State=empty-list → no search form, "Nothing here yet" message
- State=loading → grid replaced by smiley-blank icon + "Loading..." + "Fetching data, please wait."

SEARCH TIP

- Always visible hint: "Type the column name followed by : to search a specific column"
- Styled Outfit Light 11px at 50% opacity

CUMULATIVE SEARCH (AND LOGIC)

- Each search filters WITHIN the current result set (always AND, never OR)
- First search: transitions from State=no-filtered → State=filtered
- Subsequent searches: add another filter term, narrowing results further
- "Filtered by:" label precedes filter badges
- Each badge contains the search term + close button; clicking it removes that filter
- Removing all filters returns to State=no-filtered

CLEAR ALL LINK

- Appears ONLY when 2 or more filter terms are active
- Clicking removes all filters and returns to State=no-filtered
- With only 1 filter, use the badge's close icon (no "Clear all" shown)

SEARCH TEXT FIELD BEHAVIOR

- State=no-filtered: field shows placeholder "Search..."
- State=filtered / State=no-results: field is cleared, ready for new input
- On focus: field clears its content, ready for new input
- Search is NOT triggered on clear - user must press Search or press Enter
- If field loses focus without pressing Search, field returns to empty/placeholder
- New search term adds as an additional AND filter, not replacing existing ones

FIELD-SCOPED SEARCH

- Default (plain text): searches only the Title column implicitly
- Syntax: `<field>:<text>` searches a specific column
  - e.g. "author:tolkien" → filters Author containing "tolkien"
  - e.g. "genre:fantasy" → filters Genre containing "fantasy"
- Recognized fields: title, author, language, genre
- Filter badges display the field prefix: "author: tolkien", "genre: fantasy"
- Plain searches display as "title: <term>" (implicit first-column scope)
- Unrecognized prefixes treated as plain title search

SEARCH TYPE AUTOCOMPLETE

- When user types a recognized field name followed by ":" (e.g. "author:"), an inline type indicator appears in the field
- Recognized prefixes: title:, author:, language:, genre:

## Alert

Click → navigates to Wish Detail for the book that triggered the alert. The alert is marked as read (alert_read_at set) on click.

Read state: row shows the green checkmark (selected-check, same as Dropdown Panel component). Unread rows have no checkmark.

Hover: row background highlights (same as Dropdown Panel hover).

## Autocomplete

- Typing in the search field opens the dropdown with matching results.
- Selecting a result closes the dropdown and populates the field.
- No results: dropdown shows a single non-clickable "No results found" row in muted text.
- Refocusing or resuming typing after "no results" clears the field and closes the dropdown.
- Pressing Enter is implied as submit — no dedicated search button needed.
- Dropdown dismisses on blur (clicking outside).

## Header

ICON BUTTONS (Bell, Theme Toggle, User, Logout)

- Bell shows a red badge with unread count
- Clicking the bell opens the notification dropdown below it

NAVIGATION BAR

- Active item is NOT a link (not clickable - represents current location)
- Only one nav item can be active at a time

## Watchlist

Pressing "Detail" navigates to the Wish Detail page, showing full book info, price history, and management actions.

## Shared Lists

LIST SELECTION

Mutual exclusivity: If the user types in the "New list name" field, the "Existing list" dropdown resets to placeholder and vice versa. Only one can have a value at a time — they are mutually exclusive inputs.

EXPIRATION

Mutual exclusivity: When "No expiration" is checked, the expiration date field is disabled (greyed out). When the user enters or selects a date, the checkbox is automatically unchecked.

## User Preferences

INDEPENDENT SECTIONS

- Sections expand/collapse independently - opening one does NOT auto-close others
- Rationale: each section has its own Save button; auto-closing would risk loss of unsaved state

NAVIGATION LINKS (Column A)

- Clicking a link expands the corresponding card AND scrolls to it

COLLAPSED STATE SUMMARY

- Shows "Change" if configured, or "Choose" if empty
- Reading Languages shown in native script (e.g. 'English · Italiano')

## Overlay & Language Picker

TOASTS

- Auto-dismisses after 5 seconds (default). User can close by clicking.

AUTOCOMPLETE / SMART SEARCH

- ISBN mode: if first 5 chars are digits only, wait until 10 or 13 characters before searching
- Text mode: start searching at 3 characters (no toggle needed - auto-detected)
- Already-added languages are excluded from dropdown results

LANGUAGE PICKER - RIGHT COLUMN

- First visit: right column is empty until user searches and adds a language
- Returning: right column is pre-populated with saved preferences
- Newly added languages appear at the TOP of the list
- Returning languages shown in ALPHABETICAL order as "NativeName (EnglishName)"
- All 9 types are CHECKED by default for newly added languages

CONSTRAINTS

- Minimum one language must remain - close button disabled/hidden when only one language left

PREFERRED STAR

- The first language added is automatically preferred
- Only one language can be preferred at a time
- Clicking a hollow star makes it preferred and removes preferred from the previous star
- The preferred language sets user_language_preferred = true in the data model (one row per user)

SAVE BUTTON

- Persists the current selection of languages and their checked types

## Grid

PAGINATION

- « and » navigate to first/last page
- Disabled pages shown at 40% opacity
- Changing page size → grid restarts from page 1

LOADING STATE

- Also triggered when changing page, page size, or applying new filters
- Optional: can show inline skeleton instead of full loading state

SORTABLE COLUMNS

- Clicking an already-sorted column reverses its order (a-z ↔ z-a)
- Clicking an unsorted column: previously sorted column becomes unsorted; clicked column becomes sorted a→z
- Changing sort order restarts pagination from page 1

RESULT COUNT

- Hidden when no results or empty list
- Updates dynamically when page, page size, or filters change

GRID-META

- Pagination dropdown opens UPWARD (grid-meta is always below grid-content)

## Wish Detail

Fetch Quotes on a watched book triggers an on-demand fetch adding a new data point to the graph. Button enters disabled state during fetch. Chart shows semi-transparent overlay with loading indicator while existing data stays visible. On completion, the new lowest-price point merges into the line and both tables refresh.

Each data point shows the lowest price across all sources for that fetch.

Automatic quotations: updated on every scheduled monitoring run. Shows all sources with type, price, and date. Only appears for watched books.

On-demand quotations: populated only when user clicks Fetch Quotes. For unwatched books this is the only table. For watched books it supplements the automatic data. Both tables can coexist.

On hover over any data point, a tooltip appears showing: date, lowest price, book type (New/Used/eBook with icons: icon/book for New, icon/used-book for Used, icon/download for eBook), and seller name. Tooltip follows cursor along the chart.
