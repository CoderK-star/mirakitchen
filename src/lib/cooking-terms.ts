// 調理用語辞書 — 曖昧な表現を初心者向けに解説

export interface CookingTerm {
  term: string;          // 用語
  reading: string;       // よみがな
  plain: string;         // 一言説明
  detail: string;        // 詳しい説明
  emoji: string;
}

export const COOKING_TERMS: CookingTerm[] = [
  {
    term: "少々",
    reading: "しょうしょう",
    plain: "親指と人差し指の2本でつまんだ量",
    detail: "親指と人差し指の先でつまめる量。塩なら約0.3〜0.5g。「ひとつまみ」より少ない。",
    emoji: "🤌",
  },
  {
    term: "ひとつまみ",
    reading: "ひとつまみ",
    plain: "親指・人差し指・中指の3本でつまんだ量",
    detail: "3本指でつまめる量。塩なら約1g。「少々」より多い。",
    emoji: "✌️",
  },
  {
    term: "適量",
    reading: "てきりょう",
    plain: "好みに合わせて調整してよい量",
    detail: "決まった量はなく、食べる人の好みで増減してOK。初めては「少なめ」から始めて味を見ながら足すのが安全。",
    emoji: "⚖️",
  },
  {
    term: "中火",
    reading: "ちゅうび",
    plain: "炎がフライパンの底ギリギリに届かない火加減",
    detail: "フライパンの底に炎が当たらない程度。目安は「弱火と強火のちょうど中間」。迷ったら中火で大抵うまくいく。",
    emoji: "🔥",
  },
  {
    term: "弱火",
    reading: "よわび",
    plain: "炎がとても小さく、底に届かない火加減",
    detail: "ガスの場合、つまみを少しだけ回した最小の炎。IHは「3〜4」程度。焦げやすい食材や、じっくり火を通したいときに使う。",
    emoji: "🕯️",
  },
  {
    term: "強火",
    reading: "つよび",
    plain: "炎を最大にした火加減",
    detail: "ガスは全開。IHは「8〜9」程度。炒め物の最後に水気を飛ばすときや、湯を沸かすときに使う。",
    emoji: "🔆",
  },
  {
    term: "きつね色",
    reading: "きつねいろ",
    plain: "薄い黄金色・茶色になった状態",
    detail: "狐の毛並みのような黄みがかった茶色。パンやホットケーキなら「端がこの色になったらひっくり返すタイミング」。",
    emoji: "🦊",
  },
  {
    term: "ひと煮立ち",
    reading: "ひとにたち",
    plain: "沸騰したらすぐ火を弱める",
    detail: "鍋が「グツグツ」と沸騰し始めた直後のこと。長く煮るのではなく、沸いたら火を落とすのが合図。",
    emoji: "♨️",
  },
  {
    term: "下ごしらえ",
    reading: "したごしらえ",
    plain: "調理の前に食材を準備すること",
    detail: "洗う・切る・塩もみする・解凍するなど、加熱前の準備作業の総称。先に済ませておくとスムーズに調理できる。",
    emoji: "🔪",
  },
  {
    term: "和える",
    reading: "あえる",
    plain: "食材を調味料と混ぜ合わせること",
    detail: "サラダを「ドレッシングで和える」など。箸や手でやさしく全体に絡める。混ぜすぎると食材が崩れるので注意。",
    emoji: "🥗",
  },
  {
    term: "水気を切る",
    reading: "みずきをきる",
    plain: "食材の余分な水分を取り除くこと",
    detail: "ざるに上げる・ペーパーで拭く・しっかり絞るなど方法はいろいろ。水気が多いと炒め物が水っぽくなる原因になる。",
    emoji: "💧",
  },
  {
    term: "面取り",
    reading: "めんとり",
    plain: "野菜の角を削り落とすこと",
    detail: "じゃがいもやにんじんの角を包丁で薄く削る作業。煮崩れを防ぐためだが、初心者はスキップしてもOK。",
    emoji: "🥕",
  },
];

/** 用語名のセット（CookingMode での検出用） */
export const COOKING_TERM_SET = new Set(COOKING_TERMS.map((t) => t.term));

/** 文字列中に含まれる調理用語を返す */
export function detectTerms(text: string): CookingTerm[] {
  return COOKING_TERMS.filter((t) => text.includes(t.term));
}
