import type { ChatClient } from '../core/types.js'
import { LocalDevelopmentClient } from './local-development-client.js'
import { OpenAICompatibleClient } from './openai-compatible-client.js'

export function createChatClientFromEnv(): ChatClient {
  const apiKey = process.env.EKKO_AGENT_API_KEY || process.env.OPENAI_API_KEY
  if (!apiKey) return new LocalDevelopmentClient()

  return new OpenAICompatibleClient({
    apiKey,
    baseUrl: process.env.EKKO_AGENT_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.EKKO_AGENT_MODEL || 'gpt-4.1-mini',
  })
}
