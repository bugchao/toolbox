# tool-remote-shell — Web SSH 终端

浏览器里直连 SSH 的终端，支持多标签页并行。**开箱即用，不需要配任何环境变量。**

## 多终端

一个标签页 = 一条独立的 WS 连接 + 一个 xterm 实例。点「新建连接」开新的，
标签上的圆点表示状态（黄=连接中 / 绿=已连接 / 灰=已断开），断开的标签页可以原地重连。

所有标签页始终保持挂载，切换只是显隐——卸载会丢掉滚动缓冲和正在跑的会话。
标签栏右侧可切全屏（全屏下隐藏标题与提示、保留标签栏，Esc 退出）；顶部的隐私提示可以「不再显示」。

## 刷新恢复

刷新页面后已连接的终端会自动接回去，不用再输密码——因为 SSH 连接压根没断。

原理：WS 掉线时服务端**不销毁会话**，而是寄存 3 分钟（`server/session-pool.js`），
并保留最近 256KB 输出。前端把 `sessionId` 存在 sessionStorage 里，重新加载后发
`attach` 帧挂回去并回放缓冲。**存档里只有主机名/端口/用户名和会话 id，没有任何密钥。**

边界：

- 明确点「断开」或关掉标签页 → 会话立即销毁，不可恢复
- 超过 3 分钟没人来接 → 会话销毁，标签页在刷新后会被收掉，退回新建连接
- 关掉浏览器标签 → sessionStorage 自动清空，寄存的会话也会到期
- `sessionId` 是这条活着的 SSH 会话的凭证：随机 24 字节、只在 ready 帧下发、校验来源 IP

恢复出来的标签页因为没有密钥，「重新连接」按钮是禁用的——真要重连请走「新建连接」。

## 连不上时

界面不会干等：客户端有 20 秒握手兜底，超时会报明确原因而不是一直显示「连接中」。

- **连不上终端网关** → 升级请求没人应答。多半是后端没跑（本地 `pnpm dev` / `pnpm dev:full`，
  生产 `pnpm start`），或者前面的反向代理没转发 WebSocket 升级。
  注意 `pnpm preview` 只服务静态文件、没有后端，这个工具在它下面用不了。
- **网关已连接但没有应答** → 升级成功了但对面不按协议回话，看后端日志。

## 环境变量

只有一个，而且是可选的：

| 变量 | 默认 | 作用 |
|------|------|------|
| `REMOTE_SHELL_TOKEN` | 未设 | 未设 = 谁都能用（本地 / 内网 / 自己的机器）。设了 = 要求填对访问口令才能连 |

```sh
# 本地、内网、自己的机器：什么都不用配
pnpm dev:full

# 公网部署且只想自己用：设个长随机串
REMOTE_SHELL_TOKEN=$(openssl rand -hex 24) pnpm start
```

> 公网部署不设 `REMOTE_SHELL_TOKEN` 的话，任何人都能用这台服务器向任意主机发起
> SSH 连接，出口 IP 是你的。下面的限流能挡住批量爆破，但挡不住「有人拿它当跳板」
> 这件事本身。公网上线记得设口令。

## 硬性限制（没有开关，一直生效）

- 单 IP 并发会话 ≤ 8（多开几个标签页是正常用法），全局 ≤ 40
- 空闲 15 分钟自动断开
- 认证失败 5 次/分钟 → 该 IP 锁定 10 分钟

## 凭据与主机密钥

- 密码 / 私钥只在 `connect` 首帧发给网关，连接建立后立即从内存丢弃。
  **服务端不落盘、不写日志**，日志只记 `来源IP · 目标host:port · 结果`。
- 勾选保存时，凭据由用户的主密码经 PBKDF2-SHA256（310k 轮）派生密钥、
  AES-GCM 加密后存入浏览器 localStorage。主密码不存在任何地方。
- Host key 走 TOFU：首次连接**主动中断握手**并把指纹交给前端确认，
  不静默信任。指纹变更会拦截并告警。

## 结构

```
server/
  gate.js              访问口令校验（定长比较）
  limits.js            会话配额与失败锁定
  session-pool.js      会话寄存池：WS 掉线后暂存 SSH 会话 + 输出回放缓冲
  ssh-adapter.js       ssh2 封装 + TOFU + 错误码归类
  ws-gateway.js        WS upgrade、会话生命周期
  remote-shell-api.js  /api/remote-shell/status（Express + Vite 中间件两种形态）
src/
  vault.ts             浏览器端凭据金库（WebCrypto）
  session.ts           WS 客户端，协议与 endpoint 无关
  TerminalView.tsx     xterm 封装
  ConnectPanel.tsx     连接表单 + 已存主机
  TerminalTab.tsx      单个标签页：一条会话、一个终端、TOFU 弹窗
  RemoteShell.tsx      外壳：状态、金库、标签页列表与切换
```

会话状态放在 `TerminalTab` 的组件实例里，而不是外壳里的 `Map<id, session>`——
React 的组件实例本来就按 key 隔离状态，多开一个终端就是多挂一个实例。

挂载点：生产在 `apps/api-gateway/src/main.js`（`app.listen()` 返回的 http.Server）；
开发在 `apps/web/vite.config.ts` 的 `toolbox-remote-shell` 插件里（`server.httpServer`）。

## 分期

- **P1（本期，已完成）**：SSH 终端、访问口令、限流、凭据金库、host key TOFU
- **P2（未开始）**：SFTP 文件面板（list / 上传 / 下载 / mkdir / rename / 删除）。
  大文件走一次性 HTTP 流式端点，不塞 WS 消息队列。
- **P3（未开始）**：FTP / FTPS 适配（`basic-ftp`）

WS 协议刻意做成 endpoint 无关：以后若要加「浏览器直连本机 agent」模式
（凭据完全不经过本站服务器），只需换 URL，不用重构协议。

## 测试

```sh
pnpm -C apps/web exec vitest run ../../tools/tool-remote-shell
```

`ssh-adapter.test.ts` 会真起一台 ssh2 服务验证 TOFU 全流程。
