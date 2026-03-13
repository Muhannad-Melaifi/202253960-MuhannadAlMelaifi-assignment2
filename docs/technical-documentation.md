# Technical Documentation (Assignment 2)

## Overview
This Assignment 2 builds on Assignment 1 by adding more interactivity and modern JavaScript behavior:

### New features added in Assignment 2
1) **Live project search/filter** (dynamic content)
2) **API widget** (data handling using `fetch()`)
3) **Improved user feedback**:
   - Empty state when no projects match
   - Loading indicator while fetching API data
   - Friendly error message if API fails

The Assignment 1 features remain (theme toggle saved in localStorage, greeting message, form validation + toast notifications).

---

## Dynamic Content: Project Search/Filter
### What it does
- A search input allows users to filter projects live while typing.
- Projects are shown/hidden based on whether the query matches:
  - The visible text content of the project card, OR
  - A `data-tags` attribute attached to each project.

### Files involved
- `index.html`
  - Search input: `#projectSearch`
  - Clear button: `#clearSearch`
  - Empty state message: `#projectsEmpty`
  - Project cards: `.project.card` with `data-tags="..."`

- `js/script.js`
  - Listens to `input` events on `#projectSearch`
  - Shows/hides project cards by setting `style.display`
  - Toggles empty state when zero projects match

### User feedback
- If there are no matches:
  - Displays: “No projects found. Try a different keyword.”

---

## Data Handling: Public API Widget
### What it does
- Fetches dynamic content from a public API using `fetch()`.
- Displays:
  - Loading text while waiting
  - The returned content on success
  - A friendly error message on failure
- Includes a button to refresh/reload the data.

### Files involved
- `index.html`
  - Widget elements:
    - `#quoteStatus` (loading/error/success hint)
    - `#quoteText` (content output)
    - `#quoteAuthor` (source/author text)
    - `#refreshQuote` (reload button)

- `js/script.js`
  - Uses `async/await` and `try/catch` for error handling
  - Updates the UI based on:
    - loading → success → error states

### Error handling
- If the API fails:
  - Shows a friendly message on the page
  - Also triggers a toast message for additional feedback

---

## Animations / Transitions
- Button hover effects and card styling are handled via CSS.
- Toast messages use CSS transitions for a smooth appearance.
- The API widget loading state includes a subtle shimmer animation on the loading text (lightweight and non-distracting).

---

## Existing Assignment 1 Features (still included)
- **Theme toggle** with preference saved in `localStorage`
- **Greeting message** based on time of day
- **Contact form validation** with inline error messages
- **Toast notifications** for user feedback

---

## Known Limitations
- Contact form is front-end only (no backend submission).
- API content depends on network availability and the API uptime.