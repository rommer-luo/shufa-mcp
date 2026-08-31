import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = join(__dirname, "..", "knowledge");

// Load all knowledge files
function loadKnowledge(): Map<string, string> {
  const knowledge = new Map<string, string>();
  const files = readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith(".md"));
  for (const file of files) {
    const content = readFileSync(join(KNOWLEDGE_DIR, file), "utf-8");
    const key = file.replace(/^\d+-/, "").replace(/\.md$/, "");
    knowledge.set(key, content);
  }
  return knowledge;
}

// Level descriptions for personalized responses
const LEVEL_DESCRIPTIONS: Record<string, string> = {
  beginner: "初学者（0-3个月）：正在学习基础笔画和简单汉字结构",
  intermediate: "进阶者（3-12个月）：已掌握基本笔画，正在深入临帖和学习结构",
  advanced: "高级者（1年以上）：已具备扎实基础，正在追求艺术表达和风格形成",
};

// Create MCP server
const server = new McpServer({
  name: "calligraphy-mcp",
  version: "1.0.0",
});

// Tool 1: Query calligraphy knowledge
server.tool(
  "query_calligraphy",
  "查询书法知识，回答书法相关问题。适用于书法学习、创作、历史、审美等各方面的知识问答。",
  {
    question: z.string().describe("用户关于书法的问题"),
    level: z
      .enum(["beginner", "intermediate", "advanced"])
      .default("beginner")
      .describe("用户书法水平等级：beginner=初学者, intermediate=进阶者, advanced=高级者"),
  },
  async ({ question, level }) => {
    const knowledge = loadKnowledge();
    const levelDesc = LEVEL_DESCRIPTIONS[level];

    // Search for relevant knowledge
    let relevantContent = "";
    for (const [key, content] of knowledge) {
      if (question.toLowerCase().includes(key.replace(/-/g, "")) ||
          content.toLowerCase().includes(question.toLowerCase().slice(0, 10))) {
        relevantContent += `\n\n--- ${key} ---\n${content.slice(0, 3000)}`;
      }
    }

    // If no specific match, include general knowledge
    if (!relevantContent) {
      for (const [key, content] of knowledge) {
        relevantContent += `\n\n--- ${key} ---\n${content.slice(0, 2000)}`;
      }
    }

    const response = `## 书法知识问答

**用户水平**：${levelDesc}

**问题**：${question}

**相关知识参考**：
${relevantContent || "暂未找到完全匹配的知识内容，以下为通用书法知识：\n\n请参考书法入门指南或技法详解。"}

**回答建议**：
请根据以上知识内容，以适合${levelDesc.split("：")[0]}的深度和方式回答用户的问题。回答时注意：
- 初学者：用通俗易懂的语言，多举实例
- 进阶者：可以涉及更深入的技法和理论
- 高级者：可以探讨艺术审美和哲学层面
`;

    return {
      content: [{ type: "text", text: response }],
    };
  }
);

// Tool 2: Get learning plan
server.tool(
  "get_learning_plan",
  "为用户制定个性化的书法学习计划。根据用户当前水平和目标，提供阶段性的学习建议。",
  {
    current_level: z
      .enum(["beginner", "intermediate", "advanced"])
      .default("beginner")
      .describe("用户当前书法水平"),
    goal: z
      .string()
      .default("系统学习书法，提高书写水平")
      .describe("用户的学习目标"),
    daily_minutes: z
      .number()
      .min(15)
      .max(180)
      .default(30)
      .describe("每天可用于练习的时间（分钟）"),
  },
  async ({ current_level, goal, daily_minutes }) => {
    const knowledge = loadKnowledge();
    const learningPlan = knowledge.get("learning-plan") || "";
    const beginnerGuide = knowledge.get("beginner-guide") || "";

    const levelMap: Record<string, string> = {
      beginner: "初学者",
      intermediate: "进阶者",
      advanced: "高级者",
    };

    const response = `## 书法学习计划

**当前水平**：${levelMap[current_level]}
**学习目标**：${goal}
**每日可用时间**：${daily_minutes}分钟

---

### 学习计划参考

${learningPlan.slice(0, 4000)}

---

### 个性化建议

根据您${daily_minutes}分钟的每日练习时间，建议安排：

1. **热身阶段**（${Math.round(daily_minutes * 0.15)}分钟）：书写基本笔画或简单汉字，活动手腕
2. **专项练习**（${Math.round(daily_minutes * 0.35)}分钟）：根据当前阶段的重点进行针对性练习
3. **临帖/创作**（${Math.round(daily_minutes * 0.4)}分钟）：对照字帖临写或进行创作练习
4. **总结反思**（${Math.round(daily_minutes * 0.1)}分钟）：对比字帖，记录心得

**关键提醒**：
- 贵在坚持，宁短勿断
- 每次练习都要有明确的目标
- 定期回顾和调整计划
`;

    return {
      content: [{ type: "text", text: response }],
    };
  }
);

