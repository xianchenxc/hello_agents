import PlanAndSolveAgent from "./agents/plan_solve_agent";
import HelloAgentsLLM from "./core/llm";
import SearchTool from "./tools/builtin/searchTool";
import ToolRegister from "./tools/register";

process.loadEnvFile();

async function main() {
    const llm = new HelloAgentsLLM();
    const toolRegister = new ToolRegister();
    toolRegister.registerTool(new SearchTool("search", "搜索工具"));
    const agent = new PlanAndSolveAgent("plan_solve_agent", llm);
    await agent.run("一个水果店周一卖出了15个苹果。周二卖出的苹果数量是周一的两倍。周三卖出的数量比周二少了5个。请问这三天总共卖出了多少个苹果？");
}

main().catch(console.error);