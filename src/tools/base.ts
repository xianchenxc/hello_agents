
export interface ToolParameter {
    name: string;
    type: string;
    description: string;
    required: boolean;
    default?: any;
}

abstract class Tool {
    name: string;
    description: string;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    // 执行工具
    abstract run(params: Record<string, any>): Promise<string>;

    // 获取参数定义
    abstract getParameters(): ToolParameter[];
}

export default Tool;
