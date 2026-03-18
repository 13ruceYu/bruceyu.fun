---
name: commit-message
description: 根据代码变动生成 commit message，并按固定流程执行 git commit。
---

目标：

- 根据代码变动自动生成中文 commit message
- 按固定顺序执行提交流程

<type>(<emoji>): <subject>

规则：

- subject 是对变动代码的简短描述，使用中文
- type 是变动类型，只能是以下之一：

- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构

执行流程（必须按顺序）：

1. 先将当前工作区变更加入暂存区：
   - git add .
2. 查看所有 staged 文件与差异：
   - git diff --staged --name-only
   - git diff --staged
3. 基于 staged diff 生成 commit message
4. 执行提交：
   - git commit -m "<type>(<emoji>): <subject>"
5. 返回提交结果（commit hash、message、涉及文件数）

安全约束：

- 不执行破坏性命令（例如 git reset --hard、git checkout --）
- 不自动 push，除非用户明确要求
- 不自动 amend，除非用户明确要求
- 若 staged 无变更，提示“没有可提交的变更”

示例：

- feat(✨): 添加用户登录功能
- fix(🐛): 修复目录跳转偏移问题
- docs(📝): 更新技能使用说明
- style(🎨): 调整样式与缩进格式
- refactor(♻️): 重构文章列表渲染逻辑
