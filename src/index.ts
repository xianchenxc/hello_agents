import ReactAgent from "./agents/react_agent";
import HelloAgentsLLM from "./core/llm";
import SearchTool from "./tools/builtin/searchTool";
import ToolRegister from "./tools/register";

process.loadEnvFile();

async function main() {
    const llm = new HelloAgentsLLM();
    const toolRegister = new ToolRegister();
    toolRegister.registerTool(new SearchTool("search", "搜索工具"));
    const agent = new ReactAgent("react_agent", llm, toolRegister);
    await agent.run("今天是 2026-04-03，苹果最新手机是哪款");
}

main().catch(console.error);