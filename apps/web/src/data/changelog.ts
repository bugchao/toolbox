export type ChangelogText = {
  zh: string
  en: string
}

export type ChangelogItem = {
  type: 'added' | 'updated'
  summary: ChangelogText
  paths: string[]
  extraLabels?: ChangelogText[]
}

export type ChangelogEntry = {
  date: string
  title: ChangelogText
  items: ChangelogItem[]
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-04-04',
    title: {
      zh: '更新日志页面上线',
      en: 'Changelog page launched',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增独立更新日志菜单，按日期记录每次变更，并在条目中展示对应菜单名称。',
          en: 'Added a dedicated changelog menu that records each update by date and lists the affected menu names.',
        },
        paths: ['/changelog'],
      },
      {
        type: 'updated',
        summary: {
          zh: '翻译工作台升级为 AI 翻译平台，加入多输入、逐句编辑、多版本输出、术语库、历史记录和文档翻译结构。',
          en: 'Upgraded the translation workbench into an AI translation platform with multi-input support, sentence editing, multi-version output, glossary, history, and document workflows.',
        },
        paths: ['/translation-hub'],
      },
    ],
  },
  {
    date: '2026-04-03',
    title: {
      zh: '20 个新工具分组上线',
      en: 'Four groups of 20 new tools released',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '第一组聚焦效率、复盘和本地预览能力。',
          en: 'Group 1 focused on productivity, review, and local preview workflows.',
        },
        paths: [
          '/procrastination-test',
          '/daily-review',
          '/image-local-preview',
          '/travel-cost-compare',
          '/weather-outfit',
        ],
      },
      {
        type: 'added',
        summary: {
          zh: '第二组聚焦旅行场景的热度、客流、风险与路线辅助。',
          en: 'Group 2 focused on travel heat, crowds, risk checks, and routing support.',
        },
        paths: [
          '/attraction-heatmap',
          '/crowd-forecast',
          '/travel-risk',
          '/photo-spots',
          '/route-map',
        ],
      },
      {
        type: 'added',
        summary: {
          zh: '第三组聚焦知识整理、学习路径和内容抽取。',
          en: 'Group 3 covered extraction, note organization, and guided learning flows.',
        },
        paths: [
          '/web-extractor',
          '/note-organizer',
          '/glossary-gen',
          '/knowledge-graph',
          '/learning-path',
        ],
      },
      {
        type: 'added',
        summary: {
          zh: '第四组聚焦编程练习、面试准备和深度问答。',
          en: 'Group 4 focused on coding practice, interview prep, and deep-dive Q&A.',
        },
        paths: [
          '/coding-challenge',
          '/frontend-interview',
          '/system-design',
          '/conversation-practice',
          '/deep-dive-qa',
        ],
      },
    ],
  },
  {
    date: '2026-04-02',
    title: {
      zh: '开发工具补齐与接线修复',
      en: 'Dev tool wiring and missing pages completed',
    },
    items: [
      {
        type: 'updated',
        summary: {
          zh: 'Rapid Tables 增加按键输入模式，兼容输入框直接录入。',
          en: 'Rapid Tables now supports keypad-style input alongside direct text entry.',
        },
        paths: ['/rapid-tables'],
      },
      {
        type: 'added',
        summary: {
          zh: '补齐之前只有入口、没有完整页面接线的开发工具。',
          en: 'Completed the dev tools that previously had menu entries but no finished pages.',
        },
        paths: [
          '/graphql-playground',
          '/postman-lite',
          '/github-repo',
          '/github-user',
          '/text-cipher',
          '/text-stats',
        ],
      },
      {
        type: 'updated',
        summary: {
          zh: '修复重复配置导致的导航键冲突问题。',
          en: 'Fixed duplicate navigation entries that caused React key conflicts.',
        },
        paths: ['/ip-query', '/ip-asn'],
      },
    ],
  },
  {
    date: '2026-04-01',
    title: {
      zh: '天气与专注工具体验整理',
      en: 'Weather and focus experience refinements',
    },
    items: [
      {
        type: 'updated',
        summary: {
          zh: '天气工具迁移为独立模块，并优化定位、布局与时间范围体验。',
          en: 'The weather tool was migrated into an independent module with improved location, layout, and date-range behavior.',
        },
        paths: ['/weather'],
      },
      {
        type: 'updated',
        summary: {
          zh: '修复专注模式刷新后状态丢失的问题，恢复持久化会话。',
          en: 'Fixed focus-mode session persistence so refreshes restore the saved state correctly.',
        },
        paths: ['/focus-mode'],
      },
    ],
  },
]

export function getLocalizedChangeText(text: ChangelogText, language: string) {
  return language.startsWith('en') ? text.en : text.zh
}
