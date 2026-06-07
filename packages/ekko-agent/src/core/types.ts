export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatClient {
  complete(messages: ChatMessage[]): Promise<string>
}

export interface AgentContext {
  cwd: string
  now(): Date
  log(message: string): void
}

export interface AgentTool<Input = unknown> {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  run(input: Input, context: AgentContext): Promise<string>
}

export interface AgentRunOptions {
  maxSteps?: number
}

export interface AgentRunResult {
  answer: string
  steps: AgentStep[]
}

export interface AgentStep {
  kind: 'assistant' | 'tool'
  content: string
  toolName?: string
}

export type ParsedAgentReply =
  | { type: 'final'; content: string }
  | { type: 'tool'; name: string; input: unknown; raw: string }
