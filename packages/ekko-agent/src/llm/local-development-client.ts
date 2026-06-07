import type { ChatClient, ChatMessage } from '../core/types.js'

export class LocalDevelopmentClient implements ChatClient {
  async complete(messages: ChatMessage[]): Promise<string> {
    const latest = messages.at(-1)?.content ?? ''
    const firstUser = messages.find(message => message.role === 'user')?.content ?? ''
    const task = firstUser.toLowerCase()

    if (latest.startsWith('Tool result for')) {
      const result = latest
        .replace(/^Tool result for [^:]+:\n/, '')
        .split('\n\nContinue with JSON.')[0]
        .trim()
      return JSON.stringify({ final: result })
    }

    if (task.includes('time') || task.includes('date') || task.includes('时间')) {
      return JSON.stringify({ tool: { name: 'clock.now', input: {} } })
    }

    if (task.includes('cwd') || task.includes('pwd') || task.includes('目录')) {
      return JSON.stringify({ tool: { name: 'workspace.cwd', input: {} } })
    }

    if (task.includes('list') || task.includes('files') || task.includes('ls') || task.includes('文件')) {
      return JSON.stringify({ tool: { name: 'workspace.list', input: { path: '.' } } })
    }

    return JSON.stringify({
      final: [
        'Ekko Agent is running with the local development client.',
        'Set EKKO_AGENT_API_KEY and EKKO_AGENT_MODEL to use an OpenAI-compatible model.',
        `Task: ${firstUser}`,
      ].join('\n'),
    })
  }
}
