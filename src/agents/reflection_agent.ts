import Agent from "../core/agent";
import Config from "../core/config";
import HelloAgentsLLM from "../core/llm";
import Message from "../core/message";

const defaultPrompts = {
    initial: (task: string) => `请根据以下要求完成任务：
    
# 任务：${task}
    
请提供一个完整、准确的回答。`,
    reflection: (task: string, content: string) => `请仔细审查以下回答，并找出可能得问题或改进空间：
    
# 原始任务：
${task}

# 当前回答：
${content}
    
请分析这个回答的质量，指出不足之处，并提出具体的改进建议。
如果回答已经很好，请回答"无需改进"。`,
    refine: (task: string, lastContent: string, feedback: string) => `请根据反馈意见改进你的回答：
    
# 原始任务：
${task}

# 上一轮回答：
${lastContent}

# 反馈意见：
${feedback}

请提供一个改进后的回答。`,
}

class Memory {
    private records: Record<string, any>[] = [];

    constructor() {
        this.records = [];
    }

    addRecord(recordType: string, content: string): void {
        this.records.push({ type:recordType, content });
        console.log(`📝 记忆已更新，新增一条 '${recordType}' 记录。`);
    }

    getTrajectory(): string {
        let trajectory = "";
        for (const record of this.records) {
            if (record.type === "execution") {
                trajectory += `--- 上一轮尝试 (代码) ---\n${record.content}\n\n`;
            } else if (record.type === "reflection") {
                trajectory += `--- 评审员反馈 ---\n${record.content}\n\n`;
            }
        }
        return trajectory.trim();
    }

    getLastExecution(): string {
        for (const record of this.records) {
            if (record.type === "execution") {
                return record.content;
            }
        }
        return "";
    }
}


class ReflectionAgent extends Agent {
    maxIterations: number;
    memory: Memory;
    customPrompts: typeof defaultPrompts;

    constructor(
        name: string,
        llm: HelloAgentsLLM,
        systemPrompt?: string[],
        config?: Config,
        maxIterations: number = 3,
        customPrompts?: typeof defaultPrompts
    ) {
        super(name, llm, systemPrompt, config);
        this.maxIterations = maxIterations;
        this.memory = new Memory();
        this.customPrompts = customPrompts ?? defaultPrompts;
    }

    async run(inputStr: string, options?: Record<string, any>): Promise<string> {
        console.log(`🤖 ${this.name} 开始处理问题: ${inputStr}`);
        this.memory = new Memory();
        
        // 1. 初次执行
        const initialPrompt = this.customPrompts.initial(inputStr);
        const initialContent = await this.llm.invoke([{ role: 'user', content: initialPrompt }], options as any);
        this.memory.addRecord("execution", initialContent);

        // 2. 迭代循环：反思与优化
        for (let i = 0; i < this.maxIterations; i++) {
            console.log(`--- 第 ${i + 1}/${this.maxIterations} 轮迭代 ---`);
            console.log("--- 正在反思 ---");
            const lastExecution = this.memory.getLastExecution();
            const reflectionPrompt = this.customPrompts.reflection(inputStr, lastExecution);
            const feedback = await this.llm.invoke([{ role: 'user', content: reflectionPrompt }], options as any);
            this.memory.addRecord("reflection", feedback);

            if (feedback.includes("无需改进") || feedback.toLowerCase().includes("no need for improvement")) {
                console.log("✅ 反思认为结果已无需改进，任务完成。")
                break;
            }

            // 3. 优化阶段
            console.log("--- 正在进行优化 ---");
            const refinePrompt = this.customPrompts.refine(inputStr, lastExecution, feedback);
            const refineContent = await this.llm.invoke([{ role: 'user', content: refinePrompt }], options as any);
            this.memory.addRecord("execution", refineContent);
        }

        // 4. 返回最终答案
        const finalAnswer = this.memory.getLastExecution();
        console.log("--- 任务完成 ---");
        console.log("最终结果:");
        console.log(finalAnswer);
        this.addMessage(new Message(inputStr, "user"));
        this.addMessage(new Message(finalAnswer, "assistant"));
        
        return finalAnswer;
    }
}

export default ReflectionAgent;
