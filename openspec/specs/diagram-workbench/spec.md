# diagram-workbench Specification

## Purpose
TBD - created by archiving change add-diagram-workbench. Update Purpose after archive.
## Requirements
### Requirement: Workbench Shell

The system SHALL provide a browser-based diagram workbench as a private package in the monorepo.

#### Scenario: First load with no local workspace

- **WHEN** the user opens the app with no IndexedDB workspace
- **THEN** the system creates a workspace with one Mermaid diagram
- **AND** marks that diagram as the main diagram
- **AND** selects it in the editor.

#### Scenario: Load existing workspace

- **GIVEN** IndexedDB contains a workspace with `mainDiagramId`
- **WHEN** the user opens the app
- **THEN** the system loads all diagrams
- **AND** selects the main diagram.

### Requirement: Main Diagram Selection

The system SHALL allow exactly one diagram in a workspace to be marked as the main diagram.

#### Scenario: Mark diagram as main

- **GIVEN** a workspace contains multiple diagrams
- **WHEN** the user marks a non-main diagram as main
- **THEN** the system updates `mainDiagramId`
- **AND** removes the main badge from the previous main diagram
- **AND** persists the change locally.

#### Scenario: Delete main diagram

- **GIVEN** a workspace contains multiple diagrams
- **AND** the selected diagram is the main diagram
- **WHEN** the user deletes the main diagram
- **THEN** the system marks the next available diagram as main
- **AND** selects that diagram.

### Requirement: Mermaid Support

The system SHALL support Mermaid diagram creation, editing, preview, validation, import, and export.

#### Scenario: Render valid Mermaid source

- **GIVEN** a Mermaid diagram contains valid source
- **WHEN** the preview renders
- **THEN** the system displays an SVG preview.

#### Scenario: Handle invalid Mermaid source

- **GIVEN** a Mermaid diagram contains invalid source
- **WHEN** the preview renders
- **THEN** the system shows an inline error
- **AND** preserves the source text.

### Requirement: PlantUML Support

The system SHALL support PlantUML diagram creation, editing, preview, import, and export through a configurable PlantUML server URL.

#### Scenario: Render PlantUML through configured server

- **GIVEN** the PlantUML server URL is reachable
- **AND** the PlantUML source is valid
- **WHEN** the preview renders
- **THEN** the system requests the encoded SVG URL from the configured server
- **AND** displays the returned SVG.

#### Scenario: PlantUML server unavailable

- **GIVEN** the PlantUML server URL is unreachable
- **WHEN** the preview renders
- **THEN** the system shows an inline error that includes the server URL
- **AND** preserves the source text.

### Requirement: draw.io Support

The system SHALL support draw.io/diagrams.net XML editing through embed mode.

#### Scenario: Open draw.io document

- **GIVEN** a diagram has engine `drawio`
- **WHEN** the user selects it
- **THEN** the system opens a diagrams.net iframe
- **AND** sends the diagram XML to the iframe after editor readiness.

#### Scenario: Save draw.io XML

- **GIVEN** the draw.io iframe posts a save message from the configured diagrams.net origin
- **WHEN** the system receives the message
- **THEN** it stores the XML as the diagram source
- **AND** persists the workspace locally.

#### Scenario: Reject untrusted draw.io message

- **GIVEN** a `postMessage` event comes from an origin other than the configured diagrams.net origin
- **WHEN** the system receives the message
- **THEN** it ignores the message.

### Requirement: Local Persistence

The system SHALL persist workspace data locally without requiring a backend service.

#### Scenario: Autosave source changes

- **GIVEN** a diagram is selected
- **WHEN** the user edits source or settings
- **THEN** the system saves the workspace to IndexedDB after a debounce
- **AND** updates the status bar from unsaved to saving to saved.

#### Scenario: IndexedDB unavailable

- **GIVEN** IndexedDB write fails
- **WHEN** the user changes a diagram
- **THEN** the system shows an error state
- **AND** offers workspace JSON export as a fallback.

### Requirement: Import

The system SHALL import Mermaid, PlantUML, draw.io XML, and workspace JSON files.

#### Scenario: Import source files

- **WHEN** the user imports `.mmd`, `.mermaid`, `.puml`, `.plantuml`, `.drawio`, or `.xml` files
- **THEN** the system creates diagrams with the correct engine type
- **AND** preserves the original source content.

#### Scenario: Import workspace JSON

- **GIVEN** the user selects a valid workspace JSON file
- **WHEN** the user confirms replacement
- **THEN** the system replaces the current workspace
- **AND** selects the imported main diagram.

### Requirement: Export

The system SHALL export the selected diagram and the full workspace.

#### Scenario: Export current diagram source

- **GIVEN** a diagram is selected
- **WHEN** the user exports source
- **THEN** the system downloads a file with the engine-specific source extension.

#### Scenario: Export current diagram SVG

- **GIVEN** the selected diagram engine supports SVG export
- **WHEN** the user exports SVG
- **THEN** the system downloads an SVG Blob.

#### Scenario: Export workspace JSON

- **WHEN** the user exports workspace JSON
- **THEN** the system downloads a JSON file containing schema version, workspace metadata, diagrams, settings, and main diagram ID.

### Requirement: Privacy Warning

The system SHALL warn users when PlantUML rendering uses a non-local server URL.

#### Scenario: Non-local PlantUML server URL

- **GIVEN** the PlantUML server URL does not start with `http://localhost`, `http://127.0.0.1`, or an approved internal origin
- **WHEN** the user selects PlantUML preview or export
- **THEN** the system displays a privacy warning before sending source to the server.

