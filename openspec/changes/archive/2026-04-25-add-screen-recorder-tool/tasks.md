## 1. Scaffold

- [ ] 1.1 Run `pnpm create:tool screen-recorder`
- [ ] 1.2 Run `pnpm install` to link the new workspace package
- [ ] 1.3 Edit `tools/tool-screen-recorder/tool.manifest.ts`: real `categoryKey` (`utility`), meaningful `lucide-react` icon (e.g. `Video` or `Monitor`), full `keywords` list, `meta.zh` / `meta.en`, `mode: 'client'`

## 2. UI primitives

- [ ] 2.1 Audit `@toolbox/ui-kit` for `Switch` (or equivalent toggle). If missing, add it to `packages/ui-kit/` first with a minimal API
- [ ] 2.2 Confirm `PageHero`, `Card`, `Button` are reused as-is (no per-tool wrappers)

## 3. State machine

- [ ] 3.1 Define a state union: `idle | requesting | recording | paused | finished | error`
- [ ] 3.2 Implement state transitions as a small reducer or hook in `src/hooks/useScreenRecorder.ts`
- [ ] 3.3 Each transition logs a single source-of-truth event (no silent state changes)

## 4. Capture pipeline

- [ ] 4.1 `getDisplayMedia({ video: true, audio: <systemAudioToggle> })` for screen + system audio
- [ ] 4.2 If `micToggle`: separately `getUserMedia({ audio: true })` for mic
- [ ] 4.3 Mix system audio + mic via Web Audio API (`AudioContext` + `MediaStreamAudioSourceNode` + `MediaStreamAudioDestinationNode`) when both are on
- [ ] 4.4 Wire the mixed audio track into the final `MediaStream` passed to `MediaRecorder`
- [ ] 4.5 Stop ALL underlying tracks (screen, system audio, mic, mixed) when recording ends or errors

## 5. Recording lifecycle

- [ ] 5.1 `MediaRecorder.start(timeslice)` collecting Blob chunks
- [ ] 5.2 `pause()` / `resume()` wired to UI buttons; timer pauses/resumes in lockstep
- [ ] 5.3 `stop()` finalizes — assemble Blob with the recorder's `mimeType`
- [ ] 5.4 Generate object URL for preview, revoke on unmount or restart

## 6. UI panels

- [ ] 6.1 `IdlePanel`: system-audio + mic toggles + MIME picker + start button + hint
- [ ] 6.2 MIME picker enumerates `MediaRecorder.isTypeSupported()` results in preference order; default = first supported
- [ ] 6.3 `RecordingPanel`: live timer (HH:MM:SS), running size estimate, **1 GB warning indicator (dismissible)**, pause/resume button (label switches), stop button, paused/recording status indicator
- [ ] 6.4 `FinishedPanel`: `<video>` preview, duration + size labels, download button (timestamped filename + MIME-derived extension), restart button
- [ ] 6.5 `ErrorPanel`: distinct messages for `unsupported`, `permissionDenied`, `deviceError`, `recordingFailed` + retry/restart action

## 7. i18n

- [ ] 7.1 Fill `src/locales/zh.json` with all keys from PRD §7
- [ ] 7.2 Fill `src/locales/en.json` with the same key set, English copy
- [ ] 7.3 Spot-check: switch language in dev, no raw keys leak

## 8. Browser support guard

- [ ] 8.1 On mount, feature-detect `navigator.mediaDevices?.getDisplayMedia`. If absent, render `ErrorPanel` with `error.unsupported` and skip all other logic

## 9. Quality gate

- [ ] 9.1 `pnpm check:consistency` passes
- [ ] 9.2 `pnpm lint` passes
- [ ] 9.3 `pnpm -C apps/web build` passes (no dynamic-import warnings for this tool)
- [ ] 9.4 `pnpm test` passes

## 10. Tests

- [ ] 10.1 Unit test for timer formatting (HH:MM:SS) — `tools/tool-screen-recorder/src/lib/formatDuration.test.ts`
- [ ] 10.2 Unit test for the state-machine transitions — `tools/tool-screen-recorder/src/hooks/useScreenRecorder.test.ts`
- [ ] 10.3 E2E `tests/screen-recorder.spec.ts`: navigate to `/screen-recorder`, assert title visible, assert idle-panel start button visible, take screenshot of idle state to `docs/tools/screen-recorder/screenshots/idle.png`

## 11. Privacy verification

- [ ] 11.1 Manually verify in DevTools Network tab: 60 seconds of recording produces zero network requests

## 12. Review chain

- [ ] 12.1 `simplify` skill on diff
- [ ] 12.2 `security-review` skill (special focus: no network, no localStorage leakage, track cleanup)
- [ ] 12.3 `/codex:review` loop (≤5 iterations)
- [ ] 12.4 `/codex:adversarial-review` final pass
