# PRD: 屏幕录制 Studio

- 工具 ID: `tool-screen-recorder`
- 路径: `/screen-recorder`
- 分类: `utility`
- 模式: `client`（纯前端，无后端）
- 创建日期: 2026-04-25

---

## 1. 背景与目标

需要演示、反馈或教程时，主流方案要么装客户端（OBS/Loom），要么走云端（数据离开本机）。本工具利用浏览器原生的 `getDisplayMedia` + `MediaRecorder`，做一个**完全本地、零安装、零上传**的录屏方案，覆盖最常见的 80% 场景：录一段屏给同事/学生看，立刻下载。

**目标**：

1. 用户打开页面 ≤ 30 秒就能开始录制。
2. 录制全过程不发起任何网络请求。
3. 录制结果可在浏览器内预览并直接下载到本地。

**非目标**：不做云存储、不做协作、不做编辑/裁剪、不做转码。

---

## 2. 目标用户与场景

| 用户 | 场景 |
|------|------|
| 开发者 / 测试 | 录一段 bug 复现给同事，要求不上传、不留痕 |
| 讲师 / 学习者 | 录浏览器内某次操作做教程，需要带麦克风讲解 |
| 普通用户 | 录一段屏给客服或家人看，怕装软件 |

共同点：**临时性、轻量、隐私敏感**。

---

## 3. 功能范围

### 3.1 必须有 (P0)

- 通过 `getDisplayMedia` 选择录制源：浏览器标签 / 应用窗口 / 整个屏幕（由浏览器原生选择器提供，工具本身不做 UI 区分）
- 录制控制：开始 / 暂停 / 继续 / 停止
- 录制中显示**实时计时器**（HH:MM:SS），暂停时停走、继续时续上
- **音频混流**：可独立开关「系统音」和「麦克风」
- 录制结束后内嵌 `<video>` 预览
- 一键下载视频到本地（文件名带时间戳）
- 浏览器不支持 `getDisplayMedia` 时给出明确提示

### 3.2 应该有 (P1)

- 录制中显示当前文件大小估算（基于 `dataavailable` chunk 累积）
- 录制中显示状态指示（idle / requesting permission / recording / paused / finished）
- 启动失败（用户拒绝授权 / 设备错误）的明确错误文案，区分类型
- 录制完成后保留视频，允许重新录制（不强制刷新页面）

### 3.3 不做

- 不做云端上传 / 分享链接
- 不做视频编辑（裁剪、拼接、加水印等）
- 不做格式转码（保持浏览器原生 MIME，例如 webm；不实现 mp4 转码）
- 不做摄像头叠加（picture-in-picture）
- 不做定时录制 / 自动停止
- 不做录制历史保存到 localStorage 或 IndexedDB

---

## 4. 输入与输出

| 维度 | 内容 |
|------|------|
| **输入** | 用户点击「开始录制」后，由浏览器原生选择器选定录制源；可选音频源开关（系统音 / 麦克风） |
| **运行时输入** | 暂停 / 继续 / 停止 三个控制按钮 |
| **输出** | 一个 Blob 视频文件，浏览器原生 MIME（`video/webm; codecs=vp9` 或回退），文件名格式 `screen-recording-YYYYMMDD-HHmmss.webm` |
| **副作用** | 无网络请求；无任何持久化；无第三方上报 |

---

## 5. UI 草图（文字描述）

页面顶部沿用 `PageHero`（标题 + 描述）。下方主体按状态切换三个面板：

**Panel A — 待录制 (idle)**

```
┌─────────────────────────────────────┐
│  录制选项                              │
│  ☐ 包含系统音                          │
│  ☐ 包含麦克风                          │
│                                      │
│           [ ⬤  开始录制 ]             │
│                                      │
│  ⓘ 浏览器会弹出选择器，选要录的源        │
└─────────────────────────────────────┘
```

**Panel B — 录制中 / 暂停 (recording / paused)**

```
┌─────────────────────────────────────┐
│  ● 00:01:23     大小: ~4.2 MB        │
│                                      │
│   [ ⏸ 暂停 ]   [ ⏹ 停止 ]            │
└─────────────────────────────────────┘
```

暂停时 `●` 变灰，按钮变为 `▶ 继续`。

**Panel C — 录制完成 (finished)**

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────┐        │
│  │  <video preview>        │        │
│  └─────────────────────────┘        │
│   时长 00:01:23  大小 4.2 MB         │
│   [ ⬇ 下载 ]   [ ↺ 再录一段 ]        │
└─────────────────────────────────────┘
```

**错误态** — 整页一个居中卡片，红色图标 + 文案 + 单一行动按钮（重试 / 切换浏览器提示）。

UI 全部从 `@toolbox/ui-kit` 取（`PageHero`, `Card`, `Button`, `Switch` 等）。需要 `Switch` 但 ui-kit 没有则先在 ui-kit 加。

---

## 6. 后端能力

**不需要**。`mode: 'client'`，所有逻辑都跑在浏览器里。

---

## 7. i18n 关键词清单

`namespace: toolScreenRecorder`，`zh.json` / `en.json` 同步。初始 key 集合：

```
title
description

panel.idle.title
panel.idle.includeSystemAudio
panel.idle.includeMic
panel.idle.startButton
panel.idle.hint

panel.recording.statusRecording
panel.recording.statusPaused
panel.recording.sizeLabel
panel.recording.pauseButton
panel.recording.resumeButton
panel.recording.stopButton

panel.finished.previewLabel
panel.finished.durationLabel
panel.finished.sizeLabel
panel.finished.downloadButton
panel.finished.restartButton

error.unsupported          // 浏览器不支持 getDisplayMedia
error.permissionDenied     // 用户拒绝授权
error.deviceError          // 设备级错误（如无音频设备）
error.recordingFailed      // 录制中突发失败

status.idle
status.requesting
status.recording
status.paused
status.finished
```

搜索关键词（manifest.keywords）：
`['screen recorder', 'screen capture', 'record screen', 'webm', 'mediarecorder', 'getDisplayMedia', '屏幕录制', '录屏', '本地录屏', '隐私', '无上传']`

---

## 8. 验收标准

工具达到以下全部条件才算 P0 完成：

- [ ] 在 Chrome / Edge / Firefox 现代版本（≥2024）能完整跑通：开始 → 录制 → 暂停 → 继续 → 停止 → 预览 → 下载
- [ ] Safari（不支持 `getDisplayMedia` 的版本）打开页面立即显示 `error.unsupported`，无控制台异常
- [ ] 用户拒绝屏幕共享授权时显示 `error.permissionDenied`，并允许重试
- [ ] 暂停时计时器停走；继续后从暂停时刻续上（不重置）
- [ ] 系统音 / 麦克风两个开关独立生效，关掉的不进最终视频
- [ ] 录制 60 秒以内不发出任何网络请求（DevTools Network 面板验证）
- [ ] 下载文件能在本机播放器（QuickTime / VLC / 浏览器）播放
- [ ] zh / en 切换无 raw key 泄漏
- [ ] `pnpm check:consistency` / `pnpm lint` / `pnpm -C apps/web build` / `pnpm test` 全绿
- [ ] Playwright e2e spec 至少覆盖 idle 面板渲染（录制本身需要用户交互，e2e 只验静态渲染）

---

## 9. 参考工具

- **UX 形态**：`tools/tool-image-canvas-lab`（同样是 Web API 重型 client 工具，状态机 + 操作面板）
- **状态切换面板**：`tools/tool-blockchain-transfer`（多状态切换的页面骨架）
- **错误面板**：参考通用错误文案模式即可，无特定参考工具
