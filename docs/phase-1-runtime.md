# Phase 1: Minimal Agent Runtime

## Background

This phase addresses the runtime-level gaps summarized in [Current Issues](./current-issues.md).

## Goal

Build the smallest useful Agent Runtime from a clean project perspective.

Phase 1 establishes the runtime backbone:

```text
Agent config + AgentRuntime + ModelAdapter + ToolRegistry + Middleware hooks + Trace
```

The goal is to make one agent run end to end through a shared runtime, while keeping the architecture ready for future ReAct, planning, reflection, retry, guardrail, memory, and tracing features.

## Scope

### 1. Runtime Core

Create the runtime module:

```text
src/core/runtime.ts
```

`AgentRuntime` is responsible for:

- Creating a run context.
- Owning the execution loop.
- Calling the model adapter.
- Detecting final output or tool calls.
- Executing tools through the tool registry.
- Calling middleware hooks.
- Recording trace events.
- Returning a structured run result.

### 2. Runtime Context And State

Create runtime state objects:

```text
src/core/context.ts
```

The context should carry:

- Run id
- User input
- Agent metadata
- Message history
- Current step
- Max steps
- Tool observations
- Runtime metadata

The state should be passed through runtime, middleware, model calls, and tool calls.

### 3. Model Adapter

Add a stable model interface:

```text
src/core/model.ts
```

The runtime should depend on `ModelAdapter`, not directly on a specific SDK.

The first adapter should support an OpenAI-compatible chat completion API.

Minimum interface:

```ts
interface ModelAdapter {
  invoke(messages: ModelMessage[], options?: ModelOptions): Promise<ModelResponse>;
}
```

### 4. Middleware Hooks

Add the middleware contract:

```text
src/core/middleware.ts
```

Phase 1 should define and call these hooks:

```text
beforeRun
beforeModel
afterModel
beforeTool
afterTool
afterRun
onError
```

The first implementation can be simple. A logger or trace middleware is enough to prove the hook chain works.

### 5. Trace Events

Add structured trace support:

```text
src/core/trace.ts
```

Minimum event types:

- `run_started`
- `model_called`
- `model_completed`
- `tool_called`
- `tool_completed`
- `run_completed`
- `run_failed`

`runtime.run()` should return trace data as part of the result.

### 6. Agent Configuration

Create a configuration-style agent shape.

Minimum fields:

- `name`
- `instructions`
- `model`
- `tools`
- `middleware`
- `maxSteps`

The agent should describe what to run. `AgentRuntime` should decide how to run it.

### 7. Tool Execution

Create the tool abstraction and route execution through the runtime.

Phase 1 only needs a simple text-based tool call format:

```text
toolName[toolInput]
```

Provider-native function-calling schema support is out of scope for this phase.

### 8. Runtime Example

Add one runnable example that uses the runtime:

```text
src/examples/runtime_react_entry.ts
```

The example should:

- Create a model adapter.
- Register at least one tool.
- Create an agent config.
- Run the agent through `AgentRuntime`.
- Print the final output.
- Print or expose the trace.

### 9. Package Script

Add a script for the new runtime example:

```json
"example:runtime": "tsx src/examples/runtime_react_entry.ts"
```

Keep `typecheck` as the main verification command.

## Out Of Scope

Do not include these in Phase 1:

- Full Plan-and-Solve preset
- Full Reflection preset
- ReAct preset abstraction
- OpenAI function-calling tool schemas
- Multi-agent handoff
- Persistent memory
- Human approval UI
- CLI framework
- Evaluation framework
- Production-ready error taxonomy

## Acceptance Criteria

Phase 1 is complete when:

- `npm run typecheck` passes.
- A shared `AgentRuntime` exists.
- Runtime context and state exist.
- Runtime middleware hooks are defined and called.
- Runtime trace events are recorded.
- Runtime output is returned as a structured `RunResult`.
- The runtime can call a model through `ModelAdapter`.
- The runtime can execute a tool through a registry.
- A runnable runtime example exists.
- README links to the new runtime example or documents how to run it.

## Expected Result

After Phase 1, the project should have a working runtime spine:

```text
input -> AgentRuntime -> model -> optional tool calls -> trace -> RunResult
```

Planning, reflection, retry, and guardrails can then be added as middleware or presets in later phases.
