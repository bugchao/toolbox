/**
 * 内置示例：覆盖嵌套对象、数组、多行字符串、布尔/数字/null 等典型 YAML 场景。
 * 仅用于演示，不需要单测。
 */
export interface YamlSample {
  /** 标识键名，用于做按钮 key */
  name: string
  /** 中文标签 */
  labelZh: string
  /** 英文标签 */
  labelEn: string
  /** YAML 文本内容 */
  yaml: string
}

export const SAMPLES: YamlSample[] = [
  {
    name: 'kubernetes',
    labelZh: 'K8s 示例',
    labelEn: 'K8s sample',
    yaml: `apiVersion: v1
kind: Service
metadata:
  name: web
  labels:
    app: web
    tier: frontend
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
  selector:
    app: web
`,
  },
  {
    name: 'github-actions',
    labelZh: 'GitHub Actions',
    labelEn: 'GitHub Actions',
    yaml: `name: ci
on:
  push:
    branches: [main]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
        env:
          NODE_ENV: test
`,
  },
  {
    name: 'config',
    labelZh: '混合数据',
    labelEn: 'Mixed data',
    yaml: `name: toolbox-codex
version: 1.0.0
features:
  - yaml
  - json
  - converter
flags:
  debug: false
  verbose: true
  retry: null
description: |
  A monorepo of small focused tools.
  Each tool lives in its own package.
limits:
  maxSize: 1024
  timeoutMs: 30000
`,
  },
]
