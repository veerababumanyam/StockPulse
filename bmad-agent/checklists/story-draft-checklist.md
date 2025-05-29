# Story Draft Quality Checklist

**Story ID:** `{EpicNum}.{StoryNum}`
**Story Title:** `{Story Title}`

**Reviewer:**
**Date:**

## I. Core Story Elements (PO Responsibility)

- [ ] **1. Story ID & Title:** Unique, clear, and matches epic.
- [ ] **2. Epic Link:** Correctly links to the parent Epic file.
- [ ] **3. Status:** Initial status is 'Draft' or 'To Do'.
- [ ] **4. User Story Statement:**
    - [ ] Follows "As a [user type], I want [action/goal], so that [benefit/value]" format.
    - [ ] Clearly identifies the user/persona.
    - [ ] Clearly states the action/goal.
    - [ ] Clearly articulates the value/benefit to the user.
- [ ] **5. Requirements:**
    - [ ] All known functional requirements are listed.
    - [ ] Relevant non-functional requirements (performance, security, usability) are considered and listed if specific to this story.
    - [ ] Requirements are clear, concise, and unambiguous.
- [ ] **6. Acceptance Criteria (ACs):**
    - [ ] Each AC is uniquely numbered.
    - [ ] Each AC is testable (defines clear pass/fail conditions).
    - [ ] ACs cover all aspects of the requirements (happy path, edge cases, error conditions).
    - [ ] ACs are written from a user perspective or define observable outcomes.
    - [ ] ACs do not describe "how" (implementation details) but "what" (expected behavior/outcome).

## II. Technical Clarity (PO/Architect/Dev Lead Responsibility)

- [ ] **7. Technical Guidance for Developer Agent:**
    - [ ] Relevant PRD sections are referenced.
    - [ ] Relevant System Architecture sections (and Frontend Architecture, if applicable) are referenced specifically.
    *   [ ] Key components/modules to be affected or created are identified (with paths if possible).
    - [ ] Necessary API endpoints are identified (method, path, brief payload/response idea if known).
    - [ ] Relevant Data Models are referenced.
    - [ ] Specific UI/Styling guidance (e.g., links to Design Specs, component library references) is provided if a UI story.
    - [ ] Specific error handling considerations for this story are noted.
    - [ ] Specific security considerations for this story are noted.
    - [ ] Is sufficiently detailed to minimize Dev Agent's research time.
- [ ] **8. Tasks / Subtasks:**
    - [ ] A logical breakdown of technical implementation steps is provided.
    - [ ] Tasks are actionable for a developer.
    - [ ] Tasks are granular enough but not overly prescriptive if flexibility is needed.
    - [ ] Tasks are linked to ACs where applicable.

## III. Story Readiness & Context (PO Responsibility)

- [ ] **9. Definition of Done (DoD):**
    - [ ] Standard DoD is referenced or story-specific DoD items are clear.
- [ ] **10. Notes / Questions:**
    - [ ] Any assumptions made during drafting are documented.
    - [ ] Any open questions or points needing clarification are listed.
- [ ] **11. Design / UI Mockup Links:**
    - [ ] Links to relevant mockups, wireframes, or design specifications are included if applicable.
- [ ] **12. Dependencies:**
    - [ ] External dependencies (e.g., other stories, backend APIs not yet ready) are identified.
    - [ ] Internal dependencies (e.g., specific library versions, prerequisite configurations) are noted.
- [ ] **13. Sizing/Points (Initial Estimate):**
    - [ ] An initial estimate of effort (story points) is provided (can be refined by dev team).
- [ ] **14. Priority (Initial):**
    - [ ] An initial priority (High, Medium, Low) is assigned.

## Overall Assessment:

- [ ] **Is this story Independent?** (Can be developed without direct reliance on another incomplete story in the same sprint, beyond listed dependencies)
- [ ] **Is this story Negotiable?** (Details can be discussed and refined without changing the core goal)
- [ ] **Is this story Valuable?** (Delivers clear value to the user or business)
- [ ] **Is this story Estimable?** (Sufficiently clear for the dev team to estimate effort)
- [ ] **Is this story Small?** (Can be completed within a single sprint/iteration by the team/agent)
- [ ] **Is this story Testable?** (Clear ACs allow for verification)

**Outcome:**
- [ ] **Ready for Refinement/Development**
- [ ] **Needs More Information (see comments)**
- [ ] **On Hold (see comments)**

**Comments/Actions Needed:**
