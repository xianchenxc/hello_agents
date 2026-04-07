import Tool from "./base";

class ToolRegister {
    private tools: Map<string, Tool> = new Map();

    // 注册工具
    registerTool(tool: Tool): void {
        if (this.tools.has(tool.name)) {
            console.warn(`⚠️ 警告：工具 '${tool.name}' 已存在，将被覆盖。`);
        }
        this.tools.set(tool.name, tool);
        console.log(`✅ 工具 '${tool.name}' 注册成功。`);
    }

    unRegisterTool(name: string): void {
        if (this.tools.has(name)) {
            this.tools.delete(name);
            console.log(`✅ 工具 '${name}' 注销成功。`);
        } else {
            console.warn(`⚠️ 警告：工具 '${name}' 不存在，无法注销。`);
        }
    }

    // 获取工具
    getTool(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    async executeTool(name: string, inputText: string): Promise<string> {
        const tool = this.getTool(name);

        if (tool) {
            try {
                return tool.run({ input: inputText });
            } catch (error) {
                return `错误：执行工具 '${name}' 时发生错误: ${error}`;
            }
        } else {
            return `错误：未找到名为 '${name}' 的工具。`;
        }
    }

    getToolsDescription(): string {
        const descriptions = [];
        for (const tool of this.tools.values()) {
            descriptions.push(`- ${tool.name}: ${tool.description}`);
        }

        if (descriptions.length === 0) {
            return "暂无可用工具。";
        }

        return descriptions.join("\n");
    }
}

export default ToolRegister;