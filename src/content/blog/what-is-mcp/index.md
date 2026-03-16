---
title: 什么是 MCP？
description: MCP 是大模型时代的“USB 接口”，它将模型与工具解耦，极大地降低了开发者的维护成本，推动了 AI 应用生态的繁荣。
date: 2026-03-15
---

在 AI 还处于“纯聊天”阶段时，大模型（LLM）主要基于静态的训练数据进行推理。你的输入是文本，它的输出也是文本——这是大模型最初的形态，也是它的能力边界。

---

## 1. 从“只会说”到“不仅能说，还要能做”

随着应用场景的深入，我们对 AI 的期望发生了质变：我们希望模型不仅能提供建议，还能**直接调用外部工具和数据**。例如：

* **自动化办公**：直接在 Notion 中创建页面并排版。
* **研发协同**：根据对话上下文在 GitHub 仓库中提交 Issue。
* **实时知识**：检索最新的 Nuxt 或 Next.js 官方文档，编写符合当前版本 API 的代码。

## 2. 碎片化困局：MCP 诞生前的挑战

在 MCP 出现之前，将模型连接到工具的路径极其碎片化。OpenAI 有 Function Calling，Anthropic 有 Claude Tools，Google 有 Gemini API。

* **$N \times M$ 复杂度灾难**：如果你想让 $N$ 个模型都能操作 $M$ 个工具，你需要编写 $N \times M$ 套适配代码。
* **生态孤岛**：各家接口私有且互不兼容，开发者的维护成本随工具数量呈指数级增长，跨平台迁移与复用几乎不可能。

## 3. MCP：大模型时代的“USB 接口”

为了终结这种乱象，**Anthropic 在 2024 年 11 月正式开源了 MCP (Model Context Protocol)**。

MCP 是一套开放的通用标准，它就像是为 AI 应用定义的“USB 协议”。它将模型（Client）与数据源/工具（Server）解耦：**开发者只需为工具编写一次 MCP Server，任何支持 MCP 协议的模型应用就都能立即调用它。**

---

## MCP 的实际应用场景

通过对应的 MCP Server，上文提到的场景可以被标准化实现：

1. **Notion 页面创建**：可以通过一个 Notion MCP Server 来实现，模型通过 MCP 协议调用 Server 接口来创建页面：[makenotion/notion-mcp-server](https://github.com/makenotion/notion-mcp-server)。
2. **GitHub Issue 创建**：可以通过一个 GitHub MCP Server 来实现，模型通过 MCP 协议调用 Server 接口来创建 Issue：[io.github.github/github-mcp-server](https://github.com/github/github-mcp-server)。
3. **最新文档获取和代码编写**：可以通过一个 Context7 MCP Server 来实现，模型通过 MCP 协议调用 Server 接口来获取最新文档：[io.github.upstash/context7](https://github.com/upstash/context7)。

> **核心价值：**
> MCP 不仅仅是让模型“能做”（Action），更核心的是解决**“上下文检索”（Context）**的标准化。它包含 Tool 调用、Resource（数据读取）和 Prompt（模版共享）三大核心支柱。

## 总结

MCP 的出现标志着 AI 应用开发从“手工业”向“工业标准”的跨越。它不仅扩展了模型的能力边界，更构建了一个可复用的插件生态。通过 MCP，模型真正成为了能够连接万物的**智能中枢**。
