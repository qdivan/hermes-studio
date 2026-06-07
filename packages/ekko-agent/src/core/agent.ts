import { buildSystemPrompt, parseAgentReply } from './protocol.js'
import type { AgentContext, AgentRunOptions, AgentRunResult, AgentStep, AgentTool, ChatClient, ChatMessage } from './types.js'

export class EkkoAgent {
  private readonly tools = new Map<string, AgentTool>()

  constructor(
    private readonly chatClient: ChatClient,
    tools: AgentTool[],
    private readonly context: AgentContext,
  ) {
    for (const tool of tools) {
      this.tools.set(tool.name, tool)
    }
  }

  async run(task: string, options: AgentRunOptions = {}): Promise<AgentRunResult> {
    const maxSteps = options.maxSteps ?? 6
    const steps: AgentStep[] = []
    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt([...this.tools.values()]) },
      { role: 'user', content: task },
    ]

    for (let step = 0; step < maxSteps; step += 1) {
      const assistantContent = await this.chatClient.complete(messages)
      steps.push({ kind: 'assistant', content: assistantContent })
      messages.push({ role: 'assistant', content: assistantContent })

      const reply = parseAgentReply(assistantContent)
      if (reply.type === 'final') {
        return { answer: reply.content, steps }
      }

      const tool = this.tools.get(reply.name)
      if (!tool) {
        return {
          answer: `Unknown tool: ${reply.name}`,
          steps,
        }
      }

      const result = await tool.run(reply.input, this.context)
      steps.push({ kind: 'tool', toolName: reply.name, content: result })
      messages.push({
        role: 'user',
        content: [
          `Tool result for ${reply.name}:`,
          result,
          '',
          'Continue with JSON. Call another tool if needed, or return {"final":"..."}',
        ].join('\n'),
      })
    }

    return {
      answer: `Stopped after ${maxSteps} steps without a final answer.`,
      steps,
    }
  }
}
