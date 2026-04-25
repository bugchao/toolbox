## Context

Browser-native `MediaDevices.getDisplayMedia` (screen capture) + `MediaRecorder` (encoding) + Web Audio API (mixing) cover the full pipeline. No third-party libs or backend needed. Browser support is uneven: Chromium-based browsers have the broadest coverage; Firefox supports the basics; Safari Desktop added `getDisplayMedia` recently and is partial; iOS Safari does not support it at all.

The tool runs entirely client-side and must make zero network requests during recording — this is a load-bearing privacy claim, not a nice-to-have.

## Goals / Non-Goals

**Goals:**

- One-shot capture → preview → download flow inside the existing toolbox shell
- Independent toggles for system audio and microphone, mixed when both are on
- Pause/resume that the user perceives as truly continuous (not split files)
- Hard fail with a clear message on unsupported browsers — no half-broken UI

**Non-Goals:**

- Cloud upload, sharing links, persistence
- Video editing (trim, splice, watermark)
- Format transcoding (e.g. WebM → MP4 in-browser)
- Camera overlay (picture-in-picture)
- Multi-segment recording or recording history

## Decisions

### Decision: Audio mixing via Web Audio API

When both system audio and microphone are enabled, combine them through `AudioContext` → `MediaStreamAudioSourceNode` (one per source) → shared `MediaStreamAudioDestinationNode` → use the destination's track in the final `MediaStream` handed to `MediaRecorder`.

**Why:** This is the standard browser-native way to combine multiple audio sources. No external mixing library needed.

**Alternatives considered:**

- Pass two audio tracks directly to `MediaStream`: rejected — `MediaRecorder` only encodes the first audio track, the second is silently dropped.
- Server-side mixing: rejected — violates the privacy/local-only invariant.

### Decision: Use `MediaRecorder.pause()` / `resume()` for pause UX, not stop+restart

The native pause is a single recording with a gap; stop+restart produces two separate Blobs. Users expect one continuous file.

**Why:** Aligns with mental model of "pause means pause, not stop". Avoids client-side concatenation (which is non-trivial for WebM containers).

**Risk:** Some older browsers don't implement `pause()` cleanly. Feature-detect `MediaRecorder.prototype.pause` on mount; if missing, hide the pause button and show stop only.

### Decision: Output format is whatever the browser picks

Use `MediaRecorder.isTypeSupported()` to pick the best available MIME (`video/webm; codecs=vp9` → `video/webm` → first supported type). Don't transcode.

**Why:** Transcoding to MP4 in-browser requires WebAssembly (FFmpeg.wasm ~25MB) and adds significant complexity. WebM plays in all modern browsers, VLC, QuickTime (with extension), and most editors. PRD §3.3 explicitly excludes transcoding.

### Decision: State machine, not ad-hoc booleans

Centralize recording state in a single union (`idle | requesting | recording | paused | finished | error`) inside one hook. No scattered `isRecording` / `isPaused` booleans across components.

**Why:** Recorder lifecycle has 6+ valid states with strict transitions; ad-hoc booleans make impossible states (e.g. `isRecording && isFinished`) representable. A union eliminates the class entirely.

### Decision: All track cleanup on every exit path

Every transition out of `recording` / `paused` (success, error, page nav) MUST stop every underlying track: screen track, system audio track, mic track, mixed-destination track, and the recorder itself.

**Why:** Stale tracks keep the browser tab's "recording" indicator on indefinitely and continue holding device permissions. This is both a UX bug and a privacy bug.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Long recordings can exceed available memory (Blob chunks accumulate in RAM) | Document a soft "this is for short recordings" expectation in the description; don't promise hour-long captures. Show running size estimate so users notice. |
| User stops the tool by closing the tab — no chance to clean tracks | `beforeunload` listener that calls cleanup; browser will warn. Acceptable degradation. |
| Browser bugs in `pause()` / `resume()` (Firefox historical issues) | Feature-detect on mount; hide pause if unreliable. Accept this is a UX-not-correctness issue. |
| Permission denied looks identical to "user closed picker" | Distinguish via the `getDisplayMedia` rejection reason (`NotAllowedError` vs `AbortError`); different copy for each. |
| Privacy claim ("zero network") could regress silently | Manual DevTools check is in the verification task list; consider a future automated network-spy test. |

## Migration Plan

N/A — net-new tool. No existing behavior to migrate.

## Resolved Questions

- **Size warning**: Show a non-blocking warning when the running size crosses **1 GB**. Recording continues, the user just sees a hint. Threshold chosen as a round number large enough that hobbyist recordings won't trip it.
- **MIME selection**: Expose an explicit MIME picker in the idle panel. Default to the recorder's first preferred type (`video/webm; codecs=vp9` if supported); list all `MediaRecorder.isTypeSupported()` matches as the picker options.
- **Transcoding to MP4**: Deferred — decide during implementation. If the WebM output causes practical playback issues for the target users, revisit (likely via FFmpeg.wasm). For now, ship raw recorder output.
