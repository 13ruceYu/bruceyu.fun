---
title: 什么是 Skills？
description: Skills 是一套被工程化管理的 prompt 规范，它让模型在执行特定任务时，能够稳定地按照预期的方式去做事。通过把隐性知识显式化、结构化，Skills 将模型的行为从训练时的"记忆"转变为运行时的"读取"，极大地提升了输出质量和一致性。
date: 2026-03-15
---

> 一种让大模型稳定"记住"做事方法的技术——不是魔法，是结构化的上下文注入。

---

## Skills 解决的什么问题？

假设你在用 AI 帮你把内容大纲扩写成一篇完整的文章，并附上精美的排版。这个任务听起来简单，但实际上有一套隐性知识：字体应该选哪个？配色系统怎么用？哪些排版规则在深色模式下也要保持正确？动画和交互的边界在哪里？

没有 Skills 之前，每次执行这类任务，工程师要么在 prompt 里反复粘贴几百行规范说明，要么接受模型每次输出风格不一致——字体今天用 Inter，明天换成别的；深色模式下文字颜色硬编码为黑色导致完全看不见。每一次都像在重新培训一个新员工。

**没有 Skills 的工作流**

用户说"帮我做一个排版精美的文章展示"。模型不知道这套系统用什么字体规范，不了解 CSS 变量体系，也不清楚深色模式的适配要求。它只能凭训练时见过的"普通网页"来猜——于是输出了一个带紫色渐变背景、Inter 字体、写死了 `#333` 文字颜色的 HTML。在深色模式下，用户看到的是一片黑。

工程师随后在 prompt 里补充了两百字的规范，重新生成，得到了一个稍好一点但仍然不对的版本。反复几轮，一个小时过去了。

**有了 frontend-design Skill 之后**

用户发出同样的请求。系统在执行前自动读取 `frontend-design/SKILL.md`——这份文档定义了完整的设计规范：使用 CSS 变量而非硬编码颜色、字体选择要有个性而非默认 Inter、所有组件必须同时适配深色模式、不使用渐变和阴影……

模型"看到"了这份说明书，输出直接符合规范。你现在看到的这篇文章的排版，就是这个 Skill 生效的结果——包括字体、颜色体系、卡片样式和布局，一次生成，无需反复调整。

|  | 没有 Skills | 有了 Skills |
|---|---|---|
| 规范管理 | 每次任务都要重新描述规范 | 规范一次定义，按需调用 |
| 输出质量 | 依赖 prompt 的完整度 | 由 Skill 文档兜底 |
| 团队协作 | 多人协作时规范难以同步 | 团队共享同一套知识库 |
| 一致性 | 模型每次发挥不一致 | 任务执行结果稳定可预期 |

把散落在 prompt 里、存在工程师脑子里的隐性知识，显式化、结构化，变成可复用的资产——这就是 Skills 的核心价值。

---

## Skills 在文件层面长什么样？

理解 Skills 最直接的方式，是打开文件夹看一眼。一个 Skill 就是一个普通目录，里面放着若干文本文件——没有任何黑盒，没有编译产物，全是人类可读的内容。

以本文用到的 `frontend-design` 为例，它的结构极为简洁：

```
frontend-design/
├── SKILL.md        # 核心文件。定义触发条件、设计规范、字体/颜色/动效规则
└── LICENSE.txt     # 授权声明
```

而一个完整的复杂 Skill，最多可以包含五类内容，每类各司其职：

```
skill-name/
├── SKILL.md            # 唯一入口。模型每次必读，可以很短，也可以是指向子文档的索引
├── LICENSE.txt         # 授权声明，说明使用条款
│
├── references/         # 参考文档。放置较长的专项知识，SKILL.md 按需引用
│   ├── schemas.md          # 数据结构、格式规范、字段定义
│   └── best_practices.md   # 深度指南、边缘情况处理方式
│
├── scripts/            # 可执行脚本。模型在任务执行中可直接调用，把"知道怎么做"升级为"直接帮你做"
│   ├── process.py          # 核心处理逻辑
│   ├── validate.py         # 输出校验
│   └── utils.py            # 公共工具函数
│
├── assets/             # 静态资源。模板文件、HTML 片段、示例输出，供模型直接引用或复制
│   └── template.html       # 可复用的输出模板
│
└── agents/             # 子智能体 prompt。当任务需要多个角色协作时，每个 agent 的详细指令单独存放
    ├── analyzer.md         # 负责分析的子 agent 的 prompt
    └── grader.md           # 负责评估打分的子 agent 的 prompt
```

