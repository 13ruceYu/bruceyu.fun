---
title: 如何让用户拥有他们的数据
description: 让用户拥有他们的数据
date: 2025-03-10
---

[Tinymind](https://github.com/mazzzystar/tinymind) 这个项目很有意思，它可以让用户通过 GitHub 登录之后，发布 blog 和 thoughts，并且这些数据是存储在用户的 GitHub repo 中，这在一定程度上就是让用户拥有了自己的数据，我觉得这是一件很棒事情，可以让一些没有提供用户数据存储的工具网站有了想象空间，比如 [excalidraw](https://excalidraw.com)。

整个项目的工作流也比较简单，首先通过 GitHub OAuth 获取 auth token，然后使用这个 token 和 GitHub 的 [octokit](https://github.com/octokit/rest.js) 来操作 GitHub repo。

主要的逻辑也比较简单，OAuth 获取 token，检查用户是否有对应的 repo，if 没有则创建 repo，else 获取当前数据。

但是在实践过程中发现 GitHub 创建 repo 的数据存在延迟，这就会导致接口返回创建成功，但是当我们想要立刻从 repo 中 fetch 数据时，却会报错的情况。

[简单实现](https://github.com/13ruceYu/clone-tinymind)
