# 고바노트 — 작업 지침

이 파일은 이 저장소에서 작업하는 AI 어시스턴트가 먼저 읽는 문서다.
사람이 읽는 소개는 [README.md](README.md), 지금 어디까지 왔는지는
[docs/HANDOFF.md](docs/HANDOFF.md) 에 있다.

## 이 프로젝트가 무엇인가

원본 Expo 소스가 사라진 한국어 노트 앱 "고바노트"를, 남은 대화 기록으로 만든
명세서에 근거해 다시 만드는 작업이다. **원본 코드를 찾는 작업이 아니다.**

**[GobaNote_Recovery_Spec.md](GobaNote_Recovery_Spec.md) 가 유일한 기능 기준이다.**
기능을 추가·변경·생략할 때는 반드시 이 문서를 근거로 삼는다. 명세서에 없는 기능을
임의로 넣지 않는다. 사용자가 명세서와 다른 것을 요구하면, 말로만 합의하지 말고
**명세서 파일 자체를 고쳐서 커밋한다.** (실제 사례: 9장의 웹 배포 항목)

핵심 원칙 한 줄:

> 빈 칸에 적으면 AI가 글의 종류를 판단하고, 그 글에 필요한 기능만 조용히 열어 준다.

## 절대 지켜야 할 것

- **Supabase 의 기존 `notes` 데이터(28행)를 삭제·초기화·마이그레이션하지 않는다.**
  스키마 변경은 `alter table ... add column` 같은 추가 작업만, 사용자 승인 후에 한다.
- **비밀값을 커밋하지 않는다.** anon key 도 `.env` 에만 둔다. `.env` 는 Git 제외 대상.
- **Gemini API 키를 Expo 앱에 넣지 않는다.** Edge Function 의 서버 비밀값으로만 쓴다.
- `docs/reference/` 는 Git 추적에서 제외돼 있다. 안에 저장된 웹페이지에 세션
  accessToken(JWT)이 들어 있기 때문이다. 추적 대상으로 되돌리지 않는다.
- 기능 단위가 끝날 때마다 커밋하고 push 한다. 이 프로젝트는 한 번 코드를 통째로
  잃은 적이 있다. 백업이 목적의 일부다.

## 사용자와 일하는 방식

사용자는 개발자가 아니다. 명세서 11장이 요구하는 방식을 따른다.

1. 사용자에게 필요한 행동은 **한 번에 한 가지만** 안내한다.
2. GitHub 로그인, Supabase 로그인, 키 입력, 저장소 생성처럼 사용자 계정이 필요한
   시점에는 **멈추고** 무엇을 눌러야 하는지 화면 기준으로 설명한다.
3. 전문 용어는 풀어서 쓴다. `Table Editor`, `RLS`, `Static Site` 같은 말이 나오면
   그게 무엇인지 한 줄로 먼저 설명한다.
4. 파일을 고친 뒤에는 변경 파일, 실행 방법, 테스트 결과, 커밋 해시를 짧게 보고한다.
5. 키나 비밀번호를 채팅에 붙여넣게 하지 않는다.

## 기술 구조

| 구분 | 선택 |
|---|---|
| 앱 | Expo SDK 57 + React Native 0.86 + TypeScript (strict) |
| 라우팅 | expo-router (파일 기반). 웹에서도 실제 URL 이 생긴다 |
| 데이터·로그인 | Supabase Auth + Postgres |
| AI 분류 | Supabase Edge Function `classify-note` → Gemini (이미 서버에 살아 있음) |
| 웹 배포 | `expo export --platform web` → Render **Static Site** |

`Render Web Service` 는 유휴 시 잠들므로 쓰지 않는다. Static Site 는 잠들지 않는다.

## 폴더 구조

```
GobaNote_Recovery_Spec.md   기능 기준 문서 (유일한 근거)
CLAUDE.md                   이 파일
README.md                   사람이 읽는 소개
docs/HANDOFF.md             현재 진행 상황과 다음 할 일
docs/step0-supabase-audit.md  기존 DB 읽기 전용 점검 결과
docs/reference/             참고 보관 자료 (Git 추적 제외)

src/app/                    expo-router 화면
  _layout.tsx               로그인 여부에 따른 화면 분기
  login.tsx                 로그인·가입
  (tabs)/                   하단 탭 6개
  note/[id].tsx             노트 상세·수정·삭제
src/components/             공용 UI
src/lib/                    supabase 연결, 인증, notes CRUD, 분류 정의
src/constants/theme.ts      색·간격 기준
```

## 코드에서 주의할 점

- **`notes` 테이블에 없는 컬럼을 `select` 하지 않는다.** 하나라도 없으면 쿼리 전체가
  실패한다. 현재 있는 12개 컬럼은 `src/lib/notes.ts` 의 `COLUMNS` 에 적어 뒀다.
  `topic`, `tags`, `prayer_answer_status` 는 **아직 DB 에 없다.**
- **`notes.id` 는 `uuid` 가 아니라 `text`** 다. 기존 데이터가 그렇게 들어 있다.
  앱이 `Crypto.randomUUID()` 로 만들어 넣는다. 타입을 바꾸지 않는다.
- **`Alert.alert` 은 웹에서 아무 일도 하지 않는다.** 확인 창은 반드시
  `src/components/ui.tsx` 의 `ConfirmDialog` 를 쓴다.
- 다크 모드를 넣지 않는다. 크림색 바탕이 이 앱의 정체성이라 색을 뒤집으면 성격이
  바뀐다. `app.json` 의 `userInterfaceStyle` 은 `light` 로 고정돼 있다.
- 탭을 여섯 개보다 줄이거나 합치지 않는다. 명세서 5장이 못박고 있다.
- 분류 명칭에서 **`중보` 라는 표현을 쓰지 않는다.** `기도 제목` 으로 쓴다. (명세서 6.3)

## 자주 쓰는 명령

```bash
npm install                              # 의존성 설치
npx tsc --noEmit                         # 타입 검사
npm run web                              # 웹 개발 서버
npm start                                # Expo 개발 서버 (폰 Expo Go 용)
npx expo export --platform web           # 배포용 정적 빌드 → dist/
```

Windows 터미널에서 `expo export` 가 출력 없이 `exit 107` 로 끝나는 일이 있다.
빌드 실패가 아니라 터미널 환경 문제이므로 `CI=1` 을 주고 다시 실행하면 된다.
