"""운세의 신 무료 타로 결과 페이지를 Firecrawl로 반복 수집해 메이저 아르카나 22장 사전을 만든다.

벤치마크·분석 용도 전용. 수집한 풀이 텍스트는 원 사이트의 저작물이므로 서비스에 재사용하지 않는다.

사용법:
    set FIRECRAWL_API_KEY=fc-...
    python research/collect_unsin.py [--max-calls 200] [--delay 1.5]
"""
import argparse
import json
import os
import random
import re
import time
from datetime import datetime, timezone
from pathlib import Path

from bs4 import BeautifulSoup
from firecrawl import Firecrawl

BASE_URL = "https://www.unsin.co.kr/unse/free/tarot/result"
IMG_HOST = "https://www.unsin.co.kr"
TOTAL_CARDS = 22
OUT_DIR = Path(__file__).parent
CARDS_PATH = OUT_DIR / "unsin_major_arcana.json"
LOG_PATH = OUT_DIR / "draws_log.jsonl"

# 본문에서 영역별 문장을 뽑을 때 쓰는 키워드
SECTION_KEYWORDS = {
    "love": ["애정", "연애", "연인", "사랑"],
    "money": ["금전", "재물", "수입", "지출", "돈"],
    "relation": ["인간관계", "대인관계", "관계"],
}


def parse_result(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    img = soup.select_one(".tarotBox .img-Box img")
    name = soup.select_one(".tarotBox span.bg-purple-radius")
    subs = soup.select(".sub-txt")
    body_el = soup.select_one(".bg-box p.mt-2")
    if not (img and name and len(subs) >= 2 and body_el):
        raise ValueError("결과 페이지 구조를 찾지 못함")

    src = img["src"]
    card_id = re.search(r"(mj\d+)\.jpg", src).group(1)
    name_text = name.get_text(strip=True)
    m = re.match(r"(.+?)\s*\((.+)\)", name_text)
    name_ko, name_en = (m.group(1).strip(), m.group(2).strip()) if m else (name_text, "")

    def strip_label(el):
        return re.sub(r"^\s*(정방향|역방향)\s*:\s*", "", el.get_text(" ", strip=True)).strip()

    body = "\n".join(s.strip() for s in body_el.get_text("\n").splitlines() if s.strip())
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+|\n", body) if s.strip()]
    sections = {
        key: " ".join(s for s in sentences if any(k in s for k in kws))
        for key, kws in SECTION_KEYWORDS.items()
    }

    return {
        "id": card_id,
        "number": int(card_id[2:]),
        "name_ko": name_ko,
        "name_en": name_en,
        "image_url": src if src.startswith("http") else IMG_HOST + src,
        "upright": strip_label(subs[0]),
        "reversed": strip_label(subs[1]),
        "body": body,
        "sections": sections,
    }


def save(cards: dict):
    ordered = sorted(cards.values(), key=lambda c: c["number"])
    CARDS_PATH.write_text(json.dumps(ordered, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-calls", type=int, default=200)
    ap.add_argument("--delay", type=float, default=1.5)
    ap.add_argument("--target", type=int, default=TOTAL_CARDS, help="이 장수만큼 모이면 종료")
    args = ap.parse_args()

    api_key = os.environ.get("FIRECRAWL_API_KEY")
    if not api_key:
        raise SystemExit("FIRECRAWL_API_KEY 환경변수가 필요합니다.")
    fc = Firecrawl(api_key=api_key)

    cards = {}
    if CARDS_PATH.exists():
        cards = {c["id"]: c for c in json.loads(CARDS_PATH.read_text(encoding="utf-8"))}

    with LOG_PATH.open("a", encoding="utf-8") as log:
        for i in range(1, args.max_calls + 1):
            if len(cards) >= args.target:
                break
            # Firecrawl 캐시를 피하려고 max_age=0 + 쿼리 파라미터로 매번 새로 뽑게 한다
            url = f"{BASE_URL}?_={int(time.time() * 1000)}{random.randint(0, 999)}"
            entry = {"call": i, "ts": datetime.now(timezone.utc).isoformat(), "url": url}
            try:
                doc = fc.scrape(url, formats=["html"], max_age=0, store_in_cache=False,
                                only_main_content=False)
                card = parse_result(doc.html or "")
                is_new = card["id"] not in cards
                entry.update(card_id=card["id"], name_ko=card["name_ko"], new=is_new)
                if is_new:  # 중단돼도 잃지 않도록 새 카드가 나올 때마다 저장
                    cards[card["id"]] = card
                    save(cards)
            except Exception as e:  # 실패도 로그에 남기고 계속 진행
                entry["error"] = repr(e)
            log.write(json.dumps(entry, ensure_ascii=False) + "\n")
            log.flush()
            print(f"[{i:3d}] {entry.get('card_id', 'ERR'):5s} {entry.get('name_ko', entry.get('error', ''))[:40]}"
                  f"  ({len(cards)}/{TOTAL_CARDS})")
            time.sleep(args.delay)

    save(cards)
    print(f"저장: {CARDS_PATH} ({len(cards)}장)")


if __name__ == "__main__":
    main()
