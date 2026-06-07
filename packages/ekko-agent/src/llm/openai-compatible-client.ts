import type { ChatClient, ChatMessage } from '../core/types.js'

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
}

export interface OpenAICompatibleClientOptions {
  apiKey: string
  baseUrl: string
  model: string
  timeoutMs?: number
}

export class OpenAICompatibleClient implements ChatClient {
  constructor(private readonly options: OpenAICompatibleClientOptions) {}

  async complete(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${this.options.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.options.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.options.model,
        messages,
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(this.options.timeoutMs ?? 60_000),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Chat completion failed: ${response.status} ${response.statusText}\n${body}`)
    }

    const data = (await response.json()) as ChatCompletionResponse
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('Chat completion returned no message content')
    }

    return content
  }
}
