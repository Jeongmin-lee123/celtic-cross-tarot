// 화면 제어: 질문 → 덱 섞고 펼치기 → 사용자가 10장을 직접 골라 배치·공개 → 종합 풀이
(function () {
  // 680×640 기준 좌표. 크로스(1~6) + 오른쪽 스태프(7~10, 아래에서 위로). 카드 비율 3:5
  const BOARD_W = 680, BOARD_H = 640, CARD_W = 90, CARD_H = 150;
  const SLOTS = {
    1: [185, 245], 2: [185, 245], 3: [65, 245], 4: [305, 245], 5: [185, 80], 6: [185, 410],
    7: [545, 485], 8: [545, 330], 9: [545, 175], 10: [545, 20],
  };
  const isNarrow = () => window.matchMedia("(max-width: 900px)").matches;
  const FLY_MS = 560, FLIP_MS = 600;

  const $ = (id) => document.getElementById(id);
  const els = {
    intro: $("intro"), game: $("game"), board: $("board"), fan: $("fan"), prompt: $("prompt"),
    readingList: $("readingList"), summaryBtn: $("summaryBtn"), summary: $("summary"),
    question: $("question"), questionLabel: $("questionLabel"), startBtn: $("startBtn"),
    restartBtn: $("restartBtn"), topics: $("topics"), progress: $("progress"),
    modal: $("modal"), modalCard: $("modalCard"), modalPos: $("modalPos"), modalTitle: $("modalTitle"),
    modalEn: $("modalEn"), modalUp: $("modalUp"), modalRev: $("modalRev"), modalClose: $("modalClose"),
  };

  let deck = [], spread = [], busy = false, topic = "general";

  // 카드 뒷면은 한 번만 만들어 CSS 배경으로 재사용한다 (펼친 78장 + 뒤집기 전 카드)
  document.documentElement.style.setProperty("--card-back", `url("data:image/svg+xml,${encodeURIComponent(ART.back())}")`);

  function buildTopics() {
    els.topics.innerHTML = Object.entries(TOPICS).map(([key, t]) =>
      `<button type="button" class="chip" role="radio" data-topic="${key}" aria-checked="${key === topic}">${t.label}</button>`).join("");
    els.topics.querySelectorAll(".chip").forEach((chip) => chip.addEventListener("click", () => {
      topic = chip.dataset.topic;
      els.topics.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-checked", c === chip));
    }));
  }

  function renderProgress() {
    const index = spread.length;
    els.progress.innerHTML = POSITIONS.map((p, i) =>
      `<li class="${i < index ? "done" : i === index ? "current" : ""}" title="${p.n}. ${p.name}">${p.n}</li>`).join("");
  }

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

  // 섞인 78장을 부채꼴 줄로 펼친다. i번째 카드가 곧 deck[i]
  function buildFan() {
    const rows = isNarrow() ? 3 : 2; // 데스크톱은 2줄(39장씩), 모바일은 3줄(26장씩)
    const perRow = Math.ceil(deck.length / rows);
    els.fan.innerHTML = "";
    for (let r = 0; r < rows; r++) {
      const row = document.createElement("div");
      row.className = "fan-row";
      for (let j = 0; j < perRow; j++) {
        const i = r * perRow + j;
        if (i >= deck.length) break;
        const t = j - (perRow - 1) / 2; // 가운데 기준 위치
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fan-card";
        btn.dataset.i = i;
        btn.setAttribute("aria-label", `펼친 카드 ${i + 1}번째`);
        const curve = 26 / perRow; // 줄이 길수록 완만하게
        btn.style.setProperty("--rot", `${(t * 1.1 * curve).toFixed(2)}deg`);
        btn.style.setProperty("--dy", `${(t * t * 0.18 * curve * curve).toFixed(1)}px`);
        btn.style.setProperty("--delay", `${i * 8}ms`);
        btn.addEventListener("click", () => pick(btn));
        row.appendChild(btn);
      }
      els.fan.appendChild(row);
    }
  }

  function cardFace(card, reversed) {
    return `
      <div class="face back"></div>
      <div class="face front${reversed ? " is-reversed" : ""}">
        ${ART.front(card)}
        ${reversed ? '<span class="rev-badge">역</span>' : ""}
      </div>`;
  }

  function placeCard(item, fromEl) {
    const n = item.position.n;
    const slot = els.board.querySelector(`.slot[data-n="${n}"]`);
    const flyer = document.createElement("div");
    flyer.className = "flyer";
    flyer.innerHTML = `<div class="rot${n === 2 ? " crossed" : ""}"><div class="card">${cardFace(item.card, item.reversed)}</div></div>`;
    slot.appendChild(flyer);
    slot.classList.add("filled");
    flyer.addEventListener("click", () => { focusEntry(n); openModal(item); });

    // 고른 카드 자리에서 슬롯으로 날아오는 연출
    const from = fromEl.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const scale = Math.max(0.2, from.width / to.width);
    flyer.style.transform = `translate(${dx}px, ${dy}px) scale(${scale.toFixed(3)})`;
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
    // 모바일에서는 풀이 목록이 게임판 아래에 있어, 자동 스크롤하면 카드가 놓이는 장면을 놓친다
    focusEntry(item.position.n, !isNarrow());
  }

  function openModal(item) {
    const { card, reversed, position } = item;
    els.modalCard.innerHTML = `<div class="card flipped">${cardFace(card, reversed)}</div>`;
    els.modalPos.textContent = `${position.n}. ${position.name} · ${reversed ? "역방향" : "정방향"}`;
    els.modalTitle.textContent = card.nameKo;
    els.modalEn.textContent = card.nameEn;
    els.modalUp.textContent = `${card.upright} — ${card.uprightText}`;
    els.modalRev.textContent = `${card.reversed} — ${card.reversedText}`;
    els.modalUp.parentElement.classList.toggle("current", !reversed);
    els.modalRev.parentElement.classList.toggle("current", reversed);
    els.modal.hidden = false;
    els.modalClose.focus();
  }

  function closeModal() { els.modal.hidden = true; }

  function focusEntry(n, scroll = true) {
    els.readingList.querySelectorAll(".entry").forEach((e) => e.classList.toggle("active", e.dataset.n === String(n)));
    els.board.querySelectorAll(".slot").forEach((s) => s.classList.toggle("active", s.dataset.n === String(n)));
    const target = els.readingList.querySelector(`.entry[data-n="${n}"]`);
    if (target && scroll) target.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function updatePrompt() {
    renderProgress();
    if (spread.length >= POSITIONS.length) {
      els.prompt.innerHTML = "10장을 모두 골랐습니다. <b>종합 풀이</b>를 확인하세요";
      els.fan.classList.add("done");
      els.summaryBtn.hidden = !els.summary.hidden;
      return;
    }
    const p = POSITIONS[spread.length];
    els.prompt.innerHTML = `마음이 가는 카드를 골라 주세요 · <b>${p.n}번</b> ${p.name} <span class="prompt-left">(남은 카드 ${deck.length - spread.length}장)</span>`;
  }

  async function pick(btn) {
    if (busy || spread.length >= POSITIONS.length || btn.disabled) return;
    busy = true;
    btn.disabled = true;
    const { card, reversed } = deck[btn.dataset.i];
    const item = { position: POSITIONS[spread.length], card, reversed };
    spread.push(item);
    els.fan.classList.add("busy");
    const flight = placeCard(item, btn);
    btn.classList.add("taken");
    await flight;
    addEntry(item);
    updatePrompt();
    els.fan.classList.remove("busy");
    busy = false;
  }

  function showSummary() {
    if (spread.length < POSITIONS.length) return;
    const s = summarize(spread, els.question.value.trim(), topic);
    els.summary.innerHTML = `<h3>종합 풀이</h3>` +
      s.lines.map((l) => `<div class="summary-row"><p class="summary-head">${l.head}</p><p>${l.body}</p></div>`).join("") +
      `<p class="fine">타로는 정답이 아니라 생각을 정리하는 거울입니다. 중요한 결정은 스스로의 판단을 믿으세요.</p>
       <div class="summary-actions">
         <button id="copyBtn" class="btn ghost-dark">결과 복사</button>
         <button id="againBtn" class="btn primary">같은 질문으로 다시 뽑기</button>
       </div>`;
    els.summary.hidden = false;
    els.summaryBtn.hidden = true;
    els.summary.scrollIntoView({ behavior: "smooth", block: "start" });
    $("againBtn").addEventListener("click", startGame);
    $("copyBtn").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      try {
        await navigator.clipboard.writeText(readingToText(spread, s));
        btn.textContent = "복사했어요 ✓";
      } catch {
        btn.textContent = "복사 실패 — 직접 선택해 주세요";
      }
      setTimeout(() => { btn.textContent = "결과 복사"; }, 2000);
    });
  }

  function startGame() {
    deck = prepareDeck(DECK);
    spread = [];
    busy = false;
    buildBoard();
    buildFan();
    els.fan.classList.remove("done", "busy");
    els.readingList.innerHTML = "";
    els.summary.hidden = els.summaryBtn.hidden = true;

    const q = els.question.value.trim();
    const label = TOPICS[topic].label;
    els.questionLabel.hidden = false;
    els.questionLabel.textContent = q ? `${label} · ${q}` : `${label}`;

    els.intro.hidden = true;
    els.game.hidden = false;
    els.restartBtn.hidden = false;
    updatePrompt();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    els.game.hidden = true;
    els.intro.hidden = false;
    els.restartBtn.hidden = true;
    els.question.focus();
  }

  buildTopics();
  els.modalClose.addEventListener("click", closeModal);
  els.modal.addEventListener("click", (e) => { if (e.target === els.modal) closeModal(); });
  els.startBtn.addEventListener("click", startGame);
  els.summaryBtn.addEventListener("click", showSummary);
  els.restartBtn.addEventListener("click", restart);
  els.question.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); startGame(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.modal.hidden) closeModal();
  });
})();
