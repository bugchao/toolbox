import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseCaptureDevices, parseTranscriptLine, pickOllamaModel } from './api.js'

test('parseTranscriptLine 提取带时间戳的转写文本', () => {
  assert.equal(parseTranscriptLine('[00:00:00.000 --> 00:00:02.340]   我们这周重点看上线节奏'), '我们这周重点看上线节奏')
  assert.equal(parseTranscriptLine('纯文本一行'), '纯文本一行')
})

test('parseTranscriptLine 过滤日志、标记和音效标注', () => {
  assert.equal(parseTranscriptLine('### Transcription 3 START'), null)
  assert.equal(parseTranscriptLine('[00:00:00.000 --> 00:00:01.000]  [BLANK_AUDIO]'), null)
  assert.equal(parseTranscriptLine('(музыка)'), null)
  assert.equal(parseTranscriptLine('   '), null)
  assert.equal(parseTranscriptLine('\x1B[2K\r'), null)
})

test('pickOllamaModel 跳过 embedding 模型并优先 qwen', () => {
  assert.equal(
    pickOllamaModel(['qwen3-embedding:4b', 'translategemma:4b', 'qwen3-coder:30b', 'llama3.1:latest']),
    'qwen3-coder:30b'
  )
  assert.equal(pickOllamaModel(['mxbai-embed-large:335m', 'llama3.1:latest']), 'llama3.1:latest')
  assert.equal(pickOllamaModel([]), null)
})

test('parseCaptureDevices 解析 SDL 设备列表', () => {
  const stderr = [
    'init: found 3 capture devices:',
    "init:    - Capture device #0: 'MacBook Pro Microphone'",
    "init:    - Capture device #1: 'BlackHole 2ch'",
    "init:    - Capture device #2: 'Aggregate Device'",
    'init: attempting to open default capture device ...',
  ].join('\n')
  assert.deepEqual(parseCaptureDevices(stderr), [
    { id: 0, name: 'MacBook Pro Microphone' },
    { id: 1, name: 'BlackHole 2ch' },
    { id: 2, name: 'Aggregate Device' },
  ])
})
