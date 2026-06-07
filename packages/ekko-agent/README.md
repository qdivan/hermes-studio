# Ekko Agent

This package is a local sandbox for developing a custom agent without changing
the Hermes Web UI runtime.

## Run

From the repository root:

```bash
npm run ekko-agent:dev -- "what time is it?"
```

Or from this package:

```bash
npm run dev -- "list files"
```

Without an API key, the agent uses a deterministic local development client so
you can test the tool loop. To use an OpenAI-compatible chat completions API:

```bash
export EKKO_AGENT_API_KEY="..."
export EKKO_AGENT_MODEL="gpt-4.1-mini"
# optional: export EKKO_AGENT_BASE_URL="https://api.openai.com/v1"
npm run ekko-agent:dev -- "list the files in packages/ekko-agent"
```

## Shape

- `src/cli.ts` is the command-line entry point.
- `src/core/agent.ts` owns the agent loop and tool execution.
- `src/llm/` contains swappable chat completion clients.
- `src/tools/` contains example tools.

Add your own behavior by creating a tool in `src/tools/` and registering it in
`src/index.ts`.
