# screen-recorder Specification

## Purpose
TBD - created by archiving change add-screen-recorder-tool. Update Purpose after archive.
## Requirements
### Requirement: Screen Capture Initiation

The tool SHALL start a screen capture session using the browser's native `MediaDevices.getDisplayMedia` API when the user clicks the start button on the idle panel. The browser's native source picker (tab / window / full screen) is the sole mechanism for source selection — the tool MUST NOT render its own source-type chooser.

#### Scenario: User starts recording with default options
- **WHEN** the user clicks "Start recording" on the idle panel with both audio toggles off
- **THEN** the browser's native source picker opens
- **AND** after the user picks a source, the tool transitions to `recording` state
- **AND** the recording panel becomes visible

#### Scenario: User cancels the source picker
- **WHEN** the user clicks "Start recording"
- **AND** dismisses the browser source picker without choosing a source
- **THEN** the tool returns to `idle` state with no error message
- **AND** no tracks are left open

#### Scenario: User denies screen-share permission
- **WHEN** the user clicks "Start recording"
- **AND** the browser rejects the request with `NotAllowedError`
- **THEN** the tool transitions to `error` state with `error.permissionDenied` copy
- **AND** the user can retry from the error panel

### Requirement: Audio Source Selection

The tool SHALL provide independent toggles for system audio and microphone audio. Each toggle's state at recording start MUST determine whether that audio source is captured. Toggling AFTER recording starts MUST NOT affect the active recording.

#### Scenario: System audio only
- **WHEN** the user enables "Include system audio" and disables microphone
- **AND** starts recording
- **THEN** `getDisplayMedia` is called with `audio: true`
- **AND** `getUserMedia` is NOT called for the microphone

#### Scenario: Microphone only
- **WHEN** the user disables system audio and enables microphone
- **AND** starts recording
- **THEN** `getDisplayMedia` is called with `audio: false`
- **AND** `getUserMedia({ audio: true })` is called separately

#### Scenario: Both audio sources mixed
- **WHEN** the user enables both system audio and microphone
- **AND** starts recording
- **THEN** the system-audio track and microphone track are mixed via Web Audio API into a single audio track
- **AND** the mixed track is the only audio track on the final `MediaStream` passed to `MediaRecorder`

### Requirement: Recording Control Lifecycle

The tool SHALL support pause, resume, and stop operations on an in-progress recording. Pause MUST yield a single continuous output file when resumed and stopped — NOT multiple files.

#### Scenario: Pause then resume
- **WHEN** the user is recording
- **AND** clicks "Pause"
- **THEN** the tool calls `MediaRecorder.pause()`
- **AND** transitions to `paused` state
- **AND** the timer stops incrementing
- **WHEN** the user clicks "Resume"
- **THEN** `MediaRecorder.resume()` is called
- **AND** the tool returns to `recording` state
- **AND** the timer continues from the paused value (NOT reset)

#### Scenario: Stop produces single output
- **WHEN** the user is recording
- **AND** clicks "Stop"
- **THEN** the tool calls `MediaRecorder.stop()`
- **AND** assembles all collected chunks into a single Blob
- **AND** transitions to `finished` state with the Blob's object URL bound to the preview `<video>`

#### Scenario: Pause not supported
- **WHEN** the browser does not implement `MediaRecorder.prototype.pause`
- **THEN** the pause button MUST NOT render in the recording panel
- **AND** the stop button remains visible

### Requirement: Live Recording Timer

The tool SHALL display the elapsed recording time during the `recording` and `paused` states in `HH:MM:SS` format, accurate to within ±1 second over the recording duration. The timer MUST stop counting during `paused` and resume from the same value on resume.

#### Scenario: Timer accuracy
- **WHEN** the recording has been active for 65 seconds with no pauses
- **THEN** the timer displays `00:01:05` (±1 second)

#### Scenario: Timer pauses with recording
- **WHEN** the recording is paused at `00:00:30`
- **AND** stays paused for 10 wall-clock seconds
- **THEN** the timer still displays `00:00:30` after those 10 seconds

### Requirement: Output Format Selection

