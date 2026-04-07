import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import { HelloAgentsException, LLMException } from "./exception";

class HelloAgentsLLM {
    model: string;
    apiKey: string;
    baseUrl: string;
    timeout: number;
    provider: string;
    client: OpenAI;

    maxTokens?: number;
    temperature?: number;

    constructor(options: {
        model?: string;
        apiKey?: string;
        baseUrl?: string;
        provider?: string;
        timeout?: number;
        maxTokens?: number;
        temperature?: number;
    } = {}) {
        this.model = options.model ?? process.env.LLM_MODEL_ID ?? "";
        this.apiKey = options.apiKey ?? process.env.LLM_API_KEY ?? "";
        this.baseUrl = options.baseUrl ?? process.env.LLM_BASE_URL ?? "";
        this.provider = options.provider ?? "auto";
        this.timeout = options.timeout ?? 60_000;
        this.maxTokens = options.maxTokens;
        this.temperature = options.temperature;

        if (!this.model || !this.apiKey || !this.baseUrl) {
            throw new Error("LLM model, api key and base url are required or set in the environment variables");
        }

        this.client = this.createClient();
    }

    private createClient(): OpenAI {
        return new OpenAI({
            apiKey: this.apiKey,
            baseURL: this.baseUrl,
            timeout: this.timeout,
        });
    }

    /**
     * 调用大模型思考，并返回其响应
     * @param messages - The messages to send to the model.
     * @param temperature - The temperature to use for the model.
     * @returns The response from the model.
     */
    async think(messages: {role: "system" | "user" | "assistant", content: string}[], temperature: number = 0): Promise<string | null> {
        console.log(`🧠 正在调用 ${this.model} 模型...`, messages);
        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages,
                temperature,
                stream: true,
            });
    
            console.log("✅ 大语言模型响应成功:");
            const collectedContent = [];
    
            for await (const chunk of response) {
                let content = chunk.choices[0].delta.content;
                process.stdout.write(content ?? "");
                collectedContent.push(content);
            }
    
            return collectedContent.join("");
        } catch (error) {
            console.error("❌ 调用LLM API时发生错误: ", error);
            return null;
        }
    }

    // 非流式调用
    async invoke(messages: {role: "system" | "user" | "assistant", content: string}[], options?: ChatCompletionCreateParamsNonStreaming): Promise<string> {
        try {
            console.log(`🧠 正在调用 ${this.model} 模型...`);
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages,
                ...options,
                max_tokens: options?.max_tokens ?? this.maxTokens,
                temperature: options?.temperature ?? this.temperature,
            });
            console.log("✅ 大语言模型响应成功:");
            console.log(response.choices[0].message.content ?? "");
            return response.choices[0].message.content ?? "";
        } catch (error) {
            throw new HelloAgentsException(`LLM调用失败: ${error instanceof Error ? error.message : "未知错误"}`);
        }
    }
}

export default HelloAgentsLLM;