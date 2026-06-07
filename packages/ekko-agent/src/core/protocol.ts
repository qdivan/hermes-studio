import type { AgentTool, ParsedAgentReply } from './types.js'

export function buildSystemPrompt(tools: AgentTool[]): string {
  const toolDescriptions = tools
    .map(tool => {
      return [
        `- ${tool.name}: ${tool.description}`,
        `  input_schema: ${JSON.stringify(tool.inputSchema)}`,
      ].join('\n')
    })
    .join('\n')

  return [
    'You are Ekko Agent, a local development agent.',
    'You can answer directly or call one tool at a time.',
    'Return only JSON. Do not wrap it in markdown.',
    '',
    'To call a tool:',
    '{"tool":{"name":"tool.name","input":{}}}',
    '',
    'To finish:',
    '{"final":"your answer"}',
    '',
    'Available tools:',
    toolDescriptions || 'No tools registered.',
  ].join('\n')
}

export function parseAgentReply(content: string): ParsedAgentReply {
  const trimmed = content.trim()
  const parsed = parseJsonObject(trimmed)

  if (!parsed) {
    return { type: 'final', content: trimmed }
  }

  if (typeof parsed.final === 'string') {
    return { type: 'final', content: parsed.final }
  }

  if (
    parsed.tool
    && typeof parsed.tool === 'object'
    && !Array.isArray(parsed.tool)
    && typeof parsed.tool.name === 'string'
  ) {
    return {
      type: 'tool',
      name: parsed.tool.name,
      input: 'input' in parsed.tool ? parsed.tool.input : {},
      raw: trimmed,
    }
  }

  return { type: 'final', content: trimmed }
}

function parseJsonObject(content: string): Record<string, any> | null {
  try {
    const value: unknown = JSON.parse(content)
    return isRecord(value) ? value : null
  } catch {
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start < 0 || end <= start) return null

    try {
      const value: unknown = JSON.parse(content.slice(start, end + 1))
      return isRecord(value) ? value : null
    } catch {
      return null
    }
  }
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
