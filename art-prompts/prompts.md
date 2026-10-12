# 카드 그림 프롬프트 — 중세 채색 필사본 양식

ChatGPT로 카드 그림을 만들 때 쓰는 프롬프트입니다.
**지금은 시안 3장만** 들어 있습니다. 시안으로 그림체를 확인한 뒤 나머지 76장을 추가합니다.

## 사용법

1. ChatGPT에서 **새 대화 하나**를 열고, 아래 **스타일 가이드**를 그대로 붙여 넣어 보냅니다.
2. 이어서 카드 프롬프트를 **한 장씩** 보냅니다. 이미지는 세로(2:3)로 요청합니다.
3. 두 번째 카드부터는 마음에 든 첫 이미지를 첨부하고 "이 그림과 같은 화풍으로"라고 덧붙이면 통일감이 좋아집니다.
4. 이미지를 다운로드해 프롬프트에 적힌 **파일명 그대로** 아래 폴더에 저장합니다.
   ```
   C:\Users\ljmne\orca\projects\tarot\art-source\
   ```
5. 저장이 끝나면 저에게 알려 주세요. 게임에 연결해서 보여 드립니다.
   직접 하려면 `python tools/import_cards.py`를 실행하면 됩니다.

> 그림 안에는 글자를 넣지 않습니다. 카드 이름과 번호는 게임이 그림 아래에 따로 얹습니다.
> 상업적으로 이용할 계획이라면 OpenAI 이용약관에서 생성 이미지의 권리 조항을 먼저 확인하세요.

## 스타일 가이드 (첫 메시지로 보내기)

```
I'm creating a set of tarot card illustrations. Please keep ONE consistent style for every image I ask for in this conversation:

- Style: a 13th–14th century Gothic illuminated manuscript miniature (like a medieval psalter or book of hours), painted in egg tempera and shell gold on aged vellum.
- Figures: elongated, graceful figures with serene, stylized faces and calm, symbolic gestures; flowing drapery with crisp fold lines; strong dark outlines; flat, decorative perspective.
- Palette: lapis lazuli blue, vermilion red, malachite green, ochre, lead white and burnished gold leaf.
- Background: burnished gold leaf, or a diapered (checkered / lozenge) pattern in blue and red with tiny gold dots.
- Border: a thin painted frame of ivy vines with small gold bezants.
- Format: vertical portrait, 2:3. Keep the main subject centered. Leave the bottom 12% as plain parchment (a caption panel will be placed there later).
- Absolutely NO text, letters, numbers, runes, captions, signatures or watermarks anywhere in the image.
- Original compositions only — do not imitate any specific existing tarot deck.

Reply "ready" and wait for the first card.
```

## 시안 3장

성격이 다른 세 장(인물과 풍경, 코트 인물, 뒷면 문양)으로 그림체를 확인합니다.

### 1. 바보 (The Fool) — 파일명 `major-0.png`

```
Card: The Fool (0). Vertical 2:3.
A youthful wanderer in a particolored red-and-blue tunic steps lightly toward the edge of a stylized rocky cliff, face lifted toward the sky with a carefree smile. Over one shoulder he carries a small bundle tied to a wooden staff; in his other hand, a single white rose. A small white dog leaps playfully at his heels. In the upper corner, a golden sun with a calm face. Stylized mountains in the distance against a gold-leaf sky.
```

### 2. 컵 퀸 (Queen of Cups) — 파일명 `cups-queen.png`

```
Card: Queen of Cups. Vertical 2:3.
A crowned queen in a lapis-blue mantle over a white gown sits on a carved stone throne at the edge of the sea. With both hands she holds an ornate, lidded golden chalice and gazes at it with a gentle, compassionate expression. Small stylized waves curl at her feet, with a few scallop shells on the shore. Diapered blue-and-red background with tiny gold dots.
```

### 3. 카드 뒷면 — 파일명 `back.png`

```
Card back design (an ornament, not a scene). Vertical 2:3.
A symmetrical illuminated ornament that looks identical when the card is turned upside down (180° rotational symmetry): a central gold-leaf rosette inside a quatrefoil, surrounded by interlaced ivy vines, on a deep lapis-blue ground diapered with tiny gold dots. Matching ornaments in all four corners and a red-and-gold border. No figures, no text.
```