The tool SHALL expose an explicit MIME-type picker in the idle panel. The picker MUST list every type for which `MediaRecorder.isTypeSupported()` returns true, in preference order (`video/webm; codecs=vp9` → `video/webm; codecs=vp8` → `video/webm` → other supported video/* types). The default selection MUST be the first supported type.

#### Scenario: Default MIME selection
- **WHEN** the user opens the tool in a browser that supports `video/webm; codecs=vp9`
- **THEN** the MIME picker defaults to `video/webm; codecs=vp9`

#### Scenario: User overrides MIME
- **WHEN** the user opens the picker and selects `video/webm; codecs=vp8`
- **AND** starts recording
- **THEN** `MediaRecorder` is constructed with `mimeType: 'video/webm; codecs=vp8'`
- **AND** the downloaded filename uses the corresponding extension

### Requirement: Recording Size Awareness

The tool SHALL display a running size estimate during recording. When the estimated size crosses **1 GB**, the tool MUST display a non-blocking warning indicating the recording is large; recording MUST continue and the user MUST NOT be forced to stop.

#### Scenario: Size warning at 1 GB
- **WHEN** the recording's accumulated chunk size first crosses 1 GB
- **THEN** a warning indicator appears next to the size readout
- **AND** the recording continues uninterrupted

#### Scenario: User dismisses warning
- **WHEN** the warning is visible
- **AND** the user dismisses it
- **THEN** the warning hides for the remainder of the current recording session
- **AND** the size readout continues to update

### Requirement: Output Preview and Download

The tool SHALL preview the finished recording in an in-page `<video>` element and provide a download button that saves the Blob to the user's local filesystem with a timestamped filename and the recorder's native MIME extension.

#### Scenario: Preview after stop
- **WHEN** the recording transitions to `finished`
- **THEN** an HTML `<video controls>` element is rendered with the Blob URL as its `src`
- **AND** the duration and approximate size are displayed alongside

#### Scenario: Download to local file
- **WHEN** the user clicks "Download"
- **THEN** the browser triggers a download with filename `screen-recording-YYYYMMDD-HHmmss.<ext>` where `<ext>` matches the recorder's MIME (e.g. `webm`)
- **AND** no network request is made

### Requirement: Local-Only Operation

The tool SHALL NOT make any network request during the entire recording flow (idle → recording → paused → finished → download). Any third-party tracking, analytics, or remote font/asset fetch MUST NOT execute as a result of this tool's logic.

#### Scenario: Zero network during recording
- **WHEN** the user records for any duration and downloads the result
- **THEN** the browser's network tab shows zero requests originated by this tool's code
- **AND** the downloaded file is stored only on the user's local filesystem

### Requirement: Browser Support Guard

The tool SHALL feature-detect `navigator.mediaDevices.getDisplayMedia` on mount. If unavailable, the tool MUST render an unsupported-browser message and SHALL NOT execute any other recording logic for the lifetime of the session.

#### Scenario: Unsupported browser
- **WHEN** the user opens the tool in a browser without `getDisplayMedia` (e.g. iOS Safari)
- **THEN** the page displays the `error.unsupported` message
- **AND** the start button is not rendered
- **AND** no permission prompts ever fire

### Requirement: Resource Cleanup

On every exit from `recording` or `paused` (whether by user stop, error, or page unload), the tool SHALL stop every active media track (screen video, system audio, microphone, and any mixed audio destination) AND release the `MediaRecorder` reference. The browser's "this tab is recording" indicator MUST clear within 1 second of leaving the recording state.

#### Scenario: Cleanup on stop
- **WHEN** the user clicks "Stop"
- **THEN** every track from the original `MediaStream` is stopped via `track.stop()`
- **AND** any auxiliary microphone stream is stopped
- **AND** any `AudioContext` used for mixing is closed
- **AND** within 1 second, the browser's tab recording indicator is no longer shown

#### Scenario: Cleanup on error
- **WHEN** the recording transitions to `error` from `recording` (e.g. underlying device disconnected)
- **THEN** the same full cleanup as on stop is performed before transitioning to `error` state

