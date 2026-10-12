# 카드 아트 설계 근거 — 상용 타로 덱 24종 조사 (2026-10-12)

카드 앞·뒷면 SVG(`js/art.js`)를 그리기 전에 실제 판매되는 덱 24종의 레이아웃과 도상 관례를 조사했다.
특정 덱의 그림·구도는 따라 그리지 않았다. 아래의 일반적인 관례와 도상만 참고했다.
그림체는 사용자 요청에 따라 **중세 성당 스테인드글라스** 양식으로 정했다 (2026-10-12 갱신).

## 조사한 덱
Rider-Waite, Universal Waite, Smith-Waite Centennial, Tarot de Marseille(Camoin-Jodorowsky), Thoth, The Wild Unknown,
Modern Witch, Light Seer's, Golden Thread, Fountain, Santa Muerte, Next World, Star Spinner, Ethereal Visions,
Pagan Otherworlds, Cosmic Slumber, Tarot of the Divine, Prisma Visions, Everyday Witch, Shadowscapes, Linestrider,
Deviant Moon, Mystical Manga, Crystal Visions

## 관례와 이 게임의 적용
| 관례 | 근거 덱 | 적용 |
|---|---|---|
| 크기 70×120mm 내외 (≈ 0.58~0.6) | 대부분 | 300×500 캔버스 (0.6) |
| 번호와 이름을 그림 밖에 표기 | RWS, 마르세유, Thoth, Deviant Moon, Tarot of the Divine | 창 아래 명문 패널에 로마숫자, 한글명, 블랙레터 영문명 |
| 장식 프레임으로 시리즈 통일 | Ethereal Visions, Tarot of the Divine | 석재 바탕, 고딕 첨두아치 창, 사엽 장식, 금색 테두리 |
| 수트별 색으로 구분 | Shadowscapes, Crystal Visions, Deviant Moon | 완드는 주황, 컵은 파랑, 소드는 회청, 펜타클은 황금 |
| 마이너: 장면형 또는 핍형 | 장면형은 RWS, 핍형은 마르세유·Thoth | 핍형: 밝은 유리판 위에 수트 상징을 숫자만큼 배치. 에이스는 큰 상징, 코트는 인물+상징 |
| 뒷면 180° 대칭 (역방향을 뒷면으로 알 수 없게) | Universal Waite, Star Spinner, Santa Muerte, Fountain 등 | 12꽃잎 장미창 + 네 귀퉁이 사엽 장식 (회전 대칭) |

## 스테인드글라스 표현 방법
- **납선**: 모든 윤곽을 굵은 검은 선으로 그리고, 넓은 면(땅·산·물)은 납선으로 여러 조각을 잇는다.
- **바탕**: 중세 창에서 흔한 마름모 유리 조각(quarry) 모자이크. 파랑·루비·청록·보라 계열을 쓴다.
- **색**: 밝게 그린 장면 색을 채도는 높이고 명도는 낮춰 보석색 유리로 바꾼다(`glassify`).
- **질감과 빛**: 노이즈 필터로 유리의 얼룩을, 방사형 그라데이션과 사선 하이라이트로 투과광을 표현한다.
- **인물**: 길쭉한 비례, 옷 주름 납선, 유리에 그려 넣은 얼굴 선. 거룩한 인물에는 후광을 둔다.

## 메이저 도상 (일반적 상징만 사용)
0 바보는 절벽·개·보따리, 1 마법사는 ∞와 4원소 도구, 2 여사제는 흑백 기둥과 초승달, 3 여황제는 별 왕관과 밀밭,
4 황제는 숫양 옥좌와 앙크, 5 교황은 삼중관과 열쇠 둘, 6 연인은 천사와 두 사람, 7 전차는 별 덮개와 흑백 스핑크스,
8 힘은 사자와 ∞, 9 은둔자는 별이 든 등불, 10 수레바퀴는 바퀴와 네 귀퉁이 구름, 11 정의는 칼과 저울,
12 매달린 사람은 T자 나무와 후광, 13 죽음은 흰 장미 깃발과 두 탑 사이 해, 14 절제는 두 잔과 날개, 15 악마는 뿔과 사슬,
16 탑은 번개와 떨어지는 왕관, 17 별은 큰 별과 작은 별 7개, 18 달은 개 두 마리와 가재, 19 태양은 해바라기와 말 탄 아이,
20 심판은 나팔과 깨어나는 사람들, 21 세계는 화환과 네 생물

## 피한 것
특정 덱의 구도·포즈·배경 재현, 현대 덱의 시그니처 요소(검정+금박 선화, 반원 테두리, 동물 선화 등), 다른 덱 뒷면 문양(타탄, 장미십자 등).

## 출처
aeclectic.net 덱 리뷰(각 덱 페이지), benebellwen.com, spiralnature.com, labyrinthos.co, wildhunt.org
