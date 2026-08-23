## ADDED Requirements

### Requirement: Global feedback discovery

The application SHALL provide a feedback entry in the shared application shell on every normal route and SHALL make that entry usable at desktop and mobile viewport sizes. The application SHALL also provide a feedback link in the shared footer. Standalone tool windows that intentionally omit the application shell SHALL NOT be required to show these entries.

#### Scenario: Visitor opens a normal tool page

- **WHEN** a visitor opens a tool route without standalone mode
- **THEN** the top-bar feedback control is available
- **AND** the shared footer includes a feedback link

#### Scenario: Visitor opens a standalone tool window

- **WHEN** a visitor opens a tool route with `standalone=true`
- **THEN** the global feedback control and footer are omitted with the rest of the application shell

#### Scenario: Visitor uses a mobile viewport

- **WHEN** a visitor opens a normal route on a mobile-sized viewport
- **THEN** the feedback control remains visible and operable without opening the sidebar

### Requirement: Feedback intent selection

The application SHALL let a visitor choose between reporting a problem and suggesting a tool before selecting an external submission channel.

#### Scenario: Visitor reports a problem

- **WHEN** the visitor selects the problem-report intent
- **THEN** the chooser presents email and GitHub actions labeled for problem reporting

#### Scenario: Visitor suggests a tool

- **WHEN** the visitor selects the tool-suggestion intent
- **THEN** the chooser presents email and GitHub actions labeled for a tool suggestion

### Requirement: Email and GitHub handoff

The application SHALL support both an approved public feedback mailbox and the `bugchao/toolbox` GitHub Issues page as external feedback channels. The application SHALL pre-fill concise feedback context appropriate to the selected intent.

#### Scenario: Visitor chooses email

- **WHEN** the visitor chooses the email channel
- **THEN** the application opens a `mailto:` URL addressed to the approved feedback mailbox
- **AND** the subject identifies the selected feedback intent
- **AND** the body includes the current page title, route, and URL

#### Scenario: Visitor chooses GitHub

- **WHEN** the visitor chooses the GitHub channel
- **THEN** the application opens the `bugchao/toolbox` new-issue page using safe external navigation
- **AND** the issue title identifies the selected feedback intent
- **AND** the issue body includes the current page title, route, and URL

### Requirement: Accessible and localized interaction

The feedback entry and chooser SHALL provide Chinese and English copy, work with keyboard navigation, expose meaningful accessible names, manage focus as a dialog, and remain legible in light and dark themes.

#### Scenario: Visitor uses the English locale

- **WHEN** the active application locale is English
- **THEN** the feedback trigger, chooser, intent labels, channel labels, and supporting copy are presented in English

#### Scenario: Visitor uses a keyboard

- **WHEN** the visitor opens and operates the chooser without a pointing device
- **THEN** focus moves into the chooser, all actions are keyboard reachable, Escape closes it, and focus returns to the trigger

### Requirement: No onsite feedback storage

The application SHALL NOT persist feedback content or send it through a Bug Tide backend; submission SHALL be handed off directly to the visitor's chosen email client or GitHub.

#### Scenario: Visitor selects a channel

- **WHEN** the visitor continues to email or GitHub
- **THEN** the application only constructs the external destination URL
- **AND** no feedback content is written to local storage or transmitted to a Bug Tide service
