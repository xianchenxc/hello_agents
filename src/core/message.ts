type MessageRole = "user" | "assistant" | "system" | "tool";

class Message {
    content: string;
    role: MessageRole;
    timestamp: number;
    metadata: Record<string, any>;

    constructor(
        content: string,
        role: MessageRole,
        options: { 
            timestamp?: number,
            metadata?: Record<string, any>,
            [key: string]: any,
        } = {}) {
        this.content = content;
        this.role = role;
        this.timestamp = options.timestamp ?? Date.now();
        this.metadata = options.metadata ?? {};
    }

    toString(): string {
        return `[${this.role}] ${this.content}`;
    }
}

export default Message;
