import { readdir } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'
import type { AgentTool } from '../core/types.js'

interface WorkspaceListInput {
  path?: string
}

export const workspaceCwdTool: AgentTool<Record<string, never>> = {
  name: 'workspace.cwd',
  description: 'Return the current workspace directory for this agent run.',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  async run(_input, context) {
    return context.cwd
  },
}

export const workspaceListTool: AgentTool<WorkspaceListInput> = {
  name: 'workspace.list',
  description: 'List files and directories under the current workspace.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Relative path from the agent cwd.',
      },
    },
    additionalProperties: false,
  },
  async run(input, context) {
    const requestedPath = typeof input?.path === 'string' ? input.path : '.'
    const target = resolve(context.cwd, requestedPath)
    const root = resolve(context.cwd)
    const relativePath = relative(root, target)

    if (relativePath && (relativePath.startsWith('..') || isAbsolute(relativePath))) {
      throw new Error(`Path is outside the agent cwd: ${requestedPath}`)
    }

    const entries = await readdir(target, { withFileTypes: true })
    return entries
      .map(entry => `${entry.isDirectory() ? 'dir ' : 'file'} ${entry.name}`)
      .sort()
      .join('\n')
  },
}
