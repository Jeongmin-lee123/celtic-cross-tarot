// 켈틱 크로스 표준(현대 라이더-웨이트 계열) 포지션과 풀이 생성 로직.
// 크로스(1~6)는 상황 자체를, 스태프(7~10)는 상황을 둘러싼 나와 주변을 본다.
const POSITIONS = [
  { n: 1, name: "현재 상황", group: "크로스", desc: "지금 질문의 중심에 놓인 상황",
    up: "현재의 흐름을 그대로 살리면 됩니다.", rev: "지금 상황에 막힌 부분이 있어 점검이 필요합니다." },
  { n: 2, name: "도전·장애", group: "크로스", desc: "현재를 가로지르는 과제 또는 방해 요인",
    up: "이 과제는 성장의 계기가 될 수 있습니다.", rev: "장애가 크게 느껴지지만 하나씩 풀 수 있는 문제입니다." },
  { n: 3, name: "과거·근원", group: "크로스", desc: "지금 상황을 만든 과거의 뿌리",
    up: "과거의 경험이 지금을 받쳐 주는 토대가 됩니다.", rev: "정리되지 않은 과거가 아직 영향을 주고 있습니다." },
  { n: 4, name: "가까운 미래", group: "크로스", desc: "앞으로 몇 주~몇 달 사이 다가올 흐름",
    up: "곧 다가올 흐름은 순조로운 편입니다.", rev: "곧 다가올 일에 미리 대비해 두는 것이 좋습니다." },
  { n: 5, name: "의식·목표", group: "크로스", desc: "당신이 바라고 의식하고 있는 것",
    up: "목표가 분명하고 현실적입니다.", rev: "바라는 것이 모호하거나 스스로 확신이 부족합니다." },
  { n: 6, name: "무의식·내면", group: "크로스", desc: "드러나지 않은 속마음과 숨은 동기",
    up: "속마음이 당신을 건강하게 지지하고 있습니다.", rev: "인정하지 않은 감정이나 두려움이 숨어 있습니다." },
  { n: 7, name: "나의 태도", group: "스태프", desc: "이 문제를 대하는 당신의 자세와 조언",
    up: "지금의 자세를 유지하는 것이 도움이 됩니다.", rev: "태도를 조금 바꾸면 상황이 달라질 수 있습니다." },
  { n: 8, name: "주변 환경", group: "스태프", desc: "주위 사람과 환경이 미치는 영향",
    up: "주위 사람과 환경이 당신을 돕는 쪽으로 작용합니다.", rev: "주변의 기대나 간섭이 부담이 될 수 있습니다." },
  { n: 9, name: "희망과 두려움", group: "스태프", desc: "가장 바라는 것이자 가장 걱정하는 것",
    up: "희망 쪽에 무게가 실려 있습니다.", rev: "걱정이 실제보다 크게 부풀어 있을 수 있습니다." },
  { n: 10, name: "최종 결과", group: "스태프", desc: "지금 흐름이 이어질 때의 결과",
    up: "지금 방향대로라면 긍정적인 결말이 기대됩니다.", rev: "지금 방향 그대로라면 아쉬움이 남을 수 있으니 조정이 필요합니다." },
];

// 질문 주제. suit는 그 주제와 가장 가까운 수트
const TOPICS = {
  general: { label: "전체 운", suit: null },
  love: { label: "연애·관계", suit: "cups" },
  work: { label: "일·진로", suit: "wands" },
  money: { label: "금전", suit: "pentacles" },
};

// 한글 받침에 맞는 조사 선택 (이/가, 은/는, 을/를, 과/와)
function josa(word, pair) {
  const [withBatchim, without] = pair.split("/");
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    return word + ((code - 0xac00) % 28 ? withBatchim : without);
  }
  // 숫자·영문으로 끝나는 경우: 받침이 있는 것으로 읽히는 숫자만 처리
  return word + ("013678".includes(last) ? withBatchim : without);
}

