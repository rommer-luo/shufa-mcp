# Calligraphy MCP - 书法知识问答与教学服务

一个专注于中国书法知识问答、指导与教学的 MCP（Model Context Protocol）服务。

## 功能特点

- **书法知识问答**：回答书法学习、创作、历史、审美等各方面的问题
- **学习计划制定**：根据用户水平和目标，提供个性化的学习计划
- **名家信息查询**：查询历代书法名家的生平、代表作品、风格特点
- **技法指导**：提供执笔、运笔、笔画写法、书体特点等详细技法讲解
- **美学探讨**：探讨书法美学与哲学，包括审美标准、艺术鉴赏等
- **常见问题解答**：解决书法学习过程中的各种困惑

## 可配置参数

| 参数名 | 类型 | 可选值 | 默认值 | 说明 |
|--------|------|--------|--------|------|
| `level` | string | `beginner`, `intermediate`, `advanced` | `beginner` | 用户书法水平等级 |

- **beginner**（初学者）：0-3个月，正在学习基础笔画和简单汉字结构
- **intermediate**（进阶者）：3-12个月，已掌握基本笔画，正在深入临帖和学习结构
- **advanced**（高级者）：1年以上，已具备扎实基础，正在追求艺术表达和风格形成

## 安装与使用

### 方式一：全局安装（推荐）

```bash
npm install -g calligraphy-mcp
```

### 方式二：本地安装

```bash
git clone https://github.com/your-repo/calligraphy-mcp.git
cd calligraphy-mcp
npm install
npm run build
```

## 在 Claude Desktop 中配置

编辑 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "calligraphy": {
      "command": "node",
      "args": ["/path/to/calligraphy-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

### 如果使用全局安装：

```json
{
  "mcpServers": {
    "calligraphy": {
      "command": "calligraphy-mcp",
      "args": [],
      "env": {}
    }
  }
}
```

## 在 Trae IDE 中配置

在 MCP 设置中添加：

```json
{
  "calligraphy": {
    "command": "node",
    "args": ["d:\\phpstudy_81\\WWW\\self\\shufa-mcp\\dist\\index.js"],
    "env": {}
  }
}
```

## 工具说明

### 1. query_calligraphy - 书法知识问答

```json
{
  "question": "什么是永字八法？",
  "level": "beginner"
}
```

### 2. get_learning_plan - 获取学习计划

```json
{
  "current_level": "beginner",
  "goal": "系统学习楷书",
  "daily_minutes": 30
}
```

### 3. get_master_info - 查询名家信息

```json
{
  "master_name": "王羲之"
}
```

### 4. get_technique_guide - 获取技法指导

```json
{
  "technique_type": "grip",
  "level": "beginner"
}
```

### 5. get_aesthetic_insight - 探讨书法美学

```json
{
  "topic": "书法与人生",
  "level": "advanced"
}
```

### 6. get_common_questions - 常见问题解答

```json
{
  "category": "beginner"
}
```

## 知识库内容

本项目包含以下知识库文档：

| 文档 | 内容 |
|------|------|
| beginner-guide.md | 书法初学者入门指南 |
| calligraphy-history.md | 中国书法历史与书体演变 |
| calligraphy-techniques.md | 书法笔法技法详解 |
| calligraphy-masters.md | 历代书法名家与传世名作 |
| calligraphy-creation.md | 书法创作与章法 |
| calligraphy-aesthetics.md | 书法审美与哲学 |
| learning-plan.md | 书法学习计划与练习方法 |
| common-questions.md | 书法常见问题与答疑 |

## 开发

```bash
# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build

# 运行
npm start
```

## 项目结构

```
calligraphy-mcp/
├── src/
│   └── index.ts          # MCP 服务入口
├── knowledge/            # 书法知识库
│   ├── 01-beginner-guide.md
│   ├── 02-calligraphy-history.md
│   ├── 03-calligraphy-techniques.md
│   ├── 04-calligraphy-masters.md
│   ├── 05-calligraphy-creation.md
│   ├── 06-calligraphy-aesthetics.md
│   ├── 07-learning-plan.md
│   └── 08-common-questions.md
├── dist/                 # 编译输出
├── package.json
├── tsconfig.json
└── README.md
```

## 许可证

MIT