`SKILL.md` 永远是唯一入口，其余文件夹都是它的延伸。`references/` 负责存放"读的内容"，`scripts/` 负责存放"跑的工具"，`assets/` 负责存放"用的素材"，`agents/` 负责存放"分工协作的子角色"。一个简单 Skill 可以只有 `SKILL.md`；一个复杂 Skill 按需添加文件夹，不需要的目录完全可以不建。

`SKILL.md` 的开头通常有一段 YAML frontmatter，这是整个 Skill 的"身份证"：

```yaml
---
name: skill-name
description: "触发条件。系统用这段话判断当前任务要不要调用本 Skill，写得越精准，触发越准确。"
license: LICENSE.txt has complete terms
---

# 正文：具体的规范、规则、子文档索引……
```

`description` 字段尤其关键——写得太宽泛，每次任务都会被误触发；写得太窄，真正需要时反而调不到。理解了这个结构，你已经具备了自己写一个 Skill 的全部前提：新建一个目录，写一份 `SKILL.md`，正文里写清楚"这件事应该怎么做"，其余文件夹按需添加。就这些。

---

## 如何使用 Skills？

使用 Skills 通常分三步。

**第一步，定义 Skill。** 把某项任务的背景知识、执行规范、输出格式、注意事项，写成一份结构化的文档（通常是 Markdown 格式的 `SKILL.md`）。内容可以很长，也可以很短，关键是要清晰、可操作。

**第二步，存储与索引。** 把这份文档存放在模型可访问的位置——可以是本地文件系统、代码仓库，也可以是向量数据库。如果 Skill 数量多，通常还需要一套检索机制，在合适的时候取出合适的 Skill。

**第三步，在任务执行前注入上下文。** 当用户发起某类任务时，系统先读取对应的 Skill 文档，将其内容拼接到 prompt 的上下文里，再交给模型处理。模型"看到"了这份说明书，便会按照其中的规范来行动。

在某些系统中，这个过程是自动触发的：模型识别到任务类型，自己去"查手册"，再执行。这就是所谓的 agentic（智能体）工作流中 Skill 调用的典型形态。

---

## Skills 的原理是什么？

直接说结论：**Skills 的本质是被工程化管理的 prompt，而不是存储在模型参数里的知识。** 它和你在对话框里手打的文字，在模型眼中没有任何区别——都是上下文里的 token，模型一视同仁地处理。

但这里有一个值得细化的区分：同样是 prompt，用户输入和 Skill 承担的职责并不相同。

|  | 回答的问题 | 举例 |
|---|---|---|
| 用户 prompt | 描述"我要做什么" | 帮我把这个大纲扩写成文章 |
| Skill | 描述"这件事该怎么做" | 字体要有个性、颜色用 CSS 变量、深色模式必须适配…… |

前者是任务输入，后者是执行规范。Skills 在角色上更接近 system prompt 的延伸——它不是用户在说话，而是系统在向模型交代背景规则。两者分工不同，但底层机制完全一样：都是文本，都进上下文，推理时共同决定模型的输出。

正因为 Skills 只是 prompt，它的能力边界也就清晰了：**它影响的是模型的行为，而不是模型的能力。** 一个写得再好的 Skill，也无法让模型做它原本做不到的事；它能做的，是让模型在它本来就能做的事情上，稳定地按照你期望的方式去做。

这个边界同时也是它最大的工程优势：当你需要调整行为时，改的是一个 Markdown 文件，而不是重新训练模型。迭代成本从数周压缩到数分钟。

支撑这一切运作的，还有两个技术机制。其一是**上下文窗口（Context Window）**——GPT-4o 支持 128K token，Claude 3 系列最高支持 200K token，足以容纳相当详细的 Skill 文档。其二是 **RAG（检索增强生成）**——当 Skills 库规模变大，不可能把所有文档都塞进上下文时，RAG 将 Skill 向量化存储，在任务触发时用语义搜索取出最相关的几个按需注入，兼顾规模与效率。

---

## 推荐 Skills

