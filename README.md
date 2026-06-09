# Hello Agents

Hello Agents is a TypeScript Agent Runtime Playground for experimenting with agent execution loops, tool calls, middleware hooks, planning, reflection, and execution traces.

It is not intended to be a full production agent framework. The project is a small, inspectable playground for learning how an agent runtime is structured and for testing different runtime behaviors in real code.

## Why This Exists

Modern agent systems are usually built around a shared runtime instead of many isolated agent classes. The runtime owns the execution loop, while planning, reflection, retry, guardrails, logging, and tracing are added through middleware or presets.

This project explores that design in TypeScript.

## What You Can Experiment With

- Agent execution loops
- OpenAI-compatible model calls
- Tool registration and execution
- ReAct-style tool use
- Plan-and-Solve workflows
- Reflection and refinement loops
- Middleware and lifecycle hook design
- Runtime state and execution traces

## Core Concepts

| Concept | Responsibility |
| --- | --- |
| Agent | Declarative configuration: name, instructions, model, tools, middleware, options |
| Runtime | Runs the agent loop and coordinates model calls, tool calls, hooks, state, and stop conditions |
| Model | Adapts OpenAI-compatible or local LLM providers behind a stable interface |
| Tool | External capability callable by the agent |
| Tool Registry | Registers, describes, looks up, and executes tools |
| Middleware | Adds planning, reflection, retry, guardrails, logging, memory, or human approval |
| Trace | Records model calls, tool calls, observations, errors, and final output |
| State | Carries messages, steps, plans, observations, metadata, and runtime limits across a run |

## Architecture

The final runtime architecture is documented in [docs/architecture.md](./docs/architecture.md).

At a high level, the project is organized around:

```text
Agent + Runtime + Model + Tool + Middleware + Trace + State
```

ReAct, Plan-and-Solve, and Reflection are treated as reusable runtime presets or middleware combinations on top of one shared runtime.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in the required model provider values in `.env`.

### 3. Type-check the project

```bash
npm run typecheck
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `LLM_API_KEY` | Yes | API key for the model provider |
| `LLM_MODEL_ID` | Yes | Model identifier |
| `LLM_BASE_URL` | Yes | OpenAI-compatible API base URL |
| `TEMPERATURE` | No | Default sampling temperature |
| `MAX_TOKENS` | No | Default maximum output tokens |
| `SERPAPI_API_KEY` | Only for search | SerpAPI key used by the search tool |

## Examples

Run the current Plan-and-Solve example:

```bash
npx tsx src/tests/plan_solve_entry.ts
```

Run the current Reflection example:

```bash
npx tsx src/tests/reflection_agent_entry.ts
```

## Project Structure

```text
src/
  core/
    agent.ts
    config.ts
    exception.ts
    llm.ts
    message.ts

  agents/
    react_agent.ts
    plan_solve_agent.ts
    reflection_agent.ts

  tools/
    base.ts
    register.ts
    builtin/
      searchTool.ts

  tests/
    plan_solve_entry.ts
    reflection_agent_entry.ts

docs/
  architecture.md
```

## Roadmap

- Build a shared `AgentRuntime`.
- Add explicit runtime context and state objects.
- Add middleware lifecycle hooks.
- Add structured trace events and run results.
- Convert ReAct, Plan-and-Solve, and Reflection into presets over the shared runtime.
- Add a mock model for deterministic local tests.
- Add CLI-friendly example commands.
- Add more built-in tools.

## References

- [Agent Runtime Playground Architecture](./docs/architecture.md)
- [Hello-Agents by Datawhale](https://datawhalechina.github.io/hello-agents/#/./README)