// Tool 3: Get master information
server.tool(
  "get_master_info",
  "查询历代书法名家的信息，包括生平、代表作品、风格特点等。",
  {
    master_name: z
      .string()
      .describe("书法家姓名，如：王羲之、颜真卿、欧阳询等"),
  },
  async ({ master_name }) => {
    const knowledge = loadKnowledge();
    const mastersInfo = knowledge.get("masters") || "";

    // Search for specific master info
    const searchIndex = mastersInfo.indexOf(master_name);
    let relevantInfo = "";
    if (searchIndex !== -1) {
      // Get surrounding context (2000 chars before and after)
      const start = Math.max(0, searchIndex - 500);
      const end = Math.min(mastersInfo.length, searchIndex + 2000);
      relevantInfo = mastersInfo.slice(start, end);
    } else {
      relevantInfo = mastersInfo.slice(0, 3000);
    }

    const response = `## 书法名家信息

**查询书法家**：${master_name}

---

${relevantInfo || `关于"${master_name}"的详细信息暂未收录。以下为部分名家简介供参考：\n\n${mastersInfo.slice(0, 2000)}`}

---

**学习建议**：
如要学习该书法家的风格，建议：
1. 选择其代表碑帖作为临摹范本
2. 了解其书法理论和审美追求
3. 通过读帖深入理解其笔法特点
4. 坚持临帖，逐步领悟其艺术精髓
`;

    return {
      content: [{ type: "text", text: response }],
    };
  }
);

// Tool 4: Get technique guide
server.tool(
  "get_technique_guide",
  "获取书法技法指导，包括执笔、运笔、笔画写法、书体特点等详细技法讲解。",
  {
    technique_type: z
      .enum([
        "all",
        "grip",
        "brushwork",
        "strokes",
        "styles",
      ])
      .default("all")
      .describe("技法类型：all=全部, grip=执笔方法, brushwork=运笔技法, strokes=基本笔画, styles=书体特点"),
    level: z
      .enum(["beginner", "intermediate", "advanced"])
      .default("beginner")
      .describe("用户书法水平"),
  },
  async ({ technique_type, level }) => {
    const knowledge = loadKnowledge();
    const techniques = knowledge.get("techniques") || "";

    const typeMap: Record<string, string> = {
      all: "全部技法",
      grip: "执笔方法",
      brushwork: "运笔技法",
      strokes: "基本笔画",
      styles: "书体特点",
    };

    const levelTips: Record<string, string> = {
      beginner: "初学者重点：掌握正确的执笔姿势和基本笔画，不要急于追求复杂技法",
      intermediate: "进阶者重点：深入理解笔法变化，尝试不同书体的用笔特点",
      advanced: "高级者重点：追求笔法的艺术表达，探索个人风格",
    };

    const response = `## 书法技法指导

**技法类型**：${typeMap[technique_type]}
**用户水平**：${LEVEL_DESCRIPTIONS[level]}

---

### 详细技法讲解

${techniques.slice(0, 5000)}

---

### 练习建议

${levelTips[level]}

**练习要点**：
- 每次练习专注于一种技法
- 从慢速开始，逐步提高速度
- 注重质量而非数量
- 定期录视频回看，检查姿势和动作
`;

    return {
      content: [{ type: "text", text: response }],
    };
  }
);

// Tool 5: Get aesthetic insight
server.tool(
  "get_aesthetic_insight",
  "探讨书法美学与哲学，包括审美标准、艺术鉴赏、书法文化价值等深度内容。",
  {
    topic: z
      .string()
      .default("书法美学概论")
      .describe("探讨的主题，如：书法美学概论、点画之美、章法之美、书法与人生等"),
    level: z
      .enum(["beginner", "intermediate", "advanced"])
      .default("beginner")
      .describe("用户书法水平"),
  },
  async ({ topic, level }) => {
    const knowledge = loadKnowledge();
    const aesthetics = knowledge.get("aesthetics") || "";

    const response = `## 书法美学探讨

**主题**：${topic}
**用户水平**：${LEVEL_DESCRIPTIONS[level]}

---

### 美学内容

${aesthetics.slice(0, 5000)}

---

### 深度思考

书法之美，不仅在于技法的精湛，更在于文化的积淀和心灵的修养。

- **初学者**：先感受书法的形式美，培养对美的敏感度
- **进阶者**：理解技法与美的关系，体会不同风格的审美差异
- **高级者**：探索书法与人生的哲学关系，追求"天人合一"的境界

**推荐阅读**：
- 卫夫人《笔阵图》
- 孙过庭《书谱》
- 姜夔《续书谱》
- 蔡邕《笔论》《九势》
`;

    return {
      content: [{ type: "text", text: response }],
    };
  }
);

// Tool 6: Get common questions
server.tool(
  "get_common_questions",
  "获取书法学习中常见问题的解答，帮助用户解决学习过程中的困惑。",
  {
    category: z
      .enum(["all", "beginner", "practice", "advanced", "theory", "mindset"])
      .default("all")
      .describe("问题分类：all=全部, beginner=入门, practice=练习, advanced=进阶, theory=理论, mindset=心态"),
  },
  async ({ category }) => {
    const knowledge = loadKnowledge();
    const commonQA = knowledge.get("common-questions") || "";

    const categoryMap: Record<string, string> = {
      all: "全部常见问题",
      beginner: "入门阶段常见问题",
      practice: "临帖与练习常见问题",
      advanced: "进阶阶段常见问题",
      theory: "书法理论常见问题",
      mindset: "学习心态常见问题",
    };

    const response = `## 书法常见问题解答

**问题分类**：${categoryMap[category]}

---

${commonQA.slice(0, 6000)}

---

**更多帮助**：
如果您有其他书法相关问题，可以使用 query_calligraphy 工具进行详细咨询。
`;

    return {
      content: [{ type: "text", text: response }],
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Calligraphy MCP Server is running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
