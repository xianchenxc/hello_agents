# Current Issues

This document captures the current product and architecture gaps at a capability level. It intentionally avoids line-by-line implementation details.

## Tool System

The tool system is still too lightweight for a runtime-oriented design.

Current limitations:

- Tool input and output are not structured.
- Tool parameter schemas are not fully used by the agent prompt or runtime.
- Tool execution does not expose status, metadata, duration, or error type.
- Tool errors are handled as plain text instead of structured results.
- Built-in tools are tightly coupled to environment variables and external services.

## ReAct Agent

The ReAct implementation works as a standalone example, but it is not yet a reusable runtime preset.

Current limitations:

- The agent owns its own execution loop.
- Prompting, parsing, tool execution, logging, and stop conditions are mixed together.
- Model output parsing is fragile.
- Failure handling is mostly implicit.
- The run result is only a string, without steps, trace, or structured observations.

## Runtime

The project does not yet have a shared runtime layer.

## Testing

The project currently has example scripts, but not a real test strategy.

Current limitations:

- There is no automated test command.
- Example files call real model providers and external services.
- There is no mock model for deterministic runtime tests.
- Tool execution, parsing, stop conditions, and error paths are not covered.
- Type-checking is currently the only reliable verification step.
