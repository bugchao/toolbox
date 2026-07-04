import { defineServiceModule } from '@toolbox/service-core'
import { createMeetingAudioApiMiddleware } from './api.js'

export const meetingAudioService = defineServiceModule({
  id: 'meeting-audio-service',
  name: 'Meeting Audio Service',
  version: '1.0.0',
  kind: 'domain',
  summary: 'Local system-audio capture and transcription (BlackHole + whisper.cpp), with optional Ollama minutes.',
  capabilities: ['meeting-audio-stream', 'meeting-minutes-summarize'],
  routePrefixes: ['/api/meeting-audio'],
  async register(app) {
    app.use(createMeetingAudioApiMiddleware())
  },
})