function randomInt(max) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function shuffle(deck) {
  const a = deck.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 사용자가 펼쳐진 카드에서 직접 고르도록, 섞은 순서와 카드별 정·역방향을 미리 정해 둔다
function prepareDeck(deck) {
  return shuffle(deck).map((card) => ({ card, reversed: randomInt(2) === 1 }));
}

// 섞은 덱의 위에서부터 10장을 순서대로 뽑는다. 각 카드는 50% 확률로 역방향.
function drawSpread(deck) {
  return shuffle(deck).slice(0, POSITIONS.length).map((card, i) => ({
    position: POSITIONS[i],
    card,
    reversed: randomInt(2) === 1,
  }));
}

function interpret({ position, card, reversed }) {
  const orient = reversed ? "역방향" : "정방향";
  return {
    title: `${position.n}. ${position.name}`,
    cardLabel: `${card.nameKo} (${orient})`,
    keywords: reversed ? card.reversed : card.upright,
    text: `'${position.name}' 자리에 ${josa(card.nameKo, "이/가")} 놓였습니다. ` +
      `${reversed ? card.reversedText : card.uprightText} ` +
      `${reversed ? position.rev : position.up}`,
  };
}

function summarize(spread, question, topicKey = "general") {
  const at = (n) => spread[n - 1];
  const name = (n) => at(n).card.nameKo;
  const upCount = spread.filter((s) => !s.reversed).length;
  const majors = spread.filter((s) => s.card.arcana === "major").length;

  const suitCounts = {};
  spread.forEach((s) => { if (s.card.suit) suitCounts[s.card.suit] = (suitCounts[s.card.suit] || 0) + 1; });
  const topSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0];

  const lines = [];
  lines.push({
    head: "전체 기운",
    body: upCount >= 7 ? `정방향 카드가 ${upCount}장으로, 전반적으로 순조로운 흐름입니다.`
      : upCount >= 4 ? `정방향 ${upCount}장, 역방향 ${10 - upCount}장으로 기회와 과제가 섞여 있습니다.`
      : `역방향 카드가 ${10 - upCount}장으로 많습니다. 서두르기보다 정리하고 기다릴 때입니다.`,
  });
  lines.push({
    head: "핵심 구도",
    body: `${josa(name(1), "이/가")} 현재의 중심이고, ${josa(name(2), "이/가")} 그 앞을 가로지릅니다. ` +
      `이 두 카드의 관계가 질문의 본질입니다.`,
  });
  lines.push({
    head: "시간의 흐름",
    body: `과거의 ${name(3)} → 현재의 ${name(1)} → 가까운 미래의 ${name(4)}. ` +
      (at(4).reversed ? "다가올 흐름에 걸림돌이 있으니 미리 대비하세요." : "흐름은 앞으로 열리는 방향입니다."),
  });
  lines.push({
    head: "겉마음과 속마음",
    body: at(5).reversed === at(6).reversed
      ? `의식(${name(5)})과 무의식(${name(6)})이 같은 방향을 보고 있어, 바라는 것과 속마음이 일치합니다.`
      : `의식(${name(5)})과 무의식(${name(6)})이 엇갈립니다. 진짜 원하는 것이 무엇인지 스스로 확인해 보세요.`,
  });
  lines.push({
    head: "카드 구성",
    body: (majors >= 4 ? `메이저 카드가 ${majors}장으로 많아, 개인의 선택을 넘어서는 큰 흐름이 작용하고 있습니다. `
      : majors <= 1 ? `메이저 카드가 ${majors}장뿐이라, 일상의 선택으로 충분히 바꿀 수 있는 문제입니다. `
      : `메이저 카드 ${majors}장, 마이너 카드 ${10 - majors}장입니다. `) +
      (topSuit && topSuit[1] >= 3 ? `${josa(SUITS[topSuit[0]].ko, "이/가")} ${topSuit[1]}장으로 가장 많아 '${SUITS[topSuit[0]].area}'의 비중이 큽니다.` : ""),
  });
  const topic = TOPICS[topicKey] || TOPICS.general;
  if (topic.suit) {
    const n = suitCounts[topic.suit] || 0;
    const suit = SUITS[topic.suit];
    lines.push({
      head: `주제 · ${topic.label}`,
      body: n >= 3 ? `주제와 맞닿은 ${suit.ko} 카드가 ${n}장입니다. 이 문제가 지금 마음의 한가운데에 있습니다.`
        : n >= 1 ? `주제와 맞닿은 ${suit.ko} 카드가 ${n}장 나왔습니다. ` +
          spread.filter((s) => s.card.suit === topic.suit).map((s) => `${s.position.n}번(${s.position.name})`).join(", ") +
          " 자리를 특히 눈여겨보세요."
        : `주제와 직접 맞닿은 ${suit.ko} 카드가 없습니다.` +
          (topSuit ? ` 오히려 '${SUITS[topSuit[0]].area}' 쪽에서 실마리를 찾아보세요.` : ""),
    });
  }
  lines.push({
    head: "결론과 조언",
    body: `최종 결과는 ${josa(name(10), "이/가")} ${at(10).reversed ? "역방향" : "정방향"}으로 나왔습니다. ` +
      `${at(10).reversed ? at(10).card.reversedText : at(10).card.uprightText} ` +
      `태도 카드인 ${josa(name(7), "이/가")} 조언합니다: '${(at(7).reversed ? at(7).card.reversed : at(7).card.upright).split(", ")[0]}'에 주목하세요.`,
  });

  return { question: question || "", topic: topic.label, lines };
}

// 클립보드 복사용 텍스트
function readingToText(spread, summary) {
  const out = ["[켈틱 크로스 타로]"];
  if (summary.question) out.push(`질문: ${summary.question}`);
  out.push(`주제: ${summary.topic}`, "");
  spread.forEach((s) => {
    const r = interpret(s);
    out.push(`${r.title} — ${r.cardLabel}`, `  ${r.text}`);
  });
  out.push("", "[종합 풀이]");
  summary.lines.forEach((l) => out.push(`- ${l.head}: ${l.body}`));
  return out.join("\n");
}

if (typeof module !== "undefined") {
  module.exports = { POSITIONS, TOPICS, josa, shuffle, prepareDeck, drawSpread, interpret, summarize, readingToText };
}
