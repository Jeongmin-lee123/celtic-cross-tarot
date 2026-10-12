"""수집한 운세의 신 22장 데이터를 분석하고, 켈틱 크로스 10장 샘플 드로우를 만든다.

사용법: python research/analyze.py [--seed 2026]
결과: research/analysis.json
"""
import argparse
import collections
import json
import random
from pathlib import Path

DIR = Path(__file__).parent

# 네이버 블로그 '타로 카드 배열법'(healerjeun/222332279855)의 켈틱 크로스 포지션 정의
CELTIC_CROSS = [
    ("현재의 위치", "현재 상황과 문제"),
    ("현재 방해물", "가로막는 장애물 또는 돕는 요인"),
    ("가까운 미래", "약 1개월 안에 다가올 일"),
    ("오래된 과거", "1년 이상 지난 영향"),
    ("가까운 과거", "6개월 이내의 사건"),
    ("미래", "약 2개월의 흐름"),
    ("내가 보는 나", "질문자의 감정 상태"),
    ("타인들의 평가", "주위 환경과 시선"),
    ("심리상태", "바라는 것, 가장 걱정하는 것"),
    ("결과", "최종 결과와 해답"),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=2026)
    args = ap.parse_args()

    cards = json.loads((DIR / "unsin_major_arcana.json").read_text(encoding="utf-8"))
    log = [json.loads(l) for l in (DIR / "draws_log.jsonl").open(encoding="utf-8")]
    ok = [l for l in log if "card_id" in l]
    counts = collections.Counter(l["card_id"] for l in ok)

    lengths = [len(c["body"]) for c in cards]
    stats = {
        "cards": len(cards),
        "calls": len(log),
        "successful_draws": len(ok),
        "errors": len(log) - len(ok),
        "draw_counts": dict(sorted(counts.items(), key=lambda kv: int(kv[0][2:]))),
        "body_chars_avg": round(sum(lengths) / len(lengths)),
        "body_chars_min": min(lengths),
        "body_chars_max": max(lengths),
        "with_love": sum(bool(c["sections"]["love"]) for c in cards),
        "with_money": sum(bool(c["sections"]["money"]) for c in cards),
        "with_relation": sum(bool(c["sections"]["relation"]) for c in cards),
        "upright_keywords_avg": round(sum(len(c["upright"].split()) for c in cards) / len(cards), 1),
    }

    # 사이트는 1장씩만 뽑으므로, 22장 사전에서 로컬로 10장을 비복원 추출해 켈틱 크로스로 배치한다
    rng = random.Random(args.seed)
    drawn = rng.sample(cards, len(CELTIC_CROSS))
    spread = []
    for i, ((pos, meaning), c) in enumerate(zip(CELTIC_CROSS, drawn), 1):
        reversed_ = rng.random() < 0.5
        spread.append({
            "n": i,
            "position": pos,
            "position_meaning": meaning,
            "card_id": c["id"],
            "card": f'{c["name_ko"]} ({c["name_en"]})',
            "orientation": "역방향" if reversed_ else "정방향",
            "keywords": c["reversed"] if reversed_ else c["upright"],
        })

    out = {"stats": stats, "seed": args.seed, "celtic_cross_sample": spread}
    (DIR / "analysis.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
