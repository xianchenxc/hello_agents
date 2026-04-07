import Tool, { ToolParameter } from "../base";
import * as SerpApiClient from 'serpapi'

class SearchTool extends Tool {
    
    async run(params: Record<string, any>): Promise<string> {
        const query = (params.query || params.input || "").trim();
        if (!query) {
            return "错误：搜索查询不能为空";
        }

        try {
            const result = await SerpApiClient.getJson({
                api_key: process.env.SERPAPI_API_KEY,
                engine: 'google',
                q: query,
                gl: "cn", 
                hl: "zh-cn",
            });
    
            // 智能解析:优先寻找最直接的答案
            if ("answer_box_list" in result) {
                return result["answer_box_list"].join("\n");
            }
            if ("answer_box" in result && "answer" in result["answer_box"]) {
                return result["answer_box"]["answer"];
            }
            if ("knowledge_graph" in result && "description" in result["knowledge_graph"]) {
                return result["knowledge_graph"]["description"];
            }
            if ("organic_results" in result && result["organic_results"]) {
                // 如果没有直接答案，则返回前三个有机结果的摘要
                const snippets = result["organic_results"].slice(0, 3).map(
                    (res: any, i: number) => `[${i+1}] ${res.title}\n${res.snippet}`
                );
                return snippets.join("\n\n");
            }
    
            return `对不起，没有找到关于 '${query}' 的信息。`;
        } catch (error) {
            return `搜索时发生错误: ${error}`;
        }
    }

    getParameters(): ToolParameter[] {
        return [
            {
                name: "query",
                type: "string",
                description: "搜索查询关键词",
                required: true,
            },
        ];
    }
}

export default SearchTool;