以下 Skills 均来自 [skills.sh](https://skills.sh)——一个开放的 Skills 社区目录，任何人都可以发布和安装。数据截至 2026 年 3 月，按各领域安装量排序。

### 前端开发

| Skill | 作者 | 简介 | 安装量 |
|---|---|---|---|
| [vercel-react-best-practices](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices) | vercel-labs/agent-skills | Vercel 官方出品的 React 最佳实践规范，覆盖组件设计、状态管理、性能优化 | 207.8K |
| [web-design-guidelines](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines) | vercel-labs/agent-skills | Web 设计规范指南，约束 AI 生成界面的视觉一致性 | 163.4K |
| [frontend-design](https://skills.sh/anthropics/skills/frontend-design) | anthropics/skills | 本文使用的设计规范 Skill，字体、颜色、深色模式适配 | 154.3K |
| [shadcn](https://skills.sh/shadcn/ui/shadcn) | shadcn/ui | shadcn/ui 组件库官方 Skill，让 AI 按组件规范生成代码 | 16.7K |

### 工程与开发流程

| Skill | 作者 | 简介 | 安装量 |
|---|---|---|---|
| [systematic-debugging](https://skills.sh/obra/superpowers/systematic-debugging) | obra/superpowers | 结构化调试流程，让 AI 按步骤排查问题而非随机猜测 | 29.9K |
| [test-driven-development](https://skills.sh/obra/superpowers/test-driven-development) | obra/superpowers | TDD 工作流规范，先写测试再写实现 | 24.7K |
| [requesting-code-review](https://skills.sh/obra/superpowers/requesting-code-review) | obra/superpowers | 标准化 Code Review 请求格式，提升协作效率 | 22.6K |
| [git-commit](https://skills.sh/github/awesome-copilot/git-commit) | github/awesome-copilot | 规范化 Git commit message 格式 | 13.7K |

### 内容生产与写作

| Skill | 作者 | 简介 | 安装量 |
|---|---|---|---|
| [copywriting](https://skills.sh/coreyhaines31/marketingskills/copywriting) | coreyhaines31/marketingskills | 文案写作规范，覆盖标题、CTA、品牌语气等 | 34.9K |
| [writing-plans](https://skills.sh/obra/superpowers/writing-plans) | obra/superpowers | 写作前先做规划，输出有结构的大纲再展开 | 27.9K |
| [writing-skills](https://skills.sh/obra/superpowers/writing-skills) | obra/superpowers | 通用写作质量规范，语言精准、结构清晰 | 17.0K |
| [documentation-writer](https://skills.sh/github/awesome-copilot/documentation-writer) | github/awesome-copilot | 技术文档写作规范，适合 API 文档和使用手册 | 8.6K |

### 市场营销与 SEO

| Skill | 作者 | 简介 | 安装量 |
|---|---|---|---|
| [seo-audit](https://skills.sh/coreyhaines31/marketingskills/seo-audit) | coreyhaines31/marketingskills | SEO 审查清单，让 AI 按标准流程分析页面 | 41.9K |
| [marketing-psychology](https://skills.sh/coreyhaines31/marketingskills/marketing-psychology) | coreyhaines31/marketingskills | 将心理学原则应用于营销文案和产品设计 | 25.2K |
| [content-strategy](https://skills.sh/coreyhaines31/marketingskills/content-strategy) | coreyhaines31/marketingskills | 内容策略规划框架，从受众分析到发布计划 | 22.7K |
| [email-sequence](https://skills.sh/coreyhaines31/marketingskills/email-sequence) | coreyhaines31/marketingskills | 邮件序列写作规范，覆盖欢迎邮件到转化漏斗 | 17.2K |

### AI 思维与 Agent 工作流

| Skill | 作者 | 简介 | 安装量 |
|---|---|---|---|
| [brainstorming](https://skills.sh/obra/superpowers/brainstorming) | obra/superpowers | 结构化头脑风暴流程，发散与收敛分阶段进行 | 54.4K |
| [skill-creator](https://skills.sh/anthropics/skills/skill-creator) | anthropics/skills | 用来创建和优化 Skill 本身的 Skill——元技能 | 81.0K |
| [verification-before-completion](https://skills.sh/obra/superpowers/verification-before-completion) | obra/superpowers | 任务完成前的验证清单，防止 AI 自以为做完了 | 17.8K |
| [dispatching-parallel-agents](https://skills.sh/obra/superpowers/dispatching-parallel-agents) | obra/superpowers | 并行 Agent 调度规范，拆分子任务后并发执行 | 16.3K |

完整目录见 [skills.sh](https://skills.sh)，目前收录 88,503 个 Skills，支持通过 `npx skills add <owner/repo>` 一键安装。
