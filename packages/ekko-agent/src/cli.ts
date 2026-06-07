#!/usr/bin/env node
import { createEkkoAgent } from './index.js'

interface CliOptions {
  cwd?: string
  json: boolean
  maxSteps: number
  prompt: string
}

async function main() {
  const options = await parseArgs(process.argv.slice(2))
  if (!options.prompt.trim()) {
    printHelp()
    process.exitCode = 1
    return
  }

  const agent = createEkkoAgent({ cwd: options.cwd })
  const result = await agent.run(options.prompt, { maxSteps: options.maxSteps })

  if (options.json) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  console.log(result.answer)
}

async function parseArgs(args: string[]): Promise<CliOptions> {
  const promptParts: string[] = []
  let cwd: string | undefined
  let json = false
  let maxSteps = 6

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--cwd') {
      cwd = requireValue(args, index, '--cwd')
      index += 1
      continue
    }
    if (arg === '--max-steps') {
      maxSteps = Number(requireValue(args, index, '--max-steps'))
      if (!Number.isInteger(maxSteps) || maxSteps < 1) {
        throw new Error('--max-steps must be a positive integer')
      }
      index += 1
      continue
    }
    if (arg === '--json') {
      json = true
      continue
    }
    if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
    promptParts.push(arg)
  }

  const prompt = promptParts.join(' ').trim() || await readStdinIfAvailable()
  return { cwd, json, maxSteps, prompt }
}

function requireValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1]
  if (!value) throw new Error(`${flag} requires a value`)
  return value
}

async function readStdinIfAvailable(): Promise<string> {
  if (process.stdin.isTTY) return ''

  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8').trim()
}

function printHelp() {
  console.log([
    'Usage: ekko-agent [--cwd path] [--max-steps n] [--json] "task"',
    '',
    'Environment:',
    '  EKKO_AGENT_API_KEY   API key for an OpenAI-compatible chat completions API',
    '  EKKO_AGENT_BASE_URL  Base URL, defaults to https://api.openai.com/v1',
    '  EKKO_AGENT_MODEL     Model, defaults to gpt-4.1-mini when an API key is set',
  ].join('\n'))
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
