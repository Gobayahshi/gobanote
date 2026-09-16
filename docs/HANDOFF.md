# 인수인계 — 지금 어디까지 왔고, 다음에 무엇을 하는가

마지막 갱신: 2026-09-16
마지막 커밋: `12daf05` (GitHub `Gobayahshi/gobanote`, private, 브랜치 `main`)

---

## 한 줄 요약

**단계 1 코드는 다 짰고 웹 빌드도 성공했다. 남은 것은 Supabase anon key 를 `.env` 에
넣고, 실제로 로그인해서 기존 노트 28개가 보이는지 확인하는 일뿐이다.**

---

## 바로 다음에 할 일

### 1단계. 사용자가 `.env` 에 키를 넣는다 (사용자 행동, 대기 중)

`.env` 파일은 이미 만들어져 있고 주소는 채워져 있다. 키 칸만 비어 있다.

```
EXPO_PUBLIC_SUPABASE_URL=https://xaihviundrjuseugbnnh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=        ← 여기가 비어 있음
```

사용자에게 안내할 내용:

1. https://supabase.com/dashboard 에서 고바노트 프로젝트를 연다.
   무료 플랜이라 일주일쯤 안 쓰면 잠든다. **Paused** 로 나오면 **Restore** 를 먼저 누른다.
   (데이터는 사라지지 않는다. 2027-10-09 까지 복구 가능.)
2. `Project Settings` → `API Keys` 로 간다.
3. **`anon` `public`** 키(화면에 따라 **Publishable key**)를 복사한다.
   `service_role` / **Secret key** 는 절대 쓰지 않는다.
4. `.env` 의 `EXPO_PUBLIC_SUPABASE_ANON_KEY=` 뒤에 붙여넣고 저장한다.

키를 채팅에 붙여넣게 하지 않는다. `.env` 는 `.gitignore` 에 있어 커밋되지 않는다.

### 2단계. 단계 1 완료 검증

키를 넣은 뒤 `npm run web` 으로 띄우고, 사용자가 **예전에 쓰던 계정으로 로그인**한다.
확인할 것:

- [ ] 로그인이 되는가
- [ ] 노트 탭에 **기존 28개**가 보이는가
      (여기서 RLS 정책의 `using` 절이 `auth.uid() = user_id` 인지가 실증된다.
       단계 0 점검에서 유일하게 확인 못 한 항목이다.)
- [ ] 분류 필터가 동작하는가 — 일상 11 / 기도 7 / 할 일 6 / 일기 2 / 감사 1 / 말씀 1
- [ ] 새 노트 작성 → 목록에 나타남
- [ ] 노트 상세에서 제목·본문·분류 수정 → 저장됨
- [ ] 삭제 → 확인 창 → 되돌리기가 동작함

**이것이 명세서 10장 단계 1 의 완료 기준이다.** 통과하면 단계 1 을 완료로 커밋한다.

### 3단계. 컬럼 3개 추가 (사용자 승인 필요)

명세서 4장 대비 DB 에 없는 컬럼:

```sql
alter table public.notes add column if not exists topic text;
alter table public.notes add column if not exists tags text[];
alter table public.notes add column if not exists prayer_answer_status text;
```

기존 28행에 영향을 주지 않는 추가 전용 작업이다. **사용자 승인 전에 실행하지 않는다.**
실행한 뒤에는 `src/lib/notes.ts` 의 `COLUMNS` 와 `Note` 타입에 세 컬럼을 더한다.

### 4단계. Render Static Site 배포

`npx expo export --platform web` 결과물 `dist/` 를 올린다.

- Render 대시보드 → New → **Static Site** (절대 `Web Service` 가 아니다)
- GitHub 저장소 `Gobayahshi/gobanote` 연결
- Build Command: `npm install && npx expo export --platform web`
- Publish Directory: `dist`
- 환경변수에 `EXPO_PUBLIC_SUPABASE_URL` 과 `EXPO_PUBLIC_SUPABASE_ANON_KEY` 를 넣는다
  (Render 대시보드에서 사용자가 직접 입력. anon key 는 앱 번들에 포함되는 공개값이라
  웹에 나가도 되지만, 저장소에는 넣지 않는다.)
- **주의:** `/note/[id]` 가 동적 경로다. SPA rewrite 규칙
  (`/*` → `/index.html`) 이 필요할 수 있다. 배포 후 노트 상세 새로고침으로 확인한다.

