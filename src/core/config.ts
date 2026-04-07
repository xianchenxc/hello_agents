class Config {
    defaultModel: string = "gpt-3.5-turbo";
    defaultProvider: string = "openai";
    temperature: number = 0.7;
    maxTokens?: number;

    debug: boolean = false;
    logLevel: "info" | "warn" | "error" = "info";

    maxHistoryLength: number = 100;


    constructor(options: {
        debug?: boolean;
        logLevel?: "info" | "warn" | "error";
        temperature?: number;
        maxTokens?: number;
    } = {}) {
        this.temperature = options.temperature ?? 0.7;
        this.maxTokens = options.maxTokens;
        this.debug = options.debug ?? false;
        this.logLevel = options.logLevel ?? "info";
    }

    static fromEnv(): Config {
        return new Config({
            debug: process.env.DEBUG === "true",
            logLevel: process.env.LOG_LEVEL as "info" | "warn" | "error" | undefined,
            temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : undefined,
            maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : undefined,
        });
    }
}

export default Config;
