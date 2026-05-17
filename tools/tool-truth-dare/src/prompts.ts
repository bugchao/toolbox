// 内置题库 —— 仅作为玩家自定义之外的兜底。请保持中英双语对齐。
// 4 档难度：mild (温和) / normal (普通) / spicy (刺激) / wild (限制级)

export type PromptType = 'truth' | 'dare'
export type PromptDifficulty = 'mild' | 'normal' | 'spicy' | 'wild'

export interface Prompt {
  id: string
  type: PromptType
  difficulty: PromptDifficulty
  zh: string
  en: string
}

// 用前缀帮助识别内置题（自定义题以 c- 开头）
const t = (id: string, difficulty: PromptDifficulty, zh: string, en: string): Prompt => ({
  id: `b-t-${id}`,
  type: 'truth',
  difficulty,
  zh,
  en,
})
const d = (id: string, difficulty: PromptDifficulty, zh: string, en: string): Prompt => ({
  id: `b-d-${id}`,
  type: 'dare',
  difficulty,
  zh,
  en,
})

export const BUILT_IN_PROMPTS: Prompt[] = [
  // ── 真心话 · 温和 ──
  t('m1', 'mild', '说一件今天让你最开心的事。', 'Share the happiest moment of your day.'),
  t('m2', 'mild', '你小时候最尴尬的一次经历是什么？', 'What was your most embarrassing childhood moment?'),
  t('m3', 'mild', '你最近一次哭是因为什么？', 'When did you last cry, and why?'),
  t('m4', 'mild', '你最喜欢在场哪个人的哪个优点？', 'What\'s your favorite trait of someone here?'),
  t('m5', 'mild', '如果可以瞬移到任何地方，你现在最想去哪？', 'If you could teleport anywhere right now, where?'),
  t('m6', 'mild', '说出你最近读完的一本书或看完的一部电影。', 'Name the last book or film you actually finished.'),

  // ── 真心话 · 普通 ──
  t('n1', 'normal', '到目前为止你犯过最蠢的错误是什么？', 'What\'s the dumbest mistake you\'ve made so far?'),
  t('n2', 'normal', '在场的人里，你最想交换人生的是谁？为什么？', 'Whose life here would you most want to swap, and why?'),
  t('n3', 'normal', '说一个你从来没告诉过任何人的小秘密。', 'Share a small secret you\'ve never told anyone.'),
  t('n4', 'normal', '你最近一次说谎是什么时候？谎言是什么？', 'When did you last lie, and what about?'),
  t('n5', 'normal', '如果只剩 24 小时，你最想做的三件事是什么？', 'If you had only 24 hours, what three things would you do?'),
  t('n6', 'normal', '说出在场每人的一个缺点和一个优点。', 'Name one strength and one weakness of every person here.'),

  // ── 真心话 · 刺激 ──
  t('s1', 'spicy', '你做过最疯狂的事是什么？', 'What\'s the wildest thing you\'ve ever done?'),
  t('s2', 'spicy', '在场最让你心动的人是谁？说出第一印象。', 'Who in the room attracts you most? Share your first impression.'),
  t('s3', 'spicy', '上一段感情结束的真实原因是什么？', 'What was the real reason your last relationship ended?'),
  t('s4', 'spicy', '你最近一次对父母说过的最大的谎是什么？', 'What\'s the biggest lie you\'ve told your parents recently?'),
  t('s5', 'spicy', '你曾经在公开场合做过最丢脸的事是什么？', 'What\'s the most humiliating thing you\'ve done in public?'),
  t('s6', 'spicy', '如果今晚就可以重置过去，你最想撤回的决定是？', 'If you could undo one past decision tonight, which one?'),

  // ── 真心话 · 限制级 ──
  t('w1', 'wild', '你单身/感情中做过最越界的事是什么？', 'What\'s the most boundary-pushing thing you\'ve done in (or out of) a relationship?'),
  t('w2', 'wild', '在场的人中你最想和谁约会一次？', 'Who in the room would you most want to go on a date with?'),
  t('w3', 'wild', '说出你曾暗恋但从未表白的人。', 'Name someone you secretly crushed on but never told.'),
  t('w4', 'wild', '你曾对在场某人产生过什么样的"非分之想"？', 'Have you ever had inappropriate thoughts about someone here? Share.'),
  t('w5', 'wild', '说出你最不想让父母知道的一件事。', 'Share the one thing you most don\'t want your parents to know.'),
  t('w6', 'wild', '坦白：你曾经偷偷喜欢上在场某人的伴侣吗？', 'Confess: have you ever secretly liked someone\'s partner who is here?'),

  // ── 大冒险 · 温和 ──
  d('m1', 'mild', '模仿在场任意一人讲话 30 秒。', 'Imitate anyone in the room for 30 seconds.'),
  d('m2', 'mild', '原地深蹲 15 个。', 'Do 15 squats in place.'),
  d('m3', 'mild', '用三种不同的语气说"我爱你"。', 'Say "I love you" in three different tones.'),
  d('m4', 'mild', '给在场每人编一个外号。', 'Make up a nickname for everyone here.'),
  d('m5', 'mild', '哼一段歌，让别人猜歌名。', 'Hum a song and have others guess the title.'),
  d('m6', 'mild', '用动作演一个职业，让大家猜。', 'Act out a profession with gestures; others guess.'),

  // ── 大冒险 · 普通 ──
  d('n1', 'normal', '给手机通讯录里第 10 个联系人发一条"在吗"。', 'Text "u up?" to the 10th contact in your phone.'),
  d('n2', 'normal', '让在场所有人轮流摸一下你的手心。', 'Let everyone here briefly touch your palm.'),
  d('n3', 'normal', '吃下一勺由大家共同搭配的"暗黑料理"（限合理范围）。', 'Eat a spoonful of food the group blends together (keep it reasonable).'),
  d('n4', 'normal', '用筷子夹起一根头发并展示 5 秒。', 'Pick up a single hair with chopsticks and hold for 5 seconds.'),
  d('n5', 'normal', '现场打电话给朋友讲一个超冷的笑话。', 'Call a friend and tell them a really bad joke.'),
  d('n6', 'normal', '把鞋反着穿走到屋外再走回来。', 'Walk outside and back with your shoes on the wrong feet.'),

  // ── 大冒险 · 刺激 ──
  d('s1', 'spicy', '到走廊大喊"今天我请客！"持续 5 秒。', 'Go to the hallway and shout "Drinks on me!" for 5 seconds.'),
  d('s2', 'spicy', '让在场任意一人在你脸上贴 5 张便利贴。', 'Let anyone here stick 5 sticky notes on your face.'),
  d('s3', 'spicy', '把你的手机解锁交给左手边的人 1 分钟。', 'Hand your unlocked phone to the person on your left for 1 minute.'),
  d('s4', 'spicy', '现场表演一段尬舞 30 秒。', 'Perform 30 seconds of cringe-worthy dancing.'),
  d('s5', 'spicy', '让其他玩家挑你朋友圈的一条老动态读出来。', 'Let other players pick an old social-media post of yours and read it out.'),
  d('s6', 'spicy', '随机给前任发一个表情包。', 'Send a random meme to an ex.'),

  // ── 大冒险 · 限制级 ──
  d('w1', 'wild', '给在场最想拥抱的人一个 10 秒长拥抱。', 'Give a 10-second hug to whoever you most want to hug here.'),
  d('w2', 'wild', '让全场轮流闻你的头发 / 围巾。', 'Let each person here sniff your hair / scarf.'),
  d('w3', 'wild', '现场给暗恋对象发一条告白短信（可以解释是游戏）。', 'Right now, text a love confession to your crush (you can explain it\'s a game).'),
  d('w4', 'wild', '允许在场某人在你手臂上画任意涂鸦。', 'Let someone here draw whatever they want on your arm.'),
  d('w5', 'wild', '与左手边玩家对视 60 秒不许笑。', 'Make eye contact with the player on your left for 60 seconds without laughing.'),
  d('w6', 'wild', '从在场玩家身上选一件配饰戴到游戏结束。', 'Pick an accessory from someone here and wear it for the rest of the game.'),
]
