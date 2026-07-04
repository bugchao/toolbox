# @toolbox/meeting-audio-service

纯本地会议声音转写：BlackHole 虚拟声卡捕获系统声音 → whisper.cpp 本地转写 → SSE 推给会议纪要页；纪要总结可选走本地 Ollama。音频与文字全程不出本机。

## 一次性准备（macOS）

```bash
brew install whisper-cpp blackhole-2ch
```

然后打开「音频 MIDI 设置」→ 左下角 `+` → 创建多输出设备，勾选「扬声器 + BlackHole 2ch」，并把系统输出切到这个多输出设备（自己能听到，BlackHole 同时收到一份）。

whisper 模型（默认 `base`，约 148MB）首次使用时自动下载到 `~/.cache/whisper-cpp/`。

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `WHISPER_MODEL` | `base` | ggml 模型名（`tiny`/`base`/`small`…，中文更准用 `small`） |
| `WHISPER_STREAM_BIN` | `whisper-stream` | 二进制路径 |
| `OLLAMA_MODEL` | 自动（优先 qwen） | 纪要总结用的本地模型 |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Ollama 地址 |

## API

- `GET /api/meeting-audio/status` — 依赖就绪状态
- `GET /api/meeting-audio/stream?lang=zh&device=N` — SSE：`model`(下载进度)/`status`/`text`/`error`；断开连接即停止捕获
- `POST /api/meeting-audio/summarize` — `{transcript,title,date}` → Ollama 生成结构化纪要 JSON
