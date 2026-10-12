// 실행: node tests/reading.test.js
const assert = require("assert");
const { DECK, SUITS } = require("../js/cards.js");
global.SUITS = SUITS;
const { POSITIONS, josa, drawSpread, interpret, summarize } = require("../js/reading.js");

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

console.log("OK — 샘플 리딩:");
spread.forEach((s) => console.log(" ", interpret(s).title, "·", interpret(s).cardLabel));
sum.lines.forEach((l) => console.log(" -", l.head + ":", l.body));
