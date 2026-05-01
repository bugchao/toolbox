# 自动化工具开发规范

## 一、系统架构

### 1.1 定时任务
- **开发调度器**：每 2 小时启动 5 个并行开发任务
- **监控器**：每 10 分钟检查子agent状态

### 1.2 状态管理
- **状态文件**：`memory/tool-dev-status.json`
- **工具状态**：pending（待开发）→ inProgress（开发中）→ completed（已完成）/ failed（失败）

---

## 二、开发流程

### 2.1 工具选择规则
1. 优先选择 P0 高优先级工具
2. 避免重复分配（检查 tool-dev-status.json）
3. 每批次 5 个工具并行开发

### 2.2 子agent开发要求

每个子agent必须完成以下任务：

#### 步骤 1：创建工具包
```bash
cd toolbox
pnpm create:tool tool-xxx
```

#### 步骤 2：开发工具
- 创建 React 组件（TypeScript）
- 实现核心功能
- 添加样式（Tailwind CSS）
- 编写单元测试（可选）

#### 步骤 3：验证构建
```bash
cd toolbox
pnpm install
pnpm build
```

**必须通过构建验证，否则视为失败！**

#### 步骤 4：创建 Git 分支并提交 MR
```bash
# 创建分支
git checkout -b feat/tool-xxx

# 提交代码
git add .
git commit -m "feat: add tool-xxx"

# 推送分支
git push origin feat/tool-xxx

# 创建 MR（使用 gh 或 glab）
gh pr create --title "feat: add tool-xxx" --body "实现 xxx 工具

## 功能
- 功能1
- 功能2

## 测试
- [x] pnpm build 通过
- [x] 功能测试通过"
```

#### 步骤 5：更新状态
在 `memory/tool-dev-status.json` 中更新工具状态：
```json
{
  "tools": {
    "tool-xxx": {
      "name": "工具名称",
      "status": "completed",
      "startTime": "2026-05-01T15:00:00Z",
      "endTime": "2026-05-01T16:30:00Z",
      "branch": "feat/tool-xxx",
      "mrUrl": "https://github.com/xxx/pull/123",
      "buildPassed": true
    }
  }
}
```

---

## 三、监控与异常处理

### 3.1 监控指标
- **开发中工具数量**：不超过 10 个
- **单个工具开发时长**：不超过 2 小时
- **构建成功率**：目标 100%

### 3.2 异常处理规则

#### 情况 1：子agent崩溃
- **检测**：subagents list 显示状态异常
- **处理**：
  1. 标记工具状态为 `failed`
  2. 清理失败的代码（如果有）
  3. 在下一个调度周期重新分配

#### 情况 2：开发超时（>2小时）
- **检测**：当前时间 - startTime > 2小时
- **处理**：
  1. 使用 `subagents action=kill` 终止子agent
  2. 检查已生成的代码
  3. 如果代码可用，尝试手动完成
  4. 否则标记为 `failed`，重新开发

#### 情况 3：构建失败
- **检测**：`pnpm build` 返回非零退出码
- **处理**：
  1. 标记工具状态为 `failed`
  2. 保存错误日志到 `memory/build-errors/tool-xxx.log`
  3. 清理失败的代码
  4. 重新分配开发任务

#### 情况 4：代码冲突
- **检测**：Git push 失败
- **处理**：
  1. 拉取最新代码
  2. 解决冲突
  3. 重新提交

---

## 四、状态文件格式

### 4.1 tool-dev-status.json 结构

```json
{
  "version": "1.0.0",
  "lastUpdate": "2026-05-01T15:21:00Z",
  "statistics": {
    "total": 100,
    "pending": 95,
    "inProgress": 5,
    "completed": 0,
    "failed": 0
  },
  "tools": {
    "tool-ocr-text": {
      "name": "OCR 文字识别",
      "route": "/ocr-text",
      "priority": "P0",
      "category": "utility",
      "status": "inProgress",
      "subagentId": "subagent-123",
      "startTime": "2026-05-01T15:00:00Z",
      "endTime": null,
      "branch": "feat/tool-ocr-text",
      "mrUrl": null,
      "buildPassed": false,
      "retryCount": 0,
      "errors": []
    }
  },
  "subagents": {
    "subagent-123": {
      "toolId": "tool-ocr-text",
      "status": "running",
      "startTime": "2026-05-01T15:00:00Z",
      "lastCheckTime": "2026-05-01T15:10:00Z"
    }
  },
  "notes": "工具开发状态跟踪文件 - 由自动化系统维护"
}
```

### 4.2 工具状态说明
- **pending**：待开发
- **inProgress**：开发中
- **completed**：已完成（构建通过 + MR已创建）
- **failed**：失败（需要重新开发）

---

## 五、MR 规范

### 5.1 分支命名
```
feat/tool-{tool-name}
```

### 5.2 Commit 消息
```
feat: add {tool-name}

实现 {工具中文名称} 工具

功能：
- 功能1
- 功能2

技术栈：
- React + TypeScript
- Tailwind CSS
```

### 5.3 MR 标题
```
feat: add {tool-name}
```

### 5.4 MR 描述模板
```markdown
## 工具信息
- **名称**：{工具中文名称}
- **路由**：/{tool-name}
- **分类**：{category}
- **优先级**：{priority}

## 功能实现
- [ ] 核心功能
- [ ] UI 界面
- [ ] 响应式设计
- [ ] 错误处理

## 测试
- [x] pnpm build 通过
- [x] 本地功能测试通过
- [ ] 单元测试（可选）

## 截图
（如果有）

## 备注
（如果有）
```

---

## 六、故障恢复

### 6.1 手动干预场景
- 连续 3 次失败的工具
- 构建错误无法自动修复
- Git 冲突复杂

### 6.2 手动干预流程
1. 查看 `memory/tool-dev-status.json` 确认问题
2. 查看 `memory/build-errors/` 中的错误日志
3. 手动修复代码
4. 更新状态文件
5. 手动创建 MR

---

## 七、性能优化

### 7.1 并发控制
- 最大并发数：5 个工具
- 避免资源竞争：每个工具独立目录

### 7.2 资源管理
- 定期清理失败的代码
- 定期清理旧的日志文件
- 监控磁盘空间

---

## 八、报告与通知

### 8.1 每日报告
- 开发完成数量
- 失败工具列表
- 待处理问题

### 8.2 异常通知
- 子agent崩溃
- 构建失败
- 超时警告

---

**创建时间**：2026-05-01  
**维护者**：自动化系统 + 人工审核
