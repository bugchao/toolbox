import { useMemo } from 'react'
import { useToolStorage } from '@toolbox/storage'
import { DEFAULT_STATE, STORAGE_KEY, STORAGE_NAMESPACE } from '../constants'
import type {
  ApiProviderId,
  GlossaryEntry,
  SegmentTranslation,
  StudioSection,
  TranslateRequest,
  TranslationHistoryRecord,
  TranslationMemoryEntry,
  TranslationStudioState,
  TranslationVariant,
} from '../types'
import { findMemoryMatch, splitIntoSegments, translateWithProviders } from '../services/providerGateway'

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`
}

function applyGlossary(text: string, glossary: GlossaryEntry[], sourceLanguage: string, targetLanguage: string) {
  return glossary
    .filter((entry) => entry.sourceLanguage === sourceLanguage && entry.targetLanguage === targetLanguage)
    .reduce((acc, entry) => acc.replaceAll(entry.sourceTerm, entry.targetTerm), text)
}

function buildExplanation({
  context,
  style,
  tone,
  providerCount,
  glossaryHits,
  memoryHit,
}: {
  context: string
  style: string
  tone: string
  providerCount: number
  glossaryHits: number
  memoryHit: boolean
}) {
  const lines = [
    `Style: ${style}, tone: ${tone}.`,
    providerCount > 1 ? `Compared ${providerCount} translation providers for this segment.` : 'Used one translation provider for this segment.',
  ]
  if (context.trim()) lines.push(`Context applied: ${context.trim()}.`)
  if (glossaryHits > 0) lines.push(`Applied ${glossaryHits} glossary term adjustments to keep terminology consistent.`)
  if (memoryHit) lines.push('Translation memory provided a reusable match for this sentence.')
  lines.push('Localization version prioritizes readability, consistency, and natural phrasing.')
  return lines
}

function buildSuggestions(translations: string[]) {
  return Array.from(new Set(translations.filter(Boolean))).slice(0, 3)
}

export function useTranslationStudio() {
  const { data: state, save, loading } = useToolStorage<TranslationStudioState>(STORAGE_NAMESPACE, STORAGE_KEY, DEFAULT_STATE)

  const actions = useMemo(() => {
    const savePartial = (partial: Partial<TranslationStudioState>) => {
      save({ ...state, ...partial })
    }

    return {
      setSection(section: StudioSection) {
        savePartial({ activeSection: section })
      },
      updateSourceText(sourceText: string) {
        savePartial({ sourceText })
      },
      updateRequest<K extends keyof Pick<TranslationStudioState, 'sourceLanguage' | 'targetLanguage' | 'style' | 'tone' | 'context'>>(
        key: K,
        value: TranslationStudioState[K]
      ) {
        savePartial({ [key]: value } as Partial<TranslationStudioState>)
      },
      updateConfig(partial: Partial<TranslationStudioState['config']>) {
        savePartial({ config: { ...state.config, ...partial } })
      },
      async translateAll(request?: Partial<TranslateRequest>) {
        const translateRequest: TranslateRequest = {
          text: request?.text ?? state.sourceText,
          sourceLanguage: request?.sourceLanguage ?? state.sourceLanguage,
          targetLanguage: request?.targetLanguage ?? state.targetLanguage,
          style: request?.style ?? state.style,
          tone: request?.tone ?? state.tone,
          context: request?.context ?? state.context,
        }

        const segments = splitIntoSegments(translateRequest.text)
        const built: SegmentTranslation[] = []
        const newMemory = [...state.memory]

        for (const source of segments) {
          const memoryMatch =
            translateRequest.sourceLanguage !== 'auto'
              ? findMemoryMatch(
                  state.memory,
                  source,
                  translateRequest.sourceLanguage,
                  translateRequest.targetLanguage,
                  translateRequest.style,
                  translateRequest.tone
                )
              : undefined

          let providerOutputs: Partial<Record<ApiProviderId, string>> = {}
          if (memoryMatch) {
            providerOutputs = { mymemory: memoryMatch.translatedText }
          } else {
            try {
              const responses = await translateWithProviders(
                {
                  ...translateRequest,
                  text: source,
                },
                state.config.selectedApiProviders,
                state.config
              )
              providerOutputs = responses.reduce((acc, item) => {
                acc[item.providerId] = item.translatedText
                return acc
              }, {} as Partial<Record<ApiProviderId, string>>)
            } catch {
              providerOutputs = {}
            }
          }

          const providerTexts = Object.values(providerOutputs)
          const literal = applyGlossary(
            providerTexts[0] ?? source,
            state.glossary,
            translateRequest.sourceLanguage === 'auto' ? 'en' : translateRequest.sourceLanguage,
            translateRequest.targetLanguage
          )
          const adaptive = applyGlossary(
            providerTexts[1] ?? providerTexts[0] ?? source,
            state.glossary,
            translateRequest.sourceLanguage === 'auto' ? 'en' : translateRequest.sourceLanguage,
            translateRequest.targetLanguage
          )
          const localized = adaptive
            .replaceAll(' ,', ',')
            .replaceAll(' .', '.')
            .replaceAll('  ', ' ')
            .trim()

          const segment: SegmentTranslation = {
            id: makeId('segment'),
            source,
            translations: {
              literal,
              adaptive,
              localized,
            },
            selectedVariant: 'localized',
            suggestions: buildSuggestions([literal, adaptive, localized]),
            explanation: buildExplanation({
              context: translateRequest.context,
              style: translateRequest.style,
              tone: translateRequest.tone,
              providerCount: providerTexts.length,
              glossaryHits: state.glossary.filter((entry) => source.includes(entry.sourceTerm)).length,
              memoryHit: Boolean(memoryMatch),
            }),
            providerOutputs,
            status: providerTexts.length ? 'ready' : 'error',
            memoryHit: Boolean(memoryMatch),
          }

          built.push(segment)

          if (!memoryMatch && translateRequest.sourceLanguage !== 'auto' && segment.translations.localized) {
            newMemory.unshift({
              id: makeId('memory'),
              sourceText: source,
              translatedText: segment.translations.localized,
              sourceLanguage: translateRequest.sourceLanguage,
              targetLanguage: translateRequest.targetLanguage,
              style: translateRequest.style,
              tone: translateRequest.tone,
              providerId: state.config.selectedApiProviders[0] ?? 'memory',
              updatedAt: new Date().toISOString(),
            })
          }
        }

        const historyRecord: TranslationHistoryRecord = {
          id: makeId('history'),
          createdAt: new Date().toISOString(),
          sourceText: translateRequest.text,
          sourceLanguage: translateRequest.sourceLanguage,
          targetLanguage: translateRequest.targetLanguage,
          style: translateRequest.style,
          tone: translateRequest.tone,
          context: translateRequest.context,
          favorite: false,
          segments: built,
        }

        save({
          ...state,
          sourceText: translateRequest.text,
          sourceLanguage: translateRequest.sourceLanguage,
          targetLanguage: translateRequest.targetLanguage,
          style: translateRequest.style,
          tone: translateRequest.tone,
          context: translateRequest.context,
          segments: built,
          history: [historyRecord, ...state.history].slice(0, 40),
          memory: newMemory.slice(0, 300),
          activeHistoryId: historyRecord.id,
        })
      },
      async retranslateSegment(segmentId: string) {
        const segment = state.segments.find((item) => item.id === segmentId)
        if (!segment) return

        const responses = await translateWithProviders(
          {
            text: segment.source,
            sourceLanguage: state.sourceLanguage,
            targetLanguage: state.targetLanguage,
            style: state.style,
            tone: state.tone,
            context: state.context,
          },
          state.config.selectedApiProviders,
          state.config
        )
        const providerOutputs = responses.reduce((acc, item) => {
          acc[item.providerId] = item.translatedText
          return acc
        }, {} as Partial<Record<ApiProviderId, string>>)
        const providerTexts = Object.values(providerOutputs)
        const nextSegments = state.segments.map((item) =>
          item.id === segmentId
            ? {
                ...item,
                providerOutputs,
                translations: {
                  literal: providerTexts[0] ?? item.translations.literal,
                  adaptive: providerTexts[1] ?? providerTexts[0] ?? item.translations.adaptive,
                  localized: (providerTexts[1] ?? providerTexts[0] ?? item.translations.localized).trim(),
                },
                suggestions: buildSuggestions(providerTexts.length ? providerTexts : Object.values(item.translations)),
                status: providerTexts.length ? 'ready' : 'error',
              }
            : item
        )
        savePartial({ segments: nextSegments })
      },
      optimizeSegment(segmentId: string, mode: 'natural' | 'professional') {
        const nextSegments = state.segments.map((item) => {
          if (item.id !== segmentId) return item
          const base = item.translations.localized
          const optimized =
            mode === 'professional'
              ? `${base}`.replace(/\b(can't|won't)\b/gi, (value) => value === "can't" ? 'cannot' : 'will not')
              : `${base}`.replace(/\b(do not)\b/gi, 'don\'t')
          return {
            ...item,
            translations: {
              ...item.translations,
              localized: optimized,
            },
            suggestions: buildSuggestions([optimized, ...item.suggestions]),
          }
        })
        savePartial({ segments: nextSegments })
      },
      setSegmentVariant(segmentId: string, variant: TranslationVariant) {
        const nextSegments = state.segments.map((item) =>
          item.id === segmentId ? { ...item, selectedVariant: variant } : item
        )
        savePartial({ segments: nextSegments })
      },
      updateSegmentTranslation(segmentId: string, variant: TranslationVariant, value: string) {
        const nextSegments = state.segments.map((item) =>
          item.id === segmentId
            ? {
                ...item,
                translations: {
                  ...item.translations,
                  [variant]: value,
                },
              }
            : item
        )
        savePartial({ segments: nextSegments })
      },
      applySuggestion(segmentId: string, suggestion: string) {
        const nextSegments = state.segments.map((item) =>
          item.id === segmentId
            ? {
                ...item,
                translations: {
                  ...item.translations,
                  [item.selectedVariant]: suggestion,
                },
              }
            : item
        )
        savePartial({ segments: nextSegments })
      },
      importSourceText(sourceText: string) {
        savePartial({ sourceText, activeSection: 'main' })
      },
      toggleFavorite(historyId: string) {
        const nextHistory = state.history.map((item) =>
          item.id === historyId ? { ...item, favorite: !item.favorite } : item
        )
        savePartial({ history: nextHistory })
      },
      restoreHistory(historyId: string) {
        const record = state.history.find((item) => item.id === historyId)
        if (!record) return
        save({
          ...state,
          sourceText: record.sourceText,
          sourceLanguage: record.sourceLanguage,
          targetLanguage: record.targetLanguage,
          style: record.style,
          tone: record.tone,
          context: record.context,
          segments: record.segments,
          activeHistoryId: historyId,
          activeSection: 'main',
        })
      },
      addGlossaryEntry(entry: Omit<GlossaryEntry, 'id'>) {
        savePartial({
          glossary: [{ ...entry, id: makeId('glossary') }, ...state.glossary],
        })
      },
      removeGlossaryEntry(entryId: string) {
        savePartial({
          glossary: state.glossary.filter((item) => item.id !== entryId),
        })
      },
    }
  }, [loading, save, state])

  return { state, actions, loading }
}
