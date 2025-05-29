# Story 2.2: Implement Customizable Widget System for Dashboard

**Epic:** [Dashboard Core Functionality](../epic-2.md)
**Status:** Draft
**Priority:** High
**Points:** (Estimate)
**Assigned To:** 
**Sprint:** 

## 1. User Story

> As a user,
> I want to be able to add, remove, and rearrange widgets on my Dashboard,
> So that I can personalize my workspace and prioritize the information most relevant to me.

## 2. Requirements

*   The dashboard must support a dynamic grid-based layout where widgets can be placed.
*   Users must be able to enter an "edit mode" or similar to manage dashboard widgets.
*   In edit mode, users can:
    *   Add new widgets from a predefined library of available widget types.
    *   Remove existing widgets from their dashboard.
    *   Drag and drop widgets to different positions on the grid.
    *   Potentially resize widgets (if supported by the chosen grid library and design).
*   The user's widget configuration (which widgets are active, their positions, and sizes) must be persisted on the backend per user.
*   When the dashboard loads, it should retrieve and render the user's saved widget configuration.
*   The system should be designed to allow new widget types to be added to the library in the future with minimal changes to the core widget system.
*   A default set of widgets and layout should be provided for first-time users or if no configuration exists.

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given a user is on the dashboard, when they activate "edit mode", then an interface is presented allowing them to add widgets from a widget library.
2.  **AC2:** Given a user is in "edit mode", when they select a widget from the library, then the widget is added to their dashboard grid.
3.  **AC3:** Given a user is in "edit mode", when they drag a widget on the dashboard, then its position in the grid is updated visually.
4.  **AC4:** (If resizing is implemented) Given a user is in "edit mode", when they resize a widget, then its dimensions on the grid are updated visually.
5.  **AC5:** Given a user is in "edit mode", when they choose to remove a widget, then the widget is removed from their dashboard display.
6.  **AC6:** Given a user makes changes to their widget layout (add, remove, move, resize) and saves or exits "edit mode", then their new configuration is persisted via a backend API call.
7.  **AC7:** Given a user loads the dashboard, then their previously saved widget configuration is fetched and rendered, maintaining widget types, positions, and sizes.
8.  **AC8:** Given a first-time user (or user with no saved configuration) loads the dashboard, then a default set and layout of widgets are displayed.

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:**
    *   `PRD.md#3.5.1` (Dashboard - Customizable widgets)
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.1.1` (Frontend Architecture - `src/pages/Dashboard.tsx`)
    *   `architecture.md#1.2` (Architectural Principles - may guide choices for widget system design, e.g., extensibility)
    *   `docs/infrastructure_design.md#5.2` (AI Agent Architecture - this widget system will host outputs from various AI Agents)
*   **Key Components/Modules to be affected/created:**
    *   Page: `src/pages/Dashboard.tsx` (will need significant updates to host the widget system).
    *   Components:
        *   `src/components/dashboard/WidgetGrid.tsx` (or similar, to manage the grid layout and widgets).
        *   `src/components/dashboard/WidgetPlaceholder.tsx` (for empty grid cells or while widgets load).
        *   `src/components/dashboard/WidgetLibraryModal.tsx` (or panel, for users to select widgets to add).
        *   `src/components/widgets/` (directory for individual widget components - this story focuses on the *system*, subsequent stories will build individual widgets like Story 2.3, 2.4 etc.).
    *   Service: `src/services/userService.ts` or `dashboardService.ts` for fetching and saving user's widget configurations.
    *   State Management: For managing edit mode, widget list, layout configuration (e.g., Zustand or React Context).
*   **Libraries:**
    *   Consider using a well-maintained library for drag-and-drop grid layouts, e.g., `React Grid Layout` (react-grid-layout) or `Gridstack.js` (if a wrapper exists or is simple to create), or `dnd-kit` for more custom solution.
*   **API Endpoints Involved:**
    *   `GET /api/v1/users/me/dashboard-configuration` (To fetch user's saved widget layout).
        *   Expected Response: `{ "layout": [ { "i": "widgetA-id", "x": 0, "y": 0, "w": 4, "h": 2 }, ... ], "widgets": [ { "id": "widgetA-id", "type": "PortfolioChartWidget" }, ... ] }` (Structure TBD, depends on grid library).
    *   `PUT /api/v1/users/me/dashboard-configuration` (To save user's widget layout).
        *   Expected Request Body: Same structure as GET response.
*   **Styling/UI Notes:**
    *   Refer to `StockPulse_Design.md` for overall dashboard aesthetic and any specific designs for edit mode or widget controls.
    *   Ensure clear visual cues for draggable areas, resize handles (if applicable), and remove widget controls.
*   **Data Structure for Widget Configuration:**
    *   Define a clear JSON structure for storing widget type, ID, grid position (x, y, w, h), and any widget-specific settings.
*   **AI Context:** While this story builds the widget *system*, many of the individual widgets developed in subsequent stories (e.g., 2.3, 2.4, 2.5) will integrate AI agents and RAG capabilities. This system must be robust enough to host such dynamic content.

## 5. Tasks / Subtasks

1.  **Task 1 (Research & Setup):** Research and select a suitable grid layout library. Install and configure it.
2.  **Task 2 (AC1, AC2):** Implement "edit mode" toggle on the dashboard. Create `WidgetLibraryModal.tsx` to display available (placeholder) widget types.
3.  **Task 3 (AC2):** Implement logic to add a selected widget type (initially a placeholder widget component) to the dashboard grid state when chosen from the library.
4.  **Task 4 (AC3, AC4):** Integrate the chosen grid library into `Dashboard.tsx` or a `WidgetGrid.tsx` component. Enable drag-and-drop and resizing (if supported/scoped).
5.  **Task 5 (AC5):** Implement functionality to remove a widget from the dashboard grid state.
6.  **Task 6 (AC6):** Implement service functions to fetch and save the dashboard configuration (layout and active widgets) using the defined API endpoints.
7.  **Task 7 (AC6, AC7):** Integrate save/load functionality: save on exiting edit mode (or explicit save action), load on dashboard mount.
8.  **Task 8 (AC8):** Implement logic for a default widget layout if no user configuration is found.
9.  **Task 9 (N/A):** Write unit/integration tests for the widget management system, an_Mpd service calls.

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC8) met.
*   Users can enter an edit mode on the dashboard.
*   In edit mode, users can add predefined (placeholder) widget types to the dashboard.
*   Users can drag, drop, and remove widgets.
*   Widget layout and configuration are persisted per user and loaded correctly.
*   A default layout is shown for new users.
*   The system is architected to easily accommodate new actual widget components later.
*   Code reviewed, merged, tests passing.

## 7. Notes / Questions

*   Final decision on grid layout library is crucial early on.
*   Exact structure of the `dashboard-configuration` API payload needs to be agreed with backend.
*   This story focuses on the *framework*. Individual widget implementations (like chart, watchlist) are separate stories (2.3, 2.4, etc.). For this story, adding a widget means adding a generic placeholder or a very simple sample widget.
*   Widget resizing can be a V2 for this story if it complicates initial implementation significantly, but the grid should ideally support it.

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `docs/StockPulse_Design.md` for dashboard concepts, and any specific mockups for widget edit mode or widget controls.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 