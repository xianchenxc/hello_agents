import HelloAgentsLLM from "./llm";
import Message from "./message";
import Config from "./config";

abstract class Agent {
    name: string;
    llm: HelloAgentsLLM;
    systemPrompt?: string[];
    config?: any;
    private history: Message[];

    constructor(name: string, llm: HelloAgentsLLM, systemPrompt?: string[], config?: Config) {
        this.name = name;
        this.llm = llm;
        this.systemPrompt = systemPrompt;
        this.config = config ?? new Config();
        this.history = [];
    }

    // 运行 Agent
    abstract run(inputStr: string, options?: Record<string, any>): Promise<string>;

    // 添加消息
    addMessage(message: Message): void {
        this.history.push(message);
    }

    // 清空消息
    clearHistory(): void {
        this.history = [];
    }

    // 获取消息
    getHistory(): Message[] {
        return [...this.history];
    }

    toString(): string {
        return `Agent: ${this.name}, Provider: ${this.llm.provider}`;
    }    
}

export default Agent;