사용자 계정이 필요한 단계이므로 멈추고 한 번에 하나씩 안내한다.

### 그 이후 — 단계 2, 3

명세서 10장을 따른다. 요약하면:

- **단계 2**: `classify-note` 연결 완료, 수동 분류 우선, 할 일 기한·완료·챙김 탭,
  기도 Yes/No/Wait, 감사 템플릿(`YYMMDD 감사` + 네 질문)과 감사 달력, 말씀 분류 규칙
- **단계 3**: 검색, 알림, 오류·빈 상태 처리, 디자인 다듬기, Render 배포 마무리

---

## 지금까지 한 일

### 단계 0 — 복구 준비 (완료)

| 커밋 | 내용 |
|---|---|
| `4924beb` | Git 초기화, `.gitignore`, `.env.example`, README |
| `5ae62f4` | Supabase 읽기 전용 점검 보고서 |
| `95f4696` | 명세서에 웹 배포를 정식 목표로 반영 |

점검 결과 요약 (자세한 내용은 [step0-supabase-audit.md](step0-supabase-audit.md)):

- `notes` **28행**, `classify_usage` **6행** 모두 온전. 아무것도 변경하지 않았다.
- RLS 가 두 테이블 다 켜져 있고, notes 의 CRUD 정책 4개가 모두 존재한다. 손댈 것 없음.
- Edge Function `classify-note` 가 살아 있다. 인증 없는 요청에 401 을 준다.
- Edge Function `app` 은 코드가 아니라 안내 문구만 반환하는 스텁이다. 복구 대상 아님.
- 명세서 대비 부족한 컬럼은 `topic`, `tags`, `prayer_answer_status` 세 개뿐이다.

### 단계 1 — 앱 뼈대 (코드 완료, 실데이터 검증 전)

커밋 `12daf05`. Expo SDK 57 + expo-router.

만든 것:

- 로그인·가입 화면, 세션 유지, 로그인 여부에 따른 자동 화면 분기
- 하단 탭 6개: 쓰기 · 노트 · 검색 · 감사 · 챙김 · 계정
- 노트 작성 / 목록(분류 필터 7종) / 상세 수정 / 삭제 / **삭제 되돌리기**
- 크림 바탕 + 숲색 테마, 최소 44pt 터치 영역
- 웹에서 `Alert.alert` 이 동작하지 않아 확인 창을 직접 만들었다 (`ConfirmDialog`)

검증한 것:

- `npx tsc --noEmit` 통과 (strict 모드, 오류 0)
- `npx expo export --platform web` 성공. 화면 16개가 정적 파일로 출력됨

아직 검증하지 못한 것:

- **실제 로그인과 기존 28개 노트 조회.** anon key 가 없어서 막혀 있다.

아직 만들지 않은 것 (의도된 것, 단계 2·3 몫):

- 검색 / 감사 / 챙김 탭은 "단계 N에서 추가" 안내 화면만 있다
- AI 자동 분류 미연결. 지금은 쓰기 화면에서 수동으로 고르고, 안 고르면 `daily`

---

## 알아두면 시간을 아끼는 것들

- **`pg_stat_user_tables.n_live_tup` 을 믿지 말 것.** 프로젝트를 잠에서 깨우면 0 으로
  초기화된다. 처음에 "노트가 0개"로 보여서 헷갈렸다. 실제 개수는 `count(*)` 로 센다.
- **Windows 에서 `expo export` 가 출력 없이 `exit 107` 로 끝나는 일이 있다.**
  빌드 실패가 아니다. `CI=1` 을 주고 다시 실행하면 정상으로 끝난다.
- 프로젝트 폴더 경로에 괄호와 한글과 공백이 있다(`(26년08월) Goba.note`).
  터미널에서 경로를 반드시 따옴표로 감싼다.
- `docs/reference/` 안의 저장된 웹페이지에 세션 accessToken(JWT)이 들어 있어
  Git 추적에서 제외했다. 파일은 로컬에 그대로 있다. **외부에 공유하지 않는다.**
- 저장소에 없는 로컬 전용 파일: `.env`, `node_modules/`, `dist/`, `.expo/`,
  `docs/reference/`. 다른 PC 에서 이어받으려면 `npm install` 과 `.env` 작성이 필요하다.
