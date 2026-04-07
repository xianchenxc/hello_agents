import Agent from "../core/agent";
import HelloAgentsLLM from "../core/llm";
import Config from "../core/config";
import Message from "../core/message";

const defaultPlanPromptTemplate = (question: string) => `你是一个顶级的AI规划专家。你的任务是将用户提出的复杂问题分解成一个由多个简单步骤组成的执行计划。
请确保计划中每个步骤都是一个独立的、可执行的子任务，并且严格按照逻辑顺序排列。
你的输出必须是一个JavaScript数组，其中每个元素都是一个描述子任务的字符串。

问题：${question}

请严格按照以下格式输出你的计划：
\`\`\`javascript
["步骤1", "步骤2", "步骤3",...]
\`\`\`
`;
const defaultExecutePromptTemplate = (question: string, plan: string, history: string, currentStep: string) => `你是一个顶级的AI执行专家。你的任务是严格按照给定的计划，一步步地解决问题。
你将收到原始问题、完整的计划、以及到目前已经完成的步骤和结果。
请你专注于解决“当前步骤”，并仅输出该步骤的最终答案，不要输出额外的解释或对话。

# 原始问题：
${question}

# 完整计划：
${plan}

# 历史步骤和结果
${history}

# 当前步骤：
${currentStep}

请仅输出针对“当前步骤“的回答。
`;

class Planner {
    private promptTemplate: typeof defaultPlanPromptTemplate;

    constructor(private llm: HelloAgentsLLM, promptTemplate?: typeof defaultPlanPromptTemplate) {
        this.promptTemplate = promptTemplate ?? defaultPlanPromptTemplate;
    }

    // 根据用户问题生成一个行动计划
    async plan(question: string, options?: Record<string, any>): Promise<string[]> {
        const prompt = this.promptTemplate(question);
        console.log("--- 正在生成计划 ---");
        const responseText = await this.llm.invoke([{ role: 'user', content: prompt }], options as any);
        console.log("✅ 计划已生成:");
        console.log(responseText);
         
        try {
            const planStr = responseText.split("```javascript")[1].split("```")[0].trim();
            const plan = JSON.parse(planStr) as string[];
            return Array.isArray(plan) ? plan : [];
        } catch (error) {
            console.error("❌ 解析计划时出错:", error);
            console.log("原始响应:", responseText);
            return [];
        }
    }
}

class Executor {
    private promptTemplate: typeof defaultExecutePromptTemplate;
    constructor(private llm: HelloAgentsLLM, promptTemplate?: typeof defaultExecutePromptTemplate) {
        this.promptTemplate = promptTemplate ?? defaultExecutePromptTemplate;
    }

    // 根据计划和历史步骤执行当前步骤
    async execute(question: string, plan: string[], options?: Record<string, any>): Promise<string> {
        let history = "";
        let finalAnswer = "";

        for (const [index, step] of plan.entries()) {
            console.log(`正在执行步骤: ${index + 1}/${plan.length}: ${step}`);
            const prompt = defaultExecutePromptTemplate(question, plan.join("\n"), history, step);
            const responseText = await this.llm.invoke([{ role: 'user', content: prompt }], options as any);
            console.log("✅ 步骤已执行:", responseText);
            history += `步骤 ${index + 1}: ${step}\n结果: ${responseText}\n`;
            finalAnswer = responseText;
            console.log(`✅ 步骤 ${index + 1} 已完成，结果: ${finalAnswer}`);
        }

        return finalAnswer;
    }
}

class PlanAndSolveAgent extends Agent {
    private planner: Planner;
    private executor: Executor;

    constructor(name: string, llm: HelloAgentsLLM, systemPrompt?: string[], config?: Config, customPrompt?: [typeof defaultPlanPromptTemplate, typeof defaultExecutePromptTemplate]) {
        super(name, llm, systemPrompt, config);
        this.planner = new Planner(llm, customPrompt?.[0]);
        this.executor = new Executor(llm, customPrompt?.[1]);
    }

    async run(inputStr: string, options?: Record<string, any>): Promise<string> {
        console.log(`🤖 ${this.name} 开始处理问题: ${inputStr}`);
        const plan = await this.planner.plan(inputStr, options);
        let finalAnswer = "";

        if(plan.length === 0) {
            finalAnswer = "无法生成有效的行动计划，任务终止";
            console.log(`-- 任务终止 ---`);
            console.log(finalAnswer);
            this.addMessage(new Message(inputStr, "user"));
            this.addMessage(new Message(finalAnswer, "assistant"));

            return finalAnswer;
        }
        finalAnswer = await this.executor.execute(inputStr, plan, options);
        console.log(`--- 任务完成 ---`);
        console.log(`最终答案：${finalAnswer}`);
        this.addMessage(new Message(inputStr, "user"));
        this.addMessage(new Message(finalAnswer, "assistant"));
        return finalAnswer;
    }
}

export default PlanAndSolveAgent;