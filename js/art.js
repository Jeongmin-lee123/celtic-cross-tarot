// 카드 앞면·뒷면 SVG 아트. 모든 그림은 이 파일의 도형 조합으로 직접 그린다.
// 캔버스 300×500 (표준 타로 70×120mm 비율에 가까움): 위 번호, 가운데 그림, 아래 이름 배너.
const ART = (() => {
  const INK = "#1e2438", GOLD = "#c9a24a", GOLD_D = "#8a6a1f", PARCH = "#f6efdd", WHITE = "#fbf8f0";
  const SKIN = "#f1d9bd", ROBE = "#5b6fa8", ROBE2 = "#b5452f", ROBE3 = "#e8e0c8", GREEN = "#5e7d3a";
  const SW = 2.4; // 기본 선 굵기

  const SUIT_COLOR = { wands: "#c0562f", cups: "#3b6ea8", swords: "#56637a", pentacles: "#b08a2e" };
  const SKY = {
    day: ["#f7e7b8", "#e9c97d"], dawn: ["#f5d3b0", "#c9a2c8"], night: ["#2a3556", "#141b2e"],
    dusk: ["#e8b98a", "#7a5c8e"], pale: ["#eef0f2", "#d6dde6"], red: ["#f2c08a", "#c0562f"],
  };

  // ── 기본 도형 ──────────────────────────────────────────────
  const g = (inner, t = "") => `<g${t ? ` transform="${t}"` : ""}>${inner}</g>`;
  const line = (x1, y1, x2, y2, c = INK, w = SW) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const circle = (x, y, r, fill = "none", stroke = INK, w = SW) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
  const path = (d, fill = "none", stroke = INK, w = SW) =>
    `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const rect = (x, y, w, h, fill = "none", stroke = INK, sw = SW, rx = 0) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

  function starPath(x, y, r, n = 5, inner = 0.45, rot = -90) {
    let d = "";
    for (let i = 0; i < n * 2; i++) {
      const rr = i % 2 ? r * inner : r;
      const a = ((rot + (i * 180) / n) * Math.PI) / 180;
      d += `${i ? "L" : "M"}${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
    }
    return d + "Z";
  }
  const star = (x, y, r, fill = GOLD, n = 5, stroke = GOLD_D) => path(starPath(x, y, r, n), fill, stroke, 1.4);

  function sun(x, y, r, face = false) {
    let rays = "";
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8, r2 = i % 2 ? r * 1.45 : r * 1.7;
      rays += line(x + r * 1.08 * Math.cos(a), y + r * 1.08 * Math.sin(a), x + r2 * Math.cos(a), y + r2 * Math.sin(a), GOLD_D, 2.2);
    }
    const f = face ? circle(x - r * 0.33, y - r * 0.15, r * 0.08, INK, INK, 1) + circle(x + r * 0.33, y - r * 0.15, r * 0.08, INK, INK, 1) +
      path(`M${x - r * 0.35},${y + r * 0.3} Q${x},${y + r * 0.55} ${x + r * 0.35},${y + r * 0.3}`, "none", INK, 1.8) : "";
    return rays + circle(x, y, r, "#f3c74f", GOLD_D, 2.2) + f;
  }
  const crescent = (x, y, r, fill = "#f3e6b0", dir = 1) =>
    path(`M${x},${y - r} A${r},${r} 0 1,${dir > 0 ? 0 : 1} ${x},${y + r} A${r * 0.75},${r} 0 1,${dir > 0 ? 1 : 0} ${x},${y - r}Z`, fill, GOLD_D, 1.8);
  const mountains = (y, color = "#9aa6b8") =>
    path(`M20,${y} L70,${y - 70} L110,${y - 30} L160,${y - 95} L215,${y - 25} L250,${y - 60} L280,${y} Z`, color, INK, 2);
  const ground = (y, color = "#c8d4a8") => rect(20, y, 260, 400 - y, color, "none", 0);
  function waves(y, color = "#7ea6c9") {
    let d = `M20,${y}`;
    for (let x = 20; x < 280; x += 26) d += ` q13,-9 26,0`;
    return path(`${d} L280,400 L20,400 Z`, color, INK, 1.8);
  }
  const cloud = (x, y, s = 1) =>
    path(`M${x - 30 * s},${y} a${12 * s},${12 * s} 0 0,1 ${16 * s},-${14 * s} a${16 * s},${16 * s} 0 0,1 ${28 * s},-${4 * s} a${14 * s},${14 * s} 0 0,1 ${16 * s},${18 * s} Z`, WHITE, INK, 1.8);
  const lemniscate = (x, y, s = 1) =>
    path(`M${x},${y} c${-8 * s},${-10 * s} ${-22 * s},${-10 * s} ${-22 * s},0 c0,${10 * s} ${14 * s},${10 * s} ${22 * s},0 c${8 * s},${-10 * s} ${22 * s},${-10 * s} ${22 * s},0 c0,${10 * s} ${-14 * s},${10 * s} ${-22 * s},0Z`, "none", GOLD_D, 2.4);
  function pillar(x, top, bottom, fill) {
    return rect(x - 13, top + 10, 26, bottom - top - 20, fill, INK, 2) + rect(x - 18, top, 36, 12, fill, INK, 2) + rect(x - 18, bottom - 12, 36, 12, fill, INK, 2);
  }
  function crown(x, y, s = 1, fill = GOLD) {
    return path(`M${x - 14 * s},${y} L${x - 14 * s},${y - 12 * s} L${x - 7 * s},${y - 5 * s} L${x},${y - 15 * s} L${x + 7 * s},${y - 5 * s} L${x + 14 * s},${y - 12 * s} L${x + 14 * s},${y} Z`, fill, GOLD_D, 1.6);
  }

  // 사람: (x,y)=머리 중심. arms: down|up|out|left-up|right-up|forward
  function figure(x, y, s = 1, o = {}) {
    const robe = o.robe || ROBE, h = (o.height || 92) * s, w = (o.width || 30) * s;
    const sh = y + 15 * s;
    let out = "";
    if (o.halo) out += circle(x, y, 20 * s, "#f8e7a8", GOLD_D, 1.4);
    out += path(`M${x - 9 * s},${sh} L${x - w},${y + h} L${x + w},${y + h} L${x + 9 * s},${sh} Z`, robe, INK, 2);
    if (o.belt) out += line(x - 13 * s, y + 45 * s, x + 13 * s, y + 45 * s, GOLD, 3 * s);
    const arm = (side, kind) => {
      const sx = x + side * 9 * s, sy = sh + 4 * s;
      const ends = {
        down: [sx + side * 12 * s, sy + 38 * s], up: [sx + side * 10 * s, sy - 34 * s],
        out: [sx + side * 34 * s, sy + 6 * s], forward: [sx + side * 20 * s, sy + 26 * s],
      };
      const [ex, ey] = ends[kind];
      return line(sx, sy, ex, ey, robe, 7 * s) + circle(ex, ey, 3.6 * s, SKIN, INK, 1.2);
    };
    const arms = o.arms || "down";
    const left = arms === "left-up" ? "up" : arms === "right-up" ? "down" : arms;
    const right = arms === "right-up" ? "up" : arms === "left-up" ? "down" : arms;
    out += arm(-1, left) + arm(1, right);
    if (o.hood) out += path(`M${x - 15 * s},${y + 14 * s} Q${x},${y - 30 * s} ${x + 15 * s},${y + 14 * s} Z`, robe, INK, 2);
    out += circle(x, y, 11 * s, SKIN, INK, 2);
    if (o.crown) out += crown(x, y - 9 * s, 0.8 * s);
    if (o.tiara) out += path(`M${x - 9 * s},${y - 9 * s} L${x},${y - 32 * s} L${x + 9 * s},${y - 9 * s} Z`, GOLD, GOLD_D, 1.6);
    if (o.horns) out += path(`M${x - 8 * s},${y - 8 * s} q-8,-14 -2,-22 M${x + 8 * s},${y - 8 * s} q8,-14 2,-22`, "none", INK, 2.6 * s);
    if (o.skull) out += circle(x - 4 * s, y - 1 * s, 2.4 * s, INK, INK, 1) + circle(x + 4 * s, y - 1 * s, 2.4 * s, INK, INK, 1);
    return out;
  }
  // 손 위치(위 figure와 같은 계산)
  const hand = (x, y, s, side, kind) => {
    const sx = x + side * 9 * s, sy = y + 19 * s;
    return { down: [sx + side * 12 * s, sy + 38 * s], up: [sx + side * 10 * s, sy - 34 * s],
      out: [sx + side * 34 * s, sy + 6 * s], forward: [sx + side * 20 * s, sy + 26 * s] }[kind];
  };

  const wings = (x, y, s = 1, fill = "#e9b7a3") =>
    path(`M${x},${y} C${x - 40 * s},${y - 50 * s} ${x - 90 * s},${y - 20 * s} ${x - 85 * s},${y + 40 * s} C${x - 60 * s},${y + 20 * s} ${x - 30 * s},${y + 25 * s} ${x},${y + 10 * s} Z`, fill, INK, 2) +
    path(`M${x},${y} C${x + 40 * s},${y - 50 * s} ${x + 90 * s},${y - 20 * s} ${x + 85 * s},${y + 40 * s} C${x + 60 * s},${y + 20 * s} ${x + 30 * s},${y + 25 * s} ${x},${y + 10 * s} Z`, fill, INK, 2);
  function lion(x, y, s = 1) {
    let mane = "";
    for (let i = 0; i < 14; i++) {
      const a = (i * Math.PI * 2) / 14;
      mane += line(x + 14 * s * Math.cos(a), y + 14 * s * Math.sin(a), x + 24 * s * Math.cos(a), y + 24 * s * Math.sin(a), "#b0702a", 5 * s);
    }
    return path(`M${x + 10 * s},${y} Q${x + 70 * s},${y - 12 * s} ${x + 90 * s},${y + 20 * s} L${x + 88 * s},${y + 48 * s} L${x + 20 * s},${y + 48 * s} Z`, "#e0a84f", INK, 2) +
      mane + circle(x, y, 15 * s, "#e9b860", INK, 2) + circle(x - 5 * s, y - 3 * s, 1.8 * s, INK, INK, 1) + circle(x + 5 * s, y - 3 * s, 1.8 * s, INK, INK, 1);
  }
  const dog = (x, y, s = 1, fill = WHITE) =>
    path(`M${x},${y} q${20 * s},${-6 * s} ${36 * s},0 l${4 * s},${16 * s} M${x},${y} l${-2 * s},${16 * s}`, "none", INK, 2.4) +
    path(`M${x - 4 * s},${y + 2 * s} Q${x + 18 * s},${y - 10 * s} ${x + 40 * s},${y + 2 * s} L${x + 38 * s},${y + 8 * s} L${x - 2 * s},${y + 8 * s} Z`, fill, INK, 2) +
    circle(x + 44 * s, y - 4 * s, 8 * s, fill, INK, 2) + path(`M${x + 40 * s},${y - 10 * s} l${-3 * s},${-9 * s} l${7 * s},${5 * s}`, fill, INK, 1.6);
  function tower(x, top, bottom, w = 50, fill = "#b8b0a0") {
    return rect(x - w / 2, top, w, bottom - top, fill, INK, 2) +
      path(`M${x - w / 2 - 4},${top} h${w + 8} v-12 h-10 v6 h-10 v-6 h-${w - 32} v6 h-10 v-6 h-10 Z`, fill, INK, 2) +
      rect(x - 6, top + 30, 12, 20, INK, INK, 1, 6);
  }
  const lightning = (x, y, s = 1) =>
    path(`M${x},${y} l${-18 * s},${40 * s} l${14 * s},0 l${-16 * s},${44 * s} l${36 * s},${-56 * s} l${-15 * s},0 l${14 * s},${-28 * s} Z`, "#f3c74f", GOLD_D, 1.8);
  const drops = (pts, color = GOLD) => pts.map(([x, y]) => path(`M${x},${y} q-5,8 0,11 q5,-3 0,-11Z`, color, GOLD_D, 1)).join("");
  function wheel(x, y, r) {
    let spokes = "";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      spokes += line(x + r * 0.28 * Math.cos(a), y + r * 0.28 * Math.sin(a), x + r * 0.92 * Math.cos(a), y + r * 0.92 * Math.sin(a), GOLD_D, 2.4);
    }
    return circle(x, y, r, "#e9c97d", INK, 2.6) + circle(x, y, r * 0.92, "none", GOLD_D, 1.4) + spokes +
      circle(x, y, r * 0.28, "#f3e6b0", INK, 2) + circle(x, y, r * 0.08, INK, INK, 1);
  }
  function scales(x, y, s = 1) {
    return line(x, y, x, y + 30 * s, GOLD_D, 2.4) + line(x - 30 * s, y, x + 30 * s, y, GOLD_D, 2.4) +
      line(x - 30 * s, y, x - 38 * s, y + 22 * s, GOLD_D, 1.2) + line(x - 30 * s, y, x - 22 * s, y + 22 * s, GOLD_D, 1.2) +
      line(x + 30 * s, y, x + 22 * s, y + 22 * s, GOLD_D, 1.2) + line(x + 30 * s, y, x + 38 * s, y + 22 * s, GOLD_D, 1.2) +
      path(`M${x - 40 * s},${y + 22 * s} q10,10 20,0Z M${x + 20 * s},${y + 22 * s} q10,10 20,0Z`, GOLD, GOLD_D, 1.6);
  }
  function flower(x, y, s = 1, color = "#e07a6a") {
    let p = "";
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      p += circle(x + 6 * s * Math.cos(a), y + 6 * s * Math.sin(a), 5 * s, color, INK, 1.2);
    }
    return p + circle(x, y, 3.5 * s, "#f3c74f", INK, 1);
  }
  const tree = (x, y, s = 1, fill = GREEN) =>
    rect(x - 4 * s, y, 8 * s, 50 * s, "#7a5a3a", INK, 1.6) + circle(x, y - 6 * s, 26 * s, fill, INK, 2);

  // ── 수트 상징 ──────────────────────────────────────────────
  function wand(x, y, s = 1, rot = 0) {
    return g(rect(-5, -60, 10, 120, "#c99a63", INK, 2, 5) +
      path("M5,-30 q14,-6 16,-18 q-14,2 -16,14Z M-5,10 q-14,-6 -16,-18 q14,2 16,14Z M5,40 q12,-4 14,-14 q-12,2 -14,10Z", GREEN, INK, 1.4),
    `translate(${x},${y}) rotate(${rot}) scale(${s})`);
  }
  function cup(x, y, s = 1) {
    return g(path("M-30,-40 L30,-40 Q30,5 0,12 Q-30,5 -30,-40Z", "#e9c97d", INK, 2.2) +
      rect(-4, 12, 8, 26, "#d9b462", INK, 2) + path("M-22,46 Q0,34 22,46 L22,50 L-22,50Z", "#d9b462", INK, 2) +
      line(-24, -30, 24, -30, GOLD_D, 1.4), `translate(${x},${y}) scale(${s})`);
  }
  function sword(x, y, s = 1, rot = 0) {
    return g(path("M-6,-30 L0,-80 L6,-30 Z", "#e4e8ee", INK, 2) + rect(-6, -30, 12, 50, "#e4e8ee", INK, 2) +
      line(0, -70, 0, 14, "#a7b0bd", 1.4) + rect(-26, 20, 52, 9, GOLD, INK, 2, 4) +
      rect(-4.5, 29, 9, 28, "#7a5a3a", INK, 2, 3) + circle(0, 62, 6, GOLD, INK, 2),
    `translate(${x},${y}) rotate(${rot}) scale(${s})`);
  }
  function pentacle(x, y, s = 1) {
    return g(circle(0, 0, 38, "#e9c97d", INK, 2.4) + circle(0, 0, 31, "none", GOLD_D, 1.4) +
      path(starPath(0, 0, 28, 5, 0.38), "none", INK, 2.2), `translate(${x},${y}) scale(${s})`);
  }
  const SUIT_ICON = {
    wands: (x, y, s) => wand(x, y, s * 0.9, 20),
    cups: (x, y, s) => cup(x, y, s * 0.8),
    swords: (x, y, s) => sword(x, y, s * 0.7, 0),
    pentacles: (x, y, s) => pentacle(x, y, s * 0.85),
  };

  // ── 메이저 아르카나 장면 ───────────────────────────────────
  const MAJOR_SCENES = {
    0: { sky: "day", art: () => sun(225, 105, 24) + mountains(330, "#b9c3cf") +
      path("M20,400 L20,330 L190,330 L210,400 Z", "#c8d4a8", INK, 2) +
      figure(120, 210, 1, { robe: "#e2a25a", arms: "out" }) +
      line(83, 236, 60, 180, "#7a5a3a", 3) + circle(56, 172, 13, "#b5452f", INK, 2) +
      flower(159, 236, 1, WHITE) + dog(150, 312, 0.8) },
    1: { sky: "day", art: () => lemniscate(150, 92, 1.2) +
      figure(150, 140, 1.05, { robe: ROBE2, arms: "right-up", belt: true }) +
      wand(171, 95, 0.45) + rect(60, 300, 180, 18, "#9b7a52", INK, 2) +
      cup(95, 284, 0.4) + sword(150, 286, 0.32, 90) + pentacle(205, 284, 0.42) +
      flower(55, 360, 1) + flower(245, 360, 1) + flower(100, 375, 0.8) + flower(200, 375, 0.8) },
    2: { sky: "night", art: () => pillar(65, 90, 380, INK) + pillar(235, 90, 380, WHITE) +
      text(65, 240, "B", WHITE, 22) + text(235, 240, "J", INK, 22) +
      rect(95, 100, 110, 200, "#7a5c8e", INK, 1.6) + dots(105, 110, 100, 180, "#c0562f") +
      figure(150, 150, 1.05, { robe: "#a9c3df", tiara: true }) + crescent(150, 360, 18, "#f3e6b0") +
      rect(130, 210, 40, 30, WHITE, INK, 1.6, 3) },
    3: { sky: "day", art: () => ground(300, "#d9c27a") + wheat(40, 300) + wheat(240, 300) +
      tree(60, 160, 0.9) + tree(245, 150, 0.8) + arcStars(150, 112, 34, 12) +
      figure(150, 135, 1.1, { robe: "#e8e0c8", width: 38 }) + circle(150, 300, 18, "#f2b8a8", INK, 2) +
      path("M150,318 v14 M143,326 h14", "none", INK, 2.4) },
    4: { sky: "red", art: () => mountains(250, "#b0703a") + rect(80, 150, 140, 210, "#9aa6b8", INK, 2.4) +
      ramHead(92, 165) + ramHead(208, 165) + figure(150, 160, 1.1, { robe: ROBE2, crown: true, arms: "forward" }) +
      ankh(122, 204) + circle(181, 214, 10, GOLD, INK, 2) },
    5: { sky: "pale", art: () => pillar(60, 90, 360, "#9aa6b8") + pillar(240, 90, 360, "#9aa6b8") +
      figure(150, 140, 1.1, { robe: ROBE2, tiara: true, arms: "left-up", width: 36 }) +
      line(171, 145, 171, 260, GOLD_D, 3) + path("M160,150 h22 M163,160 h16 M166,170 h10", "none", GOLD_D, 2) +
      key(115, 330, -30) + key(185, 330, 30) },
    6: { sky: "day", art: () => sun(150, 80, 22) + wings(150, 140, 0.8) + figure(150, 128, 0.8, { robe: "#c0562f", arms: "out" }) +
      cloud(110, 200, 1.1) + cloud(200, 205, 1.2) + ground(320, "#c8d4a8") + tree(45, 250, 0.7, "#c0562f") + tree(255, 250, 0.7) +
      figure(95, 260, 0.85, { robe: SKIN, arms: "forward" }) + figure(205, 260, 0.85, { robe: SKIN, arms: "forward" }) },
    7: { sky: "day", art: () => mountains(230, "#c7cfd9") + cityLine(200) +
      rect(85, 150, 130, 14, ROBE, INK, 2) + starsRow(95, 158, 6, 22) + line(90, 164, 90, 250, INK, 3) + line(210, 164, 210, 250, INK, 3) +
      figure(150, 190, 0.95, { robe: "#9aa6b8", crown: true, arms: "down" }) +
      rect(80, 250, 140, 70, "#b8b0a0", INK, 2.4) + circle(150, 285, 14, "#e9c97d", INK, 2) +
      sphinx(105, 350, INK) + sphinx(195, 350, WHITE) },
    8: { sky: "day", art: () => mountains(250, "#c7d4b8") + ground(300, "#c8d4a8") + lemniscate(130, 95, 1) +
      figure(130, 135, 1.05, { robe: WHITE, arms: "forward" }) + flowerChain(110, 155, 6) + lion(185, 250, 1.05) },
    9: { sky: "night", art: () => path("M20,400 L120,300 L170,330 L280,240 L280,400 Z", "#9aa6b8", INK, 2) +
      star(70, 80, 6, "#f3e6b0") + star(240, 70, 5, "#f3e6b0") + star(200, 120, 4, "#f3e6b0") +
      figure(140, 150, 1.15, { robe: "#8c8f9a", hood: true, arms: "out", width: 34 }) +
      line(104, 166, 96, 330, "#c99a63", 3.4) +
      lantern(186, 180) },
    10: { sky: "pale", art: () => cloud(55, 100, 0.9) + cloud(270, 100, 0.9) + cloud(55, 380, 0.9) + cloud(270, 380, 0.9) +
      wheel(150, 235, 85) + text(150, 162, "T", INK, 18) + text(223, 240, "A", INK, 18) + text(150, 318, "R", INK, 18) + text(77, 240, "O", INK, 18) +
      sphinx(150, 130, "#9aa6b8") + path("M70,300 q-20,-40 0,-80 q20,-40 0,-70", "none", "#b0702a", 3) },
    11: { sky: "red", art: () => pillar(60, 90, 370, "#9aa6b8") + pillar(240, 90, 370, "#9aa6b8") +
      rect(85, 105, 130, 240, "#8a3a2a", INK, 1.6) +
      figure(150, 150, 1.1, { robe: ROBE2, crown: true, arms: "out", width: 38 }) +
      sword(195, 110, 0.5) + scales(105, 190, 0.8) },
    12: { sky: "pale", art: () => line(70, 90, 230, 90, "#7a5a3a", 7) + line(80, 90, 80, 380, "#7a5a3a", 7) + line(220, 90, 220, 380, "#7a5a3a", 7) +
      leaves(80, 140) + leaves(220, 150) + line(150, 90, 150, 112, INK, 2) +
      g(figure(0, 0, 1, { robe: ROBE2, halo: true }), "translate(150,225) rotate(180)") + ground(380, "#c8d4a8") },
    13: { sky: "dusk", art: () => sun(150, 260, 22) + tower(70, 210, 330, 34, "#9aa6b8") + tower(230, 210, 330, 34, "#9aa6b8") +
      waves(330, "#7a8fa8") + figure(150, 140, 1, { robe: INK, skull: true, arms: "right-up" }) +
      line(171, 110, 171, 300, "#c99a63", 3) + path("M171,110 h46 v40 h-46", WHITE, INK, 2) + flower(194, 130, 0.9, WHITE) },
    14: { sky: "day", art: () => mountains(300, "#c7cfd9") + path("M200,300 Q230,200 250,120", "none", "#e9c97d", 4) + crown(250, 118, 0.8) +
      waves(330, "#7ea6c9") + wings(150, 150, 0.9, WHITE) +
      figure(150, 130, 1.05, { robe: WHITE, arms: "forward" }) + cup(118, 205, 0.32) + cup(182, 215, 0.32) +
      path("M128,198 Q150,170 172,210", "none", "#7ea6c9", 3) + star(150, 175, 7) + flower(60, 330, 1, "#f3c74f") },
    15: { sky: "night", art: () => star(150, 72, 20, "none", 5, GOLD) + wings(150, 140, 1, "#4a3a5a") +
      figure(150, 125, 1.1, { robe: "#6b4a3a", horns: true, arms: "right-up", width: 34 }) +
      rect(115, 235, 70, 40, "#4a4a5a", INK, 2) + chain(100, 250, 85, 330) + chain(200, 250, 215, 330) +
      figure(85, 310, 0.6, { robe: SKIN, horns: true }) + figure(215, 310, 0.6, { robe: SKIN, horns: true }) },
    16: { sky: "night", art: () => path("M60,400 L110,300 L190,300 L240,400 Z", "#7a7a8a", INK, 2) +
      tower(150, 130, 300, 70, "#b8b0a0") + lightning(210, 60, 1.1) + g(crown(0, 0, 1.5), "translate(195,128) rotate(30)") +
      path("M118,160 q-14,-30 4,-48 q2,22 12,30Z M178,180 q14,-26 -2,-44 q0,20 -10,28Z", "#f08a4b", "#c0562f", 1.6) +
      drops([[70, 150], [95, 220], [235, 200], [255, 260], [60, 300]]) +
      g(figure(0, 0, 0.55, { robe: ROBE2, arms: "up" }), "translate(85,250) rotate(-30)") +
      g(figure(0, 0, 0.55, { robe: ROBE, arms: "up" }), "translate(220,320) rotate(200)") },
    17: { sky: "night", art: () => star(150, 95, 32, "#f3e6b0", 8) + [[70, 80], [230, 80], [55, 140], [245, 140], [95, 165], [205, 165], [150, 160]].map(([x, y]) => star(x, y, 9, "#f3e6b0", 8)).join("") +
      path("M20,300 L280,300 L280,400 L20,400 Z", "#c8d4a8", INK, 0) + path("M120,300 Q200,290 280,310 L280,400 L130,400 Z", "#7ea6c9", INK, 2) +
      tree(240, 220, 0.6) + figure(115, 235, 0.95, { robe: SKIN, arms: "forward" }) +
      cup(98, 268, 0.28) + cup(140, 268, 0.28) + path("M140,282 q10,20 20,24", "none", "#7ea6c9", 3) },
    18: { sky: "night", art: () => circle(150, 95, 38, "#f3e6b0", GOLD_D, 2) + crescent(150, 95, 30, "#e9c97d") +
      drops([[110, 150], [130, 160], [150, 165], [170, 160], [190, 150]]) +
      tower(55, 190, 300, 36, "#9aa6b8") + tower(245, 190, 300, 36, "#9aa6b8") + ground(300, "#9ab48a") +
      path("M150,300 Q130,270 150,240 Q170,215 150,190", "none", "#e9c97d", 3) +
      dog(80, 300, 0.7, "#c9b89a") + dog(170, 300, 0.7, WHITE) + waves(350, "#5b7fa8") + crayfish(150, 368) },
    19: { sky: "day", art: () => sun(150, 105, 42, true) + rect(20, 250, 260, 40, "#c99a63", INK, 2) +
      flower(50, 245, 1.6, "#f3c74f") + flower(100, 240, 1.6, "#f3c74f") + flower(200, 240, 1.6, "#f3c74f") + flower(250, 245, 1.6, "#f3c74f") +
      ground(290, "#c8d4a8") + horse(140, 385) + figure(135, 290, 0.7, { robe: SKIN, arms: "right-up", height: 70 }) +
      line(148, 263, 148, 220, "#7a5a3a", 2.4) + path("M148,220 h40 v24 h-40", "#e07a4a", INK, 1.8) },
    20: { sky: "pale", art: () => mountains(330, "#c7cfd9") + cloud(110, 150, 1.4) + cloud(195, 150, 1.4) + wings(150, 110, 0.9, "#e9b7a3") +
      circle(150, 95, 13, SKIN, INK, 2) + path("M150,120 L190,200 L178,206 Z", GOLD, GOLD_D, 2) + path("M182,180 h24 v20 h-24 Z M194,180 v20 M182,190 h24", WHITE, INK, 1.4) +
      waves(340, "#7ea6c9") + rect(70, 330, 50, 20, "#9b7a52", INK, 2) + rect(180, 330, 50, 20, "#9b7a52", INK, 2) +
      figure(95, 290, 0.55, { robe: "#c8ccd6", arms: "up" }) + figure(205, 290, 0.55, { robe: "#c8ccd6", arms: "up" }) + figure(150, 300, 0.5, { robe: "#c8ccd6", arms: "up" }) },
    21: { sky: "pale", art: () => path("M150,95 C75,95 75,370 150,370 C225,370 225,95 150,95 Z", "none", GREEN, 10) +
      path("M150,95 C75,95 75,370 150,370 C225,370 225,95 150,95 Z", "none", "#8fb070", 3) +
      figure(150, 170, 0.95, { robe: "#7a5c8e", arms: "out", width: 22 }) + wand(115, 210, 0.35) + wand(185, 210, 0.35) +
      cornerIcon(55, 90, "angel") + cornerIcon(245, 90, "eagle") + cornerIcon(55, 370, "bull") + cornerIcon(245, 370, "lion") },
  };

  // 장면 보조 도형
  function text(x, y, t, fill = INK, size = 16) {
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="'Nanum Myeongjo', Georgia, serif" font-weight="800" font-size="${size}" fill="${fill}">${t}</text>`;
  }
  function dots(x, y, w, h, color) {
    let d = "";
    for (let yy = y + 12; yy < y + h; yy += 26) for (let xx = x + 10; xx < x + w; xx += 24) d += circle(xx + ((yy / 26) % 2) * 12, yy, 4, color, "none", 0);
    return d;
  }
  const wheat = (x, y) => [0, 12, 24].map((dx) => line(x + dx, y + 80, x + dx, y + 20, GOLD_D, 2) + path(`M${x + dx},${y + 20} q-5,10 0,22 q5,-12 0,-22`, GOLD, GOLD_D, 1)).join("");
  function arcStars(x, y, r, n) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i * Math.PI) / (n - 1);
      s += star(x + r * Math.cos(a), y + r * 0.6 * Math.sin(a), 4.5, "#f3c74f");
    }
    return s;
  }
  const ramHead = (x, y) => circle(x, y, 9, "#e8e0c8", INK, 2) + path(`M${x - 9},${y - 2} q-8,-10 -2,-16 q6,-2 6,6 M${x + 9},${y - 2} q8,-10 2,-16 q-6,-2 -6,6`, "none", INK, 2);
  const ankh = (x, y) => circle(x, y - 22, 7, "none", GOLD_D, 3) + line(x, y - 15, x, y + 40, GOLD_D, 3.4) + line(x - 10, y - 10, x + 10, y - 10, GOLD_D, 3.4);
  const key = (x, y, rot) => g(circle(0, -24, 9, "none", GOLD_D, 3) + line(0, -15, 0, 26, GOLD_D, 3.4) + path("M0,16 h8 M0,24 h10", "none", GOLD_D, 3), `translate(${x},${y}) rotate(${rot})`);
  const cityLine = (y) => path(`M20,${y} v-30 h20 v-15 h18 v25 h24 v-40 h22 v30 h30 v-20 h26 v35 h28 v-28 h20 v18 h28 v-10 h24 v35 Z`, "#d8d2c4", INK, 1.6);
  const starsRow = (x, y, n, gap) => Array.from({ length: n }, (_, i) => star(x + 10 + i * gap, y - 1, 4, "#f3e6b0")).join("");
  const sphinx = (x, y, fill) => path(`M${x - 28},${y + 14} L${x - 22},${y - 8} Q${x},${y - 14} ${x + 14},${y - 4} L${x + 28},${y + 14} Z`, fill, INK, 2) + circle(x + 16, y - 16, 10, fill, INK, 2) + path(`M${x + 6},${y - 18} l-6,10 M${x + 26},${y - 18} l6,10`, "none", INK, 1.6);
  const flowerChain = (x, y, n) => Array.from({ length: n }, (_, i) => flower(x + i * 10, y + Math.sin(i) * 3, 0.5, "#e07a6a")).join("");
  const lantern = (x, y) => line(x, y - 18, x, y - 4, INK, 2) + path(`M${x - 11},${y - 4} h22 l-3,30 h-16 Z`, "#4a4a5a", INK, 2) + star(x, y + 11, 7, "#f3e6b0", 6);
  const leaves = (x, y) => path(`M${x},${y} q14,-10 22,-2 q-10,10 -22,2Z M${x},${y + 30} q-14,-10 -22,-2 q10,10 22,2Z`, GREEN, INK, 1.4);
  const chain = (x1, y1, x2, y2) => line(x1, y1, x2, y2, "#7a7a8a", 2) + [0.25, 0.5, 0.75].map((t) => circle(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, 4, "none", "#7a7a8a", 2)).join("");
  const crayfish = (x, y) => path(`M${x - 12},${y + 6} Q${x},${y - 18} ${x + 12},${y + 6} Z`, "#d86a4a", INK, 1.6) + path(`M${x - 8},${y - 6} l-10,-10 M${x + 8},${y - 6} l10,-10`, "none", "#d86a4a", 3);
  const horse = (x, y, fill = WHITE) =>
    [x - 38, x - 24, x + 24, x + 38].map((lx) => line(lx, y - 40, lx, y, INK, 5)).join("") +
    path(`M${x - 52},${y - 52} q-22,10 -18,36`, "none", INK, 4) +
    `<ellipse cx="${x}" cy="${y - 50}" rx="56" ry="24" fill="${fill}" stroke="${INK}" stroke-width="2.2"/>` +
    path(`M${x + 30},${y - 66} L${x + 50},${y - 108} L${x + 68},${y - 100} L${x + 54},${y - 52} Z`, fill, INK, 2.2) +
    path(`M${x + 48},${y - 112} Q${x + 60},${y - 124} ${x + 88},${y - 98} L${x + 82},${y - 88} Q${x + 66},${y - 94} ${x + 52},${y - 96} Z`, fill, INK, 2.2) +
    path(`M${x + 50},${y - 112} l-4,-12 l10,8`, fill, INK, 1.6) + circle(x + 66, y - 106, 2, INK, INK, 1);
  function cornerIcon(x, y, kind) {
    const base = circle(x, y, 24, "#e8e0c8", GOLD_D, 2);
    const icon = {
      angel: circle(x, y - 4, 8, SKIN, INK, 1.6) + path(`M${x - 18},${y + 8} q18,-12 36,0`, "none", INK, 2),
      eagle: path(`M${x - 18},${y - 2} L${x},${y + 8} L${x + 18},${y - 2} L${x},${y - 12} Z`, "#7a5a3a", INK, 1.6),
      bull: circle(x, y + 2, 9, "#b0702a", INK, 1.6) + path(`M${x - 9},${y - 4} q-8,-8 -4,-14 M${x + 9},${y - 4} q8,-8 4,-14`, "none", INK, 2),
      lion: circle(x, y, 10, "#e9b860", "#b0702a", 4),
    }[kind];
    return base + icon;
  }

  // ── 마이너 아르카나 ────────────────────────────────────────
  const PIPS = {
    1: [[150, 240]], 2: [[150, 150], [150, 330]], 3: [[150, 130], [150, 240], [150, 350]],
    4: [[105, 150], [195, 150], [105, 330], [195, 330]],
    5: [[105, 150], [195, 150], [150, 240], [105, 330], [195, 330]],
    6: [[105, 140], [195, 140], [105, 240], [195, 240], [105, 340], [195, 340]],
    7: [[105, 140], [195, 140], [150, 190], [105, 240], [195, 240], [105, 340], [195, 340]],
    8: [[105, 140], [195, 140], [150, 190], [105, 240], [195, 240], [150, 290], [105, 340], [195, 340]],
    9: [[105, 130], [195, 130], [105, 205], [195, 205], [150, 240], [105, 275], [195, 275], [105, 350], [195, 350]],
    10: [[105, 125], [195, 125], [150, 168], [105, 210], [195, 210], [105, 270], [195, 270], [150, 312], [105, 355], [195, 355]],
  };
  const SUIT_SKY = { wands: "red", cups: "pale", swords: "pale", pentacles: "day" };

  function minorArt(card) {
    const suit = card.suit, color = SUIT_COLOR[suit], icon = SUIT_ICON[suit];
    const rank = card.id.split("-")[1];
    if (rank === "ace") {
      let rays = "";
      for (let i = 0; i < 24; i++) {
        const a = (i * Math.PI) / 12;
        rays += line(150 + 70 * Math.cos(a), 240 + 70 * Math.sin(a), 150 + (i % 2 ? 100 : 120) * Math.cos(a), 240 + (i % 2 ? 100 : 120) * Math.sin(a), color, 2);
      }
      return { sky: SUIT_SKY[suit], art: rays + circle(150, 240, 66, "#f8efd4", color, 3) + icon(150, 240, 1.25) + cloud(80, 120, 1) + cloud(240, 370, 1) };
    }
    if (PIPS[rank]) {
      const s = { 2: 0.85, 3: 0.75, 4: 0.75, 5: 0.7 }[rank] || 0.6;
      const frame = rect(60, 95, 180, 295, "none", color, 1.6, 12);
      return { sky: SUIT_SKY[suit], art: frame + PIPS[rank].map(([x, y]) => icon(x, y, s)).join("") };
    }
    // 코트 카드: 인물 + 수트 상징
    const court = {
      page: { o: { robe: color, arms: "forward" }, y: 150, s: 0.95, extra: "" },
      knight: { o: { robe: color, arms: "forward", height: 70 }, y: 205, s: 0.85, extra: rect(20, 360, 260, 40, "#c8d4a8", "none", 0) + horse(140, 380) },
      queen: { o: { robe: color, crown: true, arms: "forward", width: 38 }, y: 145, s: 1.05, extra: rect(85, 120, 130, 220, "#e8e0c8", INK, 2, 50) },
      king: { o: { robe: color, crown: true, arms: "forward", width: 40, belt: true }, y: 145, s: 1.1, extra: rect(80, 110, 140, 230, "#9aa6b8", INK, 2.4, 8) },
    }[rank];
    const [hx, hy] = hand(150, court.y, court.s, 1, "forward");
    const ground = rank === "knight" ? "" : rect(20, 330, 260, 70, "#c8d4a8", "none", 0);
    return { sky: SUIT_SKY[suit], art: ground + court.extra + figure(150, court.y, court.s, court.o) + icon(hx + 12, hy - 6, 0.7) };
  }

  // ── 카드 틀 ─────────────────────────────────────────────────
  function frame(card, sky, art) {
    const [s1, s2] = SKY[sky] || SKY.day;
    const gid = `sky-${card.id}`;
    const accent = card.suit ? SUIT_COLOR[card.suit] : GOLD_D;
    const nameSize = card.nameKo.length > 6 ? 22 : 26;
    return `<svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${card.nameKo} (${card.nameEn})">
<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient>
<clipPath id="clip-${card.id}"><rect x="20" y="62" width="260" height="338" rx="6"/></clipPath></defs>
<rect x="0" y="0" width="300" height="500" rx="16" fill="${PARCH}"/>
<rect x="8" y="8" width="284" height="484" rx="12" fill="none" stroke="${GOLD}" stroke-width="4"/>
<rect x="14" y="14" width="272" height="472" rx="9" fill="none" stroke="${accent}" stroke-width="1.4"/>
<g clip-path="url(#clip-${card.id})"><rect x="20" y="62" width="260" height="338" fill="url(#${gid})"/>${art}</g>
<rect x="20" y="62" width="260" height="338" rx="6" fill="none" stroke="${INK}" stroke-width="2.4"/>
<path d="M120,20 h60 l10,18 l-10,18 h-60 l-10,-18 Z" fill="${WHITE}" stroke="${accent}" stroke-width="2"/>
${text(150, 39, card.numeral, accent, card.numeral.length > 3 ? 18 : 22)}
${star(32, 38, 7, GOLD, 4)}${star(268, 38, 7, GOLD, 4)}
<path d="M28,412 h244 l-8,32 l8,32 h-244 l8,-32 Z" fill="${WHITE}" stroke="${accent}" stroke-width="2"/>
${text(150, 436, card.nameKo, INK, nameSize)}
<text x="150" y="462" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-style="italic" font-size="13" fill="#6b7088">${card.nameEn}</text>
</svg>`;
  }

  function front(card) {
    if (card.arcana === "major") {
      const n = parseInt(card.id.split("-")[1], 10);
      const scene = MAJOR_SCENES[n];
      return frame(card, scene.sky, scene.art());
    }
    const m = minorArt(card);
    return frame(card, m.sky, m.art);
  }

  // ── 뒷면: 180° 회전 대칭 (역방향을 뒷면으로 알아챌 수 없게) ─────
  function back() {
    const half = (inner) => inner + g(inner, "rotate(180 150 250)");
    let lattice = "";
    for (let i = -500; i < 800; i += 28) lattice += line(i, 0, i + 500, 500, "rgba(201,162,74,0.16)", 1) + line(i + 500, 0, i, 500, "rgba(201,162,74,0.16)", 1);
    const scatter = [[60, 80], [240, 110], [90, 170], [210, 60], [45, 140], [255, 175]].map(([x, y]) => star(x, y, 5, "#e3c983", 4, "none")).join("");
    let rays = "";
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      rays += line(150 + 46 * Math.cos(a), 250 + 46 * Math.sin(a), 150 + (i % 2 ? 66 : 82) * Math.cos(a), 250 + (i % 2 ? 66 : 82) * Math.sin(a), GOLD, 2.4);
    }
    return `<svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
<defs><clipPath id="back-clip"><rect width="300" height="500" rx="16"/></clipPath></defs>
<rect width="300" height="500" rx="16" fill="#1d2640"/>
<g clip-path="url(#back-clip)">${lattice}</g>
<rect x="8" y="8" width="284" height="484" rx="12" fill="none" stroke="${GOLD}" stroke-width="4"/>
<rect x="18" y="18" width="264" height="464" rx="8" fill="none" stroke="${GOLD}" stroke-width="1.4"/>
${half(scatter + crescent(150, 120, 22, "#e3c983", 1) + path("M40,40 l14,0 l-14,14 Z", GOLD, "none", 0) + path("M260,40 l-14,0 l14,14 Z", GOLD, "none", 0))}
${rays}<circle cx="150" cy="250" r="44" fill="#141b2e" stroke="${GOLD}" stroke-width="2.4"/>
<circle cx="150" cy="250" r="36" fill="none" stroke="${GOLD}" stroke-width="1"/>
<path d="${starPath(150, 250, 30, 8, 0.42)}" fill="${GOLD}" stroke="none"/>
<circle cx="150" cy="250" r="7" fill="#141b2e"/>
<circle cx="150" cy="250" r="110" fill="none" stroke="${GOLD}" stroke-width="1" stroke-dasharray="3 6"/>
</svg>`;
  }

  return { front, back };
})();

if (typeof module !== "undefined") module.exports = { ART };
