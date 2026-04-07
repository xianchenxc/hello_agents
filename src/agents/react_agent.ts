import Agent from "../core/agent";
import Config from "../core/config";
import HelloAgentsLLM from "../core/llm";
import Message from "../core/message";
import Tool from "../tools/base";
import ToolRegister from "../tools/register";

const defaultPromptTemplate = (tools: string, question: string, history: string) =>  `你是一个具备推理和行动能力的AI助手。你可以通过思考分析问题，然后调用合适的工具来获取信息，最终给出准备的答案。

## 可用工具
${tools}

## 工作流程
请严格按照以下格式进行回应，每次只能执行一个步骤：

Thought: 分析问题，确定需要什么信息，指定研究策略
Action: 选择合适的工具获取信息，格式为：
- \`{{tool_name}}[{{tool_input}}]\`: 调用工具获取信息
- \`Finish[研究结论]\`: 当你有足够信息得出结论时。

## 重要提醒
1. 每次回应必须包含Thought和Action两个部分
2. 工具调用的格式必须严格遵循：工具名[参数]
3. 只有当你确信有足够的信息回答问题时，才使用Finish
4. 如果工具返回的信息不够，继续使用其他工具或者相同工具的不同参数

## 当前任务
**Question:** ${question}

## 执行历史
${history}

现在开始你的推理和行动`;

class ReactAgent extends Agent {
    toolRegister: ToolRegister;
    maxSteps: number;
    prompt_template: typeof defaultPromptTemplate;
    currentHistory: string[] = [];

    constructor(
        name: string,
        llm: HelloAgentsLLM,
        toolRegister?: ToolRegister,
        systemPrompt?: string[],
        config?: Config,
        maxSteps: number = 5,
        customPrompt?: typeof defaultPromptTemplate
    ) {
        super(name, llm, systemPrompt, config);

        this.toolRegister = toolRegister ?? new ToolRegister();
        this.maxSteps = maxSteps;
        this.currentHistory = [];
        this.prompt_template = customPrompt ?? defaultPromptTemplate;
    }

    addTool(tool: Tool): void {
        this.toolRegister.registerTool(tool);
    }

    async run(inputStr: string, options?: Record<string, any>): Promise<string> {
        this.currentHistory = [];
        let currentStep = 0;

        console.log(`🤖 ${this.name} 开始处理问题`);

        while(currentStep < this.maxSteps) {
            currentStep++;
            console.log(`--- 第 ${currentStep} 步 ---`);

            let toolsDesc = this.toolRegister.getToolsDescription();
            let historyStr = this.currentHistory.join("\n");
            let prompt = this.prompt_template(toolsDesc, inputStr, historyStr);

            const responseText = await this.llm.invoke([{ role: 'user', content: prompt }], options as a);
            if (!responseText) {
                console.error("❌ 错误：LLM未能返回有效响应。");
                break;
            }

            const [thought, action] = this.parseOutput(responseText);
            if (thought) {
                console.log(`🤔 思考: ${thought}`);
            }
            if (!action) {
                console.warn("⚠️ 警告：未能解析出有效的Action，流程终止。");
                break;
            }

            if (action.startsWith("Finish")) {
                const finalAnswer = this.parseActionInput(action);
                console.log(`🎉 最终答案：${finalAnswer}`);
                this.addMessage(new Message(inputStr, "user"));
                this.addMessage(new Message(finalAnswer, "assistant"));
                
                return finalAnswer;
            }

            const [toolName, toolInput] = this.parseAction(action);
            if (!toolName || !toolInput) {
                continue;
            }

            console.log(`🎬 行动: ${toolName}[${toolInput}]`);
            const observation = await this.toolRegister.executeTool(toolName, toolInput);
            console.log(`👀 观察: ${observation}`);
            this.currentHistory.push(`Action: ${action}`);
            this.currentHistory.push(`Observation: ${observation}`);
        }

        console.error("⏰ 已达到最大步数，流程终止。");
        const finalAnswer = "抱歉，我无法在限定步数内完成这个任务。";
        this.addMessage(new Message(inputStr, "user"));
        this.addMessage(new Message(finalAnswer, "assistant"));
        return finalAnswer;
    }

    private parseOutput(responseText: string): [string | undefined, string | undefined] {
        const thoughtMatch = responseText.match(/Thought: (.*)/);
        const actionMatch = responseText.match(/Action: (.*)/);
       
        return [thoughtMatch?.[1]?.trim(), actionMatch?.[1]?.trim()];
    }

    private parseAction(responseText: string): [string | undefined, string | undefined] {
        const actionMatch = responseText.match(/(\w+)\[(.*)\]/);
        return actionMatch ? [actionMatch[1], actionMatch[2]] : [undefined, undefined];
    }

    private parseActionInput(action: string): string {
        const toolInputMatch = action.match(/\w+\[(.*)\]/);
        return toolInputMatch?.[1]?.trim() ?? "";
    }
}

export default ReactAgent;