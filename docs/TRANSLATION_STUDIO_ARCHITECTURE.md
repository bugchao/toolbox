# Translation Studio Architecture

## Goal

Build `/translation-hub` as an AI-assisted translation platform rather than a plain text translator:

- multiple input modes
- multi-version output
- sentence-level editing
- translation memory and glossary
- document consistency
- backend-ready architecture for OCR, LLM, and enterprise providers

## Frontend Structure

```text
tools/tool-translation-hub/
  tool.manifest.ts
  package.json
  src/
    index.tsx
    TranslationHub.tsx
    constants.ts
    types.ts
    hooks/
      useTranslationStudio.ts
    services/
      providerGateway.ts
      fileExtractors.ts
      voice.ts
    components/
      SectionNav.tsx
      SegmentEditorCard.tsx
      HistoryRecordCard.tsx
    locales/
      zh.json
      en.json
```

### UI Layout

- `SectionNav`
  - section switching for main / documents / history / glossary / settings
  - high-level studio metrics
- `TranslationHub`
  - page shell
  - realtime orchestration
  - section routing
  - file import and voice input coordination
- `SegmentEditorCard`
  - source sentence
  - version tabs
  - inline editing
  - retranslate / optimize actions
  - provider outputs
  - explanation block
- `HistoryRecordCard`
  - restore / favorite workflow

## State Model

`useTranslationStudio.ts` owns the long-lived client state:

- request state
  - source language
  - target language
  - style
  - tone
  - context
  - source text
- result state
  - sentence segments
  - selected version per segment
  - provider outputs
- knowledge state
  - glossary
  - translation memory
  - history
- configuration state
  - selected APIs
  - selected web providers
  - realtime mode
  - multi-view mode
  - explanation mode
  - LibreTranslate endpoint / key

Persistence uses `@toolbox/storage`, so the studio keeps state across refreshes.

## Backend Structure

Recommended production structure:

```text
apps/
  api-gateway/
    src/
      routes/translation-routes.ts
      plugins/auth.ts
      plugins/rate-limit.ts

services/
  translation-service/
    src/
      index.ts
      routes/
        translate.ts
        document.ts
        glossary.ts
        memory.ts
        history.ts
      providers/
        openai-provider.ts
        libretranslate-provider.ts
        deepl-provider.ts
        google-provider.ts
        bing-provider.ts
      ocr/
        image-ocr.ts
        pdf-ocr.ts
      document/
        docx-parser.ts
        pdf-parser.ts
        chunker.ts
      tm/
        matcher.ts
        ranker.ts
      glossary/
        glossary-repository.ts
        term-applier.ts
      llm/
        rewrite.ts
        explanation.ts
        localization.ts

packages/
  contracts/
    translation.ts
  service-core/
  observability/
```

## Suggested API Surface

### `POST /api/translation/translate`

Input:

- text
- sourceLanguage
- targetLanguage
- style
- tone
- context
- glossary ids
- provider list

Output:

- segmented translations
- literal / adaptive / localized versions
- provider outputs
- explanation payload
- TM hits

### `POST /api/translation/document`

Input:

- uploaded file
- source / target language
- style / tone / context

Output:

- extracted text
- chunk map
- translated chunks
- merged document result
- consistency warnings

### `POST /api/translation/rewrite`

Input:

- sentence
- mode: natural | professional
- context

Output:

- improved sentence
- short explanation

### `GET/POST /api/translation/glossary`

- list glossary terms
- create / update / delete custom terms
- support enterprise glossary source later

### `GET/POST /api/translation/memory`

- query TM candidates
- save confirmed translation pairs
- rank similar sentences

## Progressive Delivery Plan

### Phase 1

- free API translation
- OCR in browser
- document extraction in browser
- sentence-level editing
- local history + glossary + TM

### Phase 2

- move translation orchestration to `translation-service`
- add LLM rewrite / explanation / localization endpoints
- add document chunking and long-context consistency control

### Phase 3

- enterprise glossary API
- collaboration history
- model routing by domain
- QA and terminology enforcement reports

## Why This Structure

- frontend stays fast and tool-local
- i18n stays inside the tool package
- backend can evolve from free APIs to managed providers without changing the main UI model
- document translation, OCR, TM, glossary, and explanation logic stay composable instead of being trapped in one page component
