// 화면 제어: 질문 → 덱 섞기 → 10장을 순서대로 뽑아 배치·공개 → 종합 풀이
(function () {
  // 680×640 기준 좌표. 크로스(1~6) + 오른쪽 스태프(7~10, 아래에서 위로)
  const BOARD_W = 680, BOARD_H = 640, CARD_W = 96, CARD_H = 150;
  const SLOTS = {
    1: [182, 245], 2: [182, 245], 3: [60, 245], 4: [304, 245], 5: [182, 80], 6: [182, 410],
    7: [540, 485], 8: [540, 330], 9: [540, 175], 10: [540, 20],
  };
  const FLY_MS = 520, FLIP_MS = 600, AUTO_GAP_MS = 350;

  const $ = (id) => document.getElementById(id);
  const els = {
    intro: $("intro"), game: $("game"), board: $("board"), deck: $("deck"),
    deckCount: $("deckCount"), prompt: $("prompt"), drawBtn: $("drawBtn"), autoBtn: $("autoBtn"),
    readingList: $("readingList"), summaryBtn: $("summaryBtn"), summary: $("summary"),
    question: $("question"), questionLabel: $("questionLabel"), startBtn: $("startBtn"),
    restartBtn: $("restartBtn"),
  };

  let spread = [], index = 0, busy = false, autoRun = false;

  const pct = (v, total) => `${(v / total) * 100}%`;

  function buildBoard() {
    els.board.innerHTML = "";
    POSITIONS.forEach((p) => {
      const [x, y] = SLOTS[p.n];
      const slot = document.createElement("div");
      slot.className = "slot" + (p.n === 2 ? " slot-cross" : "");
      slot.dataset.n = p.n;
      Object.assign(slot.style, {
        left: pct(x, BOARD_W), top: pct(y, BOARD_H),
        width: pct(CARD_W, BOARD_W), height: pct(CARD_H, BOARD_H),
      });
      if (p.n !== 2) {
        slot.innerHTML = `<span class="slot-num">${p.n}</span><span class="slot-name">${p.name}</span>`;
      }
      els.board.appendChild(slot);
    });
  }

  function cardFace(card, reversed) {
    const suit = card.suit ? SUITS[card.suit] : null;
    const symbol = suit ? suit.symbol : "✦";
    const cls = card.suit || "major";
    return `
      <div class="face back"></div>
      <div class="face front ${cls}">
        <div class="front-inner${reversed ? " is-reversed" : ""}">
          <span class="num">${card.numeral}</span>
          <span class="sym">${symbol}</span>
          <span class="nm">${card.nameKo}</span>
          <span class="en">${card.nameEn}</span>
        </div>
        ${reversed ? '<span class="rev-badge">역</span>' : ""}
      </div>`;
  }

  function placeCard(item) {
    const n = item.position.n;
    const slot = els.board.querySelector(`.slot[data-n="${n}"]`);
    const flyer = document.createElement("div");
    flyer.className = "flyer";
    flyer.innerHTML = `<div class="rot${n === 2 ? " crossed" : ""}"><div class="card">${cardFace(item.card, item.reversed)}</div></div>`;
    slot.appendChild(flyer);
    slot.classList.add("filled");
    flyer.addEventListener("click", () => focusEntry(n));

    // 덱 위치에서 슬롯으로 날아오는 연출
    const from = els.deck.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    flyer.style.transform = `translate(${dx}px, ${dy}px) scale(0.9)`;
    flyer.getBoundingClientRect(); // 리플로우로 시작 위치 확정
    flyer.style.transition = `transform ${FLY_MS}ms cubic-bezier(.2,.8,.2,1)`;
    flyer.style.transform = "";

    return new Promise((resolve) => {
      setTimeout(() => {
        flyer.querySelector(".card").classList.add("flipped");
        setTimeout(resolve, FLIP_MS);
      }, FLY_MS);
    });
  }

  function addEntry(item) {
    const r = interpret(item);
    const li = document.createElement("li");
    li.className = "entry";
    li.dataset.n = item.position.n;
    li.innerHTML = `
      <div class="entry-head">
        <span class="entry-pos">${r.title}</span>
        <span class="entry-group">${item.position.group}</span>
      </div>
      <p class="entry-desc">${item.position.desc}</p>
      <p class="entry-card">${r.cardLabel}</p>
      <p class="entry-kw">${r.keywords.split(", ").map((k) => `<span>${k}</span>`).join("")}</p>
      <p class="entry-text">${r.text}</p>`;
    els.readingList.appendChild(li);
    focusEntry(item.position.n);
  }

  function focusEntry(n) {
    els.readingList.querySelectorAll(".entry").forEach((e) => e.classList.toggle("active", e.dataset.n === String(n)));
    els.board.querySelectorAll(".slot").forEach((s) => s.classList.toggle("active", s.dataset.n === String(n)));
    const target = els.readingList.querySelector(`.entry[data-n="${n}"]`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function updatePrompt() {
    els.deckCount.textContent = DECK.length - index;
    if (index >= POSITIONS.length) {
      els.prompt.innerHTML = "10장을 모두 뽑았습니다. <b>종합 풀이</b>를 확인하세요";
      els.drawBtn.hidden = els.autoBtn.hidden = true;
      els.deck.disabled = true;
      els.summaryBtn.hidden = false;
      return;
    }
    const p = POSITIONS[index];
    els.prompt.innerHTML = `덱을 눌러 <b>${p.n}번 카드</b> · ${josa(p.name, "을/를")} 뽑으세요`;
  }

  async function drawNext() {
    if (busy || index >= spread.length) return;
    busy = true;
    const item = spread[index];
    await placeCard(item);
    addEntry(item);
    index++;
    updatePrompt();
    busy = false;
  }

  async function drawAll() {
    if (autoRun) return;
    autoRun = true;
    els.autoBtn.disabled = els.drawBtn.disabled = true;
    while (index < spread.length) {
      await drawNext();
      await new Promise((r) => setTimeout(r, AUTO_GAP_MS));
    }
    autoRun = false;
  }

  function showSummary() {
    const s = summarize(spread, els.question.value.trim());
    els.summary.innerHTML = `<h3>종합 풀이</h3>` +
      s.lines.map((l) => `<div class="summary-row"><p class="summary-head">${l.head}</p><p>${l.body}</p></div>`).join("") +
      `<p class="fine">타로는 정답이 아니라 생각을 정리하는 거울입니다. 중요한 결정은 스스로의 판단을 믿으세요.</p>
       <button id="againBtn" class="btn primary wide">같은 질문으로 다시 뽑기</button>`;
    els.summary.hidden = false;
    els.summaryBtn.hidden = true;
    els.summary.scrollIntoView({ behavior: "smooth", block: "start" });
    $("againBtn").addEventListener("click", startGame);
  }

  function startGame() {
    spread = drawSpread(DECK);
    index = 0;
    busy = autoRun = false;
    buildBoard();
    els.readingList.innerHTML = "";
    els.summary.hidden = els.summaryBtn.hidden = true;
    els.drawBtn.hidden = els.autoBtn.hidden = false;
    els.drawBtn.disabled = els.autoBtn.disabled = els.deck.disabled = false;

    const q = els.question.value.trim();
    els.questionLabel.hidden = !q;
    els.questionLabel.textContent = q ? `질문 · ${q}` : "";

    els.intro.hidden = true;
    els.game.hidden = false;
    els.restartBtn.hidden = false;
    els.deck.classList.remove("shuffling");
    void els.deck.offsetWidth;
    els.deck.classList.add("shuffling");
    updatePrompt();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    els.game.hidden = true;
    els.intro.hidden = false;
    els.restartBtn.hidden = true;
    els.question.focus();
  }

  els.startBtn.addEventListener("click", startGame);
  els.deck.addEventListener("click", drawNext);
  els.drawBtn.addEventListener("click", drawNext);
  els.autoBtn.addEventListener("click", drawAll);
  els.summaryBtn.addEventListener("click", showSummary);
  els.restartBtn.addEventListener("click", restart);
  els.question.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); startGame(); }
  });
  document.addEventListener("keydown", (e) => {
    if (els.game.hidden || e.target === els.question) return;
    if (e.code === "Space") { e.preventDefault(); drawNext(); }
  });
})();
