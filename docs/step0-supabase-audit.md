# 단계 0 — Supabase 읽기 전용 점검 보고

점검일: 2026-09-09
점검 방식: `select` 전용 조회 + 함수 엔드포인트 GET 확인. **데이터 변경 없음.**

프로젝트 ref와 URL은 저장소에 기록하지 않는다. `.env` 참조.

---

## 1. 프로젝트 상태

| 항목 | 값 |
|---|---|
| 상태 | Healthy (점검 직전 일시정지 상태였고, 사용자가 Restore 하여 복구) |
| Compute | NANO |
| 마이그레이션 이력 | 없음 (대시보드에서 직접 생성된 스키마) |
| GitHub 연동 | 없음 |

일시정지는 무료 플랜의 미사용 자동 정지였으며 데이터 손실은 없었다.

## 2. 테이블

| 테이블 | 행 수 | RLS |
|---|---:|---|
| `notes` | 28 | 켜짐 |
| `classify_usage` | 6 | 켜짐 |

`pg_stat_user_tables.n_live_tup` 은 복구 직후 0으로 초기화돼 있었다.
실제 행 수는 `count(*)` 로 재확인했다. **통계값을 신뢰하지 말 것.**

### `notes` 컬럼 (12개) — 명세서 4장 대조

| 컬럼 | 타입 | 명세서 대조 |
|---|---|---|
| `id` | text | 있음. 앱이 id를 생성해 넣는 방식. **uuid 로 바꾸지 않는다** |
| `user_id` | uuid | 있음 |
| `title` | text | 있음 |
| `content` | text | 있음 |
| `category` | text | 있음 |
| `created_at` | timestamptz | 있음 |
| `updated_at` | timestamptz | 있음 |
| `deadline_at` | timestamptz | 있음 |
| `notification_id` | text | **명세서에 없으나 DB에 존재.** 알림 예약 ID. 명세서 6.2 알림 기능과 부합하므로 유지 |
| `is_done` | boolean | 있음 |
| `category_confidence` | double precision | 있음 |
| `category_reason` | text | 있음 |

### 명세서 대비 부족한 컬럼 (3개)

| 컬럼 | 용도 | 명세서 |
|---|---|---|
| `topic` | 노트 내용에서 뽑은 짧은 주제 | 4장, 6.1, 6.3 |
| `tags` | 선택적 태그 목록 | 4장 |
| `prayer_answer_status` | 기도 응답 Yes / No / Wait | 4장, 6.3 |

기존 12개 컬럼은 이름·타입이 명세서와 일치한다. **기존 구조 변경은 불필요하며,
위 3개를 덧붙이는 추가 마이그레이션(`alter table ... add column`)만 필요하다.**
기존 28개 행은 영향받지 않는다. 사용자 승인 전에는 실행하지 않는다.

## 3. RLS 정책

| 테이블 / 정책 | 동작 |
|---|---|
| `notes / notes_select_own` | SELECT |
| `notes / notes_insert_own` | INSERT |
| `notes / notes_update_own` | UPDATE |
| `notes / notes_delete_own` | DELETE |
| `classify_usage / classify_usage_select_own` | SELECT |
| `classify_usage / classify_usage_insert_own` | INSERT |

노트 CRUD 에 필요한 정책이 모두 존재한다. **추가·수정할 것 없음.**

미확인 항목: 정책의 조건식(`using` 절)은 조회하지 않았다. 이름이 `_own` 이므로
`auth.uid() = user_id` 로 추정되나, 단계 1에서 로그인 후 28개 노트가 실제로
보이는지로 실증한다.

## 4. 기존 노트 28개의 분류 분포

| 분류 | 개수 |
|---|---:|
| `daily` 일상 | 11 |
| `prayer` 기도 | 7 |
| `todo` 할 일 | 6 |
| `journal` 일기 | 2 |
| `gratitude` 감사 | 1 |
| `scripture` 말씀 | 1 |
| 합계 | 28 |

명세서의 여섯 분류가 모두 실제로 사용됐고, 분류가 비어 있는 노트는 없다.
감사·말씀도 1건씩 실데이터가 있어 재구축 화면의 검증 예시로 쓸 수 있다.

## 5. Edge Functions

| 이름 | 상태 |
|---|---|
| `classify-note` | **살아 있음.** 인증 없는 요청에 `401 UNAUTHORIZED_NO_AUTH_HEADER` 반환 |
| `app` | 코드 아님. `"고바노트 웹은 로컬에서 npm run dev로 열고, 폰은 Expo 앱을 쓰면 됩니다."` 텍스트만 반환하는 스텁 |

`classify-note` 가 JWT 를 요구하는 것은 명세서 3장의 보안 구조와 일치한다.
함수 소스는 확인하지 않았다. 단계 2에서 실제 응답 형식이 명세서 7장
(`category` / `confidence` / `reason` / `topic`)과 맞는지 검증한다.

`app` 스텁은 복구 대상 코드가 아니다.

---

## 결론

- 기존 데이터 28개 노트와 6개 사용량 기록은 **온전하며, 아무것도 변경하지 않았다.**
- 보안(RLS·정책·함수 인증)은 이미 올바르게 설정돼 있어 손댈 필요가 없다.
- 필요한 유일한 DB 변경은 **컬럼 3개 추가**이며, 파괴적이지 않다. 승인 후 진행한다.
