# Hello Agents

一个基于 Node.js + TypeScript 的 Agent 学习与实践项目。

本项目的目标是结合 Datawhale 的 Hello-Agents 教程进行动手实现，重点关注：
- Agent 基础抽象（`Agent`、`Message`、`LLM`、`Tool`）
- ReAct / Plan-and-Solve / Reflection 等常见智能体范式
- 通过真实代码将提示词设计、工具调用、任务分解和迭代优化串起来

参考学习资料：  
[Hello-Agents（Datawhale）](https://datawhalechina.github.io/hello-agents/#/./README)

## 技术栈

- Node.js（建议 20+）
- TypeScript
- `tsx`（直接运行 `.ts` 入口文件）
- OpenAI SDK（兼容 OpenAI 风格 API）
- SerpAPI（用于搜索工具）

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 配置环境变量

复制环境变量模板并填写实际值：

```bash
cp .env.example .env
```

`.env` 示例字段说明：

- `LLM_API_KEY`: 大模型 API Key
- `LLM_MODEL_ID`: 模型名称（如 `gpt-4o-mini` 等）
- `LLM_BASE_URL`: 模型服务地址（兼容 OpenAI API）
- `TEMPERATURE`: 采样温度
- `MAX_TOKENS`: 最大输出长度
- `SERPAPI_API_KEY`: SerpAPI Key（使用搜索工具时需要）

## 运行示例

项目当前包含多个可直接执行的入口文件：

### Plan-and-Solve 示例


```bash
npx tsx src/tests/plan_solve_entry.ts
```

### Reflection 示例

```bash
npx tsx src/tests/reflection_agent_entry.ts
```

## 项目结构

```text
src/
  agents/
    react_agent.ts
    plan_solve_agent.ts
    reflection_agent.ts
  core/
    agent.ts
    message.ts
    llm.ts
    config.ts
    exception.ts
  tools/
    base.ts
    register.ts
    builtin/searchTool.ts
  tests/
    plan_solve_entry.ts
    reflection_agent_entry.ts
  index.ts
```

## 说明

- 本仓库用于学习与实验，适合边看教程边跑代码。  
