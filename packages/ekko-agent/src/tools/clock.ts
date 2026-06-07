import type { AgentTool } from '../core/types.js'

export const clockNowTool: AgentTool<Record<string, never>> = {
  name: 'clock.now',
  description: 'Return the current date and time.',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  async run(_input, context) {
    const now = context.now()
    return JSON.stringify({
      iso: now.toISOString(),
      local: now.toString(),
    })
  },
}
