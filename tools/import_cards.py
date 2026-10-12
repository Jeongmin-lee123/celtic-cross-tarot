"""ChatGPT 등으로 만든 카드 그림을 게임용으로 가져온다.

art-source/ 의 원본(png/jpg/webp)을 2:3으로 가운데 자르고 600×900 WebP로 줄여 images/cards/ 에 저장한다.
뒷면(back)은 위쪽 절반을 180° 돌려 아래쪽에 붙여 회전 대칭을 강제한다 (역방향이 뒷면으로 드러나지 않게).
마지막에 images/cards/manifest.json 을 갱신하고 아직 없는 카드를 알려 준다.

사용법: python tools/import_cards.py
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art-source"
OUT = ROOT / "images" / "cards"
SIZE = (600, 900)  # 2:3
QUALITY = 80

SUITS = ["wands", "cups", "swords", "pentacles"]
RANKS = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "page", "knight", "queen", "king"]
CARD_IDS = [f"major-{n}" for n in range(22)] + [f"{s}-{r}" for s in SUITS for r in RANKS]
ALL_IDS = CARD_IDS + ["back"]


def normalize(stem: str) -> str:
    # major-00 처럼 0을 채운 이름도 받아 준다
    m = re.fullmatch(r"major-0*(\d+)", stem.lower())
    return f"major-{int(m.group(1))}" if m else stem.lower()


def crop_to_ratio(img: Image.Image) -> Image.Image:
    return ImageOps.fit(img, SIZE, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def make_symmetric(img: Image.Image) -> Image.Image:
    w, h = img.size
    top = img.crop((0, 0, w, h // 2))
    out = img.copy()
    out.paste(top.rotate(180), (0, h - h // 2))
    return out


def main() -> int:
    # 윈도우 콘솔(cp949)에서도 한글·기호 출력이 깨지거나 멈추지 않게
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if not SRC.exists():
        print(f"원본 폴더가 없습니다: {SRC}")
        return 1
    OUT.mkdir(parents=True, exist_ok=True)

    imported = []
    for path in sorted(SRC.iterdir()):
        if path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
            continue
        card_id = normalize(path.stem)
        if card_id not in ALL_IDS:
            print(f"  !! 알 수 없는 파일명, 건너뜀: {path.name}")
            continue
        img = crop_to_ratio(Image.open(path).convert("RGB"))
        if card_id == "back":
            img = make_symmetric(img)
        dest = OUT / f"{card_id}.webp"
        img.save(dest, "WEBP", quality=QUALITY, method=6)
        imported.append(card_id)
        print(f"  OK {path.name} -> images/cards/{dest.name} ({dest.stat().st_size // 1024}KB)")

    present = sorted((p.stem for p in OUT.glob("*.webp") if p.stem in ALL_IDS), key=ALL_IDS.index)
    (OUT / "manifest.json").write_text(json.dumps(present, indent=0), encoding="utf-8")
    missing = [i for i in ALL_IDS if i not in present]
    print(f"\n이번에 가져옴 {len(imported)}장 · 게임에 있는 그림 {len(present)}/{len(ALL_IDS)}장")
    if missing:
        print(f"아직 없는 그림 {len(missing)}장: {', '.join(missing[:12])}{' ...' if len(missing) > 12 else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
