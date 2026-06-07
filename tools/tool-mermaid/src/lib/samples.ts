/**
 * 内置 Mermaid 样例，覆盖主流图表类型：
 * flowchart / sequence / class / stateDiagram-v2 / erDiagram / gantt / pie / mindmap
 *
 * `id`     : 稳定标识，下拉/测试用
 * `label`  : i18n key 片段（在组件里组装 t(`samples.${id}`)）
 * `src`    : 直接可渲染的 Mermaid 源码
 */
export interface MermaidSample {
  id: string
  label: string
  src: string
}

export const SAMPLES: MermaidSample[] = [
  {
    id: 'flowchart',
    label: 'flowchart',
    src: `flowchart LR
  A[开始] --> B{条件?}
  B -- 是 --> C[执行操作]
  B -- 否 --> D[结束]
  C --> D`,
  },
  {
    id: 'sequence',
    label: 'sequence',
    src: `sequenceDiagram
  participant U as 用户
  participant W as Web
  participant S as Server
  U->>W: 提交表单
  W->>S: POST /submit
  S-->>W: 200 OK
  W-->>U: 显示成功`,
  },
  {
    id: 'class',
    label: 'class',
    src: `classDiagram
  class Animal {
    +String name
    +int age
    +eat()
    +sleep()
  }
  class Dog {
    +bark()
  }
  Animal <|-- Dog`,
  },
  {
    id: 'state',
    label: 'state',
    src: `stateDiagram-v2
  [*] --> Idle
  Idle --> Loading: fetch
  Loading --> Success: ok
  Loading --> Error: fail
  Success --> [*]
  Error --> Idle: retry`,
  },
  {
    id: 'er',
    label: 'er',
    src: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE-ITEM : contains
  CUSTOMER {
    string name
    string email
  }
  ORDER {
    int id
    date created
  }`,
  },
  {
    id: 'gantt',
    label: 'gantt',
    src: `gantt
  title 项目排期
  dateFormat  YYYY-MM-DD
  section 设计
  需求评审       :a1, 2026-06-01, 3d
  原型设计       :a2, after a1, 5d
  section 开发
  接口开发       :b1, after a2, 7d
  前端联调       :b2, after b1, 4d`,
  },
  {
    id: 'pie',
    label: 'pie',
    src: `pie title 用户分布
  "中国" : 55
  "美国" : 20
  "其他" : 25`,
  },
  {
    id: 'mindmap',
    label: 'mindmap',
    src: `mindmap
  root((Mermaid))
    流程图
      flowchart
    时序图
      sequenceDiagram
    类图
      classDiagram
    状态图
      stateDiagram-v2
    其他
      gantt
      pie
      mindmap`,
  },
]

/** 通过 id 取样例（测试 / 下拉切换都用得上） */
export function findSample(id: string): MermaidSample | undefined {
  return SAMPLES.find((s) => s.id === id)
}
