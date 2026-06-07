import { resolve } from 'node:path'
import { EkkoAgent } from './core/agent.js'
import type { AgentContext } from './core/types.js'
import { createChatClientFromEnv } from './llm/client-from-env.js'
import { clockNowTool } from './tools/clock.js'
import { workspaceCwdTool, workspaceListTool } from './tools/workspace.js'

export interface CreateEkkoAgentOptions {
  cwd?: string
  log?: (message: string) => void
}

export function createEkkoAgent(options: CreateEkkoAgentOptions = {}): EkkoAgent {
  const context: AgentContext = {
    cwd: resolve(options.cwd ?? process.cwd()),
    now: () => new Date(),
    log: options.log ?? (() => {}),
  }

  return new EkkoAgent(
    createChatClientFromEnv(),
    [
      clockNowTool,
      workspaceCwdTool,
      workspaceListTool,
    ],
    context,
  )
}

export type { AgentTool, ChatClient } from './core/types.js'
