## Context

The web application wraps normal routes in a shared `Layout` that already owns the responsive sidebar, top bar, and footer. Standalone tool windows bypass that shell. Feedback should be available throughout the normal product experience without adding a server endpoint, account requirement, or embedded form.

## Goals / Non-Goals

- Goals:
  - Make problem reporting and tool suggestions easy to discover on every shell-rendered page.
  - Support both GitHub and email with useful page context already filled in.
  - Preserve the current responsive, bilingual, light/dark shell behavior.
- Non-Goals:
  - Store feedback in the application or add a backend service.
  - Authenticate visitors or track feedback submission completion.
  - Show global shell controls inside standalone tool windows.

## Decisions

- Decision: Place a compact icon control in the existing top-bar action group and a text link in the footer. Both open the same chooser.
  - Rationale: the top bar gives persistent access while the footer offers a recognizable, low-noise fallback.
- Decision: Use a small modal dialog with two intents—problem report and tool suggestion—and email/GitHub actions for each intent.
  - Rationale: intent selection allows clearer pre-filled titles and templates without requiring an onsite form.
- Decision: Generate channel URLs in the browser from centralized destinations and current route context.
  - Rationale: this avoids server-side data collection and keeps the integration transparent.
- Decision: Target `https://github.com/bugchao/toolbox/issues/new` and use the approved public mailbox `lookdyc@gmail.com` for `mailto:` links.
  - Rationale: the repository remote establishes the canonical GitHub project, but Git metadata is not an acceptable source for publishing a personal email address.
- Decision: Use the existing indigo shell accents, semantic light/dark colors, and Lucide icon language.
  - Rationale: the entry should feel like part of the established product shell rather than a promotional widget.

## Risks / Trade-offs

- Pop-up blockers or mail-client availability can interrupt channel handoff. Mitigation: use ordinary links, clear labels, and safe new-tab behavior for GitHub.
- URLs have practical length limits. Mitigation: pre-fill concise metadata only—feedback type, page title, route, and page URL—leaving detailed content to the visitor.
- The top bar is dense on narrow screens. Mitigation: use an icon-only trigger with an accessible label and keep the dialog responsive.
- Public email addresses can attract spam. Mitigation: require explicit maintainer approval for the published mailbox and keep GitHub as an equal channel.

## Migration Plan

No data migration is required. The change can be rolled back by removing the shell trigger, footer link, locale keys, and tests.

## Resolved Questions

- The maintainer selected `lookdyc@gmail.com` as the public feedback mailbox.
