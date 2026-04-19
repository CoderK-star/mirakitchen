// 食材辞書 静的データ (AGENT.md Phase 3)

export interface Ingredient {
  name: string;
  emoji: string;
  category: IngredientCategory;
  storage: string;  // 保存方法
  shelfLife: string; // 保存期間の目安
  tips: string;     // 調理 Tips
}

export type IngredientCategory =
  | "野菜"
  | "肉・魚"
  | "卵・乳製品"
  | "乾物・調味料"
  | "きのこ・海藻";

export const INGREDIENTS: Ingredient[] = [
  // 野菜
  {
    name: "玉ねぎ",
    emoji: "🧅",
    category: "野菜",
    storage: "常温・風通しの良い暗所",
    shelfLife: "約1〜2ヶ月",
    tips: "炒めるとき、最初に透明になるまで炒めると甘みが出ます。",
  },
  {
    name: "にんじん",
    emoji: "🥕",
    category: "野菜",
    storage: "冷蔵（ポリ袋に入れて野菜室）",
    shelfLife: "約2〜3週間",
    tips: "皮ごと調理可。太さが均一になるよう乱切りにすると均等に火が通ります。",
  },
  {
    name: "じゃがいも",
    emoji: "🥔",
    category: "野菜",
    storage: "常温・暗所（冷蔵は NG）",
    shelfLife: "約1〜2ヶ月",
    tips: "水にさらすとデンプンが抜けてべたつきが減り、炒め物に向きます。",
  },
  {
    name: "キャベツ",
    emoji: "🥬",
    category: "野菜",
    storage: "冷蔵（芯をくりぬいて湿らせたペーパー詰め）",
    shelfLife: "約2週間",
    tips: "芯を残したまま切ると鮮度が長持ちします。",
  },
  {
    name: "トマト",
    emoji: "🍅",
    category: "野菜",
    storage: "常温（完熟後は冷蔵）",
    shelfLife: "常温3〜5日 / 冷蔵1週間",
    tips: "ヘタが下になるよう保存すると劣化しにくいです。",
  },
  {
    name: "ほうれん草",
    emoji: "🌿",
    category: "野菜",
    storage: "冷蔵（濡らしたペーパーで包んで立てて保存）",
    shelfLife: "約3〜4日",
    tips: "茹でてから冷凍すると2週間保存できます。",
  },
  // 肉・魚
  {
    name: "鶏むね肉",
    emoji: "🍗",
    category: "肉・魚",
    storage: "冷蔵（購入翌日まで）・冷凍（1ヶ月）",
    shelfLife: "冷蔵：翌日 / 冷凍：1ヶ月",
    tips: "片栗粉をまぶしてから焼くとパサつかずジューシーに仕上がります。",
  },
  {
    name: "豚こま切れ肉",
    emoji: "🥩",
    category: "肉・魚",
    storage: "冷蔵（購入翌日まで）・冷凍（1ヶ月）",
    shelfLife: "冷蔵：翌日 / 冷凍：1ヶ月",
    tips: "炒める前に砂糖少々をもみこむと柔らかく仕上がります。",
  },
  {
    name: "鮭（切り身）",
    emoji: "🐟",
    category: "肉・魚",
    storage: "冷蔵（購入当日〜翌日）・冷凍（2週間）",
    shelfLife: "冷蔵：翌日 / 冷凍：2週間",
    tips: "塩を振って10分おき、水けをふいてから焼くと皮がパリッとします。",
  },
  // 卵・乳製品
  {
    name: "卵",
    emoji: "🥚",
    category: "卵・乳製品",
    storage: "冷蔵（とがった方を下にして保存）",
    shelfLife: "約2週間（生食は購入から1週間推奨）",
    tips: "炒り卵は弱火でゆっくり混ぜると、ふんわりに仕上がります。",
  },
  {
    name: "豆腐",
    emoji: "⬜",
    category: "卵・乳製品",
    storage: "開封後：水を毎日替えて冷蔵",
    shelfLife: "開封後3〜4日",
    tips: "キッチンペーパーで包んでレンジ1分→水切りすると崩れにくくなります。",
  },
  // 乾物・調味料
  {
    name: "醤油",
    emoji: "🍶",
    category: "乾物・調味料",
    storage: "開封後は冷蔵",
    shelfLife: "開封後：約1ヶ月で使い切り推奨",
    tips: "「炒め醤油」は高温で香ばしさが出ます。仕上げに回しかけるのがコツ。",
  },
  {
    name: "みりん",
    emoji: "🍯",
    category: "乾物・調味料",
    storage: "常温・暗所（開封後も可）",
    shelfLife: "開封後：約6ヶ月",
    tips: "加熱するとアルコールが飛んで甘みと照りが出ます。",
  },
  {
    name: "片栗粉",
    emoji: "🫙",
    category: "乾物・調味料",
    storage: "常温・密封容器",
    shelfLife: "開封後：約1年",
    tips: "水溶き片栗粉は必ず混ぜてから加えること。ダマ防止に弱火で加えてください。",
  },
  // きのこ・海藻
  {
    name: "しめじ",
    emoji: "🍄",
    category: "きのこ・海藻",
    storage: "冷蔵（袋のまま or ペーパー包み）",
    shelfLife: "約3〜5日",
    tips: "石づきを切り落とし、手でほぐして使います。洗うと風味が落ちるので拭く程度に。",
  },
  {
    name: "わかめ（乾燥）",
    emoji: "🌊",
    category: "きのこ・海藻",
    storage: "常温・密封容器",
    shelfLife: "未開封：賞味期限通り。開封後：1〜2ヶ月",
    tips: "水で戻すと5〜10倍に膨らみます。戻しすぎ注意。",
  },
];

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "野菜",
  "肉・魚",
  "卵・乳製品",
  "乾物・調味料",
  "きのこ・海藻",
];
