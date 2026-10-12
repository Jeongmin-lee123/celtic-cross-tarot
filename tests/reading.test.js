// 실행: node tests/reading.test.js
const assert = require("assert");
const { DECK, SUITS } = require("../js/cards.js");
global.SUITS = SUITS;
const { POSITIONS, TOPICS, josa, prepareDeck, drawSpread, interpret, summarize, readingToText } = require("../js/reading.js");
const { ART } = require("../js/art.js");

assert.strictEqual(DECK.length, 78, "덱은 78장");
assert.strictEqual(new Set(DECK.map((c) => c.id)).size, 78, "카드 id 중복 없음");
assert.strictEqual(DECK.filter((c) => c.arcana === "major").length, 22, "메이저 22장");
DECK.forEach((c) => assert.ok(c.upright && c.reversed && c.uprightText && c.reversedText, c.id));

assert.strictEqual(POSITIONS.length, 10);
assert.strictEqual(josa("달", "이/가"), "달이");
assert.strictEqual(josa("바보", "이/가"), "바보가");
assert.strictEqual(josa("컵", "이/가"), "컵이");
assert.strictEqual(josa("완드 3", "이/가"), "완드 3이");
assert.strictEqual(josa("완드 2", "이/가"), "완드 2가");

for (let i = 0; i < 1000; i++) {
  const spread = drawSpread(DECK);
  assert.strictEqual(spread.length, 10);
  assert.strictEqual(new Set(spread.map((s) => s.card.id)).size, 10, "한 번의 드로우에 중복 카드 없음");
  spread.forEach((s, j) => assert.strictEqual(s.position.n, j + 1, "포지션 순서"));
}

const spread = drawSpread(DECK);
spread.forEach((s) => {
  const r = interpret(s);
  assert.ok(r.text.includes(s.card.nameKo));
});
const sum = summarize(spread, "테스트 질문");
assert.strictEqual(sum.lines.length, 6);
sum.lines.forEach((l) => assert.ok(!/undefined|NaN/.test(l.body), l.body));

for (const key of Object.keys(TOPICS)) {
  for (let i = 0; i < 200; i++) {
    const sp = drawSpread(DECK);
    const sm = summarize(sp, "", key);
    assert.strictEqual(sm.lines.length, key === "general" ? 6 : 7, `주제 ${key}`);
    sm.lines.forEach((l) => assert.ok(!/undefined|NaN/.test(l.body), l.body));
    const text = readingToText(sp, sm);
    assert.ok(text.includes("10. 최종 결과") && text.includes(TOPICS[key].label));
  }
}

// 사용자가 고르는 덱: 78장 전부, 중복 없이, 방향이 정해져 있어야 한다
const prepared = prepareDeck(DECK);
assert.strictEqual(prepared.length, 78);
assert.strictEqual(new Set(prepared.map((d) => d.card.id)).size, 78);
assert.ok(prepared.every((d) => typeof d.reversed === "boolean"));

// 카드 아트: 78장 앞면 + 뒷면이 숫자 오류 없이 생성되고, 이름이 들어간다
DECK.forEach((c) => {
  const svg = ART.front(c);
  assert.ok(svg.startsWith("<svg") && svg.trim().endsWith("</svg>"), c.id);
  assert.ok(!/NaN|undefined/.test(svg), `${c.id} 좌표 오류`);
  assert.ok(svg.includes(c.nameKo), `${c.id} 이름`);
});
assert.ok(!/NaN|undefined/.test(ART.back()));

// AI 그림 모드: 그림이 있는 카드만 <image>를 쓰고, 나머지는 SVG 그림으로 대체
ART.useImages(["major-0", "back"]);
assert.ok(ART.front(DECK[0]).includes('href="images/cards/major-0.webp"'), "그림 있는 카드");
assert.ok(ART.front(DECK[0]).includes(DECK[0].nameKo), "그림 카드에도 이름");
assert.ok(!ART.front(DECK[1]).includes("<image"), "그림 없는 카드는 SVG");
assert.ok(ART.back().includes("back.webp"));
ART.useImages([]);

console.log("OK — 샘플 리딩:");
spread.forEach((s) => console.log(" ", interpret(s).title, "·", interpret(s).cardLabel));
sum.lines.forEach((l) => console.log(" -", l.head + ":", l.body));
